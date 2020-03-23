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
            let needOpen = ("#" + src) === location.hash;
            let title = tList[++i];
            let desc = tList[++i];
            let date = tList[++i];
            let _div = $$(`<div class='item-panel'>
                                    <div class='item-title ${needOpen ? "needOpen" : ""}' data-src='${src}'>${title}</div>
                                    <div class="item-content">${desc}</div>
                                    <div class="item-date">${date}</div>
                                 </div>`);
            content.appendChild(_div)
        }
    }
    hideLoadingBoard();
    let needOpen = $(".needOpen");
    if (needOpen.length === 1) {
        setTimeout(() => {
            needOpen[0].click()
        }, 100)
    }
});

function openChildWin(src) {
    childWin.className = "";
    content.className = "hide";
    initComment(src);
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
    headTitle.innerText = e.target.innerText;
    document.title = e.target.innerText;
    e.returnValue = false;
    e.preventDefault();
    e.stopPropagation();
    location.href = location.origin + "#" + src;
    openChildWin(src)
});

function home() {
    location.href = "https://zhric.github.io";

}

if (!location.hash) {
    initComment("https://zhric.github.io")
}