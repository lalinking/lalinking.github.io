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
        clientID: '7b9679434b225da457ea',
        clientSecret: 'd0367170ba5aca675670eb66f6e25689e905bd07',
        repo: 'zhric.github.io',
        owner: 'zhric',
        admin: ['zhric'],
        id: pageid,
        distractionFreeMode: false
    }).render('vcomments')
});

