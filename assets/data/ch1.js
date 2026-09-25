/* ============================================================
   第 1 章 · 数据类型与变量常量

   所有 code.expectedOutput 均由 clang++ 实际编译运行得到，
   由 tools/verify_examples.mjs 校验，不是手写的想象值。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch1 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 1 章',
      title: '数据类型与变量常量',
      lead: '数据在内存里长什么样 · 编程的基石',
      notes: '大家好，欢迎回到 C/C++ 编程教程。在上一章，我们了解了计算机和程序的基本概念。从这一章开始，我们将正式进入代码的世界。本章的主题是"数据与变量"，这是编程的基础，希望大家认真掌握。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: '从"数据到底是什么"出发，一步步走到能熟练地存取和转换数据。',
      map: {
        aria: '本章知识地图：数据的本质、基本类型、变量与常量、类型转换',
        root: { title: '第 1 章 · 数据类型与变量常量', sub: '编程的基石' },
        branches: [
          {
            title: '数据的本质',
            sub: '数据在哪儿',
            leaves: [
              { title: '比特与字节', sub: '0/1 与 8 位一组' },
              { title: '内存与地址', sub: '每个字节有编号' }
            ]
          },
          {
            title: '基本数据类型',
            sub: '数据的身份证',
            leaves: [
              { title: '整数 int / long', sub: '4 / 8 字节' },
              { title: '浮点 float / double', sub: '4 / 8 字节' },
              { title: '字符 char', sub: '1 字节' },
              { title: '布尔 bool', sub: '1 字节' }
            ]
          },
          {
            title: '变量与常量',
            sub: '给数据贴标签',
            leaves: [
              { title: '声明与初始化', sub: 'int age = 18;' },
              { title: 'const 常量', sub: '不可修改' },
              { title: 'sizeof', sub: '测量占多少字节' }
            ]
          },
          {
            title: '类型转换',
            sub: '数据的变形记',
            leaves: [
              { title: '隐式转换', sub: '编译器自动做' },
              { title: '显式转换', sub: '(int) 3.9' },
              { title: 'auto 推导', sub: 'C++11' }
            ]
          }
        ]
      },
      notes: '这张图是本章的全貌。我们先把"数据在计算机里到底长什么样"弄明白，再学习 C++ 提供了哪些基本类型，然后学会用变量和常量把它们存起来，最后掌握类型之间的转换。这四块是层层递进的关系。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '八个核心概念',
      items: [
        { num: '01', title: '数据的本质', body: '比特、字节与内存 —— 计算机世界的基石' },
        { num: '02', title: '基本数据类型', body: '数据的"身份证" —— 定义数据的属性与范围' },
        { num: '03', title: '变量', body: '给数据贴标签 —— 存储和操作可变数据' },
        { num: '04', title: '常量', body: '不变的承诺 —— 程序运行中固定不变的值' },
        { num: '05', title: 'sizeof 运算符', body: '测量内存的尺子 —— 计算类型占用的字节数' },
        { num: '06', title: '类型转换', body: '数据的变形记 —— 不同类型间的相互转换' },
        { num: '07', title: 'auto 类型推导', body: '让编译器猜一猜 —— C++11 引入的自动推断' },
        { num: '08', title: '数据在内存里怎么放', body: '字节序（大端小端）与 IEEE 754 浮点数' }
      ],
      notes: '本章我们将学习八个核心概念。前四个是基础，后四个是工具。特别提醒大家注意类型转换那一节，隐式转换是初学者最容易踩坑的地方；最后一节的字节序和浮点数表示是两个"看起来没事、查起来要命"的坑。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: '数据的本质',
      sub: '比特 · 字节 · 内存',
      lead: '在写代码之前，先搞清楚数据在计算机里到底以什么形式存在。',
      notes: '在编程世界里，一切皆为数据。那么数据到底是什么呢？我们首先要理解计算机处理信息的最基本单位：比特和字节，以及它们是如何存储在内存中的。'
    },

    /* ---------- 5. 比特与字节 ---------- */
    {
      type: 'cards',
      eyebrow: '计算机的积木',
      title: '比特与字节',
      lead: '计算机里没有"数字"和"文字"，只有两种状态的通断，以及它们的组合。',
      cards: [
        {
          icon: 'bit',
          heading: '比特 Bit',
          body: '最小信息单元，只有 `0` 和 `1` 两种状态。可以想象成一个只有开和关的电灯开关。'
        },
        {
          icon: 'binary',
          heading: '字节 Byte',
          body: '8 个比特组成 1 个字节：`1 Byte = 8 Bits`。这是计算机存储数据的基本单位。'
        },
        {
          icon: 'text',
          heading: '举个例子',
          body: '字母 `\'A\'` 在计算机里存为 `01000001`，正好 8 位，也就是 1 个字节。'
        }
      ],
      notes: '比特是计算机世界里最小的信息单位，它只有 0 和 1 两种可能。而字节由 8 个比特组成，是计算机存储信息的基本单位。比如一个字母就需要一个字节来存储。理解了这一层，后面讲数据类型占多少字节就不会觉得抽象了。'
    },

    /* ---------- 6. 内存【可视化】 ---------- */
    {
      type: 'memory',
      eyebrow: '核心概念',
      title: '内存：一连串带编号的格子',
      lead: '创建变量，就是在内存里找一个空闲的格子放数据，并给这个格子起个人类看得懂的名字。',
      memory: {
        title: '变量在内存中的样子',
        steps: [
          {
            caption: '内存可以看成一排编号连续的格子，每个格子 1 字节，编号就是内存地址。',
            regions: [
              {
                name: '内存 Memory', kind: 'stack',
                cells: [
                  { id: 'a', label: '', type: '', value: '?', addr: '0x7ffd9c4a2ba0' },
                  { id: 'b', label: '', type: '', value: '?', addr: '0x7ffd9c4a2ba4' },
                  { id: 'c', label: '', type: '', value: '?', addr: '0x7ffd9c4a2ba8' },
                  { id: 'd', label: '', type: '', value: '?', addr: '0x7ffd9c4a2bac' }
                ]
              }
            ]
          },
          {
            caption: '执行 int age = 18; 编译器分配 4 个字节，把 18 写成二进制存进去，并贴上标签 age。',
            regions: [
              {
                name: '内存 Memory', kind: 'stack',
                cells: [
                  { id: 'a', label: 'age', type: 'int', value: '18', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                  { id: 'b', label: '', type: '', value: '?', addr: '0x7ffd9c4a2ba4' },
                  { id: 'c', label: '', type: '', value: '?', addr: '0x7ffd9c4a2ba8' },
                  { id: 'd', label: '', type: '', value: '?', addr: '0x7ffd9c4a2bac' }
                ]
              }
            ]
          },
          {
            caption: 'A 的 ASCII 码是 65，存成 1 个字节。char 只占 1 字节，比 int 省得多。',
            regions: [
              {
                name: '内存 Memory', kind: 'stack',
                cells: [
                  { id: 'a', label: 'age', type: 'int', value: '18', addr: '0x7ffd9c4a2ba0' },
                  { id: 'b', label: 'grade', type: 'char', value: "'A'", addr: '0x7ffd9c4a2ba4', state: 'changed' },
                  { id: 'c', label: '', type: '', value: '?', addr: '0x7ffd9c4a2ba8' },
                  { id: 'd', label: '', type: '', value: '?', addr: '0x7ffd9c4a2bac' }
                ]
              }
            ]
          },
          {
            caption: '修改变量的值，改的是同一个格子里装的内容，格子的地址和名字都不变。',
            regions: [
              {
                name: '内存 Memory', kind: 'stack',
                cells: [
                  { id: 'a', label: 'age', type: 'int', value: '19', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                  { id: 'b', label: 'grade', type: 'char', value: "'A'", addr: '0x7ffd9c4a2ba4' },
                  { id: 'c', label: '', type: '', value: '?', addr: '0x7ffd9c4a2ba8' },
                  { id: 'd', label: '', type: '', value: '?', addr: '0x7ffd9c4a2bac' }
                ]
              }
            ]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'memory',
        title: '为什么要讲这个',
        text: '后面讲指针时，**地址**会成为主角。现在把"变量 = 有名字的内存格子"这个印象建立起来，第 6 章会轻松很多。'
      },
      notes: '那么这些字节数据存储在哪里呢？答案是内存。我们可以把内存想象成一个巨大的储物柜，每个柜子大小是 1 字节，并且有唯一的地址。我们编写程序时，就是在告诉计算机如何使用这些格子。变量名是我们给格子起的标签，地址才是格子在内存里的真实坐标。'
    },

    /* ---------- 7. 分节 02 ---------- */
    {
      type: 'section',
      num: '02',
      title: '基本数据类型',
      sub: '数据的身份证',
      lead: '不同类型决定了编译器分配多少内存，以及这份数据能参与什么运算。',
      notes: '既然数据要存在内存里，那不同类型的数据需要多大的空间呢？C++ 为我们提供了多种数据类型，它们就像是数据的"身份证"。'
    },

    /* ---------- 8. 基本类型对比表 ---------- */
    {
      type: 'compare',
      eyebrow: '速查',
      title: '五种基本类型',
      lead: '下表是 64 位系统上最常见的实现。C++ 标准只规定了"至少多少字节"，具体实现由编译器决定 —— 这也是 sizeof 存在的意义。',
      table: {
        head: ['类型', '典型大小', '取值范围（典型）', '用途'],
        rows: [
          ['`char`', '1 字节', '−128 ~ 127', '单个字符，或很小的整数'],
          ['`bool`', '1 字节', '`true` / `false`', '逻辑判断'],
          ['`int`', '4 字节', '约 ±21 亿', '最常用的整数'],
          ['`float`', '4 字节', '约 7 位有效数字', '精度要求不高的浮点数'],
          ['`double`', '8 字节', '约 15 位有效数字', '科学计算与日常首选']
        ]
      },
      note: {
        kind: 'trap',
        title: '整数溢出',
        text: '`int` 能表示的范围是有限的。`int` 的最大值加 1 **不会报错**，而是悄悄变成最小值（有符号整数溢出在标准里是未定义行为）。涉及大数时请用 `long long`。'
      },
      notes: '这是本章最重要的一张表。请大家注意两点：第一，这些字节数是"典型值"，不是标准强制的；第二，int 的范围是有限的，超出范围不会报错，会得到一个完全错误的结果。'
    },

    /* ---------- 9. 整数与浮点 ---------- */
    {
      type: 'split',
      eyebrow: '动手试试',
      title: '整数与浮点数',
      lead: '浮点数的精度是有限的，这是它和整数最本质的区别。',
      points: [
        '`int` 存整数，`double` 存小数',
        '`double` 精度约 15–16 位，日常首选',
        '`float` 只保证约 6–7 位，且必须在字面量后加 `f`',
        '浮点数**不能直接用 `==` 比较**，要比较差值是否足够小'
      ],
      code: {
        file: 'numbers.cpp',
        source: `#include <iostream>

int main() {
    int count = 7;
    double price = 19.99;
    float ratio = 0.1f;          // 注意后缀 f

    std::cout << "count = " << count << std::endl;
    std::cout << "price = " << price << std::endl;

    // 浮点误差：0.1 + 0.2 并不等于 0.3
    double a = 0.1, b = 0.2;
    std::cout << "0.1 + 0.2 = " << (a + b) << std::endl;
    std::cout << "是否等于 0.3: " << (a + b == 0.3) << std::endl;

    return 0;
}`,
        expectedOutput: `count = 7
price = 19.99
0.1 + 0.2 = 0.3
是否等于 0.3: 0`,
        note: {
          kind: 'trap',
          title: '浮点比较的坑',
          text: '输出看起来是 `0.3`，但 `a + b == 0.3` 得到的是 `0`（假）。因为 `0.1` 和 `0.2` 在二进制里都无法精确表示，累加后是一个极其接近但不等于 `0.3` 的数。正确做法是比较差值：`fabs(a + b - 0.3) < 1e-9`。'
        }
      },
      notes: '这里演示了浮点数最重要的一个特性：它不精确。0.1 加 0.2 打印出来是 0.3，但那只是 cout 的默认精度把它四舍五入了，实际存储的值和 0.3 并不相等。所以永远不要用等号比较两个浮点数。'
    },

    /* ---------- 10. 字符与布尔 ---------- */
    {
      type: 'split',
      eyebrow: '动手试试',
      title: '字符与布尔',
      lead: '`char` 本质是一个很小的整数，`bool` 只有两个值。',
      points: [
        '字符用**单引号** `\'A\'`，字符串用**双引号** `"A"`，两者完全不同',
        '`char` 存的是字符的编码值（ASCII）',
        '`bool` 输出时 `true` 显示为 `1`，`false` 显示为 `0`',
        '可以通过 `(int)` 强制转换查看字符的编码'
      ],
      code: {
        file: 'char_bool.cpp',
        source: `#include <iostream>

int main() {
    char grade = 'A';
    bool is_adult = true;

    // 字符本质上是一个小整数
    std::cout << "grade = " << grade << std::endl;
    std::cout << "grade 的编码 = " << (int)grade << std::endl;

    // 字符可以参与算术运算
    std::cout << "下一个字母 = " << (char)(grade + 1) << std::endl;

    std::cout << "is_adult = " << is_adult << std::endl;
    std::cout << "sizeof(bool) = " << sizeof(bool) << std::endl;

    return 0;
}`,
        expectedOutput: `grade = A
grade 的编码 = 65
下一个字母 = B
is_adult = 1
sizeof(bool) = 1`
      },
      notes: 'char 类型表面上是存字符的，但它本质上就是个 1 字节的整数。A 的 ASCII 码是 65，所以 grade 加 1 就得到 B。理解这一点对后面学字符串处理很有帮助。另外注意，bool 用 cout 输出时显示的是 1 和 0，不是 true 和 false。'
    },

    /* ---------- 11. 分节 03+04 ---------- */
    {
      type: 'section',
      num: '03',
      title: '变量与常量',
      sub: '给数据贴标签',
      lead: '变量是可以变的量，常量是不变的承诺。',
      notes: '接下来我们学习如何把数据存起来。变量是程序中最基本的存储单位，而常量则用于表示那些不应该被修改的值。'
    },

    /* ---------- 12. 变量声明与初始化 ---------- */
    {
      type: 'split',
      eyebrow: '核心语法',
      title: '声明、初始化与赋值',
      lead: 'C++ 里声明一个变量最少要写两样东西：类型和名字。强烈建议同时给它一个初值。',
      points: [
        '**声明**：`int age;` —— 告诉编译器要一块能装 int 的内存',
        '**初始化**：`int age = 18;` —— 声明的同时给初值',
        '**赋值**：`age = 20;` —— 改变已有变量的值',
        '未初始化的局部变量里是**垃圾值**，不是 0'
      ],
      code: {
        file: 'variable.cpp',
        source: `#include <iostream>

int main() {
    // 三种初始化写法
    int a = 10;          // 最常用
    int b(20);           // 构造函数语法
    int c{30};           // 列表初始化（C++11，最严格）

    // 声明时不初始化：内容是垃圾值，不要读它
    int garbage;
    garbage = 0;         // 先赋值再使用

    std::cout << a << " " << b << " " << c << std::endl;

    // 变量的值可以随时改变
    a = 100;
    std::cout << "修改后 a = " << a << std::endl;

    return 0;
}`,
        expectedOutput: `10 20 30
修改后 a = 100`,
        note: {
          kind: 'env',
          title: '关于「垃圾值」',
          text: '未初始化的局部变量里装的是内存中残留的旧数据。它可能是任何值，每次运行都可能不同 —— 所以本示例里没有打印 `garbage` 的初值。**读未初始化的变量是未定义行为**，程序可能崩溃或产生随机结果。'
        }
      },
      notes: '这里要强调一个非常常见的错误：以为没赋值的变量是 0。在 C++ 里不是的，局部变量的初值是垃圾值。所以养成好习惯，声明变量的同时就给它一个初始值。如果想用最严格的检查，用列表初始化的写法，它在类型不匹配时会直接报错。'
    },

    /* ---------- 13. 常量 ---------- */
    {
      type: 'compare',
      eyebrow: '两种写法',
      title: '常量：const 与 #define',
      lead: '同样能定义常量，但两者差别很大 —— 现代 C++ 应该优先用 `const`。',
      versus: {
        a: {
          title: 'const（推荐）',
          icon: 'guard',
          items: [
            '`const double PI = 3.14159;`',
            '**有类型**，编译器会做类型检查',
            '作用域遵循变量规则，可放在函数内',
            '可以调试，能取地址',
            '现代 C++ 的标准做法'
          ]
        },
        b: {
          title: '#define（预处理宏）',
          icon: 'warn',
          items: [
            '`#define PI 3.14159`',
            '**没有类型**，只是文本替换',
            '作用域是"文件剩余部分"，容易失控',
            '调试器看不到它',
            'C 语言遗留下来的做法'
          ]
        }
      },
      note: {
        kind: 'trap',
        title: '宏替换的经典陷阱',
        text: '`#define SQUARE(x) x * x` 看似没问题，但 `SQUARE(1 + 2)` 展开后是 `1 + 2 * 1 + 2`，结果是 `5` 而不是 `9`。要用宏就必须给每个参数加括号，或者干脆用 `inline` 函数。'
      },
      notes: '常量有两种定义方式。虽然 #define 也能用，但它是预处理阶段的文本替换，没有类型检查，调试器也看不到。现代 C++ 应该用 const，它有类型、有作用域、能参与类型检查。#define 的陷阱在下面的提示里有例子，那个 1+2 的问题非常经典。'
    },

    /* ---------- 14. sizeof ---------- */
    {
      type: 'split',
      eyebrow: '测量工具',
      title: 'sizeof：看看类型占多少字节',
      lead: '不同平台、不同编译器下同一类型的大小可能不同，`sizeof` 是唯一可靠的测量方式。',
      points: [
        '`sizeof(类型)` 或 `sizeof(变量)` 返回字节数',
        '结果是 `size_t` 类型（无符号整数）',
        '**编译期就能算出来**，运行时没有开销',
        '数组的 `sizeof` 是整块内存大小，不是元素个数'
      ],
      code: {
        file: 'sizeof_demo.cpp',
        source: `#include <iostream>

int main() {
    std::cout << "char   : " << sizeof(char)   << " 字节" << std::endl;
    std::cout << "bool   : " << sizeof(bool)   << " 字节" << std::endl;
    std::cout << "int    : " << sizeof(int)    << " 字节" << std::endl;
    std::cout << "float  : " << sizeof(float)  << " 字节" << std::endl;
    std::cout << "double : " << sizeof(double) << " 字节" << std::endl;
    std::cout << "long long : " << sizeof(long long) << " 字节" << std::endl;

    // 对变量也能用
    int arr[5] = {1, 2, 3, 4, 5};
    std::cout << "整个数组 = " << sizeof(arr) << " 字节" << std::endl;
    std::cout << "元素个数 = " << sizeof(arr) / sizeof(arr[0]) << std::endl;

    return 0;
}`,
        expectedOutput: `char   : 1 字节
bool   : 1 字节
int    : 4 字节
float  : 4 字节
double : 8 字节
long long : 8 字节
整个数组 = 20 字节
元素个数 = 5`,
        note: {
          kind: 'note',
          title: '求数组长度的惯用法',
          text: '`sizeof(arr) / sizeof(arr[0])` 是 C 风格数组求元素个数的标准写法。第 5 章会讲它的局限：数组一旦作为参数传给函数，就会退化成指针，这时这个技巧会失效。'
        }
      },
      notes: '在大多数 64 位系统上，int 是 4 字节，double 是 8 字节。但标准并没有规定死，所以写跨平台代码时要用 sizeof 来确认。数组那两行值得记住：用整个数组的大小除以单个元素的大小，就得到元素个数。'
    },

    /* ---------- 15. 分节 06 ---------- */
    {
      type: 'section',
      num: '06',
      title: '类型转换',
      sub: '数据的变形记',
      lead: '不同类型混在一起运算时，编译器会悄悄做转换 —— 有些转换会丢数据。',
      notes: '接下来是最容易出问题的一节：类型转换。隐式转换是编译器自动做的，方便但危险；显式转换是我们明确要求的，清晰但要注意精度损失。'
    },

    /* ---------- 16. 隐式转换 ---------- */
    {
      type: 'split',
      eyebrow: '危险区',
      title: '隐式转换：看不见的精度丢失',
      lead: '整数除法、浮点转整数，是两个最常见的静默出错点。',
      points: [
        '两个 `int` 相除，结果**还是 `int`**，小数部分直接丢掉',
        '把 `double` 赋给 `int`，小数部分被**截断**（不是四舍五入）',
        '把大范围类型赋给小范围类型，可能**溢出**',
        '隐式转换不会报错，只会给出错误结果'
      ],
      code: {
        file: 'implicit.cpp',
        source: `#include <iostream>

int main() {
    // 陷阱一：整数除法
    int a = 7, b = 2;
    std::cout << "7 / 2 = " << a / b << std::endl;

    // 只要有一个是浮点，就会按浮点算
    std::cout << "7.0 / 2 = " << 7.0 / b << std::endl;

    // 陷阱二：浮点转整数是截断，不是四舍五入
    double pi = 3.99;
    int truncated = pi;
    std::cout << "3.99 转成 int = " << truncated << std::endl;

    // 陷阱三：小数被丢掉后再参与运算，误差会放大
    double avg = (a + b) / 2;          // 先算整数除法
    std::cout << "(7+2)/2 = " << avg << std::endl;

    return 0;
}`,
        expectedOutput: `7 / 2 = 3
7.0 / 2 = 3.5
3.99 转成 int = 3
(7+2)/2 = 4`
      },
      notes: '这段代码里三个错误都很典型。第一，7 除以 2 在数学上是 3.5，但在 C++ 里如果两边都是整数，结果就是 3，小数部分直接扔掉。第二，3.99 转成整数是 3 不是 4，因为这是截断不是四舍五入。第三，求平均值时先算了整数除法，所以 (7+2)/2 得到 4 而不是 4.5。'
    },

    /* ---------- 17. 显式转换 ---------- */
    {
      type: 'split',
      eyebrow: '正确做法',
      title: '显式转换：把意图写清楚',
      lead: '想让结果是小数，就得明确地转换类型，而不是指望编译器猜。',
      points: [
        'C 风格：`(double)a` —— 能写，但不推荐',
        'C++ 风格：`static_cast<double>(a)` —— 意图明确、易搜索',
        '四个命名的转换各有用途，日常最常用 `static_cast`',
        '转换要**在参与运算之前**完成'
      ],
      code: {
        file: 'explicit.cpp',
        source: `#include <iostream>

int main() {
    int sum = 9, n = 2;

    // 错误：先做整数除法，再转成 double，已经晚了
    double wrong = (double)(sum / n);
    std::cout << "先除后转 = " << wrong << std::endl;

    // 正确：先把操作数转成 double，再相除
    double right = static_cast<double>(sum) / n;
    std::cout << "先转后除 = " << right << std::endl;

    // C++ 风格的转换语法更清晰，也更容易在代码里搜索到
    double d = 3.7;
    int i = static_cast<int>(d);
    std::cout << "3.7 截断为 " << i << std::endl;

    return 0;
}`,
        expectedOutput: `先除后转 = 4
先转后除 = 4.5
3.7 截断为 3`,
        note: {
          kind: 'trap',
          title: '转换的位置决定结果',
          text: '注意前两行的差别：`(double)(sum / n)` 是先算 `9 / 2 = 4`，再转成 `4.0`；而 `static_cast<double>(sum) / n` 是先把 `9` 变成 `9.0`，再除以 `2` 得到 `4.5`。**括号的位置决定了运算顺序**，这是初学者最常写错的地方。'
        }
      },
      notes: '这段代码的前两行是同一个运算的两种写法，结果完全不同。第一行先把 9 除以 2 得到 4，再转成 4.0，已经来不及了。第二行先把 9 转成 9.0，再除以 2，得到正确的 4.5。请记住这个区别，它非常实用。'
    },

    /* ---------- 18. 分节 07 ---------- */
    {
      type: 'section',
      num: '07',
      title: 'auto 类型推导',
      sub: 'C++11 的新工具',
      lead: '让编译器从初始值推断类型，减少重复书写，也避免写错类型。',
      notes: '最后介绍一个 C++11 引入的实用特性：auto。它让编译器根据初始值自动推断类型，可以少写很多字，也避免了类型写错的问题。'
    },

    /* ---------- 19. auto ---------- */
    {
      type: 'split',
      eyebrow: 'C++11',
      title: 'auto：让编译器替你写类型',
      lead: '`auto` 不是"没有类型"，而是"由初始值推导出类型" —— 它仍然是强类型的。',
      points: [
        '**必须有初始值**，否则编译器无从推断',
        '类型在**编译期**就确定了，没有运行时开销',
        '对长类型名特别有用，如迭代器',
        '不要滥用：类型不明显时写出类型更利于阅读'
      ],
      code: {
        file: 'auto_demo.cpp',
        source: `#include <iostream>
#include <typeinfo>

int main() {
    auto i = 42;              // int
    auto d = 3.14;            // double
    auto c = 'A';             // char
    auto b = true;            // bool

    // 用 sizeof 可以看出推导结果
    std::cout << "i: " << sizeof(i) << " 字节" << std::endl;
    std::cout << "d: " << sizeof(d) << " 字节" << std::endl;
    std::cout << "c: " << sizeof(c) << " 字节" << std::endl;

    // 整数和浮点混合运算时，auto 会推导出较宽的那个类型
    auto mixed = i + d;       // double
    std::cout << "mixed = " << mixed << std::endl;
    std::cout << "mixed 占 " << sizeof(mixed) << " 字节" << std::endl;

    return 0;
}`,
        expectedOutput: `i: 4 字节
d: 8 字节
c: 1 字节
mixed = 45.14
mixed 占 8 字节`,
        note: {
          kind: 'trap',
          title: 'auto 会跟着初始值走',
          text: '`auto x = 5;` 推导为 `int`，不是"通用数字"。如果后面要存小数，`x = 3.7;` 会把 `3.7` 截断成 `3`。该写 `double` 的时候就明确写出来。'
        }
      },
      notes: 'auto 的好处是省事，但要注意它完全跟着初始值走。auto i = 42 推导出的是 int，不是 double。如果你需要一个能存小数的变量，就必须写 double 而不是 auto。这一点在写代码时要特别小心。'
    },

    /* ---------- 20. 分节 08 ---------- */
    {
      type: 'section',
      num: '08',
      title: '数据在内存里到底怎么放',
      sub: '把 0 和 1 再往下钻一层',
      lead: '同一个整数、同一个浮点数，换一种读法，得到的字节完全不一样。',
      notes: '最后我们把视角再拉近一层。前面说的是"一个 int 占 4 字节"，但这 4 个字节里每一位到底是什么，还有两个绕不开的话题：字节的顺序（大端小端），以及浮点数怎么用二进制表示（IEEE 754）。这两个是很多"诡异 bug"的根源，也是面试常问的点。'
    },

    /* ---------- 21. 字节序 ---------- */
    {
      type: 'code',
      eyebrow: '字节序',
      title: '0x12345678 在内存里是怎么排的',
      lead: '一个 4 字节整数在内存里就是 4 个连续的字节。问题是：**高位字节放前面，还是低位字节放前面？**',
      code: {
        file: 'endian.cpp',
        source: `#include <iostream>

int main() {
    unsigned int x = 0x12345678;

    // 把这块内存当成 4 个独立的字节来看
    unsigned char* p = reinterpret_cast<unsigned char*>(&x);

    std::cout << "0x12345678 的 4 个字节（从低地址到高地址）:" << std::endl;
    for (int i = 0; i < 4; ++i) {
        std::cout << "  第 " << i << " 个字节: 0x"
                  << std::hex << (int)p[i] << std::dec << std::endl;
    }

    std::cout << (p[0] == 0x78 ? "低字节在前 → 小端"
                               : "高字节在前 → 大端") << std::endl;

    return 0;
}`,
        expectedOutput: `0x12345678 的 4 个字节（从低地址到高地址）:
  第 0 个字节: 0x78
  第 1 个字节: 0x56
  第 2 个字节: 0x34
  第 3 个字节: 0x12
低字节在前 → 小端`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '为什么可以用 char* 去"偷看"字节',
          text: '标准**明确允许**用 `char*` / `unsigned char*` 查看任意对象的字节 —— 这是极少数不违反严格别名规则的转换之一。所以这段代码不是黑魔法，而是正规做法。\n\n这段输出也顺便解释了第 7 章联合体那页：为什么写 `u.i = 65` 之后，第一个字节是 `01`？因为本机是**小端**，最低位的字节排在最前面。'
        }
      },
      notes: '先让学生看到现象：0x12345678 在内存里是 78 56 34 12，是反过来的。这时候再引出"小端"这个词。要强调 reinterpret_cast<unsigned char*> 是标准允许的、正规的查看字节的方式。'
    },

    /* ---------- 22. 大端与小端 ---------- */
    {
      type: 'compare',
      eyebrow: '概念',
      title: '大端与小端',
      lead: '同一个数，两种排法。选哪种是**硬件设计者的自由** —— 标准没有规定，所以程序里不能假设。',
      table: {
        head: ['', '小端（Little-endian）', '大端（Big-endian）'],
        rows: [
          ['怎么排', '低字节放在**低地址**', '高字节放在**低地址**'],
          ['0x12345678', '`78 56 34 12`', '`12 34 56 78`'],
          ['谁在用', 'x86、ARM（默认）、RISC-V', 'PowerPC、网络协议、Java 字节码'],
          ['读第 0 个字节', '拿到最低 8 位', '拿到最高 8 位'],
          ['名字的由来', '从"小"的那端开始排', '从"大"的那端开始排']
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '什么时候必须关心它',
        text: '**同一台机器自己读写自己的数据，不用管** —— 怎么写就怎么读，天然一致。\n\n要关心的是**跨机器交换数据**的时候：\n· **网络传输**：TCP/IP 规定用**大端**（所以它又叫"网络字节序"），发送前要用 `htonl` 这类函数转换\n· **读写二进制文件**：PNG、ELF、MP4 这些格式都规定了自己的字节序，不按它写就会读出乱七八糟的数\n· **直接 `memcpy` 结构体**：里面只要有 `int`、`short`，两台字节序不同的机器就会串\n\n日常业务代码基本碰不到；一旦碰到往往很难查 —— 因为数据"看起来只是想变了个数"。'
      },
      notes: '这一页要讲清楚三件事：一是两种排法的定义；二是这不是谁对谁错，而是硬件设计的自由；三是判断标准 —— 同一台机器内部不用管，跨机器交换（网络、二进制文件）必须管。网络字节序是大端这一点要记住。'
    },

    /* ---------- 23. IEEE 754【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '浮点数',
      title: 'IEEE 754：浮点数存的不是"一个数"，而是三段信息',
      lead: '一个 `float` 占 4 字节，但这 32 位被切成了 **符号 1 位 + 阶码 8 位 + 尾数 23 位**。',
      memory: {
        title: 'IEEE 754 单精度浮点数的位结构',
        steps: [
          {
            caption: '先看 `float f = 1.0f;` 在内存里的 4 个字节。按小端读成一个 32 位整数是 0x3F800000。可它凭什么等于 1.0？',
            regions: [
              { name: 'float 的内存（4 字节）', kind: 'stack', cells: [
                { id: 'b0', label: '第 0 字节', type: '', value: '0x00', addr: '0x7ffd9c4a2ba0' },
                { id: 'b1', label: '第 1 字节', type: '', value: '0x00', addr: '0x7ffd9c4a2ba1' },
                { id: 'b2', label: '第 2 字节', type: '', value: '0x80', addr: '0x7ffd9c4a2ba2' },
                { id: 'b3', label: '第 3 字节', type: '', value: '0x3F', addr: '0x7ffd9c4a2ba3' }
              ]}
            ],
            note: '小端：低字节在低地址，所以读出来是 0x3F800000'
          },
          {
            caption: 'IEEE 754 把 32 位切成三段：1 位符号、8 位阶码、23 位尾数。各管一件事 —— 正负、小数点放哪、有效数字是多少。',
            regions: [
              { name: 'IEEE 754 单精度：32 位 = 1 + 8 + 23', kind: 'global', cells: [
                { id: 's', label: '符号 sign（1 位）', type: '', value: '0', addr: '' },
                { id: 'e', label: '阶码 exponent（8 位）', type: '', value: '127', addr: '' },
                { id: 'm', label: '尾数 fraction（23 位）', type: '', value: '全 0', addr: '' }
              ]}
            ],
            note: '这是 1.0f 的三段取值'
          },
          {
            caption: '怎么读回来？符号 0 → 正数；阶码 127 要减去固定的偏移 127，得到指数 0；尾数隐含一个 1。于是值是 1.0 × 2⁰ = 1.0 ✓',
            regions: [
              { name: '把三段拼回一个数', kind: 'global', cells: [
                { id: 'v', label: '1.0f 的解读', type: '', value: '= 1.0', addr: '', state: 'changed' }
              ]}
            ],
            note: '阶码减 127 是 IEEE 754 的规定，不是笔误'
          },
          {
            caption: '再换一个：`float g = -2.5f;` 位模式是 0xC0200000 —— 符号 1（负）、阶码 128（128 − 127 = 1，即乘 2¹）、尾数 0x200000（即 0.25，有效数字 1.25）。合起来 −1.25 × 2¹ = −2.5 ✓',
            regions: [
              { name: '-2.5f 的三段', kind: 'global', cells: [
                { id: 's2', label: '符号', type: '', value: '1', addr: '' },
                { id: 'e2', label: '阶码', type: '', value: '128', addr: '' },
                { id: 'm2', label: '尾数', type: '', value: '0x200000', addr: '' }
              ]}
            ],
            note: '同一个公式：±1.尾数 × 2^(阶码−127)'
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '这套编码解决了什么',
        text: '把阶码放在符号位旁边、并且**用偏移表示**（存 127 表示指数 0），让浮点数**按位比较大小**和按数值比较大小是一致的 —— 硬件排序会快很多。这是设计上的巧思，不是随意定的。\n\n代价是**精度有限**：尾数只有 23 位（加上隐含的 1 共 24 位有效数字），约合十进制的 **7 位**有效数字。`double` 是 8 字节：1 位符号 + 11 位阶码 + 52 位尾数，约合 **15～16 位**十进制有效数字。'
      },
      notes: '这一页把 float 拆开看。要点：32 位被切成 1+8+23 三段；阶码要减 127；尾数隐含一个 1。不必让学生会手算每个浮点数，但要建立"浮点数是一套编码，不是直接存数值"这个观念 —— 下一页的 0.1+0.2 就顺理成章了。'
    },

    /* ---------- 24. 0.1 + 0.2 ---------- */
    {
      type: 'code',
      eyebrow: '后果',
      title: '所以 0.1 + 0.2 并不等于 0.3',
      lead: '十进制里很"整齐"的小数，在二进制里大多是**无限循环小数**；而尾数只有那么几位，存进去的那一刻就已经有误差了。',
      code: {
        file: 'float_error.cpp',
        source: `#include <iostream>
#include <iomanip>

int main() {
    double a = 0.1;
    double b = 0.2;

    std::cout << std::setprecision(17);      // 把 17 位有效数字全打出来

    std::cout << "0.1       = " << a << std::endl;
    std::cout << "0.2       = " << b << std::endl;
    std::cout << "0.1 + 0.2 = " << a + b << std::endl;
    std::cout << "0.3       = " << 0.3 << std::endl;
    std::cout << "两者相等吗? " << (a + b == 0.3) << std::endl;

    return 0;
}`,
        expectedOutput: `0.1       = 0.10000000000000001
0.2       = 0.20000000000000001
0.1 + 0.2 = 0.30000000000000004
0.3       = 0.29999999999999999
两者相等吗? 0`,
        note: {
          kind: 'trap',
          title: '浮点数不能用来比相等',
          text: '真相是：`0.1`、`0.2`、`0.3` 在 double 里**都不是精确值**，只是离得很近的近似值。`0.1 + 0.2` 得到 `0.30000000000000004`，而字面量 `0.3` 是 `0.29999999999999999` —— **两个不同的数**，所以 `==` 返回 0（假）。\n\n**实践中的三条规则：**\n· 不要用 `==` 比较浮点数，改成判断"足够接近"：`std::fabs(a - b) < 1e-9`\n· 金额、数量这类需要精确的场合，用整数存最小单位（比如"分"），或者用定点数\n· `float` 只有约 7 位有效十进制数字，`double` 约 15 位 —— 要更多位就得换表示方式\n\n这不是 C++ 的毛病：**所有用 IEEE 754 的语言都一样**，Python、Java、JavaScript 里 `0.1 + 0.2` 也是这个结果。'
        }
      },
      notes: '这一页是这一节的高潮。建议现场演示：先让学生猜 0.1+0.2 等于多少，再跑出来看。然后讲清楚三件事：浮点数是近似值、不要用 == 比较、需要精确就用整数。最后强调这不是 C++ 的问题，是所有 IEEE 754 语言的共性。'
    },

    /* ---------- 20. 常见陷阱汇总 ---------- */
    {
      type: 'cards',
      eyebrow: '避坑指南',
      title: '本章最容易踩的四个坑',
      cards: [
        {
          icon: 'alert',
          heading: '整数除法截断',
          body: '`7 / 2` 得到 `3` 不是 `3.5`。要小数结果，至少把其中一个操作数转成 `double`。'
        },
        {
          icon: 'alert',
          heading: '浮点数用 == 比较',
          body: '`0.1 + 0.2 == 0.3` 是 `false`。应比较差值：`fabs(a - b) < 1e-9`。'
        },
        {
          icon: 'alert',
          heading: '读未初始化的变量',
          body: '局部变量不初始化就是垃圾值，读它是未定义行为。**声明时就给初值**。'
        },
        {
          icon: 'alert',
          heading: '整数溢出',
          body: '`int` 最大值加 1 不会报错，会变成负数。大数请用 `long long`。'
        }
      ],
      notes: '这四个坑在本章都出现过。写代码时如果结果莫名其妙，先回想一下是不是踩了其中某一个。'
    },

    /* ---------- 21. 动手练习 ---------- */
    {
      type: 'code',
      eyebrow: '动手练习',
      title: '练习：温度转换',
      lead: '把这段代码复制到 Compiler Explorer 里改一改，试试把 `int` 换成 `double` 会有什么不同。',
      code: {
        file: 'celsius.cpp',
        source: `#include <iostream>

int main() {
    // 摄氏温度转华氏：F = C × 9 / 5 + 32
    int celsius = 37;
    double fahrenheit = celsius * 9.0 / 5 + 32;

    std::cout << celsius << " 摄氏度 = " << fahrenheit << " 华氏度" << std::endl;

    // 试试把上面的 9.0 改成 9，看看结果会变成多少
    double wrong = celsius * 9 / 5 + 32;
    std::cout << "用整数除法算 = " << wrong << std::endl;

    return 0;
}`,
        expectedOutput: `37 摄氏度 = 98.6 华氏度
用整数除法算 = 98`,
        note: {
          kind: 'note',
          title: '看看差别在哪',
          text: '`37 * 9.0 / 5` 得到 `66.6`，而 `37 * 9 / 5` 得到 `66`（小数被丢掉）。**一个 `.0` 之差，结果就差了 0.6。** 请把代码复制到 Compiler Explorer 亲手试一次。'
        }
      },
      notes: '这道练习请大家一定动手做一遍。把 9.0 改成 9，结果就从 98.6 变成 98。这个小实验能让你记住整数除法的威力。'
    },

    /* ---------- 22. 小结 ---------- */
    {
      type: 'end',
      icon: 'cpp',
      title: '本章小结',
      lead: '数据在内存里就是一个个带编号的格子。类型决定了格子多大、能装什么、能做什么运算。',
      cards: [
        { icon: 'binary', heading: '数据的本质', body: '比特与字节，内存是可寻址的格子序列' },
        { icon: 'memory', heading: '基本类型', body: 'char / bool / int / float / double，各有大小与范围' },
        { icon: 'variable', heading: '变量与常量', body: '变量可改，常量不可改；声明时就要给初值' },
        { icon: 'convert', heading: '类型转换', body: '隐式转换会静默丢精度，该显式转换就写清楚' }
      ],
      notes: '这一章我们建立了对"数据"的基本认识。下章会学习运算符，让这些数据真正动起来。请大家课后把本章的示例都亲手敲一遍，特别是类型转换那几个，它们是后面所有章节的基础。'
    }
  ];
})(window);
