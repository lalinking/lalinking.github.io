addCss("https://unpkg.com/gitalk/dist/gitalk.css");

function initComment(pageid) {
    document.getElementById("vcomments").innerHTML = "";
    let pageKey = pageid.replace(/https?:\/\//i, "");
    while (pageKey.length > 50) {
        pageKey = pageKey.substr(pageKey.indexOf("/") + 1)
    }
    addJs("https://unpkg.com/gitalk/dist/gitalk.min.js", false, () => {
        new Gitalk({
            clientID: '7b9679434b225da457ea',
            clientSecret: 'd0367170ba5aca675670eb66f6e25689e905bd07',
            repo: 'zhric.github.io',
            owner: 'zhric',
            admin: ['zhric'],
            id: pageKey,
            distractionFreeMode: true
        }).render('vcomments')
    })
}
