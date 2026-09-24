/* ============================================================
   C++ 代码高亮与逐 token 揭示

   零依赖的词法分析器。沿用 Python 版验证过的策略：
   1. 一次性把源码切准并高亮，动画只做 opacity 揭示 ——
      按字符重新着色会在多字符记号（::、->、<<、模板 >>）上出现破碎中间态。
   2. 错峰交给 CSS（--i + animation-delay），零逐帧 JS。
   3. 跳过动画 = 容器加一个 class，不取消几百个动画。
   4. 不变式：所有 token 拼接后必须逐字符等于源码。

   C++ 特有的处理：
   - 预处理指令单独成类，`#include <iostream>` 里的头文件名再单独着色
   - `std::` 这样的命名空间限定名
   - 字面量后缀：3.14f / 10u / 1'000'000 / 0xFF / 0b1010
   - 原始字符串 R"(...)"、宽字符 L"..."、UTF 前缀 u8"..."
   - 三字符运算符：:: -> << >> <=> ...
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- C++20 关键字 ---------- */
  var KEYWORDS = new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor',
    'break', 'case', 'catch', 'class', 'compl', 'concept', 'const',
    'consteval', 'constexpr', 'constinit', 'const_cast', 'continue',
    'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete',
    'do', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern',
    'final', 'for', 'friend', 'goto', 'if', 'inline', 'mutable', 'namespace',
    'new', 'noexcept', 'not', 'not_eq', 'operator', 'or', 'or_eq', 'override',
    'private', 'protected', 'public', 'reflexpr', 'register',
    'reinterpret_cast', 'requires', 'return', 'sizeof', 'static',
    'static_assert', 'static_cast', 'struct', 'switch', 'template', 'this',
    'thread_local', 'throw', 'try', 'typedef', 'typeid', 'typename', 'union',
    'using', 'virtual', 'volatile', 'while', 'xor', 'xor_eq',
    'import', 'module', 'transaction_safe'
  ]);

  /* ---------- 内置类型与常用标准库名 ---------- */
  var TYPES = new Set([
    // 基本类型
    'bool', 'char', 'char8_t', 'char16_t', 'char32_t', 'double', 'float',
    'int', 'long', 'short', 'signed', 'unsigned', 'void', 'wchar_t',
    'size_t', 'ptrdiff_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t',
    'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'nullptr_t',
    // 常见标准库类型（不带 std:: 时也着色）
    'string', 'wstring', 'vector', 'array', 'deque', 'list', 'forward_list',
    'map', 'unordered_map', 'set', 'unordered_set', 'multimap', 'multiset',
    'pair', 'tuple', 'queue', 'priority_queue', 'stack', 'optional',
    'variant', 'any', 'function', 'shared_ptr', 'unique_ptr', 'weak_ptr',
    'string_view', 'span', 'initializer_list', 'istream', 'ostream',
    'ifstream', 'ofstream', 'stringstream', 'istringstream', 'ostringstream',
    'exception', 'runtime_error', 'logic_error', 'out_of_range'
  ]);

  /* ---------- 字面量常量 ---------- */
  var LITERALS = new Set(['true', 'false', 'NULL', 'nullptr', 'EOF', 'EXIT_SUCCESS', 'EXIT_FAILURE']);

  /* ---------- 词法规则（顺序即优先级） ---------- */
  var RULES = [
    // 注释必须在运算符之前，否则 // 会被当成两次除法
    ['comment', /\/\/[^\n]*/y],
    ['comment', /\/\*[\s\S]*?\*\//y],

    // 预处理指令：整行匹配，头文件名在 refine() 里再拆出来单独着色。
    // 只匹配指令词是不够的 —— 那样 #include <iostream> 的 <iostream>
    // 会被后面的一般规则切成 <、iostream、> 三个记号
    ['macro', /^[ \t]*#[ \t]*(?:include|define|ifndef|ifdef|endif|if|elif|else|pragma|undef|error|line|warning)\b[^\n]*/my],

    // 原始字符串 R"(...)"，以及带前缀的普通字符串/字符
    ['string', /(?:u8|u|U|L)?R"([^()\\\s]{0,16})\([\s\S]*?\)\1"/y],
    ['string', /(?:u8|u|U|L)?"(?:\\.|[^"\\\n])*"/y],
    ['char', /(?:u8|u|U|L)?'(?:\\.|[^'\\\n])+'/y],

    // 未闭合字符串的兜底：学员打字中途引号还没配对时仍按字符串着色，
    // 避免高亮在输入过程中闪烁
    ['string', /(?:u8|u|U|L)?"[^"\n]*$/ym],
    ['char', /(?:u8|u|U|L)?'[^'\n]*$/ym],

    // 数字：各进制、小数、科学计数、字面量后缀、位分隔符
    ['number', /\b(?:0[xX][0-9a-fA-F']+|0[bB][01']+|0[0-7']+|\d[\d']*(?:\.\d[\d']*)?(?:[eE][+-]?\d+)?)(?:[uUlLfF]{0,3})/y],

    // 标识符（C++ 允许下划线，不允许中文，但注释里会有）
    ['word', /[A-Za-z_][A-Za-z0-9_]*/y],

    // 三字符与两字符运算符（长的在前，避免 <= 被切成 < 和 =）
    ['op', /(?:<=>|<<=|>>=|->\*|\.\*|::|->|\+\+|--|<<|>>|<=|>=|==|!=|&&|\|\||\+=|-=|\*=|\/=|%=|&=|\|=|\^=|[-+*/%&|^~!<>=?])/y],

    ['punct', /[(){}\[\];,.:]/y],

    // 空白与换行必须原样保留
    ['ws', /[ \t]+/y],
    ['nl', /\n/y],

    // 兜底：任何未识别字符（含中文注释里的全角符号）按普通文本处理
    ['plain', /[\s\S]/y]
  ];

  /* ---------- x86-64 汇编（AT&T 语法）的词法规则 ----------
     只服务前言里"三行 C++ 编译成什么"那一页，够用即可。AT&T 语法里：
       #  注释 —— 所以不能像 C++ 那样把 # 当成预处理指令
       %rax     寄存器          $1       立即数
       -8(%rbp) 内存操作数：偏移(基址寄存器)
       main:    标号            .globl   汇编指示符
     */
  var RULES_ASM = [
    ['comment', /#[^\n]*/y],
    ['string', /"(?:\\.|[^"\\\n])*"/y],
    ['reg', /%[A-Za-z][A-Za-z0-9]*/y],
    ['imm', /\$(?:[A-Za-z_][\w.$]*|[-+]?(?:0[xX][0-9a-fA-F]+|\d+))/y],
    ['number', /[-+]?(?:0[xX][0-9a-fA-F]+|\d+)/y],
    ['word', /[A-Za-z_.$][\w.$]*/y],
    ['punct', /[(),:]/y],
    ['ws', /[ \t]+/y],
    ['nl', /\n/y],
    ['plain', /[\s\S]/y]
  ];

  /**
   * 汇编版分词。与 C++ 版同样是「一次切准 + 保持原文」，
   * 差别在于分类规则少得多，也不需要看很远的上下文。
   */
  function tokenizeAsm(src) {
    var out = [];
    var i = 0;
    var n = src.length;
    // 行首的裸词是助记符（movl / pushq / ret），行中间的裸词是别的东西。
    // 不能靠正则的 ^ —— 缩进已经先被 ws 规则吃掉了，位置就不在行首了
    var lineStart = true;

    while (i < n) {
      var matched = false;

      for (var r = 0; r < RULES_ASM.length; r++) {
        var kind = RULES_ASM[r][0];
        var re = RULES_ASM[r][1];
        re.lastIndex = i;
        var m = re.exec(src);
        if (!m || !m[0].length) continue;

        var text = m[0];
        out.push({ cls: classifyAsm(kind, text, src.charAt(i + text.length), lineStart), text: text });
        i += text.length;

        if (kind === 'nl') lineStart = true;
        else if (kind !== 'ws') lineStart = false;

        matched = true;
        break;
      }

      if (!matched) {
        out.push({ cls: 'tok-plain', text: src.charAt(i) });
        i++;
        lineStart = false;
      }
    }
    return out;
  }

  /** 把基础类别翻译成最终的着色类（直接返回类名，少一层映射表） */
  function classifyAsm(kind, text, nextCh, lineStart) {
    switch (kind) {
      case 'comment': return 'tok-comment';
      case 'string': return 'tok-str';
      case 'reg': return 'tok-reg';
      case 'imm':
      case 'number': return 'tok-num';
      case 'punct': return 'tok-punct';
      case 'ws': return 'tok-ws';
      case 'nl': return 'tok-nl';
      case 'word':
        // 标号判断在指示符之前：.Lfunc_end0: 是标号，不是指示符
        if (nextCh === ':') return 'tok-label';            // main:
        if (text.charAt(0) === '.') return 'tok-macro';    // .text / .globl
        return lineStart ? 'tok-kw' : 'tok-plain';         // 助记符
      default: return 'tok-plain';
    }
  }

  /**
   * 把源码切成 token 数组。
   * 不变式：tokens.map(t => t.text).join('') === 源码
   */
  function tokenize(src) {
    var raw = [];
    var i = 0;
    var n = src.length;

    while (i < n) {
      var matched = false;
      for (var r = 0; r < RULES.length; r++) {
        var cls = RULES[r][0];
        var re = RULES[r][1];
        re.lastIndex = i;
        var m = re.exec(src);
        if (m && m[0].length > 0) {
          raw.push({ cls: cls, text: m[0], pos: i });
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        raw.push({ cls: 'plain', text: src[i], pos: i });
        i++;
      }
    }
    return refine(raw, src);
  }

  /** 把基础类别细分成最终的着色类，并处理需要看上下文的记号 */
  function refine(raw, src) {
    var out = [];

    for (var k = 0; k < raw.length; k++) {
      var t = raw[k];
      var c = t.cls;

      if (c === 'word') {
        // classifyWord 直接返回最终类名，避免多一层映射（曾因映射表缺项
        // 导致所有关键字都落到兜底的 tok-plain）
        out.push({ cls: classifyWord(t.text, raw, k, src), text: t.text });
        continue;
      }
      if (c === 'macro') {
        // 指令行已在规则里整行匹配，这里拆成：指令名 + 空白 + 参数
        var d = /^([ \t]*#[ \t]*\w+)([ \t]*)([\s\S]*)$/.exec(t.text);
        if (d) {
          out.push({ cls: 'tok-macro', text: d[1] });
          if (d[2]) out.push({ cls: 'tok-ws', text: d[2] });

          var rest = d[3];
          if (/^<\s*|^<\S/.test(rest) || rest.charAt(0) === '<') {
            // #include <iostream> —— 头文件名单独成串
            var am = /^(<[^>\n]*>)([\s\S]*)$/.exec(rest);
            if (am) {
              out.push({ cls: 'tok-str', text: am[1] });
              if (am[2]) out.push({ cls: 'tok-plain', text: am[2] });
              continue;
            }
          } else if (rest.charAt(0) === '"') {
            var qm = /^("(?:\\.|[^"\\\n])*")([\s\S]*)$/.exec(rest);
            if (qm) {
              out.push({ cls: 'tok-str', text: qm[1] });
              if (qm[2]) out.push({ cls: 'tok-plain', text: qm[2] });
              continue;
            }
          }
          if (rest) out.push({ cls: 'tok-plain', text: rest });
          continue;
        }
      }

      var CLASS_MAP = {
        comment: 'tok-comment', string: 'tok-str', char: 'tok-char',
        number: 'tok-num', op: 'tok-op', punct: 'tok-punct',
        ws: 'tok-ws', nl: 'tok-nl', plain: 'tok-plain'
      };
      out.push({ cls: CLASS_MAP[c] || 'tok-plain', text: t.text });
    }
    return out;
  }

  /** 判定一个标识符该着成什么颜色（直接返回最终类名） */
  function classifyWord(text, raw, idx, src) {
    if (KEYWORDS.has(text)) return 'tok-kw';
    if (LITERALS.has(text)) return 'tok-num';
    if (TYPES.has(text)) return 'tok-type';

    var nxt = nextMeaningful(raw, idx);
    var prev = prevMeaningful(raw, idx);

    // std:: 命名空间限定
    if (text === 'std') {
      return (nxt && nxt.text === '::') ? 'tok-namespace' : 'tok-plain';
    }

    // 紧跟在 :: 后面的名字（如 std::cout、MyClass::method）
    if (prev && prev.text === '::') return 'tok-func';

    // class / struct / enum / union / typename 后面跟的名字是类型
    if (prev && prev.cls === 'word' &&
        /^(class|struct|enum|union|typename)$/.test(prev.text)) {
      return 'tok-type';
    }

    // 后面紧跟 ( 的是函数调用或定义
    if (nxt && nxt.text === '(') return 'tok-func';

    // 首字母大写视为类型名（C++ 命名惯例）
    if (/^[A-Z]/.test(text)) return 'tok-type';

    return 'tok-plain';
  }

  function nextMeaningful(raw, idx) {
    for (var i = idx + 1; i < raw.length; i++) {
      if (raw[i].cls !== 'ws' && raw[i].cls !== 'nl' && raw[i].cls !== 'comment') return raw[i];
      if (raw[i].cls === 'nl') return null;   // 不跨行判断
    }
    return null;
  }

  function prevMeaningful(raw, idx) {
    for (var i = idx - 1; i >= 0; i--) {
      if (raw[i].cls !== 'ws' && raw[i].cls !== 'comment') return raw[i];
      if (raw[i].cls === 'nl') return null;
    }
    return null;
  }

  /* ============================================================
     构建 DOM
     ============================================================ */

  function buildHighlighted(src, lang) {
    var tokens = (lang === 'asm') ? tokenizeAsm(src) : tokenize(src);
    var frag = document.createDocumentFragment();

    var lineEl = document.createElement('span');
    lineEl.className = 'code-line';
    var lineStart = 0;
    var tokenIndex = 0;
    var lineCount = 0;

    function flushLine() {
      frag.appendChild(lineEl);
      lineCount++;
      lineEl = document.createElement('span');
      lineEl.className = 'code-line';
      lineStart = tokenIndex;
    }

    for (var t = 0; t < tokens.length; t++) {
      var tk = tokens[t];
      if (tk.cls === 'tok-ws') {
        lineEl.appendChild(document.createTextNode(tk.text));
        continue;
      }
      if (tk.cls === 'tok-nl') {
        flushLine();
        tokenIndex++;
        continue;
      }
      var span = document.createElement('span');
      span.className = 'tok ' + tk.cls;
      span.style.setProperty('--i', String(tokenIndex));
      span.textContent = tk.text;
      lineEl.appendChild(span);
      tokenIndex++;
    }
    frag.appendChild(lineEl);
    lineCount++;

    return { frag: frag, lineCount: lineCount, tokenCount: tokenIndex };
  }

  function buildGutter(lineCount) {
    var g = document.createElement('div');
    g.className = 'code-gutter';
    g.setAttribute('aria-hidden', 'true');
    var buf = [];
    for (var i = 1; i <= lineCount; i++) {
      buf.push('<span data-line="' + i + '">' + i + '</span>');
    }
    g.innerHTML = buf.join('');
    return g;
  }

  /* ============================================================
     对外接口
     ============================================================ */

  var code = {
    tokenize: tokenize,
    tokenizeAsm: tokenizeAsm,

    render: function (src, opts) {
      opts = opts || {};
      var built = buildHighlighted(src, opts.lang);

      var block = document.createElement('div');
      block.className = 'code-block';

      var body = document.createElement('div');
      body.className = 'code-body';

      var area = document.createElement('div');
      area.className = 'code-area';

      var pre = document.createElement('pre');
      pre.className = 'code-pre';
      pre.appendChild(built.frag);
      area.appendChild(pre);

      body.appendChild(buildGutter(built.lineCount));
      body.appendChild(area);
      block.appendChild(body);

      var byLine = opts.byLine != null ? opts.byLine : built.tokenCount > 480;
      if (byLine) {
        block.classList.add('reveal-by-line');
        var lines = pre.querySelectorAll('.code-line');
        for (var i = 0; i < lines.length; i++) {
          lines[i].style.setProperty('--i', String(i));
        }
      }

      block._meta = {
        source: src,
        lineCount: built.lineCount,
        tokenCount: built.tokenCount,
        byLine: byLine
      };

      if (opts.reveal !== false) {
        requestAnimationFrame(function () {
          block.classList.add('is-typing');
          var delay = byLine
            ? built.lineCount * 45
            : Math.min(built.tokenCount * 16, 2400);
          setTimeout(function () { block.classList.remove('is-typing'); }, delay);
        });
      }
      return block;
    },

    revealAll: function (root) {
      var blocks = root ? root.querySelectorAll('.code-block') : [];
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].classList.add('is-revealed');
        blocks[i].classList.remove('is-typing');
      }
    },

    /** 高亮指定行（1 起始），用于图文对照 */
    highlightLine: function (block, line) {
      if (!block) return;
      var prev = block.querySelectorAll('.code-line.is-hot, .code-gutter span.is-hot');
      for (var i = 0; i < prev.length; i++) prev[i].classList.remove('is-hot');
      if (!line) return;
      var pre = block.querySelector('.code-pre');
      var gut = block.querySelector('.code-gutter');
      var lineEl = pre && pre.querySelectorAll('.code-line')[line - 1];
      var numEl = gut && gut.querySelector('span[data-line="' + line + '"]');
      if (lineEl) lineEl.classList.add('is-hot');
      if (numEl) numEl.classList.add('is-hot');
    },

    markOverflow: function (root) {
      var areas = (root || document).querySelectorAll('.code-area');
      for (var i = 0; i < areas.length; i++) {
        var pre = areas[i].querySelector('.code-pre');
        if (!pre) continue;
        areas[i].classList.toggle('is-overflowing', pre.scrollWidth > pre.clientWidth + 2);
      }
    },

    escape: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
  };

  global.PYT = global.PYT || {};
  global.PYT.code = code;
})(window);
