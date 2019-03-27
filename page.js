addNode("p", "margin: 35px" ,`转载请注明原文地址： <a href='${location.href}'>${location.href}</a>　<small>(${document.head.querySelector('[name=modifydate]').content})</small>`);
let head = addNode('nav', "top: 0;left: 0;width: 100%;height: 40px;padding: 0 20px;line-height: 40px;font-size:18px;white-space: nowrap;text-overflow: hidden;text-overflow: ellipsis;overflow: hidden;", `<a href='/index.html'>翻阅其它日志</a>　<div class='text-loop' style='display: inline-block;'>${document.title}</div>`);
head.setAttribute("title", document.title);

window.addEventListener("load", () => {
    // 评论
    addNode('div', "", `<h2>留言</h2><div id="lv-container" data-id="city" data-uid="MTAyMC80MzM4Ny8xOTkyOA==">loading ...</div>`);
    addJs("https://cdn-city.livere.com/js/embed.dist.js", true);

});
window.onmdload = () => {
    addJs("/nav.js", true);
};
