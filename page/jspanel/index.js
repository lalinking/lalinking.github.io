// 表单测试
let formSearch = new FormPanel("测试表格");
formSearch.rootClass += " search-form";
formSearch.appendField("名字1", {name: "merchantId", placeholder: "名字1", cols: 2});
formSearch.appendField("名字2", {name: "channelId", placeholder: "名字2", cols: 1, role: "admin"});
formSearch.appendField("下拉选择", {name: "status", placeholder: "下拉选择", cols: 3}, [{key: "key1", value: "value1"},{key: "key2", value: "value2"}]);
formSearch.appendBtn("重置", "reset");
formSearch.appendBtn("搜索", "search");
formSearch.appendHr("分隔");
formSearch.appendArea("文本域", {name: "notifyFields", placeholder: "文本域", value: "id1=Code\nid2=Key\nid3=status"});
formSearch.renderTo(document.getElementById("form_search"));

let ops = [{key: "211", value: "op1"}];
let tablePanel = new TablePanel("表格标题");
tablePanel.appendHead("表头1", "h1", ops);
tablePanel.appendHead("表头2", "h2");
tablePanel.appendOperateBtn("详情", "detail");
tablePanel.appendHead("动态数据", "d1", function(data){
    console.log(data);
    return "22";
});
tablePanel.renderTo(document.getElementById("table"));
tablePanel.renderRows([{h1:"211",h2:"aaa长查哈哈长ah长长的文字211长查哈哈长ah长长的文字长查哈哈长ah长长的文字211长查哈哈长ah长长的文字"},{h1:"221",h2:"bbb"}]);
tablePanel.renderPageInfo(0, 100);
tablePanel.addEventListener("detail", console.log);
tablePanel.addEventListener("d1", console.log);