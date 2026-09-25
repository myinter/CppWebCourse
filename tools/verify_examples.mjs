#!/usr/bin/env node
/* ============================================================
   代码质量闸：把每章数据里 runnable 的 C++ 片段真正编译并运行，
   与 expectedOutput 比对。

   这是本项目的核心保证 —— 页面上写「输出：xxx」，就必须是 clang++
   真实编译运行的结果，不能是手写的想象值。C++ 有大量未定义行为、
   平台差异和隐式类型转换，凭直觉写的输出十有八九是错的。

   用法：
     node tools/verify_examples.mjs            检查全部章节
     node tools/verify_examples.mjs ch2 ch3    只检查指定章节
     node tools/verify_examples.mjs --fix      把真实输出回填到数据文件
     node tools/verify_examples.mjs --std c++17  指定标准（默认 c++20）
   ============================================================ */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

global.window = global;
const require = createRequire(import.meta.url);

const CHAPTERS = ['preface', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9'];
const args = process.argv.slice(2);
const FIX = args.includes('--fix');
const stdIdx = args.indexOf('--std');
const STD = stdIdx >= 0 ? args[stdIdx + 1] : 'c++20';
// 只在确实给了 --std 时才排除它后面那个值。
// 之前写法是 stdIdx+1（未给时为 0），会把第一个章名参数一并过滤掉，
// 于是「只检查某章」实际变成检查全部章节
const targets = args.filter((a, i) => {
  if (a.startsWith('--')) return false;
  if (stdIdx >= 0 && i === stdIdx + 1) return false;
  return true;
});
const list = targets.length ? targets : CHAPTERS;

const COMPILER = process.env.CXX || 'clang++';
// -pthread：macOS 上不加也能编译，但 Linux 上 std::thread 必须加。
// 加上可保证含线程的示例在两种平台都能验证。
const COMPILE_FLAGS = [`-std=${STD}`, '-O0', '-w', '-pthread'];

let pass = 0, fail = 0, skip = 0;
const failures = [];

for (const ch of list) {
  const file = resolve(`assets/data/${ch}.js`);
  delete global.PYT;
  let slides;
  try {
    require(file);
    // slug 可能是 ch1 / preface，取该文件里唯一的那个键
    const keys = Object.keys(global.PYT?.data || {});
    slides = global.PYT?.data?.[keys[0]];
  } catch (e) {
    console.log(`✗ ${ch}: 无法加载 — ${e.message}`);
    fail++;
    continue;
  }
  if (!Array.isArray(slides)) { console.log(`✗ ${ch}: 数据结构不对`); fail++; continue; }

  let src = readFileSync(file, 'utf8');
  let modified = false;
  let cursor = 0;          // 已处理的源码位置，保证定位不重复

  console.log(`\n── ${ch}（${slides.length} 页）──`);

  for (let i = 0; i < slides.length; i++) {
    const spec = slides[i];
    if (!spec.code) continue;
    const c = spec.code;
    const label = `${ch} p${i + 1} ${spec.title || ''}`.slice(0, 48).padEnd(50);

    if (c.verify === false) {
      skip++;
      console.log(`  ⊘ ${label} 标记为不验证`);
      continue;
    }
    if (!c.source) continue;

    const r = compileAndRun(c.source, c.stdin || '');

    if (r.compileError) {
      // 有些示例本就用来演示编译错误，用 expectCompileError 标记
      if (c.expectCompileError) {
        pass++;
        console.log(`  ✓ ${label} 如期编译失败`);
        continue;
      }
      fail++;
      console.log(`  ✗ ${label} 编译失败`);
      console.log(`      ${r.compileError.split('\n').slice(0, 2).join('\n      ')}`);
      failures.push({ label, kind: 'compile', detail: r.compileError });
      continue;
    }

    // 按行去掉行尾空白再比对：程序用 cout << x << " " 输出时每行末尾会多个空格，
    // 肉眼完全看不出来，不该因此判定不一致
    const got = normalize(r.stdout);

    if (c.expectCompileError) {
      fail++;
      console.log(`  ✗ ${label} 本应编译失败，却编译通过了`);
      failures.push({ label, kind: 'unexpected-compile' });
      continue;
    }

    const want = normalize(c.expectedOutput || '');

    if (!want) {
      console.log(`  ∅ ${label} 缺 expectedOutput，真实输出 ${JSON.stringify(got.slice(0, 60))}`);
      if (FIX) { const r2 = setExpected(src, c, got, cursor); src = r2.src; cursor = r2.pos; if (r2.pos) modified = true; }
      continue;
    }

    if (got === want) {
      pass++;
      console.log(`  ✓ ${label}`);
    } else {
      fail++;
      console.log(`  ✗ ${label} 输出不一致`);
      console.log(`      期望: ${JSON.stringify(want.slice(0, 100))}`);
      console.log(`      实得: ${JSON.stringify(got.slice(0, 100))}`);
      failures.push({ label, kind: 'mismatch', want, got });
      if (FIX) { const r2 = setExpected(src, c, got, cursor); src = r2.src; cursor = r2.pos; if (r2.pos) modified = true; }
    }
  }

  if (FIX && modified) {
    writeFileSync(file, src, 'utf8');
    console.log(`  ↺ 已回填真实输出到 ${ch}.js`);
  }
}

/** 去掉每行行尾空白与整体首尾空白 */
function normalize(s) {
  return String(s).split('\n').map(l => l.replace(/[ \t]+$/, '')).join('\n').trim();
}

/* ---------- 编译并运行 ---------- */
function compileAndRun(source, stdin) {
  const dir = mkdtempSync(join(tmpdir(), 'cxxv-'));
  const cpp = join(dir, 'main.cpp');
  const exe = join(dir, 'a.out');
  writeFileSync(cpp, source, 'utf8');

  try {
    execFileSync(COMPILER, [...COMPILE_FLAGS, '-o', exe, cpp], {
      timeout: 60000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (e) {
    rmSync(dir, { recursive: true, force: true });
    const err = String(e.stderr || e.message || '');
    // 编译超时也归为编译错误
    return { compileError: e.killed ? '编译超时' : err };
  }

  try {
    const out = execFileSync(exe, [], {
      timeout: 10000, encoding: 'utf8', input: stdin,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, LANG: 'C.UTF-8' }
    });
    rmSync(dir, { recursive: true, force: true });
    return { stdout: out };
  } catch (e) {
    rmSync(dir, { recursive: true, force: true });
    if (e.killed) return { stdout: e.stdout || '', runError: 'TIMEOUT' };
    // 程序非零退出（如除零、段错误），stdout 仍可能有内容
    return { stdout: String(e.stdout || ''), runError: `退出码 ${e.status}` };
  }
}

/** 把真实输出写回数据文件，返回新的源码字符串（未改动则原样返回） */
function setExpected(src, code, real, fromIdx) {
  // 用源码首行定位，但首行往往不唯一（大量 C++ 示例首行都是 #include <iostream>）。
  // 因此从 fromIdx 之后开始找，逐个代码块依次向后推进，
  // 避免把 A 页的输出写进 B 页（曾因此改错页面）。
  const marker = code.source.split('\n')[0].slice(0, 40);
  const idx = src.indexOf(marker, fromIdx || 0);
  if (idx < 0) return { src, pos: fromIdx || 0 };
  const tail = src.slice(idx);
  const m = /expectedOutput:\s*`([\s\S]*?)`/.exec(tail);
  if (!m) return src;
  const start = idx + m.index;
  const end = start + m[0].length;
  // 内容含反引号时退回 JSON 字符串写法
  const esc = real.includes('`') ? JSON.stringify(real) : '`' + real + '`';
  return { src: src.slice(0, start) + 'expectedOutput: ' + esc + src.slice(end), pos: end };
}

console.log(`\n${'─'.repeat(54)}`);
console.log(`编译器 ${COMPILER}  标准 ${STD}`);
console.log(`通过 ${pass} · 失败 ${fail} · 跳过 ${skip}`);
if (failures.length) {
  console.log('\n失败清单：');
  failures.forEach(f => console.log(`  · ${f.label}（${f.kind}）`));
}
console.log('');
process.exit(fail ? 1 : 0);
