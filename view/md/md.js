window.addEventListener("load", () => {
    utils.getAjax("/data/_.json", json => {
        let mds = JSON.parse(json).md.lis;
        let md = mds.find(_md => _md.path === utils.search.path);
        md.readcount = '--';
        md.href = "https://ric-z.github.com?path=" + utils.search.path;
        utils.bind(md, document);

        utils.getAjax("/data/.md/" + utils.search.path, txt => {
            try {
                let mdPanel = utils.$(".marked-panel")[0];
                marked.Renderer.prototype.heading = (htxt, level) => {
                    return `<h${level} class="showtonav">${htxt}</h${level}>`;
                };
                marked.Renderer.prototype.listitem = (litxt) => {
                    return `<li><div class="li-body">${litxt}</div></li>`;
                };
                mdPanel.innerHTML = marked(txt, {
                    breaks: true,
                    smartLists: true,
                    smartypants: true,
                    highlight: (code, lan) => {
                        if ("mermaid" === lan) {
                            return `<div class="mermaid">${code}</div>`;
                        } else {
                            let c = lan ? Prism.highlight(code, Prism.languages[lan], lan) : code;
                            let rs = c.split(/\n/);
                            let expand = rs.length > 30 ? "<a onclick='this.parentElement.parentElement.parentElement.className=\"\"; this.style.display=\"none\"'>expand</a>" : "";
                            let download = `<a onclick="utils.download(decodeURIComponent('${encodeURIComponent(code)}'), '*.${lan}')">download</a>`;
                            let copy = `<a onclick="utils.copyToClipboard(decodeURIComponent('${encodeURIComponent(code)}'),()=>{this.innerText='copyed'},(err)=>{this.innerText='wrong: '+err})">copy</a>`;
                            let result = `<div class='${rs.length > 30 ? 'cospand' : ''}'>`;
                            result += `<div><div class='line-start'> :</div><div class="line-body tool-bar">${copy}${download}${expand}</div></div>`;
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