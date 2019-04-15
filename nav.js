let pos = [];
let nav = document.createElement('nav');
function setNav() {
    let txt = '';
    let hs = document.querySelectorAll(".marked-panel>h1,.marked-panel>h2,.marked-panel>h3,.marked-panel>h4,.marked-panel>h5,.marked-panel>h6,.comments-panel>h2");
    pos.length = 0;
    hs.forEach((h) => {
        let _c = h.innerText.replace(/^(((\w\w)|(\w)|([^\x00-\xff])){2}).*$/, "$1");
        txt += `<div><a href='javascript:window.scrollTo(0,${h.offsetTop - 40})' title='${h.innerText}'>${h.innerText === _c ? _c : (_c + '..')}</a></div>`;
        pos.push(h.offsetTop - 40);
    });
    nav.innerHTML = txt;
    nav.style = `bottom: calc(50% - ${hs.length*20+6}px);right: 20px;z-index: 1314;width: 48px;padding: 6px;line-height: 40px;`;
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
window.onresize = setNav;
window.onscroll = scrollfun;
document.body.appendChild(nav);
window.initNav = () => {
    setNav();
    scrollfun();
};
