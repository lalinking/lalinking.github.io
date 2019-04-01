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
    j.async = true;
    j.onload = j.onreadystatechange = () => {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            console.log(`load: ${src}`);
        }
    };
    document.getElementsByTagName("head")[0].appendChild(j);
};
let addNode = (tag, css, html) => {
    let nod = document.createElement(tag);
    nod.style = css;
    nod.innerHTML = html;
    document.body.appendChild(nod);
    return nod;
};

document.write("<div style='width: 100%;height: 100%;position: fixed;top: 0;left: 0;z-index: 10000;background: white;' id='msg-panel'><div class='spinner'></div></div>");
document.write(unescape("%3Cspan id='cnzz_stat_icon_1276688436'%3E%3C/span%3E%3Cscript src='https://s23.cnzz.com/z_stat.php%3Fid%3D1276688436%26show%3Dpic' type='text/javascript'%3E%3C/script%3E"));
addCss("/style.css");
window.addEventListener("load", () => {
    // 转换 markdown
    addCss("/marked.css");
    addJs("https://cdn.bootcss.com/highlight.js/9.15.6/highlight.min.js", true, () => {
        addJs("https://cdn.jsdelivr.net/npm/marked/marked.min.js", false, () => {
            try {
                let txt = document.getElementById('md');
                let md = addNode("div");
                md.className = "marked-panel";
                md.innerHTML = marked(txt.textContent, {
                    highlight: (code) => {
                        return hljs.highlightAuto(code).value;
                    }
                });
                txt.parentElement.replaceChild(md, txt);
                window.onmdload && window.onmdload();
            } finally {
                document.body.removeChild(document.getElementById("msg-panel"))
            }
        });
    });
}, true);