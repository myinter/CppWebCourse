/* ============================================================
   第 8 章 · 类与多态

   原 PPT 讲完结构体就结束了，但"类"才是 C++ 真正的主体，
   而且后面第 9 章（Modern C++）的智能指针、移动语义全都建立在
   类的基础上 —— 所以这一章是补上那条断掉的线。

   内存可视化用在这里：
   - 对象里到底存了什么（成员变量在对象里，成员函数不在）
   - 派生类对象 = 基类子对象 + 自己的成员
   - 虚函数表：对象里的 vptr 如何找到真正要调用的函数
   - 有了虚函数之后，对象大小怎么从 4 字节变成 16 字节

   所有 code.expectedOutput 均由 clang++ 实际编译运行得到。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch8 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 8 章',
      title: '类与多态',
      lead: '把数据和操作数据的函数打包在一起 · 对象在内存里到底长什么样',
      notes: '大家好，欢迎回到 C/C++ 编程教程。上一章我们学了结构体，它能把相关的数据打包成一个整体。但结构体只能装数据，不能装操作这些数据的函数。这一章要学的"类"，就是在这个基础上再往前走一步：把数据和操作数据的函数打包在一起。这一章还会回答一个很多人学了几年 C++ 都没搞清楚的问题：多态到底是怎么实现的。答案在内存里。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: '类把数据和行为绑在一起；虚函数表让同一个调用在运行期走向不同的函数。',
      map: {
        aria: '本章知识地图：从结构体到类、对象的构造与销毁、继承与多态、对象的大小与类型转换',
        root: { title: '第 8 章 · 类与多态', sub: '对象是怎么造出来的' },
        branches: [
          {
            title: '从结构体到类',
            sub: '多了什么',
            leaves: [
              { title: '访问控制', sub: 'public / private' },
              { title: '封装', sub: '把函数也放进去' },
              { title: '不变式', sub: '非法状态无法存在' }
            ]
          },
          {
            title: '构造与析构',
            sub: '对象的生与死',
            leaves: [
              { title: '构造函数', sub: '初始化列表' },
              { title: '析构函数', sub: '逆序销毁' },
              { title: '拷贝构造', sub: '浅拷贝的陷阱' },
              { title: 'RAII', sub: '用生命周期管资源' }
            ]
          },
          {
            title: '继承与多态',
            sub: '本章重点',
            leaves: [
              { title: '继承', sub: 'is-a 关系' },
              { title: '对象布局', sub: '基类子对象在前' },
              { title: '虚函数表', sub: '多态的实现方式' },
              { title: '虚析构', sub: '基类的必修课' }
            ]
          },
          {
            title: '大小与转换',
            sub: '看不见的细节',
            leaves: [
              { title: '对象大小', sub: '对齐填充 + vptr' },
              { title: '四种类型转换', sub: '别再用 C 风格转换' }
            ]
          }
        ]
      },
      notes: '这一章四块。第一块从结构体过渡到类，理解封装；第二块讲对象的构造和析构，这是 C++ 最有特色的地方，资源管理全靠它；第三块是重点，继承和多态，我们会画虚函数表，把多态的实现原理看清楚；第四块讲对象的大小和四种类型转换。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '七个部分',
      items: [
        { num: '01', title: '从结构体到类', body: '只差一个默认访问权限，但多了封装这一层思想' },
        { num: '02', title: '对象的内存结构', body: '成员变量在对象里，成员函数不在 —— this 是哪来的' },
        { num: '03', title: '构造与析构', body: '对象的"出生"和"死亡"，以及怎么用它管理资源' },
        { num: '04', title: '继承', body: 'is-a 关系，以及派生类对象在内存里怎么摆' },
        { num: '05', title: '多态与虚函数', body: '虚函数表：一个调用如何走向不同的函数' },
        { num: '06', title: '对象的大小', body: '对齐填充、vptr、空基类优化' },
        { num: '07', title: '四种类型转换', body: 'static_cast、dynamic_cast、const_cast、reinterpret_cast' }
      ],
      notes: '七个部分里，第五部分"多态与虚函数"是这一章的核心，也是整个 C++ 里最难用文字讲清的部分 —— 我们会用内存图把它画出来。第三部分的构造析构同样重要，它是后面智能指针和移动语义的基础。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: '从结构体到类',
      sub: '只差一个默认访问权限，但多了整个编程思想',
      lead: '上一章的结构体只能装数据。类把「操作数据的函数」也一起装了进去。',
      notes: '我们先从上一章的结构体出发。结构体把相关的数据打包在一起，但它只能装数据。类在语法上和结构体几乎一模一样，只是多了一个能装函数的能力，以及一套访问控制。'
    },

    /* ---------- 5. 结构体 vs 类 ---------- */
    {
      type: 'code',
      eyebrow: '第一步',
      title: '结构体与类：语法上只差一个默认权限',
      lead: '把 `struct` 换成 `class` 需要改的地方只有一处 —— 但两者的内存布局**完全相同**。',
      code: {
        file: 'struct_vs_class.cpp',
        source: `#include <iostream>

struct A {          // struct 的成员默认是 public
    int x;
};

class B {           // class 的成员默认是 private
    int x;
public:
    void set(int v) { x = v; }      // 只能通过公开的接口访问
    int  get() const { return x; }
};

int main() {
    A a;
    a.x = 1;                        // 直接访问，可以
    std::cout << "a.x = " << a.x << std::endl;

    B b;
    b.set(2);                       // 只能走接口
    std::cout << "b.get() = " << b.get() << std::endl;

    // b.x = 3;                     // 取消注释会编译失败：'x' is a private member

    std::cout << "sizeof(A) = " << sizeof(A)
              << "，sizeof(B) = " << sizeof(B) << std::endl;
    std::cout << "访问权限不影响内存布局，只影响谁能碰它" << std::endl;

    return 0;
}`,
        expectedOutput: `a.x = 1
b.get() = 2
sizeof(A) = 4，sizeof(B) = 4
访问权限不影响内存布局，只影响谁能碰它`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '访问权限是"编译期"的事',
          text: '`private` 不是把数据藏起来 —— 数据还在那儿，`sizeof(B)` 一样是 4 字节。它只是告诉编译器：**在这个类的作用域之外，不许你直接写这个名字**。\n\n所以访问控制是**编译期**的约束，不产生任何运行时开销。这一点和第 6 章的 `const` 很像：都是"编译器帮你把错误拦在前面"。'
        }
      },
      notes: '注意这一页的两个结论。第一，struct 和 class 在 C++ 里只差默认访问权限：struct 默认 public，class 默认 private。第二，访问权限只影响编译期能不能通过，不影响对象占多少内存。所以选择用哪个，是表达意图：这个类型只是个数据集合，用 struct；它有不变式要守护，用 class。'
    },

    /* ---------- 6. 类真正带来的是什么 ---------- */
    {
      type: 'cards',
      eyebrow: '为什么要用类',
      title: '类真正带来的三件事',
      lead: '如果只是"把函数和变量写在一起"，那用一个命名前缀也能做到。类的价值在后面两条。',
      cards: [
        {
          icon: 'encapsulate',
          heading: '打包：数据 + 操作它的函数',
          body: '结构体只能装数据，操作数据的函数只能散落在外面。类把两者放在一起，**读代码时不用再满文件找"谁在改这个变量"**。'
        },
        {
          icon: 'lock',
          heading: '访问控制：把能改的东西关起来',
          body: '`private` 之后，外部只能通过 `public` 的接口访问。**接口就是这个类的"合同"** —— 合同之外的东西，随时可以改。'
        },
        {
          icon: 'shield',
          heading: '不变式：非法状态无法存在',
          body: '接口里可以做检查（比如"半径不能为负"），于是**对象一旦构造出来，就永远处于合法状态** —— 这是用零散的变量永远做不到的保证。'
        }
      ],
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '一句话记住封装的收益',
        text: '封装不是为了"保密"，而是为了**让一个类可以放心地被修改**：只要 `public` 接口不变，内部实现随便换，所有用到它的代码都不用动。'
      },
      notes: '很多教材讲封装只讲"隐藏数据"，这容易让人觉得是在故弄玄虚。真正的收益是第三张卡片：不变式。当所有对数据的修改都必须经过你写的接口，你就能保证对象永远处于合法状态。这是大型程序能够维护的前提。'
    },

    /* ---------- 7. 封装的实际价值 ---------- */
    {
      type: 'code',
      eyebrow: '看一个例子',
      title: '封装守护"不变式"',
      lead: '圆的半径不能是负数 —— 这件事交给类自己去保证，比让每个调用者都记得检查可靠得多。',
      code: {
        file: 'circle.cpp',
        source: `#include <iostream>

class Circle {
public:
    void setRadius(double r) {
        if (r < 0) {                          // 不变式由类自己守护
            std::cout << "  非法半径 " << r << " 被拒绝" << std::endl;
            return;
        }
        r_ = r;
    }
    double radius() const { return r_; }
    double area()   const { return 3.14159265 * r_ * r_; }

private:
    double r_ = 1.0;                          // 成员变量加个下划线，是常见约定
};

int main() {
    Circle c;
    c.setRadius(2.0);
    std::cout << "半径 = " << c.radius()
              << "，面积 = " << c.area() << std::endl;

    c.setRadius(-5.0);                        // 非法输入进不来
    std::cout << "半径仍然是 " << c.radius() << std::endl;

    return 0;
}`,
        expectedOutput: `半径 = 2，面积 = 12.5664
  非法半径 -5 被拒绝
半径仍然是 2`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '「面积 = 12.5664」是怎么回事',
          text: '`double` 用 `cout` 直接打印时，默认只显示 **6 位有效数字**，所以 `12.56637...` 显示成 `12.5664`（末尾四舍五入）。想控制精度要用 `std::setprecision`，那是第 2 章讲过的格式控制。'
        }
      },
      notes: '这个例子的重点是：setRadius 里做了检查，所以任何时刻 c 的半径都是合法的。如果 r_ 是 public，那么十个调用方里只要有一个人忘了检查，程序里就存在一个半径为负的圆，而且这个错误会一直传播下去，直到某处除以零或者画出莫名其妙的图形。'
    },

    /* ---------- 8. 分节 02 ---------- */
    {
      type: 'section',
      num: '02',
      title: '对象的内存结构',
      sub: '成员函数到底存在哪里',
      lead: '一个类有一百个成员函数、创建了一千个对象 —— 内存里会有一百份代码吗？',
      notes: '接下来我们把对象拆开看。这里有一个初学者常见的误解：以为每个对象里都存着一份成员函数。如果真是那样，一万个对象就要存一万份代码，显然不合理。'
    },

    /* ---------- 9. 对象里到底存了什么【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '核心概念',
      title: '对象里存了什么',
      lead: '成员变量在对象里，**成员函数不在** —— 代码只有一份，所有对象共用。',
      memory: {
        title: '对象的内存结构',
        steps: [
          {
            caption: '先看最简单的：类里只有数据成员。Point p; 之后，p 在栈上占 8 字节 —— 两个 int 挨着放，和结构体一模一样。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'p.x (int)', type: '', value: '3', addr: '0x7ffd9c4a2ba0' },
                { id: 'y', label: 'p.y (int)', type: '', value: '4', addr: '0x7ffd9c4a2ba4' }
              ]}
            ]
          },
          {
            caption: '现在给 Point 加上两个成员函数。对象的大小变了吗？没有 —— 还是 8 字节。成员函数一个字节都不占对象空间。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'p.x (int)', type: '', value: '3', addr: '0x7ffd9c4a2ba0' },
                { id: 'y', label: 'p.y (int)', type: '', value: '4', addr: '0x7ffd9c4a2ba4' }
              ]},
              { name: '代码段 Code（全程序只有这一份）', kind: 'code', cells: [
                { id: 'f1', label: 'Point::area()', type: '', value: '函数体', addr: '' },
                { id: 'f2', label: 'Point::move()', type: '', value: '函数体', addr: '' }
              ]}
            ],
            note: '函数存在代码段，和对象分开'
          },
          {
            caption: '那问题来了：area() 怎么知道要算哪个对象的面积？答案是编译器在背后传了一个隐藏参数 —— this 指针，它指向"调用这个函数的那个对象"。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'x', label: 'p.x (int)', type: '', value: '3', addr: '0x7ffd9c4a2ba0' },
                { id: 'y', label: 'p.y (int)', type: '', value: '4', addr: '0x7ffd9c4a2ba4' },
                { id: 'this', label: 'this（隐藏参数）', type: 'Point*', value: '0x7ffd9c4a2ba0', addr: '0x7ffd9c4a2bb0', state: 'changed' }
              ]},
              { name: '代码段 Code', kind: 'code', cells: [
                { id: 'f1', label: 'Point::area()', type: '', value: '函数体', addr: '' }
              ]}
            ],
            arrows: [{ from: 'this', to: 'x', label: '指向调用者' }],
            note: 'p.area() 其实就是 area(&p)'
          },
          {
            caption: '再建一个对象 q：它有自己的一份 x、y，但和 p 共用代码段里那同一个 area()。调用 q.area() 时传的 this 就指向 q。这就是"多个对象、一份代码"。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'px', label: 'p.x', type: '', value: '3', addr: '0x7ffd9c4a2ba0' },
                { id: 'py', label: 'p.y', type: '', value: '4', addr: '0x7ffd9c4a2ba4' },
                { id: 'qx', label: 'q.x', type: '', value: '10', addr: '0x7ffd9c4a2ba8', state: 'changed' },
                { id: 'qy', label: 'q.y', type: '', value: '20', addr: '0x7ffd9c4a2bac', state: 'changed' }
              ]},
              { name: '代码段 Code', kind: 'code', cells: [
                { id: 'f1', label: 'Point::area()', type: '', value: '只有一份', addr: '' }
              ]}
            ],
            note: '对象里存"状态"，代码段里存"行为"'
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '这个结论能解释很多现象',
        text: '既然成员函数不占对象空间，那 `sizeof` 自然与"类里写了几个函数"无关（只有虚函数例外，见本章最后一部分）。\n\n也正因为如此，**成员函数和普通函数在性能上没有任何差别** —— 编译器把 `p.area()` 翻译成 `Point::area(&p)` 这种普通函数调用，多出来的只是一个地址参数。'
      },
      notes: '这一页是理解类的最关键一步。请务必让学生记住：对象里只有数据成员（以及虚函数指针），成员函数在代码段，所有对象共用。this 指针是编译器自动传的第一个参数，它不是成员变量，不占对象空间。'
    },

    /* ---------- 10. this 指针 ---------- */
    {
      type: 'code',
      eyebrow: 'this 指针',
      title: '`*this` 就是"我自己"',
      lead: '成员函数里可以直接写 `this`。它最常见的用法，是把对象自己返回出去 —— 于是就能一直点下去。',
      code: {
        file: 'chaining.cpp',
        source: `#include <iostream>

class Counter {
public:
    // 返回 *this（也就是"我自己"），后面还能接着调用
    Counter& add(int n) {
        value_ += n;
        return *this;
    }
    int value() const { return value_; }

private:
    int value_ = 0;
};

int main() {
    Counter c;
    c.add(1).add(2).add(3);              // 链式调用
    std::cout << "c.value() = " << c.value() << std::endl;

    Counter d;
    d.add(100);                          // 改的是 d，不是 c

    std::cout << "c 没被影响: " << c.value()
              << "，d = " << d.value() << std::endl;

    return 0;
}`,
        expectedOutput: `c.value() = 6
c 没被影响: 6，d = 100`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '为什么返回 `Counter&` 而不是 `Counter`',
          text: '返回 `Counter&`（引用）时，返回的是**对象自己**，不会产生拷贝；返回 `Counter` 会**复制一份**出来，链式调用改的就是副本了。\n\n`std::cout << a << b` 能一直写下去，用的就是这个技巧 —— `operator<<` 返回的是流对象自己的引用。'
        }
      },
      notes: 'this 指针是编译器隐式加的，不能显式声明，但在成员函数里可以直接用。最典型的用途就是返回 *this 实现链式调用。注意返回类型要写成引用（Counter&），否则会拷贝一份，链式调用就失去意义了。'
    },

    /* ---------- 11. 分节 03 ---------- */
    {
      type: 'section',
      num: '03',
      title: '构造与析构',
      sub: '对象的出生与死亡',
      lead: 'C++ 最有特色的设计之一：对象"出生"和"死亡"这两个时刻，都有代码会自动执行。',
      notes: '接下来是 C++ 里非常有特色的一块：构造函数和析构函数。它们特殊在"不需要你调用"——对象创建时自动调用构造函数，对象销毁时自动调用析构函数。这个自动性，是后面所有资源管理技术的基础。'
    },

    /* ---------- 12. 构造函数与初始化列表 ---------- */
    {
      type: 'code',
      eyebrow: '构造函数',
      title: '初始化列表：成员是在"进函数体之前"就构造好的',
      lead: '构造函数的函数体执行时，所有成员**已经构造完成了**。所以能在这里做的，是"赋值"，不是"初始化"。',
      code: {
        file: 'ctor_order.cpp',
        source: `#include <iostream>

class Member {
public:
    Member(int id) { std::cout << "  构造成员 #" << id << std::endl; }
};

class Owner {
public:
    // 注意：初始化列表写的是 b 在前、a 在后
    Owner() : b(1), a(2) {
        std::cout << "Owner 构造完成" << std::endl;
    }

private:
    Member a;      // 声明顺序：a 在前
    Member b;      // 声明顺序：b 在后
};

int main() {
    std::cout << "开始构造" << std::endl;
    Owner o;
    std::cout << "结束" << std::endl;
    (void)o;
    return 0;
}`,
        expectedOutput: `开始构造
  构造成员 #2
  构造成员 #1
Owner 构造完成
结束`,
        note: {
          kind: 'trap',
          title: '初始化列表的顺序是"写给你看的"，构造顺序只看声明',
          text: '上面的输出里，**#2 先出现、#1 后出现** —— 因为成员 `a` 虽然写在列表的后面，但它在类里**声明得更早**，所以先构造。\n\n**实际顺序永远等于声明顺序**，初始化列表里怎么写都改变不了它。这是 C++ 里一个经典陷阱：如果两个成员互相依赖（比如 `b` 的初始化用到了 `a`），按列表顺序去读代码就会得出错误结论。\n\n编译器其实**知道这件事**，加 `-Wreorder` 就会警告你列表顺序和声明顺序不一致（本项目为了让输出干净，统一关掉了警告）。'
        }
      },
      notes: '这一页有两个要点。第一，初始化列表和函数体赋值的区别：成员在进入函数体之前就已经构造好了，所以对 const 成员、引用成员、没有默认构造函数的成员，只能在初始化列表里初始化。第二，初始化列表的书写顺序不影响实际构造顺序，实际顺序永远是声明顺序 —— 这个坑在成员互相依赖时非常致命。'
    },

    /* ---------- 13. 析构函数与析构顺序 ---------- */
    {
      type: 'code',
      eyebrow: '析构函数',
      title: '析构顺序：和构造完全相反',
      lead: '一个对象**离开它的作用域**时，析构函数自动执行。多个对象共存时，按构造的逆序销毁。',
      code: {
        file: 'dtor_order.cpp',
        source: `#include <iostream>

class Tracer {
public:
    Tracer(const char* name) : name_(name) {
        std::cout << "构造 " << name_ << std::endl;
    }
    ~Tracer() {
        std::cout << "析构 " << name_ << std::endl;
    }

private:
    const char* name_;
};

int main() {
    std::cout << "--- main 开始 ---" << std::endl;
    Tracer a("a");

    {
        Tracer b("b");
        Tracer c("c");
        std::cout << "--- 离开内层作用域 ---" << std::endl;
    }                                    // b、c 在这里被销毁

    std::cout << "--- main 结束 ---" << std::endl;
    return 0;                            // a 在这里被销毁
}`,
        expectedOutput: `--- main 开始 ---
构造 a
构造 b
构造 c
--- 离开内层作用域 ---
析构 c
析构 b
--- main 结束 ---
析构 a`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '为什么要"逆序"',
          text: '因为后面的对象**可能依赖前面的对象**。比如先构造一个 `Logger`，再用它构造一个 `Connection`；销毁时必须先销毁 `Connection`（还在用它），再销毁 `Logger`。逆序销毁保证了"依赖者先死"。\n\n同一个对象内部也一样：成员按声明顺序构造，按**声明的逆序**销毁，析构函数体最后执行。'
        }
      },
      notes: '析构函数在对象离开作用域时自动调用，顺序是构造的逆序。这个"自动"是 C++ 资源管理的基石：只要把资源和某个对象的生命周期绑定，就不用再记得手动释放。下一节的 RAII 就是这个思想。'
    },

    /* ---------- 14. 拷贝构造函数 ---------- */
    {
      type: 'code',
      eyebrow: '拷贝构造',
      title: '默认的拷贝构造函数，只是"逐字节复制"',
      lead: '当类里只有普通成员时，默认拷贝没问题。**一旦类里直接管理了资源，默认拷贝就是灾难**。',
      code: {
        file: 'deep_copy.cpp',
        source: `#include <iostream>
#include <cstring>

class Buffer {
public:
    explicit Buffer(const char* text) {
        size_ = static_cast<int>(std::strlen(text)) + 1;
        data_ = new char[size_];
        std::strcpy(data_, text);
        std::cout << "分配了 " << size_ << " 字节" << std::endl;
    }

    // 自己写的拷贝构造函数：又申请了一块新内存，把内容复制过去
    Buffer(const Buffer& other) {
        size_ = other.size_;
        data_ = new char[size_];
        std::strcpy(data_, other.data_);
        std::cout << "拷贝构造：另分配了一块新内存" << std::endl;
    }

    ~Buffer() {
        delete[] data_;
        std::cout << "释放内存" << std::endl;
    }

    const char* text() const { return data_; }
    bool sharesMemoryWith(const Buffer& other) const {
        return data_ == other.data_;
    }

private:
    char* data_ = nullptr;
    int   size_ = 0;
};

int main() {
    Buffer a("hello");
    Buffer b = a;                     // 调用拷贝构造函数

    std::cout << "内容相同吗? " << (std::strcmp(a.text(), b.text()) == 0) << std::endl;
    std::cout << "指向同一块内存吗? " << a.sharesMemoryWith(b) << std::endl;

    return 0;
}`,
        expectedOutput: `分配了 6 字节
拷贝构造：另分配了一块新内存
内容相同吗? 1
指向同一块内存吗? 0
释放内存
释放内存`,
        note: {
          kind: 'trap',
          title: '如果照抄默认行为，会死在这里',
          text: '把上面那个拷贝构造函数**删掉**，编译器生成的默认版本会简单地把 `data_` 指针**按位复制**过去。于是 `a` 和 `b` 的 `data_` 指向**同一块堆内存**。\n\n接下来 `main` 结束：`b` 先析构，`delete[] data_`；`a` 再析构，**又 `delete[]` 一次同一块内存** —— 这就是经典的 **double free**，程序当场崩溃，而且崩溃位置常常离真正的错误很远。\n\n即使侥幸没崩，还会留下另一个隐患：只要其中一个对象还活着，另一个的指针就已经悬空了。'
        }
      },
      notes: '这一页是这一节的重点。要讲清楚两件事：第一，默认拷贝构造函数做的是"浅拷贝"，对指针成员只是把地址复制一份；第二，浅拷贝对"管理着资源的类"是有害的，会 double free。解决办法就是自己写拷贝构造函数做深拷贝 —— 也就是上面这个例子的写法。'
    },

    /* ---------- 15. 三法则 ---------- */
    {
      type: 'cards',
      eyebrow: '一条经验规则',
      title: '三法则：写一个，就得写全三个',
      lead: '析构函数、拷贝构造函数、拷贝赋值运算符 —— 这三件事要么都不写，要么都写。',
      cards: [
        {
          icon: 'alert',
          heading: '什么时候需要自己写',
          body: '类里**直接管理了资源**的时候：`new` 出来的内存、打开的文件、加锁的互斥量……只要某个东西需要"手动还回去"，就要考虑三法则。'
        },
        {
          icon: 'copy',
          heading: '为什么是"三个一起"',
          body: '它们回答的是同一个问题：**"这个对象被复制/销毁时，资源怎么办"**。只写了析构函数（会释放内存），却用默认的拷贝构造（会共享指针），必然双删。'
        },
        {
          icon: 'shield',
          heading: '更好的选择：干脆禁止拷贝',
          body: '写 `Buffer(const Buffer&) = delete;` 就明确告诉编译器"这个类不许复制"，一旦有人复制，**编译期直接报错**，比运行时崩溃好得多。'
        },
        {
          icon: 'smartptr',
          heading: '最好的选择：别自己管',
          body: '用 `std::string`、`std::vector`、`std::unique_ptr` 这些现成的类，**它们已经正确地实现了三法则**。你只管用，不用写。第 9 章会讲智能指针。'
        }
      ],
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '到了 C++11 变成"五法则"',
        text: 'C++11 增加了**移动构造**和**移动赋值**，于是"三法则"扩展成了"五法则"：析构、拷贝构造、拷贝赋值、移动构造、移动赋值。\n\n不过在实际项目里，最常见的做法是上面第四张卡片：**用现成的 RAII 类型，一条都不用写**。第 9 章会详细讲移动语义。'
      },
      notes: '三法则（Rule of Three）是 C++ 里最著名的经验规则之一，一定要讲透。它的价值在于：让你在写析构函数的那一刻就意识到"我是不是还得处理拷贝"，而不是等到程序 double free 崩溃了才回头看。'
    },

    /* ---------- 16. RAII ---------- */
    {
      type: 'code',
      eyebrow: 'RAII',
      title: '用对象的生命周期管理资源',
      lead: '把"获取资源"放进构造函数，把"释放资源"放进析构函数 —— 于是**不管函数怎么退出，资源都会被释放**。',
      code: {
        file: 'raii.cpp',
        source: `#include <iostream>

// 构造时"打开"，析构时"关闭" —— 资源的生命周期跟着对象走
class FileGuard {
public:
    explicit FileGuard(const char* name) : name_(name) {
        std::cout << "打开文件 " << name_ << std::endl;
    }
    ~FileGuard() {
        std::cout << "关闭文件 " << name_ << std::endl;
    }

private:
    const char* name_;
};

void writeFile() {
    FileGuard f("data.txt");

    std::cout << "写入数据..." << std::endl;

    if (true) {
        std::cout << "中途提前返回" << std::endl;
        return;                 // 就算在这里 return，f 的析构函数照样执行
    }

    std::cout << "这行不会被执行" << std::endl;
}

int main() {
    writeFile();
    std::cout << "函数已经返回，文件早就关好了" << std::endl;
    return 0;
}`,
        expectedOutput: `打开文件 data.txt
写入数据...
中途提前返回
关闭文件 data.txt
函数已经返回，文件早就关好了`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: 'RAII 是 C++ 最核心的资源管理思想',
          text: 'RAII = Resource Acquisition Is Initialization（资源获取即初始化）。名字有点绕，思想很直白：**把资源的生命周期绑在对象的生命周期上**。\n\n它的价值在这个例子里：`writeFile` 中途 `return` 了，如果资源是手动释放的，你就会漏掉一行 `fclose`。而用 RAII，**编译器替你保证析构一定会执行** —— 无论是正常返回、提前 return，还是抛异常。\n\n`std::string`、`std::vector`、`std::fstream`、`std::lock_guard` 全都是 RAII 类型。这也是为什么现代 C++ 里几乎看不到手写的 `new` 和 `delete`。'
        }
      },
      notes: 'RAII 这个名字不好记，但思想很简单：让对象的析构函数负责释放资源。这个例子里刻意写了一个"中途 return"的分支，就是要说明 RAII 的价值 —— 手动管理资源时，每多一个提前返回的分支，就多一次忘记释放的机会。'
    },

    /* ---------- 17. 分节 04 ---------- */
    {
      type: 'section',
      num: '04',
      title: '继承',
      sub: '把「共同的」抽出来',
      lead: '当几种东西共享同一批属性和行为时，就该把它们共同的部分提取成一个基类。',
      notes: '接下来讲继承。它的动机很实际：如果 Dog、Cat、Bird 都要有名字、年龄、会呼吸，那么每个类都写一遍就是重复。继承让我们把共同的部分写一次，放在基类里。'
    },

    /* ---------- 18. 继承的基本用法 ---------- */
    {
      type: 'split',
      eyebrow: '基本概念',
      title: '`Dog` 是一种 `Animal`',
      lead: '这种 **is-a** 关系，就是用继承表达的。派生类自动拥有基类的全部成员。',
      points: [
        '共同的成员放在**基类**，特有的放在**派生类**',
        '`public` 继承表达 is-a —— 狗是一种动物',
        '`protected`：派生类可以访问，外部不行（给"子类"留的门）',
        '派生类没有新增成员时，**对象大小和基类一样**'
      ],
      code: {
        file: 'inherit.cpp',
        source: `#include <iostream>

class Animal {                        // 基类
public:
    void breathe() const {
        std::cout << name_ << " 在呼吸" << std::endl;
    }
    void setAge(int a) { age_ = a; }

protected:                            // 派生类能访问，外部不能
    int age_ = 0;

private:
    const char* name_ = "动物";
};

class Dog : public Animal {           // 派生类：Dog is-a Animal
public:
    void bark() const { std::cout << "汪汪" << std::endl; }
};

int main() {
    Dog d;
    d.bark();                         // 自己的成员
    d.breathe();                      // 继承来的成员
    d.setAge(3);

    // d.age_ = 5;                    // 取消注释会编译失败：protected 外部不可访问

    std::cout << "sizeof(Animal) = " << sizeof(Animal)
              << "，sizeof(Dog) = " << sizeof(Dog) << std::endl;
    return 0;
}`,
        expectedOutput: `汪汪
动物 在呼吸
sizeof(Animal) = 16，sizeof(Dog) = 16`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '为什么两者一样大',
          text: '`Dog` 没有新增任何成员，所以它的对象里只有从 `Animal` 继承来的那部分，大小自然一样（都是 8 字节指针 + 4 字节 int + 4 字节填充）。\n\n这也说明继承**不会**给对象加上什么"继承标记" —— 它就是老老实实地把基类的成员放在最前面。下一页把这件事画出来。'
        }
      },
      notes: '继承的语法是 class 派生类 : public 基类。三个访问权限要讲清楚：public 谁都能用，protected 只有自己和派生类能用，private 只有自己能用。另外提醒一点：public 继承才是 is-a 关系；private 继承在语义上是"用基类来实现"（has-a 的替代），实际项目里很少用。'
    },

    /* ---------- 19. 派生类对象的内存布局【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '对象布局',
      title: '派生类对象里，基类那部分在最前面',
      lead: '一个 `Dog` 对象 = 一个 `Animal` 子对象 + `Dog` 自己新增的成员。顺序是标准规定的。',
      memory: {
        title: '派生类对象的内存布局',
        steps: [
          {
            caption: '先看基类 Animal 自己的对象：8 字节的指针 + 4 字节的 int，为了让整个对象对齐到 8 字节，末尾补 4 字节填充，一共 16 字节。',
            regions: [
              { name: 'Animal 对象的内存（16 字节）', kind: 'stack', cells: [
                { id: 'name', label: 'name_ (const char*)', type: '', value: 'ptr', addr: '0x7ffd9c4a2ba0' },
                { id: 'age', label: 'age_ (int)', type: '', value: '3', addr: '0x7ffd9c4a2ba8' },
                { id: 'pad', label: '填充', type: '', value: '', addr: '0x7ffd9c4a2bac', state: 'freed' }
              ]}
            ]
          },
          {
            caption: '再看 Dog 对象 —— 假设 Dog 自己新增了一个成员 breed_。对象里【先】放从 Animal 继承来的部分，【再】放自己的：这就是"基类子对象在前"。',
            regions: [
              { name: 'Dog 对象的内存（24 字节）', kind: 'stack', cells: [
                { id: 'name', label: 'name_（继承自 Animal）', type: '', value: 'ptr', addr: '0x7ffd9c4a2bc0' },
                { id: 'age', label: 'age_（继承自 Animal）', type: '', value: '3', addr: '0x7ffd9c4a2bc8' },
                { id: 'pad', label: '填充', type: '', value: '', addr: '0x7ffd9c4a2bcc', state: 'freed' },
                { id: 'breed', label: 'breed_（Dog 自己的）', type: '', value: 'ptr', addr: '0x7ffd9c4a2bd0', state: 'changed' }
              ]}
            ],
            note: '顺序是标准规定的，不是编译器随便排的'
          },
          {
            caption: '正因为基类部分在最前面，`Animal* p = &d;` 这一步编译器什么都不用做 —— Dog 对象的起始地址，就是它那个 Animal 子对象的地址，两者数值完全相同。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'd', label: 'Dog 对象', type: '', value: 'name_, age_, breed_', addr: '0x7ffd9c4a2bc0' },
                { id: 'p', label: 'p (Animal*)', type: '', value: '0x7ffd9c4a2bc0', addr: '0x7ffd9c4a2bd8', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'p', to: 'd', label: '地址相同' }],
            note: '（多继承时才会有偏移调整，本课不展开）'
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '这个布局就是"向上转型免费"的原因',
        text: '把派生类指针/引用当成基类用，在**单继承**下是**零开销**的 —— 不需要转换、不需要查表，因为两者的起始地址本来就相同。\n\n反过来的**向下转型**（把 `Animal*` 当 `Dog*` 用）就不一样了：编译器无法确定这个 Animal 到底是不是 Dog，这正是 `dynamic_cast` 存在的理由（本章最后一部分会讲）。'
      },
      notes: '这一页把继承的内存真相画出来。要强调两点：第一，派生类对象里包含一个完整的基类子对象，位置在最前面；第二，正因为如此，基类指针指向派生类对象时，地址不需要任何调整。这两点是理解多态的基础。'
    },

    /* ---------- 20. 构造与析构顺序 ---------- */
    {
      type: 'code',
      eyebrow: '继承下的生命周期',
      title: '构造：先基类后派生；析构：反过来',
      lead: '派生类可能用到基类的成员，所以基类必须**先构造好**；销毁时自然要**后销毁**。',
      code: {
        file: 'base_derived_order.cpp',
        source: `#include <iostream>

class Base {
public:
    Base()  { std::cout << "Base 构造" << std::endl; }
    ~Base() { std::cout << "Base 析构" << std::endl; }
};

class Derived : public Base {
public:
    Derived()  { std::cout << "Derived 构造" << std::endl; }
    ~Derived() { std::cout << "Derived 析构" << std::endl; }
};

int main() {
    std::cout << "--- 构造开始 ---" << std::endl;
    Derived d;
    std::cout << "--- 构造结束，进入作用域末尾 ---" << std::endl;
    return 0;
}`,
        expectedOutput: `--- 构造开始 ---
Base 构造
Derived 构造
--- 构造结束，进入作用域末尾 ---
Derived 析构
Base 析构`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '一句话记住',
          text: '**构造从里往外，析构从外往里。**\n\n"里"就是基类（被依赖的一方）。这条规则和对象内部的成员规则是同一回事：成员按声明顺序构造、逆序销毁，因为后面声明的成员可能依赖前面的。'
        }
      },
      notes: '构造顺序先基类后派生类，析构顺序正好相反。这个顺序不是随便定的：派生类的构造函数体里可能用到基类的成员，所以基类必须先构造好。反过来说，析构时派生类已经不需要基类了，所以派生类先销毁。'
    },

    /* ---------- 21. 名字隐藏 ---------- */
    {
      type: 'code',
      eyebrow: '一个坑',
      title: '派生类里的同名函数，会把基类的全"藏起来"',
      lead: '这不是重载，是**名字覆盖**：只要名字一样，基类里所有同名函数都被隐藏，哪怕参数完全不同。',
      code: {
        file: 'name_hiding.cpp',
        source: `#include <iostream>

struct Base {
    void show(int v) { std::cout << "Base::show(int)  " << v << std::endl; }
};

struct Derived : Base {
    void show(const char* s) {
        std::cout << "Derived::show(const char*)  " << s << std::endl;
    }

    // 想让基类的版本也能用，加这一行：
    // using Base::show;
};

int main() {
    Derived d;
    d.show("hello");           // 调用 Derived 的版本

    // d.show(42);             // 取消注释：编译失败！基类的 show(int) 被藏起来了

    return 0;
}`,
        expectedOutput: `Derived::show(const char*)  hello`,
        note: {
          kind: 'trap',
          title: '编译器给的报错信息长这样',
          text: '把 `d.show(42)` 那行的注释去掉，clang 会告诉你：\n\n`error: cannot initialize a parameter of type \'const char *\' with an rvalue of type \'int\'`\n\n注意它**没有说"找不到 show(int)"**，因为在编译器看来，`Derived` 里就只有一个 `show` —— 基类那个根本没进入候选名单。\n\n解决办法就是那句 `using Base::show;`，它把基类的 `show` 重新"引进"派生类的作用域，于是两个版本可以共存、正常重载。'
        }
      },
      notes: '名字隐藏是继承里最容易踩的坑之一，而且报错信息具有误导性。要让学生记住：派生类作用域里的同名函数会遮蔽基类作用域里的全部同名函数，与参数无关。想恢复重载关系，就用 using 声明把它引进来。'
    },

    /* ---------- 22. 分节 05 ---------- */
    {
      type: 'section',
      num: '05',
      title: '多态与虚函数',
      sub: '本章的核心',
      lead: '同一行代码 `a.speak()`，为什么有时候输出"汪汪"，有时候输出"喵"？',
      notes: '这一节是整章的重点，也是 C++ 里最精彩的设计之一。我们先看一个"如果不用虚函数会怎样"的例子，再看加上 virtual 之后的变化，最后用内存图把虚函数表画出来。'
    },

    /* ---------- 23. 没有 virtual 会怎样 ---------- */
    {
      type: 'code',
      eyebrow: '先看问题',
      title: '没有虚函数：调用哪个函数，编译期就定死了',
      lead: '用基类的引用去调用，编译器只看**引用的类型**（`Animal`），根本不看你传进来的是狗还是猫。',
      code: {
        file: 'no_virtual.cpp',
        source: `#include <iostream>

class Animal {
public:
    void speak() const { std::cout << "动物发出声音" << std::endl; }
};

class Dog : public Animal {
public:
    void speak() const { std::cout << "汪汪" << std::endl; }
};

class Cat : public Animal {
public:
    void speak() const { std::cout << "喵" << std::endl; }
};

void letItSpeak(const Animal& a) {     // 参数是基类的引用
    a.speak();                         // 这里调用的是哪个版本？
}

int main() {
    Dog d;
    Cat c;

    letItSpeak(d);                     // 你期望"汪汪"
    letItSpeak(c);                     // 你期望"喵"

    d.speak();                         // 直接通过对象调用，是对的

    return 0;
}`,
        expectedOutput: `动物发出声音
动物发出声音
汪汪`,
        note: {
          kind: 'trap',
          title: '所以问题出在哪',
          text: '`letItSpeak` 的参数类型是 `const Animal&`，编译器在**编译期**就决定了要调用 `Animal::speak` —— 依据是**静态类型**（写在代码里的类型），而不是运行期那个对象真正的类型。\n\n这种"编译期定死"的叫**静态绑定**（早期绑定）。它的好处是快（可以直接内联），代价就是失去了多态能力：**一份代码无法适配多种类型**。'
        }
      },
      notes: '先让学生看到问题。letItSpeak 是一个"通用"函数，本来想让它对任何动物都能说话，结果它永远只会说"动物发出声音"。这就是没有多态时的困境：想支持新类型，就得为它重写一份函数。'
    },

    /* ---------- 24. 加上 virtual ---------- */
    {
      type: 'code',
      eyebrow: '解决问题',
      title: '加上一个 `virtual`，行为完全不同',
      lead: '同一个 `letItSpeak` 函数、同一行 `a.speak()` —— 现在它会根据**对象的实际类型**选择函数。',
      code: {
        file: 'with_virtual.cpp',
        source: `#include <iostream>

class Animal {
public:
    virtual void speak() const {          // 只多了这一个关键字
        std::cout << "动物发出声音" << std::endl;
    }
    virtual ~Animal() = default;          // 基类的析构函数也应该是虚的（下一页讲）
};

class Dog : public Animal {
public:
    void speak() const override { std::cout << "汪汪" << std::endl; }
};

class Cat : public Animal {
public:
    void speak() const override { std::cout << "喵" << std::endl; }
};

void letItSpeak(const Animal& a) {        // 这个函数一个字都不用改
    a.speak();
}

int main() {
    Dog d;
    Cat c;

    letItSpeak(d);                        // 现在是"汪汪"
    letItSpeak(c);                        // 现在是"喵"

    return 0;
}`,
        expectedOutput: `汪汪
喵`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '这就是多态',
          text: '**同一个函数调用，根据对象的实际类型，执行不同的代码** —— 这叫**动态绑定**（运行期绑定）。\n\n它的价值在于 `letItSpeak` 这个函数：它写的时候**完全不需要知道**以后会出现什么动物。你后来加了 `Bird`、`Fish`，这个函数一个字都不用动。\n\n`override` 是 C++11 加的：它让编译器帮你检查"我确实重写了基类的虚函数"。万一基类里那个函数忘了写 `virtual`，或者参数签名写错了，`override` 会直接报错，而不用等到运行时才发现"怎么没生效"。'
        }
      },
      notes: '同一个函数，加一个 virtual 就完全不同了。注意 override 关键字：它不是必须的，但强烈建议写 —— 它把"到底有没有成功重写"这件事交给编译器检查。没有它，一个参数类型写错的函数会变成一个全新的普通函数，编译器一声不吭，而你在运行时才发现多态没生效。'
    },

    /* ---------- 25. 虚函数表【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '实现原理',
      title: '多态是怎么实现的：虚函数表',
      lead: '编译器并没有"在运行期查找哪个函数"这种魔法 —— 它靠的是对象里的一个隐藏指针。',
      memory: {
        title: '虚函数表（vtable）与虚表指针（vptr）',
        steps: [
          {
            caption: '先看一个【没有虚函数】的类：对象里就只有成员变量，一个字节都不多。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'name', label: 'd.name_', type: '', value: '"旺财"', addr: '0x7ffd9c4a2ba0' },
                { id: 'age', label: 'd.age_', type: '', value: '3', addr: '0x7ffd9c4a2ba8' }
              ]}
            ]
          },
          {
            caption: '类里一旦出现 virtual，编译器就在每个对象的最前面塞一个隐藏指针：vptr（虚表指针）。对象因此变大了 —— 原来 16 字节，现在 24 字节。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'vptr', label: 'vptr（编译器加的）', type: '', value: '0x55a0f3e1d010', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'name', label: 'd.name_', type: '', value: '"旺财"', addr: '0x7ffd9c4a2ba8' },
                { id: 'age', label: 'd.age_', type: '', value: '3', addr: '0x7ffd9c4a2bb0' }
              ]}
            ],
            note: '一个指针 8 字节，代价在这里'
          },
          {
            caption: 'vptr 指向一张表，叫虚函数表（vtable）。表里按顺序排着这个类各个虚函数的地址 —— 这张表是【每个类一张】，Dog 的所有对象共用它。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'vptr', label: 'd 的 vptr', type: '', value: '0x55a0f3e1d010', addr: '0x7ffd9c4a2ba0' }
              ]},
              { name: '只读数据 · 虚函数表（Dog 的）', kind: 'global', cells: [
                { id: 'vt0', label: 'vtable[0]', type: '', value: '&Dog::speak', addr: '0x55a0f3e1d010', state: 'changed' },
                { id: 'vt1', label: 'vtable[1]', type: '', value: '&Dog::eat', addr: '0x55a0f3e1d018' }
              ]}
            ],
            arrows: [{ from: 'vptr', to: 'vt0', label: 'vptr' }]
          },
          {
            caption: '`a.speak()` 真正做的事分三步：① 顺着对象里的 vptr 找到表 ② 取出表里存放的 speak 地址 ③ 跳到那个地址执行。表里存的是【函数地址】，指向代码段里的函数体。',
            regions: [
              { name: '只读数据 · 虚函数表（Dog 的）', kind: 'global', cells: [
                { id: 'vt0', label: 'vtable[0] = speak 的地址', type: '', value: '0x55a0f3e1e010', addr: '0x55a0f3e1d010' }
              ]},
              { name: '代码段 Code', kind: 'code', cells: [
                { id: 'fs', label: 'Dog::speak()', type: '', value: '函数体', addr: '0x55a0f3e1e010', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'vt0', to: 'fs', label: '跳到这个地址' }]
          },
          {
            caption: '最关键的一步：Dog 对象和 Cat 对象的 vptr 指向【各自不同的表】。而调用方只有一句"顺着 vptr 查表" —— 编译期根本不知道会是狗还是猫，只有运行期查出来才知道。这就是多态。',
            regions: [
              { name: '栈 Stack', kind: 'stack', cells: [
                { id: 'dv', label: 'Dog 对象的 vptr', type: '', value: '0x55a0f3e1d010', addr: '0x7ffd9c4a2ba0' },
                { id: 'cv', label: 'Cat 对象的 vptr', type: '', value: '0x55a0f3e1d030', addr: '0x7ffd9c4a2bc0', state: 'changed' }
              ]},
              { name: '只读数据 · 两张不同的虚函数表', kind: 'global', cells: [
                { id: 'dvt', label: 'Dog 的表[0]', type: '', value: '&Dog::speak', addr: '0x55a0f3e1d010' },
                { id: 'cvt', label: 'Cat 的表[0]', type: '', value: '&Cat::speak', addr: '0x55a0f3e1d030', state: 'changed' }
              ]}
            ],
            arrows: [{ from: 'dv', to: 'dvt' }, { from: 'cv', to: 'cvt' }]
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: 'vtable 不是"额外的查找"，只是多一次内存访问',
        text: '整个机制的开销是：**每个对象多一个指针**（8 字节），**每次虚函数调用多一次内存跳转**（先读 vptr，再读表项）。这个开销是常数级的，不随类的数量增长。\n\n代价是虚函数**通常无法被内联**（编译器不知道最终会调到哪个函数）。所以 C++ 的默认选择是：**不写 virtual 就没有任何开销** —— 这也正是"零开销抽象"这个说法的一个例子。'
      },
      notes: '这一页请放慢速度，一步一步走。核心是三句话：对象里多了 vptr；vptr 指向类专属的 vtable；vtable 里存的是函数地址。把这三句话记住，多态就再也不是"魔法"了。另外要强调：vtable 是每个类一张，不是每个对象一张 —— 这是很多人的误解。'
    },

    /* ---------- 26. 静态绑定 vs 动态绑定 ---------- */
    {
      type: 'compare',
      eyebrow: '对比',
      title: '静态绑定与动态绑定',
      lead: '一个在编译期就把函数地址写死，一个留到运行期查表。这是 C++ 里**性能与灵活性**最典型的一次取舍。',
      table: {
        head: ['', '普通函数（静态绑定）', '虚函数（动态绑定）'],
        rows: [
          ['谁来决定', '编译器，编译期就定死', '运行期查 vtable 才知道'],
          ['依据是什么', '指针/引用的**静态类型**', '对象的**实际类型**'],
          ['怎么调用', '直接跳到一个固定地址', '读 vptr → 查表 → 间接跳转'],
          ['能不能内联', '可以，零开销', '通常不能（不知道跳哪去）'],
          ['对象大小', '不变', '每个对象多 8 字节（vptr）'],
          ['什么时候用', '默认就用它', '需要通过基类接口处理多种类型时']
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: 'C++ 的默认选择',
        text: 'C++ 把"不写 virtual 就没有任何运行时开销"作为默认，这和 Java、C# 恰好相反（那些语言里方法默认就是虚的）。\n\n这个设计体现了 C++ 的一贯取向：**你不用的东西，不该让你付出代价**。所以写类的时候先别急着加 `virtual` —— 想清楚"这个类会不会被继承着、通过基类指针使用"，再决定。'
      },
      notes: '这张表把两种绑定的差别列全了。特别提醒内联这一条：虚函数调用无法内联，这在热路径上是实打实的时间开销，所以高性能代码里经常要避免在热点上频繁调用虚函数。'
    },

    /* ---------- 27. 虚析构函数 ---------- */
    {
      type: 'code',
      eyebrow: '必修课',
      title: '基类的析构函数，必须是虚的',
      lead: '用基类指针 `delete` 一个派生类对象时，如果析构函数不是虚的 —— **派生类的析构函数根本不会被调用**。',
      code: {
        file: 'virtual_dtor.cpp',
        source: `#include <iostream>

class Base {
public:
    Base()  { std::cout << "Base 构造" << std::endl; }
    ~Base() { std::cout << "Base 析构" << std::endl; }     // 不是虚函数
};

class Derived : public Base {
public:
    Derived()  { std::cout << "Derived 构造" << std::endl; }
    ~Derived() { std::cout << "Derived 析构" << std::endl; }
};

int main() {
    Base* p = new Derived();

    delete p;      // 只调用了 Base 的析构 —— Derived 的析构被跳过了

    std::cout << "注意看：少了一行 Derived 析构" << std::endl;
    return 0;
}`,
        expectedOutput: `Base 构造
Derived 构造
Base 析构
注意看：少了一行 Derived 析构`,
        note: {
          kind: 'trap',
          title: '这是未定义行为，而且后果很实际',
          text: '用基类指针删除派生类对象、基类析构又非虚 —— 这是**未定义行为**。上面的输出是本机 clang 的真实表现：派生类的析构函数**没有被调用**。\n\n后果不是"少打印一行"，而是：**派生类申请的资源全部泄漏了**。`Derived` 的析构函数才是负责 `delete` 自己那些成员的地方，它没跑，那些内存就再也没人释放。\n\n**规则：只要一个类可能被继承、并且可能通过基类指针 delete，析构函数就必须是 `virtual`。** 拿不准就写上 —— 代价只是一个 vptr。'
        }
      },
      notes: '这一页要讲透。先让学生看输出：少了"Derived 析构"那一行。然后追问：如果 Derived 的构造函数里 new 了一块内存，谁来释放？答案是没人释放，泄漏了。所以基类的析构函数必须是虚的。实际项目里有一个简单的判断法：只要类里有任何一个虚函数，就把析构函数也写成虚的。'
    },

    /* ---------- 28. 纯虚函数与抽象类 ---------- */
    {
      type: 'split',
      eyebrow: '接口',
      title: '纯虚函数与抽象类',
      lead: '把 `= 0` 写在虚函数后面，它就变成**纯虚函数**：基类只规定"必须有什么"，不规定"怎么做"。',
      points: [
        '**纯虚函数**：`virtual double area() const = 0;` —— 只声明，不实现',
        '含有纯虚函数的类是**抽象类**，**不能创建对象**',
        '派生类必须实现全部纯虚函数，否则它也是抽象类',
        '`override`：让编译器帮你检查有没有真的重写成功',
        '`final`：禁止再被继承或重写'
      ],
      code: {
        file: 'abstract.cpp',
        source: `#include <iostream>

class Shape {                                   // 抽象类：描述"所有图形都该有什么"
public:
    virtual double area() const = 0;            // 纯虚函数
    virtual const char* name() const = 0;
    virtual ~Shape() = default;                 // 基类析构要虚
};

class Circle : public Shape {
public:
    explicit Circle(double r) : r_(r) {}
    double area() const override { return 3.14159265 * r_ * r_; }
    const char* name() const override { return "圆"; }

private:
    double r_;
};

class Rect : public Shape {
public:
    Rect(double w, double h) : w_(w), h_(h) {}
    double area() const override { return w_ * h_; }
    const char* name() const override { return "矩形"; }

private:
    double w_, h_;
};

void describe(const Shape& s) {                 // 只认"图形"这个抽象概念
    std::cout << s.name() << " 的面积 = " << s.area() << std::endl;
}

int main() {
    Circle c(1.0);
    Rect   r(3.0, 4.0);

    describe(c);
    describe(r);

    // Shape s;                                  // 编译失败：抽象类不能实例化

    return 0;
}`,
        expectedOutput: `圆 的面积 = 3.14159
矩形 的面积 = 12`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '抽象类 = 一份"合同"',
          text: '`Shape` 没有实现任何东西，它只规定了"凡是图形，都必须能报出自己的名字和面积"。于是 `describe` 这个函数可以放心地调用 `s.area()` —— 因为**能传进来的对象一定实现了它**。\n\n这就是面向对象里"面向接口编程"的含义：**调用方依赖抽象，而不是具体实现**。\n\n`override` 一定要写。如果 `area` 的参数写错、或者基类忘了加 `virtual`，`override` 会让编译器立刻报错；不写的话，编译器会认为你在定义一个新函数，多态悄悄失效，只能靠运行时调试去发现问题。'
        }
      },
      notes: '纯虚函数和抽象类是把"接口"这个概念落到语法上的方式。要强调 override 的价值：它是一个纯编译期的安全检查，写了没有任何运行时代价，但能挡掉一整类隐蔽 bug。'
    },

    /* ---------- 29. 构造/析构里调用虚函数 ---------- */
    {
      type: 'code',
      eyebrow: '另一个陷阱',
      title: '构造函数里调用虚函数，不会多态',
      lead: '构造基类那部分的时候，派生类那部分**还不存在** —— 所以此时只能调用到基类的版本。',
      code: {
        file: 'virtual_in_ctor.cpp',
        source: `#include <iostream>

class Base {
public:
    Base() {
        init();                       // 构造函数里调用虚函数
    }
    virtual void init() const {
        std::cout << "Base::init" << std::endl;
    }
    virtual ~Base() = default;
};

class Derived : public Base {
public:
    void init() const override {
        std::cout << "Derived::init" << std::endl;
    }
};

int main() {
    Derived d;                        // 构造过程中，Derived 的部分还没建好
    d.init();                         // 对象构造完成后，多态就正常了

    return 0;
}`,
        expectedOutput: `Base::init
Derived::init`,
        note: {
          kind: 'trap',
          title: '为什么不是 Derived::init',
          text: '构造 `Derived` 的顺序是：**先构造基类 `Base` 的部分**。执行 `Base` 的构造函数时，`Derived` 的成员还没初始化，对象此刻的"身份"就是 `Base` —— 所以它的 vptr 指向的还是 `Base` 的虚函数表。\n\n析构时同理：`Derived` 的析构函数执行完之后，对象的身份退回 `Base`，之后调用的虚函数也不再是多态版本。\n\n**结论：不要在构造/析构函数里调用虚函数并指望多态。** 如果确实需要"初始化后执行一段逻辑"，就在对象构造完成之后显式调用（像上面 `main` 里的第二行那样）。'
        }
      },
      notes: '这个陷阱的原理回到 vptr：对象在构造过程中，vptr 是分阶段设置的 —— 构造基类部分时，vptr 指向基类的虚函数表；进入派生类构造函数时，才会改成派生类的表。所以基类构造函数里看到的"虚函数表"就是基类自己的。理解了 vptr，这个现象就顺理成章了。'
    },

    /* ---------- 30. 分节 06 ---------- */
    {
      type: 'section',
      num: '06',
      title: '对象的大小',
      sub: '一个对象到底占多少字节',
      lead: '空类为什么占 1 字节？加了虚函数为什么会变大？这一节把 `sizeof` 算清楚。',
      notes: '这一节我们回到很实际的问题：一个对象到底占多少字节。第 7 章讲过结构体的对齐和填充，类的规则是一样的，只多了一个变量：虚函数指针。'
    },

    /* ---------- 31. sizeof 一览表 ---------- */
    {
      type: 'compare',
      eyebrow: '实测',
      title: '各种类的大小（64 位平台实测）',
      lead: '下面每个数字都是在 64 位机器上 `sizeof` 出来的真实结果，不是算出来的。',
      table: {
        head: ['类的写法', 'sizeof', '为什么'],
        rows: [
          ['`class Empty {};`', '1', '空类也必须占 1 字节 —— 每个对象要有**唯一的地址**'],
          ['`class OnlyFunc { void f(); };`', '1', '成员函数**不占对象空间**，代码只有一份'],
          ['`struct { char c; int i; };`', '8', '1 + 3 填充 + 4 —— 第 7 章讲过的对齐'],
          ['`struct { int i; char c; };`', '8', '4 + 1 + 3 尾部填充 —— **顺序不同，填充位置不同**'],
          ['`class V { int x; virtual void f(); };`', '16', 'vptr(8) + x(4) + 填充(4)：有虚函数就多 8 字节'],
          ['`struct F : Empty { int i; };`', '4', '**空基类优化**：基类那 1 字节被压掉了']
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '两个容易忽略的地方',
        text: '**一、为什么有虚函数之后是 16 而不是 12？** 因为 vptr 是 8 字节，对象里有一个 8 字节成员，整个对象的对齐要求就变成 8 —— 于是末尾还要补 4 字节填充。`vptr(8) + x(4) + 填充(4) = 16`。\n\n**二、为什么 `char c; int i;` 和 `int i; char c;` 一样大？** 前者是中间填 3 字节，后者是尾部填 3 字节，总量相同。但如果是 `char a; char b; char c; int i;`，前三个 char 挤在一起，就只需要填充 1 字节，一共 8 字节 —— 比写成 `char a; int i; char b; char c;`（12 字节）更省。'
      },
      notes: '这张表建议让学生自己动手跑一遍。要点：空类为什么是 1 不是 0（因为要保证两个不同对象的地址不同）；成员函数不占空间；虚函数带来的 8 字节；以及顺序对填充的影响。'
    },

    /* ---------- 32. vptr 与填充【内存图】 ---------- */
    {
      type: 'memory',
      eyebrow: '拆开看',
      title: '4 字节是怎么变成 16 字节的',
      lead: '一个有 `int` 成员和一个虚函数的类，直觉上该占 4 字节。实际是 16。',
      memory: {
        title: '虚函数带来的对象膨胀',
        steps: [
          {
            caption: '如果没有虚函数：类里只有一个 int，对象就占 4 字节。这是最省的情况。',
            regions: [
              { name: '对象的内存（4 字节）', kind: 'stack', cells: [
                { id: 'x', label: 'x (int)', type: '', value: '7', addr: '0x7ffd9c4a2ba0' }
              ]}
            ]
          },
          {
            caption: '加了虚函数之后：编译器在对象最前面插入 vptr。它占 8 字节，而且必须放在能被 8 整除的地址上，所以它排在偏移 0 的位置。',
            regions: [
              { name: '对象的内存', kind: 'stack', cells: [
                { id: 'vptr', label: 'vptr（编译器插入）', type: '', value: '0x55a0f3e1d010', addr: '0x7ffd9c4a2ba0', state: 'changed' },
                { id: 'x', label: 'x (int)', type: '', value: '7', addr: '0x7ffd9c4a2ba8' }
              ]}
            ],
            note: 'x 的偏移从 0 变成了 8'
          },
          {
            caption: '还没结束：整个对象里既然有一个 8 字节成员，对象本身就必须按 8 对齐，总大小也得是 8 的倍数。8 + 4 = 12，向上取到 16，末尾补 4 字节填充。',
            regions: [
              { name: '对象的内存（实际 16 字节）', kind: 'stack', cells: [
                { id: 'vptr', label: 'vptr', type: '', value: '0x55a0f3e1d010', addr: '0x7ffd9c4a2ba0' },
                { id: 'x', label: 'x (int)', type: '', value: '7', addr: '0x7ffd9c4a2ba8' },
                { id: 'pad', label: '填充 4 字节', type: '', value: '', addr: '0x7ffd9c4a2bac', state: 'freed' }
              ]}
            ],
            note: '8 + 4 + 4 = 16'
          },
          {
            caption: '顺便验证一下"顺序影响填充"：三个 char 加一个 int，一共 8 字节；换成 char、int、char、char 的写法就是 12 字节 —— 同样的成员，多了 4 字节全是填充。',
            regions: [
              { name: '两种写法的对比', kind: 'stack', cells: [
                { id: 'p1', label: 'char,char,char,int', type: '', value: '8 字节', addr: '' },
                { id: 'p2', label: 'char,int,char,char', type: '', value: '12 字节', addr: '', state: 'changed' }
              ]}
            ],
            note: '把小的成员排在一起，能省内存'
          }
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '什么时候该在意这些',
        text: '日常写业务代码时，**不必**为了省这几个字节去调整成员顺序 —— 可读性更重要。\n\n但有两种场景会在意：一是**内存敏感**的场合（嵌入式、海量对象），二是**和二进制打交道**的场合（网络协议、文件格式）。后者尤其要注意：填充字节里是**未初始化的垃圾数据**，直接 `memcpy` 一个结构体去发网络包，会把垃圾一起发出去，而且不同编译器填的东西还不一样。'
      },
      notes: '这一页把对象膨胀的全过程拆开：先加 vptr，再因为对齐补尾部填充。每一步都能从第 7 章的对齐规则推出来 —— 只是多了一个成员。'
    },

    /* ---------- 33. alignof 与 alignas ---------- */
    {
      type: 'code',
      eyebrow: '对齐控制',
      title: '`alignof` 与 `alignas`',
      lead: 'C++11 提供了两个关键字：一个问"你这个类型要求几字节对齐"，一个说"我要求按几字节对齐"。',
      code: {
        file: 'alignas.cpp',
        source: `#include <iostream>

struct Normal  { int x; };              // 默认对齐：跟 int 一样
struct alignas(16) Aligned { int x; };  // 强制按 16 字节对齐

int main() {
    std::cout << "sizeof(int)  = " << sizeof(int)
              << "，alignof(int)  = " << alignof(int) << std::endl;

    std::cout << "Normal  sizeof = " << sizeof(Normal)
              << "，alignof = " << alignof(Normal) << std::endl;

    std::cout << "Aligned sizeof = " << sizeof(Aligned)
              << "，alignof = " << alignof(Aligned) << std::endl;

    std::cout << "只加了对齐要求，对象就大了 "
              << sizeof(Aligned) - sizeof(Normal) << " 字节" << std::endl;

    return 0;
}`,
        expectedOutput: `sizeof(int)  = 4，alignof(int)  = 4
Normal  sizeof = 4，alignof = 4
Aligned sizeof = 16，alignof = 16
只加了对齐要求，对象就大了 12 字节`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '什么时候需要 alignas',
          text: '最常见的场景是**配合 SIMD 指令**：`SSE` 要求 16 字节对齐，`AVX` 要求 32 字节对齐，不对齐会直接崩溃或者性能暴跌。\n\n另一个场景是**避免伪共享**（false sharing）：多线程程序里，两个线程各自频繁修改的变量如果落在同一条缓存行（通常 64 字节）上，会互相把对方的缓存打掉，性能急剧下降。把它们用 `alignas(64)` 分开就能解决。\n\n`alignof` 只在查询时有用：写模板时经常需要知道一个类型的对齐要求，比如自己实现内存池。'
        }
      },
      notes: 'alignof 和 alignas 是 C++11 引入的。这一页的价值在于让学生知道"对齐"这件事是可以主动控制的，而且在对性能敏感的场景里很重要。如果课上时间紧，这一页可以略过，只讲上面那张 sizeof 表。'
    },

    /* ---------- 34. 分节 07 ---------- */
    {
      type: 'section',
      num: '07',
      title: '四种类型转换',
      sub: '把转换的意图写清楚',
      lead: 'C 风格的 `(int)x` 什么都能转、什么错都不报。C++ 把它拆成四种，每种只做一件事。',
      notes: '最后一部分讲类型转换。C 语言里只有一种写法：(类型)值。它太宽松了，什么都能转，出了错编译器也不吭声。C++ 把它拆成了四个，好处是你一看名字就知道这次转换"想干什么、危不危险"。'
    },

    /* ---------- 35. 四种转换总览 ---------- */
    {
      type: 'compare',
      eyebrow: '总览',
      title: '四种转换，各管一件事',
      lead: '按"危险程度"排：`static_cast` 最常用，`reinterpret_cast` 最危险。',
      table: {
        head: ['转换', '用途', '何时检查'],
        rows: [
          ['`static_cast`', '数值转换、基类↔派生类指针、`void*` 回转', '编译期（不做运行期检查）'],
          ['`dynamic_cast`', '**多态类型**之间的向下转换', '运行期（失败返回 `nullptr` 或抛异常）'],
          ['`const_cast`', '去掉（或加上）`const` 限定', '编译期'],
          ['`reinterpret_cast`', '把内存里的位**按另一种类型重新解释**', '不做任何检查']
        ]
      },
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '为什么不用 `(int)x` 这种老写法',
        text: 'C 风格的转换会**依次尝试**上面四种，直到找到一个能用的为止。结果是：`(Derived*)basePtr` 会**静默地**做一个 `static_cast`（不做运行期检查），你以为转型失败了会得到 `nullptr`，实际上得到了一个指向错误位置的指针 —— 用起来就是崩溃。\n\n用一个具体的例子说明它的坏处：`(char*)&someObject`。它可能被解释成 `static_cast`，也可能被解释成 `reinterpret_cast`，**取决于上下文**。读代码的人根本无法判断作者的本意。\n\n**规则：新代码里不要出现 C 风格转换。** 编译器可以开启 `-Wold-style-cast` 强制检查这一点。'
      },
      notes: '这一页是总览。核心是让学生建立一个印象：C++ 的四种转换名就是"意图声明"。static_cast 是"我知道这两者有关系，正常转"，dynamic_cast 是"我不确定，你运行期帮我查一下"，const_cast 是"我保证不会改它，只是去掉 const"，reinterpret_cast 是"我就是要按位重新解释，出问题我自己负责"。'
    },

    /* ---------- 36. static_cast 与 dynamic_cast ---------- */
    {
      type: 'code',
      eyebrow: '最常用的两个',
      title: '`static_cast` 与 `dynamic_cast`',
      lead: '一个在编译期完成、不做运行期检查；一个必须在**多态类型**上用，会真的去查对象到底是什么。',
      code: {
        file: 'static_dynamic_cast.cpp',
        source: `#include <iostream>

class Animal {
public:
    virtual ~Animal() = default;            // 有虚函数，dynamic_cast 才有意义
};

class Dog : public Animal {
public:
    void bark() const { std::cout << "汪汪" << std::endl; }
};

class Cat : public Animal {
public:
    void meow() const { std::cout << "喵" << std::endl; }
};

void tryDog(Animal* a) {
    // 运行期检查：a 到底指向不指向一只狗？
    Dog* d = dynamic_cast<Dog*>(a);
    if (d) {
        d->bark();                          // 查证成功，安全地调用
    } else {
        std::cout << "这不是狗，不能让它叫" << std::endl;
    }
}

int main() {
    Dog dog;
    Cat cat;

    tryDog(&dog);
    tryDog(&cat);

    // static_cast：编译期完成，不做任何检查
    double pi  = 3.14159;
    int    n   = static_cast<int>(pi);      // 明确写出"我知道会截断"
    std::cout << "static_cast 截断: " << n << std::endl;

    return 0;
}`,
        expectedOutput: `汪汪
这不是狗，不能让它叫
static_cast 截断: 3`,
        note: {
          kind: 'note',
          icon: 'bulb',
          title: '`dynamic_cast` 的代价与适用场景',
          text: '`dynamic_cast` 要读对象的 vptr、查表、比对类型信息，**比 `static_cast` 慢得多**。所以它不该出现在热点路径上。\n\n更重要的是：**频繁使用 `dynamic_cast` 通常说明设计有问题**。如果代码里到处在问"你到底是狗还是猫"，那往往是该用虚函数的地方没用虚函数 —— 让每个类自己实现 `speak()`，就根本不需要问。\n\n`dynamic_cast` 最正当的用途是**在框架/库的边界做类型恢复**：比如从容器里取出一个基类指针，确认它确实是你要的那种对象。'
        }
      },
      notes: '讲两个要点。第一，dynamic_cast 只能用于多态类型（类里至少有一个虚函数），因为它要靠 vptr 才能找到类型信息；对没有虚函数的类用，编译期就会报错。第二，它失败时对指针返回 nullptr，对引用则抛 std::bad_cast —— 因为引用不能为空。'
    },

    /* ---------- 37. const_cast 与 reinterpret_cast ---------- */
    {
      type: 'code',
      eyebrow: '危害最大的两个',
      title: '`const_cast` 与 `reinterpret_cast`',
      lead: '前者去掉 `const`，后者把内存按另一种类型重新解释。**两个都只在确有理由时才用**。',
      code: {
        file: 'const_reinterpret_cast.cpp',
        source: `#include <iostream>
#include <cstdint>

// 场景：调用一个 C 语言的老接口，它的参数没写 const
void legacyPrint(char* s) { std::cout << s << std::endl; }

int main() {
    const char* msg = "hello";
    // legacyPrint(msg);                 // 编译失败：const char* 不能传给 char*
    legacyPrint(const_cast<char*>(msg)); // 明确写出"这个接口不会改它"

    // reinterpret_cast：把内存里的位按另一种类型解释
    float f = 1.0f;
    std::uint32_t bits = *reinterpret_cast<std::uint32_t*>(&f);
    std::cout << "1.0f 的内存位 = 0x" << std::hex << bits << std::dec << std::endl;
    // 1.0f 的 IEEE 754 表示是 0x3f800000 —— 一个浮点数在内存里就是这样的 4 字节

    int x = 42;
    std::uintptr_t addr = reinterpret_cast<std::uintptr_t>(&x);   // 指针 → 整数
    int* back = reinterpret_cast<int*>(addr);                     // 整数 → 指针
    std::cout << "绕一圈还能读回原值? " << (*back == x) << std::endl;

    return 0;
}`,
        expectedOutput: `hello
1.0f 的内存位 = 0x3f800000
绕一圈还能读回原值? 1`,
        note: {
          kind: 'trap',
          title: '这两个能不用就不用',
          text: '**`const_cast`：** 只能改"指针/引用的 const 属性"，不能改一个本来就是常量的对象。如果那个对象**真的**存放在只读内存里（比如字符串字面量），去掉 const 之后写它，程序会直接崩溃。上面这个例子里 `legacyPrint` 确实没写，所以是安全的 —— 但这是靠**人**来保证的，编译器帮不了你。\n\n**`reinterpret_cast`：** 它不做任何检查，只是"把这串字节按另一种类型读"。上面读浮点位模式的写法在标准里严格来说是**未定义行为**（违反了严格别名规则），能工作是因为编译器在实践中接受了它。C++20 提供了正规做法 `std::bit_cast<std::uint32_t>(f)`。\n\n真正需要 `reinterpret_cast` 的场合，基本只剩两类：**和硬件/协议打交道**（把字节流解释成结构体），以及**在 `uintptr_t` 和指针之间来回转**（做地址对齐检查之类）。'
        }
      },
      notes: '这两个转换是"有理由才用"的工具。const_cast 在对接 C 语言老接口时很常见；reinterpret_cast 在底层编程里出现得多。要提醒学生：它们的共同特点是"编译器的类型系统在这里失效了"，一旦用错，编译器不会再保护你。'
    },

    /* ---------- 38. 结尾 ---------- */
    {
      type: 'end',
      icon: 'poly',
      title: '本章小结',
      lead: '下一章：Modern C++ —— 智能指针、移动语义，全都建立在这一章的基础上。',
      cards: [
        { icon: 'encapsulate', heading: '类的本质', body: '数据和行为打包 + 访问控制；对象里只有数据，函数在代码段' },
        { icon: 'raii', heading: '构造与析构', body: '出生和死亡都有代码自动执行 —— RAII 是资源管理的基石' },
        { icon: 'inherit', heading: '继承的布局', body: '基类子对象在最前面，所以基类指针指向派生类对象不用调整地址' },
        { icon: 'poly', heading: '多态的实现', body: '对象里的 vptr → 类的 vtable → 函数地址，运行期才能确定' }
      ],
      notes: '这一章内容很多，最后帮大家串一遍。第一部分：类和结构体只差默认权限，但带来了封装这个思想。第二部分：对象里只有数据成员，成员函数在代码段，this 是隐藏参数。第三部分：构造析构的自动执行是 RAII 的基础，后面智能指针全靠它。第四部分：派生类对象里基类部分在最前面。第五部分：虚函数表 —— 对象里的 vptr 指向类专属的 vtable，多态就是顺着这条链查一次表。第六部分：对象大小 = 成员 + 填充 + vptr。第七部分：四种类型转换，让转换的意图写在代码里。'
    }

  ];
})(window);
