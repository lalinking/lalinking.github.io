let addJs = (src, async, cb) => {
    let j = document.createElement("script");
    j.src = src;
    j.async = !!async;
    j.onload = j.onreadystatechange = () => {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            console.log(`load: ${src}`);
            cb && cb();
            j.onload = j.onreadystatechange = null;
        }
    };
    document.getElementsByTagName("head")[0].appendChild(j);
};
let addCss = (src) => {
    let j = document.createElement("link");
    j.href = src;
    j.type = "text/css";
    j.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(j);
};
let addNode = (tag, css, html, parentNode) => {
    let nod = document.createElement(tag);
    nod.style = css;
    nod.innerHTML = html;
    parentNode && parentNode.appendChild(nod);
    return nod;
};

addCss("/style.css");

window.addEventListener("load", () => {
    let head = addNode('nav', "top: 0;left: 0;width: 100%;height: 40px;padding: 0 20px;line-height: 40px;font-size:18px;white-space: nowrap;text-overflow: hidden;text-overflow: ellipsis;overflow: hidden;", `<a href='/index.html'>翻阅其它日志</a>　<div class='text-loop' style='display: inline-block;'>${document.title}</div>`, document.body);
    head.setAttribute("title", document.title);

    // 转换 markdown
    addCss("/marked.css");
    addJs("https://cdn.bootcss.com/highlight.js/9.15.6/highlight.min.js", true, () => {
        addJs("https://cdn.jsdelivr.net/npm/marked/marked.min.js", false, () => {
            let txt = document.getElementById('md');
            let md = addNode("div");
            md.className = "marked-panel";
            md.innerHTML = marked(txt.textContent, {
                highlight: (code) => {
                    return hljs.highlightAuto(code).value;
                }
            });
            txt.parentElement.replaceChild(md, txt);
        });
    });
}, true);