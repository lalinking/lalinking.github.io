function expandCode(dom) {
    dom.className = "";
}

function copyCode(dom) {
    copyToClipboard(codes[dom.parentElement.getAttribute('data-codeid')], () => {
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
        let copy = `<a onclick="return copyCode(this);">copy</a>`;
        let result = `<div onclick="expandCode(this)" class='${rs.length > 30 ? 'cospand' : ''}'>`;
        result += `<div><div class='line-start'></div><div class="line-body tool-bar" data-codeid="${_id}">${copy}</div></div>`;
        rs.forEach((e, i) => {
            result += `<div><div class='line-start'>${i + 1}</div><div class="line-body">${e}</div></div>`;
        });
        result += "</div>";
        return result;
    }
}

let codes = {};
marked.Renderer.prototype.heading = (htxt, level) => {
    return `<h${level} class="showtonav">${htxt}</h${level}>`;
};
let showMDText = txt => {
    let mdPanel = $(".marked-panel")[0];
    mdPanel.innerHTML = marked(txt, {
        breaks: true,
        smartLists: true,
        smartypants: true,
        highlight: highlight
    });
    if (window.needMermaid) {
        addJs("/3rd-lib/mermaid/mermaid.js", true, () => {
            mermaid.init();
            $(".marked-panel [data-status='0']").forEach(div => {
                div.setAttribute("data-status", "1")
            });
        });
    }
    hideLoadingBoard()
};
getAjax(search.src, showMDText, showMDText);