## 实现代码

  有几个特点：
1. 这种实现的机制是先执行 superClass 构造函数，再执行自己的构造函数，因此能拷贝 superClass 的属性到子类的示例上。但也意味着不能在父类构造器中执行太耗性能的动作，父类构造器应该以定义属性字段和实例方法为主功能。
2. 只能有一个 superClass。
3. 支持 super 参数。
4. 可以定义一个 init 方法。

```javascript
// 引入 Class 的定义
module.exports = function(superClass, constructor) {
    let fun = function() {
        superClass.apply(this);
        if (constructor) {
            let _supper = {...this};
            constructor.call(this, _supper);
        }
        if (this.init)  {
            let init = this.init.apply(this, arguments);
            if (init instanceof fun) {
                return init;
            }
        }
        return this;
    };
    fun.toString = null;
    return fun;
}
```

## 使用示例

  常见使用方法，以及缺陷展示

```javascript
let Class = require('./class');
var Animal = new Class(function () {
    this.type = "animal";
    this.say = function (words) {
        console.log(this.type + " say: " + words);
    }
});
Animal instanceof Class                    // false
var Dog = new Class(Animal, function () {
    this.type = "Dog";
});
var myDogInstance = new Dog();
myDogInstance instanceof Dog               // true
myDogInstance instanceof Animal            // false （一个小缺陷，按理来说应该返回 true）
myDogInstance.say("汪汪汪");               // Dog say: 汪汪汪

var Cat = new Class(Animal, function (_super) {
    this.type = "Cat";
    this.init = function (name) {
        // _super 是 Animal 的实例
        // _super instanceof Animal == false (一个小缺陷，按理来说应该返回 true)
        _super.say("i am a cat, name is " + name)
    }
});
// 执行了 init 方法
var myCatInstance = new Cat("凯瑟琳");     // animal say: i am a cat, name is 凯瑟琳
myCatInstance instanceof Cat               // true
myCatInstance instanceof Animal            // false
myCatInstance.say("喵喵喵");               // Cat say: 喵喵喵
```