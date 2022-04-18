const fs = require('fs');
const path = require('path');

const dirPosts = process.argv[2];
const dirRepo = process.argv[3];
const version = process.argv[4];

// 控制日志格式
(function() {
	var log = console.log;
	var argumentToString = function(args) {
		if (args.length == 1) {return args[0]}
		var _str = args[0];
		for (var indx = 1; indx < args.length; indx ++) {
			_str = _str.replace("{}", args[indx])
		}
		return _str
	};
	console.log = function() {
		var _str = '[' + process.pid + '] ' + new Date().toISOString();
		log.call(console, _str + ' ' + argumentToString(arguments));
	}
})(console);
const stringToHashKey = function(str) {
	if (str.length === 0) return "N0";
	var hash = 0, i, chr;
	for (i = 0; i < str.length; i++) {
		chr   = str.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return hash > 0 ? ("P" + hash) : ("M" + hash);
};
// 创建多层目录
const mkdirsSync = function mkdirsSync(dirname) {
	if (fs.existsSync(dirname)) {
		return true;
	} else {
		if (mkdirsSync(path.dirname(dirname))) {
			fs.mkdirSync(dirname);
			return true;
		}
	}
}

console.log("posts path:\t{}", dirPosts);
console.log("repo path:\t{}", dirRepo);

// 先将所有博文元数据读取到 postInfos
// 再将 postInfos 排序，信息写到 bookInfos

const postInfos = [];
// 这个变量是为了兼容老版本
const bookInfos = {};

// 遍历博文，获取列表
function listPostFiles(_path) {
    console.log("listPostFiles start, path: {}", _path);
	fs.readdirSync(_path).forEach(function(_item) {
		var _fullpath = path.join(_path, _item);
		var _stats = fs.statSync(_fullpath);
		if(_stats.isFile()) {
		    var post = getPostFileMetaInfo(_fullpath);
		    post.Content = null;
			postInfos.push(post);
		} else if(_stats.isDirectory() && _item != ".git") {
			listPostFiles(_fullpath);
		}
	});
	console.log("listPostFiles done, path: {}", _path);
}
function getPostFileMetaInfo(postPath) {
    console.log("getPostFileMetaInfo start, path: {}", postPath);
	if (!fs.existsSync(postPath)) {
	    throw "path not exists: " + postPath;
	}
	var _txts = fs.readFileSync(postPath).toString().split(new RegExp("[\r\n]"));
	var _flag = 0;
	var _reg = new RegExp("^\-{5,}$");
	var _meta = {};
	_meta.FileTitle = "未定义";
	_meta.BookName = "未命名";
	// 读取标签
	while(true) {
		var _line = _txts.shift();
		if (_reg.test(_line)) {
			_flag ++;
			continue;
		}
		// _读取到标签结束标记，则停止循环。 _txts 剩余内容是博文的正文
		if (_flag > 1) {break;}
		var _sp = _line.trim().split(new RegExp("\\s*:\\s*"));
		_meta[_sp[0]] = _sp[1];
	}
	_meta.Description = _meta.Description || _meta.FileTitle;
	_meta.FilePath = postPath.substr(dirPosts.length);
	_meta.PostPath = postPath;
	_meta.Keywords = _meta.Keywords || _meta.BookName;
	_meta.Content = _txts.join("\n");
	_meta.BookId = stringToHashKey(_meta.BookName);
	console.log("getPostFileMetaInfo done, path: {}", postPath);
	return _meta;
}
// 获取预定义的页面
function loadSrcMetaInfo() {
    console.log("loadSrcMetaInfo start");
    var srcMetaInfo = JSON.parse(fs.readFileSync(dirRepo + "/src/metaInfo.json",'utf-8'));
    for (var b in srcMetaInfo) {
        var book = srcMetaInfo[b];
        if (!book.contents) {
            continue;
        }
        // 遍历博文
        book.contents.forEach(function(p){
            p.BookId = b;
            p.BookName = book.BookName;
            p.FromSrc = true;
            postInfos.push(p);
        });
    }
    console.log("loadSrcMetaInfo done");
}
// 赋值到 bookInfos
function setToBookInfos() {
    console.log("setToBookInfos start");
    bookInfos.maxThickness = 1;
    bookInfos.maxHeight = 1;
    postInfos.forEach(function(info) {
        var _bookKey = info.BookId;
        if (bookInfos[_bookKey]) {
            bookInfos[_bookKey].contents.push(info);
        } else {
            bookInfos[_bookKey] = {BookId: _bookKey, BookName: info.BookName, contents: [info]};
        }
    });
    console.log("setToBookInfos done");
}
// 编译
function compilePostFile(postInfo, htmlRoot) {
    if (postInfo.FromSrc) {return;}
    console.log("compilePostFile start, path: {}", postInfo.FilePath);
    var content = "";
    // 复制 md 文本
    if (postInfo.PostPath) {
        // 之前处理的时候排除了内容，所以需要重新读取
        content = getPostFileMetaInfo(postInfo.PostPath).Content;
        var mdPath = dirRepo + "/.posts/" + postInfo.FilePath;
        console.log("save .md to: {}", mdPath);
        mkdirsSync(path.resolve(mdPath, '..'));
        fs.writeFileSync(mdPath, content);
    }
    // 编译 html
//    postInfo.CompileTime = new Date().toISOString();
    // 读取 html 模板
    var _txts = fs.readFileSync(dirRepo + "/src/page." + version +".html").toString().split(new RegExp("[\r\n]"));
	// 替换模板中的变量
	var param = {};
	param.Content = content;
	param.bookInfos = JSON.stringify(bookInfos);
	param.FilePath = postInfo.FilePath || "";
	param.FileTitle = postInfo.FileTitle || "";
	param.Date = postInfo.Date || "";
	param.Keywords = postInfo.Keywords || "";
	param.Description = postInfo.Description || "";
	for (var _index = 0; _index < _txts.length; _index ++) {
		var _line = _txts[_index];
		for (var _p in param) {
			if (!_p) {continue;}
			_line = _line.replace(new RegExp("\#\{" + _p + "\}", "g"), param[_p]);
		}
		_txts[_index] = _line;
	}
	var htmlPath = dirRepo + "/" + htmlRoot + postInfo.FilePath + ".html";
	console.log("save .html to: {}", htmlPath);
	mkdirsSync(path.resolve(htmlPath, '..'));
	// 生成带版本号的，用于存档
	fs.writeFileSync(htmlPath, _txts.join("\n"));
	// 生成不带版本号的
	fs.writeFileSync(htmlPath.replace(/\.html$/, "." + version + ".html"), _txts.join("\n"));
	console.log("compilePostFile done, path: {}", postInfo.FilePath);
}

// 获取元数据 & 编译博文
listPostFiles(dirPosts);
// 加载预定义的博文
loadSrcMetaInfo();
// 按时间排序
postInfos.sort(function(p1, p2) {
    return new Date(p2["Date"]).getTime() - new Date(p1["Date"]).getTime();
});
// bookInfos 赋值
setToBookInfos();
// 编译内容
postInfos.forEach(function(pinfo) {
    compilePostFile(pinfo, "page/");
});
// 生成 index
var indexInfo = {};
indexInfo.FilePath = "index";
indexInfo.Description = "蓝领王的个人笔记博客";
indexInfo.Keywords = "蓝领王,笔记";
compilePostFile(indexInfo, "");

console.log("compile done.");