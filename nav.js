let pos = [];
let nav = document.createElement('nav');
function setNav() {
    let txt = '';
    let hs = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
    pos.length = 0;
    hs.forEach((h, i) => {
        let _c = h.innerText.replace(/^(((\w\w)|(\w)|([^\x00-\xff])){2}).*$/, "$1");
        txt += `<div><a href='javascript:window.scrollTo(0,${h.offsetTop - 8})' title='${h.innerText}'>${h.innerText === _c ? _c : (_c + '..')}</a></div>`;
        pos.push(h.offsetTop - 8);
    });
    nav.innerHTML = txt;
    nav.style = `bottom: calc(50% - ${hs.length*20+6}px);right: 20px;z-index: 1314;width: 65px;padding: 6px;line-height: 40px;`;
}
let scrollfun = () => {
    let anchors = nav.querySelectorAll("a");
    pos.forEach((po,indx) => {
        let prt = anchors[indx].parentElement;
        prt.style = "";
        if (po < window.pageYOffset+8) {
            prt.style = "border-left: solid #b96598 3px;padding-left: 3px;";
        }
    });
};
window.addEventListener("resize", setNav);
window.addEventListener("scroll", scrollfun);
document.body.appendChild(nav);
setNav();
scrollfun();
