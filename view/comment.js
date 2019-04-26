
let count = utils.createNode('span', "hide", `<span class="leancloud-visitors" data-flag-title="${document.title}" id="${utils.search.path}"><input class="leancloud-visitors-count"/></span>`);
document.body.appendChild(count);
window.addEventListener("load", () => {
    utils.$(".leancloud-visitors-count", count)[0].addEventListener("change", () => {console.log("visit count: " + this.value)});
    utils.addJs("https://cdn1.lncld.net/static/js/3.0.4/av-min.js", true, () => {
        utils.addJs("https://unpkg.com/valine@1.3.6/dist/Valine.min.js", true, () => {
            new Valine({
                path: utils.search.path,
                el: '#vcomments',
                appId: 'TtiWfdzc3Pcwy62vcXJj4zKl-gzGzoHsz',
                appKey: 'UzO9Cq4rVPLwyOKmolTwYAXo',
                placeholder: "评论一下。\n欢迎在上方留下您的昵称、邮箱、主页。",
                verify: true,
                visitor: true
            })
        });
    });
});

