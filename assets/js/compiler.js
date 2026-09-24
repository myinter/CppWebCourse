/* ============================================================
   代码面板的交互：复制代码、跳过动画、跳转 Compiler Explorer

   这里刻意不做"在页面里运行"。
   浏览器中没有可直接使用的 C++ 编译器 —— Python 有 Pyodide，
   C++ 没有对等的方案：JSCPP 是 2021 年停更的子集解释器，跑不了
   现代 C++；把 clang 编成 wasm 体积过大且无法支持改代码后重编译。
   与其做一个假的运行按钮，不如如实展示真实编译输出，
   并提供通往真实编译环境的入口。
   ============================================================ */
(function (global) {
  'use strict';

  var CE_BASE = 'https://godbolt.org/clientstate/';

  /** 构造 Compiler Explorer 的分享链接（代码会预填进去） */
  function explorerUrl(source, lang) {
    var state = {
      sessions: [{
        id: 1,
        language: lang || 'c++',
        source: source,
        compilers: [],
        executors: []
      }]
    };
    var json = JSON.stringify(state);
    // 用 UTF-8 安全的 base64，避免中文注释导致 btoa 抛错
    var b64 = b64EncodeUnicode(json);
    return CE_BASE + b64;
  }

  /** btoa 只接受 Latin-1，代码里常含中文注释，需要先做 UTF-8 编码 */
  function b64EncodeUnicode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  /* ============================================================
     装配一个代码面板的行为
     ============================================================ */
  function attach(panel) {
    if (!panel || panel._attached) return;
    panel._attached = true;

    var spec = panel._spec || {};
    var actions = panel.querySelector('[data-code-actions]');
    if (!actions) return;

    // 外链先写好 href，中键/右键新标签打开才有效。
    // explorerSource：展示的若是一段汇编，链接该指向生成它的 C++ 源码
    var link = actions.querySelector('[data-action="explorer"]');
    if (link) link.href = explorerUrl(spec.explorerSource || spec.source, 'c++');

    actions.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var act = btn.getAttribute('data-action');

      if (act === 'copy') {
        copyText(spec.source).then(function (ok) {
          var label = btn.querySelector('span');
          var old = label ? label.textContent : '';
          btn.classList.add('is-done');
          if (label) label.textContent = ok ? '已复制' : '复制失败';
          setTimeout(function () {
            btn.classList.remove('is-done');
            if (label) label.textContent = old;
          }, 1600);
        });
      } else if (act === 'reveal') {
        global.PYT.code.revealAll(panel);
      }
    });

    // 点代码区域也能跳过打字机动画
    panel.addEventListener('click', function (e) {
      if (e.target.closest('[data-code-actions]')) return;
      global.PYT.code.revealAll(panel);
    });
  }

  /** 复制到剪贴板。navigator.clipboard 在非 HTTPS 下不可用，需要兜底。 */
  function copyText(text) {
    if (navigator.clipboard && global.isSecureContext) {
      return navigator.clipboard.writeText(text)
        .then(function () { return true; })
        .catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }

  global.PYT = global.PYT || {};
  global.PYT.compiler = {
    explorerUrl: explorerUrl,
    attach: attach,
    copyText: copyText
  };
})(window);
