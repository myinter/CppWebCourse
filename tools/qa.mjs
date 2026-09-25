#!/usr/bin/env node
/* ============================================================
   开发期 QA 工具：用 CDP 驱动无头 Chrome
   - 捕获控制台错误、页面异常、请求失败
   - 可翻到指定页并截图
   不属于站点，仅开发时使用。

   用法：
     node tools/qa.mjs shots           截图 index + 各章首页
     node tools/qa.mjs errors          只收集错误
     node tools/qa.mjs ch1 5           第1章第5页截图
     node tools/qa.mjs mem ch6 6 3     内存演示：第6章第6页，走到第3步
   ============================================================ */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://localhost:8000';
const OUT = 'tools/qa-out';
// 每次用一个随机端口 + 独立 profile：固定端口时，上一次没退干净的
// Chrome 会占着端口，于是新进程起不来、脚本却连上了那个残留实例的旧页面，
// 表现就是偶发的 "Cannot read properties of undefined (reading 'go')"
const PORT = 9300 + Math.floor(Math.random() * 500);
const PROFILE = `/tmp/qa-chrome-${PORT}`;

mkdirSync(OUT, { recursive: true });

/* ---------- 极简 CDP 客户端 ---------- */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expr, timeoutMs = 30000) {
    // 加超时兜底：页面被 Pyodide 占住时，等待 Promise 的求值可能永不返回
    const r = await Promise.race([
      this.send('Runtime.evaluate', {
        expression: expr, awaitPromise: true, returnByValue: true
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('evaluate 超时')), timeoutMs))
    ]);
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
    }
    return r.result.value;
  }
}

async function launch() {
  const proc = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--no-sandbox',
    '--hide-scrollbars',
    '--window-size=1440,900',
    `--user-data-dir=${PROFILE}`,
    'about:blank'
  ], { stdio: 'ignore' });

  // 等 CDP 端口就绪
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) break;
    } catch { /* 还没起来 */ }
    await sleep(250);
  }
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  // 明确挑 about:blank 那个标签，别拿到残留页
  const page = list.find(t => t.type === 'page' && /^about:blank/.test(t.url || ''))
            || list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  const cdp = new CDP(ws);
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  return { proc, cdp };
}

function collectProblems(cdp) {
  const problems = [];
  for (const ev of cdp.events) {
    if (ev.method === 'Runtime.exceptionThrown') {
      const d = ev.params.exceptionDetails;
      problems.push({
        kind: 'exception',
        text: d.exception?.description || d.text,
        url: d.url, line: d.lineNumber
      });
    } else if (ev.method === 'Log.entryAdded') {
      const e = ev.params.entry;
      if (e.level === 'error' || e.level === 'warning') {
        problems.push({ kind: e.level, text: e.text, url: e.url });
      }
    } else if (ev.method === 'Network.loadingFailed') {
      const t = ev.params;
      if (!/favicon/.test(t.url || '')) {
        problems.push({ kind: 'netfail', text: `${t.type} ${t.errorText}`, url: t.url });
      }
    }
  }
  return problems;
}

async function visit(cdp, url, waitMs = 1800) {
  cdp.events.length = 0;
  await cdp.send('Page.navigate', { url });
  // 等章节数据加载完成
  for (let i = 0; i < 40; i++) {
    const ready = await cdp.evaluate(
      `!!(window.PYT && PYT.deck && document.querySelector('.slide.is-active'))`
    ).catch(() => false);
    if (ready) break;
    await sleep(150);
  }
  await sleep(waitMs);
}

/** 等入场动画播完再截图，否则会拍到 opacity:0 的中间态。
    注意：进行中的 CSS 动画优先级高于普通样式声明，
    因此加 is-settled 不足以盖过它，必须显式 finish() 所有动画。 */
async function settle(cdp) {
  // 轮询直到动画真正结束，而不是固定 sleep ——
  // 固定等待会在冷启动或忙帧时拍到 opacity:0 的中间态，出现"整页空白"的假象。
  // 也不用 requestAnimationFrame 等待：页面被 Pyodide 占住时 rAF 不触发会永久挂起。
  for (let attempt = 0; attempt < 25; attempt++) {
    const state = await cdp.evaluate(`(()=>{
      const s = document.querySelector('.slide.is-active');
      if (!s) return { ok: false, n: -1 };
      // 打字机光标是无限动画，finish() 不掉，直接收掉动画态
      s.querySelectorAll('.code-block.is-typing').forEach(b => b.classList.remove('is-typing'));
      let anims = [];
      try { anims = document.getAnimations(); } catch (e) { anims = []; }
      anims.forEach(a => {
        // 无限循环的装饰动画（辉光呼吸等）不参与"是否落定"的判断
        const inf = a.effect && a.effect.getTiming && a.effect.getTiming().iterations === Infinity;
        if (inf) return;
        try { a.finish(); } catch (e) {}
      });
      const pending = anims.filter(a => {
        const t = a.effect && a.effect.getTiming && a.effect.getTiming();
        return t && t.iterations !== Infinity && a.playState !== 'finished';
      }).length;
      s.classList.add('is-settled');
      return { ok: pending === 0, n: pending };
    })()`, 8000).catch(() => ({ ok: false, n: -1 }));

    if (state && state.ok) break;
    await sleep(150);
  }
  await sleep(260);
}

async function shot(cdp, name, opts = {}) {
  if (opts.width) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: opts.width, height: opts.height || 900,
      deviceScaleFactor: 1, mobile: !!opts.mobile
    });
    await sleep(400);
  }
  const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const file = `${OUT}/${name}.png`;
  writeFileSync(file, Buffer.from(r.data, 'base64'));
  if (opts.width) await cdp.send('Emulation.clearDeviceMetricsOverride');
  return file;
}

/* ---------- 场景 ---------- */
const cmd = process.argv[2] || 'shots';

const { proc, cdp } = await launch();
let exitCode = 0;

try {
  if (cmd === 'errors' || cmd === 'shots') {
    // 章节数从 manifest 读，别写死 —— 加了新章节就会漏检
    const chCount = await (async () => {
      await visit(cdp, `${BASE}/index.html`, 600);
      return await cdp.evaluate(`(window.PYT && PYT.manifest) ? PYT.manifest.length : 10`).catch(() => 10);
    })();
    const targets = [
      ['index', `${BASE}/index.html`],
      ...Array.from({ length: chCount }, (_, i) => [`ch${i}`, `${BASE}/chapter.html?ch=${i}`])
    ];
    const allProblems = [];

    for (const [name, url] of targets) {
      await visit(cdp, url);
      const problems = collectProblems(cdp);
      const slideCount = await cdp.evaluate(
        `(document.querySelectorAll('.slide').length) + '/' + (window.PYT && PYT.data ? Object.keys(PYT.data).length : 0)`
      ).catch(() => '?');
      const rendered = await cdp.evaluate(
        `document.querySelector('.slide.is-active') ? document.querySelector('.slide.is-active').getAttribute('data-type') : 'NONE'`
      ).catch(() => '?');

      console.log(`${problems.length ? '⚠' : '✓'} ${name.padEnd(6)} 活动页=${rendered}  已渲染=${slideCount}`);
      problems.forEach(p => console.log(`    [${p.kind}] ${String(p.text).split('\n')[0].slice(0, 160)}`));
      allProblems.push(...problems.map(p => ({ page: name, ...p })));

      if (cmd === 'shots') await shot(cdp, name);
    }

    console.log(`\n共 ${allProblems.length} 个问题`);
    if (allProblems.length) exitCode = 1;

  } else if (cmd === 'variants') {
    // 同一页在 深色/浅色 × 桌面/手机 四种组合下的表现
    const ch = process.argv[3] || '1';
    const slides = (process.argv[4] || '1').split(',').map(Number);
    await visit(cdp, `${BASE}/chapter.html?ch=${ch}`);
    const combos = [
      ['dark', 'desktop', null],
      ['light', 'desktop', null],
      ['dark', 'mobile', { width: 390, height: 844, mobile: true }],
      ['light', 'mobile', { width: 390, height: 844, mobile: true }]
    ];
    for (const s of slides) {
      await settle(cdp);
      await cdp.evaluate(`PYT.deck.go(${s - 1}, {history:'push'})`);
      await sleep(900);
      await settle(cdp);
      for (const [theme, size, metrics] of combos) {
        await cdp.evaluate(`document.documentElement.setAttribute('data-theme','${theme}')`);
        await sleep(250);
        const f = await shot(cdp, `ch${ch}-p${s}-${theme}-${size}`, metrics || {});
        console.log(`${f}`);
      }
      await cdp.evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
    }

  } else if (cmd === 'mem') {
    // 内存演示的后续步骤：箭头和状态变化只在第 2 步之后才出现，
    // 只截第 1 步会漏掉最该看的东西
    // 用法：node tools/qa.mjs mem ch6 6 3   （第 6 页，走到第 3 步）
    // 和 chN 模式一样，ch6 / 6 两种写法都收
    const ch = String(process.argv[3] || '6').replace(/^ch/, '');
    const page = Number(process.argv[4] || 1);
    const step = Number(process.argv[5] || 1);
    await visit(cdp, `${BASE}/chapter.html?ch=${ch}`);
    await settle(cdp);
    await cdp.evaluate(`PYT.deck.go(${page - 1}, {history:'push'})`);
    await sleep(900);
    await settle(cdp);
    for (let k = 1; k < step; k++) {
      await cdp.evaluate(`document.querySelector('.slide.is-active [data-mem="next"]').click()`);
      await sleep(220);
    }
    await settle(cdp);
    const f = await shot(cdp, `ch${ch}-p${page}-step${step}`);
    console.log(`${f}`);
    collectProblems(cdp).forEach(p =>
      console.log(`    [${p.kind}] ${String(p.text).split('\n')[0].slice(0, 160)}`));

  } else if (/^ch\d$/.test(cmd)) {
    const ch = cmd.slice(2);
    const slides = process.argv[3] ? process.argv[3].split(',').map(Number) : [1];
    const url = `${BASE}/chapter.html?ch=${ch}`;
    await visit(cdp, url);
    for (const s of slides) {
      // 先落定再跳页，避免在动画中途截图
      await settle(cdp);
      await cdp.evaluate(`PYT.deck.go(${s - 1}, {history:'push'})`);
      await sleep(900);
      await settle(cdp);
      const f = await shot(cdp, `ch${ch}-p${s}`);
      const probs = collectProblems(cdp);
      console.log(`ch${ch} p${s} -> ${f}${probs.length ? '  ⚠ ' + probs.length : ''}`);
      probs.forEach(p => console.log(`    [${p.kind}] ${String(p.text).split('\n')[0].slice(0,160)}`));
    }
  }
} finally {
  proc.kill();
}

process.exit(exitCode);
