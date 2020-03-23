let content = $("#topic-panel")[0];
let childWin = $("#view-win")[0];
let headTitle = $("#header-title")[0];
getAjax("https://raw.githubusercontent.com/zhric/notes/master/list", txt => {
    let tList = txt.split(/[\r\n]+/);
    for (let i = 0; i < tList.length; i++) {
        let startReg = /^#\s*(.*?)\s*$/;
        let line = tList[i];
        if (startReg.test(line)) {
            let src = line.replace(startReg, "$1");
            let title = tList[++i];
            let desc = tList[++i];
            let date = tList[++i];
            let _div = $$(`<div class='item-panel'>
                                    <div class='item-title' data-src='${src}'>${title}</div>
                                    <div class="item-content">${desc}</div>
                                    <div class="item-date">${date}</div>
                                 </div>`);
            content.appendChild(_div)
        }
    }
    hideLoadingBoard()
});

content.addEventListener("click", e => {
    let src = e.target.getAttribute("data-src");
    if (!src) {
        return;
    }
    initComment(src);
    if (src.endsWith(".md")) {
        src = "/md/_.html?src=" + encodeURIComponent(src)
    }
    headTitle.innerText = e.target.innerText;
    document.title = e.target.innerText;
    childWin.className = "";
    childWin.src = src;
    content.className = "hide";
    e.returnValue = false;
    e.preventDefault();
    e.stopPropagation()
});

function home() {
    childWin.className = "hide";
    content.className = "";
    childWin.src = "";
    initComment("https://zhric.github.io")
}

home();