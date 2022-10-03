## 通过CSS进行权限控制

  最近在写管理后台页面的时候遇到一个问题：管理后台有许多角色，每个角色因为权限不同看到的功能页面、功能按钮是不同的。我写了js来进行页面元素的隐藏和展示，感觉略显繁琐。因此我一直在想能不能直接用css来实现。
系统角色很简单，就固定的三种：admin、manager、user，因此有了这个选择器就能轻易实现了。
css 代码如下：

```css
/* 先全部隐藏功能按钮 */
.admin, .manager, user {
    display: none;
}

/* 将有权限的显示出来 */
body.admin .admin,
body.manager .manager,
body.user .user {
    display: auto;
}
```

用户登录后，获取到角色名设置到html元素的class上，相关的功能就可以展示出来了。