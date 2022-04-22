/* 评论工具配置 */
let gitalkConfig = {
	clientID: 'e9916f89337aaa12bfe4',
	clientSecret: '1f87c979b3410722449b079e84e0da0470f7344c',
	repo: 'lalinking.github.io',
	owner: 'lalinking',
	admin: ['lalinking'],
	pagerDirection: 'last',
	distractionFreeMode: false
};
function initTalk(info) {
    if (document.getElementById("talk") == null) {return}
	let newId = info.id || stringToHashKey(info.src);
	if (newId == gitalkConfig.id) {return}
	document.getElementById("talk").innerHTML = "";
	gitalkConfig.id = newId;
	gitalkConfig.title = info.title;
	gitalkConfig.body = `${info.desc || $("head [name=description]")[0].getAttribute("content")}\n link: ${location.origin}${info.src.startsWith("/page/") ? "" : "/page/"}${info.src}`;
	addJs('/3rd-lib/gitalk/gitalk.js', true, () => {
		new Gitalk(gitalkConfig).render('talk');
	});
}

/* 初始化目录 */
function initBookShelf(bookInfos) {
    let dom = $("#left_content")[0];
    for (let b in bookInfos) {
        let book = bookInfos[b];
        if (typeof book != "object" || !book.BookName) {continue;}
        /* 每本书属于一个分类 */
        let bookDiv = document.createElement("DIV");
        bookDiv.className = "post_type";
        /* 展示分类名称 */
        let bookTitle = document.createElement("DIV");
        bookTitle.className = "post_title";
        bookTitle.innerHTML = book.BookName;
        bookDiv.append(bookTitle);
        /* 展示博文 */
        let uls = document.createElement("UL");
        book.contents.forEach(m => {
            /* 每条博文有 标题、日期、描述、关键词 这几个要素 */
            let ul = document.createElement("LI");
            ul.setAttribute("data-keywords", m.Keywords);
            ul.setAttribute("data-date", m.Date);
            ul.setAttribute("data-src", m.FilePath);
            ul.setAttribute("data-desc", m.Description);
            ul.setAttribute("title", m.Description);
            ul.setAttribute("id", stringToHashKey(m.FilePath));
            ul.innerHTML = m.FileTitle;
            uls.append(ul);
        });
        bookDiv.append(uls);
        dom.append(bookDiv);
    }
    dom.addEventListener("click", e => {
        let li = e.target;
        if (li.tagName != "li" && li.tagName != "LI") {return;}
        let keywords = li.getAttribute("data-keywords");
        let date = li.getAttribute("data-date");
        let src = li.getAttribute("data-src");
        let desc = li.getAttribute("data-desc");
        let id = li.getAttribute("id");
        let title = li.innerHTML;
        showPost({src: src, title: title, date: date, keywords: keywords, desc: desc, id: id});
    });
}

/* 显示一个博文 */
function showPost(info, txt) {
    let startTime = Date.now();
    let bord = document.body;
    bord.className = "loading";
    let filePath = info.src;
    $("#left_content li.active").delClass("active");
    $("#left_content li#" + info.id).addClass("active");
    if (filePath.endsWith(".md")) {
        // markdown 文件
        if (txt) {
            setMdTxt(info.title, txt, startTime);
        } else {
            ajax("/.posts/" + filePath).then((txt) => setMdTxt(info.title, txt, startTime)).catch(showError);
        }
    } else if (filePath.endsWith(".html")) {
        // 加载 iframe
        setHtml(info.title, filePath, startTime);
    }
    initTalk(info);
}

/* 两种渲染函数 */
function setMdTxt(title, txt, startTime) {
	let html = marked(txt, {
		breaks: true,
		smartLists: true,
		smartypants: true,
		highlight: highlight
	});
	let markedPanel = $("#center_content")[0];
    markedPanel.className = "marked-panel content-panel";
    if (window.needMermaid) {
        addJs('/3rd-lib/mermaid/mermaid.js', true, () => {
            mermaid.init();
            $(".marked-panel .mermaid").setAttribute("data-status", "loaded");
        });
    }
    let endTime = Date.now();
    let sleep = 1000 - ((endTime - startTime) % 1000);
    setTimeout(() => {
        markedPanel.setAttribute("data-title", title);
        markedPanel.innerHTML = html;
        document.body.className = "";
    }, sleep);
}
function setHtml(title, src, startTime) {
    let htmlPanel = $("#center_content")[0];
    htmlPanel.className = "content-panel";
    let c = document.createElement("IFRAME");
    c.onload = () => {
        let endTime = Date.now();
        let sleep = 1000 - ((endTime - startTime) % 1000);
        setTimeout(() => {
            htmlPanel.setAttribute("data-title", title);
            $("#center_content > *").forEach((res) => {res == c || htmlPanel.removeChild(res)})
            c.className = "";
            document.body.className = "";
        }, sleep);
    };
    c.setAttribute("src", src);
    c.className = "hide";
    htmlPanel.append(c);
}

/* 渲染的工具函数 */
let codes = {};
function copyCode(dom) {
	copyToClipboard(codes[dom.parentElement.getAttribute('data-codeid')])
	.then(() => {
		dom.innerText = 'copyed'
	}).catch((err) => {
		dom.innerText = 'wrong: ' + err
	});
	return false;
}
function expandCode(dom) {
	dom.className = "hide";
	$(".marked-panel code .expandMsg", dom.parentElement.parentElement.parentElement).remove();
}
function highlight(code, lan) {
	if ("mermaid" === lan) {
		window.needMermaid = true;
		return `<div class="mermaid" data-status='init'>${code}</div>`;
	} else {
		let _id = 'i' + Math.random().toString(36).substr(2);
		codes[_id] = code;
		let c = Prism.languages[lan] ? Prism.highlight(code, Prism.languages[lan], lan) : code;
		let rs = c.split(/\n/);
		let result = `<div><div class='line-start'></div><div class="line-body tool-bar" data-codeid="${_id}"><a data-click="copyCode" >copy</a>`
		if (rs.length > 20) {
			result += "<a data-click='expandCode'>expand</a>";
		}
		result += "</div></div>";
		rs.forEach((e, i) => {
			if (i == 20) {result += "<div data-click='expandCode' class='expandMsg'>... ...</div>";}
			result += `<div><div class='line-start'>${i + 1}</div><div class="line-body">${e}</div></div>`;
		});
		return result;
	}
}
function showError(netError) {
	console.error(netError);
	alert(netError);
}
/* 监听点击事件 */
window.addEventListener("click", e => {
	let clk = e.target.getAttribute("data-click");
	if (!clk) {return;}
	if (clk == "copyCode") {
		copyCode(e.target);
	} else if (clk == "expandCode") {
		expandCode(e.target);
	} else if (clk == "clear") {
	    /* 擦除 */
	    document.body.className = "loading";
		setTimeout(() => {
    		let panel = $("#center_content")[0];
            panel.innerHTML = "";
            $("#left_content li.active").delClass("active");
            $("#center_content").setAttribute("data-title", "休息中");
            panel.className = "content-panel";
		    document.body.className = "";
        }, 1000);
	    let currentInfo = {src: "", title: "", date: "", keywords: "", desc: "", id: stringToHashKey("index.html")};
	    currentInfo.src = "index.html";
        currentInfo.title = "首页";
        currentInfo.desc = "这里是首页";
        initTalk(currentInfo);
	} else {
		console.log(clk);
	}
});