addCss("https://unpkg.com/gitalk/dist/gitalk.css");

function initComment(pageid) {
    document.getElementById("vcomments").innerHTML = "";
    addJs("https://unpkg.com/gitalk/dist/gitalk.min.js", false, () => {
        new Gitalk({
            clientID: '7b9679434b225da457ea',
            clientSecret: 'd0367170ba5aca675670eb66f6e25689e905bd07',
            repo: 'zhric.github.io',
            owner: 'zhric',
            admin: ['zhric'],
            id: pageid,
            createIssueManually: true,
            distractionFreeMode: true
        }).render('vcomments')
    })
}
