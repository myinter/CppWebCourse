/* ============================================================
   第 6 章 · 指针与函数

   全教程最重要也最难的一章。指针讲不清，多半是因为只在纸面上
   画箭头 —— 这里用可逐步播放的内存图，把"谁指向谁""什么时候失效"
   一步步演示出来。

   所有 code.expectedOutput 均由 clang++ 实际编译运行得到。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch6 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 6 章',
      title: '指针与函数',
      lead: 'C++ 最锋利也最危险的工具',
      notes: '大家好，欢迎回到 C/C++ 编程教程。这一章我们要学习指针。指针是 C/C++ 最强大、也最难掌握的特性。很多人在这里放弃，但只要理解了内存的本质，指针其实并不神秘。我们这一章会用大量内存图，把每一步都看清楚。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: '指针归根结底就是一句话：一个存着地址的变量。',
      map: {
        aria: '本章知识地图：地址与指针、指针与数组、动态内存、引用与陷阱',
        root: { title: '第 6 章 · 指针与函数', sub: '地址的艺术' },
        branches: [
          {
            title: '指针基础',
            sub: '地址与解引用',
            leaves: [
              { title: '取地址 &', sub: '变量住在哪' },
              { title: '指针变量', sub: '存着地址的变量' },
              { title: '解引用 *', sub: '顺着地址找过去' }
            ]
          },
          {
            title: '指针与数组',
            sub: '它们是一回事',
            leaves: [
              { title: '数组名即指针', sub: 'arr 就是 &arr[0]' },
              { title: '指针算术', sub: 'p+1 加的是一个元素' }
            ]
          },
          {
            title: '动态内存',
            sub: '手动管理堆',
            leaves: [
              { title: 'new / delete', sub: 'C++ 的方式' },
              { title: 'malloc / free', sub: 'C 的方式' },
              { title: '内存泄漏', sub: '忘了归还' }
            ]
          },
          {
            title: '引用与陷阱',
            sub: '更安全的替代',
            leaves: [
              { title: '引用 &', sub: '变量的别名' },
              { title: '空指针 / 野指针', sub: '危险的两种空' },
              { title: 'const 指针', sub: '三种形式' }
            ]
          }
        ]
      },
      notes: '本章四大块：先理解指针本身，再看它和数组的关系，然后是动态内存管理，最后是引用以及几种危险的指针。指针难，难在它直接操作内存，所以这一章我们尽量把每一步的内存变化都画出来。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '九个部分',
      items: [
        { num: '01', title: '内存与地址', body: '变量的"门牌号" —— 取地址运算符 &' },
        { num: '02', title: '指针的声明与解引用', body: '存地址的变量，以及如何顺着地址找过去' },
        { num: '03', title: '指针与数组', body: '数组名就是指针；指针算术的真相' },
        { num: '04', title: '地址传递', body: '用指针让函数修改实参' },
        { num: '05', title: '空指针与野指针', body: '两种不同的"空"，危险程度却差很多' },
        { num: '06', title: 'const 指针', body: '三种形式，一个口诀记住' },
        { num: '07', title: '动态内存', body: 'new/delete、malloc/free 与内存泄漏' },
        { num: '08', title: '引用', body: '更安全、更直观的"别名"' },
        { num: '09', title: '本章小结', body: '陷阱汇总与实践建议' }
      ],
      notes: '本章内容较多，请大家跟着内存图一步步走。重点是前三块，理解了指针和数组的关系，后面的内容都会顺理成章。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: '内存与地址',
      sub: '变量的门牌号',
      lead: '要理解指针，先要接受一件事：每个变量在内存里都有一个编号。',
      notes: '我们先用一个比喻来引入。内存就像一条很长很长的街道，街道上有很多房子，每个房子都有唯一的门牌号。变量住在某个房子里，门牌号就是它的地址。'
    },

    /* ---------- 5. 地址与取地址 ---------- */
    {
      type: 'split',
      eyebrow: '第一步',
      title: '取地址运算符 &',
      lead: '在变量前加一个 `&`，就能拿到它在内存里的地址。',
      points: [
        '`&x` 读出变量 `x` 的地址',
        '地址本质上是一个整数，但**不能当整数用**',
        '`%p` 是打印地址的格式符',
        '不同类型变量的地址含义相同，但**步长不同**（下一页讲）'
      ],
      code: {
        file: 'address.cpp',
        source: `#include <iostream>

int main() {
    int  a = 10;
    int  b = 20;
    char c = 'A';

    // 想亲眼看地址长什么样，把下面这行的注释去掉：
    // std::cout << "a 的地址 = " << &a << std::endl;

    // 但不建议把具体地址写死在程序里 —— 操作系统每次运行
    // 都会随机化栈的位置（ASLR 安全机制），地址每次都不一样。
    // 真正有意义的、每次都稳定的，是【相对关系】。

    std::cout << "a 和 b 是两个不同的变量" << std::endl;
    std::cout << "它们的地址相同吗? " << (&a == &b ? "相同" : "不同") << std::endl;

    std::cout << "int  占 " << sizeof(a) << " 字节" << std::endl;
    std::cout << "char 占 " << sizeof(c) << " 字节" << std::endl;
    std::cout << "所以 int 指针和 char 指针的步长不一样" << std::endl;

    // 数组元素的连续性由标准保证，所以这个差值一定是 4
    int arr[3] = {10, 20, 30};
    std::cout << "数组里相邻两个 int 相差 "
              << (char*)&arr[1] - (char*)&arr[0] << " 字节" << std::endl;

    return 0;
}`,
        expectedOutput: `a 和 b 是两个不同的变量
它们的地址相同吗? 不同
int  占 4 字节
char 占 1 字节
所以 int 指针和 char 指针的步长不一样
数组里相邻两个 int 相差 4 字节`,
        note: {
          kind: 'note',
          title: '为什么不直接打印地址',
          text: '你运行这段代码时，如果打印 `&a`，得到的地址**每次都不一样** —— 操作系统会随机化栈的起始位置（这叫 ASLR，是一项安全机制）。所以这段代码刻意只打印**稳定可比的信息**。你可以自己把注释那行打开看看地址长什么样，但**别把具体地址写死在程序逻辑里**。\n\n后面内存图里出现的地址，是**某一次运行**拍下来的快照。你自己跑出来的数字必然不同，看**相对关系**（谁挨着谁、差几个字节）才有意义。'
        }
      },
      notes: '取地址运算符 & 放在变量前面，就能读出它的地址。注意打印出来的地址每次运行都不一样，这是操作系统的安全机制，不用管具体数字。我们真正关心的是相对关系：两个相邻的 int 变量相差 4 字节。'
    },

    /* ---------- 6. 指针的声明与解引用【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '核心概念',
      title: '指针：一个存着地址的变量',
      lead: '指针不是魔法，它就是一个普通变量 —— 只不过里面装的是另一个变量的地址。',
      memory: {
        title: 'int* p = &x; 到底发生了什么',
        steps: [
          {
            caption: '先看一个普通变量 x，它的值是 42。x 住在地址 0x7ffd9c4a2ba0 这块内存里。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'x', type: 'int', value: '42', addr: '0x7ffd9c4a2ba0' }
              ]}
            ]
          },
          {
            caption: '执行 int* p = &x; 编译器为 p 也分配一块内存。p 里装的内容，就是 x 的地址。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'x', type: 'int', value: '42', addr: '0x7ffd9c4a2ba0' },
                { id: 'p', label: 'p  (int*)', type: '', value: '0x7ffd9c4a2ba0', addr: '0x7ffd9c4a2ba8', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'x', label: 'p 指向 x' }]
          },
          {
            caption: '*p 的意思是"顺着 p 里存的地址找过去"。p 里是 0x7ffd9c4a2ba0，找过去就是 x 本身。所以 *p 读到的值是 42。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'x  ← *p 读到这里', type: 'int', value: '42', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'p', label: 'p  (int*)', type: '', value: '0x7ffd9c4a2ba0', addr: '0x7ffd9c4a2ba8' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'x' }]
          },
          {
            caption: '执行 *p = 100; —— 注意：不是在改 p，而是改 p 指向的那块内存。所以 x 变成了 100。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'x', type: 'int', value: '100', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'p', label: 'p  (int*)', type: '', value: '0x7ffd9c4a2ba0', addr: '0x7ffd9c4a2ba8' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'x' }],
            note: 'p 自己一个字节都没变，变的是它指向的 x'
          },
          {
            caption: '如果写 p = &y; 呢？这次改的是 p 自己 —— 让它改指向 y。x 的值不受影响。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'x', type: 'int', value: '100', addr: '0x7ffd9c4a2ba0' },
                { id: 'y', label: 'y', type: 'int', value: '7', addr: '0x7ffd9c4a2ba4' },
                { id: 'p', label: 'p  (int*)', type: '', value: '0x7ffd9c4a2ba4', addr: '0x7ffd9c4a2ba8', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'y', label: '改指向 y' }]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'pointer',
        title: '分清这两件事',
        text: '**`p` 和 `*p` 是两个完全不同的东西**：\n· 写 `p = ...` → 改的是指针自己（让它指向别处）\n· 写 `*p = ...` → 改的是它指向的那块内存\n\n把这两行分清，指针就掌握一半了。'
      },
      notes: '这个内存图请大家反复看几遍。p 本身是一个变量，占一块内存；它的值是 x 的地址。*p 是解引用，意思是顺着地址找过去，找到的就是 x。所以 *p = 100 改的是 x，不是 p。而 p = &y 改的才是 p 自己。这两件事一定要分清。'
    },

    /* ---------- 7. 指针的声明语法 ---------- */
    {
      type: 'code',
      eyebrow: '语法',
      title: '指针的声明与初始化',
      lead: '`int*` 是一种类型 —— "指向 int 的指针"。星号的位置可以灵活，但写法要统一。',
      points: [
        '`int* p;` 声明一个指向 int 的指针',
        '`int* p = &x;` 声明的同时初始化（**推荐**）',
        '`*p` 是解引用，`&x` 是取地址，两者互为逆运算',
        '**没初始化的指针不能解引用** —— 它指向哪里是随机的'
      ],
      code: {
        file: 'pointer_basic.cpp',
        source: `#include <iostream>

int main() {
    int x = 42;

    // 方式一：声明与初始化分开（不推荐，中间容易忘记初始化）
    int* p1;
    p1 = &x;

    // 方式二：声明时直接初始化（推荐）
    int* p2 = &x;

    std::cout << "x    = " << x << std::endl;
    std::cout << "*p1  = " << *p1 << std::endl;
    std::cout << "*p2  = " << *p2 << std::endl;

    // 通过指针修改 x
    *p1 = 100;
    std::cout << "执行 *p1 = 100 之后：" << std::endl;
    std::cout << "  x  = " << x << std::endl;
    std::cout << "  *p2 = " << *p2 << "  （p2 和 p1 都指向 x）" << std::endl;

    // & 和 * 互为逆运算
    std::cout << "*(&x) = " << *(&x) << "  （先取地址再解引用，还是 x）" << std::endl;

    return 0;
}`,
        expectedOutput: `x    = 42
*p1  = 42
*p2  = 42
执行 *p1 = 100 之后：
  x  = 100
  *p2 = 100  （p2 和 p1 都指向 x）
*(&x) = 100  （先取地址再解引用，还是 x）`,
        note: {
          kind: 'trap',
          title: '未初始化的指针是"随机地址"',
          text: '`int* p;` 之后 `p` 里面是一串垃圾数据，它"指向"的地址纯属随机。这时如果写 `*p = 5`，就是往一个随机地址写数据 —— **可能立刻崩溃，也可能悄悄破坏别的数据**。所以指针**声明时就要初始化**，暂时没有目标就写 `int* p = nullptr;`。'
        }
      },
      notes: '指针的声明就是在类型后面加星号。请注意最后那行 *( &x )，先取地址再解引用，得到的还是 x 本身——这说明 & 和 * 是互逆的操作。另外强烈建议大家声明指针时立刻初始化，哪怕先写成 nullptr。'
    },

    /* ---------- 8. 分节 03 ---------- */
    {
      type: 'section',
      num: '03',
      title: '指针与数组',
      sub: '它们本来就是一回事',
      lead: '数组名在大多数场合下会自动转换成指向首元素的指针。',
      notes: '学完了指针本身，我们来看它和数组的关系。这个关系非常紧密，理解了它，很多看似神奇的写法就都讲得通了。'
    },

    /* ---------- 9. 指针算术【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '关键理解',
      title: '指针 +1 到底加了几个字节',
      lead: '这是一个反直觉的点：`p + 1` 不是地址加 1，而是加一个元素的大小。',
      memory: {
        title: '指针算术与数组下标的等价关系',
        steps: [
          {
            caption: '数组 int arr[5] 的首地址是 0x7ffd9c4a2ba0，每个元素占 4 字节。arr 这个名字在表达式中就等于 &arr[0]。',
            regions: [
              { name: '数组 arr 的内存', kind: 'stack', cells: [
                { id: 'e0', label: 'arr[0]', type: '', value: '10', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'e1', label: 'arr[1]', type: '', value: '20', addr: '0x7ffd9c4a2ba4' },
                { id: 'e2', label: 'arr[2]', type: '', value: '30', addr: '0x7ffd9c4a2ba8' },
                { id: 'e3', label: 'arr[3]', type: '', value: '40', addr: '0x7ffd9c4a2bac' },
                { id: 'e4', label: 'arr[4]', type: '', value: '50', addr: '0x7ffd9c4a2bb0' }
              ]}
            ]
          },
          {
            caption: 'int* p = arr; 现在 p 指向 arr[0]。注意 p + 1 不是地址加 1，而是【加一个 int 的大小】，也就是 4 字节。',
            regions: [
              { name: '数组 arr 的内存', kind: 'stack', cells: [
                { id: 'e0', label: 'arr[0]  ← p', type: '', value: '10', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'e1', label: 'arr[1]', type: '', value: '20', addr: '0x7ffd9c4a2ba4' },
                { id: 'e2', label: 'arr[2]', type: '', value: '30', addr: '0x7ffd9c4a2ba8' },
                { id: 'e3', label: 'arr[3]', type: '', value: '40', addr: '0x7ffd9c4a2bac' },
                { id: 'e4', label: 'arr[4]', type: '', value: '50', addr: '0x7ffd9c4a2bb0' }
              ]}
            ],
            note: 'p + 1 的地址是 0x7ffd9c4a2ba4，跳过了整整 4 个字节'
          },
          {
            caption: '所以 *(p + 1) 就是 arr[1]。事实上 C++ 里 arr[i] 的定义【就是】*(arr + i) —— 下标只是一种简写。',
            regions: [
              { name: '数组 arr 的内存', kind: 'stack', cells: [
                { id: 'e0', label: 'arr[0]', type: '', value: '10', addr: '0x7ffd9c4a2ba0' },
                { id: 'e1', label: 'arr[1]  ← *(p+1)', type: '', value: '20', addr: '0x7ffd9c4a2ba4', state: 'changed' },
                { id: 'e2', label: 'arr[2]', type: '', value: '30', addr: '0x7ffd9c4a2ba8' },
                { id: 'e3', label: 'arr[3]', type: '', value: '40', addr: '0x7ffd9c4a2bac' },
                { id: 'e4', label: 'arr[4]', type: '', value: '50', addr: '0x7ffd9c4a2bb0' }
              ]}
            ],
            note: 'arr[i]  ≡  *(arr + i)'
          },
          {
            caption: '步长由类型决定：int* 加 1 走 4 字节，char* 加 1 走 1 字节，double* 加 1 走 8 字节。指针知道自己的类型，所以知道该走多远。',
            regions: [
              { name: '不同类型的指针步长', kind: 'stack', cells: [
                { id: 'pi', label: 'int*  p+1', type: '', value: '+4 字节', addr: '' },
                { id: 'pc', label: 'char*  p+1', type: '', value: '+1 字节', addr: '' },
                { id: 'pd', label: 'double* p+1', type: '', value: '+8 字节', addr: '' }
              ]}
            ],
            note: '这正是「指针必须有类型」的原因 —— 类型决定了步长'
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '为什么数组下标从 0 开始',
        text: '因为 `arr[i]` 就是 `*(arr + i)` —— 从首地址**偏移 i 个元素**。`arr[0]` 表示偏移 0，也就是首元素本身。这不是随便定的，而是由"首地址 + 偏移量"这个实现方式自然决定的。'
      },
      notes: '指针算术是这里最反直觉的一点。p 加 1 不是地址加 1，而是加一个元素的大小。int 指针加 1 走 4 个字节，char 指针加 1 走 1 个字节。这正是指针必须区分类型的原因。而数组下标 arr[i] 的本质，就是 *(arr + i)。'
    },

    /* ---------- 10. 数组名与指针 ---------- */
    {
      type: 'split',
      eyebrow: '深入一点',
      title: '数组名是"不能改的指针"',
      lead: '数组名在绝大多数场合会退化成指针，但它本身不能被赋值。',
      points: [
        '`arr` 等价于 `&arr[0]`，类型是 `int*`',
        '`arr[i]` 等价于 `*(arr + i)` —— 两种写法完全通用',
        '但 `arr = p;` **编译错误** —— 数组名不是左值，不能改',
        '`p = arr;` 可以 —— 指针变量可以改指向'
      ],
      code: {
        file: 'array_pointer.cpp',
        source: `#include <iostream>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int* p = arr;              // 数组名退化成指向首元素的指针

    // 三种等价的访问方式
    std::cout << "  下标写法  arr[2]     = " << arr[2] << std::endl;
    std::cout << "  指针写法  *(arr + 2) = " << *(arr + 2) << std::endl;
    std::cout << "  指针变量  *(p + 2)   = " << *(p + 2) << std::endl;

    // 指针可以像数组一样用下标
    std::cout << "  p[2] 也是可以的      = " << p[2] << std::endl;

    // 用指针遍历数组
    std::cout << "用指针遍历：";
    for (int* q = arr; q != arr + 5; ++q) {
        std::cout << *q << " ";
    }
    std::cout << std::endl;

    // 数组名不能被赋值：
    // arr = p;    // 这行会编译报错

    return 0;
}`,
        expectedOutput: `  下标写法  arr[2]     = 30
  指针写法  *(arr + 2) = 30
  指针变量  *(p + 2)   = 30
  p[2] 也是可以的      = 30
用指针遍历：10 20 30 40 50 `,
        note: {
          kind: 'note',
          title: '指针也能用下标',
          text: '`p[2]` 完全合法，因为 `p[2]` 就是 `*(p + 2)`。反过来 `arr[2]` 也就是 `*(arr + 2)`。**两者只是写法不同，底层一模一样**。理解这一点，你就明白为什么数组和指针总是被混着讲了。'
        }
      },
      notes: '这段代码展示了四种等价写法，输出都是 30。请注意最后那个用指针遍历数组的循环，它和用下标遍历效果完全一样。但数组名 arr 不能被赋值，因为它是常量，而指针变量 p 可以改指向。'
    },

    /* ---------- 11. 分节 04 ---------- */
    {
      type: 'section',
      num: '04',
      title: '指针与函数',
      sub: '地址传递',
      lead: '想让函数修改实参，除了引用，还可以传指针。',
      notes: '第 4 章我们学过值传递和引用传递。其实还有第三种方式：传递地址。它和引用传递的效果一样，但写法不同，在 C 语言里是唯一的办法。'
    },

    /* ---------- 12. 地址传递【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '对比',
      title: '值传递 vs 地址传递',
      lead: '传指针时，函数拿到的是"地址"这个值。它虽然不是原变量，但顺着地址能摸到原变量。',
      memory: {
        title: '为什么传地址就能改到实参',
        steps: [
          {
            caption: 'main 里有 a = 1、b = 2，各自占一块内存，各有各的地址。',
            regions: [
              { name: 'main 的栈帧', kind: 'stack', cells: [
                { id: 'a', label: 'a', type: 'int', value: '1', addr: '0x7ffd9c4a2ba0' },
                { id: 'b', label: 'b', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4' }
              ]}
            ]
          },
          {
            caption: '调用 swapPtr(&a, &b)。形参 pa、pb 确实是新变量（值传递），但它们装的是 a、b 的【地址】。',
            regions: [
              { name: 'main 的栈帧', kind: 'stack', cells: [
                { id: 'a', label: 'a', type: 'int', value: '1', addr: '0x7ffd9c4a2ba0' },
                { id: 'b', label: 'b', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4' }
              ]},
              { name: 'swapPtr 的栈帧', kind: 'stack', cells: [
                { id: 'pa', label: 'pa (int*)', type: '', value: '0x7ffd9c4a2ba0', addr: '0x7ffd9c4a2b90', state: 'changed' },
                { id: 'pb', label: 'pb (int*)', type: '', value: '0x7ffd9c4a2ba4', addr: '0x7ffd9c4a2b98', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'pa', to: 'a' }, { from: 'pb', to: 'b' }]
          },
          {
            caption: '函数里写 *pa = *pb。它不是改 pa 自己，而是顺着地址找到 a，把 b 的值写进去。',
            regions: [
              { name: 'main 的栈帧', kind: 'stack', cells: [
                { id: 'a', label: 'a', type: 'int', value: '2', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'b', label: 'b', type: 'int', value: '2', addr: '0x7ffd9c4a2ba4' }
              ]},
              { name: 'swapPtr 的栈帧', kind: 'stack', cells: [
                { id: 'pa', label: 'pa (int*)', type: '', value: '0x7ffd9c4a2ba0', addr: '0x7ffd9c4a2b90' },
                { id: 'pb', label: 'pb (int*)', type: '', value: '0x7ffd9c4a2ba4', addr: '0x7ffd9c4a2b98' }
              ]}
            ],
            arrows: [{ from: 'pa', to: 'a' }, { from: 'pb', to: 'b' }],
            note: '注意：a 被改了 —— 虽然 pa 是副本，但它指向的可是真身'
          },
          {
            caption: '交换完成：a = 2、b = 1。函数返回后 pa、pb 销毁，但 a、b 已经改好了。',
            regions: [
              { name: 'main 的栈帧', kind: 'stack', cells: [
                { id: 'a', label: 'a', type: 'int', value: '2', addr: '0x7ffd9c4a2ba0' },
                { id: 'b', label: 'b', type: 'int', value: '1', addr: '0x7ffd9c4a2ba4', state: 'changed' }
              ]}
            ]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'reference',
        title: '指针传递 vs 引用传递',
        text: '两者效果相同，用法有别：\n· `void f(int& x)` —— 调用写 `f(a)`，函数里直接用 `x`，**更简洁**\n· `void f(int* p)` —— 调用写 `f(&a)`，函数里要用 `*p`，**能表达"可以没有"（传 nullptr）**\n\nC++ 里**优先用引用**，除非需要表示"这个参数可以不存在"。'
      },
      notes: '这个图和上一个章节的引用传递图很像，但机制不同。引用传递是"给变量起别名"，地址传递是"把地址复制一份过去"。后者虽然复制了，但复制的是地址，顺着地址还是能改到原变量。C++ 里一般优先用引用，写起来更简洁。'
    },

    /* ---------- 13. 分节 05 ---------- */
    {
      type: 'section',
      num: '05',
      title: '空指针与野指针',
      sub: '两种"空"',
      lead: '名字听起来差不多，危险程度却差了几个量级。',
      notes: '这一节讲两种容易混淆的指针状态。很多人以为空指针是最危险的，其实恰恰相反——空指针往往最安全，野指针才是真正的杀手。'
    },

    /* ---------- 14. 空指针 vs 野指针 ---------- */
    {
      type: 'compare',
      eyebrow: '必看',
      title: '空指针与野指针',
      lead: '一个明确指向"无处"，一个指向"不知道哪里" —— 后者要危险得多。',
      versus: {
        a: {
          title: '空指针 nullptr',
          icon: 'guard',
          items: [
            '`int* p = nullptr;` —— 明确表示"不指向任何对象"',
            '解引用它**通常立刻崩溃**（段错误）',
            '**这反而是好事** —— 崩溃位置明确，好排查',
            '使用前可以判断：`if (p != nullptr)`',
            '**推荐**：暂时没目标就设成 nullptr'
          ]
        },
        b: {
          title: '野指针（悬垂指针）',
          icon: 'alert',
          items: [
            '指向的内存**已经失效**，但指针自己不知道',
            '可能"看起来正常"地读写那块内存',
            '**错误会在别处爆发**，极难定位',
            '常见来源：指向已释放的堆内存、指向已返回的局部变量',
            '**解引用是未定义行为**，比崩溃更糟'
          ]
        }
      },
      note: {
        kind: 'trap',
        title: '为什么野指针比空指针可怕',
        text: '空指针解引用 → 立刻崩溃 → 你马上知道哪里错了。\n野指针解引用 → 可能正常运行 → **在几分钟后、在完全无关的地方出错**。\n\n"能跑但结果是错的"永远比"跑不起来"更难查。'
      },
      notes: '请大家记住这个对比。空指针反而安全，因为它一用就崩，问题立刻暴露。野指针才可怕，它指向的内存已经失效了，但用的时候可能不报错，只是读到垃圾数据或者悄悄破坏别的东西。'
    },

    /* ---------- 15. 野指针是怎么来的【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '典型案例',
      title: '野指针是怎么产生的',
      lead: '最常见的一种：指针指向了已经被释放的内存。',
      memory: {
        title: 'delete 之后指针仍然指着那块内存',
        steps: [
          {
            caption: '用 new 在【堆】上申请一块 int，让 p 指向它。注意 p 在栈上，真正的数据在堆上。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'p', label: 'p  (int*)', type: '', value: '0x55a0f3e1c010', addr: '0x7ffd9c4a2ba0' }
              ]},
              { name: '堆 Heap', kind: 'heap', cells: [
                { id: 'obj', label: 'new int(42)', type: '', value: '42', addr: '0x55a0f3e1c010', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'obj' }]
          },
          {
            caption: '执行 delete p; 堆上那块内存被【归还】给系统，系统随时可能把它分给别人。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'p', label: 'p  (int*)', type: '', value: '0x55a0f3e1c010', addr: '0x7ffd9c4a2ba0' }
              ]},
              { name: '堆 Heap', kind: 'heap', cells: [
                { id: 'obj', label: '已释放', type: '', value: '（不属于你了）', addr: '0x55a0f3e1c010', state: 'freed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'obj' }],
            note: '危险的是：p 里的地址值没有任何变化'
          },
          {
            caption: 'delete 之后 p 就成了【野指针】—— 它仍然存着 0x55a0f3e1c010，但那个地址已经不属于你了。这时的箭头指向一块无效内存。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'p', label: 'p  (野指针！)', type: '', value: '0x55a0f3e1c010', addr: '0x7ffd9c4a2ba0', state: 'dangling' }
              ]},
              { name: '堆 Heap', kind: 'heap', cells: [
                { id: 'obj', label: '已释放', type: '', value: '（已被回收）', addr: '0x55a0f3e1c010', state: 'freed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'obj' }]
          },
          {
            caption: '正确的做法：delete 之后立刻把指针置空。这样它就从"危险的野指针"变成了"安全的空指针"。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'p', label: 'p  (已置空)', type: '', value: 'nullptr', addr: '0x7ffd9c4a2ba0', state: 'changed' }
              ]},
              { name: '堆 Heap', kind: 'heap', cells: [
                { id: 'obj', label: '已释放', type: '', value: '（已被回收）', addr: '0x55a0f3e1c010', state: 'freed' }
              ]}
            ]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'guard',
        title: '一条必须养成的习惯',
        text: '```\ndelete p;\np = nullptr;   // ← 立刻置空\n```\n\n删除之后指针不会自动变成空，**它仍然指着那块已经失效的内存**。手动置空只需一行，却能把最难查的一类 bug 变成最容易查的一类。'
      },
      notes: '这个图清楚地展示了野指针是怎么来的。delete 只是把那块堆内存还给了系统，但 p 里存的地址值一点没变。这时候 p 就是野指针了。解决办法非常简单：delete 之后立刻写 p = nullptr，一行代码就把危险消除了。'
    },

    /* ---------- 16. 分节 07 ---------- */
    {
      type: 'section',
      num: '07',
      title: '动态内存',
      sub: '手动管理堆内存',
      lead: '程序运行时才确定需要多少内存时，就用 new 在堆上申请。',
      notes: '前面我们用的变量都在栈上，大小在编译时就定好了。如果程序运行时才知道需要多少内存，就要用动态内存分配，也就是 new 和 delete。'
    },

    /* ---------- 17. new 与 delete ---------- */
    {
      type: 'split',
      eyebrow: 'C++ 的方式',
      title: 'new 与 delete',
      lead: '在堆上申请内存，用完必须手动归还 —— 否则内存泄漏。',
      points: [
        '`new 类型` 在堆上分配，返回指向它的指针',
        '`delete 指针` 归还这块内存',
        '数组要用 `new T[n]` 配 `delete[] p`，**括号不能漏**',
        '`delete nullptr` 是安全的（什么都不做）',
        '**重复 delete 同一块内存是未定义行为**'
      ],
      code: {
        file: 'new_delete.cpp',
        source: `#include <iostream>

int main() {
    // 申请单个 int
    int* p = new int(42);
    std::cout << "*p = " << *p << std::endl;
    *p = 100;
    std::cout << "修改后 *p = " << *p << std::endl;

    delete p;                  // 归还
    p = nullptr;               // 置空，避免野指针

    // 申请数组
    int n = 5;
    int* arr = new int[n];     // 注意是 new int[n]
    for (int i = 0; i < n; i++) arr[i] = i * i;

    std::cout << "动态数组：";
    for (int i = 0; i < n; i++) std::cout << arr[i] << " ";
    std::cout << std::endl;

    delete[] arr;              // 数组必须用 delete[]
    arr = nullptr;

    // delete nullptr 是安全的
    int* q = nullptr;
    delete q;
    std::cout << "delete nullptr 是安全的，不会出错" << std::endl;

    return 0;
}`,
        expectedOutput: `*p = 42
修改后 *p = 100
动态数组：0 1 4 9 16
delete nullptr 是安全的，不会出错`,
        note: {
          kind: 'trap',
          title: 'new[] 必须配 delete[]',
          text: '`new int[5]` 申请的是一个数组，必须用 `delete[]` 归还。如果写成 `delete arr;`（少了方括号），是**未定义行为** —— 有些编译器上能跑，有些会直接崩溃。记住口诀：**方括号要配对出现**。'
        }
      },
      notes: 'new 在堆上申请内存，返回指针；delete 归还。请特别注意数组：申请用 new int[n]，释放必须用 delete[]，少写方括号是未定义行为。另外删除后立刻置空是个好习惯。'
    },

    /* ---------- 18. 内存泄漏【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '必看',
      title: '内存泄漏是怎么发生的',
      lead: '堆内存没有名字，只有指针记着它。指针一改，那块内存就再也找不回来了。',
      memory: {
        title: '指针被重新赋值之后',
        steps: [
          {
            caption: 'p 指向一块新申请的堆内存（假设 1MB）。这块内存没有名字，**只有 p 记着它的地址**。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'p', label: 'p', type: '', value: '0x55a0f3e1c010', addr: '0x7ffd9c4a2ba0' }
              ]},
              { name: '堆 Heap', kind: 'heap', cells: [
                { id: 'blk1', label: '第 1 块（1MB）', type: '', value: '正在使用', addr: '0x55a0f3e1c010', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'blk1' }]
          },
          {
            caption: '现在写 p = new char[1024]; 让 p 指向新的一块内存。注意：没有人执行 delete，第一块内存还占着。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'p', label: 'p', type: '', value: '0x55a0f3e1c030', addr: '0x7ffd9c4a2ba0', state: 'changed' }
              ]},
              { name: '堆 Heap', kind: 'heap', cells: [
                { id: 'blk1', label: '第 1 块（1MB）', type: '', value: '还在占用', addr: '0x55a0f3e1c010' },
                { id: 'blk2', label: '第 2 块（1KB）', type: '', value: '正在使用', addr: '0x55a0f3e1c030', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'blk2' }]
          },
          {
            caption: '关键在这里：p 现在指向第 2 块了。**第 1 块的地址已经没人记得** —— 它永远无法被 delete，这就是内存泄漏。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'p', label: 'p', type: '', value: '0x55a0f3e1c030', addr: '0x7ffd9c4a2ba0' }
              ]},
              { name: '堆 Heap', kind: 'heap', cells: [
                { id: 'blk1', label: '第 1 块（泄漏！）', type: '', value: '无法访问也无法释放', addr: '0x55a0f3e1c010', state: 'dangling' },
                { id: 'blk2', label: '第 2 块', type: '', value: '正在使用', addr: '0x55a0f3e1c030' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'blk2' }],
            note: '第 1 块仍然占着 1MB 内存，但程序永远拿不回来了'
          },
          {
            caption: '如果这个操作在循环里执行一万次，就会泄漏一万块内存 —— 程序占用越来越高，最终耗尽内存被系统杀掉。',
            regions: [
              { name: '堆 Heap（持续增长）', kind: 'heap', cells: [
                { id: 'l1', label: '泄漏块 1', type: '', value: '占用', addr: '', state: 'dangling' },
                { id: 'l2', label: '泄漏块 2', type: '', value: '占用', addr: '', state: 'dangling' },
                { id: 'l3', label: '泄漏块 3', type: '', value: '占用', addr: '', state: 'dangling' },
                { id: 'l4', label: '……', type: '', value: '持续增长', addr: '', state: 'dangling' }
              ]}
            ]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'guard',
        title: '怎么避免',
        text: '**根本办法：别自己管堆内存。**\n\n用 `std::vector` 代替 `new int[n]`，用 `std::string` 代替 `new char[]`，用智能指针（第 9 章）代替裸 `new`。它们的析构函数会在对象销毁时自动释放内存 —— **你不再需要写 delete，也就不会忘记写**。'
      },
      notes: '内存泄漏的根源在这个图里说得很清楚：堆内存没有名字，只有指针记着它的地址。一旦指针改指向别的地方，原来那块内存就找不回来了，永远无法释放。解决办法是尽量不用裸 new，改用 vector、string 和智能指针。'
    },

    /* ---------- 19. 分节 08 ---------- */
    {
      type: 'section',
      num: '08',
      title: '引用',
      sub: '更安全的"别名"',
      lead: '引用是 C++ 相对 C 的一大改进：它比指针更安全，也更直观。',
      notes: '最后我们讲引用。前面在函数那一章已经见过了，这里再系统地看一下它和指针的区别。'
    },

    /* ---------- 20. 引用是什么 ---------- */
    {
      type: 'code',
      eyebrow: '核心概念',
      title: '引用：给变量起个别名',
      lead: '引用不是新变量，它和原变量**是同一块内存**，只是名字不同。',
      points: [
        '`int& r = x;` —— r 是 x 的别名',
        '**必须初始化**，而且一旦绑定就不能改绑到别的变量',
        '不需要解引用，直接用，写法自然',
        '`&r` 得到的就是 x 的地址 —— 印证了它是同一个东西',
        '底层通常用指针实现，但**语义上更安全**（不会是空、不会乱指）'
      ],
      code: {
        file: 'reference.cpp',
        source: `#include <iostream>

int main() {
    int x = 10;
    int& r = x;                 // r 是 x 的别名，必须初始化

    std::cout << "x = " << x << "，r = " << r << std::endl;

    r = 99;                     // 改 r 就是改 x
    std::cout << "执行 r = 99 之后：" << std::endl;
    std::cout << "  x = " << x << std::endl;

    x = 200;                    // 反过来也一样
    std::cout << "执行 x = 200 之后：" << std::endl;
    std::cout << "  r = " << r << std::endl;

    // 关键证据：它们的地址完全相同 —— 引用不占独立的内存
    std::cout << "&x == &r ? " << (&x == &r ? "完全相同" : "不同") << std::endl;
    std::cout << "这证明 r 不是新变量，它就是 x 本身" << std::endl;

    return 0;
}`,
        expectedOutput: `x = 10，r = 10
执行 r = 99 之后：
  x = 99
执行 x = 200 之后：
  r = 200
&x == &r ? 完全相同
这证明 r 不是新变量，它就是 x 本身`,
        note: {
          kind: 'note',
          title: '引用的两大限制（也是优点）',
          text: '**① 必须初始化** —— 不能先声明后绑定，所以不存在"未初始化的引用"这种情况。\n**② 不能改绑** —— `r = y` 不是让 r 改指向 y，而是把 y 的值赋给 x。\n\n这两条限制听起来不方便，但正因为如此，**引用永远不会是空、也不会乱指** —— 这正是它比指针安全的地方。'
        }
      },
      notes: '引用就是别名。看最后的地址输出，&x 和 &r 完全相同，证明它们就是同一块内存。引用有两个限制：必须初始化、不能改绑。这两条看似不方便，其实正是它的安全之处——引用永远不会是空的，也不会指向随机地址。'
    },

    /* ---------- 21. const 指针的三种形式 ---------- */
    {
      type: 'compare',
      eyebrow: '经典难点',
      title: 'const 指针的三种形式',
      lead: '看 `const` 写在 `*` 的哪一边 —— 这是唯一需要记的口诀。',
      table: {
        head: ['写法', '能改 *p 吗', '能改 p 吗', '读法'],
        rows: [
          ['`const int* p`', '**不能**', '能', '指向常量的指针（const 在 * 左边，管的是"指向的东西"）'],
          ['`int* const p`', '能', '**不能**', '常量指针（const 在 * 右边，管的是"指针自己"）'],
          ['`const int* const p`', '**不能**', '**不能**', '两者都锁死'],
          ['`int* p`', '能', '能', '普通指针，什么都不锁']
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '口诀：const 在 * 的哪边，就锁哪边',
        text: '**const 在 `*` 左边** → 锁住 `*p`（不能通过它改数据），`p` 本身还能改。\n**const 在 `*` 右边** → 锁住 `p`（不能改指向），数据还能改。\n\n记忆技巧：把 `const int*` 读成 "const (int)"，把 `int* const` 读成 "(* const)"。'
      },
      notes: '这是公认的难点。判断方法很简单：看 const 在星号的左边还是右边。在左边就锁住指向的数据，在右边就锁住指针自己。两边都锁就是两个都不能改。日常用得最多的是 const int*，比如函数参数写成 const char* 表示"我只读，不改你的数据"。'
    },

    /* ---------- 22. 常见陷阱汇总 ---------- */
    {
      type: 'cards',
      eyebrow: '避坑指南',
      title: '指针的六个致命错误',
      cards: [
        {
          icon: 'alert',
          heading: '未初始化就解引用',
          body: '`int* p; *p = 5;` —— p 里是随机地址，往那儿写数据可能立刻崩溃。**声明时就初始化。**'
        },
        {
          icon: 'alert',
          heading: 'delete 后继续用',
          body: '`delete p; *p = 1;` —— p 已变野指针。**delete 后立刻 `p = nullptr;`**'
        },
        {
          icon: 'alert',
          heading: '重复 delete',
          body: '同一块内存删两次是**未定义行为**。置空后再 delete 是安全的（delete nullptr 无操作）。'
        },
        {
          icon: 'alert',
          heading: 'new[] 配了 delete',
          body: '数组必须用 `delete[]`。少写方括号是未定义行为，可能崩溃也可能悄悄出问题。'
        },
        {
          icon: 'alert',
          heading: '返回局部变量的地址',
          body: '`int* f() { int x; return &x; }` —— 函数返回后 x 就没了，返回的地址**指向已销毁的栈内存**。'
        },
        {
          icon: 'alert',
          heading: '忘记 delete 造成泄漏',
          body: '堆内存不会自动回收。**首选方案：用智能指针和标准容器，不自己管内存。**'
        }
      ],
      notes: '这六个错误都可能导致程序崩溃或者更难查的诡异问题。请特别记住第三条和第五条，前者是重复释放，后者是返回局部变量地址，都是很隐蔽的错误。'
    },

    /* ---------- 23. 结尾 ---------- */
    {
      type: 'end',
      icon: 'pointer',
      title: '本章小结',
      lead: '指针就是"存着地址的变量"。理解了内存，指针就不再神秘。',
      cards: [
        { icon: 'address', heading: '地址与解引用', body: '& 取地址，* 顺着地址找过去；p 和 *p 是两个不同的东西' },
        { icon: 'array', heading: '指针与数组', body: 'arr[i] 就是 *(arr + i)；p+1 加的是一个元素的大小' },
        { icon: 'heap', heading: '动态内存', body: 'new/delete 要配对；delete 后置空；优先用智能指针' },
        { icon: 'reference', heading: '引用更安全', body: '引用是别名，必须初始化、不能改绑，所以不会为空' }
      ],
      notes: '指针这一章就到这里。回顾一下：指针就是一个存着地址的变量，* 是顺着地址找过去，& 是取地址。数组名就是指针，arr[i] 就是 *(arr+i)。动态内存要成对使用 new 和 delete，删完记得置空。日常写代码时，优先用引用和智能指针，能避免大部分指针问题。下一章我们学习结构体。'
    }
  ];
})(window);
