/* 框架渲染 */
function initBookShelf(metaInfo) {
	let bookInfos = JSON.parse(metaInfo);
	let bookShelf = $("#bookshelf_inner")[0];
	let maxThickness = bookInfos.maxThickness;
	let maxHeight = bookInfos.maxHeight;
	let left = 0;
	for (let b in bookInfos) {
		let book = bookInfos[b];
		if (typeof book != "object" || !book.BookName) {continue;}
		let bookDiv = document.createElement("DIV");
		bookDiv.setAttribute("id", b);
		bookDiv.className = "book curb";
		// 计算书的三维
		let thickness = book.contents.length / maxThickness * 2 + 2;
		let height = book.BookName.length / maxHeight * 10 + 14;
		let width = book.BookName.length / maxHeight * 6 + 10;
		bookDiv.style.setProperty("--book-thickness", thickness + "rem");
		bookDiv.style.setProperty("--book-height", height + "rem");
		bookDiv.style.setProperty("--book-width", width + "rem");
		bookDiv.style.setProperty("--book-maxWidth", width / height * 90 + "rem");
		bookDiv.style.setProperty("--book-left", left + "rem");
		bookDiv.style.left = left + "rem";
		left += thickness;

		// 页码正文
		let p4 = document.createElement("DIV");
		p4.className = "face front page p4";
		bookDiv.append(p4);
		// 页码3
		let p3 = document.createElement("DIV");
		p3.className = "face front page p3";
		p3.innerText = "Loading ..."
		bookDiv.append(p3);
		// 页码2
		let p2 = document.createElement("DIV");
		p2.className = "face front page p2";
		p2.innerText = "Loading ..."
		bookDiv.append(p2);
		// 页码1
		let p1 = document.createElement("DIV");
		p1.className = "face front page p1";
		bookDiv.append(p1);
		// 封面
		let bookFront = document.createElement("DIV");
		bookFront.className = "face front";
		bookDiv.append(bookFront);
		// 生成目录
		let _index = `<div class='title'>${book.BookName}</div><ul>`;
		book.contents.forEach(m => {
			_index += `<li><a data-click="post_load" data-keywords="${m.Keywords}" data-date="${m.Date}" data-src="${m.FilePath}" href="javascript:void(0)" title="${m.Description}">${m.FileTitle}</a></li>`;
		});
		bookFront.innerHTML = _index;

		let bookBack = document.createElement("DIV");
		bookBack.className = "face back";
		bookDiv.append(bookBack);

		let bookLeft = document.createElement("DIV");
		bookLeft.className = "face left";
		bookLeft.setAttribute("data-click", "index_open");
		// 侧面书名
		bookLeft.innerHTML = book.BookName;
		bookDiv.append(bookLeft);

		let bookTop = document.createElement("DIV");
		bookTop.className = "face top";
		bookDiv.append(bookTop);

		let bookBottom = document.createElement("DIV");
		bookBottom.className = "face bottom";
		bookDiv.append(bookBottom);

		bookShelf.append(bookDiv);
	}
	bookShelf.style.width = left + "rem";
}

let gitalkConfig = {
	clientID: 'e9916f89337aaa12bfe4',
	clientSecret: '1f87c979b3410722449b079e84e0da0470f7344c',
	repo: 'lalinking.github.io',
	owner: 'lalinking',
	admin: ['lalinking'],
	pagerDirection: 'last',
	distractionFreeMode: false
};
function initTalk(path, title, desc) {
	let newId = stringToHashKey(path);
	if (newId == gitalkConfig.id) {return}
	document.getElementById("talk").innerHTML = "";
	gitalkConfig.id = newId;
	gitalkConfig.title = title;
	gitalkConfig.body = `${desc || $("head [name=description]")[0].getAttribute("content")}\n link: ${location.origin}${path.startsWith("/page/") ? "" : "/page/"}${path}`;
	addJs('/3rd-lib/gitalk/gitalk.js', true, () => {
		new Gitalk(gitalkConfig).render('talk');
	});
}
/* 页面渲染 */
function setMdTxt(txt) {
	let html = marked(txt, {
		breaks: true,
		smartLists: true,
		smartypants: true,
		highlight: highlight
	});
	let markedPanel = document.createElement("DIV");
	markedPanel.className = "marked-panel content-panel";
	markedPanel.innerHTML = html;
	$(".book[data-status=post_loading] .p4")[0].append(markedPanel);
	$(".book[data-status=post_loading]").setAttribute("data-status", "post_loaded");
	if (window.needMermaid) {
		// 会受动画的影响而减小画布宽度，所以延迟加载
		setTimeout(() => {
			addJs('/3rd-lib/mermaid/mermaid.js', true, () => {
				mermaid.init();
				$(".marked-panel .mermaid").setAttribute("data-status", "loaded");
			});
		}, 300);
	}
}

function showPost(filePath, _title, _date, _txt, _desc) {
	// 加载留言
	initTalk(filePath, _title, _desc);
	$(".book[data-status=post_loading] .p4")[0].innerHTML = '<i class="icon close" data-click="post_close"></i>';
	let _infoDom = document.createElement("DIV");
	_infoDom.className = "post-meta";
	_infoDom.innerHTML = `<span class="post-title">${_title}</span><i class="post-date">${_date}</i>`;
	$(".book[data-status=post_loading] .p4")[0].append(_infoDom);
	if (filePath.endsWith(".md")) {
		// markdown 文件
		if (_txt) {
			setMdTxt(_txt)
		} else {
			ajax("/.posts/" + filePath).then(setMdTxt).catch(showNetError);
		}
	} else if (filePath.endsWith(".html")) {
		// 加载 iframe
		let _if = document.createElement("IFRAME");
		_if.className = "content-panel";
		$(".book[data-status=post_loading] .p4")[0].append(_if);
		_if.setAttribute("src", filePath);
		$(".book[data-status=post_loading]").setAttribute("data-status", "post_loaded");
	}
}
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
	// 因个人书写习惯，做一些兼容
	if (lan == "sh") {lan == "bash"}
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

window.addEventListener("click", e => {
	let clk = e.target.getAttribute("data-click");
	if (!clk) {return;}
	if (clk == "index_open") {
		e.target.parentElement.setAttribute("data-status", clk)
	} else if (clk == "post_load") {
		$(".book[data-status^=index_]").setAttribute("data-status", "post_loading");
		let _title = e.target.innerText;
		let _date = e.target.getAttribute("data-date");
		let _desc = e.target.getAttribute("title");
		showPost(e.target.getAttribute("data-src"), _title, _date, null, _desc);
	} else if (clk == "index_close") {
		$(".book[data-status^=index_], .book[data-status=post_loading], .book[data-status=post_loaded]").setAttribute("data-status", "close");
		$("#board").css("transform", "rotateX(55deg)");
		setTimeout(function() {$("#board").css("transform", "")}, 500);
		initTalk("index.html", "首页");
	} else if (clk == "post_close") {
		$(".book[data-status=post_loaded]").setAttribute("data-status", "index_reopen");
		initTalk("index.html", "首页");
	} else if (clk == "talk_switch") {
		$(".talk").setAttribute("data-status", "show");
	} else if (clk == "talk_close") {
		$(".talk")[0].blur();
	} else if (clk == "copyCode") {
		copyCode(e.target);
	} else if (clk == "expandCode") {
		expandCode(e.target);
	} else {
		console.log(clk);
	}
});

function showNetError(netError) {
	console.error(netError);
	alert(netError);
}