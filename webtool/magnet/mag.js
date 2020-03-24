function getMagnet() {
    let inp = $("#input_magnet")[0];
    let outp = $("#output_magnet")[0];
    let msg = $("#msg")[0];
    let copy_btn = $("#copy_btn")[0];
    let use_older = $("#use_older")[0];
    let use_ip = $("#use_ip")[0];
    if (!inp.value) {
        msg.innerText = "请输入内容";
        return
    }
    if (!inp.value.startsWith("magnet:?")) {
        msg.innerText = "您输入的不是 magnet 链接";
        return
    }
    let url = `https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all${use_ip.checked ? "_ip" : ""}.txt`;
    msg.innerText = "正在获取 Tracker 列表，请稍等 ……";
    getAjax(url, trs => {
        let trsList = trs.trim().split(/\s*[\r\n]\s*/);
        let res = inp.value.trim();
        let old = res.match(/(?<=&tr(\.\d+)?=)[^&]+/g);
        if (!old) {
            old = []
        } else {
            res = res.replace(/&tr(\.\d+)?=[^&]+/g, "");
        }
        if (use_older.checked) {
            trsList = trsList.concat(old)
        }
        trsList.forEach(tr => {
            res += "&tr=" + encodeURIComponent(tr);
        });
        msg.innerText = "新的 Magnet：";
        outp.innerText = res;
        outp.className = "";
        copy_btn.className = "";
    }, (status, _msg) => {
        msg.innerText = "网络出错，请稍候重试。 " + _msg;
    });
}

function copyRes() {
    let outp = $("#output_magnet")[0];
    let msg = $("#msg")[0];
    copyToClipboard(outp.innerText, () => {
        msg.innerText = '拷贝成功'
    }, (err) => {
        msg.innerText = '拷贝失败: ' + err
    })
}