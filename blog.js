let getAjax = (url, cb) => {
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

let p = location.search.length ? location.search.substring(3) : "index.txt";
/**
 * 引导页的目录
 * @type {string}
 */
const keywords = new Set();
const choiceKeyword = function (k) {
    let ak = document.querySelector(`a[href="javascript:choiceKeyword('${encodeURI(k)}')"]`);
    if (keywords.has(k)) {
        keywords.delete(k);
        ak.className = "";
        if (!keywords.size) {
            document.querySelectorAll(`.marked-panel li`).forEach((li) => {
                li.className = "";
            });
            return;
        }
    } else {
        keywords.add(k);
        ak.className = "choiced";
    }
    document.querySelectorAll(`.marked-panel li`).forEach((li) => {
        li.className = "hide";
    });
    keywords.forEach((k) => {
        document.querySelectorAll(`.marked-panel li a[href*="#${encodeURI(k)}"]`).forEach((a) => {
            a.parentElement.parentElement.className = "";
        });
    });
};
let indTxt = "";
let getIndexMD = (conf) => {
    let txt = "";
    txt += "\n### 文件标签 \n   选中标签进行过滤\n\n  ";
    let kws = new Set();
    Object.values(conf).forEach(jp => {
        jp.keywords && (jp.keywords.split(/\s*,\s*/).forEach(k => {
            kws.add(k)
        }))
    });
    kws.forEach((k) => {
        txt += ` [${k}](javascript:choiceKeyword('${encodeURI(k)}')) `;
    });
    txt += "\n### 文件列表";
    for (let j in conf) {
        let jp = conf[j];
        txt += `\n1. <small>(${jp.modifydate})</small> [${jp.title}](/?p=${j}#${encodeURI(jp.keywords).replace(/,/g,"#")})\n   <small>${jp.description}</small>`;
    }
    return txt;
};
let onGetJson = (json) => {
    let conf = JSON.parse(json);
    if (p === "index.txt") {
        // 计算md
        indTxt = getIndexMD(conf);
    } else {
        document.title = conf[p].title;
        let head = createNode('nav', "head", `<a href='/' style="vertical-align: top;">翻阅其它文件</a>　<span class='text-title'>${conf[p].title}</span>`);
        head.setAttribute("title", conf[p].title);
        document.body.appendChild(head);
        let leadTxt = "";
        leadTxt += `<small>&nbsp;&nbsp;创建于:&nbsp;${conf[p].modifydate}&nbsp;&nbsp;阅读量:&nbsp;<span class="leancloud-visitors" data-flag-title="${conf[p].title}" id="${p}"><i class="leancloud-visitors-count">--</i></span></small>`;
        leadTxt += "<br/>";
        leadTxt += `<small>&nbsp;&nbsp;关键词:&nbsp;<span class='keyword'>${conf[p].keywords.split(",").join("</span>&nbsp;&nbsp;<span class='keyword'>")}</span></small>`;
        leadTxt += "<br/>";
        leadTxt += `<small>&nbsp;&nbsp;　说明:&nbsp;${conf[p].description || "无"}</small>`;
        leadTxt += "<br/><br/>";
        leadTxt += `<i>转载请注明原文地址： <a href='${conf[p].href || location.href}'>${conf[p].href || location.href.replace(/#.*/,"")}</a></i>`;
        let cp = createNode("p", "lead-txt", leadTxt);
        document.body.insertBefore(cp, document.body.childNodes[0]);
        addJs("/nav.js", true, window.initNav);
    }
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
};
let onGetMd = (txt) => {
    addJs("https://cdn.bootcss.com/mermaid/8.0.0-rc.8/mermaid.min.js", true, () => {
        addJs("https://cdn.bootcss.com/highlight.js/9.15.6/highlight.min.js", true, () => {
            addJs("https://cdn.jsdelivr.net/npm/marked/marked.min.js", true, () => {
                try {
                    let md = document.querySelector(".marked-panel");
                    marked.Renderer.prototype.listitem = (litxt) => {
                        return `<li><div class="li-body">${litxt}</div></li>`;
                    };
                    md.innerHTML = marked(indTxt + "\n" + txt, {
                        breaks: true,
                        smartLists: true,
                        smartypants: true,
                        highlight: (code, lan) => {
                            if ("mermaid" === lan) {
                                return `<div class="mermaid">${code}</div>`;
                            } else {
                                let c;
                                if (hljs.getLanguage(lan)) {
                                    c = hljs.highlight(lan, code).value;
                                } else {
                                    c = hljs.highlightAuto(code).value;
                                }
                                let rs = c.split(/\n/);
                                let result = "";
                                rs.forEach((e, i) => {
                                    result += `<div><div class='line-start'>${i + 1}</div><div class="line-body">${e}</div></div>`;
                                });
                                return result;
                            }
                        }
                    });
                    mermaid.init();
                } finally {
                    setTimeout(() => {
                        window.initNav && window.initNav();
                        document.body.removeChild(document.getElementById("msg-panel"))
                    }, 300);
                }
            });
        });
    });
};
window.addEventListener("load", () => {
    getAjax("/index.json", onGetJson);
    getAjax(p, onGetMd);

    function resize() {
        document.body.className = document.body.clientWidth > 800 ? "" : "wap";
    }

    resize();
    window.addEventListener("resize", resize);
}, true);
