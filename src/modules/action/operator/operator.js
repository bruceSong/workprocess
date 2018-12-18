/**
 * Created by huojing on 2017-06-28
 */
define(function(require, exports, module) {
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    //const Select = require('paas-workprocess-modules/common/field/select/select');
    const template = require('./operator-html');
    const Clues = require('./components/clues/clues');
    const utils = require('base-modules/utils');
    //const VariablesData = require('paas-workprocess-assets/data/vardata');

    const operatorView = Dialog.extend({
        initialize(options = {}) {
            options.title = $t('数据操作');
            options.width = 660;
            options.height = 350;
            Dialog.prototype.initialize.call(this, options);

            this.entityId = this.get('entityId');
            this.num = this.get('num');
            let data = this.get('data');
            if (!data) {
                data = {
                    taskType: "trigger_operation",
                    triggerParam: {
                        actionCode: '',
                        actionName: '',
                        belongTo: '',
                        unBelongTo: ''
                    }
                };
            }
            this.model.set('operatorData', data);
            this.model.set('seasList', []);

            this.dataLabel = $t('线索池');
            if (this.entityId == 'AccountObj') {
                this.dataLabel = $t('公海');
            }
        },
        events: {
            'click .b-g-btn': 'handleBtnClick',
            'click .bpm-dislog-close': 'hide'
        },
        show() {
            let $elem = $(template({
                data: {
                    dataLabel: this.dataLabel
                }
            }));
            this.find('.bpm-dialog-bd').empty().append($elem).css({
                overflow: 'visible'
            });
            Dialog.prototype.show.call(this);
            this.renderSelector();
            let operatorData = this.model.get('operatorData');
            this.selectorHight(operatorData.triggerParam.actionCode);
        },

        bindEvents() {
            this.on('ensure', this.handleEnsure);
        },
        handleEnsure() {
            let type = this.selector.get('value');
            let dSelect = this.selector.validate();
            let ok = true;
            if (!dSelect) {
                return;
            }
            if (type == 'Return') {
                if (this.clues1.get('type') == 1 && !this.clues1.validate() || (this.clues2.get('type') == 1 && !this.clues2.validate())) {
                    ok = false;
                }
                if (this.resSelector && !this.resSelector.validate()) {
                    ok = false;
                }
            }
            if (type == 'Move') {
                if (!this.seaSelector.validate()) {
                    ok = false;
                }
            }
            if (ok) {
                this.trigger('render', this.model.get('operatorData'), this.num);
            }
        },
        renderSelector() {
            let me = this;
            let fieldValue = '';
            let operatorData = this.model.get('operatorData');
            if (operatorData.triggerParam && operatorData.triggerParam.actionCode) {
                fieldValue = operatorData.triggerParam.actionCode;
            }
            let OperationList = [{
                label: $t('退回'),
                value: 'Return'
            }, {
                label: $t('转移'),
                value: 'Move'
            }];
            let selectData = {
                name: "selector",
                value: fieldValue,
                label: '',
                type: 'select_one',
                options: OperationList,
                readonly: false,
                required: true
            };
            let model = new Backbone.Model(selectData);
            let selector = new PaasUI.field.select({
                model: model
            });
            this.find('.wk-action-selector').append(selector.$el);
            selector.on('change', function(model) {
                if (model.get('value') != '-1') {
                    me.selector.$el.find('.error-msg').hide();
                }

                let operatorData = me.model.get('operatorData');
                operatorData.triggerParam = {
                    actionCode: model.get('value'),
                    actionName: model.get('label') + me.dataLabel,
                    belongTo: '',
                    unBelongTo: ''
                };
                me.selectorHight(model.get('value'));
                me.model.set('operatorData', operatorData);
            });
            this.selector = selector;
        },
        selectorHight(value) {
            let me = this;
            if (value == 'Return') {
                me.renderClues();
                me.find('.wk-back-con').show();
                me.find('.wk-sea-con').hide();
                me.fetchReason();
            } else if (value == 'Move') {
                me.find('.wk-back-con').hide();
                me.find('.wk-sea-con').show();
                me.fetchSeas();
            }
        },
        fetchSeas() {
            let seasList = this.model.get('seasList');
            if (seasList.length) {
                this.renderSeas();
                return;
            }
            let url = '/EM1HCRM/HighSeas/GetAllHighSeasList';
            if (this.entityId == 'LeadsObj') {
                url = '/EM1HCRM/SalesCluePool/GetSalesCluePoolShortInfo';
            }
            let me = this;
            utils.FHHApi({
                url: url,
                data: {},
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        let cluesList = [];
                        if (me.entityId == 'LeadsObj') {
                            _.each(res.Value.SalesCluePoolShortInfoList, function(item) {
                                cluesList.push({
                                    label: item.Name,
                                    value: item.SalesCulePoolID
                                });
                            });
                        } else {
                            _.each(res.Value.HighSeasList, function(item) {
                                cluesList.push({
                                    label: item.Name,
                                    value: item.HighSeasID
                                });
                            });
                        }
                        me.model.set('seasList', cluesList);
                        me.renderSeas();
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        //绘制公海
        renderSeas() {
            let me = this;
            let fieldValue = '';
            let operatorData = this.model.get('operatorData');
            if (operatorData.triggerParam && operatorData.triggerParam.belongTo) {
                fieldValue = operatorData.triggerParam.belongTo;
            }
            let seasList = this.model.get('seasList');
            let selectData = {
                name: "selector",
                value: fieldValue,
                label: this.dataLabel,
                type: 'select_one',
                options: seasList,
                readonly: false,
                useSearch: true,
                required: true
            };
            let model = new Backbone.Model(selectData);
            let selector = new PaasUI.field.select({
                model: model
            });
            this.find('.wk-sea-selector').html(selector.$el);
            selector.on('change', function(model) {
                let operatorData = me.model.get('operatorData');
                operatorData.triggerParam.belongTo = model.get('value');
                me.model.set('operatorData', operatorData);
            });
            this.seaSelector = selector;
        },
        fetchReason() {
            //选择退回原因
            let me = this;
            PaasUI.utils.api.fetchDescribe({
                apiName: me.entityId,
                success(data) {
                    let backReason = data.objectDescribe.fields['back_reason'];
                    if (backReason && backReason.is_active !== false) {
                        let reasonList = backReason.options;
                        let value = me.model.get('operatorData').triggerParam.reason;
                        if (typeof value == 'undefined') {
                            value = '';
                        }
                        let required = typeof backReason.is_required == 'undefined' ? false : backReason.is_required;
                        let resSelectData = {
                            name: "selector",
                            value: value,
                            label: $t('退回原因'),
                            type: 'select_one',
                            options: reasonList,
                            readonly: false,
                            required: required
                        };
                        me.resSelector = new PaasUI.field.select({
                            model: new Backbone.Model(resSelectData)
                        });
                        me.$el.find('.back-result-con').html(me.resSelector.$el);
                        me.resSelector.on('change', function(model) {
                            if (model.get('value') != '-1') {
                                me.selector.$el.find('.error-msg').hide();
                            }
                            let operatorData = me.model.get('operatorData');
                            operatorData.triggerParam.reason = model.get('value');
                            me.model.set('operatorData', operatorData);
                        });
                    } else {
                        me.$el.find('.back-list').hide();
                    }
                }
            });
            // PaasUI.utils.fetchFieldData(me.entityId, function(data) {
            //     let backReason = data.objectDescribe.fields['back_reason'];
            //     if (backReason && backReason.is_active !== false) {
            //         let reasonList = backReason.options;
            //         let value = me.model.get('operatorData').triggerParam.reason;
            //         if (typeof value == 'undefined') {
            //             value = '';
            //         }
            //         let required = typeof backReason.is_required == 'undefined' ? false : backReason.is_required;
            //         let resSelectData = {
            //             name: "selector",
            //             value: value,
            //             label: $t('退回原因'),
            //             type: 'select_one',
            //             options: reasonList,
            //             readonly: false,
            //             required: required
            //         };
            //         me.resSelector = new PaasUI.field.select({
            //             model: new Backbone.Model(resSelectData)
            //         });
            //         me.$el.find('.back-result-con').html(me.resSelector.$el);
            //         me.resSelector.on('change', function(model) {
            //             if (model.get('value') != '-1') {
            //                 me.selector.$el.find('.error-msg').hide();
            //             }
            //             let operatorData = me.model.get('operatorData');
            //             operatorData.triggerParam.reason = model.get('value');
            //             me.model.set('operatorData', operatorData);
            //         });
            //     } else {
            //         me.$el.find('.back-list').hide();
            //     }
            // });
        },
        //绘制线索池
        renderClues() {
            let operatorData = this.model.get('operatorData');
            let fieldValue = '';
            let fieldValue1 = '';
            let type1 = 0;
            let type2 = 0;
            if (operatorData.triggerParam && operatorData.triggerParam.belongTo) {
                fieldValue = operatorData.triggerParam.belongTo;
                type1 = 1;
            }
            if (operatorData.triggerParam && operatorData.triggerParam.unBelongTo) {
                fieldValue1 = operatorData.triggerParam.unBelongTo;
                type2 = 1;
            }
            let clues1 = new Clues({
                type: type1,
                belongTo: fieldValue,
                entityId: this.entityId
            });
            let me = this;
            clues1.on('change', function(value) {
                let operatorData1 = me.model.get('operatorData');
                operatorData1.triggerParam.belongTo = value;
                me.model.set('operatorData', operatorData1);
            });
            this.find('.has-data-con').html(clues1.$el);
            this.clues1 = clues1;

            let clues2 = new Clues({
                type: type2,
                entityId: this.entityId,
                belongTo: fieldValue1,
                isTxt: 1
            });
            clues2.on('change', function(value) {
                let operatorData1 = me.model.get('operatorData');
                operatorData1.triggerParam.unBelongTo = value;
                me.model.set('operatorData', operatorData1);
            });
            this.clues2 = clues2;
            this.find('.no-data-con').html(clues2.$el);
        }
    });

    module.exports = operatorView;
});