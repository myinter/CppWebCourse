/* ============================================================
   章节页启动流程
   1. 读取 ?ch=N，加载对应数据文件
   2. 建 Deck，从 URL 哈希或本地进度恢复位置
   3. 页面进入时装配代码面板与内存演示
   ============================================================ */
(function (global) {
  'use strict';

  var PYT = global.PYT;

  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search || '');
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setLoading(text) {
    var el = document.getElementById('loading-text');
    if (el && text) el.textContent = text;
  }

  function hideLoading() {
    var el = document.getElementById('loading');
    if (el) el.classList.add('is-done');
  }

  function fail(title, detail) {
    var el = document.getElementById('loading');
    if (!el) return;
    el.innerHTML =
      '<div class="loading-inner">' +
        '<div style="font-size:var(--fs-h2);font-weight:600">' + PYT.code.escape(title) + '</div>' +
        '<div class="loading-text" style="max-width:46ch;text-align:center">' + PYT.code.escape(detail) + '</div>' +
        '<a class="btn btn-ce" href="index.html" style="margin-top:var(--sp-3)">返回课程目录</a>' +
      '</div>';
  }

  /** 动态加载章节数据（经典脚本，靠 onload 回调） */
  function loadData(chapter) {
    return new Promise(function (resolve, reject) {
      if (PYT.data && PYT.data[chapter.slug]) { resolve(PYT.data[chapter.slug]); return; }
      var s = document.createElement('script');
      s.src = chapter.file;
      s.onload = function () {
        var d = PYT.data && PYT.data[chapter.slug];
        if (d) resolve(d);
        else reject(new Error('数据文件格式不正确：' + chapter.file));
      };
      s.onerror = function () { reject(new Error('无法加载 ' + chapter.file)); };
      document.head.appendChild(s);
    });
  }

  /** 页面进入时装配这一页的交互 */
  function wireSlide(spec, index, node) {
    if (!node) return;

    var cleanups = [];

    // 代码面板：复制、跳过动画、Compiler Explorer 外链
    var panels = node.querySelectorAll('.code-panel');
    for (var i = 0; i < panels.length; i++) {
      PYT.compiler.attach(panels[i]);
    }

    // 内存演示
    var memHost = node.querySelector('[data-memory]');
    if (memHost && spec.memory) {
      var player = PYT.memory.mount(memHost, spec.memory);
      if (player) {
        // 内存图的步骤可以与同页代码的行号联动，做图文对照
        memHost._codeBlock = node.querySelector('.code-block');
        cleanups.push(function () { player.stop(); });
      }
    }

    node._cleanup = function () {
      for (var k = 0; k < cleanups.length; k++) cleanups[k]();
    };

    // 测量代码是否横向溢出（决定要不要显示可滑动的提示）。
    // 必须等布局完成，否则 scrollWidth 还没算出来。
    requestAnimationFrame(function () { PYT.code.markOverflow(node); });

    if (spec.title) {
      document.title = spec.title + ' · ' + (PYT._chapter ? PYT._chapter.title : 'C/C++ 程序设计教程');
    }
  }

  function boot() {
    PYT.theme.init();
    PYT.mode.init();

    var chNum = parseInt(qs('ch') || '0', 10);
    var chapter = PYT.getChapter(chNum);
    if (!chapter) {
      fail('找不到这一章', '请从课程目录进入。');
      return;
    }
    PYT._chapter = chapter;
    document.title = chapter.label + ' · ' + chapter.title;

    setLoading('正在载入「' + chapter.title + '」…');

    loadData(chapter).then(function (slides) {
      if (!slides || !slides.length) {
        fail('本章还没有内容', '数据文件 ' + chapter.file + ' 是空的。');
        return;
      }

      var mount = document.getElementById('deck');
      mount.setAttribute('aria-label', chapter.label + ' ' + chapter.title);

      var fromHash = startIndex(slides.length);
      var fromProgress = PYT.mode.resume(chapter.num, slides.length);
      var startAt = fromHash != null ? fromHash : fromProgress;

      var deck = new PYT.Deck({
        slides: slides,
        mount: mount,
        chapter: chapter,
        onEnter: wireSlide
      });
      PYT.deck = deck;
      deck.start(startAt || 0);
      hideLoading();

      global.addEventListener('hashchange', function () {
        var i = startIndex(slides.length);
        if (i != null && i !== deck.cur) deck.go(i, { dir: i > deck.cur ? 1 : -1 });
      });

      // 窗口尺寸变化会改变代码是否溢出，需重新测量（防抖）
      var resizeTimer = null;
      global.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          var active = mount.querySelector('.slide.is-active');
          if (active) PYT.code.markOverflow(active);
        }, 160);
      });
    }).catch(function (err) {
      fail('载入失败', String(err && err.message || err));
    });
  }

  /** 解析哈希；没有有效哈希时返回 null（区别于"第 1 页"） */
  function startIndex(total) {
    var m = /^#\/?(\d+)/.exec(location.hash || '');
    if (!m) return null;
    var i = parseInt(m[1], 10) - 1;
    return (i >= 0 && i < total) ? i : null;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
