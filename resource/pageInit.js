/* 框架渲染 */
function stringToHashKey(str) {
    if (str.length === 0) return "N0";
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash > 0 ? ("P" + hash) : ("M" + hash);
}
function initBookShelf(metaInfo) {
    initTalk("");
    let bookInfos = JSON.parse(metaInfo);
    let bookShelf = $("#bookshelf_inner")[0];
    let maxThickness = 0;
    let maxHeight = 0;
    let left = 0;
    for (let b in bookInfos) {
        let book = bookInfos[b];
		if (typeof book != "object" || !book.BookName) {continue;}
        let bookDiv = document.createElement("DIV");
        bookDiv.className = "book curb";
        // 计算书的三维
        let thickness = book.contents.length / maxThickness * 5.5 + 2;
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
            _index += `<li><a data-click="post_load" id="${m.key}" data-keywords="${m.Keywords}" data-date="${m.Date}" data-src="${m.FilePath}" href="javascript:void(0)" title="${m.FileDesc}">${m.FileTitle}</a></li>`;
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

function initTalk(path) {
    document.getElementById("talk").innerHTML = "";
    let gitalk = new Gitalk({
        clientID: '7b9679434b225da457ea',
        clientSecret: 'd0367170ba5aca675670eb66f6e25689e905bd07',
        repo: 'lalinking.github.io',
        owner: 'lalinking',
        admin: ['lalinking'],
        id: stringToHashKey(path),
        distractionFreeMode: true
    });
    gitalk.render('talk');
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
	markedPanel.className = "marked-panel";
	markedPanel.innerHTML = html;
	$(".book[data-status=post_loading] .p4")[0].append(markedPanel);
	$(".book[data-status=post_loading]").setAttribute("data-status", "post_loaded");
}

function showPost(filePath, _title, _date) {
    $(".book[data-status=post_loading] .p4")[0].innerHTML = "";
    let _infoDom = document.createElement("DIV");
    _infoDom.className = "post-meta";
    _infoDom.innerHTML = `<span class="post-title">${_title}</span><i class="post-date">${_date}</i><i class="icon close" data-click="post_close"></i>`;
    $(".book[data-status=post_loading] .p4")[0].append(_infoDom);
    if (filePath.endsWith(".md")) {
        // markdown 文件
        ajax("/.posts/" + filePath).then(setMdTxt).catch(showNetError);
    } else if (filePath.endsWith(".html")) {
        // 加载 iframe
    }
    // 加载留言
    initTalk(filePath);
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
    dom.className = "";
}
function highlight(code, lan) {
    if ("mermaid" === lan) {
        window.needMermaid = true;
        return `<div class="mermaid" data-status="0">${code}</div>`;
    } else {
        let _id = 'i' + Math.random().toString(36).substr(2);
        codes[_id] = code;
        let c = lan ? Prism.highlight(code, Prism.languages[lan], lan) : code;
        let rs = c.split(/\n/);
        let copy = `<a onclick="return copyCode(this);">copy</a>`;
        let result = `<div onclick="expandCode(this)" class='${rs.length > 30 ? 'cospand' : ''}'>`;
        result += `<div><div class='line-start'></div><div class="line-body tool-bar" data-codeid="${_id}">${copy}</div></div>`;
        rs.forEach((e, i) => {
            result += `<div><div class='line-start'>${i + 1}</div><div class="line-body">${e}</div></div>`;
        });
        result += "</div>";
        return result;
    }
}

document.body.addEventListener("click", e => {
    let clk = e.target.getAttribute("data-click");
    if (!clk) {return;}
    if (clk == "index_open") {
        e.target.parentElement.setAttribute("data-status", clk)
    } else if (clk == "post_load") {
        $(".book[data-status^=index_]").setAttribute("data-status", "post_loading");
        let _title = e.target.innerText;
        let _date = e.target.getAttribute("data-date");
        showPost(e.target.getAttribute("data-src"), _title, _date);
    } else if (clk == "index_close") {
        $(".book[data-status^=index_], .book[data-status=post_loading], .book[data-status=post_loaded]").setAttribute("data-status", "close");
        $("#board").css("transform", "rotateX(55deg)");
        setTimeout(function() {$("#board").css("transform", "")}, 500);
        initTalk("");
    } else if (clk == "post_close") {
        $(".book[data-status=post_loaded]").setAttribute("data-status", "index_reopen");
        initTalk("");
    } else if (clk == "talk_switch") {
        $(".talk").setAttribute("data-status", "show");
    } else if (clk == "talk_close") {
        $(".talk")[0].blur();
    } else {
        alert(clk);
    }
});

function showNetError(netError) {
    console.error(netError)
}