window.getAjax = (url, cb, eb) => {
    let res;
    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (4 !== ajax.readyState) {
            return;
        }
        if (ajax.status !== 200) {
            if (eb) {
                eb(ajax.statusText, ajax.status);
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
};
window.addCss = (src, async, cb) => {
    let cssList = document.getElementsByTagName("link");
    for (let i = 0; i < cssList.length; i++) {
        let css = cssList[i];
        if (css.href === src) {
            console.log(`loaded: ${src}`);
            return cb && cb();
        }
    }
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
};
window.addJs = (src, async, cb) => {
    let jsList = document.getElementsByTagName("script");
    for (let i = 0; i < jsList.length; i++) {
        let js = jsList[i];
        if (js.src === src) {
            console.log(`loaded: ${src}`);
            return cb && cb();
        }
    }
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
/**
 * 单向绑定
 * obj 作为键值对，遍历obj将obj的key作为name查找页面上所有元素，将其值刷新。<br>
 * 传入{mydiv:"dis"}，则页面上所有name为mydiv的元素value 或 innerText设置为 "dis"
 */
window.bind = (obj, dom) => {
    dom = dom || document;
    let _obj = {...obj};
    let _fs = function (name, value) {
        [].slice.call(dom.querySelectorAll(`[name="${name}"]`)).forEach(e => {
            let bindProty = e.getAttribute("data-bind");
            if (!bindProty) {
                let tagName = e.tagName.toUpperCase();
                if (tagName === "INPUT") {
                    bindProty = "value"
                } else if (tagName === "SELECT") {
                    bindProty = "selected"
                } else if (tagName === "META") {
                    bindProty = "content"
                } else {
                    bindProty = "innerText"
                }
            }
            if (bindProty === "selected") {
                let ops = $(`option[value=${value}]`);
                if (ops.length === 0) {
                    let newOp = new Option(value, value);
                    e.add(newOp);
                    newOp.selected = true
                } else {
                    ops[0].selected = true
                }
            } else {
                e.setAttribute(bindProty, value)
            }
        })
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
};
window.$ = function (selector, dom) {
    return (dom || document).querySelectorAll(selector)
};
window.$$ = (html) => {
    let nod = document.createElement("DIV");
    if (html) {
        nod.innerHTML = html;
    }
    return nod.firstElementChild;
};
window.copyToClipboard = (text, cb, errcb) => {
    if (!navigator.clipboard) {
        errcb();
        return;
    }
    navigator.clipboard.writeText(text).then(cb, errcb);
};
window.language = (navigator.language || navigator.userLanguage);
window.search = ((function () {
    let URLParams = {};
    let aParams = document.location.search.substr(1).split('&');
    for (let i = 0; i < aParams.length; i++) {
        let aParam = aParams[i].split('=');
        URLParams[aParam[0]] = decodeURIComponent(aParam[1]);
    }
    return URLParams;
})());
/**
 * 获取当前 js 后面带的参数
 */
window.getCurrentJSParameters = () => {
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
        stack = e.stack;
        if (!stack && window.opera) {
            //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
            stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
    }
    if (stack) {
        stack = stack.split(/[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
        stack = stack[0] === "(" ? stack.slice(1, -1) : stack;
        //去掉行号与或许存在的出错字符起始位置
        let s = stack.replace(/(:\d+)?:\d+$/i, "");
        return {src: s, args: parseSrc(s)};
    }
    let nodes = document.scripts; //只在head标签中寻找
    for (let i = 0, node = nodes[i++]; ;) {
        if (node.readyState === "interactive") {
            return {src: node.src, args: parseSrc(node.src)};
        }
    }
};