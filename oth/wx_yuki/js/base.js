window.addEventListener("load", function() {
 document.body.style.display = "block";
 /*
  * 禁止鼠标右键
  */
 [].slice.call(document.querySelectorAll('.noselect')).forEach(function(e) {
  e.oncontextmenu = function() {
   return false;
  }
  e.onselectstart = function() {
   return false;
  }
 });

 [].slice.call(document.querySelectorAll('[class*="="]')).forEach(function(e) {
  e.className.match(/\S+=\S+/g).forEach(function(str) {
   var _s = str.split("=");
   var key = _s[0].replace(/-([a-z])/, function(_t, _d) {
    return _d.toUpperCase();
   });
   var value;
   if (_s[1].charAt(0) == '-' || _s[1].charAt(0) == '+') {
    var px = getComputedStyle(e)[key];
    value = parseInt(px) + parseInt(_s[1]) + px.replace(/-?\d*/, "");
   } else {
    value = _s[1];
   }
   e.style[key] = value;
  });
 });
});

var base = base || {};

base.getAjax = function(url, par, call, syn) {
 var ajax = new XMLHttpRequest();
 ajax.onreadystatechange = function() {
  if (call && 4 == ajax.readyState && 200 == ajax.status) {
   call(JSON.parse("{\"result\":" + ajax.responseText + "}").result);
  }
 };
 var _url = url + "?1=1";
 for ( var index in par) {
  _url += "&" + index + "=" + par[index];
 }
 ajax.open("post", _url, true);
 ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
 ajax.send();
};
