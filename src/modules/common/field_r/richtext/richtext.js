define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./richtext-html');

    const _setStartAfter = (selection, range, node) => {
        if (['bpm-vars', 'bpm-error', 'var'].indexOf(node.className) > -1) {
            if (node.nextSibling && ['bpm-vars', 'bpm-error', 'var'].indexOf(node.nextSibling.className) == -1) {
                range.setStartAfter(node.nextSibling);
            } else {
                let frag = document.createDocumentFragment();
                let span = document.createElement('span');
                span.innerHTML = '&nbsp;';
                frag.appendChild(span);
                _insertAfter(frag, node);
                let el = node.parentNode.lastChild;
                range.setStartAfter(el);
            }
        } else {
            range.setStartAfter(node);
        }

        _setRange(selection, range);
    };
    const _setRange = (selection, range) => {
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    const _getElementNode = (selection) => {
        let focusNode = (selection || {}).focusNode;
        return focusNode ? focusNode.parentNode : null;
    }

    const _insertAfter = (newElement, targetElement) => {
        var parent = targetElement.parentNode;
        if (parent.lastChild == targetElement) {
            // 如果最后的节点是目标元素，则直接添加。因为默认是最后
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }
    const RichText = BaseView.extend({
        template: template,
        className: 'bpm-richtext',
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            this.$input = this.find('.bpm-richtext-area');
            this.$input.focus();
            this.focus.delay(this, 100);
        },
        events: {
            'click': 'getRange',
            'keydown': 'changeContent',
            'keyup': 'removeText',
            'mousedown': 'handleMousedown',
            'focus .bpm-richtext-area': 'handleFocus',
            'input .bpm-richtext-area': 'handleChange',
            'paste .bpm-richtext-area': 'handlePast'
        },
        changeContent(e) {
            let keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                e.preventDefault();
                this.insertText('<br />&nbsp;');
                this.handleChange();
                return false;
            }
            this.getRange(e);
        },
        handlePast(e) {
            var data;
            var clipboardData = window.clipboardData; // IE  
            if (!clipboardData) { //chrome  
                clipboardData = e.originalEvent.clipboardData
            }
            data = clipboardData.getData('Text');
            data = data.replace(/</gm, '&lt;').replace(/[\r\n]/g, "<br />");
            this.insertText(data);
            this.handleChange();
            return false;
        },
        setValue(content, isVariable = true) {
            this.model.set('value', content);
            if (isVariable) {
                this.$input.html(`<span class="bpm-vars">${content}</span>`);
            } else {
                this.$input.html(content);
            }
            this.trigger('change', {
                value: content
            });
            this.focus.delay(this, 100);
        },
        focus() {
            if (window.getSelection) {
                if (this.$input[0].lastChild) {
                    try {
                        this.$input.focus();
                        let frag = document.createDocumentFragment();
                        let span = document.createElement('span');
                        span.innerHTML = '&nbsp;';
                        frag.appendChild(span);
                        if (['bpm-vars', 'bpm-error', 'var'].indexOf(this.$input[0].lastChild.className) > -1) {
                            this.$input[0].appendChild(frag);
                        } else if (['bpm-vars', 'bpm-error', 'var'].indexOf(this.$input[0].lastChild.innerHTML) > -1) {
                            this.$input[0].lastChild.appendChild(frag);
                        }
                        let el = this.$input[0].lastChild;

                        let selection = window.getSelection();
                        let range = selection.getRangeAt(0);
                        range.setStartAfter(el);

                        this.lastEditRange = range;
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    this.$input.focus();
                }
            }
        },
        insert(text, isVariable = true) {
            if (this.$input.text() == '') {
                this.setValue(text, isVariable);
            } else {
                if (isVariable) {
                    text = `<span class="bpm-vars">${text}</span>`
                }
                this.insertText(text);
            }
        },
        getRange(e) {
            if (window.getSelection) {
                let selection = window.getSelection();
                this.lastEditRange = selection.getRangeAt(0);
            }
            this.moveToAfter();

            if (e.type == 'click') {
                this.trigger('click');
            }
        },
        handleFocus() {
            this.trigger('focus');
        },
        handleMousedown() {
            this.trigger('mousedown');
        },
        handleChange() {
            let value = this.$input.text();
            //console.log(value);
            this.set('value', value);
            this.trigger('change', {
                value: value
            });
        },
        moveToAfter() {
            if (window.getSelection) {
                let selection = window.getSelection();
                let el = _getElementNode(selection);
                if (['bpm-vars', 'bpm-error', 'var'].indexOf(el.className) > -1) {
                    let range = selection.getRangeAt(0).cloneRange();
                    _setStartAfter(selection, range, el);
                    this.lastEditRange = range;
                }
            }
        },
        removeText(e) {
            let keyCode = e.keyCode || e.which;
            // 8:Backspace, 46:Delete
            if (keyCode === 8 || keyCode === 46) {
                if (window.getSelection) {
                    let selection = window.getSelection();
                    let el = _getElementNode(selection);
                    let arr = ['bpm-vars', 'var', 'bpm-error'];
                    if (arr.indexOf(el.className) > -1) {
                        el.parentNode.removeChild(el);
                    } else if (keyCode === 46 && arr.indexOf(el.nextElementSibling.className) > -1) {
                        el.parentNode.removeChild(el.nextElementSibling);
                    }
                }
            }
            this.handleChange();
            this.getRange(e);
        },
        validate() {
            var val = this.get('value');
            var required = this.get('required');
            if (required == true && !val) {
                this.error('请选择' + this.get('name'));
                return false;
            }
            this.rmError();
            return true;
        },
        insertText(content) {
            if (!content) return;
            if (window.getSelection) {
                let selection = window.getSelection();

                if (typeof this.lastEditRange == 'undefined' || !this.lastEditRange) {
                    this.lastEditRange = selection.getRangeAt(0);
                }
                selection.removeAllRanges();
                selection.addRange(this.lastEditRange);

                if (document.queryCommandSupported('insertHTML')) { //chrome firefox safari
                    document.execCommand('insertHTML', false, content);
                    this.focus();
                    this.lastEditRange = selection.getRangeAt(0);
                    return;
                }

                // IE >= 9
                if (selection.getRangeAt && selection.rangeCount) {
                    let range = this.lastEditRange;
                    range.deleteContents();

                    let el = document.createElement('div'),
                        frag = document.createDocumentFragment(),
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
                    this.lastEditRange = selection.getRangeAt(0);
                    this.handleChange();
                }
            }
        }
    });

    module.exports = RichText;
});