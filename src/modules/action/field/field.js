/**
 * Created by huojing on 2017-06-28
 */
define(function(require, exports, module) {
    const template = require('./field-html');
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    const FieldsItem = require('paas-workprocess-modules/action/field/components/relateitem/relateitem');
    //const VariablesData = require('paas-workprocess-assets/data/vardata');

    const FieldView = Dialog.extend({
        initialize(options = {}) {
            options.title = $t('字段变更');
            options.width = 660;
            options.height = 330;
            options.zIndex = 1999;
            Dialog.prototype.initialize.call(this, options);
            let $elem = $(template());
            this.find('.bpm-dialog-bd').empty().append($elem).css({
                overflow: 'visible'
            });

            this.entityId = this.get('entityId');
            this.actionNum = this.get('num');
            let data = this.get('data');
            if (!data) {
                data = {
                    taskType: "updates",
                    updateFieldJson: []
                }
            }
            this.model.set('fieldLists', data);
            this.fields = [];
            let me = this;
            this.addNum = 0;
            Dialog.prototype.show.call(this);
            this.getData();

            this.find('.add-process-fields').on('click', function(e) {
                e.preventDefault();
                if (me.addNum >= 10) {
                    let dialog = new Dialog({
                        title: $t('提示'),
                        height: 60,
                        btns: [{
                            action: 'confirm',
                            label: $t('确定')
                        }],
                        content: $t('最多添加10个字段')
                    });
                    dialog.show();
                    return;
                }
                me.addFields();
                me.addNum++;
            });
        },
        events: {
            'click .b-g-btn': 'handleBtnClick',
            'click .bpm-dislog-close': 'hide'
        },
        show() {
            Dialog.prototype.show.call(this);
        },
        bindEvents() {
            this.on('ensure', this.handleEnsure, this);
        },
        handleEnsure() {
            let fieldLists = this.model.get('fieldLists');
            let ok = 1;
            //检查所有变量字段
            _.each(this.fields, function(item) {
                if (!item) {
                    return;
                }
                if (!item.validate()) {
                    ok = 0;
                }
            });
            if (ok) {
                this.trigger('render', fieldLists, this.actionNum); //更新获取所有的字段
            }
        },
        getData() {
            let me = this;
            PaasUI.utils.api.fetchDescribe({
                apiName: me.entityId,
                success(data) {
                    me.model.set('obj', data);
                    me.renderFields.call(me);
                }
            });
            // PaasUI.utils.fetchFieldData(this.entityId, function(data) {
            //     me.model.set('obj', data);
            //     me.renderFields.call(me);
            // });
        },
        renderFields() {
            this.fields = [];
            let me = this;
            //渲染数据
            let fieldLists = this.model.get('fieldLists');
            if (fieldLists.updateFieldJson.length) {
                _.each(fieldLists.updateFieldJson, function(item) {
                    me.addFields(item);
                    me.addNum++;
                });
                //更新options
                let arr = me.setOptions();
                _.each(me.fields, function(item) {
                    if (!item) {
                        return;
                    }
                    item.updateOptions(arr);
                });
            } else {
                this.addFields();
                this.addNum++;
            }
        },
        addFields(data) {
            if (typeof this.num === 'undefined') {
                this.num = 0;
            }
            let itemData = {
                entityId: this.entityId,
                num: this.num,
                obj: this.model.get('obj')
            };
            if (data) {
                itemData.data = data;
            }
            let arr = this.setOptions();
            if (arr.length) {
                itemData.filterOptions = arr;
            }
            let fileldItem = new FieldsItem(itemData);
            let me = this;
            $('.process-property-item').append(fileldItem.$el);
            fileldItem.on('changeFields', function(value) {
                me.updataFields(value);
            })
            fileldItem.on('renderOptions', function() {
                let arr = me.setOptions();
                //更新options
                _.each(me.fields, function(item) {
                    if (item) {
                        item.updateOptions(arr);
                    }
                });
            });
            //删除数据
            fileldItem.on('delete', function(num) {
                let fieldLists = me.model.get('fieldLists');
                if (fieldLists.updateFieldJson[num]) {
                    fieldLists.updateFieldJson[num] = null;
                }
                me.model.set('fieldLists', fieldLists);
                me.fields[num] = null;
                me.addNum--;
            });
            this.num++;
            this.fields.push(fileldItem);
        },
        updataFields(data) {
            let fieldLists = this.model.get('fieldLists');
            //先搜索原有的字段是否有值，有的话直接替换，没有的话，再push
            if (fieldLists.updateFieldJson[data.num]) {
                if (data.fields) {
                    fieldLists.updateFieldJson[data.num] = data.fields;
                }
            } else {
                if (data.fields) {
                    fieldLists.updateFieldJson[data.num] = data.fields;
                }
            }
            this.model.set('fieldLists', fieldLists);
        },
        setOptions() {
            let arr = [];
            if (this.fields.length) {
                _.each(this.fields, function(item) {
                    if (!item) {
                        return;
                    }
                    let updateField = item.get('updateField');
                    if (updateField && updateField.key) {
                        let key = updateField.key.match(/\$\{(.*?)\}/)[1];
                        arr.push(key);
                    }
                });
            }
            return arr;
        },
        handleActivityChange() {

        }
    });
    module.exports = FieldView;
});