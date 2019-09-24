let change;
utils.search.pageid = "mermaid_page";
function ongetvisitcount(count) {
    utils.$("#readcount")[0].innerText = count;
}

window.addEventListener("load", () => {
    let intpanel = utils.$("#source-input")[0];
    let viewpanel = utils.$(".mermaid-view")[0];
    let hilight = (code) => {
        return Prism.highlight(code, Prism.languages.markdown, "markdown");
    };
    intpanel.addEventListener('paste', (e) => {
        e.returnValue = false;
        e.preventDefault();
        e.stopPropagation();
        if (e.clipboardData.items[0]) {
            let str = e.clipboardData.getData("Text");
            let lines = str.split('\n');
            let li = e.target;
            while (li.parentElement !== intpanel) {
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
    intpanel.addEventListener('keyup', (e) => {
        if ((e.keyCode === 8 || e.keyCode === 46) && intpanel.childElementCount === 0) {
            intpanel.innerHTML = "<li><br/></li>";
        }
        change = true;
    });

    setInterval(() => {
        if (!change) return;
        change = false;
        if (!intpanel.innerText) {
            viewpanel.innerHTML = "";
            return;
        }
        try {
            mermaid.render('ver' + (Math.floor(Math.random() * 10000)).toString(), intpanel.innerText, svgCode => {
                viewpanel.innerHTML = svgCode;
            });
        } catch (e) {
            viewpanel.innerHTML = `<pre>${e}</pre>`;
        }
    }, 300);
    hideLoadingBoard();
});

function showDemo(demoName) {
    let intpanel = utils.$("#source-input")[0];
    switch (demoName) {
        case "base-flow":
            intpanel.innerHTML = "<li>graph LR</li>" +
                "<li>    A[Square Rect] -- Link text --> B((Circle))</li>" +
                "<li>    A --> C(Round Rect)</li>" +
                "<li>    B --> D{Rhombus}</li>" +
                "<li>    C --> D</li>";
            break;
        case "large-flow":
            intpanel.innerHTML = "<li>graph TB</li>" +
                "<li>    sq[Square shape] --> ci((Circle shape))</li>" +
                "<li><br/></li>" +
                "<li>    subgraph A subgraph</li>" +
                "<li>        od>Odd shape]-- Two line&#60;br/&#62;edge comment --> ro</li>" +
                "<li>        di{Diamond with &#60;br/&#62; line break} -.-> ro(Rounded&#60;br/&#62;square&#60;br/&#62;shape)</li>" +
                "<li>        di==>ro2(Rounded square shape)</li>" +
                "<li>    end</li>" +
                "<li><br/></li>" +
                "<li>    %% Notice that no text in shape are added here instead that is appended further down</li>" +
                "<li>    e --> od3>Really long text with linebreak&#60;br/&#62;in an Odd shape]</li>" +
                "<li><br/></li>" +
                "<li>    %% Comments after double percent signs</li>" +
                "<li>    e((Inner / circle&#60;br/&#62;and some odd &#60;br/&#62;special characters)) --> f(,.?!+-*ز)</li>" +
                "<li><br/></li>" +
                "<li>    cyr[Cyrillic]-->cyr2((Circle shape Начало));</li>" +
                "<li><br/></li>" +
                "<li>     classDef green fill:#9f6,stroke:#333,stroke-width:2px;</li>" +
                "<li>     classDef orange fill:#f96,stroke:#333,stroke-width:4px;</li>" +
                "<li>     class sq,e green</li>" +
                "<li>     class di orange</li>";
            break;
        case "base-sequence":
            intpanel.innerHTML = "<li>sequenceDiagram</li>" +
                "<li>    Alice ->> Bob: Hello Bob, how are you?</li>" +
                "<li>    Bob-->>John: How about you John?</li>" +
                "<li>    Bob--x Alice: I am good thanks!</li>" +
                "<li>    Bob-x John: I am good thanks!</li>" +
                "<li>    Note right of John: Bob thinks a long&#60;br/&#62;long time, so long&#60;br/&#62;that the text does&#60;br/&#62;not fit on a row.</li>" +
                "<li><br/></li>" +
                "<li>    Bob-->Alice: Checking with John...</li>" +
                "<li>    Alice->John: Yes... John, how are you?</li>";
            break;
        case "all-sequence":
            intpanel.innerHTML = "<li>sequenceDiagram</li>" +
                "<li>    loop Daily query</li>" +
                "<li>        Alice->>Bob: Hello Bob, how are you?</li>" +
                "<li>        alt is sick</li>" +
                "<li>            Bob->>Alice: Not so good :(</li>" +
                "<li>        else is well</li>" +
                "<li>            Bob->>Alice: Feeling fresh like a daisy</li>" +
                "<li>        end</li>" +
                "<li><br/></li>" +
                "<li>        opt Extra response</li>" +
                "<li>            Bob->>Alice: Thanks for asking</li>" +
                "<li>        end</li>" +
                "<li>    end</li>";
            break;
        case "all2-sequence":
            intpanel.innerHTML = "<li>sequenceDiagram</li>" +
                "<li>    participant Alice</li>" +
                "<li>    participant Bob</li>" +
                "<li>    Alice->>John: Hello John, how are you?</li>" +
                "<li>    loop Healthcheck</li>" +
                "<li>        John->>John: Fight against hypochondria</li>" +
                "<li>    end</li>" +
                "<li>    Note right of John: Rational thoughts&#60;br/&#62;prevail...</li>" +
                "<li>    John-->>Alice: Great!</li>" +
                "<li>    John->>Bob: How about you?</li>" +
                "<li>    Bob-->>John: Jolly good!</li>";
            break;
        default:
            intpanel.innerText = "";
            break;
    }
    change = true;
}