define(function(require, exports, module) {
    const _setRange = function(selection, range) {
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    const _setStartAfter = function(selection, range, node) {
        range.setStartAfter(node);
        _setRange(selection, range);
    };

    const _getElementNode = function(selection) {
        let focusNode = (selection || {}).focusNode;
        return focusNode ? focusNode.parentNode : null;
    };

    const _isSpecialNode = function(node, test) {
        return node && new RegExp(test).test(node.className);
    };

    module.exports = {
        // 在光标处插入内容
        insertText(content, global = window) {
            if (!content) return;

            let doc = global.document;

            if (doc.queryCommandSupported('insertHTML')) { //chrome firefox safari
                doc.execCommand('insertHTML', false, content);
                return;
            }

            if (global.getSelection) { // IE >= 9
                let selection = global.getSelection();

                if (selection.getRangeAt && selection.rangeCount) {
                    let range = selection.getRangeAt(0);
                    range.deleteContents();

                    let el = doc.createElement('div'),
                        frag = doc.createDocumentFragment(),
                        node, lastNode;

                    el.innerHTML = content;
                    while ((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }

                    range.insertNode(frag);

                    if (lastNode) {
                        range = range.cloneRange();
                        _setStartAfter(selection, range, lastNode);
                    }
                }
            }
        },

        // 替换当前光标所在位置的指定节点文本
        replaceText(node, content, global = window) {
            if (!node || !content) return;
            if (global.getSelection) {
                let selection = global.getSelection();
                let el = _getElementNode(selection);
                if (_isSpecialNode(el, node)) {
                    if (_.isString(content)) {
                        let tmp = global.document.createElement('div');
                        tmp.innerHTML = content;
                        content = tmp.firstChild;
                    }
                    el.parentNode.replaceChild(content, el);
                }
            }
        },

        // 删除当前整个节点（光标在此节点内时）
        removeText(node, global = window) {
            if (node && global.getSelection) {
                let selection = global.getSelection();
                let el = _getElementNode(selection);
                if (_isSpecialNode(el, node)) {
                    el.parentNode.removeChild(el);
                }
            }
        },

        // 移动光标到当前节点之后（比如不允许在指定节点内插入内容）
        moveToAfter(node, global = window) {
            if (node && global.getSelection) {
                let selection = global.getSelection();
                let el = _getElementNode(selection);
                if (_isSpecialNode(el, node)) {
                    let range = selection.getRangeAt(0).cloneRange();
                    _setStartAfter(selection, range, el);
                }
            }
        },

        // 聚焦到文本框指定位置
        focusText(el, pos, global = window) {
            if (!el) return;

            let doc = global.document;

            if (doc.setSelectionRange) { // firefox
                doc.setSelectionRange(pos, pos);
                return;
            }

            if (global.getSelection) { // IE >= 9
                let selection = global.getSelection();
                let range = doc.createRange();
                range.setStart(el, pos);
                _setRange(selection, range);
            }
        },

        // 从总字段列表中过滤指定的小字段列表
        filterFields(fields1, fields2, filterKey, fields2NotKey) {
            if (filterKey === void 0) filterKey = 'id';
            return _.reject(fields1, (a) => !!_.find(fields2, (b) => a[filterKey] === (fields2NotKey ? b : b[filterKey])));
        },

        // 解析字符串中的变量
        parseVariable(value) {
            let matchs = [];
            let match = null;
            let reg = /\$\{([^\.\}]+)\.?([^\.\}]+)?\.?([^\.\}]+)?\}/g;
            while ((match = reg.exec(value))) matchs.push(match);
            return _.map(matchs, (m) => {
                if (m[3]) m[1] = m[1] + '.' + m[2], m[2] = m[3];
                return {
                    value: m[0],
                    variable: m[1],
                    subVariable: m[2]
                };
            });
        },

        // 格式化变量
        formatVariable(data, space, showError) {
            let {
                type,
                variable,
                subVariable
            } = data;
            if (!variable) return `<span style="color: #ff7663;"}>${subVariable.label}</span>`
            let html = `<span class="capsule">${space ? '<span>&nbsp;</span>' : ''}<span class="var" style="${showError ? 'color: #ff7663;' : ''}" data-type="${type.name}" data-var="${variable.name}"`;
            subVariable && (html += `data-subvar="${subVariable.name}"`);
            html += `>${this.fmtVar(variable.label, subVariable ? subVariable.label : null)}</span>${space ? '<span>&nbsp;</span>' : ''}`;
            return html;
        },

        fmtVar(v, sv, sp) {
            if (sp === void 0) sp = '.';
            return `\${${v + (sv ? sp + sv : '')}}`;
        },

        generateId(figures) {
            let w = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789',
                l = w.length,
                a = [];
            _.times(figures, () => {
                a.push(w.substr(Math.floor(Math.random() * l), 1));
            })
            return a.join('');
        }
    };
});