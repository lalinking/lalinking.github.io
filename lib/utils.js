/**
 * 扩展数组，实现插入方法
 */
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

Object.defineProperty(window, "utils", {
    value: {
        getAjax: (url, cb) => {
            let ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (4 !== ajax.readyState) {
                    return;
                }
                cb && cb(ajax.responseText);
            };
            ajax.open("GET", url, true);
            ajax.send();
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
        /**
         * 查询页面元素，返回的是数组
         * @param selector
         * @param dom
         * @returns {NodeListOf<HTMLElementTagNameMap[*]>}
         */
        $: function (selector, dom) {
            return (dom || document).querySelectorAll(selector)
        },
        /**
         * 创建页面元素
         * @param tag
         * @param className
         * @param html
         * @returns {any}
         */
        createNode: (tag, className, html) => {
            let nod = document.createElement(tag);
            nod.className = className;
            nod.innerHTML = html;
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
            let aParams = decodeURI(document.location.search).substr(1).split('&');
            for (let i = 0; i < aParams.length; i++) {
                let aParam = aParams[i].split('=');
                URLParams[aParam[0]] = aParam[1];
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