/* ============================================================
   第 4 章 · 函数

   本章的两处难点用内存可视化讲：
   - 值传递 vs 引用传递（栈帧里到底发生了什么）
   - 递归的调用栈（函数一层层压入、再一层层返回）

   所有 code.expectedOutput 均由 clang++ 实际编译运行得到。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch4 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 4 章',
      title: '函数',
      lead: '把代码切成一块块积木 · 模块化编程的起点',
      notes: '大家好，欢迎回到 C/C++ 编程教程。今天我们来学习一个非常重要的概念——函数。函数是编程的核心，它能帮助我们将复杂的代码分解成一个个独立的模块，让我们的程序更加清晰、高效和易于维护。在这一章中，我们将深入探讨函数的方方面面。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: '从"为什么需要函数"出发，一路走到递归和作用域。',
      map: {
        aria: '本章知识地图：函数基础、参数传递、返回值与重载、递归与作用域',
        root: { title: '第 4 章 · 函数', sub: '代码复用的基础' },
        branches: [
          {
            title: '函数基础',
            sub: '定义 · 声明 · 调用',
            leaves: [
              { title: '定义与声明', sub: '实现与说明书' },
              { title: '调用过程', sub: '实参传给形参' }
            ]
          },
          {
            title: '参数传递',
            sub: '本章最大的难点',
            leaves: [
              { title: '值传递', sub: '传副本，改不到外面' },
              { title: '引用传递', sub: '传别名，能改原变量' }
            ]
          },
          {
            title: '返回值与重载',
            sub: '函数的输入输出',
            leaves: [
              { title: 'return', sub: '返回结果 / 提前结束' },
              { title: '函数重载', sub: '同名不同参数' },
              { title: '默认参数', sub: '可省略的实参' }
            ]
          },
          {
            title: '递归与作用域',
            sub: '进阶话题',
            leaves: [
              { title: '调用栈', sub: '函数调用的底层机制' },
              { title: '递归', sub: '函数调用自己' },
              { title: '作用域与 static', sub: '变量的活动范围' }
            ]
          }
        ]
      },
      notes: '本章四大块：先是函数的基础写法，然后是本章最大的难点——参数传递，接着是返回值、重载这些实用特性，最后挑战递归。学完这一章，你就能写出结构清晰的程序了。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '七个部分',
      items: [
        { num: '01', title: '模块化思想', body: '为什么需要函数 —— 从重复造轮子到搭积木' },
        { num: '02', title: '定义、声明与调用', body: '函数的三要素，以及实参与形参' },
        { num: '03', title: '参数传递', body: '值传递与引用传递 —— 本章的核心难点' },
        { num: '04', title: 'return 语句', body: '返回结果，以及提前结束函数' },
        { num: '05', title: '重载与默认参数', body: 'C++ 特有的两个实用特性' },
        { num: '06', title: '递归', body: '调用栈、阶乘、斐波那契' },
        { num: '07', title: '作用域与生命周期', body: '局部变量、全局变量、static' }
      ],
      notes: '本章我们将从为什么需要函数讲起，学习函数的定义、声明和调用。然后深入探讨参数传递的两种方式，以及返回值的使用。接着学习 C++ 特有的函数重载和默认参数。之后挑战递归。最后讨论变量的作用域和生命周期。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: '模块化思想',
      sub: '编程的积木',
      lead: '把一个大问题拆成一个个小模块，分别解决，再组装起来。',
      notes: '首先，我们来思考一个问题：为什么我们需要函数？在编程中，我们经常会遇到重复的代码，如果每次都重新写一遍，不仅效率低下，而且难以维护。函数就是为了解决这个问题而生的。'
    },

    /* ---------- 5. 为什么需要函数 ---------- */
    {
      type: 'cards',
      eyebrow: '动机',
      title: '从"重复造轮子"到"搭积木"',
      lead: '假设你要在程序里计算 5 次圆面积，每次都复制粘贴那段公式，会发生什么？',
      cards: [
        {
          icon: 'copy',
          heading: '不写函数的问题',
          body: '同样的公式抄了 5 遍。\n想改公式？**5 处都得改**，漏一处就出错。而且代码又长又难读。'
        },
        {
          icon: 'blocks',
          heading: '写成函数之后',
          body: '公式只写一遍，用的时候调用 `circleArea(r)`。\n**改公式只改一处**，调用处完全不用动。'
        },
        {
          icon: 'toolbox',
          heading: '像搭积木一样',
          body: '每个函数是一块积木，有明确的输入和输出。\n复杂的程序 = 一组积木按顺序拼起来。'
        },
        {
          icon: 'target',
          heading: '核心收益',
          body: '**复用**（写一次用多次）、**易改**（改一处生效）、**易读**（名字说明意图）、**好分工**（团队各写各的）'
        }
      ],
      note: {
        kind: 'note',
        title: '一句话总结',
        text: '函数不是为了"少写几个字"，而是为了**让代码可维护**。一个几百行的 `main` 函数和一个拆成十个函数的程序，功能可能一样，但三个月后还能不能看懂、能不能改，差别巨大。'
      },
      notes: '函数的核心思想就是模块化。我们把一个大问题分解成一个个小的、可管理的模块。这样做的好处非常多：代码可以重复使用，修改起来非常方便，程序的逻辑也更清晰，更适合团队合作。'
    },

    /* ---------- 6. 分节 02 ---------- */
    {
      type: 'section',
      num: '02',
      title: '定义、声明与调用',
      sub: '函数的三要素',
      lead: '定义一个函数要写清楚三件事：返回值类型、函数名、参数列表。',
      notes: '了解了为什么需要函数之后，我们来学习如何创建和使用它。这包括三个步骤：定义、声明和调用。'
    },

    /* ---------- 7. 定义与调用 ---------- */
    {
      type: 'split',
      eyebrow: '基础语法',
      title: '函数的定义与调用',
      lead: '定义是写实现，调用是使用它。参数在定义处叫形参，在调用处叫实参。',
      points: [
        '**返回值类型**：函数算出来的东西是什么类型，不返回就写 `void`',
        '**参数列表**：接收什么输入，每个都要写类型',
        '**`return`**：把结果交回给调用者',
        '定义处的叫**形参**，调用处传进去的叫**实参**',
        '函数必须先定义或声明，才能调用'
      ],
      code: {
        file: 'function_basic.cpp',
        source: `#include <iostream>

// 定义：返回值类型 + 函数名 + 参数列表
int add(int a, int b) {          // a, b 是形参
    return a + b;
}

// 没有返回值就写 void
void greet(const std::string& name) {
    std::cout << "你好，" << name << "！" << std::endl;
}

int main() {
    // 调用：把实参传进去
    int result = add(3, 4);       // 3, 4 是实参
    std::cout << "add(3, 4) = " << result << std::endl;

    greet("小明");

    // 也可以直接在表达式里用
    std::cout << "add(10, 20) * 2 = " << add(10, 20) * 2 << std::endl;

    return 0;
}`,
        expectedOutput: `add(3, 4) = 7
你好，小明！
add(10, 20) * 2 = 60`
      },
      notes: '定义函数要写清楚三件事：返回值类型、函数名、参数列表。调用函数就简单了，写出函数名和对应的参数就行。注意参数在定义处叫形参，在调用处叫实参。程序执行到调用时会跳到函数内部，执行完再返回来继续。'
    },

    /* ---------- 8. 分节 03 ---------- */
    {
      type: 'section',
      num: '03',
      title: '参数传递',
      sub: '值传递与引用传递',
      lead: '同一个交换函数，为什么一个能交换成功、一个却完全没效果？',
      notes: '参数传递是函数学习中的一个核心难点。主要有两种方式：值传递和引用传递。理解它们的区别至关重要，这是本章最重要的一节。'
    },

    /* ---------- 9. 值传递 vs 引用传递【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '核心难点',
      title: '值传递与引用传递，到底差在哪',
      lead: '光看代码分不出区别，必须看内存里发生了什么。逐步播放，注意 main 里的 a、b 有没有变。',
      memory: {
        title: '两种参数传递的内存对比',
        steps: [
          {
            caption: '先在 main 的栈帧里定义 a = 1、b = 2。它们各自占一块内存，有自己的地址。',
            regions: [
              {
                name: 'main 的栈帧', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a', type: 'int', value: '1', addr: '0x7ffd9c4a2ba0' },
                  { id: 'b', label: 'b', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4' }
                ]
              }
            ]
          },
          {
            caption: '调用 swap(a, b)。这是【值传递】：系统为形参 x、y 新开两块内存，把 a、b 的值【复制】进去。',
            regions: [
              {
                name: 'main 的栈帧', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a', type: 'int', value: '1', addr: '0x7ffd9c4a2ba0' },
                  { id: 'b', label: 'b', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4' }
                ]
              },
              {
                name: 'swap 的栈帧（新开的）', kind: 'stack',
                cells: [
                  { id: 'x', label: 'x', type: 'int', value: '1', addr: '0x7ffd9c4a2b90', state: 'changed' },
                  { id: 'y', label: 'y', type: 'int', value: '2', addr: '0x7ffd9c4a2b94', state: 'changed' }
                ]
              }
            ]
          },
          {
            caption: '在 swap 里交换 x 和 y。注意：改的是【副本】，main 里的 a、b 一个字节都没动。',
            regions: [
              {
                name: 'main 的栈帧', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a', type: 'int', value: '1', addr: '0x7ffd9c4a2ba0' },
                  { id: 'b', label: 'b', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4' }
                ]
              },
              {
                name: 'swap 的栈帧', kind: 'stack',
                cells: [
                  { id: 'x', label: 'x', type: 'int', value: '2', addr: '0x7ffd9c4a2b90', state: 'changed' },
                  { id: 'y', label: 'y', type: 'int', value: '1', addr: '0x7ffd9c4a2b94', state: 'changed' }
                ]
              }
            ]
          },
          {
            caption: 'swap 返回，它那两块内存被回收。结果：a、b 完全没变 —— 值传递的交换是【无效】的。',
            regions: [
              {
                name: 'main 的栈帧', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a', type: 'int', value: '1', addr: '0x7ffd9c4a2ba0' },
                  { id: 'b', label: 'b', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4' }
                ]
              }
            ]
          },
          {
            caption: '改用引用传递 swapRef(int& x, int& y)。x、y 不占新内存，它们是 a、b 的【别名】。',
            regions: [
              {
                name: 'main 的栈帧', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a  (x 就是它)', type: 'int', value: '1', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                  { id: 'b', label: 'b  (y 就是它)', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4', state: 'changed' }
                ]
              }
            ],
            note: '引用不产生新变量 —— x 和 y 只是 a 和 b 的另一个名字'
          },
          {
            caption: '交换 x、y，就是交换 a、b 本身。结果 a = 2、b = 1 —— 这次真的换过来了。',
            regions: [
              {
                name: 'main 的栈帧', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a  (x 就是它)', type: 'int', value: '2', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                  { id: 'b', label: 'b  (y 就是它)', type: 'int', value: '1', addr: '0x7ffd9c4a2ba4', state: 'changed' }
                ]
              }
            ]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'reference',
        title: '一句话区分',
        text: '**值传递**：把值复制一份给形参，形参是独立的新变量，改它不影响外面。\n**引用传递**：形参是实参的别名，**根本就是同一个变量**，改它就是改外面。'
      },
      notes: '请看这个内存图。值传递时，swap 的 x、y 是在新内存里放了 a、b 的副本，所以在里面交换完全影响不到 a 和 b。而引用传递时，x、y 不占新内存，它们就是 a、b 的别名，交换它们就是交换 a 和 b。这就是为什么加一个 & 符号，结果完全不同。'
    },

    /* ---------- 10. 两种传递的代码对比 ---------- */
    {
      type: 'code',
      eyebrow: '动手验证',
      title: '亲手跑一遍，看到差别',
      lead: '同一个交换逻辑，一个加 `&` 一个不加，结果完全不同。',
      points: [
        '`void swap(int a, int b)` —— 没加 `&`，交换的是副本',
        '`void swapRef(int& a, int& b)` —— 加了 `&`，交换的是原变量',
        '两个函数都叫 swap，但签名不同（这正是下一节要讲的**重载**）'
      ],
      code: {
        file: 'swap_compare.cpp',
        source: `#include <iostream>

// 值传递：交换的是副本，对外面没有影响
void swap(int a, int b) {
    int t = a; a = b; b = t;
    std::cout << "  函数内：a = " << a << "，b = " << b << std::endl;
}

// 引用传递：加一个 &，交换的就是原变量
void swapRef(int& a, int& b) {
    int t = a; a = b; b = t;
}

int main() {
    int x = 1, y = 2;

    std::cout << "调用前：        x = " << x << "，y = " << y << std::endl;

    swap(x, y);
    std::cout << "值传递之后：    x = " << x << "，y = " << y << std::endl;

    swapRef(x, y);
    std::cout << "引用传递之后：  x = " << x << "，y = " << y << std::endl;

    return 0;
}`,
        expectedOutput: `调用前：        x = 1，y = 2
  函数内：a = 2，b = 1
值传递之后：    x = 1，y = 2
引用传递之后：  x = 2，y = 1`,
        note: {
          kind: 'note',
          title: '怎么选',
          text: '**默认用值传递** —— 简单、安全，函数改不到你的变量。只有当你**确实需要修改实参**（如交换、把结果写回），或者传递大对象**想避免拷贝开销**时，才用引用。传递大的 `string`、`vector` 时，通常写成 `const T&`：既能避免拷贝，又不允许修改。'
        }
      },
      notes: '这段代码可以直接对比出结果。值传递调用之后 x、y 还是 1 和 2，引用传递之后变成了 2 和 1。请特别注意函数内那行输出——里面确实交换了，但外面没变，因为交换的是副本。'
    },

    /* ---------- 11. 分节 04+05 ---------- */
    {
      type: 'section',
      num: '04',
      title: '返回值与重载',
      sub: '函数的输出与多态形式',
      lead: '函数有输出才有用；重载让同名函数处理不同类型的输入。',
      notes: '函数不仅可以接收输入，还可以产生输出，这就是返回值。接下来我们还会学习两个 C++ 特有的实用特性：函数重载和默认参数。'
    },

    /* ---------- 12. return ---------- */
    {
      type: 'split',
      eyebrow: '返回值',
      title: 'return 的两个作用',
      lead: '它既能把结果交给调用者，也能用来提前结束函数。',
      points: [
        '**返回结果**：`return a + b;` 把值交给调用处',
        '**提前结束**：函数里遇到 `return` 就立即返回，后面的代码不再执行',
        '`return;` —— `void` 函数里可以直接返回，用来提前退出',
        '`return` 之后的代码永远不会执行（编译器一般会警告）'
      ],
      code: {
        file: 'return_demo.cpp',
        source: `#include <iostream>

// 作用一：返回计算结果
int square(int n) {
    return n * n;
}

// 作用二：提前结束函数
// 这个函数检查分数是否合法，不合法就立刻返回
bool isValidScore(int score) {
    if (score < 0) {
        std::cout << "  分数不能是负数，直接返回 false" << std::endl;
        return false;              // 提前结束，下面的代码不再执行
    }
    if (score > 100) {
        std::cout << "  分数不能超过 100，直接返回 false" << std::endl;
        return false;
    }
    std::cout << "  分数合法，继续检查通过" << std::endl;
    return true;                   // 走到这里说明前面都没返回
}

int main() {
    std::cout << "square(7) = " << square(7) << std::endl;

    // 注意写法：先调用、把结果存进变量，再打印。
    // 不要写成 cout << "结果 = " << isValidScore(85)，那样输出会交错。
    std::cout << "检查 85 分：" << std::endl;
    bool ok1 = isValidScore(85);
    std::cout << "  结果 = " << ok1 << std::endl;

    std::cout << "检查 -5 分：" << std::endl;
    bool ok2 = isValidScore(-5);
    std::cout << "  结果 = " << ok2 << std::endl;

    return 0;
}`,
        expectedOutput: `square(7) = 49
检查 85 分：
  分数合法，继续检查通过
  结果 = 1
检查 -5 分：
  分数不能是负数，直接返回 false
  结果 = 0`,
        note: {
          kind: 'trap',
          title: '别把带输出的函数写进 cout 链里',
          text: '如果写成 `std::cout << "结果 = " << isValidScore(85) << std::endl;`，输出会**交错**成 `结果 =   分数合法...` 这样的怪样子 —— 因为字面量和函数调用的求值顺序不直观，函数内部的打印会插到中间。**规则：函数若有自己的输出，就先调用它、把结果存进变量，再打印。**'
        }
      },
      notes: 'return 语句非常重要，它既可以把计算结果返回给调用者，也可以用来提前结束函数。看第二个函数，如果分数是负数，它立刻就返回了，后面两行代码根本不会执行。这种"提前返回"的写法能让代码更扁平、更好读。'
    },

    /* ---------- 13. 函数重载 ---------- */
    {
      type: 'split',
      eyebrow: 'C++ 特性 1',
      title: '函数重载：同名，不同参数',
      lead: '多个功能相似的函数可以共用同一个名字，编译器根据参数自动选择。',
      points: [
        '**函数名相同**，但参数列表不同（个数、类型、顺序）',
        '编译器根据实参**自动匹配**最合适的版本',
        '**返回值类型不同不算重载** —— 必须参数不同',
        '让调用者不必记住 `addInt`、`addDouble` 这类一堆名字'
      ],
      code: {
        file: 'overload.cpp',
        source: `#include <iostream>
#include <string>

// 三个同名函数，参数不同
int add(int a, int b) {
    std::cout << "  调用 add(int, int)" << std::endl;
    return a + b;
}

double add(double a, double b) {
    std::cout << "  调用 add(double, double)" << std::endl;
    return a + b;
}

std::string add(const std::string& a, const std::string& b) {
    std::cout << "  调用 add(string, string)" << std::endl;
    return a + b;
}

int main() {
    std::cout << add(3, 4) << std::endl;
    std::cout << add(1.5, 2.5) << std::endl;
    std::cout << add(std::string("hello "), std::string("world")) << std::endl;

    return 0;
}`,
        expectedOutput: `  调用 add(int, int)
7
  调用 add(double, double)
4
  调用 add(string, string)
hello world`,
        note: {
          kind: 'trap',
          title: '返回值类型不参与重载',
          text: '下面这样写是**错误的**：\n`int f(int a);`\n`double f(int a);`   ← 编译错误\n\n两个函数只有返回值不同，参数完全一样。编译器在调用时只看得到实参，无法区分该选哪个。**重载的判定依据只有参数列表。**'
        }
      },
      notes: '函数重载允许我们给多个功能相似的函数起相同的名字，只要它们的参数列表不同。这样做的好处是调用时不需要记住多个不同的函数名，编译器会自动根据传递的参数来选择正确的版本。注意返回值类型不同是不算重载的。'
    },

    /* ---------- 14. 默认参数 ---------- */
    {
      type: 'split',
      eyebrow: 'C++ 特性 2',
      title: '默认参数：可以省略的实参',
      lead: '给参数指定默认值，调用时可以省略它。',
      points: [
        '参数写成 `类型 名字 = 默认值`',
        '**默认参数必须放在参数列表最右边**，不能夹在中间',
        '省略的实参自动用默认值',
        '常用来做"多数情况用默认、少数情况才指定"的接口'
      ],
      code: {
        file: 'default_args.cpp',
        source: `#include <iostream>
#include <string>

// 后两个参数有默认值
void introduce(const std::string& name,
               int age = 18,
               const std::string& city = "北京") {
    std::cout << name << "，" << age << " 岁，来自 " << city << std::endl;
}

int main() {
    introduce("小明");                     // 两个都用默认值
    introduce("小红", 20);                 // 只覆盖 age
    introduce("小刚", 22, "上海");         // 三个都指定

    return 0;
}`,
        expectedOutput: `小明，18 岁，来自 北京
小红，20 岁，来自 北京
小刚，22 岁，来自 上海`,
        note: {
          kind: 'trap',
          title: '默认参数必须靠右放',
          text: '这样写是**错误的**：\n`void f(int a = 1, int b);`   ← 编译错误\n\n因为调用 `f(5)` 时，编译器无法判断 5 是给 a 还是给 b。规则很简单：**一旦某个参数有默认值，它右边所有参数都必须有默认值。**'
        }
      },
      notes: '默认参数允许我们在定义函数时为参数指定默认值。调用时如果不想为这个参数传值，就可以省略它，函数会自动使用默认值。注意默认参数必须放在参数列表的最右边，否则编译器没法判断你省略的是哪一个。'
    },

    /* ---------- 15. 分节 06 ---------- */
    {
      type: 'section',
      num: '05',
      title: '递归',
      sub: '函数调用自己',
      lead: '用"问题自己定义自己"的方式来解决问题，代码往往异常简洁。',
      notes: '现在，我们来挑战一个非常有趣但也有点难度的概念——递归。递归是一种函数调用自身的编程技巧，它能让某些复杂问题的解决方案变得异常简洁。'
    },

    /* ---------- 16. 递归调用栈【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '核心机制',
      title: '递归的调用栈：一层层压入，再一层层返回',
      lead: '每次调用自己，系统都会新开一块栈内存。理解这个"压栈—弹栈"过程，递归就不再神秘。',
      memory: {
        title: 'fact(3) 的调用栈变化',
        steps: [
          {
            caption: '调用 fact(3)。系统为它开一个栈帧，n = 3。它需要知道 2 的阶乘才能算出来，所以继续往下调。',
            regions: [
              { name: '调用栈（栈顶在上）', kind: 'stack', cells: [
                { id: 'f3', label: 'fact(3)  n = 3', type: '', value: '等待 fact(2)', addr: '', state: 'changed' }
              ]}
            ]
          },
          {
            caption: 'fact(3) 内部调用 fact(2)，【新开】一个栈帧压在它上面。原来的 fact(3) 还停在那里等着。',
            regions: [
              { name: '调用栈（栈顶在上）', kind: 'stack', cells: [
                { id: 'f2', label: 'fact(2)  n = 2', type: '', value: '等待 fact(1)', addr: '', state: 'changed' },
                { id: 'f3', label: 'fact(3)  n = 3', type: '', value: '等待 fact(2)', addr: '' }
              ]}
            ]
          },
          {
            caption: '再调用 fact(1)。栈已经有三个帧了。注意：这三层【互相独立】，各有各的 n。',
            regions: [
              { name: '调用栈（栈顶在上）', kind: 'stack', cells: [
                { id: 'f1', label: 'fact(1)  n = 1', type: '', value: '准备返回 1', addr: '', state: 'changed' },
                { id: 'f2', label: 'fact(2)  n = 2', type: '', value: '等待 fact(1)', addr: '' },
                { id: 'f3', label: 'fact(3)  n = 3', type: '', value: '等待 fact(2)', addr: '' }
              ]}
            ]
          },
          {
            caption: 'n = 1 命中【基线条件】，直接返回 1。它的栈帧被销毁，结果交回给 fact(2)。',
            regions: [
              { name: '调用栈（栈顶在上）', kind: 'stack', cells: [
                { id: 'f2', label: 'fact(2)  n = 2', type: '', value: '2 × 1 = 2', addr: '', state: 'changed' },
                { id: 'f3', label: 'fact(3)  n = 3', type: '', value: '等待 fact(2)', addr: '' }
              ]}
            ]
          },
          {
            caption: 'fact(2) 拿到 1，算出 2 × 1 = 2，返回给 fact(3)。它的栈帧也被销毁。',
            regions: [
              { name: '调用栈（栈顶在上）', kind: 'stack', cells: [
                { id: 'f3', label: 'fact(3)  n = 3', type: '', value: '3 × 2 = 6', addr: '', state: 'changed' }
              ]}
            ]
          },
          {
            caption: 'fact(3) 算出 3 × 2 = 6 并返回。栈清空，调用结束。整个过程是"先一路压到底，再一路弹回来"。',
            regions: [
              { name: '调用栈（栈顶在上）', kind: 'stack', cells: [
                { id: 'done', label: '调用完成', type: '', value: '结果 = 6', addr: '', state: 'changed' }
              ]}
            ]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'recursion',
        title: '递归必须有两个条件',
        text: '**① 基线条件**（什么时候停）：这里是 `n <= 1` 时返回 1。\n**② 递归条件**（怎么缩小规模）：`n * fact(n - 1)`，每次 n 都变小。\n\n少了基线条件 → 无限递归 → **栈溢出（stack overflow）**，程序直接崩溃。'
      },
      notes: '这个内存图展示了递归的全过程。每次调用 fact，系统都会在栈上开一块新内存。注意 fact(3)、fact(2)、fact(1) 是三个独立的栈帧，各有各的 n。先一路压到最深，碰到基线条件后，再一层层往回返回。这就是递归的执行方式。'
    },

    /* ---------- 17. 阶乘代码 ---------- */
    {
      type: 'split',
      eyebrow: '动手实现',
      title: '递归实现：阶乘',
      lead: '递归代码短得惊人，因为它直接把数学定义翻译成了代码。',
      points: [
        '数学定义：`n! = n × (n-1)!`，且 `0! = 1`',
        '**基线条件** `n <= 1` → 返回 1，这是"刹车"',
        '**递归调用** `n * fact(n - 1)` → 规模每次减 1',
        '代码几乎和数学公式一模一样，这就是递归的魅力'
      ],
      code: {
        file: 'factorial.cpp',
        source: `#include <iostream>

// 阶乘的递归实现
long long factorial(int n) {
    if (n <= 1) {           // 基线条件：什么时候停
        return 1;
    }
    return n * factorial(n - 1);   // 递归条件：规模减一
}

int main() {
    for (int i = 0; i <= 10; i++) {
        std::cout << i << "! = " << factorial(i) << std::endl;
    }

    return 0;
}`,
        expectedOutput: `0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
6! = 720
7! = 5040
8! = 40320
9! = 362880
10! = 3628800`,
        note: {
          kind: 'note',
          title: '为什么用 long long',
          text: '阶乘增长极快 —— 13! 就超过了 `int` 的范围，21! 连 `long long` 都装不下。这里用 `long long` 是为了能算到 20 左右。真要用更大的数，需要高精度库或大数算法。'
        }
      },
      notes: '递归的关键在于找到递归关系和基线条件。以阶乘为例，n 的阶乘等于 n 乘以 n-1 的阶乘，这就是递归条件。而 0 的阶乘等于 1，这是基线条件，它保证递归不会无限进行下去。注意返回值我用了 long long，因为阶乘长得很快。'
    },

    /* ---------- 18. 斐波那契 ---------- */
    {
      type: 'code',
      eyebrow: '经典例题',
      title: '斐波那契数列',
      lead: '它的定义本身就是递归的 —— 每个数是前两个数之和。',
      points: [
        '定义：`fib(0)=0`，`fib(1)=1`，`fib(n) = fib(n-1) + fib(n-2)`',
        '两个基线条件，因为递推关系里出现了 n-1 和 n-2',
        '写法极简洁，但**效率很差** —— 大量重复计算',
        '这正是"代码简洁"与"运行高效"需要权衡的典型例子'
      ],
      code: {
        file: 'fibonacci.cpp',
        source: `#include <iostream>

// 递归版：直观但低效
int fib(int n) {
    if (n <= 1) return n;              // 两个基线条件都靠这句覆盖
    return fib(n - 1) + fib(n - 2);
}

// 迭代版：不递归，从前往后一个个算
long long fibFast(int n) {
    if (n <= 1) return n;
    long long prev = 0, cur = 1;
    for (int i = 2; i <= n; i++) {
        long long next = prev + cur;
        prev = cur;
        cur = next;
    }
    return cur;
}

int main() {
    std::cout << "递归版前 12 项：";
    for (int i = 0; i < 12; i++) std::cout << fib(i) << " ";
    std::cout << std::endl;

    std::cout << "迭代版 fibFast(50) = " << fibFast(50) << std::endl;

    return 0;
}`,
        expectedOutput: `递归版前 12 项：0 1 1 2 3 5 8 13 21 34 55 89
迭代版 fibFast(50) = 12586269025`,
        note: {
          kind: 'trap',
          title: '递归版算 fib(50) 会跑到天荒地老',
          text: '递归版算 `fib(40)` 就要调用几亿次，`fib(50)` 更是天文数字（约 400 亿次调用）。原因是它把 `fib(35)` 这样的子问题**重复计算了无数遍**。迭代版算 `fib(50)` 几乎瞬间完成 —— 同样的问题，算法不同，效率差了几个数量级。'
        }
      },
      notes: '斐波那契数列的定义本身就是递归的。虽然这个递归实现的效率不高，但它非常直观地展示了递归的思想：一个问题可以分解为两个规模更小的同类问题。这里我同时给了迭代版本，算到第 50 项毫无压力。大家可以对比一下两者的差距。'
    },

    /* ---------- 19. 分节 07 ---------- */
    {
      type: 'section',
      num: '07',
      title: '作用域与生命周期',
      sub: '变量在哪里能被访问',
      lead: '变量不是在任何地方都能用的 —— 它有自己的"活动范围"和"寿命"。',
      notes: '最后，我们来讨论变量的两个重要属性：作用域和生命周期。它们决定了变量在哪里可以被访问，以及它能存在多久。'
    },

    /* ---------- 20. 局部与全局 ---------- */
    {
      type: 'split',
      eyebrow: '作用域',
      title: '局部变量 vs 全局变量',
      lead: '在函数里定义的叫局部变量，在所有函数外定义的叫全局变量。',
      points: [
        '**局部变量**：只在定义它的代码块内可见，出了花括号就失效',
        '**全局变量**：整个文件都能访问，生命周期贯穿程序始终',
        '未初始化的全局变量**自动为 0**，局部变量则是垃圾值',
        '局部变量会**遮蔽**同名的全局变量'
      ],
      code: {
        file: 'scope.cpp',
        source: `#include <iostream>

int global_count = 100;          // 全局变量：未初始化时自动为 0

void show() {
    int local_count = 5;         // 局部变量：只在 show 里存在
    std::cout << "  函数内 local_count = " << local_count << std::endl;
    std::cout << "  函数内看到的 global_count = " << global_count << std::endl;
}

int main() {
    show();

    std::cout << "函数外 global_count = " << global_count << std::endl;
    // std::cout << local_count;   // 这行会编译报错：local_count 在这里不存在

    int global_count = 200;      // 这个局部变量"遮蔽"了全局的那个
    std::cout << "遮蔽之后 global_count = " << global_count << std::endl;
    std::cout << "用 :: 访问真正的全局变量 = " << ::global_count << std::endl;

    return 0;
}`,
        expectedOutput: `  函数内 local_count = 5
  函数内看到的 global_count = 100
函数外 global_count = 100
遮蔽之后 global_count = 200
用 :: 访问真正的全局变量 = 100`,
        note: {
          kind: 'trap',
          title: '尽量别用全局变量',
          text: '全局变量看似方便，实际危害不小：**任何函数都能改它**，出了 bug 很难定位是哪里改的；名字还容易冲突。实践中应该优先用局部变量和参数传递。真正的工程代码里，全局变量少之又少。'
        }
      },
      notes: '根据定义位置的不同，变量可以分为局部变量和全局变量。局部变量的特点是"出了这个门就不认人"，只能在定义它的代码块里访问。全局变量则整个文件都能用。这里还演示了遮蔽现象——局部变量会盖住同名的全局变量，要用 :: 才能访问到真正的全局那个。'
    },

    /* ---------- 21. static ---------- */
    {
      type: 'split',
      eyebrow: '生命周期',
      title: 'static 局部变量：只初始化一次',
      lead: '它的作用域还是局部的，但**寿命**延长到了整个程序。',
      points: [
        '**只初始化一次** —— 即使函数被调用很多次',
        '函数返回后**值被保留**，下次调用接着用',
        '作用域仍限于该函数，外面访问不到',
        '常用来做计数器、缓存、单次初始化'
      ],
      code: {
        file: 'static_demo.cpp',
        source: `#include <iostream>

void counter() {
    int normal = 0;            // 普通局部变量：每次调用都重新来过
    static int persistent = 0; // 静态局部变量：只初始化一次

    normal++;
    persistent++;

    std::cout << "  普通变量 = " << normal
              << "，static 变量 = " << persistent << std::endl;
}

int main() {
    std::cout << "连续调用三次：" << std::endl;
    counter();
    counter();
    counter();

    return 0;
}`,
        expectedOutput: `连续调用三次：
  普通变量 = 1，static 变量 = 1
  普通变量 = 1，static 变量 = 2
  普通变量 = 1，static 变量 = 3`,
        note: {
          kind: 'note',
          title: '看输出的对比',
          text: '**普通变量**每次都打印 1 —— 每调用一次就重新创建、初始化为 0、加一、销毁。**static 变量**是 1、2、3 —— 它在第一次调用时创建并初始化为 0，之后一直存在，每次调用都接着上次的值继续。'
        }
      },
      notes: 'static 关键字是一个非常有用的修饰符。当它用来修饰局部变量时，可以让这个变量的生命周期延长到整个程序结束。看输出对比就很清楚：普通变量每次都是 1，static 变量则是 1、2、3 递增，说明它的值被保留下来了。'
    },

    /* ---------- 22. 常见陷阱汇总 ---------- */
    {
      type: 'cards',
      eyebrow: '避坑指南',
      title: '本章最容易踩的五个坑',
      cards: [
        {
          icon: 'alert',
          heading: '以为值传递能改实参',
          body: '函数里改了形参，外面没变。**要改实参必须用引用 `&`。** 这是本章最大的坑。'
        },
        {
          icon: 'alert',
          heading: '引用传递忘了写 &',
          body: '`void f(int a)` 和 `void f(int& a)` 差别巨大。少写一个符号，逻辑就完全不同。'
        },
        {
          icon: 'alert',
          heading: '递归缺基线条件',
          body: '没有"什么时候停"的判断，会无限递归，最终**栈溢出崩溃**。'
        },
        {
          icon: 'alert',
          heading: '默认参数没靠右',
          body: '`void f(int a = 1, int b);` 编译报错。有默认值的参数右边必须也都有默认值。'
        },
        {
          icon: 'alert',
          heading: 'return 后还有代码',
          body: '`return` 之后的语句永远执行不到，编译器会警告，但代码能编译。'
        },
        {
          icon: 'alert',
          heading: '滥用全局变量',
          body: '任何函数都能改它，出 bug 极难定位。优先用参数传递。'
        }
      ],
      notes: '这几个坑在本章都出现过。特别是前两个关于参数传递的，是初学者最容易混淆的地方。记住一句话：想改实参就用引用，不想改就用值传递。'
    },

    /* ---------- 23. 课后练习 ---------- */
    {
      type: 'cards',
      eyebrow: '动手练习',
      title: '课后练习',
      lead: '这几道题综合运用本章知识，建议都亲手写一遍。',
      cards: [
        {
          icon: 'target',
          heading: '① 判断素数（函数版）',
          body: '写一个 `bool isPrime(int n)`，返回 n 是否素数。\n再用它打印 1–100 之间的所有素数。'
        },
        {
          icon: 'target',
          heading: '② 求最大公约数',
          body: '分别用**循环**和**递归**两种方式实现 `int gcd(int a, int b)`。\n提示：递归式是 `gcd(a, b) = gcd(b, a % b)`，基线条件 `b == 0`。'
        },
        {
          icon: 'target',
          heading: '③ 用引用实现求最值',
          body: '写 `void minMax(int a[], int n, int& minVal, int& maxVal)`，\n通过**引用参数**把最小值和最大值"带回来"。体会引用的用途。'
        },
        {
          icon: 'target',
          heading: '④ 汉诺塔',
          body: '经典的递归问题：把 n 个盘子从 A 柱移到 C 柱。\n提示：先把上面 n-1 个移到 B，再移动最大的，最后把 n-1 个从 B 移到 C。'
        }
      ],
      note: {
        kind: 'note',
        title: '怎么练最有效',
        text: '**先自己写，卡住了再看答案。** 第 ③ 题特别值得做 —— 它展示了引用的一个典型用途：函数只能 `return` 一个值，但可以通过引用参数"带回"多个结果。'
      },
      notes: '这里有两组练习题，大家动手尝试一下。第三题用引用把两个结果带回来，这是引用参数最典型的用途。第四题汉诺塔是递归的经典题目，能写出来说明你对递归的理解到位了。'
    },

    /* ---------- 24. 结尾 ---------- */
    {
      type: 'end',
      icon: 'fn',
      title: '本章小结',
      lead: '函数是 C/C++ 编程的基石 —— 学会拆解问题，才能写出能维护的程序。',
      cards: [
        { icon: 'blocks', heading: '模块化', body: '把大问题拆成小函数，复用、易改、好分工' },
        { icon: 'reference', heading: '参数传递', body: '值传递传副本改不到外面，引用传递传别名能改原变量' },
        { icon: 'overload', heading: '重载与默认参数', body: '同名不同参数；默认值必须靠右放' },
        { icon: 'recursion', heading: '递归', body: '必须有基线条件，否则栈溢出；注意重复计算的代价' }
      ],
      notes: '第 4 章关于函数的内容就到这里。函数是 C/C++ 编程的基石，掌握好它至关重要。在下一章中，我们将学习如何使用数组和字符串来处理批量数据。感谢大家的观看，我们下节课再见！'
    }
  ];
})(window);
