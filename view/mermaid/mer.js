window.addEventListener("load", () => {
    let change = true;
    let content = utils.$("#typein")[0];
    let hilight = (code) => {
        return Prism.highlight(code, Prism.languages.java, "java");
    };
    // let observer = new MutationObserver((e) => {
    //     e[0].target.parentElement.innerHTML = "";
    //     document.execCommand("insertHTML", false, hilight(e[0].target.textContent));
    // });
    // observer.observe(content, {subtree: true,characterData: true});
    content.addEventListener('paste', (e) => {
        if (e.clipboardData.items[0]) {
            let str = e.clipboardData.getData("Text");
            let lines = str.split('\n');
            e.returnValue = false;
            e.preventDefault();
            e.stopPropagation();
            let li = e.target;
            while (li.parentElement !== content) {
                li = li.parentElement;
            }
            lines.forEach((txt, ind) => {
                if (ind > 0) {
                    document.execCommand("insertText", false, '\n');
                }
                document.execCommand("insertHTML", false, hilight(txt));
            });
            change = true;
        }
    });
    content.addEventListener('keyup', (e) => {
        if ((e.keyCode === 8 || e.keyCode === 46) && content.childElementCount === 0) {
            content.innerHTML = "<li><br/></li>";
        }
        change = true;
    });

    setInterval(() => {
        if (!change) return;
        // content.innerHTML = Prism.highlight(content.textContent, Prism.languages.markdown, "markdown");

    }, 300);
    hideLoadingBoard();
});