window.addEventListener("load", () => {
    let pageid = search.pageid || location.href;
    let count = $$(`<span class="hide"><i class="leancloud-visitors" data-flag-title="${document.title}" id="${pageid}"><i class="leancloud-visitors-count"/></i></span>`);
    document.body.appendChild(count);
    let observer = new MutationObserver(() => {
        let textContent = $(".leancloud-visitors-count", count)[0].textContent;
        textContent && window.ongetvisitcount && ongetvisitcount(textContent)
    });
    observer.observe($(".leancloud-visitors-count", count)[0], {
        subtree: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true
    });
    addCss("https://unpkg.com/gitalk/dist/gitalk.css");
    addJs("https://unpkg.com/gitalk/dist/gitalk.min.js", true, () => {
        new Gitalk({
            clientID: 'ac11b4f772aa66353b05',
            clientSecret: '2869c3cb252bdef896ab0d0252729580c396f18e',
            repo: 'zhric.github.io',
            owner: 'zhric',
            admin: ['zhric'],
            id: pageid,
            distractionFreeMode: false
        }).render('vcomments')
    });
});

