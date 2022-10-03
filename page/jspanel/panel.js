window.Class = function(superClass, constructor) {
    let fun = function() {
        superClass.apply(this);
        if (constructor) {
            let _supper = {...this};
            constructor.call(this, _supper);
        }
        if (this.init)  {
            let init = this.init.apply(this, arguments);
            if (init instanceof fun) {
                return init;
            }
        }
        return this;
    };
    fun.toString = null;
    return fun;
};
window.Panel = new Class(function() {
    let _this = this;
    let _doms = [];
    let _events = {};
    _this.append = (domDesc, index) => {
        if (index != undefined && index != null) {
            _doms.splice(index, 0, domDesc);
        } else {
            _doms.push(domDesc);
        }
        return _this;
    };
    _this.renderTo = dom => {
        let _root;
        if (_this.rootDom) {
            _root = _this.rootDom;
            _root.innerHTML = "";
        } else {
            _root = $C(`<div class="${_this.rootClass}"></div>`);
            _this.rootDom = _root;
        }
        dom.appendChild(_root);
        _doms.forEach(_domDesc => {
            Panel.freshUI(_domDesc);
            _root.appendChild(_domDesc.element);
        });
        return _this;
    };
    _this.clear = () => {
        _doms = [];
        return _this;
    };
    _this.fireEvent = (type, detail, src) => {
        _events[type] && (_events[type].apply(_this, [detail, src]));
    };
    _this.addEventListener = (type, handler) => {
        _events[type] = handler;
    };
});
Panel.freshUI = (_domDesc) => {
    if (!_domDesc.element) {
        _domDesc.element = document.createElement(_domDesc.tag || "div");
        if (_domDesc.events) {
            _domDesc.events.forEach(e => {_domDesc.element.addEventListener(e.type, e.handler, !e.cancelable)});
        }
    }
    let _ignore = ["tag", "content", "children", "events", "element", "value"];
    for (let _var in _domDesc) {
        if (_ignore.indexOf(_var) != -1 || _domDesc[_var] == undefined) {continue}
        _domDesc.element.setAttribute(_var, _domDesc[_var]);
    }
    if (_domDesc.value || _domDesc.value == 0) {
        _domDesc.element.value = _domDesc.value;
        fireEvent(_domDesc.element, "change");
    }
    _domDesc.element.innerHTML = (!_domDesc.content && _domDesc.content != 0 ? "" : _domDesc.content);
    let _children = _domDesc.element.children;
    for (let _idx = 0; _idx < _children.length; _idx ++) {
        let _child = _children[_idx];
        if (_domDesc.children && _domDesc.children.every(_dsc => {return _dsc.element !== _child})) {
            _child.className += " remove";
        }
    }
    if (_domDesc.children) {
        _domDesc.children.forEach(_childDesc => {
            Panel.freshUI(_childDesc);
            _domDesc.element.appendChild(_childDesc.element);
        });
    }
};
window.FormPanel = new Class(Panel, function(_supper) {
    let _form, _btn, _this = this;
    _this.rootClass = "panel-form";
    _form = {tag: "form", children: [], events: [{
        type: "reset",
        handler: e => {
            console.log("reset form");
            $("[name][data-value]", _form.element).setAttribute("data-value", "");
        }
    }]};
    _this.init = (name) => {
        if (name) {
            _supper.append({class: "form-title", content: name});
        }
        _supper.append(_form);
    };
    _this.appendField = (label, info, items) => {
        if (info.platform && window.platform != info.platform) {return _this;}
        let _fieldRoot = {
            class: "form-field-input cols-" + (info.cols || 3) + (items ? " form-field-input-select" : "")  + (info.role ? " " + info.role : ""),
            children: [],
            style: `width: ${info.width};`
        };
        _fieldRoot.children.push({
            tag: "label",
            class: "form-label",
            content: label
        });
        _fieldRoot.children.push({
            tag: "input",
            class: "form-input",
            required: info.required,
            id: info.id,
            name: info.name,
            type: info.type,
            value: info.value,
            placeholder: info.placeholder || info.tips,
            title: info.title || info.tips,
            maxlength: info.maxlength || 50,
            size: info.size || 50,
            accept: info.accept,
            disabled: info.disabled,
            readonly: info.readonly,
            autocomplete: "off"
        });
        if (info.type != "date")
        _fieldRoot.children.push({
            tag: "span",
            class: "icon form-clear-btn",
            content: "&#xf00d;",
            events: [{
                type: "click",
                handler: e => {
                    let _inp = $("input", e.target.parentElement)[0];
                    _inp.setAttribute("data-value", "");
                    _inp.value = null;
                    fireEvent(_inp, "change");
                }
            }]
        });
        if (items) {
            _fieldRoot.children[1]["data-bind"] = "data-value";
            _fieldRoot.children[1].events = [];
            if (info.readonly != "true") {
                _fieldRoot.children[1].events.push({
                    type: "focus",
                    handler: e => {
                        let cs = e.target.getBoundingClientRect();
                        setTimeout(() => {
                            $(".panel-select", e.target.parentElement).delClass("hide").css("left", e.target.offsetLeft + "px").css("width", cs.width + "px");
                        }, 200);
                        e.target.parentElement.parentElement.setAttribute("data-select", "yes");
                    }
                });
                _fieldRoot.children[1].events.push({
                    type: "keyup",
                    handler: e => {
                        let val = e.target.value;
                        $(".panel-select > div.hide", e.target.parentElement).delClass("hide");
                        $(".panel-select > div", e.target.parentElement).forEach((d) => {
                            if (d.getAttribute("data-value") != val && !d.innerText.includes(val)) {
                                d.className += " hide";
                            }
                        });
                    }
                });
                _fieldRoot.children[1].events.push({
                    type: "blur",
                    handler: e => {
                        e.target.parentElement.parentElement.setAttribute("data-select", "no");
                        setTimeout(() => {
                            $(".panel-select", e.target.parentElement).addClass("hide");
                            $(".panel-select > div.hide", e.target.parentElement).delClass("hide");
                        }, 200);
                    }
                });
                let _select = {class: "panel-select hide", children: [], events: [{
                    type: "click",
                    handler: e => {
                        $(e.target.parentElement).addClass("hide");
                        let value = e.target.getAttribute("data-value");
                        let _inp = $("input", e.target.parentElement.parentElement)[0];
                        _inp.setAttribute("data-value", value);
                        fireEvent(_inp, "change");
                    }
                }]};
                items.forEach(item => {
                    let _item = {class: "panel-select-item " + item.type, content: item.text || item.name || item.value};
                    _item["data-value"] = item.key;
                    _select.children.push(_item);
                });
                _fieldRoot.children.push(_select);
            }
            _fieldRoot.children[1].events.push({
                type: "change",
                handler: e => {
                    let _inp = e.target;
                    let value = _inp.getAttribute("data-value");
                    _inp.value = value;
                }
            });
        }
        _form.children.push(_fieldRoot);
        return _this;
    };
    _this.appendHidden = (name) => {
        _form.children.push({tag: "input", type: "hidden", name: name});
    };
    _this.appendArea = (label, info) => {
        if (info.platform && window.platform != info.platform) {return _this;}
        let _fieldRoot = {
            class: info.required ? "form-field-area form-required" : "form-field-area",
            children: []
        };
        _fieldRoot.children.push({
            tag: "label",
            class: "form-label",
            content: label
        });
        _fieldRoot.children.push({
            tag: "textarea",
            class: "form-area",
            required: info.required,
            id: info.id,
            name: info.name,
            rows: info.rows || 1,
            cols: info.cols,
            value: info.value,
            placeholder: info.placeholder || info.tips,
            title: info.title || info.tips,
            maxlength: info.maxlength || 200,
            disabled: info.disabled,
            readonly: info.readonly,
            events: [{
                type: "keyup",
                handler: e => {
                    let _inp = e.target;
                    _inp.style.height = "auto";
                    _inp.style.height = _inp.scrollHeight + "px";
//                    _inp.setAttribute("rows", Math.max(parseInt(_inp.getAttribute("rows")), _inp.value.split(/\r?\n/).length));
                }
            }]
        });
        _form.children.push(_fieldRoot);
        return _this;
    };
    _this.appendHr = (text) => {
        let _desc = {tag: "hr", class: "form-hr"};
        _desc["data-text"] = text;
        _form.children.push(_desc);
        return _this;
    };
    _this.appendBr = () => {
        _form.children.push({tag: "br", class: "form-br"});
        return _this;
    };
    _this.appendBtn = (btnText, fireType, btnType, platform) => {
        if (platform && window.platform != platform) {return _this;}
        if (!_btn) {
            _btn = {
                class: "form-control",
                children: []
            }
            _form.children.push(_btn);
        }
        let _c = {
            tag: "input",
            type: fireType == "reset" ? "reset" : "button",
            class: "form-btn type-" + (btnType == "reset" ? "primary" : (btnType || "default")),
            value: btnText
        };
        _c["data-fireType"] = fireType;
        _btn.children.push(_c);
        return _this;
    };
    _this.renderTo = dom => {
        _supper.renderTo(dom);
        _form.element.addEventListener("click", e => {
            let _btnType = e.target.getAttribute("data-fireType");
            if (_btnType) {
                _this.fireEvent(_btnType, _this, e.target);
            }
        }, false);
        return _this;
    };
    _this.getJsonStr = () => {
        let data = {};
        $("[name]", _form.element).forEach(f => {
            let _name = f.getAttribute("name");
            data[_name] = f.getAttribute("data-value") || f.value
        });
        return data;
    };
    _this.getFormStr = () => {
        let data = "";
        $("[name]", _form.element).forEach(f => {
            let _name = f.getAttribute("name");
            let _vale = f.getAttribute("data-value") || f.value;
            data += `&${_name}=${_vale}`;
        });
        return data;
    };
});
window.TablePanel = new Class(Panel, function(_supper) {
    let _table, _thead, _tbody, _tfoot, _page, _cellFun = {}, _this = this;
    let _headTr, _opTh;
    _this.init = (name) => {
        if (name) {
            _supper.append({class: "table-title", content: name});
        }
        _this.pageSize = 20;
        _this.rootClass = "panel-table";
        _table = {tag: "table", children: [], class: "panel-table-empty", rules: "none", cellspacing: "0"};
        _thead = {tag: "thead", children: []};
        _tbody = {tag: "tbody", children: []};
        _tfoot = {tag: "tfoot", children: []};
        _table.children.push(_thead);
        _table.children.push(_tbody);
        _page = {tag: "td", colspan: 0, children: []};
        _tfoot.children.push(_page);
        _table.children.push(_tfoot);
        _supper.append(_table);
        _headTr = {tag: "tr", children: []};
        _thead.children.push(_headTr);
    };
    // 增加一个表头
    _this.appendHead = (label, property, _transFun, platform) => {
        let _res = {tag: "th", content: label, name: property}
        if (typeof _transFun == 'string' && !platform) {platform = _transFun;}
        if (platform && window.platform != platform) {return _res;}
        _headTr.children.push(_res);
        _cellFun[property] = _transFun;
        _page.colspan ++;
        return _res;
    };
    // 增加一个常规的操作按钮
    _this.appendOperateBtn = (btnText, btnType, platform, role) => {
        if (platform && window.platform != platform) {return _this;}
        if (!_opTh) {
            _opTh = [];
            _this.appendHead("操作", "$", data => {
                let _html = "";
                _opTh.forEach(btn => {
                    _html += `<a class="row-btn btn type-${btn.btnType} ${btn.btnRole}" data-fireType="${btn.btnType}" data-fireRange="row">${btn.btnText}</a>`;
                });
                return _html;
            });
        }
        _opTh.push({btnText: btnText, btnType: btnType, btnRole: role});
        return _this;
    };
    _this.renderRows = rows => {
        let newSize = rows ? rows.length : 0;
        let _class = newSize > 0 ? "" : "panel-table-empty";
        _table.class = _class;
        _table.element && (_table.element.className = _class);
        // 对齐长度
        while (_tbody.children.length < newSize) {
            let _newTr = {tag: "tr", children: []};
            _headTr.children.forEach(_th => {
                _newTr.children.push({tag: "td", name: _th.name});
            });
            _tbody.children.push(_newTr);
        }
        _tbody.children.splice(newSize);
        Panel.freshUI(_tbody);
        // 刷新数据
        for(let _i = 0; _i < newSize; _i ++) {
            let _data = rows[_i];
            _this.freshRow(_data, _i);
        }
    };
    _this.freshRow = (row, index) => {
        let _data = row;
        let _tr = _tbody.children[index];
        _tr.children.forEach(_td => {
            let _property = _td.name;
            let _tdData;
            let _tdTransFun = _cellFun[_property];
            if (typeof _tdTransFun == 'function') {
                _tdData = _tdTransFun(_data);
                _td["data-fireRange"] = "row";
                _td["data-fireType"] = _property;
                _td["data-value"] = JSON.stringify(_data);
            } else if (typeof _tdTransFun == 'object') {
				_tdData = `<span class="cell-content">${_data[_property] || "-"}</span>`;
            } else {
                _tdData = `<span class="cell-content">${_data[_property] || "-"}</span>`;
            }
            _td.content = _tdData;
        });
        Panel.freshUI(_tr);
    };
    _this.renderPageInfo = (offset, total) => {
        _page.children.length = 0;
        _page.children.push({tag: "span", class: "page-btn", content: `${offset + 1} ~ ${Math.min(offset + _this.pageSize, total)} / ${total}`});
        // 当前页
        let _c = Math.ceil(offset / _this.pageSize) + 1;
        // 最后一页
        let _l = Math.ceil(total / _this.pageSize);
        // 打印第一页
        let _firstBtn = {tag: "a", class: "page-btn type-default btn" + (_c == 1 ? " current" : ""), content: "1"};
        _firstBtn["data-fireRange"] = "page";
        _page.children.push(_firstBtn);
        // 打印分隔符
        if (_c > 1) {
            _page.children.push({tag: "span", class: "page-gape", content: "&nbsp;"});
        }
        // 打印前后5页
        for (let _i = Math.max(2, _c - 5); _i < Math.min(_l, _c + 5); _i ++) {
            let _goBtn = {tag: "a", class: "page-btn type-default btn" + (_i == _c ? " current" : ""), content: _i};
            _goBtn["data-fireRange"] = "page";
            _page.children.push(_goBtn);
        }
        // 打印分隔符
        if (_c < _l) {
            _page.children.push({tag: "span", class: "page-gape", content: "&nbsp;"});
        }
        // 打印最后一页
        if (_l > 1) {
            let _lastBtn = {tag: "a", class: "page-btn type-default btn" + (_c == _l ? " current" : ""), content: _l};
            _lastBtn["data-fireRange"] = "page";
            _page.children.push(_lastBtn);
        }
        Panel.freshUI(_page);
    };
    _this.renderTo = dom => {
        _supper.renderTo(dom);
        _table.element.addEventListener("click", e => {
            let _range = e.target.getAttribute("data-fireRange");
            if (!_range) {return}
            if (_range == "page") {
                _this.fireEvent("page", parseInt(e.target.innerText), e.target);
            } else {
                _this.fireEvent(e.target.getAttribute("data-fireType"), JSON.parse(e.target.parentElement.getAttribute("data-value") || e.target.getAttribute("data-value")), e.target);
            }
        }, false);
        return _this;
    };
});
window.TextPanel = new Class(Panel, function(_supper) {
    let _this = this;
    _this.rootClass = "panel-text";
    let _root = {tag: "div", children: []};
    _supper.append(_root);
    _this.appendText = (text) => {
        _root.children.push({tag: "div", class: "panel-text-item", content: text});
    }

});
window.FullPanel = new Class(Panel, function(_supper) {
    let _this = this;
    let _root;
    let _panels = [];
    _this.rootClass = "panel-full";
    _this.appendPanel = panel => {
        _panels.push(panel);
    };
    _this.renderTo = dom => {
        _supper.renderTo(dom);
        _root = $C(`<div style='top: ${dom.offsetTop}px;left: ${dom.offsetLeft}px;width: ${dom.offsetWidth}px;height: ${dom.offsetHeight}px;' class='panel-full-out'></div>`);
        dom.appendChild(_root);
        _panels.forEach(p => {p.renderTo(_this.rootDom)});
        let onResize = () => {
            _root.style.top = dom.offsetTop + "px";
            _root.style.left = dom.offsetLeft + "px";
            _root.style.width = dom.offsetWidth + "px";
            _root.style.height = dom.offsetHeight + "px";
            let cs = _this.rootDom.getBoundingClientRect();
            _this.rootDom.style.left = ((dom.offsetWidth - cs.width) / 2) + "px";
            return onResize;
        }
        dom.addEventListener("resize", onResize());
    };
    _this.hide = () => {
        if (!_root) {return;}
        _root.className += " hide";
        _this.rootDom.className += " hide";
    };
    _this.show = () => {
        if (!_root) {return;}
        _root.className = "panel-full-out";
        _this.rootDom.className = _this.rootClass;
    };
});