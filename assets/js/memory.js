/* ============================================================
   内存与指针可视化

   C++ 最难讲清的不是语法，是"数据到底在哪、指针指向谁"。
   静态截图讲不明白，所以做成可逐步播放的内存图：
   栈/堆分区、变量盒子（名字-值-地址）、指针箭头、野指针标红。

   数据格式（写在幻灯片的 memory 字段里）：
     memory: {
       caption: '可选的整体说明',
       steps: [{
         caption: '这一步在做什么',
         line: 3,                       // 可选，高亮代码对应行
         regions: [{
           name: '栈 Stack', kind: 'stack',
           cells: [{ id:'x', label:'x', type:'int', value:'42',
                     addr:'0x7ffd9c4a2ba4', state:'normal' }]
         }],
         arrows: [{ from:'p', to:'x', label:'&x' }],
         note: '可选的行内提示'
       }]
     }

   cell.state 可取 normal | changed | dangling | freed |
   分别对应普通、刚变化、野指针、已释放四种视觉。
   ============================================================ */
(function (global) {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* 版面常量（单位是 viewBox 坐标，随容器等比缩放） */
  var CELL_W = 132, CELL_H = 64, CELL_GAP = 14;
  var REGION_PAD_X = 18, REGION_PAD_TOP = 34, REGION_PAD_BOT = 18;
  var REGION_GAP = 26;
  var MARGIN_X = 16, MARGIN_Y = 12;
  var MAX_COLS = 6;
  /* 区域最小宽度。格子少时若按内容宽度算，viewBox 会接近正方形，
     经 max-height 约束后两侧留下大片空白，图缩在中间很小一块。
     给一个下限让版面保持横向比例，内容才能撑满可用宽度。 */
  var MIN_REGION_W = 520;

  function el(tag, attrs, text) {
    var n = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) {
      if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    if (text != null) n.textContent = text;
    return n;
  }

  /**
   * 一段文字占几"格"（等宽字体的列数）。
   * 一个汉字约等于两个西文字符宽，按字符个数算会低估一半 ——
   * 「一块内存，两个视角」数出来是 9，实际占 18 格，于是撑出盒子。
   */
  function textCols(s) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      var wide = c >= 0x1100 && (
        c <= 0x115f || c === 0x2329 || c === 0x232a ||
        (c >= 0x2e80 && c <= 0xa4cf && c !== 0x303f) ||
        (c >= 0xac00 && c <= 0xd7a3) ||
        (c >= 0xf900 && c <= 0xfaff) ||
        (c >= 0xfe30 && c <= 0xfe6f) ||
        (c >= 0xff00 && c <= 0xff60) ||
        (c >= 0xffe0 && c <= 0xffe6)
      );
      n += wide ? 2 : 1;
    }
    return n;
  }

  /** 在 available 宽度内塞下这段文字的字号（等宽字体按 0.6em 估） */
  function fitSize(text, available, maxSize, minSize) {
    var cols = Math.max(textCols(text), 1);
    var size = Math.floor(available / (cols * 0.6));
    return Math.max(minSize, Math.min(maxSize, size));
  }

  /* ============================================================
     布局：算出每个区域的高度、每个格子的坐标
     ============================================================ */
  function layout(step) {
    var regions = step.regions || [];
    var boxes = {};          // cellId -> {x, y, w, h, regionIndex}
    var y = MARGIN_Y;
    var height = MARGIN_Y;
    var maxRowW = 0;

    regions.forEach(function (r, ri) {
      var cells = r.cells || [];
      var cols = Math.min(Math.max(cells.length, 1), MAX_COLS);
      var rows = Math.max(1, Math.ceil(cells.length / cols));

      var innerW = cols * CELL_W + (cols - 1) * CELL_GAP;
      var regionW = Math.max(innerW + REGION_PAD_X * 2, MIN_REGION_W);
      var regionH = REGION_PAD_TOP + rows * CELL_H + (rows - 1) * CELL_GAP + REGION_PAD_BOT;

      r._x = MARGIN_X;
      r._y = y;
      r._w = regionW;
      r._h = regionH;
      maxRowW = Math.max(maxRowW, regionW);

      // 区域被撑到最小宽度后，格子行要居中，否则会全部挤在左边
      var perRow = Math.min(cells.length || 1, cols);
      var rowW = perRow * CELL_W + (perRow - 1) * CELL_GAP;
      var rowX = r._x + (r._w - rowW) / 2;

      cells.forEach(function (c, ci) {
        var col = ci % cols;
        var row = Math.floor(ci / cols);
        boxes[c.id] = {
          x: rowX + col * (CELL_W + CELL_GAP),
          y: r._y + REGION_PAD_TOP + row * (CELL_H + CELL_GAP),
          w: CELL_W,
          h: CELL_H,
          region: ri
        };
      });

      y += regionH + REGION_GAP;
      height = y;
    });

    return {
      boxes: boxes,
      width: Math.max(maxRowW + MARGIN_X * 2, 420),
      height: Math.max(height - REGION_GAP + MARGIN_Y, 120)
    };
  }

  /* ============================================================
     绘制
     ============================================================ */
  function draw(svg, step, opts) {
    opts = opts || {};
    var L = layout(step);
    var vbW = L.width, vbH = L.height;

    svg.setAttribute('viewBox', '0 0 ' + vbW + ' ' + vbH);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // ---- 先画区域底板 ----
    (step.regions || []).forEach(function (r) {
      var g = el('g', { class: 'mem-region mem-' + (r.kind || 'stack') });
      g.appendChild(el('rect', {
        x: r._x, y: r._y, width: r._w, height: r._h, rx: 12
      }));
      g.appendChild(el('text', {
        x: r._x + REGION_PAD_X, y: r._y + 21, class: 'mem-region-label'
      }, r.name));
      svg.appendChild(g);
    });

    // ---- 箭头画在盒子下面，避免盖住文字 ----
    var arrowLayer = el('g', { class: 'mem-arrows' });
    (step.arrows || []).forEach(function (a) {
      var from = L.boxes[a.from], to = L.boxes[a.to];
      if (!from || !to) return;
      arrowLayer.appendChild(buildArrow(from, to, a, L));
    });
    svg.appendChild(arrowLayer);

    // ---- 盒子 ----
    (step.regions || []).forEach(function (r) {
      (r.cells || []).forEach(function (c) {
        var b = L.boxes[c.id];
        if (!b) return;
        svg.appendChild(buildCell(c, b, opts));
      });
    });
  }

  function buildCell(c, b, opts) {
    var state = c.state || 'normal';
    var g = el('g', { class: 'mem-cell is-' + state });

    g.appendChild(el('rect', {
      x: b.x, y: b.y, width: b.w, height: b.h, rx: 9
    }));

    // 名字 + 类型
    // 用 != null 判断：空字符串是「这个格子还没名字」的合法表达，
    // 用 || 会把它当成缺失而回退到 id，于是空白格子会显示成 a/b/c/d
    var label = (c.label != null) ? c.label : c.id;
    var nameText = c.type ? label + '  ' + c.type : label;
    var nameEl = el('text', {
      x: b.x + 11, y: b.y + 19, class: 'mem-cell-name'
    }, nameText);
    // 名字也可能是长的（「i 和 f 共用这 4 字节」），同样要缩
    var nSize = fitSize(nameText, b.w - 24, 11, 9);
    if (nSize !== 11) nameEl.style.fontSize = nSize + 'px';
    g.appendChild(nameEl);

    // 值（居中偏下，字号最大，是整个图的视觉重点）
    // 字号随内容长度自适应：一个完整的 64 位地址是 14 格
    // （0x7ffd9c4a2ba0），一段中文注释更长 —— 不缩就会捅出盒子右边、
    // 压到隔壁格子上。用 style 而不是 font-size 属性 —— SVG 的表现
    // 属性优先级最低，会被 .mem-cell-value 这条 CSS 规则盖掉，算了也白算。
    var vtext = c.value == null ? '' : String(c.value);
    var vSize = fitSize(vtext, b.w - 24, 17, 9);
    var valueEl = el('text', {
      x: b.x + 11, y: b.y + 41, class: 'mem-cell-value'
    }, vtext);
    if (vSize !== 17) valueEl.style.fontSize = vSize + 'px';
    g.appendChild(valueEl);

    // 地址（右下角，小字）
    if (c.addr) {
      g.appendChild(el('text', {
        x: b.x + b.w - 10, y: b.y + b.h - 8,
        class: 'mem-cell-addr', 'text-anchor': 'end'
      }, c.addr));
    }
    return g;
  }

  /** 连接两个盒子：上下相邻走竖线，同一行走贝塞尔绕开中间的盒子 */
  function buildArrow(from, to, a, L) {
    var g = el('g', { class: 'mem-arrow' });

    var d, headD, headTransform = null;
    var labelX, labelY, labelAnchor = 'middle';

    // 上下相邻、且水平方向有重叠 —— 画一条竖线。
    // 只支持"从左连到右"是不够的：虚函数表那种"对象在上、表在下"的图，
    // 横着连会绕出一个大弯，两条箭头还会交叉，最该看懂的地方反而最乱
    var overlapL = Math.max(from.x, to.x);
    var overlapR = Math.min(from.x + from.w, to.x + to.w);
    var below = to.y > from.y + from.h;
    var above = to.y + to.h < from.y;

    if (overlapR > overlapL && (below || above)) {
      var mx = (overlapL + overlapR) / 2;      // 竖线落在两个盒子都覆盖的范围里
      var ty = below ? to.y - 8 : to.y + to.h + 8;
      var sy = below ? from.y + from.h : from.y;

      d = 'M' + mx + ',' + sy + 'L' + mx + ',' + ty;
      // 尖端落在 ty 上，底边在它后面 8 个单位：向下时底边在上方，向上时在下方
      headD = 'M' + mx + ',' + ty + ' l-5,' + (below ? -8 : 8) + ' l10,0 z';
      labelX = mx + 12;
      labelY = (sy + ty) / 2 + 4;
      labelAnchor = 'start';

      g.appendChild(el('path', { d: d, class: 'mem-arrow-line' }));
      g.appendChild(el('path', { d: headD, class: 'mem-arrow-head' }));
      if (a.label) {
        g.appendChild(el('text', {
          x: labelX, y: labelY, class: 'mem-arrow-label', 'text-anchor': labelAnchor
        }, a.label));
      }
      return g;
    }

    var x1 = from.x + from.w;
    var y1 = from.y + from.h / 2;
    var x2 = to.x;
    var y2 = to.y + to.h / 2;
    var x2e, y2e;

    if (x2 > x1 - 4) {
      // 正常向右连
      x2e = x2 - 8;
      y2e = y2;
      var bend = Math.max(36, Math.abs(x2e - x1) * 0.45);
      d = 'M' + x1 + ',' + y1 +
          ' C' + (x1 + bend) + ',' + y1 + ' ' +
          (x2e - bend) + ',' + y2e + ' ' +
          x2e + ',' + y2e;
      labelX = (x1 + x2e) / 2;
      labelY = (y1 + y2e) / 2 - 8;
    } else {
      // 目标在左边：从源盒左侧流出，绕到目标右侧
      x1 = from.x;
      x2e = to.x + to.w + 8;
      y2e = y2;
      var dy = (to.y > from.y) ? 46 : -46;
      d = 'M' + x1 + ',' + y1 +
          ' C' + (x1 - 30) + ',' + (y1 + dy) + ' ' +
          (x2e + 30) + ',' + (y2e + dy) + ' ' +
          x2e + ',' + y2e;
      headTransform = 'rotate(180 ' + x2e + ' ' + y2e + ')';
      // 回指的弧线会鼓到两个盒子中间，标签放在弧线中点就会压住箭头尖 ——
      // 抬到两个盒子上方，那里一定是空的
      labelX = (from.x + x2e) / 2;
      labelY = Math.min(from.y, to.y) - 10;
    }

    g.appendChild(el('path', { d: d, class: 'mem-arrow-line' }));
    // 箭头尖
    g.appendChild(el('path', {
      d: 'M' + (x2e) + ',' + y2e + ' l-8,-5 l0,10 z',
      class: 'mem-arrow-head',
      transform: headTransform
    }));

    if (a.label) {
      g.appendChild(el('text', {
        x: labelX, y: labelY, class: 'mem-arrow-label', 'text-anchor': 'middle'
      }, a.label));
    }
    return g;
  }

  /* ============================================================
     播放器
     ============================================================ */
  function Player(host, spec) {
    this.host = host;
    this.spec = spec;
    this.steps = spec.steps || [];
    this.index = -1;
    this.timer = null;
    this._build();
    this.stepTo(0);
  }

  Player.prototype._build = function () {
    var self = this;

    this.host.classList.add('mem-player');

    var stage = document.createElement('div');
    stage.className = 'mem-stage';
    this.svg = el('svg', { class: 'mem-svg', role: 'img' });
    this.svg.setAttribute('aria-label', this.spec.title || '内存示意图');
    stage.appendChild(this.svg);
    this.host.appendChild(stage);

    // 代码行对照区（若该页有代码块，会把高亮挂上去）
    this.caption = document.createElement('div');
    this.caption.className = 'mem-caption';
    this.host.appendChild(this.caption);

    if (this.steps.length <= 1) return;

    var bar = document.createElement('div');
    bar.className = 'mem-bar';
    bar.innerHTML =
      '<button class="icon-btn" type="button" data-mem="prev" aria-label="上一步">' + global.PYT.icons.get('skipBack') + '</button>' +
      '<button class="icon-btn" type="button" data-mem="play" aria-label="播放">' + global.PYT.icons.get('play') + '</button>' +
      '<button class="icon-btn" type="button" data-mem="next" aria-label="下一步">' + global.PYT.icons.get('skipFwd') + '</button>' +
      '<input class="trace-range" type="range" min="0" max="' + (this.steps.length - 1) + '" value="0" data-mem="range" aria-label="步骤进度">' +
      '<span class="trace-step" data-mem="count">1 / ' + this.steps.length + '</span>';
    this.host.appendChild(bar);

    this.bar = bar;
    this.range = bar.querySelector('[data-mem="range"]');
    this.count = bar.querySelector('[data-mem="count"]');

    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mem]');
      if (!b) return;
      var act = b.getAttribute('data-mem');
      if (act === 'prev') { self.pause(); self.stepTo(self.index - 1); }
      else if (act === 'next') { self.pause(); self.stepTo(self.index + 1); }
      else if (act === 'play') self.togglePlay();
    });
    this.range.addEventListener('input', function () {
      self.pause();
      self.stepTo(parseInt(self.range.value, 10), true);
    });
  };

  Player.prototype.togglePlay = function () {
    if (this.timer) { this.pause(); return; }
    var self = this;
    if (this.index >= this.steps.length - 1) this.stepTo(0);
    this._setPlayIcon(true);
    this.timer = setInterval(function () {
      if (self.index >= self.steps.length - 1) { self.pause(); return; }
      self.stepTo(self.index + 1);
    }, 1200);
  };

  Player.prototype.pause = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this._setPlayIcon(false);
  };

  Player.prototype._setPlayIcon = function (playing) {
    if (!this.bar) return;
    var b = this.bar.querySelector('[data-mem="play"]');
    if (b) {
      b.innerHTML = global.PYT.icons.get(playing ? 'pause' : 'play');
      b.setAttribute('aria-label', playing ? '暂停' : '播放');
    }
  };

  Player.prototype.stepTo = function (i, fromRange) {
    if (!this.steps.length) return;
    i = Math.max(0, Math.min(this.steps.length - 1, i));
    this.index = i;
    var step = this.steps[i];

    draw(this.svg, step, {});

    this.caption.textContent = step.caption || '';
    this.caption.classList.remove('is-empty');
    if (!step.caption) this.caption.classList.add('is-empty');

    if (this.range && !fromRange) this.range.value = String(i);
    if (this.count) this.count.textContent = (i + 1) + ' / ' + this.steps.length;

    // 如果同一页有代码块，把对应行高亮起来做图文对照
    if (step.line != null && this.host._codeBlock) {
      global.PYT.code.highlightLine(this.host._codeBlock, step.line);
    }
  };

  Player.prototype.stop = function () {
    this.pause();
  };

  /* ============================================================
     对外接口
     ============================================================ */
  var memory = {
    Player: Player,

    /** 在给定容器里渲染一个内存演示，返回 Player */
    mount: function (host, spec) {
      if (!host || !spec || !spec.steps || !spec.steps.length) return null;
      return new Player(host, spec);
    },

    /** 静态渲染单帧（不需要交互时用） */
    staticFrame: function (host, spec) {
      var svg = el('svg', { class: 'mem-svg', role: 'img' });
      draw(svg, spec, {});
      host.appendChild(svg);
      return svg;
    }
  };

  global.PYT = global.PYT || {};
  global.PYT.memory = memory;
})(window);
