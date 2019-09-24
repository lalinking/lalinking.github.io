let pageinfo = {
    readcount: '--'
};
function ongetvisitcount(count) {
    pageinfo.readcount = count;
}
var codes = {};
window.addEventListener("load", () => {
    utils.getAjax("/blog/data/info.json", json => {
        let mds = JSON.parse(json).md.lis;
        Object.assign(pageinfo, mds.find(_md => _md.path === utils.search.path));
        pageinfo.href = "https://ric-z.github.com?path=" + utils.search.path;
        utils.bind(pageinfo, document);
        document.title = pageinfo.title;

        utils.getAjax("/blog/data/" + utils.search.path, txt => {
            try {
                let mdPanel = utils.$(".marked-panel")[0];
                marked.Renderer.prototype.heading = (htxt, level) => {
                    return `<h${level} class="showtonav">${htxt}</h${level}>`;
                };
                mdPanel.innerHTML = marked(txt, {
                    breaks: true,
                    smartLists: true,
                    smartypants: true,
                    highlight: (code, lan) => {
                        if ("mermaid" === lan) {
                            return `<div class="mermaid">${code}</div>`;
                        } else {
                            let _id = 'i' + Math.random().toString(36).substr(2);
                            codes[_id] = code;
                            let c = lan ? Prism.highlight(code, Prism.languages[lan], lan) : code;
                            let rs = c.split(/\n/);
                            let expand = rs.length > 30 ? "<a onclick='this.parentElement.parentElement.parentElement.className=\"\"; this.style.display=\"none\";initNav()'>expand</a>" : "";
                            let download = `<a onclick="utils.download(codes[this.parentElement.getAttribute('data-codeid')], '*.${lan}')">download</a>`;
                            let copy = `<a onclick="utils.copyToClipboard(codes[this.parentElement.getAttribute('data-codeid')],()=>{this.innerText='copyed'},(err)=>{this.innerText='wrong: '+err})">copy</a>`;
                            let result = `<div class='${rs.length > 30 ? 'cospand' : ''}'>`;
                            result += `<div><div class='line-start'> :</div><div class="line-body tool-bar" data-codeid="${_id}">${copy}${download}${expand}</div></div>`;
                            rs.forEach((e, i) => {
                                result += `<div><div class='line-start'>${i + 1}</div><div class="line-body">${e}</div></div>`;
                            });
                            result += "</div>";
                            return result;
                        }
                    }
                });
                mermaid.init();
            } finally {
                initNav();
                hideLoadingBoard();
            }
        });


    });
});