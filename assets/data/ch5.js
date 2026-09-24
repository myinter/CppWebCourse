/* ============================================================
   第 5 章 · 数组与字符串

   内存可视化用在这里：
   - 一维数组的连续内存布局（数组名为什么能当指针用）
   - 二维数组在内存里其实是一维的（行优先）
   - 越界访问会踩到相邻变量

   所有 code.expectedOutput 均由 clang++ 实际编译运行得到。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch5 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 5 章',
      title: '数组与字符串',
      lead: '成批处理数据 · 从"一个个变量"到"一排储物柜"',
      notes: '大家好，欢迎回到 C/C++ 编程教程。前面我们处理的都是单个数据，但现实中经常要处理一批数据，比如一个班 50 个学生的成绩。如果一个一个定义变量，那要写 50 行。这一章我们就来解决这个问题。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: '数组解决"一批同类型数据"，字符串则是字符的数组。',
      map: {
        aria: '本章知识地图：一维数组、二维数组、数组越界、C 风格字符串与 std::string',
        root: { title: '第 5 章 · 数组与字符串', sub: '成批处理数据' },
        branches: [
          {
            title: '一维数组',
            sub: '一排连续的格子',
            leaves: [
              { title: '声明与初始化', sub: 'int a[5]' },
              { title: '内存布局', sub: '元素连续存放' },
              { title: '访问与遍历', sub: '下标与循环' }
            ]
          },
          {
            title: '二维数组',
            sub: '表格与矩阵',
            leaves: [
              { title: '声明与初始化', sub: 'int m[2][3]' },
              { title: '内存本质', sub: '按行优先拉平' }
            ]
          },
          {
            title: '越界的危险',
            sub: 'C++ 不做检查',
            leaves: [
              { title: '越界不会报错', sub: '会踩到别的内存' },
              { title: 'sizeof 求长度的坑', sub: '传参后退化成指针' }
            ]
          },
          {
            title: '字符串',
            sub: '两种选择',
            leaves: [
              { title: 'C 风格字符串', sub: "char[] 与 '\\0'" },
              { title: 'std::string', sub: '现代 C++ 首选' },
              { title: '常用操作', sub: '长度、拼接、查找' }
            ]
          }
        ]
      },
      notes: '本章四大块：先看一维数组，这是基础；然后是二维数组，它其实是把一维拉平了看；接着讲数组越界这个必须警惕的问题；最后是字符串，这里有两种选择——C 风格的老写法和 std::string 的新写法。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '六个部分',
      items: [
        { num: '01', title: '为什么需要数组', body: '从"定义 50 个变量"到"一个数组搞定"' },
        { num: '02', title: '一维数组', body: '声明、初始化、内存布局、访问与遍历' },
        { num: '03', title: '数组越界', body: 'C++ 不做边界检查 —— 这是最危险的地方' },
        { num: '04', title: '二维数组', body: '表格数据，以及它在内存里的真实样子' },
        { num: '05', title: '字符串', body: 'C 风格字符串与 std::string 的取舍' },
        { num: '06', title: '综合练习', body: '冒泡排序、矩阵转置、回文判断' }
      ],
      notes: '本章分六块。重点在一维数组的内存布局和越界问题，字符串部分会讲清楚为什么现代 C++ 推荐用 std::string。最后用三个练习把知识用起来。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: '为什么需要数组',
      sub: '处理一群数据的烦恼',
      lead: '一个班 50 个学生，难道要定义 50 个变量？',
      notes: '我们先看一个实际问题。如果要存一个班 50 个学生的成绩，用变量该怎么写？'
    },

    /* ---------- 5. 数组的出现 ---------- */
    {
      type: 'cards',
      eyebrow: '动机',
      title: '从"50 个变量"到"一个数组"',
      lead: '同类型、成批量的数据，需要一个统一的方式来管理。',
      cards: [
        {
          icon: 'list',
          heading: '不用数组的写法',
          body: '`int score1, score2, score3, ... score50;`\n**要写 50 行**，求平均分还要把 50 个名字都列一遍。加一个学生就要改代码。'
        },
        {
          icon: 'array',
          heading: '用数组的写法',
          body: '`int scores[50];`\n**一行搞定**。求平均分只要一个循环，加学生只需改 50 这个数字。'
        },
        {
          icon: 'memory',
          heading: '内存里的样子',
          body: '数组就是**一排连续的格子**，每个格子装一个元素。\n有了"连续"这个特性，才能用下标快速定位。'
        },
        {
          icon: 'target',
          heading: '关键前提',
          body: '数组里的元素**类型必须相同**。\n想同时存名字和分数，就得用下一章的结构体。'
        }
      ],
      notes: '数组解决的就是"一批同类型数据"的管理问题。定义时只要写一个类型、一个名字、一个长度，剩下的交给编译器。它在内存里是一排连续的格子，这正是它能用下标快速访问的原因。'
    },

    /* ---------- 6. 分节 02 ---------- */
    {
      type: 'section',
      num: '02',
      title: '一维数组',
      sub: '声明 · 初始化 · 内存布局',
      lead: '数组的核心特性是"连续"—— 元素一个挨着一个存放。',
      notes: '接下来我们详细学习一维数组。重点是理解它在内存里是怎么摆放的，这直接决定了后面指针那一章的内容。'
    },

    /* ---------- 7. 数组的内存布局【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '核心概念',
      title: '数组在内存里是连续的',
      lead: '这是数组最重要的特性。看懂了它，就明白为什么下标访问这么快、为什么数组名能当指针用。',
      memory: {
        title: 'int arr[5] 的内存布局',
        steps: [
          {
            caption: '声明 int arr[5] = {10, 20, 30, 40, 50}; 编译器一次性分配 5 × 4 = 20 个字节，元素一个紧挨一个。',
            regions: [
              { name: '数组 arr 的内存（连续 20 字节）', kind: 'stack', cells: [
                { id: 'e0', label: 'arr[0]', type: '', value: '10', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'e1', label: 'arr[1]', type: '', value: '20', addr: '0x7ffd9c4a2ba4' },
                { id: 'e2', label: 'arr[2]', type: '', value: '30', addr: '0x7ffd9c4a2ba8' },
                { id: 'e3', label: 'arr[3]', type: '', value: '40', addr: '0x7ffd9c4a2bac' },
                { id: 'e4', label: 'arr[4]', type: '', value: '50', addr: '0x7ffd9c4a2bb0' }
              ]}
            ]
          },
          {
            caption: '注意地址：每个相隔 4 字节。因为 int 占 4 字节。所以 arr[i] 的地址 = 首地址 + i × 4。',
            regions: [
              { name: '数组 arr 的内存（连续 20 字节）', kind: 'stack', cells: [
                { id: 'e0', label: 'arr[0]', type: '', value: '10', addr: '0x7ffd9c4a2ba0' },
                { id: 'e1', label: 'arr[1]', type: '', value: '20', addr: '0x7ffd9c4a2ba4' },
                { id: 'e2', label: 'arr[2]', type: '', value: '30', addr: '0x7ffd9c4a2ba8' },
                { id: 'e3', label: 'arr[3]', type: '', value: '40', addr: '0x7ffd9c4a2bac' },
                { id: 'e4', label: 'arr[4]', type: '', value: '50', addr: '0x7ffd9c4a2bb0' }
              ]}
            ],
            note: '首地址 + 偏移量 = 元素地址，这就是下标访问的底层原理'
          },
          {
            caption: '正因为地址是算出来的，arr[2] 才能直接跳到第三个格子 —— 不需要从头一个个找。这叫"随机访问"。',
            regions: [
              { name: '数组 arr 的内存（连续 20 字节）', kind: 'stack', cells: [
                { id: 'e0', label: 'arr[0]', type: '', value: '10', addr: '0x7ffd9c4a2ba0' },
                { id: 'e1', label: 'arr[1]', type: '', value: '20', addr: '0x7ffd9c4a2ba4' },
                { id: 'e2', label: 'arr[2]  ← 直接跳到这里', type: '', value: '30', addr: '0x7ffd9c4a2ba8', state: 'changed' },
                { id: 'e3', label: 'arr[3]', type: '', value: '40', addr: '0x7ffd9c4a2bac' },
                { id: 'e4', label: 'arr[4]', type: '', value: '50', addr: '0x7ffd9c4a2bb0' }
              ]}
            ]
          },
          {
            caption: '如果访问 arr[7] 呢？地址照样算得出来，但那个位置【不属于数组】—— 这就是越界，下一页细讲。',
            regions: [
              { name: '数组 arr 的内存（连续 20 字节）', kind: 'stack', cells: [
                { id: 'e0', label: 'arr[0]', type: '', value: '10', addr: '0x7ffd9c4a2ba0' },
                { id: 'e1', label: 'arr[1]', type: '', value: '20', addr: '0x7ffd9c4a2ba4' },
                { id: 'e2', label: 'arr[2]', type: '', value: '30', addr: '0x7ffd9c4a2ba8' },
                { id: 'e3', label: 'arr[3]', type: '', value: '40', addr: '0x7ffd9c4a2bac' },
                { id: 'e4', label: 'arr[4]', type: '', value: '50', addr: '0x7ffd9c4a2bb0' }
              ]},
              { name: '数组之外的区域（不属于 arr）', kind: 'heap', cells: [
                { id: 'x5', label: 'arr[5] 越界', type: '', value: '?', addr: '0x7ffd9c4a2bb4', state: 'dangling' },
                { id: 'x6', label: 'arr[6] 越界', type: '', value: '?', addr: '0x7ffd9c4a2bb8', state: 'dangling' },
                { id: 'x7', label: 'arr[7] 越界', type: '', value: '?', addr: '0x7ffd9c4a2bbc', state: 'dangling' }
              ]}
            ]
          }
        ]
      },
      note: {
        kind: 'trap',
        title: 'C++ 不做边界检查',
        text: '`arr[100]` 在 C++ 里**能编译、能运行**，它只是按公式算出地址然后去读写那块内存。至于那里有什么，编译器不管。这就是数组最危险的地方 —— 下一页专门讲。'
      },
      notes: '这就是数组的内存布局。请注意每个格子的地址：它们相隔 4 个字节，因为 int 占 4 字节。所以 arr[i] 的地址等于首地址加上 i 乘以 4。理解了这个公式，你就明白为什么下标访问这么快，也明白越界访问为什么危险了。'
    },

    /* ---------- 8. 数组初始化 ---------- */
    {
      type: 'split',
      eyebrow: '语法',
      title: '数组的声明与初始化',
      lead: '几种初始化写法，以及一个常见的陷阱。',
      points: [
        '`int a[5];` —— 声明 5 个元素，**局部数组里是垃圾值**',
        '`int a[5] = {1, 2, 3};` —— 只给前 3 个，**其余自动补 0**',
        '`int a[5] = {0};` —— 全部清零的常用写法',
        '`int a[] = {1, 2, 3};` —— 长度由初始化列表决定（这里是 3）',
        '**数组长度必须是编译期常量**，不能是运行时变量'
      ],
      code: {
        file: 'array_init.cpp',
        source: `#include <iostream>

int main() {
    // 部分初始化：剩下的自动补 0
    int a[5] = {1, 2, 3};
    std::cout << "部分初始化：";
    for (int i = 0; i < 5; i++) std::cout << a[i] << " ";
    std::cout << std::endl;

    // 全部清零的惯用写法
    int b[5] = {0};
    std::cout << "全部清零：  ";
    for (int i = 0; i < 5; i++) std::cout << b[i] << " ";
    std::cout << std::endl;

    // 长度自动推导
    int c[] = {10, 20, 30, 40};
    std::cout << "自动长度：  ";
    for (int i = 0; i < 4; i++) std::cout << c[i] << " ";
    std::cout << "（共 " << sizeof(c) / sizeof(c[0]) << " 个）" << std::endl;

    return 0;
}`,
        expectedOutput: `部分初始化：1 2 3 0 0
全部清零：  0 0 0 0 0
自动长度：  10 20 30 40 （共 4 个）`,
        note: {
          kind: 'trap',
          title: '只写 int a[5]; 不初始化',
          text: '局部数组**不会**自动清零，里面是内存里的残留数据。`int a[5] = {0};` 才能保证全零。注意 `{0}` 不是"把第一个设成 0"，而是"第一个设成 0，其余按规则补 0"。'
        }
      },
      notes: '初始化有几个要点。第一，只写一部分时，剩下的会自动补 0，所以 int a[5] = {0} 就能全部清零。第二，如果长度留空，编译器会根据初始化列表自动推导。第三，也是最重要的：如果声明时不初始化，局部数组里是垃圾值，不是 0。'
    },

    /* ---------- 9. 越界 ---------- */
    {
      type: 'code',
      eyebrow: '危险区',
      title: '数组越界：编译能过，运行不报错',
      lead: 'C++ 为了性能不做边界检查。越界访问不会崩溃，只会默默破坏别的数据。',
      points: [
        '合法下标是 `0` 到 `长度 - 1`，**没有 arr[长度] 这个元素**',
        '越界读：读到别的变量的值',
        '越界写：**改坏了别的变量**，症状可能很久之后才出现',
        '这是 C++ 中最常见、也最难查的一类 bug'
      ],
      code: {
        file: 'out_of_bounds.cpp',
        source: `#include <iostream>

int main() {
    int arr[5] = {1, 2, 3, 4, 5};

    std::cout << "合法范围是下标 0 到 4" << std::endl;
    std::cout << "arr[0] = " << arr[0] << std::endl;
    std::cout << "arr[4] = " << arr[4] << std::endl;

    // arr[5] 已经越界了！
    // 它不会报错，而是去读数组后面那块内存。
    // 那里可能装着别的变量，也可能是无意义的残留数据。
    // 下面这行我们注释掉，因为读越界内存是未定义行为：
    // std::cout << arr[5] << std::endl;

    std::cout << "越界访问 arr[5] 会编译通过、也不会报错" << std::endl;
    std::cout << "但它读到的是别的内存 —— 未定义行为" << std::endl;

    // 正确的遍历写法：条件是 i < 5，不是 i <= 5
    std::cout << "正确遍历：";
    for (int i = 0; i < 5; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `合法范围是下标 0 到 4
arr[0] = 1
arr[4] = 5
越界访问 arr[5] 会编译通过、也不会报错
但它读到的是别的内存 —— 未定义行为
正确遍历：1 2 3 4 5 `,
        note: {
          kind: 'trap',
          title: '越界不崩溃，才是最可怕的',
          text: '越界访问**通常不会立刻崩溃**。如果它恰好读到了别的变量，你会看到一个"莫名其妙但看着还挺正常"的值，然后花几个小时去查。所以写循环时一定要确认边界：**`i < 长度`，不是 `i <= 长度`**。'
        }
      },
      notes: '越界是 C++ 里最危险的坑之一。arr 只有 5 个元素，下标 5 已经越界了，但它不会报错，只会去读写数组后面的内存。那段注释掉的代码我故意没有运行，因为读越界内存是未定义行为，结果不可预测。请大家写循环时一定注意边界。'
    },

    /* ---------- 10. sizeof 求长度的坑 ---------- */
    {
      type: 'code',
      eyebrow: '常见错误',
      title: 'sizeof 求长度，出了函数就失效',
      lead: '数组作为函数参数时会**退化成指针**，这时 sizeof 得到的是指针大小。',
      points: [
        '在定义的作用域内：`sizeof(arr) / sizeof(arr[0])` 能得到元素个数',
        '作为参数传给函数后，`sizeof(arr)` 变成 **8**（指针大小）',
        '所以求数组长度的函数**必须额外传长度**',
        '或者用 `std::array` / `std::vector` 替代裸数组'
      ],
      code: {
        file: 'sizeof_trap.cpp',
        source: `#include <iostream>

// 注意：这里的 arr 已经"退化"成指针了
void printSize(int arr[]) {
    std::cout << "  函数内 sizeof(arr) = " << sizeof(arr) << "  （这是指针的大小）" << std::endl;
    // 所以下面这句是错的，会得到 2 而不是 5：
    // int n = sizeof(arr) / sizeof(arr[0]);
}

int main() {
    int arr[5] = {1, 2, 3, 4, 5};

    std::cout << "main 里 sizeof(arr) = " << sizeof(arr)
              << "  （整个数组 5 × 4 = 20 字节）" << std::endl;
    std::cout << "元素个数 = " << sizeof(arr) / sizeof(arr[0]) << std::endl;

    printSize(arr);

    std::cout << "结论：求数组长度的函数必须额外传一个长度参数" << std::endl;

    return 0;
}`,
        expectedOutput: `main 里 sizeof(arr) = 20  （整个数组 5 × 4 = 20 字节）
元素个数 = 5
  函数内 sizeof(arr) = 8  （这是指针的大小）
结论：求数组长度的函数必须额外传一个长度参数`,
        note: {
          kind: 'note',
          title: '更好的办法',
          text: '裸数组有太多这类陷阱。现代 C++ 提供了 `std::array<int, 5>`（固定长度）和 `std::vector<int>`（可变长度），它们**知道自己的长度**，可以 `.size()` 直接取，也能安全地传进函数。第 9 章会讲。'
        }
      },
      notes: '这个坑非常隐蔽。在 main 里 sizeof(arr) 是 20 字节，但传进函数后变成 8 字节——因为数组作为参数时会退化成指针，sizeof 拿到的是指针的大小。所以求数组长度的函数必须额外传长度参数，或者干脆用 std::array、std::vector。'
    },

    /* ---------- 11. 分节 04 ---------- */
    {
      type: 'section',
      num: '04',
      title: '二维数组',
      sub: '表格与矩阵',
      lead: '二维数组看起来是表格，但在内存里其实是"拉平"的一维。',
      notes: '一维数组是一排格子，二维数组看起来是表格。但在内存里，它其实也是连续的一整块，只是我们"按行"去理解它。'
    },

    /* ---------- 12. 二维数组的内存【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '关键理解',
      title: '二维数组在内存里其实是一维的',
      lead: 'int m[2][3] 看着是 2 行 3 列的表格，但内存里就是连续 6 个 int。',
      memory: {
        title: 'int m[2][3] 的内存布局',
        steps: [
          {
            caption: 'int m[2][3] = {{1,2,3},{4,5,6}}; 我们习惯把它想成 2 行 3 列的表格。',
            regions: [
              { name: '二维数组 m（视为表格）', kind: 'stack', cells: [
                { id: 'r0', label: '第 0 行', type: '', value: '1  2  3', addr: '' },
                { id: 'r1', label: '第 1 行', type: '', value: '4  5  6', addr: '' }
              ]}
            ]
          },
          {
            caption: '但内存里不分行 —— 它就是连续的 6 个 int，从 m[0][0] 一路排到 m[1][2]。这叫"行优先"（row-major）。',
            regions: [
              { name: '内存里的真实布局（连续 24 字节）', kind: 'stack', cells: [
                { id: 'c0', label: 'm[0][0]', type: '', value: '1', addr: '0x7ffd9c4a2ba0' },
                { id: 'c1', label: 'm[0][1]', type: '', value: '2', addr: '0x7ffd9c4a2ba4' },
                { id: 'c2', label: 'm[0][2]', type: '', value: '3', addr: '0x7ffd9c4a2ba8' },
                { id: 'c3', label: 'm[1][0]', type: '', value: '4', addr: '0x7ffd9c4a2bac' },
                { id: 'c4', label: 'm[1][1]', type: '', value: '5', addr: '0x7ffd9c4a2bb0' },
                { id: 'c5', label: 'm[1][2]', type: '', value: '6', addr: '0x7ffd9c4a2bb4' }
              ]}
            ]
          },
          {
            caption: '所以第 0 行的三个元素先排完，才轮到第 1 行。地址永远是连续的 —— 这就是"行优先"的含义。',
            regions: [
              { name: '内存里的真实布局（连续 24 字节）', kind: 'stack', cells: [
                { id: 'c0', label: 'm[0][0]', type: '', value: '1', addr: '0x7ffd9c4a2ba0' },
                { id: 'c1', label: 'm[0][1]', type: '', value: '2', addr: '0x7ffd9c4a2ba4' },
                { id: 'c2', label: 'm[0][2]', type: '', value: '3', addr: '0x7ffd9c4a2ba8' },
                { id: 'c3', label: 'm[1][0]', type: '', value: '4', addr: '0x7ffd9c4a2bac', state: 'changed' },
                { id: 'c4', label: 'm[1][1]', type: '', value: '5', addr: '0x7ffd9c4a2bb0' },
                { id: 'c5', label: 'm[1][2]', type: '', value: '6', addr: '0x7ffd9c4a2bb4' }
              ]}
            ],
            note: '第 1 行紧跟在第 0 行后面，中间没有空隙'
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '为什么要知道这个',
        text: '理解了"二维在内存里是一维"，你就能明白两件事：**①** `m[1][0]` 的地址就是首地址加 3 个 int 的偏移；**②** 遍历时**按行访问比按列访问更快** —— 因为按行正好顺着内存顺序走，CPU 缓存命中率高。'
      },
      notes: '这是很多人理解错的地方。二维数组看着是表格，但内存里就是连续的一整块，按行依次排列。第 0 行的三个元素排完，紧跟着第 1 行。理解这一点，对后面学指针和性能优化都有帮助。'
    },

    /* ---------- 13. 二维数组的遍历 ---------- */
    {
      type: 'split',
      eyebrow: '动手试试',
      title: '二维数组的访问与遍历',
      lead: '访问用两个下标 `m[行][列]`，遍历要用嵌套循环。',
      points: [
        '`m[i][j]` —— 第一个下标是**行**，第二个是**列**',
        '遍历要**两层循环**：外层走行，内层走列',
        '`sizeof(m) / sizeof(m[0])` 得到**行数**',
        '`sizeof(m[0]) / sizeof(m[0][0])` 得到**列数**'
      ],
      code: {
        file: 'matrix.cpp',
        source: `#include <iostream>

int main() {
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};

    // 求行数列数
    int rows = sizeof(m) / sizeof(m[0]);
    int cols = sizeof(m[0]) / sizeof(m[0][0]);
    std::cout << "行数 = " << rows << "，列数 = " << cols << std::endl;

    // 遍历：外层走行，内层走列
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            std::cout << m[i][j] << " ";
        }
        std::cout << std::endl;
    }

    // 单独访问某个元素
    std::cout << "m[1][2] = " << m[1][2] << std::endl;

    return 0;
}`,
        expectedOutput: `行数 = 2，列数 = 3
1 2 3
4 5 6
m[1][2] = 6`
      },
      notes: '二维数组的访问用两个下标，第一个是行，第二个是列。遍历要用两层循环，外层走行内层走列。注意从 m[1][2] 这个例子看，它是第 2 行第 3 列，值是 6。下标都是从 0 开始的。'
    },

    /* ---------- 14. 分节 05 ---------- */
    {
      type: 'section',
      num: '05',
      title: '字符串',
      sub: '两种选择',
      lead: 'C 风格的字符数组，和 C++ 的 std::string —— 差别很大，该怎么选？',
      notes: '字符串其实就是字符的数组。C 语言用字符数组表示字符串，C++ 则提供了一个专门的 std::string 类型。这一节我们把两种都讲清楚，并说明该选哪个。'
    },

    /* ---------- 15. C 风格字符串 ---------- */
    {
      type: 'code',
      eyebrow: '老办法',
      title: 'C 风格字符串：靠 \'\\0\' 标记结尾',
      lead: '它就是字符数组，但**必须以 `\\0` 结尾**，所有字符串函数都靠这个标记找结尾。',
      points: [
        '`char s[] = "hello";` —— 实际占 **6** 个字节（多一个 `\\0`）',
        '`\\0` 是空字符，值是 0，用来标记"字符串到此结束"',
        '求长度要**遍历到 `\\0`**，所以 `strlen` 是 O(n)',
        '**不能用 `=` 赋值**，必须用 `strcpy`',
        '忘记 `\\0` 或越界写入，会读到后面的垃圾数据'
      ],
      code: {
        file: 'c_string.cpp',
        source: `#include <iostream>
#include <cstring>          // strlen, strcpy, strcat

int main() {
    char s[] = "hello";

    std::cout << "内容 = " << s << std::endl;
    std::cout << "strlen = " << std::strlen(s) << std::endl;
    std::cout << "sizeof = " << sizeof(s) << "  （含结尾的 '\\\\0'）" << std::endl;

    // 数组里真实的字节：最后一个是 0
    std::cout << "各字节的编码：";
    for (size_t i = 0; i < sizeof(s); i++) {
        std::cout << (int)s[i] << " ";
    }
    std::cout << std::endl;

    // 修改内容要用 strcpy，不能写 s = "world"
    char t[20];
    std::strcpy(t, "world");
    std::strcat(t, "!");
    std::cout << "拼接后 = " << t << std::endl;

    return 0;
}`,
        expectedOutput: `内容 = hello
strlen = 5
sizeof = 6  （含结尾的 '\\0'）
各字节的编码：104 101 108 108 111 0
拼接后 = world!`,
        note: {
          kind: 'trap',
          title: 'strcpy 不检查长度',
          text: '`strcpy(t, "一段很长的字符串")` 如果超出了 `t` 的容量，会**直接覆盖后面的内存** —— 这是经典的缓冲区溢出漏洞。C 语言里几乎所有字符串函数都有这个问题。这也是应该改用 `std::string` 的重要原因之一。'
        }
      },
      notes: 'C 风格字符串的本质是字符数组，但有个约定：必须以 \\0 结尾。看输出的字节编码，最后一个是 0，那就是 \\0。strlen 要一个个数到 \\0 才知道长度。另外注意，字符串不能直接用等号赋值，要用 strcpy。'
    },

    /* ---------- 16. std::string vs C 风格 ---------- */
    {
      type: 'compare',
      eyebrow: '怎么选',
      title: 'std::string 与 C 风格字符串',
      lead: '结论很明确：现代 C++ 一律优先用 `std::string`。',
      table: {
        head: ['对比项', 'C 风格 `char[]`', '`std::string`'],
        rows: [
          ['赋值', '只能用 `strcpy`', '直接 `s = "hi"` 就行'],
          ['拼接', '`strcat`，要担心越界', '直接 `s1 + s2`'],
          ['求长度', '`strlen` 要遍历到 `\\0`', '`s.size()` 是 O(1)'],
          ['比较', '要用 `strcmp`，返回 int', '直接用 `==` `>` `<`'],
          ['内存管理', '**手动**，容易溢出', '**自动**扩容，不会溢出'],
          ['结尾标记', '必须自己保证有 `\\0`', '不需要操心']
        ]
      },
      note: {
        kind: 'note',
        title: '什么时候还得用 C 风格',
        text: '和 C 语言库、操作系统 API 打交道时，接口仍然要求 `const char*`。这时用 `std::string` 的 `.c_str()` 方法取出底层字符指针即可 —— **内部用 string 管理，只在调用接口那一刻转成 C 风格**。'
      },
      notes: '这张表把两种字符串的差别列得很清楚。结论很明确：日常写代码就用 std::string，它自动管理内存、支持直接赋值和拼接、比较也直观。只有在调用 C 库函数时才需要转成 C 风格，用 c_str() 方法就行。'
    },

    /* ---------- 17. std::string 常用操作 ---------- */
    {
      type: 'split',
      eyebrow: '现代写法',
      title: 'std::string 的常用操作',
      lead: '用得最多的几个方法，记住它们能省很多事。',
      points: [
        '`s.size()` / `s.empty()` —— 长度、是否为空',
        '`s + t`、`s += t` —— 拼接',
        '`s.substr(pos, len)` —— 取子串',
        '`s.find(t)` —— 查找，找不到返回 `std::string::npos`',
        '`s[i]` —— 取单个字符（**不检查越界**，用 `s.at(i)` 会检查）'
      ],
      code: {
        file: 'string_demo.cpp',
        source: `#include <iostream>
#include <string>

int main() {
    std::string s = "Hello";
    std::string t = " World";

    // 拼接
    std::string combined = s + t;
    std::cout << "拼接： " << combined << std::endl;
    std::cout << "长度： " << combined.size() << std::endl;

    // 取子串
    std::cout << "子串： " << combined.substr(0, 5) << std::endl;

    // 查找
    size_t pos = combined.find("World");
    if (pos != std::string::npos) {
        std::cout << "找到 World，位置是 " << pos << std::endl;
    }

    // 遍历字符
    std::cout << "逐字符： ";
    for (char c : combined) {
        if (c != ' ') std::cout << c << ".";
    }
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `拼接： Hello World
长度： 11
子串： Hello
找到 World，位置是 6
逐字符： H.e.l.l.o.W.o.r.l.d.`
      },
      notes: '这些都是 std::string 最常用的操作。注意 find 返回的是无符号类型 size_t，找不到时返回 string::npos 而不是 -1，所以判断要写成 pos != string::npos。另外 range for 遍历字符串也很方便。'
    },

    /* ---------- 18. 分节 06 ---------- */
    {
      type: 'section',
      num: '06',
      title: '综合练习',
      sub: '把数组用起来',
      lead: '三个经典练习，覆盖一维、二维和字符串。',
      notes: '理论讲完了，我们来做三个练习。这三个题目分别覆盖一维数组、二维数组和字符串，都是很典型的应用。'
    },

    /* ---------- 19. 冒泡排序 ---------- */
    {
      type: 'code',
      eyebrow: '练习一',
      title: '冒泡排序',
      lead: '最经典的排序算法，用双重循环实现，非常适合练手。',
      points: [
        '思路：相邻两个比较，大的往后换，一轮下来最大的就"冒"到了末尾',
        '外层控制**轮数**（n-1 轮）',
        '内层负责**两两比较交换**，每轮范围缩小',
        '时间复杂度 O(n²)，效率不高但逻辑最直观'
      ],
      code: {
        file: 'bubble_sort.cpp',
        source: `#include <iostream>

int main() {
    int arr[] = {5, 2, 8, 1, 9, 3};
    int n = sizeof(arr) / sizeof(arr[0]);

    std::cout << "排序前：";
    for (int i = 0; i < n; i++) std::cout << arr[i] << " ";
    std::cout << std::endl;

    // 外层：一共需要 n-1 轮
    for (int i = 0; i < n - 1; i++) {
        // 内层：每轮把当前最大的送到末尾
        // 注意 j 的上界是 n-1-i，因为末尾 i 个已经排好了
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int t = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = t;
            }
        }
    }

    std::cout << "排序后：";
    for (int i = 0; i < n; i++) std::cout << arr[i] << " ";
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `排序前：5 2 8 1 9 3
排序后：1 2 3 5 8 9 `,
        note: {
          kind: 'trap',
          title: '内层上界写错的后果',
          text: '内层循环如果写成 `j < n - 1`（忘了减 i），会去访问 `arr[j + 1]`，当 j 到 n-1 时就变成了 `arr[n]` —— **越界**。排序结果可能看着对，也可能莫名其妙出错。这就是前面说的"越界不报错"的典型场景。'
        }
      },
      notes: '冒泡排序的思路是：相邻两个比较，大的往后换。一轮下来最大的就沉到了最后。注意内层循环的上界是 n-1-i，因为每轮结束后末尾就多排好一个，不用再比较了。这个上界写错很容易导致越界。'
    },

    /* ---------- 20. 矩阵转置 ---------- */
    {
      type: 'code',
      eyebrow: '练习二',
      title: '矩阵转置',
      lead: '把行和列互换 —— 二维数组的典型操作。',
      points: [
        '转置：`b[j][i] = a[i][j]`，行变列、列变行',
        '2×3 的矩阵转置后变成 3×2',
        '需要两个数组：一个存原矩阵，一个存结果',
        '用嵌套循环遍历原矩阵的每个元素'
      ],
      code: {
        file: 'transpose.cpp',
        source: `#include <iostream>

int main() {
    const int ROWS = 2, COLS = 3;
    int a[ROWS][COLS] = {{1, 2, 3}, {4, 5, 6}};
    int b[COLS][ROWS];              // 转置后是 3 行 2 列

    std::cout << "原矩阵：" << std::endl;
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            std::cout << a[i][j] << " ";
        }
        std::cout << std::endl;
    }

    // 转置：行列互换
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            b[j][i] = a[i][j];
        }
    }

    std::cout << "转置后：" << std::endl;
    for (int i = 0; i < COLS; i++) {
        for (int j = 0; j < ROWS; j++) {
            std::cout << b[i][j] << " ";
        }
        std::cout << std::endl;
    }

    return 0;
}`,
        expectedOutput: `原矩阵：
1 2 3
4 5 6
转置后：
1 4
2 5
3 6`
      },
      notes: '矩阵转置就是把行列互换。核心就一行代码：b[j][i] = a[i][j]。原来 2 行 3 列的矩阵，转置后变成 3 行 2 列。注意两个数组的维度是反过来的，遍历时也要用对应的边界。'
    },

    /* ---------- 21. 回文判断 ---------- */
    {
      type: 'code',
      eyebrow: '练习三',
      title: '回文判断',
      lead: '正着读和反着读一样的字符串叫回文。用**双指针**从两端往中间比。',
      points: [
        '思路：一个指针从头、一个从尾，向中间靠拢',
        '每次比较两个字符，不同就立刻判定不是回文',
        '两个指针相遇或交错时说明全部匹配，是回文',
        '这种"双指针"技巧在数组题里非常常用'
      ],
      code: {
        file: 'palindrome.cpp',
        source: `#include <iostream>
#include <string>

bool isPalindrome(const std::string& s) {
    int left = 0;
    int right = static_cast<int>(s.size()) - 1;

    while (left < right) {
        if (s[left] != s[right]) {
            return false;           // 一发现不同就可以下结论
        }
        left++;
        right--;
    }
    return true;                    // 全部匹配
}

int main() {
    std::string words[] = {"level", "hello", "上海自来水来自海上", "abcddcba"};

    for (const auto& w : words) {
        std::cout << w << " -> " << (isPalindrome(w) ? "是回文" : "不是回文") << std::endl;
    }

    return 0;
}`,
        expectedOutput: `level -> 是回文
hello -> 不是回文
上海自来水来自海上 -> 不是回文
abcddcba -> 是回文`,
        note: {
          kind: 'trap',
          title: '为什么中文那句判断错了',
          text: '"上海自来水来自海上"**在字符层面确实是回文**，但程序输出的是"不是回文"。原因是：`std::string` 存的是**字节**，不是字符。UTF-8 里一个汉字占 **3 个字节**，所以逐字节比较时，程序拿"上"的第 1 个字节去和最后一个字节比 —— 这根本不是同一个位置，自然不相等。\n\n**结论：处理多字节字符（中文、emoji）时，字节层面的算法会失效。** 需要按字符切分（如 `std::wstring`、C++20 的 `std::u8string`），或使用专门的 Unicode 库。这也提醒我们：**字符串的长度不等于字符的个数。**'
        }
      },
      notes: '回文判断用的是双指针技巧。一个指针从头、一个从尾，往中间靠拢，逐个比较。遇到不同就直接返回 false。不过请注意最后那个中文例子——它在字符层面明明是回文，程序却判定不是。原因是 std::string 存的是字节，一个汉字占三个字节，逐字节比较就错位了。这说明处理多字节字符时要格外小心。'
    },

    /* ---------- 22. 常见陷阱汇总 ---------- */
    {
      type: 'cards',
      eyebrow: '避坑指南',
      title: '本章最容易踩的五个坑',
      cards: [
        {
          icon: 'alert',
          heading: '数组越界',
          body: '`arr[长度]` 是越界的，合法下标只到 `长度-1`。**不报错，但会破坏别的内存。**'
        },
        {
          icon: 'alert',
          heading: '局部数组没初始化',
          body: '`int a[5];` 里面是垃圾值，不是 0。要清零得写 `int a[5] = {0};`'
        },
        {
          icon: 'alert',
          heading: 'sizeof 求长度传参后失效',
          body: '数组作为参数会退化成指针，`sizeof` 得到的是 8 字节。必须额外传长度。'
        },
        {
          icon: 'alert',
          heading: 'C 风格字符串忘了 \\0',
          body: '`char s[3] = "abc";` 装不下结尾的 `\\0`，后面会读到垃圾数据。'
        },
        {
          icon: 'alert',
          heading: 'strcpy 覆盖缓冲区',
          body: '目标数组不够长时 `strcpy` 会越界写入。改用 `std::string`。'
        },
        {
          icon: 'alert',
          heading: '二维数组遍历顺序',
          body: '按行遍历比按列快 —— 因为按行是顺着内存顺序走的，缓存命中率高。'
        }
      ],
      notes: '这几个坑都和前几页的内容对应。最需要警惕的就是越界，因为它不报错、不崩溃，只是悄悄破坏别的数据，排查起来非常痛苦。'
    },

    /* ---------- 23. 结尾 ---------- */
    {
      type: 'end',
      icon: 'array',
      title: '本章小结',
      lead: '数组让程序能成批处理数据 —— 它是后面指针和结构体的基础。',
      cards: [
        { icon: 'list', heading: '一维数组', body: '连续的格子，下标从 0 开始，越界不报错' },
        { icon: 'table', heading: '二维数组', body: '看着是表格，内存里是按行拉平的一维' },
        { icon: 'text', heading: '字符串', body: 'C 风格靠 \\0 结尾，std::string 自动管理内存' },
        { icon: 'guard', heading: '安全第一', body: '越界是头号杀手；现代 C++ 优先用 std::string' }
      ],
      notes: '这一章我们学习了数组和字符串。记住三件事：数组在内存里是连续的，下标从 0 开始，越界不会报错但很危险。下一章我们要学习指针，它是 C/C++ 最核心也最难的概念，而理解了数组的内存布局，指针就会好懂很多。感谢大家的观看！'
    }
  ];
})(window);
