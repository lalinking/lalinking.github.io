window.addEventListener("load", () => {
    let pageid = utils.search.pageid || Object.values(utils.search)[0] || "unknow";
    let count = utils.createNode('span', "hide", `<i class="leancloud-visitors" data-flag-title="${document.title}" id="${pageid}"><i class="leancloud-visitors-count"/></i>`);
    document.body.appendChild(count);
    let observer = new MutationObserver(() => {
        let textContent = utils.$(".leancloud-visitors-count", count)[0].textContent;
        textContent && window.ongetvisitcount && ongetvisitcount(textContent)
    });
    observer.observe(utils.$(".leancloud-visitors-count", count)[0], {
        subtree: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true
    });
    utils.addJs("https://unpkg.com/gitalk/dist/gitalk.min.js", true, () => {
        new Gitalk({
            clientID: 'ac11b4f772aa66353b05',
            clientSecret: '2869c3cb252bdef896ab0d0252729580c396f18e',
            repo: 'ric2cn.github.io',
            owner: 'ric2cn',
            admin: ['ric2cn'],
            id: location.pathname,
            distractionFreeMode: false
        }).render('vcomments')
    });
});

