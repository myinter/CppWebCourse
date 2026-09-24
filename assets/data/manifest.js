/* ============================================================
   课程目录
   前言编号为 0，正文为 1–7（原 PPT），
   第 8 章「类与多态」与第 9 章「Modern C++」为网页版新增。
   ============================================================ */
(function (global) {
  'use strict';

  global.PYT = global.PYT || {};

  global.PYT.manifest = [
    {
      num: 0,
      slug: 'preface',
      label: '前言',
      title: '课程介绍',
      subtitle: '从认识计算机到写出第一个程序',
      desc: '计算机如何工作、程序是什么、C 与 C++ 的关系，以及把代码变成可执行文件的全过程。',
      icon: 'compile',
      slides: 21,
      topics: ['计算机与程序', 'C/C++ 的地位', '编译链接运行'],
      file: 'assets/data/preface.js'
    },
    {
      num: 1,
      slug: 'ch1',
      label: '第 1 章',
      title: '数据类型与变量常量',
      subtitle: '数据在内存里长什么样',
      desc: '比特与字节、基本数据类型、变量的本质、常量、sizeof 与类型转换。',
      icon: 'memory',
      slides: 22,
      topics: ['数据的本质', '基本数据类型', '变量与常量', '类型转换'],
      file: 'assets/data/ch1.js'
    },
    {
      num: 2,
      slug: 'ch2',
      label: '第 2 章',
      title: '运算符与表达式',
      subtitle: '让数据参与运算',
      desc: '算术、关系、逻辑、位运算符，以及优先级、结合性与副作用这些容易踩的坑。',
      icon: 'calculator',
      slides: 26,
      topics: ['算术与关系运算', '逻辑与短路求值', '位运算', '优先级与副作用'],
      file: 'assets/data/ch2.js'
    },
    {
      num: 3,
      slug: 'ch3',
      label: '第 3 章',
      title: '控制流',
      subtitle: '让程序学会判断与重复',
      desc: '三种基本结构、if 与 switch、三种循环、break 与 continue，以及嵌套结构的可读性。',
      icon: 'branch',
      slides: 31,
      topics: ['分支结构', '循环结构', '跳转语句', '实战练习'],
      file: 'assets/data/ch3.js'
    },
    {
      num: 4,
      slug: 'ch4',
      label: '第 4 章',
      title: '函数',
      subtitle: '把代码切成积木',
      desc: '定义与声明、值传递与引用传递、返回值、重载与默认参数、递归与调用栈、作用域。',
      icon: 'fn',
      slides: 24,
      topics: ['定义与调用', '参数传递', '重载与默认参数', '递归与作用域'],
      file: 'assets/data/ch4.js'
    },
    {
      num: 5,
      slug: 'ch5',
      label: '第 5 章',
      title: '数组与字符串',
      subtitle: '成批处理数据',
      desc: '一维与二维数组的内存布局、越界的危险、C 风格字符串与 std::string 的取舍。',
      icon: 'array',
      slides: 23,
      topics: ['一维数组', '二维数组', 'C 风格字符串', 'std::string'],
      file: 'assets/data/ch5.js'
    },
    {
      num: 6,
      slug: 'ch6',
      label: '第 6 章',
      title: '指针与函数',
      subtitle: 'C++ 最锋利也最危险的工具',
      desc: '地址与指针、指针算术、值传递与地址传递、空指针与野指针、const 指针、动态内存与引用。',
      icon: 'pointer',
      slides: 23,
      topics: ['地址与解引用', '指针与数组', '动态内存', '引用与内存泄漏'],
      file: 'assets/data/ch6.js'
    },
    {
      num: 7,
      slug: 'ch7',
      label: '第 7 章',
      title: '结构体、共用体与枚举',
      subtitle: '自定义自己的数据类型',
      desc: '结构体的定义与内存布局、结构体数组与指针、typedef 与 using、枚举与 enum class、联合体。',
      icon: 'object',
      slides: 23,
      topics: ['结构体', '类型别名', '枚举与 enum class', '联合体'],
      file: 'assets/data/ch7.js'
    },
    {
      num: 8,
      slug: 'ch8',
      label: '第 8 章',
      title: '类与多态',
      subtitle: '把数据和行为打包成对象',
      desc: '类的本质与封装、对象的内存结构、构造与析构、继承、虚函数表与多态、字节对齐、四种类型转换。',
      icon: 'poly',
      slides: 38,
      topics: ['类的本质', '对象的内存结构', '构造与析构', '继承与虚函数表', '类型转换'],
      file: 'assets/data/ch8.js'
    },
    {
      num: 9,
      slug: 'ch9',
      label: '第 9 章',
      title: 'Modern C++ 新特性',
      subtitle: '从 C++11 到 C++20',
      desc: 'C++11 的核心特性彻底讲透，C++14/17/20 的重要更新逐个概览。',
      icon: 'cpp11',
      slides: 37,
      topics: ['auto 与范围 for', 'lambda 与智能指针', '移动语义', 'C++14/17/20 概览'],
      file: 'assets/data/ch9.js'
    }
  ];

  global.PYT.getChapter = function (num) {
    var list = global.PYT.manifest;
    for (var i = 0; i < list.length; i++) {
      if (list[i].num === num) return list[i];
    }
    return null;
  };
})(window);
