/* ============================================================
   第 9 章 · Modern C++ 新特性（C++11 / 14 / 17 / 20）

   本章为原课件之外新增的章节。C++11 是这门语言的转折点，
   下面的写法与前七章差别很大，因此单独成章。

   代码全部以 C++20 标准用 clang++ 实际编译运行验证。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch9 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 9 章',
      title: 'Modern C++ 新特性',
      lead: '从 C++11 到 C++20 · 现代 C++ 的写法与思路',
      notes: '前七章讲的是 C++ 的经典部分，很多写法沿用自 C 语言。但从 2011 年开始，C++ 经历了一次脱胎换骨的现代化。这一章我们把 C++11 的核心特性讲透，再把 C++14、17、20 的重要更新过一遍。学完这一章，你看到的 C++ 代码会和你前七章写的样子很不一样。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: 'C++11 是重点，后面三个标准是它的延续和补强。',
      map: {
        aria: '本章知识地图：C++11 语言特性、资源管理、并发基础、后续标准概览',
        root: { title: '第 9 章 · Modern C++', sub: 'C++11 起的新写法' },
        branches: [
          {
            title: 'C++11 语言特性',
            sub: '让代码更短更安全',
            leaves: [
              { title: 'auto / decltype', sub: '类型推导' },
              { title: '范围 for', sub: '遍历不用写下标' },
              { title: 'lambda', sub: '就地写函数' },
              { title: 'nullptr / constexpr', sub: '更安全的字面量' }
            ]
          },
          {
            title: '资源管理',
            sub: '不再手写 delete',
            leaves: [
              { title: 'unique_ptr', sub: '独占所有权' },
              { title: 'shared_ptr', sub: '引用计数共享' },
              { title: '移动语义', sub: '接管而非复制' },
              { title: '右值引用 &&', sub: '移动的载体' }
            ]
          },
          {
            title: '并发基础',
            sub: '多线程与内存序',
            leaves: [
              { title: '数据竞争', sub: '为什么结果会丢' },
              { title: 'std::atomic', sub: '不可分割的操作' },
              { title: 'memory_order', sub: 'release / acquire' }
            ]
          },
          {
            title: 'C++14 / 17 / 20',
            sub: '后续标准的补强',
            leaves: [
              { title: 'C++14', sub: '泛型 lambda' },
              { title: 'C++17', sub: '结构化绑定 / optional' },
              { title: 'C++20', sub: 'concept / ranges' }
            ]
          }
        ]
      },
      notes: '本章分四块。前三块都围绕 C++11 —— 它是这一轮现代化的核心：语言特性、资源管理（智能指针与移动语义）、并发基础。最后一块把 C++14、17、20 的更新过一遍，让你知道后面又补了什么。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '你会学到什么',
      items: [
        { num: '01', title: 'C++11 语言特性', body: 'auto、范围 for、lambda、nullptr、constexpr、统一初始化' },
        { num: '02', title: '智能指针', body: 'unique_ptr 与 shared_ptr —— 让 new/delete 成为历史' },
        { num: '03', title: '移动语义', body: '左值与右值、右值引用、std::move 到底做了什么' },
        { num: '04', title: '并发基础', body: '数据竞争、std::atomic、以及必须理解的内存序' },
        { num: '05', title: '后续标准概览', body: 'C++14 的泛型 lambda、C++17 的结构化绑定、C++20 的 concept 与 ranges' }
      ],
      notes: '这一章内容不少。如果你时间有限，请优先把前三块吃透 —— 语言特性、智能指针、移动语义，这三件事是区分"会写 C++"和"写的是 C 风格 C++"的分水岭。并发那一节属于进阶内容，可以先了解概念。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: 'C++11 语言特性',
      sub: '让代码更短、更安全',
      lead: '这几个特性改变的不只是写法，还有写代码的思维方式。',
      notes: '先从语言层面的改进开始。这些特性的共同点是：让编译器替你做一些重复劳动，同时把一些原本容易出错的地方变成编译错误。'
    },

    /* ---------- 5. C++11 为什么是分水岭 ---------- */
    {
      type: 'cards',
      eyebrow: '背景',
      title: '为什么说 C++11 是分水岭',
      lead: '从 1998 年到 2011 年，C++ 的标准整整 13 年没有大更新。C++11 一次性补上了太多东西。',
      cards: [
        {
          icon: 'auto',
          heading: '写得更少',
          body: '`auto` 和范围 for 让类型名和迭代器不再需要手写，代码短了一大截。'
        },
        {
          icon: 'guard',
          heading: '更安全',
          body: '`nullptr` 消除了 `NULL` 的歧义，智能指针让 `delete` 几乎可以不再出现。'
        },
        {
          icon: 'lambda',
          heading: '更灵活',
          body: '`lambda` 让你能在使用的地方就地写一个函数，算法库一下变得好用起来。'
        },
        {
          icon: 'move',
          heading: '更快',
          body: '移动语义避免了大量不必要的深拷贝，这是 C++11 性能上最大的贡献。'
        }
      ],
      note: {
        kind: 'note',
        title: '本标准与编译器',
        text: '本章代码统一按 **C++20** 标准编译。实际项目中若受限于旧编译器，至少要保证 `-std=c++11`。用命令行编译时记得加上这个参数，否则编译器可能仍按旧标准处理，新语法会报错。'
      },
      notes: '1998 年 C++ 有了第一个国际标准，之后整整 13 年只出过一次小修订。到 2011 年，新标准一次性带来了大量改进，所以大家把它叫做"现代 C++"的起点。之后的 14、17、20 都是沿着这个方向继续走。'
    },

    /* ---------- 6. auto 与 decltype ---------- */
    {
      type: 'split',
      eyebrow: '特性 1',
      title: 'auto 与 decltype',
      lead: '自动类型推导 —— 让编译器去写那些冗长的类型名。',
      points: [
        '`auto x = 42;` 由初始值推导出 `int`',
        '`decltype(x)` 取一个**表达式的类型**，常用于模板',
        '对迭代器这类长类型名特别有价值',
        '`auto` 仍然**强类型**，推导结果在编译期就确定',
        '但类型不明显时，写出类型反而更利于阅读'
      ],
      code: {
        file: 'auto_decltype.cpp',
        source: `#include <iostream>
#include <vector>
#include <string>

int main() {
    auto i = 42;                  // int
    auto d = 3.14;                // double
    auto s = std::string("hi");   // std::string

    // decltype 取表达式的类型
    decltype(i) j = 100;          // j 也是 int
    std::cout << "j = " << j << std::endl;

    // 迭代器的类型名非常长，auto 让它变得可读
    std::vector<int> v{1, 2, 3};
    for (auto it = v.begin(); it != v.end(); ++it) {
        std::cout << *it << " ";
    }
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `j = 100
1 2 3 `
      },
      notes: 'auto 在第 1 章已经见过，这里再补充 decltype。它和 auto 的区别是：auto 是"用初始值去推导"，decltype 是"问一个表达式是什么类型"。在写模板的时候，decltype 用得更多。'
    },

    /* ---------- 7. 范围 for ---------- */
    {
      type: 'split',
      eyebrow: '特性 2',
      title: '范围 for：不用再管下标和迭代器',
      lead: '遍历一个容器，只需要写"对里面的每一个元素做某事"。',
      points: [
        '`for (auto n : nums)` —— 直接拿到元素',
        '想**修改**元素必须用引用 `auto&`，否则改的是副本',
        '只读遍历用 `const auto&`，避免不必要的拷贝',
        '对数组、`vector`、`string`、`map` 都适用'
      ],
      code: {
        file: 'range_for.cpp',
        source: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums{10, 20, 30};

    // 只读遍历：const auto& 不拷贝也不允许修改
    for (const auto& n : nums) std::cout << n << " ";
    std::cout << std::endl;

    // 想修改元素，必须用引用
    for (auto& n : nums) n *= 2;

    for (auto n : nums) std::cout << n << " ";
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `10 20 30
20 40 60 `,
        note: {
          kind: 'trap',
          title: '忘了 & 就改不动',
          text: '`for (auto n : nums) n *= 2;` 这句**什么也没改**。因为 `auto n` 是元素的**副本**，改副本不影响容器。必须写成 `for (auto& n : nums)`。这个错误编译器不会报错，只会让你困惑为什么数据没变。'
        }
      },
      notes: '范围 for 是 C++11 里最常用的特性之一。但要注意最后那个提示：如果你忘了写 &，代码能编译、能运行，但什么都没改。这是初学者最常见的困惑之一。'
    },

    /* ---------- 8. lambda 基础 ---------- */
    {
      type: 'split',
      eyebrow: '特性 3',
      title: 'lambda：就地写一个小函数',
      lead: '很多函数只用一次，为了它专门起个名字、写在别处，反而让代码难以阅读。',
      points: [
        '语法：`[捕获](参数) { 函数体 }`',
        '**捕获列表**写方括号里，可以为空 `[]`',
        '返回值通常自动推导，不用写',
        '配合 `sort`、`count_if` 这类算法极其方便',
        '本质是一个匿名的函数对象'
      ],
      code: {
        file: 'lambda_basic.cpp',
        source: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // 一个最简单的 lambda
    auto add = [](int a, int b) { return a + b; };
    std::cout << "add(3,4) = " << add(3, 4) << std::endl;

    std::vector<int> v{5, 2, 8, 1, 9};

    // 排序规则：从大到小。写在调用处，一眼就知道在做什么
    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
    for (auto n : v) std::cout << n << " ";
    std::cout << std::endl;

    // 统计满足条件的元素个数
    int cnt = std::count_if(v.begin(), v.end(), [](int n) { return n > 4; });
    std::cout << "大于 4 的有 " << cnt << " 个" << std::endl;

    return 0;
}`,
        expectedOutput: `add(3,4) = 7
9 8 5 2 1
大于 4 的有 3 个`
      },
      notes: '在没有 lambda 的年代，要给 sort 传一个自定义排序规则，你得在别的地方写一个函数或者一个函数对象类，然后回头看代码时还得跳过去找。有了 lambda，规则直接写在调用处，代码自解释了。'
    },

    /* ---------- 9. lambda 捕获 ---------- */
    {
      type: 'code',
      eyebrow: '特性 3 · 深入',
      title: 'lambda 的捕获：值捕获与引用捕获',
      lead: '方括号里写什么，决定了 lambda 能否访问外面的变量、以及怎么访问。',
      points: [
        '`[x]` **值捕获**：进入 lambda 时拷贝一份，之后外面怎么改都不影响',
        '`[&x]` **引用捕获**：捕获的是变量本身，外面改了里面也变',
        '`[=]` 捕获所有用到的变量（按值），`[&]` 全部按引用',
        '**推荐明确写出要捕获的变量**，`[=]` 和 `[&]` 容易埋雷'
      ],
      code: {
        file: 'lambda_capture.cpp',
        source: `#include <iostream>

int main() {
    int x = 10;

    // 值捕获：把当时的 x 拷贝进去
    auto byValue = [x]() { return x; };

    // 引用捕获：捕获的是 x 本身
    auto byRef = [&x]() { return x; };

    // 创建之后再改 x
    x = 99;

    std::cout << "值捕获结果 = " << byValue() << std::endl;
    std::cout << "引用捕获结果 = " << byRef() << std::endl;

    // 引用捕获能改外面的变量
    auto inc = [&x]() { x++; };
    inc();
    std::cout << "调用 inc() 之后 x = " << x << std::endl;

    return 0;
}`,
        expectedOutput: `值捕获结果 = 10
引用捕获结果 = 99
调用 inc() 之后 x = 100`,
        note: {
          kind: 'trap',
          title: '引用捕获的悬垂风险',
          text: '引用捕获保存的是变量的**地址**。如果 lambda 活得比这个变量还久（比如被存起来、被异步调用），它就会访问一块已经失效的内存 —— 这是**悬垂引用**，行为不可预测。返回 lambda 时尤其要小心，这也是 `[&]` 被诟病的原因。'
        }
      },
      notes: '这个是本章最重要的提示之一。值捕获 vs 引用捕获的区别，是 lambda 最常用也最容易出错的地方。特别注意最后那个陷阱：如果 lambda 被存起来延迟执行，而它引用捕获的局部变量已经销毁了，就会出问题。'
    },

    /* ---------- 10. nullptr ---------- */
    {
      type: 'code',
      eyebrow: '特性 4',
      title: 'nullptr：为什么不用 NULL',
      lead: '`NULL` 在 C++ 里通常就是整数 `0`，重载时会产生意想不到的结果。',
      points: [
        '`NULL` 是个宏，通常展开成 `0`，类型是 `int`',
        '`nullptr` 有独立类型 `std::nullptr_t`，**只能**匹配指针',
        '有重载函数时，用 `NULL` 可能调用到你不想调用的版本',
        '现代 C++ 一律用 `nullptr`'
      ],
      code: {
        file: 'nullptr_demo.cpp',
        source: `#include <iostream>

void f(int)   { std::cout << "调用了 f(int)" << std::endl; }
void f(char*) { std::cout << "调用了 f(char*)" << std::endl; }

int main() {
    // 0 是整数，明确匹配 int 版本 —— 但你想传的其实是空指针
    f(0);

    // nullptr 的值就是空指针，匹配指针版本
    f(nullptr);

    int* p = nullptr;
    if (p == nullptr) {
        std::cout << "p 是空指针，还没指向任何对象" << std::endl;
    }

    return 0;
}`,
        expectedOutput: `调用了 f(int)
调用了 f(char*)
p 是空指针，还没指向任何对象`,
        note: {
          kind: 'trap',
          title: '这就是 nullptr 存在的理由',
          text: '第一行调用 `f(0)`，你以为传的是空指针，实际调用的是 `f(int)` —— 因为在 C++ 里 `0` 就是整数。`NULL` 通常就是 `0` 的宏，所以 `f(NULL)` 有同样的毛病，在 clang 上甚至会直接报 **"call to \'f\' is ambiguous"** 编译错误。改用 `nullptr` 后语义明确，不会再有两义。'
        }
      },
      notes: '很多人觉得 nullptr 只是换个写法而已，其实不是。看第一行输出：你以为传了空指针，编译器却调用了整数版本。这就是 nullptr 被引入的真正原因。'
    },

    /* ---------- 11. constexpr ---------- */
    {
      type: 'split',
      eyebrow: '特性 5',
      title: 'constexpr：把计算搬到编译期',
      lead: '能在编译期算出来的，就不要留到运行时算。',
      points: [
        '`constexpr` 函数在**编译期**求值（当参数是常量时）',
        '结果可以用来定义数组大小这类**必须是常量**的地方',
        '传运行时变量时，它也能当普通函数用',
        '比 `#define` 宏安全得多，有类型检查'
      ],
      code: {
        file: 'constexpr_demo.cpp',
        source: `#include <iostream>

constexpr int square(int n) { return n * n; }

int main() {
    // 编译期就算好了，可以直接当数组长度
    int arr[square(4)];
    std::cout << "数组长度 = " << sizeof(arr) / sizeof(arr[0]) << std::endl;

    constexpr int N = square(5);
    std::cout << "N = " << N << std::endl;

    // 传入运行时才知道的值时，就变成普通函数调用
    int x = 6;
    std::cout << "square(x) = " << square(x) << std::endl;

    return 0;
}`,
        expectedOutput: `数组长度 = 16
N = 25
square(x) = 36`
      },
      notes: 'constexpr 取代了以前用 #define 宏做常量计算的做法。它的好处是既有编译期求值的性能，又有类型检查的安全性。注意它是一身二用的：参数是常量时编译期算，参数是变量时运行期算。'
    },

    /* ---------- 12. 统一初始化 ---------- */
    {
      type: 'split',
      eyebrow: '特性 6',
      title: '统一初始化：用大括号初始化一切',
      lead: 'C++11 之前，不同东西有不同初始化写法，而且有些写法会静默丢精度。',
      points: [
        '`int a{10};`、`std::vector<int> v{1,2,3};` 语法统一',
        '**窄化转换会直接编译报错**，这是最大的好处',
        '老写法 `int c = 3.14;` 只给个警告，静默截断',
        '`{}` 初始化也能用于结构体和类'
      ],
      code: {
        file: 'brace_init.cpp',
        source: `#include <iostream>
#include <vector>

struct Point { int x; int y; };

int main() {
    int a{10};
    double b{3.14};
    std::vector<int> v{1, 2, 3, 4};

    // 结构体也能直接用大括号
    Point p{3, 4};

    std::cout << "a = " << a << ", b = " << b << std::endl;
    std::cout << "v.size() = " << v.size() << std::endl;
    std::cout << "p = (" << p.x << ", " << p.y << ")" << std::endl;

    // 下面这行会编译失败，这正是我们想要的：
    // int c{3.14};   // 错误：从 double 到 int 的窄化转换

    return 0;
}`,
        expectedOutput: `a = 10, b = 3.14
v.size() = 4
p = (3, 4)`,
        note: {
          kind: 'note',
          title: '把错误提前到编译期',
          text: '把注释里那行 `int c{3.14};` 的注释去掉，编译会**直接失败**。而写成 `int c = 3.14;` 只会给个警告，然后悄悄把小数丢掉。同样的错误，一个当场拦住你，一个留到运行时才让你困惑。'
        }
      },
      notes: '大括号初始化最大的价值不是写法统一，而是它把"精度丢失"这种隐蔽错误变成了编译错误。在 Compiler Explorer 上把注释去掉试试，能亲眼看到编译器报错。'
    },

    /* ---------- 13. 分节 02 ---------- */
    {
      type: 'section',
      num: '02',
      title: '智能指针',
      sub: '让 delete 成为历史',
      lead: '手动管理内存是 C++ 最大的痛点，智能指针把它变成了自动的。',
      notes: '接下来讲 C++11 里最实用的一块：智能指针。第 6 章我们讲了 new 和 delete，也讲了内存泄漏。智能指针的思路是：把"释放资源"这件事交给对象的析构函数自动完成。'
    },

    /* ---------- 14. unique_ptr ---------- */
    {
      type: 'split',
      eyebrow: '智能指针 1',
      title: 'unique_ptr：独占所有权',
      lead: '一块内存只能有一个主人。主人离开作用域，内存自动释放。',
      points: [
        '`std::make_unique<T>(...)` 创建，**不需要写 new**',
        '**不能拷贝**，只能 `std::move` 转移所有权',
        '离开作用域自动 `delete`，不需要你操心',
        '日常首选，开销和裸指针几乎一样'
      ],
      code: {
        file: 'unique_ptr.cpp',
        source: `#include <iostream>
#include <memory>
#include <string>

struct Resource {
    std::string name;
    explicit Resource(std::string n) : name(n) {
        std::cout << "申请资源 " << name << std::endl;
    }
    ~Resource() { std::cout << "释放资源 " << name << std::endl; }
};

int main() {
    std::cout << "--- 进入作用域 ---" << std::endl;
    {
        auto p = std::make_unique<Resource>("A");
        // 走到这里，A 自动释放，不用写 delete
    }
    std::cout << "--- 已离开作用域 ---" << std::endl;

    std::cout << "--- 所有权转移 ---" << std::endl;
    auto p = std::make_unique<Resource>("B");
    auto q = std::move(p);              // 转移而不是拷贝
    std::cout << "p 还持有对象吗: " << (p == nullptr ? "否" : "是") << std::endl;
    std::cout << "q 管理的资源: " << q->name << std::endl;

    return 0;
}`,
        expectedOutput: `--- 进入作用域 ---
申请资源 A
释放资源 A
--- 已离开作用域 ---
--- 所有权转移 ---
申请资源 B
p 还持有对象吗: 否
q 管理的资源: B
释放资源 B`,
        note: {
          kind: 'note',
          title: '析构顺序看这里',
          text: '注意最后一行"释放资源 B"出现在 `return 0` 之后 —— 因为 `q` 是 `main` 的局部变量，要等 `main` 结束才析构。而 A 是在**离开那个内层大括号时**就立刻释放了。这就是 RAII：资源的生命周期跟着对象走。'
        }
      },
      notes: '请注意输出的顺序。A 是在离开内层大括号的那一刻就释放了，不需要你写任何 delete。这就是智能指针的核心价值：把资源释放绑定到对象的生命周期上，你忘了写 delete 也不会泄漏。'
    },

    /* ---------- 15. shared_ptr ---------- */
    {
      type: 'code',
      eyebrow: '智能指针 2',
      title: 'shared_ptr：引用计数共享',
      lead: '当一块内存需要被多处同时持有，用引用计数决定什么时候释放。',
      points: [
        '`std::make_shared<T>(...)` 创建',
        '可以自由拷贝，**拷贝一次计数加一**',
        '计数归零时自动释放',
        '`use_count()` 可以查看当前计数',
        '比 `unique_ptr` 有额外开销，不需要共享时别用它'
      ],
      code: {
        file: 'shared_ptr.cpp',
        source: `#include <iostream>
#include <memory>

int main() {
    auto p = std::make_shared<int>(42);
    std::cout << "初始计数 = " << p.use_count() << std::endl;

    {
        auto q = p;             // 拷贝，计数 +1
        std::cout << "块内计数 = " << p.use_count() << std::endl;
        std::cout << "通过 q 读值 = " << *q << std::endl;
    }                           // q 销毁，计数 -1

    std::cout << "出块后计数 = " << p.use_count() << std::endl;
    std::cout << "p 仍然有效 = " << *p << std::endl;

    return 0;
}`,
        expectedOutput: `初始计数 = 1
块内计数 = 2
通过 q 读值 = 42
出块后计数 = 1
p 仍然有效 = 42`,
        note: {
          kind: 'trap',
          title: '循环引用会导致泄漏',
          text: '两个 `shared_ptr` 互相指向对方，计数永远降不到 0，内存永远不会释放。这是 `shared_ptr` 最典型的陷阱，解决办法是把其中一方改成 `weak_ptr`（弱引用，不增加计数）。'
        }
      },
      notes: 'shared_ptr 用引用计数管理生命周期。注意 count 的变化：q 拷贝 p 之后变成 2，q 销毁后回到 1。最后提醒那个循环引用的问题，两个对象互相持有的话计数永远归不了零，这是 shared_ptr 最经典的坑。'
    },

    /* ---------- 16. 分节 03 ---------- */
    {
      type: 'section',
      num: '03',
      title: '移动语义',
      sub: 'C++11 最重要的改进',
      lead: '避免不必要的深拷贝 —— 这是 C++11 在性能上最大的贡献。',
      notes: '最后讲移动语义，这是 C++11 里最难理解、但也最有价值的一个特性。理解了它，你才能看懂现代 C++ 库为什么那样设计。'
    },

    /* ---------- 17. 拷贝的代价 ---------- */
    {
      type: 'memory',
      eyebrow: '问题',
      title: '拷贝一个字符串，代价有多大',
      lead: '`std::string` 内部指向一块堆内存。拷贝它，就要把整块内存复制一份。',
      memory: {
        title: '拷贝 string 发生了什么',
        steps: [
          {
            caption: '创建 a = "hello world"。a 自己在栈上，字符数据放在堆上的一块缓冲区里。',
            regions: [
              {
                name: '栈 Stack', kind: 'stack',
                cells: [{ id: 'a', label: 'a', type: 'string', value: 'ptr', addr: '0x7ffd9c4a2ba0' }]
              },
              {
                name: '堆 Heap', kind: 'heap',
                cells: [{ id: 'bufA', label: '', type: 'char[12]', value: '"hello world"', addr: '0x55a0f3e1c010' }]
              }
            ],
            arrows: [{ from: 'a', to: 'bufA', label: '' }]
          },
          {
            caption: '执行 std::string b = a; 这是【拷贝】。b 会申请一块【新的】堆内存，把内容逐字节复制过去。',
            regions: [
              {
                name: '栈 Stack', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a', type: 'string', value: 'ptr', addr: '0x7ffd9c4a2ba0' },
                  { id: 'b', label: 'b', type: 'string', value: 'ptr', addr: '0x7ffd9c4a2bb0', state: 'changed' }
                ]
              },
              {
                name: '堆 Heap', kind: 'heap',
                cells: [
                  { id: 'bufA', label: '', type: 'char[12]', value: '"hello world"', addr: '0x55a0f3e1c010' },
                  { id: 'bufB', label: '新分配', type: 'char[12]', value: '"hello world"', addr: '0x55a0f3e1c030', state: 'changed' }
                ]
              }
            ],
            arrows: [{ from: 'a', to: 'bufA' }, { from: 'b', to: 'bufB' }]
          },
          {
            caption: '问题来了：如果 a 之后再也不用了，这次深拷贝完全是浪费 —— 分配内存、逐字节复制，都是白做的。',
            regions: [
              {
                name: '栈 Stack', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a', type: 'string', value: '（不再使用）', addr: '0x7ffd9c4a2ba0', state: 'freed' },
                  { id: 'b', label: 'b', type: 'string', value: 'ptr', addr: '0x7ffd9c4a2bb0' }
                ]
              },
              {
                name: '堆 Heap', kind: 'heap',
                cells: [
                  { id: 'bufA', label: '', type: 'char[12]', value: '"hello world"', addr: '0x55a0f3e1c010', state: 'freed' },
                  { id: 'bufB', label: '', type: 'char[12]', value: '"hello world"', addr: '0x55a0f3e1c030' }
                ]
              }
            ],
            arrows: [{ from: 'b', to: 'bufB' }]
          },
          {
            caption: '移动语义的思路：与其复制一份，不如把 a 的缓冲区【直接交给】c，a 自己变成空的。零拷贝。',
            regions: [
              {
                name: '栈 Stack', kind: 'stack',
                cells: [
                  { id: 'a', label: 'a', type: 'string', value: '（已交出）', addr: '0x7ffd9c4a2ba0', state: 'freed' },
                  { id: 'c', label: 'c', type: 'string', value: 'ptr', addr: '0x7ffd9c4a2bc0', state: 'changed' }
                ]
              },
              {
                name: '堆 Heap', kind: 'heap',
                cells: [{ id: 'bufA', label: '', type: 'char[12]', value: '"hello world"', addr: '0x55a0f3e1c010', state: 'changed' }]
              }
            ],
            arrows: [{ from: 'c', to: 'bufA', label: '接管' }]
          }
        ]
      },
      notes: '先看清楚问题所在。string 内部的字符数据在堆上，拷贝一个 string 意味着再申请一块堆内存、把内容全部复制一遍。如果原来的那个 string 之后就不用了，这次复制完全是浪费。移动语义就是为了消灭这种浪费。'
    },

    /* ---------- 18. std::move ---------- */
    {
      type: 'split',
      eyebrow: '解法',
      title: 'std::move：把资源交出去',
      lead: '`std::move` 并不移动任何东西，它只是告诉编译器"这个对象可以被搬空"。',
      points: [
        '`std::move(a)` 本身**不搬任何东西**，它只是把 `a` 转成右值引用',
        '这一步转换会让编译器选中**移动构造函数**而不是拷贝构造函数',
        '移动构造做的事：把 `a` 内部的资源（如堆指针）**移交给新对象**',
        '同时把 `a` **搬空**（指针置空、长度归零），它不再拥有那份资源',
        '所以 **move 之后不要再使用原对象** —— 它已经空了'
      ],
      code: {
        file: 'move_semantics.cpp',
        source: `#include <iostream>
#include <string>
#include <utility>

int main() {
    std::string a = "hello world";
    std::cout << "开始时 a 的长度 = " << a.size() << std::endl;

    // 拷贝：b 得到一份完整的副本，a 不受影响
    std::string b = a;
    std::cout << "拷贝后 a 的长度 = " << a.size()
              << "，b 的长度 = " << b.size() << std::endl;

    // 移动：c 直接接管 a 内部的缓冲区
    std::string c = std::move(a);
    std::cout << "移动后 a 的长度 = " << a.size()
              << "，c 的长度 = " << c.size() << std::endl;
    std::cout << "c 的内容 = " << c << std::endl;

    return 0;
}`,
        expectedOutput: `开始时 a 的长度 = 11
拷贝后 a 的长度 = 11，b 的长度 = 11
移动后 a 的长度 = 0，c 的长度 = 11
c 的内容 = hello world`,
        note: {
          kind: 'trap',
          title: 'move 之后不要再用原对象',
          text: '移动之后 `a` 的长度变成 0 —— 它的缓冲区已经被 `c` 接管了。**"搬空"是移动语义的核心动作**：资源交给了新对象，原对象不再持有它。标准保证 `a` 仍是"有效的"（可以安全地析构、赋值），但**里面的内容是什么就没有保证了**，继续读它是逻辑错误。下一页我们会自己写一个移动构造函数，把这件事看个清楚。'
        }
      },
      notes: '这段代码对比了拷贝和移动。拷贝之后 a 和 b 都是 11 个字符；移动之后 a 变成 0，c 是 11，因为它们共用同一块内存 —— 只是所有权换了手。记住 move 本身不搬东西，它只是一个类型转换，真正的搬运是移动构造函数做的。'
    },

    /* ---------- 19. 什么时候会移动 ---------- */
    {
      type: 'compare',
      eyebrow: '判断依据',
      title: '什么时候发生移动，什么时候是拷贝',
      lead: '看这个对象是「还要用」还是「用完就扔」—— 也就是它是左值还是右值。',
      table: {
        head: ['代码', '发生什么', '原因'],
        rows: [
          ['`std::string b = a;`', '拷贝', '`a` 是具名变量（左值），后面可能还要用'],
          ['`std::string c = std::move(a);`', '移动', '明确表示 `a` 可以搬空'],
          ['`std::string d = "hi";`', '通常是移动', '临时对象（右值），用完即弃'],
          ['`v.push_back(x);`', '拷贝', '`x` 是具名变量'],
          ['`v.push_back(std::move(x));`', '移动', '明确交出 `x`'],
          ['`return localStr;`', '移动（或更优）', '返回局部变量，编译器可能直接构造到调用处']
        ]
      },
      note: {
        kind: 'note',
        title: '一句话记住',
        text: '**具名的变量都是左值**（要拷贝），**临时对象和 `std::move` 的结果是右值**（可移动）。不确定的时候，问自己："这个变量后面还要用吗？"不用就 `std::move`。'
      },
      notes: '这张表可以当作速查。判断标准其实很简单：有名字的变量是左值，默认会拷贝；临时对象、或者你用 std::move 明确标出来的，才是右值，才会移动。'
    },

    /* ---------- 自定义移动构造函数 ---------- */
    {
      type: 'code',
      eyebrow: '看见机制',
      title: '亲手写一个移动构造函数',
      lead: '前面都是标准库的例子。自己定义一个类，才能看清 std::move 到底触发了什么。',
      points: [
        '**拷贝构造**：重新分配一块内存，把内容逐字节复制过去',
        '**移动构造**：只把对方的指针接过来，不分配任何内存',
        '移动构造会把**源对象的指针置空**，这就是"搬空"',
        '参数写 `Buffer&&` —— 右值引用，专门用来绑定"可以搬的对象"'
      ],
      code: {
        file: 'move_ctor.cpp',
        source: `#include <iostream>
#include <utility>
#include <cstring>

class Buffer {
    char*  data_;
    size_t len_;
public:
    explicit Buffer(const char* s) : len_(std::strlen(s)) {
        data_ = new char[len_ + 1];
        std::strcpy(data_, s);
        std::cout << "  构造：申请 " << len_ + 1 << " 字节" << std::endl;
    }

    // 拷贝构造：重新申请内存，把内容复制过来
    Buffer(const Buffer& o) : len_(o.len_) {
        data_ = new char[len_ + 1];
        std::strcpy(data_, o.data_);
        std::cout << "  拷贝构造：又申请了 " << len_ + 1 << " 字节" << std::endl;
    }

    // 移动构造：直接接管对方的指针，把对方置空
    Buffer(Buffer&& o) noexcept : data_(o.data_), len_(o.len_) {
        o.data_ = nullptr;      // 这一行就是"把当前对象搬空"
        o.len_  = 0;
        std::cout << "  移动构造：只接管指针，没有分配新内存" << std::endl;
    }

    ~Buffer() { delete[] data_; }

    const char* get()  const { return data_ ? data_ : "(已搬空)"; }
    size_t      size() const { return len_; }
};

int main() {
    std::cout << "创建 a：" << std::endl;
    Buffer a("hello");

    std::cout << "拷贝 b(a)：" << std::endl;
    Buffer b(a);
    std::cout << "  a = " << a.get() << "，b = " << b.get() << std::endl;

    std::cout << "移动 c(std::move(a))：" << std::endl;
    Buffer c(std::move(a));
    std::cout << "  a = " << a.get() << "，c = " << c.get() << std::endl;
    std::cout << "  a 的长度 = " << a.size() << std::endl;

    return 0;
}`,
        expectedOutput: `创建 a：
  构造：申请 6 字节
拷贝 b(a)：
  拷贝构造：又申请了 6 字节
  a = hello，b = hello
移动 c(std::move(a))：
  移动构造：只接管指针，没有分配新内存
  a = (已搬空)，c = hello
  a 的长度 = 0`,
        note: {
          kind: 'note',
          title: '两个关键差别，看输出就明白了',
          text: '**拷贝**那一步打印了"又申请了 6 字节"；**移动**那一步只打印"没有分配新内存"。这就是移动语义的全部价值 —— 省掉一次内存分配和一次逐字节拷贝。移动之后 `a` 变成 `(已搬空)`、长度为 0，因为它的指针已经被 `c` 接管并置空了。'
        }
      },
      notes: '这段代码请大家重点看输出的对比。拷贝构造里执行了 new，移动构造里只是把指针接过来。移动之后源对象 a 变成空的，这正是我们说的"搬空"。这也是为什么不要在 move 之后继续使用原对象 —— 它已经把关着的资源交出去了。'
    },

    /* ---------- 分节：并发 ---------- */
    {
      type: 'section',
      num: '04',
      title: '并发基础',
      sub: 'atomic 与内存序',
      lead: 'C++11 第一次把多线程写进了语言标准，也带来了"内存序"这个必须理解的概念。',
      notes: '接下来讲 C++11 另一块重要内容：并发。C++11 之前，多线程要依赖平台各自的 API；C++11 第一次把它纳入标准库。同时它还引入了一个更深的概念 —— 内存序，这是多线程编程绕不开的。'
    },

    /* ---------- 为什么需要 atomic ---------- */
    {
      type: 'cards',
      eyebrow: '并发 · 问题',
      title: '两个线程同时改一个变量，会出什么事',
      lead: '看上去是一步操作，在机器层面其实是三步。这三步之间就可能被打断。',
      cards: [
        {
          icon: 'steps',
          heading: 'counter++ 其实是三步',
          body: '① 从内存**读**出 counter\n② 在寄存器里**加 1**\n③ 把结果**写回**内存'
        },
        {
          icon: 'thread',
          heading: '两个线程交错执行',
          body: '线程 A 读到 5，线程 B 也读到 5；A 写回 6，B 也写回 6。**两次加一，结果只加了 1。**'
        },
        {
          icon: 'alert',
          heading: '这就是数据竞争',
          body: '结果取决于线程调度的时序，每次运行都可能不同。这种 bug 极难复现，也极难排查。'
        }
      ],
      note: {
        kind: 'trap',
        title: '数据竞争是未定义行为',
        text: '两个线程同时读写同一个非原子变量，且至少一个是写 —— 这在 C++ 标准里是**未定义行为**，不只是"结果可能不对"。编译器有权假设这种情况不会发生，从而做出让你意外的优化。'
      },
      notes: '为什么看似简单的一句 counter++ 会出问题？因为它不是一步完成的。CPU 要先读、再加、再写回，中间随时可能被切换到另一个线程。两个线程都读到同一个值，各自加一写回去，结果就少加了一次。这类 bug 的特点是极难复现，可能一百万次才出现一次。'
    },

    /* ---------- atomic 用法 ---------- */
    {
      type: 'code',
      eyebrow: '并发 · 解法',
      title: 'std::atomic：把操作变成不可分割的',
      lead: '`std::atomic<T>` 保证对它的一切操作都是原子的 —— 不会被别的线程插进来。',
      points: [
        '`std::atomic<int> counter{0};` 声明',
        '`counter.fetch_add(1)` **原子**地加一，不会丢更新',
        '`counter.load()` 原子地读取',
        '`counter++` 也能用，等价于 `fetch_add(1)`',
        '不加锁，通常比 `mutex` 快得多'
      ],
      code: {
        file: 'atomic_demo.cpp',
        source: `#include <iostream>
#include <atomic>
#include <thread>

int main() {
    std::atomic<int> counter{0};

    // 两个线程各加 50000 次
    auto work = [&counter]() {
        for (int i = 0; i < 50000; ++i) {
            counter.fetch_add(1, std::memory_order_relaxed);
        }
    };

    std::thread t1(work);
    std::thread t2(work);
    t1.join();
    t2.join();

    std::cout << "counter = " << counter.load() << std::endl;
    std::cout << "期望值  = " << 50000 * 2 << std::endl;
    std::cout << "是否一致 = " << (counter.load() == 100000 ? "是" : "否") << std::endl;

    return 0;
}`,
        expectedOutput: `counter = 100000
期望值  = 100000
是否一致 = 是`,
        note: {
          kind: 'note',
          title: '如果把 atomic 换成普通 int',
          text: '把 `std::atomic<int>` 改回 `int`，同样跑 10 万次加一，结果**几乎肯定会小于 100000**，而且每次运行的具体数值都不一样。你可以复制到 Compiler Explorer 上亲手试一次 —— 这是理解数据竞争最快的方式。'
        }
      },
      notes: 'atomic 的用法很简单，就是把类型包一层。fetch_add 保证"读-改-写"这一整串动作是原子的，别的线程没法插进来。注意这里不需要加锁，性能比 mutex 好很多。原子类型适合做计数器、标志位这类简单的共享状态。'
    },

    /* ---------- 内存序 ---------- */
    {
      type: 'code',
      eyebrow: '并发 · 深入',
      title: '内存序：为什么还需要关心顺序',
      lead: '原子性解决的是"不被打断"，内存序解决的是"别的线程按什么顺序看到我的修改"。',
      points: [
        '编译器和 CPU 都会**重排指令**以提升性能',
        '重排在单线程里看不出差别，多线程就会出事',
        '`memory_order_release` + `acquire` 配对，可以建立同步关系',
        '不确定时用默认的 `seq_cst`（顺序一致），最安全也最慢'
      ],
      code: {
        file: 'memory_order.cpp',
        source: `#include <iostream>
#include <atomic>
#include <thread>

std::atomic<bool> ready{false};
int data = 0;

void producer() {
    data = 42;                                      // ① 先准备好数据
    ready.store(true, std::memory_order_release);   // ② 再发布"准备好了"
}

void consumer() {
    // ③ 等待标志。acquire 保证：一旦看到 true，
    //    ①处的 data = 42 对当前线程也一定可见
    while (!ready.load(std::memory_order_acquire)) {
        // 自旋等待
    }
    std::cout << "消费者读到 data = " << data << std::endl;
}

int main() {
    std::thread t1(consumer);
    std::thread t2(producer);
    t1.join();
    t2.join();
    return 0;
}`,
        expectedOutput: `消费者读到 data = 42`,
        note: {
          kind: 'trap',
          title: '少了 release/acquire 会怎样',
          text: '如果 ② 和 ③ 都用 `memory_order_relaxed`，消费者**完全可能读到 `data = 0`** —— 因为编译器或 CPU 可能把 ① 和 ② 调换顺序，让"标志已就绪"先被看到，而数据还没写进去。这个 bug 可能测试一万次都不出现，但在生产环境偶发。'
        }
      },
      notes: '这是并发里最反直觉的一点。就算每个操作本身都是原子的，它们的执行顺序仍然可能被重排。release 和 acquire 是成对使用的：写方用 release 发布，读方用 acquire 接收，这样就建立了同步关系。记不住细节没关系，记住"拿不准就用默认的 seq_cst"就够了。'
    },

    /* ---------- 内存序速查 ---------- */
    {
      type: 'compare',
      eyebrow: '并发 · 速查',
      title: '四种内存序该用哪个',
      lead: '从弱到强排列。越强越安全，代价是性能。',
      table: {
        head: ['内存序', '保证什么', '典型用途'],
        rows: [
          ['`relaxed`', '只保证原子性，**不保证任何顺序**', '单纯的计数器，如统计请求数'],
          ['`acquire`', '读操作；之后的操作不会排到它前面', '配合 release，接收方'],
          ['`release`', '写操作；之前的操作不会排到它后面', '配合 acquire，发布方'],
          ['`seq_cst`', '**全局顺序一致**，最强也最慢（默认）', '拿不准时就用它']
        ]
      },
      note: {
        kind: 'note',
        title: '给初学者的实用建议',
        text: '日常写业务代码，**默认的 `seq_cst` 就够了**，不必一上来就抠 `relaxed` 那点性能。真正需要弱内存序的场景（如无锁队列、高性能计数器）属于进阶话题，等你确实遇到性能瓶颈再深入。**正确性永远优先于那一点点性能。**'
      },
      notes: '最后给个建议：初学阶段不要纠结内存序的选择，默认的 seq_cst 是最安全的。等你实际遇到需要优化的场景，再回头研究 relaxed 和 acquire/release 的细节也不迟。先写对，再写快。'
    },

    /* ---------- 并发的现实建议 ---------- */
    {
      type: 'cards',
      eyebrow: '并发 · 取舍',
      title: '实际项目中怎么选',
      lead: 'atomic 不是万能药。绝大多数情况下，你有更省心的选择。',
      cards: [
        {
          icon: 'lock',
          heading: '优先用 mutex',
          body: '需要保护**多个变量**或一段临界区时，`std::mutex` 更直观也更不容易出错。`atomic` 只适合单个变量。'
        },
        {
          icon: 'guard',
          heading: '用 lock_guard 管锁',
          body: '`std::lock_guard<std::mutex> g(m);` —— 构造时加锁、析构时解锁，忘记解锁也不会死锁。'
        },
        {
          icon: 'alert',
          heading: '别过早优化',
          body: '无锁编程的正确性极难保证。性能没到瓶颈之前，**可读性和正确性更重要**。'
        },
        {
          icon: 'check',
          heading: '能不用并发就不用',
          body: '先问"这个任务真的需要多线程吗"。很多场景下，换算法比加线程更有效。'
        }
      ],
      notes: '学完 atomic 容易产生一个冲动：什么都想用无锁。但实践中，mutex 加 lock_guard 的组合能解决绝大多数问题，而且可读性好、不容易写错。atomic 留给计数器、标志位这类真正简单的场景。'
    },

    /* ---------- 20. 分节 04 ---------- */
    {
      type: 'section',
      num: '05',
      title: 'C++14 / 17 / 20 概览',
      sub: '后续标准的补强',
      lead: 'C++11 打好了地基，后面三个标准在它上面继续加东西。',
      notes: 'C++11 之后，标准委员会改为每三年发布一版。下面把 14、17、20 三个标准里最常用的更新过一遍。你不需要全部记住，知道"有这么个东西"就够了，用到时再查。'
    },

    /* ---------- 21. C++14 ---------- */
    {
      type: 'cards',
      eyebrow: 'C++14',
      title: 'C++14：把 C++11 打磨一遍',
      lead: 'C++14 是个小版本，主要是修补 C++11 里不方便的地方。',
      cards: [
        {
          icon: 'lambda',
          heading: '泛型 lambda',
          body: '参数可以写 `auto`，一个 lambda 适配多种类型。\n`[](auto a, auto b) { return a + b; }`'
        },
        {
          icon: 'fn',
          heading: '返回值类型推导',
          body: '普通函数也能用 `auto` 推导返回值了。\n`auto add(int a, int b) { return a + b; }`'
        },
        {
          icon: 'smartptr',
          heading: 'make_unique',
          body: 'C++11 漏掉的 `std::make_unique` 在 14 补上了，不用再自己写。'
        },
        {
          icon: 'number',
          heading: '变量模板',
          body: '`template<typename T> constexpr T pi = T(3.14159);`\n可以为不同类型定义同一份常量。'
        }
      ],
      notes: 'C++14 是个补丁版本。最实用的就是泛型 lambda 和 make_unique 这两个。泛型 lambda 让 lambda 的参数也能用 auto，写通用代码方便很多。'
    },

    /* ---------- 22. C++17 结构化绑定 ---------- */
    {
      type: 'code',
      eyebrow: 'C++17 · 最常用',
      title: '结构化绑定：一次解出多个值',
      lead: '把 `pair`、`tuple`、结构体一次拆成几个变量，不用再写 `.first` `.second`。',
      points: [
        '`auto [a, b] = pair;` 一行拆包',
        '遍历 `map` 时特别好用：`for (const auto& [k, v] : m)`',
        '对结构体的成员也能拆',
        '配合 `const auto&` 避免拷贝'
      ],
      code: {
        file: 'structured_binding.cpp',
        source: `#include <iostream>
#include <map>
#include <string>
#include <tuple>

int main() {
    // 拆 pair
    auto [id, score] = std::make_pair(1, 95);
    std::cout << "id = " << id << ", score = " << score << std::endl;

    // 拆 tuple（三个以上）
    auto [name, age, city] = std::make_tuple(std::string("Alice"), 30, std::string("北京"));
    std::cout << name << " " << age << " " << city << std::endl;

    // 遍历 map 时最实用，旧的写法要写 it->first / it->second
    std::map<std::string, int> months{{"Jan", 31}, {"Feb", 28}};
    for (const auto& [key, value] : months) {
        std::cout << key << " 有 " << value << " 天" << std::endl;
    }

    return 0;
}`,
        expectedOutput: `id = 1, score = 95
Alice 30 北京
Feb 有 28 天
Jan 有 31 天`
      },
      notes: '结构化绑定是 C++17 里最受欢迎的改进之一。以前遍历 map 要写 it->first 和 it->second，现在直接写出有意义的变量名，代码可读性提升非常明显。注意 map 是按 key 排序的，所以输出里 Feb 在 Jan 前面。'
    },

    /* ---------- 23. C++17 其他 ---------- */
    {
      type: 'cards',
      eyebrow: 'C++17',
      title: 'C++17 还有这些',
      cards: [
        {
          icon: 'branch',
          heading: 'if constexpr',
          body: '编译期的 if —— 条件为假的分支**根本不会被编译**，写模板时非常有用。'
        },
        {
          icon: 'question',
          heading: 'std::optional',
          body: '表示"可能没有值"，替代用特殊值（如 `-1`）表示失败的旧做法。'
        },
        {
          icon: 'layers',
          heading: 'std::variant',
          body: '类型安全的联合体，可以存几种不同类型中的一种，比 `union` 安全。'
        },
        {
          icon: 'file',
          heading: 'std::filesystem',
          body: '标准库终于有了文件系统操作：遍历目录、判断路径、读写文件属性。'
        }
      ],
      note: {
        kind: 'note',
        title: '折叠表达式',
        text: '`sumAll(1,2,3,4,5)` 这样的可变参数求和，在 C++17 里可以写成一行：`return (... + args);`。这叫折叠表达式，取代了以前递归展开的繁琐写法。'
      },
      notes: 'C++17 里 if constexpr 和 optional 都很常用。if constexpr 的意义在于：它不是运行时的分支，而是编译时就把不满足条件的分支丢掉，因此可以在同一个模板里对不同类型的参数走完全不同的代码路径。'
    },

    /* ---------- 24. C++17 if constexpr 示例 ---------- */
    {
      type: 'code',
      eyebrow: 'C++17',
      title: 'if constexpr：编译期分支',
      lead: '写模板时，不同实例化类型往往需要走不同代码 —— 这在 C++17 之前要靠复杂的重载技巧。',
      points: [
        '`if constexpr` 在**编译期**判断，条件为假的分支不会生成代码',
        '写在一个函数里就能处理多种类型，不用重载一堆版本',
        '常配合 `std::is_integral_v` 这类类型特征使用'
      ],
      code: {
        file: 'if_constexpr.cpp',
        source: `#include <iostream>
#include <string>
#include <type_traits>

template <typename T>
std::string describe(T) {
    if constexpr (std::is_integral_v<T>) {
        return "整数类型";
    } else if constexpr (std::is_floating_point_v<T>) {
        return "浮点类型";
    } else {
        return "其他类型";
    }
}

int main() {
    std::cout << "int    -> " << describe(42) << std::endl;
    std::cout << "double -> " << describe(3.14) << std::endl;
    std::cout << "字符串 -> " << describe(std::string("hi")) << std::endl;

    return 0;
}`,
        expectedOutput: `int    -> 整数类型
double -> 浮点类型
字符串 -> 其他类型`
      },
      notes: '这个例子展示了 if constexpr 的威力：一个函数模板就处理了三种情况。注意它和普通 if 的区别 —— 普通 if 会把所有分支都编译出来，只是运行时选择；if constexpr 是编译时就把不用的分支丢掉。'
    },

    /* ---------- 25. C++20 ---------- */
    {
      type: 'cards',
      eyebrow: 'C++20',
      title: 'C++20：又一次大更新',
      lead: '这是继 C++11 之后最大的一次更新，被称为"第二个现代 C++ 起点"。',
      cards: [
        {
          icon: 'concept',
          heading: 'Concepts 概念',
          body: '给模板参数加约束，错误信息从"几百行模板报错"变成一句清楚的提示。'
        },
        {
          icon: 'range',
          heading: 'Ranges 范围库',
          body: '用管道符组合操作：`v | filter(...) | transform(...)`，不用再手写 `begin/end`。'
        },
        {
          icon: 'compare',
          heading: '三路比较 <=>',
          body: '写一个 `<=>` 运算符，编译器自动生成 `<` `>` `<=` `>=` 全部六个比较。'
        },
        {
          icon: 'thread',
          heading: '协程与模块',
          body: '`co_await`/`co_yield` 支持异步编程；`import`/`export` 取代 `#include`。'
        }
      ],
      notes: 'C++20 是又一次大更新。Concepts 解决了 C++ 模板报错信息难读的老问题；Ranges 让数据处理写起来像管道；三路比较运算符能自动生成全部六个比较运算符。模块和协程更接近工程实践，入门阶段了解即可。'
    },

    /* ---------- 26. C++20 示例 ---------- */
    {
      type: 'code',
      eyebrow: 'C++20',
      title: 'Concepts 与 Ranges 初体验',
      lead: '两段代码，让你感受一下 C++20 的写法。',
      points: [
        '`template <std::integral T>` 约束 T 必须是整数类型',
        '传错类型时，报错直接指出"约束不满足"',
        '`views::filter` 与 `views::transform` 用 `|` 串联',
        'ranges 是**惰性求值**的，不会产生中间容器'
      ],
      code: {
        file: 'cpp20_demo.cpp',
        source: `#include <iostream>
#include <vector>
#include <ranges>
#include <concepts>

// concept 约束：T 必须是整数类型
template <std::integral T>
T doubleIt(T v) { return v * 2; }

int main() {
    std::cout << "doubleIt(21) = " << doubleIt(21) << std::endl;

    std::vector<int> v{5, 2, 8, 1, 9, 3};

    // 用管道组合：先筛出奇数，再各自平方
    auto result = v
        | std::views::filter([](int n) { return n % 2 == 1; })
        | std::views::transform([](int n) { return n * n; });

    for (auto n : result) std::cout << n << " ";
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `doubleIt(21) = 42
25 1 81 9 `,
        note: {
          kind: 'note',
          title: 'Ranges 是惰性的',
          text: '`result` 并不会立刻算出一个新容器 —— 它是**惰性求值**的视图。真正计算发生在 `for` 循环迭代的时候，而且不会产生中间的临时 `vector`。这是它在处理大数据时比手写循环更高效的原因之一。'
        }
      },
      notes: '这段代码需要 C++20 才能编译。如果你的编译器版本较老，可以在 Compiler Explorer 上把编译选项切成 -std=c++20 试试。Ranges 的管道写法是函数式风格，一开始可能不习惯，但组合复杂操作时非常清晰。'
    },

    /* ---------- 27. 各标准对比 ---------- */
    {
      type: 'compare',
      eyebrow: '速查',
      title: '四个标准的核心更新',
      lead: '按"如果你只记一件事"的标准整理的。',
      table: {
        head: ['标准', '定位', '最该记住的', '日常使用建议'],
        rows: [
          ['**C++11**', '分水岭，内容最多', '`auto` / 范围 for / lambda / 智能指针 / 移动语义', '**必学**，现代 C++ 的起点'],
          ['**C++14**', '小版本，修补为主', '泛型 lambda / `make_unique`', '顺手用，无需专门学'],
          ['**C++17**', '实用改进很多', '结构化绑定 / `if constexpr` / `optional`', '**很实用**，值得掌握'],
          ['**C++20**', '第二次大更新', 'Concepts / Ranges / `<=>`', '了解即可，视项目条件采用']
        ]
      },
      notes: '这张表建议截图保存。总结一下：C++11 必须学透，C++17 很实用，C++14 不用专门学，C++20 先了解。实际项目里能用到哪个标准，取决于你们的编译器版本和团队约定。'
    },

    /* ---------- 28. 迁移建议 ---------- */
    {
      type: 'cards',
      eyebrow: '实践建议',
      title: '从今天起可以改的写法',
      lead: '这些改动不改变程序逻辑，但能让代码明显更现代、更安全。',
      cards: [
        {
          icon: 'pointer',
          heading: '裸 new/delete → 智能指针',
          body: '`int* p = new int(5);` 改成 `auto p = std::make_unique<int>(5);`，再也不用担心忘记 delete。'
        },
        {
          icon: 'nullptr',
          heading: 'NULL / 0 → nullptr',
          body: '全局替换 `NULL` 和用作指针的 `0`，消除重载歧义。'
        },
        {
          icon: 'auto',
          heading: '写下标循环 → 范围 for',
          body: '`for (int i = 0; i < v.size(); i++)` 改成 `for (const auto& x : v)`，更短也更不容易出错。'
        },
        {
          icon: 'chain',
          heading: '函数指针 → lambda',
          body: '传给算法的比较函数、回调，优先写成 lambda，代码就在使用处。'
        }
      ],
      notes: '这几条是最容易落地的现代化改造。如果你的项目还在用老写法，可以从这四处开始改，风险很低，收益明显。'
    },

    /* ---------- 29. 学习建议 ---------- */
    {
      type: 'code',
      eyebrow: '动手练习',
      title: '练习：把老代码改写成现代写法',
      lead: '下面这段代码写的是 C++98 的风格。复制到 Compiler Explorer，试着用本章学到的特性改写它。',
      code: {
        file: 'modernize.cpp',
        source: `#include <iostream>
#include <vector>
#include <algorithm>

// 改造方向：
//   1. 用 unique_ptr 替代裸 new/delete
//   2. 用 nullptr 替代 NULL
//   3. 用范围 for 替代下标循环
//   4. 用 lambda 替代手写的比较函数

bool compareDesc(int a, int b) { return a > b; }

int main() {
    std::vector<int>* v = new std::vector<int>();
    v->push_back(5);
    v->push_back(2);
    v->push_back(8);

    std::sort(v->begin(), v->end(), compareDesc);

    for (size_t i = 0; i < v->size(); i++) {
        std::cout << (*v)[i] << " ";
    }
    std::cout << std::endl;

    delete v;
    return 0;
}`,
        expectedOutput: `8 5 2 `,
        note: {
          kind: 'note',
          title: '改造后的样子',
          text: '`auto v = std::vector<int>{5, 2, 8};` 一行替代了 new 和三次 push_back；`std::sort` 的比较函数写成 lambda；遍历用 `for (const auto& n : v)`；最后不需要 delete。**代码从 10 行变成 4 行，而且不会泄漏。**'
        }
      },
      notes: '这道练习请一定动手做。改造完之后你会发现，现代 C++ 的代码量和可读性都比老写法好很多。这也是为什么大家说 C++11 之后的 C++ 像是另一门语言。'
    },

    /* ---------- 30. 全课小结 ---------- */
    {
      type: 'end',
      icon: 'cpp20',
      title: '课程到此结束',
      lead: '从数据类型到 Modern C++，你已经走完了 C/C++ 的入门全程。',
      cards: [
        { icon: 'cpp11', heading: 'C++11 必学', body: 'auto、范围 for、lambda、智能指针、移动语义' },
        { icon: 'guard', heading: '少写 delete', body: '用 unique_ptr / shared_ptr 让资源自动释放' },
        { icon: 'move', heading: '善用移动', body: '不再需要的对象，用 std::move 交出资源而不是复制' },
        { icon: 'cpp17', heading: '跟上标准', body: '结构化绑定、if constexpr、optional 都很实用' }
      ],
      notes: '到这里，这套 C/C++ 教程就全部结束了。我们从前言开始，走过了数据类型、运算符、控制流、函数、数组、指针、结构体、类与多态，最后来到现代 C++。入门之后的路要靠多写代码来走，建议你找一些小项目练手，比如写一个通讯录、一个简单的计算器。祝大家学习顺利！'
    }
  ];
})(window);
