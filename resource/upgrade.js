console.log("load upgrade.js");
/* Polyfill */
if ( typeof window.CustomEvent !== "function" ) {
	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		let evt = document.createEvent('CustomEvent');
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}
	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent = CustomEvent;
}
window.fireEvent = (dom, name, detail, bubbles, cancelable) => {
	let e = new CustomEvent(name, {
			bubbles: bubbles,
			cancelable: cancelable,
			detail: detail
		});
	if (dom.dispatchEvent) {
		dom.dispatchEvent(e);
	} else {
		dom.fireEvent(e);
	}
};
window.stringToHashKey = (str) => {
	if (str.length === 0) return "N0";
	var hash = 0, i, chr;
	for (i = 0; i < str.length; i++) {
		chr   = str.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return hash > 0 ? ("P" + hash) : ("M" + hash);
};
window.ajax = (url, data, method) => {
	return new Promise((resolve, reject) => {
		let ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function () {
			if (4 !== ajax.readyState) {return;}
			if (ajax.status !== 200) {
				return reject({statusText: ajax.statusText, status: ajax.status});
			}
			resolve(ajax.responseText);
		};
		ajax.open(method || "GET", url, true);
		ajax.setRequestHeader("Content-Type", "text/plain;charset=utf-8");
		ajax.send(data);
	});
};
window.$ = function (selector, dom) {
	let res;
	if (selector instanceof HTMLElement) {
		res = [selector];
	} else {
		res = Array.prototype.slice.call((dom || document).querySelectorAll(selector));
	}
	$.hasClass = (element, className) => {return ` ${element.className} `.replace(/\s+/g, " ").includes(` ${className} `);};
	let replaceClass = (element, oldName, newName) => {element.className = ` ${element.className} `.replace(/\s+/g, " ").replace(` ${oldName} `, ` ${newName} `);};
	res.forEach = (fun) => {[].slice.call(res).forEach(fun); return res;};
	res.setAttribute = (name, value) => {res.forEach(d => {d.setAttribute(name, value);}); return res;};
	res.remove = () => {res.forEach(d => {d.remove();}); return res;};
	res.css = (name, value) => {res.forEach(d => {d.style[name] = value;}); return res;};
	res.addClass = (className) => {res.forEach(d => {$.hasClass(d, className) ? true : (d.className += " " + className);}); return res;};
	res.delClass = (className) => {res.forEach(d => {$.hasClass(d, className) ? replaceClass(d, className, "") : false;}); return res};
	res.switchClass = (className) => {res.forEach(d => {$.hasClass(d, className) ? replaceClass(d, className, "") : (d.className += " " + className);}); return res};
	res.addEventListener = (event, fun, useCapture) => {res.forEach(d => {
		let target = d;
		d.addEventListener(event, e => {fun(e, d)}, useCapture);
	}); return res};
	return res;
};
window.$F = (obj, dom) => {
	for (let _name in obj) {
		let value = obj[_name];
		$(`[name=${_name}]`, dom).forEach(e => {
			let bindProty = e.getAttribute("data-bind");
			if (!bindProty) {
				let tagName = e.tagName.toUpperCase();
				if (tagName == "INPUT" || tagName == "TEXTAREA") {
					bindProty = "value";
				} else if (tagName === "META") {
					bindProty = "content";
				} else {
					bindProty = "innerText";
				}
			}
			if (bindProty == "innerText") {
				e.innerText = value || "";
			} else if (bindProty == "innerHTML") {
				e.innerHTML = value || "";
			} else if (bindProty == "value") {
				e.value = value;
			} else {
				(value == undefined || value == null) ? e.removeAttribute(bindProty) : e.setAttribute(bindProty, value);
			}
			fireEvent(e, "change", {}, false, true);
		})
	}
};
window.addJs = (src, async, cb) => {
	let jid = stringToHashKey(src);
    let j = document.getElementById(jid);
	if (j) {
	    // 这里可能还没加载完
	    if ("loaded" == j.getAttribute("data-status")) {return cb && cb();}
	} else {
        j = document.createElement("script");
        j.src = src;
        j.setAttribute("id", jid);
        j.async = !!async;
	}
	let oldFun = j.onload;
    j.onload = j.onreadystatechange = () => {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            if (oldFun) {
                oldFun();
            } else {
                console.log("loaded js: " + src);
                j.setAttribute("data-status", "loaded");
                j.onload = j.onreadystatechange = null;
            }
            cb && cb();
        }
    };
    document.getElementsByTagName("head")[0].appendChild(j);
};
window.copyToClipboard = (text) => {
	return new Promise((resolve, reject) => {
		let input = document.createElement('textarea')
		input.style.position = 'fixed'
		input.style.top = '-10000px'
		input.style.zIndex = '-999'
		document.body.appendChild(input)
		input.value = text
		input.focus()
		input.select()
		try {
		  let result = document.execCommand('copy')
		  document.body.removeChild(input)
		  if (!result || result === 'unsuccessful') {
			reject('复制失败')
		  } else {
			resolve('复制成功')
		  }
		} catch (e) {
		  document.body.removeChild(input)
		  reject('当前浏览器不支持复制功能，请检查更新或更换其他浏览器操作')
		}
	})
};
window.language = (navigator.language || navigator.userLanguage);
document.addEventListener('animationend', e => {
	if (e.animationName == "remove") {e.target.remove();}
});
window.addEventListener("resize", e => {
	if (e.isTrusted || !e.detail) {
		fireEvent(document.body, "resize", {}, true, true);
	}
})