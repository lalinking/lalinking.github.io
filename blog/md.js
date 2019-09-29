let pageinfo = {
    title: 'no one',
    modifydate: 'long long ago',
    readcount: '--',
    keywords: '--',
    description: '--'
};

function ongetvisitcount(count) {
    pageinfo.readcount = count;
}

function expandCode(dom, event) {
    dom.className = "";
    initNav();
}

function downloadCode(dom, event) {
    event.stopPropagation();
    event.returnValue = false;
    utils.download(codes[dom.parentElement.getAttribute('data-codeid')], '*.${lan}');
    return false;
}

function copyCode(dom, event) {
    event.stopPropagation();
    event.returnValue = false;
    utils.copyToClipboard(codes[dom.parentElement.getAttribute('data-codeid')], () => {
        dom.innerText = 'copyed'
    }, (err) => {
        dom.innerText = 'wrong: ' + err
    });
    return false;
}

function highlight(code, lan) {
    if ("mermaid" === lan) {
        window.needMermaid = true;
        return `<div class="mermaid" data-status="0">${code}</div>`;
    } else {
        let _id = 'i' + Math.random().toString(36).substr(2);
        codes[_id] = code;
        let c = lan ? Prism.highlight(code, Prism.languages[lan], lan) : code;
        let rs = c.split(/\n/);
        let download = `<a onclick="return downloadCode(this, event)">download</a>`;
        let copy = `<a onclick="return copyCode(this, event);">copy</a>`;
        let result = `<div onclick="expandCode(this, event)" class='${rs.length > 30 ? 'cospand' : ''}'>`;
        result += `<div><div class='line-start'> :</div><div class="line-body tool-bar" data-codeid="${_id}">${copy}${download}</div></div>`;
        rs.forEach((e, i) => {
            result += `<div><div class='line-start'>${i + 1}</div><div class="line-body">${e}</div></div>`;
        });
        result += "</div>";
        return result;
    }
}

let codes = {};
window.addEventListener("load", () => {
    utils.getAjax("/blog/data/info.json", json => {
        let mds = JSON.parse(json).md.lis;
        Object.assign(pageinfo, mds.find(_md => _md.path === utils.search.path));
        pageinfo.href = "https://ric2cn.github.io/blog/md.html?path=" + utils.search.path;
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
                    highlight: highlight
                });
                if (window.needMermaid) {
                    utils.addJs("https://unpkg.com/mermaid@8.3.1/dist/mermaid.min.js", true, () => {
                        mermaid.init();
                        utils.$(".marked-panel [data-status='0']").forEach(div => {div.setAttribute("data-status", "1")});
                    });
                }
            } finally {
                initNav();
            }
        });

    });
});