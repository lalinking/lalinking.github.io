const fs = require('fs');
const path = require('path');

const dirPosts = process.argv[2];
const dirRepo = process.argv[3];

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
		var _date = new Date();
		var _str = '[' + process.pid + '] ';
		_str += _date.getFullYear() + '-' + (_date.getMonth() + 1) + '-' + _date.getDate() + ' ';
		_str += _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds() + '.' + _date.getMilliseconds();
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

const bookInfos = JSON.parse(fs.readFileSync(dirRepo + "/src/metaInfo.json",'utf-8'));
console.log("load bookInfos: {}", JSON.stringify(bookInfos));

// 遍历博文
function listPostFiles(_path, _callBack) {
	fs.readdirSync(_path).forEach(function(_item) {
		var _fullpath = path.join(_path, _item);
		var _stats = fs.statSync(_fullpath);
		if(_stats.isFile()) {
			_callBack(_fullpath);
		} else if(_stats.isDirectory() && _item != ".git") {
			listPostFiles(_fullpath, _callBack);
		}
	});
}

function getPostFileMetaInfo(postPath) {
	if (!fs.existsSync(postPath)) {return {};}
	var _txts = fs.readFileSync(postPath).toString().split(new RegExp("[\r\n]"));
	var _flag = 0;
	var _reg = new RegExp("^\-{5,}$");
	var _meta = {};
	_meta.FileTitle = "杂记一则"; 
	_meta.BookName = "杂记";
	while(true) {
		var _line = _txts.shift();
		if (_reg.test(_line)) {
			_flag ++;
			continue;
		}
		if (_flag > 1) {break;}
		var _sp = _line.trim().split(new RegExp("\\s*:\\s*"));
		_meta[_sp[0]] = _sp[1];
	}
	_meta.FilePath = postPath.substr(dirPosts.length);
	var _bookKey = stringToHashKey(_meta.BookName);
	return {bookKey: _bookKey, meta: _meta, content: _txts.join("\n")};
}

// 读取博文元数据，并编译博文
function compilePostFileToMD(postPath) {
	var _res = getPostFileMetaInfo(postPath);
	var _bookKey = _res.bookKey;
	if (bookInfos[_bookKey]) {
		bookInfos[_bookKey].contents.push(_res.meta);
	} else {
		bookInfos[_bookKey] = {BookId: _bookKey, BookName: _res.meta.BookName, contents: [_res.meta]};
	}
	var _fullPath = path.resolve(dirRepo + "/.posts/" + _res.meta.FilePath, '..');
	mkdirsSync(_fullPath);
	fs.writeFileSync(dirRepo + "/.posts/" + _res.meta.FilePath, _res.content);
	bookInfos.maxThickness = Math.max(bookInfos[_res.bookKey].contents.length, bookInfos.maxThickness);
	bookInfos.maxHeight = Math.max(bookInfos[_res.bookKey].BookName.length, bookInfos.maxHeight);
}

// 博文转译成 html 文件
function compilePostFileToHTML(postPath) {
	var _res = getPostFileMetaInfo(postPath);
	var _ms = _res.meta;
	_ms.BookKey = _res.bookKey;
	_ms.Content = _res.content;
	_ms.Keywords = _ms.BookName;
	_ms.bookInfos = JSON.stringify(bookInfos);
	var _txts = fs.readFileSync(dirRepo + "/src/page.html").toString().split(new RegExp("[\r\n]"));
	for (var _index = 0; _index < _txts.length; _index ++) {
		var _line = _txts[_index];
		for (var _p in _ms) {
			if (!_p) {continue;}
			_line = _line.replace(new RegExp("\#\{" + _p + "\}", "g"), _ms[_p]);
		}
		_txts[_index] = _line;
	}
	var _fullPath = path.resolve(dirRepo + "/page/" + _res.meta.FilePath, '..');
	mkdirsSync(_fullPath);
	fs.writeFileSync(dirRepo + "/page/" + _res.meta.FilePath + ".html", _txts.join("\n"));
}

// 获取元数据 & 编译博文
listPostFiles(dirPosts, compilePostFileToMD);
console.log("load bookInfos: \n{}", JSON.stringify(bookInfos));
listPostFiles(dirPosts, compilePostFileToHTML);
// 生成 index
var _ms = {};
_ms.BookKey = null;
_ms.Content = "蓝领王的个人笔记博客";
_ms.Keywords = "蓝领王,笔记";
_ms.bookInfos = JSON.stringify(bookInfos);
var _txts = fs.readFileSync(dirRepo + "/src/page.html").toString().split(new RegExp("[\r\n]"));
for (var _index = 0; _index < _txts.length; _index ++) {
	var _line = _txts[_index];
	for (var _p in _ms) {
		if (!_p) {continue;}
		_line = _line.replace(new RegExp("\#\{" + _p + "\}", "g"), _ms[_p]);
	}
	_txts[_index] = _line;
}
fs.writeFileSync(dirRepo + "/index.html", _txts.join("\n"));