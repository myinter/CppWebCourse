/* ============================================================
   第 3 章 · 控制流

   所有 code.expectedOutput 均由 clang++ 实际编译运行得到。
   ============================================================ */
(function (global) {
  'use strict';
  global.PYT = global.PYT || {};
  global.PYT.data = global.PYT.data || {};

  global.PYT.data.ch3 = [

    /* ---------- 1. 封面 ---------- */
    {
      type: 'title',
      eyebrow: '第 3 章',
      title: '控制流',
      lead: '让程序学会判断与重复',
      notes: '大家好，欢迎回到 C/C++ 编程教程。在前两章，我们学习了如何存储和操作数据。但程序如果只能按部就班地执行，那就太死板了。在这一章，我们将学习"控制流"，它能让程序像人一样"思考"和"重复"。'
    },

    /* ---------- 2. 知识地图 ---------- */
    {
      type: 'map',
      eyebrow: '本章脉络',
      title: '一张图看懂本章',
      lead: '三种基本结构，加上精细控制流程的几个关键字。',
      map: {
        aria: '本章知识地图：三种基本结构、选择结构、循环结构、跳转语句',
        root: { title: '第 3 章 · 控制流', sub: '判断与重复' },
        branches: [
          {
            title: '三种基本结构',
            sub: '一切逻辑的基础',
            leaves: [
              { title: '顺序结构', sub: '按部就班' },
              { title: '选择结构', sub: '十字路口' },
              { title: '循环结构', sub: '环形跑道' }
            ]
          },
          {
            title: '选择结构',
            sub: '让程序会判断',
            leaves: [
              { title: 'if / if-else', sub: '单双向分支' },
              { title: 'else if 链', sub: '多向分支' },
              { title: 'switch-case', sub: '多路分支' }
            ]
          },
          {
            title: '循环结构',
            sub: '让程序会重复',
            leaves: [
              { title: 'while', sub: '条件驱动' },
              { title: 'do-while', sub: '至少执行一次' },
              { title: 'for', sub: '次数已知' }
            ]
          },
          {
            title: '跳转与嵌套',
            sub: '精细控制流程',
            leaves: [
              { title: 'break', sub: '彻底结束循环' },
              { title: 'continue', sub: '跳过本次迭代' },
              { title: '嵌套结构', sub: '注意可读性' }
            ]
          }
        ]
      },
      notes: '本章四大块：先认识三种基本结构，再分别学习选择结构和循环结构，最后掌握 break、continue 这些精细控制流程的关键字。学完这一章，你就能写出真正有逻辑的程序了。'
    },

    /* ---------- 3. 目录 ---------- */
    {
      type: 'toc',
      eyebrow: '本章内容概览',
      title: '七个部分',
      items: [
        { num: '01', title: '三种基本结构', body: '顺序、选择、循环 —— 一切逻辑的基础' },
        { num: '02', title: '选择结构', body: 'if、if-else、else if 链、switch-case' },
        { num: '03', title: '循环结构', body: 'while、do-while、for 三种循环' },
        { num: '04', title: '跳转语句', body: 'break 与 continue 的区别' },
        { num: '05', title: '嵌套结构', body: '循环套循环，以及可读性问题' },
        { num: '06', title: '综合练习', body: '猜数字、FizzBuzz、九九乘法表' },
        { num: '07', title: '本章小结', body: '常见陷阱汇总与课后练习' }
      ],
      notes: '本章我们将系统学习程序设计的核心——控制流。我们会从最基本的三种结构讲起，然后深入学习选择结构和循环结构的各种形式，以及如何控制循环的执行流程。最后通过几个经典练习来巩固。'
    },

    /* ---------- 4. 分节 01 ---------- */
    {
      type: 'section',
      num: '01',
      title: '三种基本结构',
      sub: '顺序 · 选择 · 循环',
      lead: '计算机科学家已经证明：任何复杂的程序逻辑，都可以用这三种结构组合出来。',
      notes: '计算机科学家已经证明，任何复杂的程序逻辑，都可以通过三种基本结构的组合来实现。它们就是顺序结构、选择结构和循环结构。掌握了它们，就等于掌握了程序设计的核心逻辑。'
    },

    /* ---------- 5. 三种结构 ---------- */
    {
      type: 'cards',
      eyebrow: '程序设计的基石',
      title: '三种基本结构',
      lead: '再复杂的程序，拆开来都是这三种结构的组合。',
      cards: [
        {
          icon: 'sequence',
          heading: '顺序结构',
          body: '一条直线，按部就班。\n程序默认就是这样执行的，上一章写的代码全是顺序结构。'
        },
        {
          icon: 'branch',
          heading: '选择结构',
          body: '一个十字路口，需要做出判断。\n条件成立走这条路，不成立走那条路。'
        },
        {
          icon: 'loop',
          heading: '循环结构',
          body: '一条环形跑道，可以不断重复。\n只要条件还满足，就一圈一圈地跑下去。'
        }
      ],
      note: {
        kind: 'note',
        icon: 'bulb',
        title: '为什么只需要这三种',
        text: '这不是"够用就行"，而是**理论上已经完备** —— 任何可计算的问题，都能用这三种结构表达出来。所以后面无论学多复杂的语法，本质上都是在组合这三样东西。'
      },
      notes: '顺序结构就像一条直线，按部就班。选择结构就像一个十字路口，需要做出判断。而循环结构则像一个环形跑道，可以不断重复。这三种结构的组合，构成了我们所有程序的逻辑基础。'
    },

    /* ---------- 6. 分节 02 ---------- */
    {
      type: 'section',
      num: '02',
      title: '选择结构',
      sub: '让程序会判断',
      lead: '条件成立就执行，不成立就跳过 —— 这是程序具备"思考"能力的第一步。',
      notes: '接下来，我们首先学习选择结构。它能让程序根据不同的条件，做出不同的选择，执行不同的代码。这是程序具备"思考"能力的第一步。'
    },

    /* ---------- 7. if 语句 ---------- */
    {
      type: 'split',
      eyebrow: '单分支',
      title: 'if 语句',
      lead: '最基本的判断：条件为真就执行花括号里的代码，为假就整块跳过。',
      points: [
        '语法：`if (条件) { 代码块 }`',
        '条件是**布尔表达式**，结果非真即假',
        '花括号可以省略（只有一条语句时），但**强烈建议始终写上**',
        '注意：`if (a = 5)` 是赋值不是比较，编译能过但逻辑全错'
      ],
      code: {
        file: 'if_basic.cpp',
        source: `#include <iostream>

int main() {
    int age = 20;

    if (age >= 18) {
        std::cout << "已成年，可以投票" << std::endl;
    }

    std::cout << "程序继续往下执行" << std::endl;

    return 0;
}`,
        expectedOutput: `已成年，可以投票
程序继续往下执行`,
        note: {
          kind: 'trap',
          title: '把 == 写成 = 是经典错误',
          text: '`if (a = 5)` 把 5 赋给 a，表达式的结果是 5（非零即为真），所以**条件永远成立**。编译器通常会给个警告，但代码能编译通过。写比较时把常量放左边（`if (5 == a)`）可以让这类错误变成编译错误，这是一种老程序员的习惯。'
        }
      },
      notes: 'if 语句是最基本的选择结构。它的逻辑很简单：如果括号里的条件表达式为真，就执行花括号里的代码；如果为假，就跳过这段代码，继续执行后面的内容。'
    },

    /* ---------- 8. if-else ---------- */
    {
      type: 'split',
      eyebrow: '双分支',
      title: 'if-else 语句',
      lead: '二选一：条件为真走 if 分支，为假走 else 分支。两者必执行其一。',
      points: [
        '语法：`if (条件) { A } else { B }`',
        '**必然执行其中一个分支**，不会两个都执行，也不会都不执行',
        '`else` 后面不需要再写条件',
        '可以用条件运算符写得更紧凑：`条件 ? A : B`'
      ],
      code: {
        file: 'if_else.cpp',
        source: `#include <iostream>

int main() {
    int num = 7;

    if (num % 2 == 0) {
        std::cout << num << " 是偶数" << std::endl;
    } else {
        std::cout << num << " 是奇数" << std::endl;
    }

    // 等价写法：条件运算符（三元运算符）
    std::cout << num << (num % 2 == 0 ? " 是偶数" : " 是奇数") << std::endl;

    return 0;
}`,
        expectedOutput: `7 是奇数
7 是奇数`
      },
      notes: 'if-else 语句提供了双向选择。如果条件为真，执行 if 后面的代码块；如果为假，就执行 else 后面的代码块。这样就实现了"二选一"的逻辑。后面那个三元运算符的写法是它的紧凑形式，简单判断时很好用。'
    },

    /* ---------- 9. else if 链 ---------- */
    {
      type: 'code',
      eyebrow: '多分支',
      title: 'else if 链：从上往下依次判断',
      lead: '多个条件时，程序会**依次检查**，一旦命中就不再往下看。',
      points: [
        '从上到下逐个判断，**命中即停**',
        '所以**条件的顺序至关重要**',
        '最后可以跟一个 `else` 兜底',
        '条件有重叠区间时，顺序写错结果就全错'
      ],
      code: {
        file: 'else_if.cpp',
        source: `#include <iostream>

int main() {
    int score = 85;

    // 正确：从高到低判断
    if (score >= 90) {
        std::cout << "90+ -> 优秀" << std::endl;
    } else if (score >= 80) {
        std::cout << "80+ -> 良好" << std::endl;
    } else if (score >= 60) {
        std::cout << "60+ -> 及格" << std::endl;
    } else {
        std::cout << "不及格" << std::endl;
    }

    // 错误：把最低的门槛放在最前面，后面永远轮不到
    if (score >= 60) {
        std::cout << "60+ 放最前 -> 及格" << std::endl;
    } else if (score >= 90) {
        std::cout << "这一条永远执行不到" << std::endl;
    }

    return 0;
}`,
        expectedOutput: `80+ -> 良好
60+ 放最前 -> 及格`,
        note: {
          kind: 'trap',
          title: '顺序写反，逻辑全废',
          text: '第二段代码里 `score >= 60` 写在最前面。85 分满足这个条件，于是**直接命中并停止**，后面那条 `>= 90` 永远轮不到。虽然它写在那里，但没有任何机会执行。判断区间有重叠时，**一定要从最严格的条件开始写**。'
        }
      },
      notes: '当我们需要判断多个条件时，可以使用 if-else if-else 结构。它会从上到下依次检查每个条件，一旦找到一个为真的条件，就执行对应的代码块，并跳过后面所有的判断。请注意下面那个反例——把宽松的条件写在前面，后面的判断就永远没机会执行了。'
    },

    /* ---------- 10. switch-case ---------- */
    {
      type: 'split',
      eyebrow: '多路分支',
      title: 'switch-case',
      lead: '当一个变量要跟多个**固定值**比较时，switch 比一串 else if 更清晰。',
      points: [
        '语法：`switch (表达式) { case 值: ... break; }`',
        '表达式只能是**整型或枚举**，不能是浮点、字符串',
        '**每个 case 后面要写 `break`**，否则会"贯穿"',
        '`default` 分支处理所有没匹配上的情况'
      ],
      code: {
        file: 'switch_demo.cpp',
        source: `#include <iostream>

int main() {
    int choice = 2;

    std::cout << "请选择操作（1 查余额 / 2 取款 / 3 转账）" << std::endl;

    switch (choice) {
        case 1:
            std::cout << "正在查询余额..." << std::endl;
            break;
        case 2:
            std::cout << "正在取款..." << std::endl;
            break;
        case 3:
            std::cout << "正在转账..." << std::endl;
            break;
        default:
            std::cout << "无效的选项" << std::endl;
            break;
    }

    return 0;
}`,
        expectedOutput: `请选择操作（1 查余额 / 2 取款 / 3 转账）
正在取款...`
      },
      notes: 'switch-case 是另一种多路分支结构，特别适合处理一个变量等于多个不同常量值的情况，比如菜单选择。每个 case 对应一个常量值。这里要特别强调 break 语句的重要性，它用于跳出整个 switch 结构。下一页我们专门看看不写 break 会发生什么。'
    },

    /* ---------- 11. switch 贯穿陷阱 ---------- */
    {
      type: 'code',
      eyebrow: '必看',
      title: '忘写 break 会"贯穿"到下一个 case',
      lead: '这是 switch 最著名、也最容易犯的错误。它不报错，只是默默做错事。',
      points: [
        '没有 `break` 时，程序会**继续执行下一个 case 的代码**',
        '这叫 fall-through（贯穿），几乎总是 bug',
        '编译器一般会警告，但不会阻止你编译',
        '少数场景**故意**利用贯穿（如多个值走同一逻辑），但一定要加注释说明'
      ],
      code: {
        file: 'fallthrough.cpp',
        source: `#include <iostream>

int main() {
    int choice = 1;

    std::cout << "=== 没有写 break 的 switch ===" << std::endl;
    switch (choice) {
        case 1:
            std::cout << "执行 case 1" << std::endl;
            // 漏了 break！
        case 2:
            std::cout << "执行 case 2" << std::endl;
            // 又漏了！
        case 3:
            std::cout << "执行 case 3" << std::endl;
            break;
        default:
            std::cout << "执行 default" << std::endl;
    }

    std::cout << "=== 写全 break 的对比 ===" << std::endl;
    switch (choice) {
        case 1:
            std::cout << "只执行 case 1" << std::endl;
            break;
        case 2:
            std::cout << "只执行 case 2" << std::endl;
            break;
        default:
            break;
    }

    return 0;
}`,
        expectedOutput: `=== 没有写 break 的 switch ===
执行 case 1
执行 case 2
执行 case 3
=== 写全 break 的对比 ===
只执行 case 1`,
        note: {
          kind: 'trap',
          title: '这个 bug 不会报错',
          text: '只选了 `case 1`，却把下面三个分支全部执行了一遍 —— 这就是贯穿。它**编译通过、运行正常**，只是结果完全不对。养成习惯：**写完每个 case 立刻补上 break**，不要等到最后。'
        }
      },
      notes: '这段代码请仔细看输出。明明 choice 是 1，却把 case 1、2、3 全执行了，default 也执行了。原因就是没写 break。这个坑非常常见，请大家写 switch 时务必记得每个 case 后面加 break。'
    },

    /* ---------- 12. if 链 vs switch ---------- */
    {
      type: 'compare',
      eyebrow: '怎么选',
      title: 'else if 链 还是 switch',
      lead: '两者都能做多路分支，但适用场景不同。',
      versus: {
        a: {
          title: 'else if 链',
          icon: 'branch',
          items: [
            '条件是**区间或复杂表达式** —— 用这个',
            '`if (score >= 90)` 这种范围判断只能用 if',
            '不要求条件是常量',
            '写的顺序会影响结果（从上往下命中即停）'
          ]
        },
        b: {
          title: 'switch-case',
          icon: 'merge',
          items: [
            '变量跟**一组固定常量**比较 —— 用这个',
            '`switch (menuId)` 这种等值判断更清晰',
            '条件必须是整型或枚举常量',
            '编译器可能优化成跳转表，效率更高'
          ]
        }
      },
      note: {
        kind: 'note',
        title: '一句话判断',
        text: '**判断"在哪个范围"用 if，判断"等于哪个值"用 switch。** 比如成绩分级（>= 90、>= 80）用 if；菜单选项（1、2、3）用 switch。'
      },
      notes: '这两种结构不是互相替代的关系，而是各有所长。判断范围用 if，判断具体等于哪个值用 switch。另外提醒一下，写 switch 时每个 case 都别忘 break。'
    },

    /* ---------- 13. 分节 03 ---------- */
    {
      type: 'section',
      num: '03',
      title: '循环结构',
      sub: '让程序会重复',
      lead: '需要重复做同一件事时，循环让程序自己跑下去，而不是把代码复制一百遍。',
      notes: '学会了选择，我们再来看循环。循环结构可以让程序重复执行一段代码，直到满足特定条件。这是实现自动化任务的关键。'
    },

    /* ---------- 14. while ---------- */
    {
      type: 'split',
      eyebrow: '循环 1',
      title: 'while 循环',
      lead: '先判断条件，为真才执行循环体。条件驱动，适合不知道要循环多少次的场景。',
      points: [
        '语法：`while (条件) { 循环体 }`',
        '**先判断，后执行** —— 条件一开始就为假时，循环体一次都不执行',
        '循环体里必须有**能改变条件**的语句，否则死循环',
        '适合"只要还没完成就继续"这类场景'
      ],
      code: {
        file: 'while_demo.cpp',
        source: `#include <iostream>

int main() {
    int i = 1;

    while (i <= 5) {
        std::cout << i << " ";
        i++;                    // 这一行不能少，否则死循环
    }
    std::cout << std::endl;

    // 条件一开始就是假：循环体一次都不执行
    int j = 100;
    while (j < 5) {
        std::cout << "这行永远不会执行" << std::endl;
        j++;
    }
    std::cout << "循环结束时 i = " << i << "，j = " << j << std::endl;

    return 0;
}`,
        expectedOutput: `1 2 3 4 5
循环结束时 i = 6，j = 100`
      },
      notes: 'while 循环是最基本的循环结构。它会先检查条件，如果条件为真，就执行循环体。循环体内必须有能够改变条件的语句，比如示例中的 i++，否则会导致无限循环，程序将一直卡在这个循环里。'
    },

    /* ---------- 15. 死循环陷阱 ---------- */
    {
      type: 'code',
      eyebrow: '常见错误',
      title: '漏写 i++ 会怎样',
      lead: '循环条件永远为真，程序卡死在那儿。这是初学者最常犯的错误之一。',
      points: [
        '循环变量**没有更新** → 条件恒为真 → 死循环',
        '程序表现为"卡住不动"，CPU 占用飙升',
        '修法：检查循环体里有没有改变条件的语句'
      ],
      code: {
        file: 'infinite_loop.cpp',
        source: `#include <iostream>

int main() {
    // 本意：打印 1 到 5
    // 实际：忘了写 i++，i 永远是 1，条件永远成立

    int i = 1;
    int guard = 0;              // 安全计数器，防止这个示例真的卡死

    while (i <= 5) {
        std::cout << "i = " << i << "  （i 一直没有变化）" << std::endl;
        // 这里本该有 i++;  但漏了
        if (++guard >= 3) break;   // 只演示三次，然后强制退出
    }

    std::cout << "真实运行时，这里会永远循环下去" << std::endl;
    std::cout << "解决办法：在循环体里补上 i++;" << std::endl;

    return 0;
}`,
        expectedOutput: `i = 1  （i 一直没有变化）
i = 1  （i 一直没有变化）
i = 1  （i 一直没有变化）
真实运行时，这里会永远循环下去
解决办法：在循环体里补上 i++;`,
        note: {
          kind: 'trap',
          title: '死循环在网页里也一样危险',
          text: '真实运行时，死循环会让程序**完全卡住**，只能强制杀掉进程。写循环时请养成习惯：**写完 `while` 立刻确认循环体里有改变条件的语句**。'
        }
      },
      notes: '这个例子演示了死循环是怎么产生的。i 初值是 1，条件 i <= 5 永真，循环体里又没有改 i，所以会一直打印下去。为了不让这个示例真的卡死，我加了一个安全计数器。大家在写循环时一定要检查这一点。'
    },

    /* ---------- 16. do-while ---------- */
    {
      type: 'code',
      eyebrow: '循环 2',
      title: 'do-while：至少执行一次',
      lead: '先执行循环体，再判断条件。这个差别在"必须至少做一次"的场景里很关键。',
      points: [
        '语法：`do { 循环体 } while (条件);` —— **末尾有分号，别忘**',
        '**先执行，后判断**，所以循环体至少执行一次',
        '适合"先做一次，再看要不要继续"的场景',
        '比如：先读入一个值，再判断它是否合法'
      ],
      code: {
        file: 'do_while.cpp',
        source: `#include <iostream>

int main() {
    // 条件一开始就是假，但循环体仍然执行了一次
    int n = 10;

    std::cout << "=== do-while：先执行，后判断 ===" << std::endl;
    do {
        std::cout << "循环体执行了，此时 n = " << n << std::endl;
        n++;
    } while (n < 5);

    std::cout << "退出循环，n = " << n << std::endl;

    // 对比：while 在这种情况下一次都不执行
    std::cout << "=== while：同一条件下一次都不执行 ===" << std::endl;
    int m = 10;
    while (m < 5) {
        std::cout << "这行不会被执行" << std::endl;
        m++;
    }
    std::cout << "退出循环，m = " << m << std::endl;

    return 0;
}`,
        expectedOutput: `=== do-while：先执行，后判断 ===
循环体执行了，此时 n = 10
退出循环，n = 11
=== while：同一条件下一次都不执行 ===
退出循环，m = 10`,
        note: {
          kind: 'trap',
          title: '别忘末尾的分号',
          text: '`do { ... } while (条件);` 结尾**必须加分号**，这是 C++ 里少数几个"语句结束必须加冒号"的特殊位置。漏了会报奇怪的语法错误，因为编译器会把后面的语句当成循环体的一部分。'
        }
      },
      notes: 'do-while 和 while 的唯一区别是判断时机。看输出：n 初值是 10，条件 n<5 明明是假的，但循环体还是执行了一次。这就是"至少执行一次"的含义。另外请大家特别注意，do-while 结尾必须加分号。'
    },

    /* ---------- 17. for 循环 ---------- */
    {
      type: 'split',
      eyebrow: '循环 3',
      title: 'for 循环',
      lead: '把初始化、条件、更新三件事写在一行，循环次数已知时最清晰。',
      points: [
        '语法：`for (初始化; 条件; 更新) { 循环体 }`',
        '三部分用**分号**隔开，不是逗号',
        '`i` 的作用域只在循环内，出了循环就访问不到',
        '三段都可以省略，`for (;;)` 就是死循环'
      ],
      code: {
        file: 'for_demo.cpp',
        source: `#include <iostream>

int main() {
    // 最经典的用法：累加 1 到 100
    int sum = 0;
    for (int i = 1; i <= 100; i++) {
        sum += i;
    }
    std::cout << "1 到 100 的和 = " << sum << std::endl;

    // 倒着数
    for (int i = 5; i > 0; i--) {
        std::cout << i << " ";
    }
    std::cout << std::endl;

    // 步长不是 1：打印偶数
    for (int i = 0; i <= 10; i += 2) {
        std::cout << i << " ";
    }
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `1 到 100 的和 = 5050
5 4 3 2 1
0 2 4 6 8 10 `
      },
      notes: 'for 循环是最强大、最常用的循环。它把循环的三个关键部分——初始化、条件判断和更新操作——都写在了一行，结构非常清晰，特别适合处理已知循环次数的任务。注意三部分之间是分号不是逗号。'
    },

    /* ---------- 18. 三种循环怎么选 ---------- */
    {
      type: 'compare',
      eyebrow: '怎么选',
      title: '三种循环的适用场景',
      lead: '它们能互相替代（都可用 while 写出来），但选对了会让代码意图更清楚。',
      table: {
        head: ['循环', '判断时机', '适用场景', '典型写法'],
        rows: [
          ['`for`', '先判断', '**循环次数已知**', '`for (int i = 0; i < n; i++)`'],
          ['`while`', '先判断', '**次数未知，靠条件决定**', '`while (!done) { ... }`'],
          ['`do-while`', '后判断', '**至少执行一次**', '`do { ... } while (again);`']
        ]
      },
      note: {
        kind: 'note',
        title: '选择的原则',
        text: '**能一眼看出要循环多少次，就用 `for`**；"只要还有就继续"用 `while`；"先做一次再说"用 `do-while`。这个选择不影响功能，但会直接影响别人读你代码时的理解速度。'
      },
      notes: '这三种循环在表达能力上是等价的，用哪个都能实现同样的功能。但我们还是建议按场景选择，因为这能让读代码的人一眼看出你的意图。'
    },

    /* ---------- 19. 分节 04 ---------- */
    {
      type: 'section',
      num: '04',
      title: '跳转语句',
      sub: 'break 与 continue',
      lead: '有时需要提前结束循环，或者跳过某一次迭代。',
      notes: '在循环中，我们有时需要更精细地控制流程，比如提前结束循环，或者跳过某次迭代。这时就需要用到 break 和 continue 语句。'
    },

    /* ---------- 20. break vs continue ---------- */
    {
      type: 'code',
      eyebrow: '核心区别',
      title: 'break 彻底结束，continue 只跳过这一次',
      lead: '一个是"不干了"，一个是"这次不算，继续下一个"。',
      points: [
        '`break`：**立即终止整个循环**，跳到循环外面',
        '`continue`：**跳过本次迭代的剩余部分**，直接进入下一次',
        '在 `while` 里用 `continue` 要小心：容易漏掉更新语句造成死循环',
        '两个都只能影响**最内层**的循环'
      ],
      code: {
        file: 'break_continue.cpp',
        source: `#include <iostream>

int main() {
    std::cout << "用 break —— 到 5 就整个结束：" << std::endl;
    for (int i = 1; i <= 10; i++) {
        if (i == 5) break;
        std::cout << i << " ";
    }
    std::cout << std::endl;

    std::cout << "用 continue —— 只跳过 5，后面继续：" << std::endl;
    for (int i = 1; i <= 10; i++) {
        if (i == 5) continue;
        std::cout << i << " ";
    }
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `用 break —— 到 5 就整个结束：
1 2 3 4
用 continue —— 只跳过 5，后面继续：
1 2 3 4 6 7 8 9 10 `,
        note: {
          kind: 'trap',
          title: 'while 里用 continue 的危险',
          text: '在 `for` 里用 `continue` 很安全，因为 `i++` 会自动执行。但在 `while` 里，如果更新语句写在 `continue` 后面，它会被跳过 —— **直接变成死循环**。所以在 while 里用 continue 时，要确保更新语句在 continue 之前。'
        }
      },
      notes: 'break 语句会立即终止整个循环，程序流程会跳到循环外面。而 continue 语句只是跳过当前这次循环的剩余部分，直接进入下一次循环的条件判断。一个是彻底结束，一个是暂时跳过。看输出可以很清楚地对比出来。'
    },

    /* ---------- 21. 分节 05 ---------- */
    {
      type: 'section',
      num: '05',
      title: '嵌套结构',
      sub: '结构里面放结构',
      lead: '循环里套循环、判断里套循环 —— 复杂逻辑由此而来，可读性问题也随之而来。',
      notes: '我们可以在一个控制结构的内部，再放置另一个控制结构，这就是嵌套。通过嵌套，我们可以实现更复杂的逻辑，比如循环里套循环，或者选择里套循环。'
    },

    /* ---------- 22. 嵌套循环 ---------- */
    {
      type: 'split',
      eyebrow: '嵌套',
      title: '嵌套循环的执行顺序',
      lead: '外层循环每走一步，内层循环都要完整地跑一遍。',
      points: [
        '**外层走一次，内层跑一整轮**',
        '总执行次数 = 外层次数 × 内层次数',
        '内层循环里可以用外层的变量（常见的三角形图案就靠这个）',
        '`break` / `continue` 只影响**最内层**循环'
      ],
      code: {
        file: 'nested_loop.cpp',
        source: `#include <iostream>

int main() {
    std::cout << "外层每走一步，内层完整跑一轮：" << std::endl;
    for (int i = 1; i <= 3; i++) {
        std::cout << "  外层 i = " << i << " ：";
        for (int j = 1; j <= 4; j++) {
            std::cout << j << " ";
        }
        std::cout << std::endl;
    }

    std::cout << "内层上限跟着外层变，就是三角形：" << std::endl;
    for (int i = 1; i <= 4; i++) {
        for (int j = 1; j <= i; j++) {
            std::cout << "* ";
        }
        std::cout << std::endl;
    }

    return 0;
}`,
        expectedOutput: `外层每走一步，内层完整跑一轮：
  外层 i = 1 ：1 2 3 4
  外层 i = 2 ：1 2 3 4
  外层 i = 3 ：1 2 3 4
内层上限跟着外层变，就是三角形：
*
* *
* * *
* * * * `
      },
      notes: '嵌套循环的关键是理解执行顺序。看输出：外层 i=1 时，内层完整打印了 1 2 3 4；然后外层 i=2，内层又重新从头打印一遍。所以总共执行了 3 乘以 4 等于 12 次内层循环。'
    },

    /* ---------- 23. 嵌套的可读性 ---------- */
    {
      type: 'cards',
      eyebrow: '工程实践',
      title: '嵌套要适度',
      lead: '嵌套是实现复杂逻辑的手段，但过深的嵌套会让代码变成一团乱麻。',
      cards: [
        {
          icon: 'layers',
          heading: '三层是警戒线',
          body: '超过三层嵌套，人脑就很难在阅读时同时记住所有条件了。这时应该考虑**提取函数**。'
        },
        {
          icon: 'check',
          heading: '善用提前返回',
          body: '把不满足的情况用 `if (...) return;` 提前排掉，剩下的就是主流程，比层层缩进清晰得多。'
        },
        {
          icon: 'text',
          heading: '缩进必须规范',
          body: '每层缩进 4 个空格，让代码的层次结构**肉眼可见**。这是可读性最便宜也最有效的一招。'
        },
        {
          icon: 'bulb',
          heading: '合并条件',
          body: '能用 `&&` 合并的判断，就别写成两层 if。既短又清楚。'
        }
      ],
      notes: '嵌套是实现复杂逻辑的重要手段，但也要注意适度。过多的嵌套会让代码变得像一团乱麻，难以阅读和维护。因此编写代码时一定要注意缩进，让代码的结构清晰可见。超过三层嵌套时，就该考虑把内层提取成函数了。'
    },

    /* ---------- 24. 分节 06 ---------- */
    {
      type: 'section',
      num: '06',
      title: '综合练习',
      sub: '把学到的组合起来',
      lead: '三个经典练习，分别考察循环控制、多条件判断和嵌套循环。',
      notes: '理论学习完了，我们来通过几个经典的编程练习来巩固一下本章所学的知识。这些练习将综合运用我们学到的选择和循环结构。'
    },

    /* ---------- 25. 随机数 ---------- */
    {
      type: 'code',
      eyebrow: '练习前准备',
      title: '生成随机数：rand 与 srand',
      lead: '猜数字游戏需要随机数，先把这个工具准备好。',
      points: [
        '`rand()` 返回一个伪随机整数',
        '**必须先用 `srand(种子)` 播种**，否则每次运行结果一样',
        '固定种子 → 结果可复现（调试时有用）',
        '`time(0)` 取当前时间做种子 → 每次运行都不同',
        '`rand() % 100 + 1` 可以得到 1 到 100'
      ],
      code: {
        file: 'random_demo.cpp',
        source: `#include <iostream>
#include <cstdlib>      // rand, srand

int main() {
    // 固定种子：每次运行结果都一样，便于验证
    std::srand(42);

    std::cout << "前五个随机数：";
    for (int i = 0; i < 5; i++) {
        std::cout << std::rand() % 100 + 1 << " ";
    }
    std::cout << std::endl;

    // 同一种子，重新播种得到相同序列
    std::srand(42);
    std::cout << "重新播种后：  ";
    for (int i = 0; i < 5; i++) {
        std::cout << std::rand() % 100 + 1 << " ";
    }
    std::cout << std::endl;

    std::cout << "正式游戏里用 srand(time(0))，每次运行都不同" << std::endl;

    return 0;
}`,
        expectedOutput: `前五个随机数：95 24 10 44 27
重新播种后：  95 24 10 44 27
正式游戏里用 srand(time(0))，每次运行都不同`,
        note: {
          kind: 'note',
          title: '为什么本页用固定种子',
          text: '这里用 `srand(42)` 固定种子，是为了让输出**可复现** —— 页面上标注的输出才能和你运行的结果一致。如果用了 `time(0)`，每次运行的数字都不一样，就没法验证了。你在自己写游戏时应该用 `srand(time(0))`。'
        }
      },
      notes: '在写猜数字游戏之前，先认识随机数函数。rand 产生随机数，但必须先用 srand 播种。这里我用了固定的种子 42，所以每次运行结果都一样——这是为了让输出可以验证。你们自己写游戏时要用 time(0) 做种子，这样每次运行才不同。'
    },

    /* ---------- 26. FizzBuzz ---------- */
    {
      type: 'code',
      eyebrow: '练习一',
      title: 'FizzBuzz',
      lead: '经典的面试题，考察 for 循环与多条件判断。**关键在于条件的顺序。**',
      points: [
        '能被 3 整除 → 输出 Fizz',
        '能被 5 整除 → 输出 Buzz',
        '同时被 3 和 5 整除 → 输出 FizzBuzz',
        '**必须最先判断 15**，否则永远轮不到它'
      ],
      code: {
        file: 'fizzbuzz.cpp',
        source: `#include <iostream>

int main() {
    for (int i = 1; i <= 20; i++) {
        // 注意顺序：15 的倍数必须放在最前面判断
        if (i % 15 == 0) {
            std::cout << "FizzBuzz ";
        } else if (i % 3 == 0) {
            std::cout << "Fizz ";
        } else if (i % 5 == 0) {
            std::cout << "Buzz ";
        } else {
            std::cout << i << " ";
        }
    }
    std::cout << std::endl;

    return 0;
}`,
        expectedOutput: `1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz 16 17 Fizz 19 Buzz `,
        note: {
          kind: 'trap',
          title: '顺序错了，FizzBuzz 永远出不来',
          text: '如果把 `i % 3 == 0` 放在第一个，那么 15 会先被 3 整除而输出 `Fizz`，然后就命中停止了 —— **`FizzBuzz` 永远不会被打印**。原因和上一节 else if 链的顺序问题一模一样：**区间有重叠时，最严格的条件要放最前面**。'
        }
      },
      notes: '这道题考察的是对 for 循环和多条件判断的理解。关键在于判断条件的顺序，必须先判断是否是 15 的倍数。因为 15 同时能被 3 和 5 整除，如果先判断 3，它就会输出 Fizz 然后停止，永远轮不到 FizzBuzz。'
    },

    /* ---------- 27. 九九乘法表 ---------- */
    {
      type: 'code',
      eyebrow: '练习二',
      title: '九九乘法表',
      lead: '嵌套循环的绝佳例子：外层控制行，内层控制列。',
      points: [
        '外层循环：控制**行数**（1 到 9）',
        '内层循环：控制**每行的列数**（1 到 i）',
        '内层上限跟着外层变，才能打印出三角形',
        '`\\t` 是制表符，用来对齐'
      ],
      code: {
        file: 'multiplication.cpp',
        source: `#include <iostream>

int main() {
    for (int i = 1; i <= 9; i++) {          // 外层：第几行
        for (int j = 1; j <= i; j++) {      // 内层：第几列（上限是 i）
            std::cout << j << "x" << i << "=" << i * j << "\\t";
        }
        std::cout << std::endl;
    }

    return 0;
}`,
        expectedOutput: `1x1=1
1x2=2	2x2=4
1x3=3	2x3=6	3x3=9
1x4=4	2x4=8	3x4=12	4x4=16
1x5=5	2x5=10	3x5=15	4x5=20	5x5=25
1x6=6	2x6=12	3x6=18	4x6=24	5x6=30	6x6=36
1x7=7	2x7=14	3x7=21	4x7=28	5x7=35	6x7=42	7x7=49
1x8=8	2x8=16	3x8=24	4x8=32	5x8=40	6x8=48	7x8=56	8x8=64
1x9=9	2x9=18	3x9=27	4x9=36	5x9=45	6x9=54	7x9=63	8x9=72	9x9=81	`
      },
      notes: '九九乘法表是学习嵌套循环的绝佳例子。外层循环控制行数，内层循环控制每行的列数。注意内层的条件是 j <= i，上限跟着外层变，这样才能打印出三角形的形状。如果把内层改成 j <= 9，打印出来的就是完整的矩形。'
    },

    /* ---------- 28. 分节 07 ---------- */
    {
      type: 'section',
      num: '07',
      title: '本章小结',
      sub: '回顾与练习',
      lead: '把这一章的结构和陷阱一起过一遍。',
      notes: '本章的内容就到这里。我们来总结一下，并布置一些课后练习，帮助大家巩固所学知识。'
    },

    /* ---------- 29. 常见陷阱汇总 ---------- */
    {
      type: 'cards',
      eyebrow: '避坑指南',
      title: '本章最容易踩的五个坑',
      cards: [
        {
          icon: 'alert',
          heading: 'switch 忘写 break',
          body: '会"贯穿"到下一个 case，把后面所有分支都执行一遍。编译不报错，结果全错。'
        },
        {
          icon: 'alert',
          heading: '循环忘了更新变量',
          body: '`while (i <= 5)` 里漏了 `i++`，条件恒为真，程序卡死。'
        },
        {
          icon: 'alert',
          heading: '== 写成 =',
          body: '`if (a = 5)` 是赋值，条件永远为真。把常量放左边可以避免。'
        },
        {
          icon: 'alert',
          heading: 'else if 顺序写反',
          body: '宽松条件写在前面，后面的判断永远轮不到。最严格的放最前。'
        },
        {
          icon: 'alert',
          heading: '差一错误 off-by-one',
          body: '`i <= n` 还是 `i < n`，循环次数差一次。想清楚再写。'
        },
        {
          icon: 'alert',
          heading: 'do-while 漏分号',
          body: '`} while (条件)` 后面必须有分号，漏了会报奇怪的语法错误。'
        }
      ],
      notes: '这六个坑都是初学者最常遇到的。写代码时如果结果莫名其妙，先回想一下是不是踩了其中某一个。'
    },

    /* ---------- 30. 课后练习 ---------- */
    {
      type: 'cards',
      eyebrow: '动手练习',
      title: '课后练习',
      lead: '这几道题需要综合运用本章的知识，建议都亲手写一遍。',
      cards: [
        {
          icon: 'target',
          heading: '① 闰年判断',
          body: '输入一个年份，判断是否是闰年。\n规则：能被 4 整除但不能被 100 整除，**或者**能被 400 整除。'
        },
        {
          icon: 'target',
          heading: '② 判断素数',
          body: '输入一个正整数，判断它是不是素数。\n提示：用循环试除到平方根即可，不必试到它本身。'
        },
        {
          icon: 'target',
          heading: '③ 打印菱形',
          body: '用嵌套循环打印一个由 `*` 组成的菱形。\n提示：分成上半部分和下半部分，注意空格与星号的数量关系。'
        },
        {
          icon: 'target',
          heading: '④ 猜数字游戏',
          body: '用 `srand(time(0))` 生成 1–100 的随机数，让用户反复猜，\n每次提示"大了"或"小了"，猜中后用 `break` 退出。'
        }
      ],
      note: {
        kind: 'note',
        title: '怎么练最有效',
        text: '**先自己写，卡住了再看答案。** 把代码复制到 Compiler Explorer 上跑一跑，改改条件看看输出怎么变 —— 这种"改一改看结果"的习惯，比读懂代码有用得多。'
      },
      notes: '这里有几个练习题，大家可以尝试自己动手实现一下。这些题目都需要综合运用本章学到的知识，完成它们会让你对控制流有更深刻的理解。特别是猜数字游戏，它把循环、判断、随机数都串起来了。'
    },

    /* ---------- 31. 结尾 ---------- */
    {
      type: 'end',
      icon: 'loop',
      title: '本章小结',
      lead: '让程序会判断、会重复 —— 从这一章起，你能写真正有逻辑的程序了。',
      cards: [
        { icon: 'branch', heading: '选择结构', body: 'if / if-else / else if / switch，判断范围用 if，判断取值用 switch' },
        { icon: 'loop', heading: '循环结构', body: '次数已知用 for，条件驱动用 while，至少一次用 do-while' },
        { icon: 'skip', heading: '跳转语句', body: 'break 彻底结束，continue 只跳过本次' },
        { icon: 'layers', heading: '嵌套结构', body: '外层走一次内层跑一轮，超过三层就该提取函数' }
      ],
      notes: '好的，第 3 章的内容就到这里。我们已经学会了如何让程序进行逻辑判断和循环操作。在下一章中，我们将学习如何把代码组织成可复用的模块，也就是函数。感谢大家的观看，我们下节课再见！'
    }
  ];
})(window);
