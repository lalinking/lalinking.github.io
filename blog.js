let get = (url, cb) => {
    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (4 !== ajax.readyState) {
            return;
        }
        cb && cb(ajax.responseText);
    };
    ajax.open("GET", url, true);
    ajax.send();
};
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
let createNode = (tag, css, html) => {
    let nod = document.createElement(tag);
    nod.className = css;
    nod.innerHTML = html;
    return nod;
};

let p = location.search.length ? location.search.substring(3) : "index.md";
let onGetJson = json => {
    let conf = JSON.parse(json);
    if (p === "index.md") {
        // 计算md
        let txt = "## 文件列表";
        for (let j in conf) {
            let jp = conf[j];
            txt += `\n* ${jp.modifydate} [${jp.title}](/?p=${j})`;
        }
        onGetMd(txt);
    } else {
        document.title = conf[p].title;
        let head = createNode('nav', "head", `<a href='/index.html'>翻阅其它日志</a>　<div class='text-loop' style='display: inline-block;'>${conf[p].title}</div>`);
        head.setAttribute("title", conf[p].title);
        document.body.appendChild(head);
        let leadTxt = "<br/>";
        leadTxt += `转载请注明原文地址： <a href='${location.href}'>${location.href}</a>`;
        leadTxt += "<br/>";
        leadTxt += `<small>&nbsp;&nbsp;创建于:&nbsp;${conf[p].modifydate}&nbsp;&nbsp;阅读量:&nbsp;<span class="leancloud-visitors" data-flag-title="${conf[p].title}" id="${p}"><i class="leancloud-visitors-count">--</i></span></small>`;
        leadTxt += "<br/>";
        leadTxt += `<small>&nbsp;&nbsp;关键词:&nbsp;<span class='keyword'>${conf[p].keywords.split(",").join("</span>&nbsp;&nbsp;<span class='keyword'>")}</span></small>`;
        leadTxt += "<br/>";
        leadTxt += `<small>&nbsp;&nbsp;说&nbsp;&nbsp;明:&nbsp;${conf[p].description}</small>`;
        let cp = createNode("p", "lead-txt", leadTxt);
        document.body.insertBefore(cp, document.body.childNodes[0]);
        let cm = createNode('div', "", `<h2>留言</h2><div id="vcomments"></div>`);
        cm.className = "comments-panel";
        document.body.appendChild(cm);
        addJs("https://cdn1.lncld.net/static/js/3.0.4/av-min.js", true, () => {
            addJs("https://unpkg.com/valine@1.3.6/dist/Valine.min.js", true, () => {
                new Valine({
                    path: p,
                    el: '#vcomments',
                    appId: 'TtiWfdzc3Pcwy62vcXJj4zKl-gzGzoHsz',
                    appKey: 'UzO9Cq4rVPLwyOKmolTwYAXo',
                    placeholder: "评论一下。\n欢迎在上方留下您的昵称、邮箱、主页。",
                    verify: true,
                    visitor: true
                })
            });
        });
        addJs("/nav.js", true, window.initNav);
    }
};

let onGetMd = txt => {
    addJs("https://cdn.bootcss.com/highlight.js/9.15.6/highlight.min.js", true, () => {
        addJs("https://cdn.jsdelivr.net/npm/marked/marked.min.js", true, () => {
            try {
                let md = document.querySelector(".marked-panel");
                md.innerHTML = marked(txt, {
                    breaks: true,
                    smartLists: true,
                    smartypants: true,
                    highlight: (code) => {
                        let rs = hljs.highlightAuto(code).value.split(/\n/);
                        let result = "";
                        rs.forEach((e, i) => {
                            result += `<div><div class='line-start'>${i + 1}</div><div class="line-body">${e}</div></div>`;
                        });
                        return result;
                    }
                });
            } finally {
                setTimeout(() => {
                    window.initNav && window.initNav();
                    document.body.removeChild(document.getElementById("msg-panel"))
                }, 300);
            }
        });
    });
};
window.addEventListener("load", () => {
    get("/index.json", onGetJson);
    if (p !== "index.md") {
        get(p, onGetMd);
    }
}, true);