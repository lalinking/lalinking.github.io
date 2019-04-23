const getAjax = (url, cb) => {
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
const addJs = (src, async, cb) => {
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
const createNode = (tag, css, html) => {
    let nod = document.createElement(tag);
    nod.className = css;
    nod.innerHTML = html;
    return nod;
};
const funDownload = function (content, filename) {
    // 创建隐藏的可下载链接
    let eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    let blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
};

function copyToClipboard(text, cb, errcb) {
    if (!navigator.clipboard) {
        errcb("copy fail.");
        return;
    }
    navigator.clipboard.writeText(text).then(cb, errcb);
}

let search = ((function () {
    let URLParams = {p: "File List", t: "index.txt"};
    let aParams = decodeURI(document.location.search).substr(1).split('&');
    for (i = 0; i < aParams.length; i++) {
        let aParam = aParams[i].split('=');
        URLParams[aParam[0]] = aParam[1];
    }
    return URLParams;
})());
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
    txt += "\n### 选中标签筛选内容\n  ";
    let kws = new Set();
    Object.values(conf).forEach(ls => {
        Object.values(ls).forEach(
            jp => {
                jp.keywords && (jp.keywords.split(/\s*,\s*/).forEach(k => {
                    kws.add(k)
                }))
            }
        )
    });
    kws.forEach((k) => {
        txt += ` [${k}](javascript:choiceKeyword('${encodeURI(k)}')) `;
    });
    for (let ls in conf) {
        txt += `\n\n###  ${ls} `;
        for (let j in conf[ls]) {
            let jp = conf[ls][j];
            txt += `\n1. <small>(${jp.modifydate})</small> [${jp.title}](/?p=${encodeURI(ls)}&t=${encodeURI(j)}#${encodeURI(jp.keywords).replace(/,/g, "#")})\n   <small>${jp.description}</small>`;
        }
    }
    return txt;
};
let onGetJson = (json) => {
    let conf = JSON.parse(json);
    if (search.t === "index.txt") {
        // 计算md
        indTxt = getIndexMD(conf);
    } else {
        let conf_page = conf[search.p][search.t];
        document.title = conf_page.title;
        let head = createNode('nav', "head", `<a href='/' style="vertical-align: top;">翻阅其它文件</a>　<span class='text-title'>${conf_page.title}</span>`);
        head.setAttribute("title", conf_page.title);
        document.body.appendChild(head);
        let leadTxt = "";
        leadTxt += `<small>&nbsp;&nbsp;创建于:&nbsp;${conf_page.modifydate}&nbsp;&nbsp;阅读量:&nbsp;<span class="leancloud-visitors" data-flag-title="${conf_page.title}" id="${search.t}"><i class="leancloud-visitors-count">--</i></span></small>`;
        leadTxt += "<br/>";
        leadTxt += `<small>&nbsp;&nbsp;关键词:&nbsp;<span class='keyword'>${conf_page.keywords.split(",").join("</span>&nbsp;&nbsp;<span class='keyword'>")}</span></small>`;
        leadTxt += "<br/>";
        leadTxt += `<small>&nbsp;&nbsp;　说明:&nbsp;${conf_page.description || "无"}</small>`;
        leadTxt += "<br/><br/>";
        leadTxt += `<i>转载请注明原文地址： <a href='${conf_page.href || location.href}'>${conf_page.href || location.href.replace(/#.*/, "")}</a></i>`;
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
                path: search.t,
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
        addJs("/prism.js", true, () => {
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
                                let expand = "<a onclick='this.parentElement.parentElement.parentElement.parentElement.style.maxHeight=\"none\"; this.parentElement.style.display=\"none\"'>expand</a>";
                                return `<div><div class="line-body tool-bar">${expand}</div><div class="mermaid">${code}</div></div>`;
                            } else {
                                let c = lan ? Prism.highlight(code, Prism.languages[lan], lan) : code;
                                let rs = c.split(/\n/);
                                let expand = rs.length > 20 ? "<a onclick='this.parentElement.parentElement.parentElement.parentElement.style.maxHeight=\"none\"; this.style.display=\"none\"'>expand</a>" : "";
                                let download = `<a onclick="let txt = '';this.parentElement.parentElement.parentElement.querySelectorAll('code>div:not(:first-child) .line-body').forEach(e=>{txt+=e.textContent+'\\n'});funDownload(txt, '*.${lan}')">download</a>`;
                                let copy = `<a onclick="let txt = '';this.parentElement.parentElement.parentElement.querySelectorAll('code>div:not(:first-child) .line-body').forEach(e=>{txt+=e.textContent+'\\n'});copyToClipboard(txt,()=>{this.innerText='copyed'},(err)=>{this.innerText='wrong: '+err})">copy</a>`;
                                let result = `<div><div class='line-start'> :</div><div class="line-body tool-bar">${copy}${download}${expand}</div></div>`;
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
    getAjax(search.t, onGetMd);

    function resize() {
        document.body.className = document.body.clientWidth > 800 ? "" : "wap";
    }

    resize();
    window.addEventListener("resize", resize);
}, true);
