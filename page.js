addNode("p", "margin: 35px" ,`<br class="leancloud-visitors" id="page${location.pathname.replace(/[\/\.]/g,"-")}"/>转载请注明原文地址： <a href='${location.href}'>${location.href}</a><small>&nbsp;&nbsp;(&nbsp;创建于：${document.head.querySelector('[name=modifydate]').content}&nbsp;&nbsp;阅读量：<i class="leancloud-visitors-count">--</i>&nbsp;)</small>`);
let head = addNode('nav', "top: 0;left: 0;width: 100%;height: 40px;padding: 0 20px;line-height: 40px;font-size:18px;white-space: nowrap;text-overflow: hidden;text-overflow: ellipsis;overflow: hidden;", `<a href='/index.html'>翻阅其它日志</a>　<div class='text-loop' style='display: inline-block;'>${document.title}</div>`);
head.setAttribute("title", document.title);

window.addEventListener("load", () => {
    // 评论
    addNode('div', "margin: 100px 5px 0 36px;", `<h2>留言</h2><div id="vcomments"></div>`);
    addJs("https://cdn1.lncld.net/static/js/3.0.4/av-min.js", true, () => {
        addJs("https://unpkg.com/valine@1.3.6/dist/Valine.min.js", true, () => {
            new Valine({
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
window.onmdload = () => {
    addJs("/nav.js", true);
};
