# 章节内容编写规范

你要为一套已搭好的网页幻灯片引擎，编写一章的 C++ 教程内容 `assets/data/<slug>.js`。

**先读 `assets/data/ch1.js`** —— 那是已完成的范例，也是唯一的格式参考。
本文件只补充约束与注意事项。

---

## 一、产物

一个 `.js` 文件，形如：

```js
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};
  global.PYT.data.chN = [ /* 幻灯片数组 */ ];
})(window);
```

- 数据键名必须与文件名一致（`ch3.js` → `PYT.data.ch3`，`preface.js` → `PYT.data.preface`）
- **必须能通过 `node --check assets/data/<slug>.js`**
- 字符串用单引号；多行内容用模板字符串（反引号）
- 正文里的内联代码用反引号包裹，加粗用 `**星号**`，两者可嵌套

---

## 二、内容来源

素材已提取到 `tools/out/<slug>.json`，结构：

```json
{ "slides": [ { "n": 1, "title_guess": "…", "notes": "演讲者备注（讲师逐字讲稿）",
                "blocks": [ { "text": "…", "is_code": true } ] } ] }
```

- `notes` 是**讲师讲稿**，绝大多数页面都有。**必须原样保留**放进 `notes` 字段
  （可以整理标点与分段，不要改写内容、增删语义）。
  学员按 <kbd>S</kbd> 就能看到它，这是课件的精华。
- 正文与卡片文字来自 PPT，可以**润色措辞、拆分成卡片**，
  但不要改变技术含义，也不要杜撰 PPT 里没有的知识点。
- **代码要写得比 PPT 更完整详实**（这是用户的明确要求）：
  PPT 里常常只有一两行片段，你应该补成**完整可编译运行的程序**。

---

## 三、幻灯片类型

| type | 用途 | 必填 | 选填 |
|---|---|---|---|
| `title` | 章封面 | `title` | `eyebrow`, `lead`, `notes` |
| `map` | 知识地图 | `map.root`, `map.branches[]` | `eyebrow`, `title`, `lead`, `notes` |
| `toc` | 目录 | `items[{num,title,body}]` | `eyebrow`, `title`, `lead`, `notes` |
| `section` | 分节页 | `num`, `title` | `sub`, `lead`, `notes` |
| `cards` | 卡片组 | `cards[{icon,heading,body}]` | `eyebrow`, `title`, `lead`, `note`, `code`, `notes` |
| `split` | 左讲解右代码 | `code` | `points[]`, `cards[]`, `note`, `notes` |
| `code` | 代码为主 | `code` | `points[]`, `note`, `notes` |
| `compare` | 对比 | `table{head,rows}` 或 `versus{a,b}` | `eyebrow`, `title`, `lead`, `note`, `notes` |
| **`memory`** | **内存可视化** | `memory.steps[]` | `points[]`, `code`, `note`, `notes` |
| `end` | 结尾 | `title` | `icon`, `lead`, `cards[]`, `notes` |

### 建议节奏

封面 → 知识地图 → 目录 → 分节页 → 内容页…（每个 PART 一节）→ 小结 → 结尾

PPT 一个 PART 常含 2–4 页，网页上拆成 3–5 页更好读。

---

## 四、代码块（最重要）

```js
code: {
  file: 'main.cpp',
  source: `#include <iostream>
int main() {
    std::cout << "hi" << std::endl;
    return 0;
}`,
  expectedOutput: `hi`,          // 必须是真实编译运行的结果
  note: { kind:'trap', title:'…', text:'…' }   // 可选
}
```

### 硬性规则

1. **代码必须完整可编译** —— 每个示例都要有 `#include`、`main`、`return 0;`。
   PPT 里的片段（如单独一行 `int x = 5;`）要补成完整程序。
2. **`expectedOutput` 必须是真实输出** —— 写完必须运行验证（见第六节）。
   C++ 有大量未定义行为和平台差异，凭直觉写的输出十有八九是错的。
3. **代码规范**：4 空格缩进，`std::` 明确写出或用 `using namespace std;`（保持一致），
   操作符两侧加空格，每个语句以 `;` 结尾。
4. **不要用需要交互输入的示例**（`std::cin`），因为无法验证输出。
   如果必须演示输入，用固定变量代替并加 `note` 说明。
5. **避免随机性**：`rand()` 要配 `srand(固定种子)`，或改成确定性输出。
6. **避免未定义行为作为"正常示例"**：如要演示错误（越界、野指针），
   放在 `note` 里说明，或用注释标注清楚，并确保程序本身能正常结束。

### 不能验证的代码

- 需要 `std::cin` 交互的
- 依赖特定平台/编译器的
- 故意崩溃的（如解引用空指针）

这类用 `verify: false` 标记跳过验证，并在 `note` 里如实说明。

---

## 五、内存可视化（本教程的特色）

C++ 最难的"数据在哪、指针指向谁"，用可逐步播放的内存图讲。

```js
{
  type: 'memory',
  eyebrow: '核心概念',
  title: '指针如何指向变量',
  lead: '一句话说明这一页要讲清什么。',
  memory: {
    steps: [
      {
        caption: '这一步发生了什么（会显示在图下方）',
        line: 3,                          // 可选：高亮同页代码的第 3 行
        regions: [
          { name: '栈 Stack', kind: 'stack', cells: [
              { id:'x', label:'x', type:'int', value:'42', addr:'0x7ffd9c4a2ba0' }
          ]},
          { name: '堆 Heap', kind: 'heap', cells: [
              { id:'obj', label:'', type:'int*', value:'?', addr:'0x55a0f3e1c010' }
          ]}
        ],
        arrows: [ { from:'p', to:'x', label:'&x' } ]
      }
    ]
  }
}
```

- `regions[].kind`：`stack` / `heap` / `global` / `code`，决定配色
- `cells[].state`：`normal` | `changed`（本步刚变化，高亮）| `dangling`（野指针，红色虚线）| `freed`（已释放，划线）
- `cells[].label` 传空字符串 `''` 表示这个格子还没有名字（**不要省略 label 字段**）
- `cells[].addr` **写完整地址**（栈用 `0x7ffd9c4a2bXX`，堆用 `0x55a0f3e1c0XX`），
  不要写 `0x7ffd…a0` 这种省略形式 —— 省略号会让读者以为是自己没看清，而不去读它。
  同一页里的地址必须彼此一致：相邻的 int 差 4 字节、指针差 8 字节
- `arrows[].from/to` 用 `cells[].id`
- 每步 3–8 条 caption，**一次只讲清一件事**

**适合用内存图的场景**：变量与地址、指针基础、指针与数组、值传递 vs 引用传递、
new/delete、内存泄漏、野指针、结构体内存布局、数组在内存中的连续性。

---

## 六、`note` 提示卡

三种视觉，按内容选：

| kind | 用途 | 颜色 |
|---|---|---|
| `note`（默认） | 一般补充说明 | 蓝色 |
| `trap` | **C++ 陷阱**：溢出、越界、野指针、未定义行为、精度丢失 | 红色 |
| `env` | 环境/验证说明（如"这里跳过了验证，原因…"） | 琥珀色 |

```js
note: { kind: 'trap', title: '整数溢出', text: '`int` 最大值加 1 **不会报错**…' }
```

C++ 教学里陷阱极多，**每个陷阱都用 `trap` 明确标出**，这是这套教程的价值之一。

---

## 七、自检（提交前必做）

```bash
cd /Users/hiung/Documents/CVs/C++/web
node --check assets/data/<slug>.js      # 语法必须通过
node tools/verify_examples.mjs <slug>   # 代码必须全部跑通
```

第二条会真正用 clang++ 编译并运行每个代码块，与 `expectedOutput` 逐字符比对。
**必须跑到「失败 0」为止**。输出不一致时，以真实输出为准改正
（你的预测错了，不是编译器错了）。

---

## 八、质量要求

- **讲解文字**要像讲师在对学生说话，参考 ch1 的语气。
  不要堆砌名词，不要写成 API 手册。
- **不要留占位内容**（「待补充」「TODO」之类）。
- **一页讲清一个点**，不要把整个 PART 塞进一页。
- **代码要能引发思考**：好的示例应该让学员"哦，原来是这样"，
  而不是把语法复述一遍。优先写能体现差别的对比示例。
