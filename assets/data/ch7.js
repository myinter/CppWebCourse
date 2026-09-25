/* ============================================================
   第 7 章 · 结构体、共用体与枚举

   内存可视化用在这里：
   - 结构体的成员布局，以及内存对齐带来的"填充字节"
   - 联合体所有成员共享同一块内存

   所有 code.expectedOutput 均由 clang++ 实际编译运行得到。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch7 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 7 章',
      title: '结构体、共用体与枚举',
      lead: '自定义自己的数据类型 · 从"零散的变量"到"一个整体的对象"',
      notes: '大家好，欢迎回到 C/C++ 编程教程。前面我们学过的类型都是语言内置的，比如 int、double、char。但如果要描述一个学生，他有姓名、年龄、成绩，这些数据是绑在一起的，用内置类型就很难表达。这一章我们学习怎么自己定义类型。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: '结构体把相关数据打包成一个整体，枚举给它取值域，联合体让成员共享内存。',
      map: {
        aria: '本章知识地图：结构体、类型别名、枚举与强类型枚举、联合体',
        root: { title: '第 7 章 · 自定义类型', sub: '把数据组成整体' },
        branches: [
          {
            title: '结构体',
            sub: '把相关数据打包',
            leaves: [
              { title: '定义与初始化', sub: 'struct Point' },
              { title: '成员访问', sub: '点运算符 .' },
              { title: '结构体指针', sub: '箭头运算符 ->' },
              { title: '内存布局', sub: '成员连续 + 对齐填充' }
            ]
          },
          {
            title: '结构体数组',
            sub: '成批的对象',
            leaves: [
              { title: '数组的声明', sub: 'Student list[3]' },
              { title: '遍历与访问', sub: '配合循环使用' }
            ]
          },
          {
            title: '类型别名',
            sub: '给类型起简称',
            leaves: [
              { title: 'typedef', sub: 'C 风格老写法' },
              { title: 'using', sub: 'C++11 起推荐' }
            ]
          },
          {
            title: '枚举与联合体',
            sub: '取值域与共享内存',
            leaves: [
              { title: 'enum', sub: '给整数起名字' },
              { title: 'enum class', sub: '强类型，更安全' },
              { title: 'union', sub: '成员共享同一块内存' }
            ]
          }
        ]
      },
      notes: '本章四块：先是结构体，这是最重要的；然后是结构体数组，用来处理一批对象；接着是类型别名，让代码更简洁；最后是枚举和联合体这两个有特殊用途的类型。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '七个部分',
      items: [
        { num: '01', title: '为什么需要结构体', body: '一个学生有姓名、年龄、成绩 —— 怎么打包？' },
        { num: '02', title: '结构体的定义与使用', body: '成员访问、初始化、结构体指针' },
        { num: '03', title: '结构体的内存布局', body: '成员按顺序存放，以及对齐填充这个反直觉的现象' },
        { num: '04', title: '结构体数组', body: '处理一批同类型的对象' },
        { num: '05', title: '类型别名', body: 'typedef 与 using，以及为什么推荐后者' },
        { num: '06', title: '枚举', body: 'enum 与 enum class 的差别' },
        { num: '07', title: '联合体', body: '所有成员共享同一块内存' }
      ],
      notes: '本章七块内容。重点在结构体的内存布局和枚举的两种写法，联合体了解即可，实际项目里用得不多。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: '为什么需要结构体',
      sub: '把相关的数据绑在一起',
      lead: '现实世界的事物往往由多个属性组成，结构体就是用代码描述它们的方式。',
      notes: '我们先看一个实际问题。如果要存一个学生的信息：姓名、年龄、三门课的成绩。用现有的类型怎么表达？'
    },

    /* ---------- 5. 结构体的动机 ---------- */
    {
      type: 'cards',
      eyebrow: '动机',
      title: '从"零散变量"到"一个整体"',
      lead: '当一个事物的多个属性需要一起使用、一起传递时，就应该把它们打包起来。',
      cards: [
        {
          icon: 'list',
          heading: '用零散变量的麻烦',
          body: '`string name; int age; double s1, s2, s3;`\n传到函数里要写 5 个参数。加一个属性，**所有调用处都要改**。'
        },
        {
          icon: 'object',
          heading: '用结构体之后',
          body: '`Student stu;`\n传参只传一个。`stu.name`、`stu.age` 一眼看出归属关系，加属性也不影响调用。'
        },
        {
          icon: 'blocks',
          heading: '它是"类"的前身',
          body: '结构体把**数据**打包在一起。C++ 的类在此基础上又加了**方法**（函数），\n这是后面面向对象编程的基础。'
        },
        {
          icon: 'memory',
          heading: '本质是什么',
          body: '结构体就是一个**自定义类型** —— 和 int、double 地位相同，\n只不过它由若干其它类型组合而成。'
        }
      ],
      notes: '结构体解决的就是"把相关内容绑在一起"这个问题。它让代码更能反映现实世界的结构：一个学生就是一个整体，有名字有年龄有成绩，而不是五个互不相干的变量。'
    },

    /* ---------- 6. 分节 02 ---------- */
    {
      type: 'section',
      num: '02',
      title: '结构体的定义与使用',
      sub: '声明 · 初始化 · 访问',
      lead: '定义一个新类型，然后像用内置类型一样用它。',
      notes: '接下来看具体怎么写。结构体的定义有好几种风格，我会推荐一种最清晰的。'
    },

    /* ---------- 7. 定义与访问 ---------- */
    {
      type: 'split',
      eyebrow: '基础语法',
      title: '定义、初始化与成员访问',
      lead: '用 `struct` 关键字定义，用点运算符 `.` 访问成员。',
      points: [
        '`struct 名字 { 成员列表 };` —— **结尾的分号别忘**',
        '用 `.` 访问成员：`p.x`、`p.y`',
        '初始化可以用 `{3, 4}`，成员按声明顺序对应',
        '结构体是**值类型** —— `q = p` 是整体复制一份',
        '可以像内置类型一样作为函数参数和返回值'
      ],
      code: {
        file: 'struct_basic.cpp',
        source: `#include <iostream>
#include <string>

// 定义一个新类型 Point
struct Point {
    int x;
    int y;
};                          // 注意这个分号，很容易漏

// 结构体也能装字符串
struct Student {
    std::string name;
    int age;
    double score;
};

int main() {
    // 初始化方式一：按顺序给值
    Point p1 = {3, 4};
    std::cout << "p1 = (" << p1.x << ", " << p1.y << ")" << std::endl;

    // 初始化方式二：逐个赋值
    Point p2;
    p2.x = 10;
    p2.y = 20;
    std::cout << "p2 = (" << p2.x << ", " << p2.y << ")" << std::endl;

    // 整体赋值：复制一份，之后互不影响
    Point p3 = p1;
    p3.x = 999;
    std::cout << "改 p3 之后 p1 = (" << p1.x << ", " << p1.y << ")" << std::endl;

    Student s = {"小明", 18, 92.5};
    std::cout << s.name << "，" << s.age << " 岁，成绩 " << s.score << std::endl;

    return 0;
}`,
        expectedOutput: `p1 = (3, 4)
p2 = (10, 20)
改 p3 之后 p1 = (3, 4)
小明，18 岁，成绩 92.5`,
        note: {
          kind: 'trap',
          title: '定义末尾的分号不能漏',
          text: '`};` 的这个分号**最容易忘**。漏了的话编译器会报一堆莫名其妙的错误（因为它会认为你在继续声明变量），而且错误位置往往在下面好几行。看到奇怪的语法错误时，先回头检查结构体定义有没有漏分号。'
        }
      },
      notes: '结构体的定义就是把几个变量声明包在 struct 大括号里。注意最后那个分号，最容易漏。访问成员用点运算符。还有一点很重要：结构体赋值是整体复制，改 p3 不会影响 p1，这一点和数组不一样。'
    },

    /* ---------- 8. 结构体指针 ---------- */
    {
      type: 'code',
      eyebrow: '配合指针',
      title: '结构体指针与 `->` 运算符',
      lead: '通过指针访问成员要用 `->`，它存在的意义就是少写一对括号。',
      points: [
        '`(*p).x` 和 `p->x` **完全等价**',
        '`->` 是语法糖，让代码更清爽',
        '传大结构体给函数时，用指针（或引用）能**避免整体复制**',
        '`p->x` 读作"p 指向的那个对象的 x 成员"'
      ],
      code: {
        file: 'struct_pointer.cpp',
        source: `#include <iostream>

struct Point {
    int x;
    int y;
};

// 传指针：不复制整个结构体，直接操作原对象
void moveRight(Point* p, int dx) {
    p->x += dx;              // 等价于 (*p).x += dx;
}

// 传引用：写法更简洁（第 6 章讲过）
void moveUp(Point& p, int dy) {
    p.y += dy;
}

int main() {
    Point pt = {3, 4};
    std::cout << "初始：  (" << pt.x << ", " << pt.y << ")" << std::endl;

    moveRight(&pt, 10);      // 传地址
    std::cout << "右移后：(" << pt.x << ", " << pt.y << ")" << std::endl;

    moveUp(pt, 5);           // 传引用，不用写 &
    std::cout << "上移后：(" << pt.x << ", " << pt.y << ")" << std::endl;

    // 两种访问方式的对比
    Point* p = &pt;
    std::cout << "(*p).x = " << (*p).x << "，p->x = " << p->x
              << "  —— 完全等价" << std::endl;

    return 0;
}`,
        expectedOutput: `初始：  (3, 4)
右移后：(13, 4)
上移后：(13, 9)
(*p).x = 13，p->x = 13  —— 完全等价`,
        note: {
          kind: 'trap',
          title: '小心运算符优先级',
          text: '`*p.x` 是**错的** —— 因为 `.` 的优先级高于 `*`，它会先算 `p.x`，而 p 是指针没有 x 成员，直接编译报错。必须先加括号写 `(*p).x`。这正是 `->` 被发明出来的原因：**它省掉了那对最难写对也最容易看漏的括号**。'
        }
      },
      notes: '通过指针访问结构体成员要用箭头运算符。注意 (*p).x 和 p->x 完全等价，箭头就是为了省掉那对括号。另外请留意传参方式：传指针或引用都不会复制整个结构体，大结构体这样传效率高很多。'
    },

    /* ---------- 9. 分节 03 ---------- */
    {
      type: 'section',
      num: '03',
      title: '结构体的内存布局',
      sub: '连续，但可能不是你以为的那样',
      lead: '成员按声明顺序排列，但中间可能会插入一些"看不见的字节"。',
      notes: '这一节讲结构体在内存里到底怎么摆。有一个现象很多人第一次听说会觉得不可思议：结构体的大小可能比成员加起来还大。'
    },

    /* ---------- 10. 结构体布局与对齐【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '反直觉',
      title: '为什么这个结构体占 8 字节而不是 5',
      lead: '`struct { char c; int i; }` 里 char 占 1 字节、int 占 4 字节，加起来是 5 —— 但 sizeof 得到 8。',
      memory: {
        title: '内存对齐与填充字节',
        steps: [
          {
            caption: '先看 struct { char a; char b; char c; }。三个 char 连续排列，正好 3 字节，sizeof 就是 3。',
            regions: [
              { name: '结构体 C 的内存（3 字节）', kind: 'stack', cells: [
                { id: 'a', label: 'a (char)', type: '', value: '1', addr: '0x7ffd9c4a2ba0' },
                { id: 'b', label: 'b (char)', type: '', value: '2', addr: '0x7ffd9c4a2ba1' },
                { id: 'c', label: 'c (char)', type: '', value: '3', addr: '0x7ffd9c4a2ba2' }
              ]}
            ]
          },
          {
            caption: '再看 struct { char c; int i; }。按直觉应该是 5 字节：1 个 char 加 4 个 int。但 sizeof 得到的是 8。',
            regions: [
              { name: '结构体 A 的内存（实际 8 字节）', kind: 'stack', cells: [
                { id: 'c', label: 'c (char)', type: '', value: '1', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'pad', label: '填充', type: '', value: '（没有数据）', addr: '0x7ffd9c4a2ba1', state: 'freed' },
                { id: 'pad2', label: '填充', type: '', value: '（没有数据）', addr: '0x7ffd9c4a2ba2', state: 'freed' },
                { id: 'pad3', label: '填充', type: '', value: '（没有数据）', addr: '0x7ffd9c4a2ba3', state: 'freed' },
                { id: 'i', label: 'i (int)', type: '', value: '1', addr: '0x7ffd9c4a2ba4', state: 'changed' }
              ]}
            ],
            note: '中间空了 3 个字节 —— 这就是"对齐填充"'
          },
          {
            caption: '为什么要有填充？因为 CPU 读取 int 时，希望它的地址是 4 的倍数。如果 i 从 0x7ffd9c4a2ba1 开始（不是 4 的倍数），读取效率会下降，某些硬件甚至不允许。',
            regions: [
              { name: '结构体 A 的内存（实际 8 字节）', kind: 'stack', cells: [
                { id: 'c', label: 'c (char)', type: '', value: '1', addr: '0x7ffd9c4a2ba0' },
                { id: 'pad', label: '填充 3 字节', type: '', value: '', addr: '0x7ffd9c4a2ba1', state: 'freed' },
                { id: 'i', label: 'i (int)  地址是 4 的倍数 ✓', type: '', value: '1', addr: '0x7ffd9c4a2ba4', state: 'changed' }
              ]}
            ],
            note: '对齐让 CPU 存取更快 —— 用空间换时间'
          },
          {
            caption: '所以规则是：成员按【声明顺序】排列，但每个成员都要对齐到它自身大小的倍数上，不足的地方补填充字节。结构体总大小也要对齐到最大成员的倍数。',
            regions: [
              { name: '对比三种写法的大小', kind: 'stack', cells: [
                { id: 's1', label: 'char; char; char', type: '', value: '3 字节（无填充）', addr: '' },
                { id: 's2', label: 'char; int', type: '', value: '8 字节（填 3）', addr: '', state: 'changed' },
                { id: 's3', label: 'int; char', type: '', value: '8 字节（填 3）', addr: '', state: 'changed' }
              ]}
            ],
            note: '把小的成员放一起，能减少填充、省内存'
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '实际影响：成员顺序会改变内存占用',
        text: '`struct { char c; int i; }` 占 8 字节，而 `struct { char a, b, c; char d; }` 占 4 字节 —— 同样的成员、不同的顺序，占用差一倍。在**内存敏感的场景**（嵌入式、大规模数组）里，把同类型的成员排在一起是常见优化。\n\n日常开发中不必刻意优化，但**要知道这个现象存在** —— 否则用 `memcmp` 比较结构体、或把结构体直接读写二进制文件时，会被填充字节坑到。'
      },
      notes: '对齐是这一章最容易让人惊讶的点。char 加 int 明明是 5 字节，sizeof 却给 8。原因是 CPU 读取 int 时希望地址是 4 的倍数，所以中间补了 3 个填充字节。还有一点很重要：填充字节里的内容是不确定的，所以不要用 memcmp 直接比较两个结构体。'
    },

    /* ---------- 11. 结构体数组 ---------- */
    {
      type: 'split',
      eyebrow: '成批对象',
      title: '结构体数组',
      lead: '每个元素都是一个完整的结构体 —— 表示一组对象的标准方式。',
      points: [
        '`Student list[3];` 声明一个装 3 个学生的数组',
        '用 `list[i].name` 访问第 i 个学生的姓名',
        '数组在内存里仍是**连续的**，只是每个元素变大了',
        '配合循环就能批量处理'
      ],
      code: {
        file: 'struct_array.cpp',
        source: `#include <iostream>
#include <string>

struct Student {
    std::string name;
    int    age;
    double score;
};

int main() {
    Student list[3] = {
        {"小明", 18, 92.5},
        {"小红", 19, 88.0},
        {"小刚", 18, 76.5}
    };

    std::cout << "学生名单：" << std::endl;
    double total = 0;
    for (int i = 0; i < 3; i++) {
        std::cout << "  " << list[i].name
                  << "  " << list[i].age << " 岁"
                  << "  成绩 " << list[i].score << std::endl;
        total += list[i].score;
    }

    std::cout << "平均分 = " << total / 3 << std::endl;
    std::cout << "每个元素占 " << sizeof(Student) << " 字节" << std::endl;

    return 0;
}`,
        expectedOutput: `学生名单：
  小明  18 岁  成绩 92.5
  小红  19 岁  成绩 88
  小刚  18 岁  成绩 76.5
平均分 = 85.6667
每个元素占 40 字节`,
        note: {
          kind: 'note',
          title: '现代写法更省心',
          text: '这里用了裸数组，长度写死在代码里。实际项目里更推荐 `std::vector<Student>` —— 它能动态增长，也能直接用 `.size()` 取长度，还能配合范围 for 遍历：`for (const auto& s : list)`。'
        }
      },
      notes: '结构体数组就是每个元素都是一个结构体的数组。遍历时用 list[i].name 这样的写法，先下标再点成员。注意每个 Student 占 40 字节，因为里面有 string 和 double。实际项目建议用 vector 代替裸数组。'
    },

    /* ---------- 12. 分节 05 ---------- */
    {
      type: 'section',
      num: '05',
      title: '类型别名',
      sub: 'typedef 与 using',
      lead: '给类型起个短名字，或者让名字更有表达力。',
      notes: '接下来讲类型别名。C 语言用 typedef，C++11 引入了 using，写法更清晰。'
    },

    /* ---------- 13. typedef vs using ---------- */
    {
      type: 'compare',
      eyebrow: '怎么选',
      title: 'typedef 与 using',
      lead: '功能上基本等价，但 `using` 的写法更符合阅读习惯，也支持模板。',
      versus: {
        a: {
          title: 'typedef（C 风格）',
          icon: 'tag',
          items: [
            '`typedef unsigned long long ull;`',
            '名字写在**最后**，读起来是反的',
            '`typedef int Arr[5];` 这种数组别名很容易看懵',
            '不支持模板别名',
            '老代码里大量存在'
          ]
        },
        b: {
          title: 'using（C++11 起）',
          icon: 'convert',
          items: [
            '`using ull = unsigned long long;`',
            '名字在前、类型在后，**顺序自然**',
            '`using Arr = int[5];` 一眼看懂',
            '支持模板别名：`template<typename T> using Vec = ...`',
            '**现代 C++ 推荐**'
          ]
        }
      },
      note: {
        kind: 'note',
        title: '看这一组对比就明白了',
        text: '```\ntypedef void (*FuncPtr)(int);     // 这是什么类型？\nusing FuncPtr = void (*)(int);    // 一眼看出是函数指针\n```\n`using` 的写法把"新名字"放在等号左边，"原类型"放在右边 —— 和变量赋值一个顺序，符合阅读直觉。'
      },
      notes: '两者的功能基本一样，但 using 的写法更直观。看下面那个函数指针的例子：typedef 的写法需要你从中间去找名字，而 using 一眼就能看出左边是新名字、右边是原类型。所以现代 C++ 推荐用 using。'
    },

    /* ---------- 14. using 示例 ---------- */
    {
      type: 'code',
      eyebrow: '动手试试',
      title: '类型别名的实际用法',
      lead: '简化长类型名，或者给类型起一个能表达业务含义的名字。',
      points: [
        '简化：`using ull = unsigned long long;`',
        '表达意图：`using StudentId = int;` 比直接用 int 清楚',
        '给结构体起别名：`using Point = struct Point;`（C 里常用）',
        '配合模板：`using IntVec = std::vector<int>;`'
      ],
      code: {
        file: 'using_demo.cpp',
        source: `#include <iostream>
#include <vector>
#include <string>

// 简化长类型名
using ull = unsigned long long;

// 给类型起一个能表达业务含义的名字
using StudentId = int;
using Score     = double;

// 给容器起短名
using IntVec = std::vector<int>;

int main() {
    ull big = 18446744073709551615ULL;
    std::cout << "ull 最大值 = " << big << std::endl;

    StudentId id = 1001;
    Score     s  = 92.5;
    std::cout << "学号 " << id << "，成绩 " << s << std::endl;

    IntVec v = {1, 2, 3};
    std::cout << "IntVec 大小 = " << v.size() << std::endl;

    return 0;
}`,
        expectedOutput: `ull 最大值 = 18446744073709551615
学号 1001，成绩 92.5
IntVec 大小 = 3`,
        note: {
          kind: 'note',
          title: '别起无意义的别名',
          text: '类型别名要**增加信息量**，不是减少打字量。`using i = int;` 这种别名毫无意义，只会让读代码的人多绕一层。好的别名如 `using StudentId = int;` —— 它让"这是什么 int"变得一目了然。'
        }
      },
      notes: '类型别名有两个典型用途：一是把很长的类型名变短，比如 unsigned long long；二是给类型起一个有业务含义的名字，比如把 int 叫成 StudentId，读代码时立刻明白这个整数代表什么。'
    },

    /* ---------- 15. 分节 06 ---------- */
    {
      type: 'section',
      num: '06',
      title: '枚举',
      sub: '给整数起名字',
      lead: '与其在代码里到处写 `1`、`2`、`3`，不如给它们起个有意义的名字。',
      notes: '枚举用来表示一组有限的取值。比如星期几、颜色、状态，这类"只能取某几个值"的情况，用枚举比用整数清晰得多。'
    },

    /* ---------- 16. enum vs enum class ---------- */
    {
      type: 'compare',
      eyebrow: '重要区别',
      title: 'enum 与 enum class',
      lead: '普通 enum 会隐式变成整数，这可能带来意外；`enum class` 堵住了这个口子。',
      versus: {
        a: {
          title: '普通 enum',
          icon: 'warn',
          items: [
            '`enum Color { RED, GREEN };`',
            '枚举值**会隐式转换成整数**',
            '作用域是外层的 —— 两个 enum 不能有同名值',
            '可以跟整数比较，也能直接赋值给 int',
            '`RED` 直接可用，不用写前缀'
          ]
        },
        b: {
          title: 'enum class（C++11）',
          icon: 'guard',
          items: [
            '`enum class Color { RED, GREEN };`',
            '**不会隐式转换**成整数，必须显式转换',
            '作用域限定在枚举名内，**不同 enum 可以同名**',
            '不能和整数直接比较，编译器帮你拦住错误',
            '使用要写 `Color::RED`，更明确'
          ]
        }
      },
      note: {
        kind: 'note',
        title: '推荐用 enum class',
        text: '普通 enum 的名字会"泄漏"到外层作用域，两个枚举不能有相同的成员名 —— 在大型项目里很麻烦。而且它能悄悄转成整数，`if (color == 5)` 这种错误编译器不会拦。\n\n**新代码一律用 `enum class`**，除非是要对接 C 语言接口。'
      },
      notes: '两者最重要的区别是类型安全。普通 enum 的值能隐式转成整数，所以写错了编译器也不报错。enum class 必须显式转换，而且作用域限定在枚举内部，不会和其他枚举冲突。新代码建议一律用 enum class。'
    },

    /* ---------- 17. 枚举示例 ---------- */
    {
      type: 'code',
      eyebrow: '动手试试',
      title: '枚举的实际用法',
      lead: '枚举值默认从 0 开始递增，也可以自己指定。',
      points: [
        '默认：`RED=0, GREEN=1, BLUE=2`',
        '可以手动指定：`RED = 1, GREEN = 5, BLUE`（BLUE 就是 6）',
        '可以指定底层类型：`enum class Color : char`',
        '配合 `switch` 使用是最常见的场景'
      ],
      code: {
        file: 'enum_demo.cpp',
        source: `#include <iostream>

// 普通 enum
enum Color { RED, GREEN, BLUE };

// 强类型 enum，指定底层类型为 char 以节省空间
enum class Status : char { OK, WARNING, ERROR };

// 手动指定值
enum HttpCode { HTTP_OK = 200, HTTP_NOT_FOUND = 404, HTTP_ERROR = 500 };

const char* describe(Status s) {
    switch (s) {
        case Status::OK:      return "正常";
        case Status::WARNING: return "警告";
        case Status::ERROR:   return "错误";
    }
    return "未知";
}

int main() {
    Color c = GREEN;
    std::cout << "GREEN 的整数值 = " << c << std::endl;

    std::cout << "Status::ERROR = " << describe(Status::ERROR) << std::endl;

    // enum class 不能隐式转 int，必须显式转换
    std::cout << "Status::ERROR 的值 = "
              << static_cast<int>(Status::ERROR) << std::endl;

    std::cout << "HTTP_NOT_FOUND = " << HTTP_NOT_FOUND << std::endl;
    std::cout << "sizeof(Status) = " << sizeof(Status) << " 字节" << std::endl;

    return 0;
}`,
        expectedOutput: `GREEN 的整数值 = 1
Status::ERROR = 错误
Status::ERROR 的值 = 2
HTTP_NOT_FOUND = 404
sizeof(Status) = 1 字节`,
        note: {
          kind: 'trap',
          title: '普通 enum 的隐式转换会掩盖错误',
          text: '因为 `Color` 能隐式转成 `int`，所以 `if (c == 5)` 这种毫无意义的比较**编译器不会报错**，运行时也永远为假 —— 你会困惑为什么条件不成立。换成 `enum class` 后，这行代码直接编译失败，问题当场暴露。'
        }
      },
      notes: '枚举值默认从 0 开始。可以手动指定，比如 HTTP 状态码就直接写 200、404。注意 enum class 不能隐式转整数，所以打印时要写 static_cast。最后一行：我给 Status 指定了底层类型 char，所以它只占 1 字节。'
    },

    /* ---------- 18. 分节 07 ---------- */
    {
      type: 'section',
      num: '07',
      title: '联合体',
      sub: '所有成员共享一块内存',
      lead: '结构体是"每个成员各占一块"，联合体正相反 —— "所有成员共用同一块"。',
      notes: '最后一个概念是联合体。它和结构体看起来很像，但内存含义完全不同。'
    },

    /* ---------- 19. union 的内存【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '对比理解',
      title: '联合体：成员共享同一块内存',
      lead: '结构体的成员各占各的，联合体的成员叠在一起，因此大小等于最大的那个成员。',
      memory: {
        title: 'union 与 struct 的内存差别',
        steps: [
          {
            caption: '先回顾结构体：struct { int i; float f; } 的两个成员【各占一块】，所以总大小是 4 + 4 = 8 字节。',
            regions: [
              { name: 'struct 的内存（8 字节）', kind: 'stack', cells: [
                { id: 'si', label: 'i (int)', type: '', value: '（独立）', addr: '0x7ffd9c4a2ba0' },
                { id: 'sf', label: 'f (float)', type: '', value: '（独立）', addr: '0x7ffd9c4a2ba4' }
              ]}
            ]
          },
          {
            caption: '而 union { int i; float f; } 的两个成员【叠在同一块内存上】，总大小只有 4 字节。',
            regions: [
              { name: 'union 的内存（只有 4 字节）', kind: 'stack', cells: [
                { id: 'u', label: 'i 和 f 共用这 4 字节', type: '', value: '一块内存，两个视角', addr: '0x7ffd9c4a2ba0', state: 'changed' }
              ]}
            ],
            note: 'union 的大小 = 最大成员的大小'
          },
          {
            caption: '写 u.i = 65。这 4 个字节被写入整数 65 的二进制形式：最低位字节是 65，其余是 0。',
            regions: [
              { name: 'union 的内存（只有 4 字节）', kind: 'stack', cells: [
                { id: 'u', label: 'u.i = 65（低字节在前）', type: '', value: '01 00 00 00', addr: '0x7ffd9c4a2ba0', state: 'changed' }
              ]}
            ]
          },
          {
            caption: '现在读 u.f。它不会去"转换"整数，而是把同一串二进制位【直接当成 float 解释】——这就是"重新解释"。',
            regions: [
              { name: 'union 的内存（只有 4 字节）', kind: 'stack', cells: [
                { id: 'u', label: '同一串位，按 float 解释', type: '', value: '约 9.1e-44', addr: '0x7ffd9c4a2ba0', state: 'changed' }
              ]}
            ],
            note: '写进去的是 int，读出来的是 float —— 位的含义变了，位本身没变'
          }
        ]
      },
      note: {
        kind: 'trap',
        title: '读"非最后写入的成员"要小心',
        text: '联合体同一时刻**只有一个成员是"活跃"的** —— 最后写入的那个。读过期的成员属于未定义行为（C++ 允许但不推荐，实践中依赖具体编译器）。\n\n联合体的正当用途：**节省内存**（如多种消息共用一个缓冲区）、**类型双关**（查看浮点数的二进制表示）。日常业务代码里很少需要它。'
      },
      notes: '联合体和结构体的差别在这个图里很清楚：结构体每个成员各占一块，联合体所有成员叠在一起。所以联合体的大小等于最大的那个成员。写进去的是整数，读出来当成浮点数，得到的是一个完全不同的值——因为它只是把同一串二进制位换了个解释方式。'
    },

    /* ---------- 20. union 示例 ---------- */
    {
      type: 'code',
      eyebrow: '实际演示',
      title: '联合体的实际效果',
      lead: '看一个具体例子，理解"共享内存"和"重新解释"是什么意思。',
      points: [
        '`sizeof(union)` = 最大成员的大小',
        '写一个成员会**覆盖**其他成员占的字节',
        '可以用它查看 float 的二进制表示',
        '日常开发中**很少需要**，知道有这个东西即可'
      ],
      code: {
        file: 'union_demo.cpp',
        source: `#include <iostream>

union Value {
    int   i;
    float f;
    char  bytes[4];
};

int main() {
    Value v;

    std::cout << "sizeof(Value) = " << sizeof(Value) << " 字节"
              << "（等于最大的成员，不是三个相加）" << std::endl;

    // 写入整数
    v.i = 65;
    std::cout << "写入 v.i = 65 之后：" << std::endl;
    std::cout << "  按 int 读   v.i = " << v.i << std::endl;
    std::cout << "  按 char 看字节：";
    for (int k = 0; k < 4; k++) {
        std::cout << (int)(unsigned char)v.bytes[k] << " ";
    }
    std::cout << std::endl;

    // 写入浮点数，会覆盖刚才的内容
    v.f = 1.0f;
    std::cout << "写入 v.f = 1.0 之后：" << std::endl;
    std::cout << "  按 float 读 v.f = " << v.f << std::endl;
    std::cout << "  按 char 看字节：";
    for (int k = 0; k < 4; k++) {
        std::cout << (int)(unsigned char)v.bytes[k] << " ";
    }
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `sizeof(Value) = 4 字节（等于最大的成员，不是三个相加）
写入 v.i = 65 之后：
  按 int 读   v.i = 65
  按 char 看字节：65 0 0 0
写入 v.f = 1.0 之后：
  按 float 读 v.f = 1
  按 char 看字节：0 0 128 63`,
        note: {
          kind: 'note',
          title: '从字节看浮点数',
          text: '`1.0f` 的四个字节是 `0 0 128 63`，写成十六进制就是 `3F 80 00 00` —— 这正是 IEEE 754 单精度浮点数里 1.0 的标准编码。联合体让我们**直接看到浮点数的底层表示**，这也是它的一个经典用途。'
        }
      },
      notes: '这段代码展示了联合体的两个要点。第一，它的大小是 4 字节，等于最大的成员，不是 1+4+4=9。第二，写入 65 之后，按字节看是 65 0 0 0，这是小端序的整数表示。写入 1.0 之后变成 0 0 128 63，这正好是 IEEE 754 里 1.0 的编码。'
    },

    /* ---------- 21. 常见陷阱汇总 ---------- */
    {
      type: 'cards',
      eyebrow: '避坑指南',
      title: '本章最容易踩的四个坑',
      cards: [
        {
          icon: 'alert',
          heading: '结构体定义漏分号',
          body: '`};` 最后的这个分号最容易忘，漏了会报一堆位置奇怪的语法错误。'
        },
        {
          icon: 'alert',
          heading: '用 == 或 memcmp 比较结构体',
          body: '填充字节的内容**不确定**，逐字节比较可能得到错误结果。应该**逐个成员比较**。'
        },
        {
          icon: 'alert',
          heading: '忘了 -> 与 . 的区别',
          body: '结构体用 `.`，结构体指针用 `->`。`*p.x` 是错的（优先级问题），要写 `(*p).x`。'
        },
        {
          icon: 'alert',
          heading: '读了联合体过期的成员',
          body: '联合体只有最后写入的成员是有效的。读其他成员是未定义行为。'
        }
      ],
      notes: '这四个坑都和内存有关。第二个特别值得注意：因为填充字节里是垃圾数据，所以两个成员完全相同的结构体，用 memcmp 比较可能返回不相等。正确做法是逐个成员比较。'
    },

    /* ---------- 22. 课后练习 ---------- */
    {
      type: 'cards',
      eyebrow: '动手练习',
      title: '课后练习',
      lead: '结合前面的知识，动手写几个完整的小程序。',
      cards: [
        {
          icon: 'target',
          heading: '① 学生成绩管理',
          body: '定义 `Student` 结构体，用数组存 5 个学生。\n输出总分、平均分，以及分数最高的那个学生的姓名。'
        },
        {
          icon: 'target',
          heading: '② 计算两点距离',
          body: '用 `Point` 结构体表示点，写函数 `double distance(Point a, Point b)`。\n提示：`sqrt((a.x-b.x)² + (a.y-b.y)²)`，需要 `#include <cmath>`。'
        },
        {
          icon: 'target',
          heading: '③ 用枚举做状态机',
          body: '定义 `enum class State { IDLE, RUNNING, STOPPED };`\n写一个函数把状态转成中文字符串，用 `switch` 实现。'
        },
        {
          icon: 'target',
          heading: '④ 验证对齐现象',
          body: '自己写几个结构体，打印 `sizeof`，观察成员顺序如何影响总大小。\n试试把 `char` 和 `int` 换换位置，看看结果变不变。'
        }
      ],
      note: {
        kind: 'note',
        title: '第 ④ 题最有意思',
        text: '它没有一个"标准答案"，但能让你**亲眼看到**内存对齐的效果。把观察结果记下来，以后遇到"结构体为什么这么大"的疑问时，你会立刻想到这一章讲的内容。'
      },
      notes: '这几道题都建议大家动手写。第四题特别有意思，你多试几种成员组合，会发现内存占用差别很大，这是理解对齐最好的方式。'
    },

    /* ---------- 23. 结尾 ---------- */
    {
      type: 'end',
      icon: 'blueprint',
      title: '本章小结',
      lead: '自定义类型让代码能如实描述现实世界 —— 这也是面向对象编程的起点。',
      cards: [
        { icon: 'object', heading: '结构体', body: '把相关数据打包成整体；成员连续存放，但可能有对齐填充' },
        { icon: 'convert', heading: '类型别名', body: 'using 比 typedef 写法更自然，优先用它' },
        { icon: 'tag', heading: '枚举', body: '给整数起名字；enum class 更安全，不会隐式转成整数' },
        { icon: 'layers', heading: '联合体', body: '成员共享同一块内存，大小等于最大成员；日常很少用' }
      ],
      notes: '第 7 章的内容就到这里。我们学习了结构体、类型别名、枚举和联合体。结构体是最常用的，它是后面学习类的基础。到这里，C/C++ 的基础语法就全部讲完了。下一章我们会看看现代 C++ 带来了哪些新东西。感谢大家的观看！'
    }
  ];
})(window);
