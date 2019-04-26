let count = utils.createNode('span', "hide", `<i class="leancloud-visitors" data-flag-title="${document.title}" id="${utils.search.path}"><i class="leancloud-visitors-count"/></i>`);
document.body.appendChild(count);
window.addEventListener("load", () => {
    let observer = new MutationObserver(() => {
        let textContent = utils.$(".leancloud-visitors-count", count)[0].textContent;
        textContent && window.ongetvisitcount && ongetvisitcount(textContent)
    });
    observer.observe(utils.$(".leancloud-visitors-count", count)[0], {subtree: true,childList: true,characterData: true,characterDataOldValue: true});
    utils.addJs("/3rd-lib/av-min.3.0.4.js", true, () => {
        utils.addJs("/3rd-lib/Valine.min.1.3.6.js", true, () => {
            new Valine({
                path: utils.search.pageid || Object.values(utils.search)[0] || "unknow",
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

