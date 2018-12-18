/**
 * Created by huojing on 2017-06-28
 */
define(function(require, exports, module) {
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    //const Select = require('paas-workprocess-modules/common/field/select/select');
    const utils = require('base-modules/utils');
    const template = require('./bpm-html');

    const bpmView = Dialog.extend({
        initialize(options = {}) {
            options.title = $t('发起业务流程');
            options.width = 660;
            Dialog.prototype.initialize.call(this, options);
            this.entityId = this.get('entityId');
            this.num = this.get('num');
            let data = this.get('data');
            if (!data) {
                data = {
                    taskType: "trigger_bpm",
                    triggerParam: {
                        entityId: this.entityId,
                        id: ''
                    }
                };
            }
            this.model.set('bpmData', data);
        },
        show() {
            let $elem = $(template());
            this.find('.bpm-dialog-bd').empty().append($elem).css({
                overflow: 'visible'
            });
            Dialog.prototype.show.call(this);
            this.fetchData();
        },
        bindEvents() {
            this.on('ensure', this.handleEnsure, this);
        },
        handleEnsure() {
            if (this.selector.validate()) {
                this.trigger('render', this.model.get('bpmData'), this.num);
            }
        },
        renderSelect() {
            let me = this;
            let opts = this.model.get('bpmOptions');
            let value = '';
            let bpmData = this.model.get('bpmData');
            if (bpmData.triggerParam && bpmData.triggerParam.id) {
                value = bpmData.triggerParam.id;
            }
            let selectData1 = {
                name: "selector1",
                value: value,
                label: $t('业务流程'),
                type: 'select_one',
                options: opts,
                readonly: false,
                required: true
            };
            //选择客户
            let selector = new PaasUI.field['select']({
                $el: this.find('.bpm-select-list'),
                model: new Backbone.Model(selectData1)
            });
            selector.on('change', function(item) {
                let bpmData = me.model.get('bpmData');
                bpmData.triggerParam.id = item.get('value');
                bpmData.sourceworkflowName = item.get('optionLabel');
                me.model.set('bpmData', bpmData);
            });
            this.selector = selector;
        },
        fetchData() {
            var selectData = this.model.get('bpmOptions');
            if (selectData) {
                this.renderSelect();
            } else {
                let me = this;
                utils.FHHApi({
                    url: '/EM1HBPM/ProcessDefinition/GetAvailableWorkflows',
                    data: {
                        entryType: this.entityId
                    },
                    success(data) {
                        if (data.Result.StatusCode == 0) {
                            let opts = [];
                            _.each(data.Value.outlines, function(item) {
                                opts.push({
                                    label: item.name,
                                    value: item.id
                                });
                            });
                            me.model.set('bpmOptions', opts);
                            me.renderSelect();
                        }
                    }
                });
            }
        }
    });

    module.exports = bpmView;
});