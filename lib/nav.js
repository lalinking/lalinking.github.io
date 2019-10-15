document.write('<h1 class="hide showtonav">TOP</h1>');
let pos = [];
let nav = document.createElement('nav');
nav.style = 'position: fixed;background-color: rgb(248, 249, 247);vertical-align: middle;right: 1.2em;width: 3em;padding: 0;line-height: 3em;z-index: 1314 !important;';
function setNav() {
    let txt = '';
    let hs = document.querySelectorAll(".showtonav");
    pos.length = 0;
    hs.forEach((h) => {
        let _c = h.innerText.replace(/^(((\w\w)|(\w)|([^\x00-\xff])){2}).*$/, "$1");
        txt += `<div><a href='javascript:window.scrollTo(0,${h.offsetTop - 40})' title='${h.innerText}'>${h.innerText === _c ? _c : (_c + '..')}</a></div>`;
        pos.push(h.offsetTop - 40);
    });
    nav.innerHTML = txt;
    nav.style.bottom = `calc(50% - ${hs.length*20+6}px)`;
}
let scrollfun = () => {
    let anchors = nav.querySelectorAll("a");
    pos.forEach((po,indx) => {
        let prt = anchors[indx].parentElement;
        prt.style = "";
        if (po < window.pageYOffset + 40) {
            prt.style = "border-left: solid rgb(208, 186, 199) 3px;padding-left: 3px;";
        }
    });
};
window.addEventListener("resize", setNav);
window.addEventListener("scroll", scrollfun);
document.body.appendChild(nav);
window.initNav = () => {
    setNav();
    scrollfun();
};
