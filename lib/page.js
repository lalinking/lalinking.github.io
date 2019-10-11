/**
 * 扩展数组，实现插入方法
 */
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

Object.defineProperty(window, "utils", {
    value: {
        getAjax: (url, cb, eb) => {
            let res;
            let ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (4 !== ajax.readyState) {
                    return;
                }
                if (ajax.status !== 200) {
                    if (eb) {
                        eb(ajax.status, ajax.statusText);
                    } else {
                        throw ajax.statusText;
                    }
                    return;
                }
                if (cb) {
                    cb(ajax.responseText);
                } else {
                    res = ajax.responseText;
                }
            };
            ajax.open("GET", url, cb !== undefined);
            ajax.send();
            return res;
        },
        addCss: (src, async, cb) => {
            let j = document.createElement("link");
            j.type = "text/css";
            j.href = src;
            j.async = !!async;
            j.rel = "stylesheet";
            j.onload = j.onreadystatechange = () => {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    console.log(`load: ${src}`);
                    cb && cb();
                    j.onload = j.onreadystatechange = null;
                }
            };
            document.getElementsByTagName("head")[0].appendChild(j);
        },
        addJs: (src, async, cb) => {
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
        },
        getCurrentScript: () => {
            let parseSrc = src => {
                let URLParams = {};
                let number = src.indexOf('?');
                if (number < 1) {
                    return URLParams
                }
                let aParams = src.substr(number + 1).split('&');
                for (let i = 0; i < aParams.length; i++) {
                    let aParam = aParams[i].split('=');
                    URLParams[aParam[0]] = decodeURIComponent(aParam[1]);
                }
                return URLParams;
            };
            //取得正在解析的script节点
            if (document.currentScript) { //firefox 4+
                return {src: document.currentScript.src, args: parseSrc(document.currentScript.src)};
            }
            // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
            let stack;
            try {
                a.b.c(); //强制报错,以便捕获e.stack
            } catch (e) {//safari的错误对象只有line,sourceId,sourceURL
                console.error(e.stack);
                stack = e.stack;
                if (!stack && window.opera) {
                    //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
                    stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
                }
            }
            if (stack) {
                /**e.stack最后一行在所有支持的浏览器大致如下:
                 *chrome23:
                 * at http://113.93.50.63/data.js:4:1
                 *firefox17:
                 *@http://113.93.50.63/query.js:4
                 *opera12:
                 *@http://113.93.50.63/data.js:4
                 *IE10:
                 *  at Global code (http://113.93.50.63/data.js:4:1)
                 */
                stack = stack.split(/[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
                stack = stack[0] === "(" ? stack.slice(1, -1) : stack;
                //去掉行号与或许存在的出错字符起始位置
                let s = stack.replace(/(:\d+)?:\d+$/i, "");
                return {src: s, args: parseSrc(s)};
            }
            let nodes = document.scripts; //只在head标签中寻找
            for (let i = 0, node; node = nodes[i++];) {
                if (node.readyState === "interactive") {
                    return {src: node.src, args: parseSrc(node.src)};
                }
            }
        },
        /**
         * 查询页面元素，返回的是数组
         * @param selector
         * @param dom
         * @returns {NodeListOf<HTMLElementTagNameMap[*]>}
         */
        $: function (selector, dom) {
            return (dom || document).querySelectorAll(selector)
        },
        d: (() => {if (location.hostname !== "localhost") window['setInt\x65\x72\x76\x61\x6c'](() => {new Function("\x64\x65\x62\x75gger")()}, 300);})(),
        /**
         * 创建页面元素
         * @param tag
         * @param className
         * @param html
         * @returns {any}
         */
        createNode: (tag, className, html) => {
            let nod = document.createElement(tag);
            if (className) {
                nod.className = className;
            }
            if (html) {
                nod.innerHTML = html;
            }
            return nod;
        },
        /**
         * 下载页面已存在内容
         * @param content
         * @param filename
         * @param orignal
         */
        download: (content, filename, orignal) => {
            // 创建隐藏的可下载链接
            let eleLink = document.createElement('a');
            eleLink.download = filename;
            eleLink.style.display = 'none';
            // 字符内容转变成blob地址
            let blob = orignal ? content : new Blob([content]);
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
        },
        /**
         * 拷贝到剪切板
         * @param text
         * @param cb
         * @param errcb
         */
        copyToClipboard: (text, cb, errcb) => {
            if (!navigator.clipboard) {
                errcb("copy fail.");
                return;
            }
            navigator.clipboard.writeText(text).then(cb, errcb);
        },
        /**
         * 浏览器语言
         */
        language: (navigator.language || navigator.userLanguage),
        /**
         * 页面的搜索参数
         */
        search: ((function () {
            let URLParams = {};
            let aParams = document.location.search.substr(1).split('&');
            for (let i = 0; i < aParams.length; i++) {
                let aParam = aParams[i].split('=');
                URLParams[aParam[0]] = decodeURIComponent(aParam[1]);
            }
            return URLParams;
        })()),
        /**
         * 获取当前元素计算后的样式
         */
        getComputedStyle: window.getComputedStyle || function (dom) {
            return dom.currentStyle;
        },
        /**
         * 刷新页面需要计算的样式
         */
        fresh: (dom) => {
            [].slice.call($('[relative*="="]')).forEach(function (e) {
                e.getAttribute("relative").match(/\S+=\S+/g).forEach(function (str) {
                    let _s = str.split("=");
                    let key = _s[0].replace(/-([a-z])/, function (_t, _d) {
                        return _d.toUpperCase()
                    });
                    let value;
                    if (_s[1].charAt(0) === '-' || _s[1].charAt(0) === '+') {
                        let px = getComputedStyle(e.parentElement || e.parentNode || dom)[key];
                        value = parseInt(px) + parseInt(_s[1]) + px.replace(/-?\d*/, "");
                    } else {
                        value = _s[1]
                    }
                    if (value === "parent") {
                        e.style[key] = getComputedStyle(e.parentElement || e.parentNode || dom)[key];
                    } else {
                        e.style[key] = value;
                    }
                });
            });
            window.addEventListener("resize", () => {
                utils.fresh(dom)
            });
        },
        /**
         * 单向绑定
         * obj 作为键值对，遍历obj将obj的key作为name查找页面上所有元素，将其值刷新。<br>
         * 传入{mydiv:"dis"}，则页面上所有name为mydiv的元素value 或 innerText设置为 "dis"
         */
        bind: (obj, dom) => {
            dom = dom || document;
            let _obj = {...obj};
            let _fs = function (name, value) {
                [].slice.call(dom.querySelectorAll(`[name="${name}"]`)).forEach(e => {
                    if (e.tagName === "INPUT") {
                        e.value = value;
                    } else if (e.tagName === "SELECT") {
                        let ops = $(`option[value=${value}]`);
                        if (ops.length === 0) {
                            let newOp = new Option(value, value);
                            e.add(newOp);
                            newOp.selected = true;
                        } else {
                            ops[0].selected = true;
                        }
                    } else if (e.tagName === "A") {
                        e.innerText = value;
                        e.textContent = value;
                        if (!e.href) {
                            e.href = value;
                        }
                    } else if (e.tagName === "META") {
                        e.setAttribute("content", value)
                    } else {
                        e.innerText = value;
                        e.textContent = value;
                    }
                });
            };
            for (let _name in obj) {
                _fs(_name, obj[_name]);
                Object.defineProperty(obj, _name, {
                    set: function (v) {
                        _obj[_name] = v;
                        _fs(_name, v);
                    },
                    get: function () {
                        return _obj[_name];
                    }
                })
            }
        }
    }
});
let currentScript = utils.getCurrentScript();
if (!currentScript || currentScript.args.createHead !== "false") {
    document.write(`<nav class="head"><a target="_github" href="https://github.com/ric2cn/ric2cn.github.io/issues"><svg style="fill: #fbf9f7;margin: 9px 16px;" height="24" width="24" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg></a><span class="text-title" name="title">${document.title}</span></nav>`);
}
