let content = $("#topic-panel")[0];
let childWin = $("#view-win")[0];
let headTitle = $("#header-title")[0];
getAjax("https://zhric.github.io/.db/list", txt => {
    let tList = txt.split(/[\r\n]+/);
    let needOpen, openTitle, openSrc, openPageKey;
    for (let i = 0; i < tList.length; i++) {
        let startReg = /^#\s*(.*?)\s*$/;
        let line = tList[i];
        if (startReg.test(line)) {
            let src = line.replace(startReg, "$1");
            let pageKey = src.replace(/^https?:\/\/zhric\.github\.io(\/\.db)?\/?/, "");
            while (pageKey.length > 50 && pageKey.indexOf("/") > 0) {
                pageKey = pageKey.substr(pageKey.indexOf("/") + 1)
            }
            let title = tList[++i];
            let desc = tList[++i];
            let date = tList[++i];
            needOpen = pageKey === search.target;
            if (needOpen) {
                openTitle = title;
                openSrc = src;
                openPageKey = pageKey;
                break
            }
            let _div = $$(`<div class='item-panel'>
                                    <div class='item-title' data-key="${pageKey}" data-src='${src}'>${title}</div>
                                    <div class="item-content">${desc}</div>
                                    <div class="item-date">${date}</div>
                                 </div>`);
            content.appendChild(_div)
        }
    }
    hideLoadingBoard();
    if (needOpen) {
        headTitle.innerText = openTitle;
        document.title = openTitle;
        openChildWin(openSrc);
        initComment(openPageKey)
    } else {
        initComment("home")
    }
});

function openChildWin(src) {
    childWin.className = "";
    content.className = "hide";
    if (src.endsWith(".md")) {
        src = "/md/_.html?src=" + encodeURIComponent(src)
    }
    childWin.src = src
}

content.addEventListener("click", e => {
    let src = e.target.getAttribute("data-src");
    if (!src) {
        return;
    }
    let pageKey = e.target.getAttribute("data-key");
    location.href = location.origin + "?target=" + pageKey;
});

function home() {
    location.href = "https://zhric.github.io";
}
