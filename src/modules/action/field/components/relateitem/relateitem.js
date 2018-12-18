define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    const template = require('./relateitem-html');

    const relateItem = BaseView.extend({
        initialize(options = {}) {
            BaseView.prototype.initialize.call(this, options);
            this.entityId = options.entityId;
            this.num = options.num;
            if (options.filterOptions) {
                this.filterOptions = options.filterOptions;
            }

            this.model.set('obj', options.obj);
            if (options.data) {
                this.model.set('updateField', options.data);
            }

            let html = template();
            this.$el.append(html);
            this.renderSelect();
        },
        events: {
            'click .config-field-link': 'setFormulaField',
            'click .relate-del': 'delVariables'
        },
        delVariables(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            this.$el.find('.relate-field').remove();
            this.trigger('delete', this.num); //减数据
            this.trigger('renderOptions');
        },
        setFormulaField(e) {
            e.preventDefault();

            if (this.formulaView) {
                this.formulaView.destroy();
            }
            let me = this;
            let fieldData = this.get('fieldData');
            let updateField = this.model.get('updateField');
            let defaultToZero = updateField.defaultValue === 0 ? 2 : 1;
            let key = updateField.key.match(/\$\{(.*?)\}/)[1];
            let arrKey = key.split('.');

            //let entityId = '';
            let relateObjId = '';
            if (arrKey && arrKey.length == 3) {
                relateObjId = arrKey[1];
                /*
                let res = _.findWhere(this.get('obj').refObjectDescribeList, {
                    fieldApiName: arrKey[1]
                });
                if (res) {
                    entityId = res.objectDescribe.api_name;
                } else {
                    entityId = this.entityId;
                }
                */
            } else {
                //entityId = this.entityId;
            }
            let fieldName = fieldData.api_name;
            let select = {
                type: fieldData.type,
                entityId: this.entityId,
                fieldName: fieldName,
                expression: updateField.value,
                relateObjId: relateObjId,
                objName: this.get('obj').objectDescribe.display_name,
                fromAction: 'field',
                defaultToZero: defaultToZero
            };
            if (['date_time', 'date', 'time'].indexOf(fieldData.type) > -1 && /^[-|\d]\d+$/.test(select.expression)) {
                select.expression = '';
            }
            this.formulaView = new PaasUI.formula({
                model: new Backbone.Model(select)
            });
            this.formulaView.on('change', function(e) {
                let value = e.value;
                if (!value) {
                    return;
                }

                //处理"默认为空"
                let updateField = me.model.get('updateField');
                updateField.defaultValue = e.defaultToZero == 2 ? 0 : null;

                //处理value中的乘除
                value = value.replace('×', '*').replace('÷', '/');
                me.formulaView.hide();
                me.rightFields.setValue(e.label, value);
            });
        },
        renderSelect() {
            let me = this;
            PaasUI.utils.getObjectDescribeList(me.model.get('obj'), {
                filterType: 'updateFields'
            }).then(function(objectDescribeList) {
                me.model.get('fields') || me.model.set('fields', objectDescribeList);
                let filterOptions = me.filterOptions;
                //新建时，过滤数据
                if (filterOptions && filterOptions.length) {
                    _.each(objectDescribeList, function(item) {
                        let fields = [];
                        _.each(item.fields, function(item1) {
                            let temp = item.api_name + '.' + item1.api_name;
                            if (filterOptions.indexOf(temp) == -1) {
                                fields.push(item1);
                            }
                        });
                        item.fields = fields;
                    });
                }
                me.renderLeftSelect(objectDescribeList);
            });
        },
        updateOptions(arr) {
            this.filterOptions = arr;
            this.selector.renderOptions(arr);
        },
        renderLeftSelect(variables) {
            let me = this;
            let isActive = 0; //1为禁用，2为删除

            let updateField = me.model.get('updateField');
            let label = '';
            let key = '';
            if (updateField) {
                key = updateField.key.match(/\$\{(.*?)\}/)[1];
                me.handleActivityChange(key, 1);

                let tmp = PaasUI.utils.searchField(key, me.model.get('obj'));
                if (tmp) {
                    if (tmp.is_active == false) {
                        isActive = 1;
                    }
                    label = PaasUI.utils.getFieldLabel(key, tmp, me.model.get('obj'));
                } else {
                    isActive = 2;
                    let t = key.split('.');
                    label = t[t.length - 1];
                }
                //判断关联对象字段是否被禁用
                let arrKey = key.split('.');
                let relateField;
                if (arrKey.length > 2) {
                    relateField = PaasUI.utils.searchField(arrKey[0] + '.' + arrKey[1], me.model.get('obj'));
                }
                if (relateField && relateField.is_active == false) {
                    isActive = 3;
                }
            }

            let model = new Backbone.Model({
                value: key,
                label: label,
                variables: variables,
                isActive: isActive
            });
            let selector = new PaasUI.optionfield({
                model: model
            });

            this.find('.relate-field-select').append(selector.$el);
            selector.on('change', function(model) {
                let val = model.get('value');
                if (val == '-1' || !val) {
                    me.resetFieldData();
                    return;
                }
                let fieldName = me.entityId + '.' + val;
                if (!me.checkCountry(fieldName)) {
                    me.selector.reset();
                    return;
                }
                me.model.set('updateField', {
                    isCalculate: false,
                    key: '${' + fieldName + '}',
                    value: '',
                    defaultValue: ''
                });
                me.trigger('renderOptions');
                me.handleActivityChange(fieldName);
            });
            this.selector = selector;
        },
        checkCountry(fieldName) {
            let me = this;
            let fieldData = PaasUI.utils.searchField(fieldName, me.model.get('obj'));
            if (!fieldData || !fieldData.cascade_parent_api_name) {
                return true;
            }
            let arr = fieldName.split('.');
            let newFieldName = '';
            if (arr.length == 2) {
                newFieldName = arr[0] + '.' + fieldData.cascade_parent_api_name;
            } else if (arr.length == 3) {
                newFieldName = arr[0] + '.' + arr[1] + '.' + fieldData.cascade_parent_api_name;
            }

            let ok = false;
            if (this.filterOptions) {
                _.each(this.filterOptions, function(item) {
                    if (item == newFieldName) {
                        ok = true;
                    }
                });
            }

            let fieldDataParent = PaasUI.utils.searchField(newFieldName, me.model.get('obj'));
            if (!ok) {
                //me.showTips(`${$t("字段")}${fieldData.label}的上级字段${fieldDataParent.label}没有填写完整`);
                me.showTips($t('字段“{{fieldData.label}}”的上级字段“{{fieldDataParent.label}}”没有填写完整)', {
                    data: {
                        fieldData,
                        fieldDataParent
                    }
                }));
                return false;
            } else {
                return true;
            }
        },
        showTips(content) {
            let btns = [{
                action: 'confirm',
                label: $t('确定')
            }];
            let dialog = new Dialog({
                title: $t('提示'),
                height: 60,
                btns: btns,
                content: content,
                zIndex: 2001
            });
            dialog.show();
            return dialog;
        },
        resetFieldData() {
            let value;
            let readonly = true;
            if (this.model.get('updateField').value) {
                value = this.model.get('updateField').value;
                readonly = false;
            }
            if (_.isArray(value)) {
                value = value.join($t('，'));
            }
            let selectData = {
                name: value,
                value: value,
                label: value,
                type: 'text',
                readonly: readonly,
                required: true
            };
            let model = new Backbone.Model(selectData);
            // let fields = new Fields['text']({
            //     model: model
            // });
            let fields = new PaasUI.field.text({
                model: model
            });
            this.$el.find('.relate-update-select').html(fields.$el);
        },
        validate() {
            //判断左侧
            let res = false;
            if (this.selector) {
                if (this.selector.validate()) {
                    res = true;
                    if (this.rightFields) {
                        let m = this.rightFields.validate();
                        if (m) {
                            res = true;
                        } else {
                            res = false;
                        }
                    } else {
                        res = true;
                    }
                    //判断右侧
                    /*
                    if (!this.activeRichText) {

                    } else {
                        res = true;
                    }*/
                } else {
                    res = false;
                }
            }
            //判断依赖关系
            let fieldName = this.entityId + '.' + this.selector.get('value');
            if (!this.checkCountry(fieldName)) {
                res = false;
            }
            return res;
        },
        handleActivityChange(fieldName, type) {
            let me = this;
            let fieldData = PaasUI.utils.searchField(fieldName, me.model.get('obj'));
            let curValue = '';
            let displayName = '';
            let updateField = me.model.get('updateField');
            if (updateField && type) {
                curValue = updateField.value;
            }
            me.model.set('fieldData', fieldData);
            if (typeof fieldData == 'undefined' || !fieldData) {
                me.resetFieldData();
                return;
            } else if (['number', 'currency', 'formula', 'date_time', 'time', 'date'].indexOf(fieldData.type) > -1) {
                if (curValue && typeof curValue === 'string' && curValue.indexOf('${') > -1) {
                    //let varArr = PaasUI.utils.replaceRichText(curValue, this.model.get('obj'), fieldData);
                    displayName = PaasUI.utils.replaceRichTextV2Async({
                        content: curValue,
                        objAndRefObjList: this.model.get('obj')
                    }).content;
                } else {
                    displayName = curValue;
                }
                if (!type) {
                    let updateField = me.model.get('updateField');
                    updateField.isCalculate = true;
                    me.model.set('updateField', updateField);
                }
                me.$el.find('.config-field-link').css('display', 'block');
            } else {
                me.$el.find('.config-field-link').css('display', 'none');
            }

            let fileType = fieldData.type;
            if (curValue === '' && fileType == 'true_or_false') {
                curValue = '-1';
            }
            if (fieldData.api_name == 'email') {
                fileType = fieldData.api_name;
            } else if (fieldData.api_name == 'mobile') {
                fileType = 'phone_number';
            }
            if (['number', 'currency', 'formula'].indexOf(fileType) > -1) {
                fileType = 'default';
            }
            if (fileType == 'long_text') {
                fileType = 'text';
            }
            if (fileType == 'true_or_false') {
                fileType = 'boolean';
            }
            let selectData = {
                name: fieldData.api_name,
                value: curValue,
                label: displayName,
                type: fileType,
                options: fieldData.options,
                readonly: false,
                required: true
            };
            if (['employee', 'department'].indexOf(fileType) > -1) {
                selectData.singleselect = true;
                selectData.isCompany = true;
            }

            let model = new Backbone.Model(selectData);
            this.rightFields = new PaasUI.field[fileType]({
                model: model
            });
            this.rightFields.on('change', function(model) {
                let value = model.get('value');
                let updateField = me.model.get('updateField');
                updateField.value = value;
                me.model.set('updateField', updateField);
                me.trigger('changeFields', {
                    fields: updateField,
                    num: me.num
                });
            });
            this.find('.relate-update-select').html(this.rightFields.$el);
        }
    })
    module.exports = relateItem;
});