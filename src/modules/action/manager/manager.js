/**
 * Created by huojing on 2017-06-28
 */
define(function(require, exports, module) {
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    //const Selector = require('paas-workprocess-modules/common/field/selector/selector');
    const template = require('./manager-html');

    const bpmView = Dialog.extend({
        initialize(options = {}) {
            options.title = $t('分配负责人')
            options.width = 660;
            options.height = 280;
            Dialog.prototype.initialize.call(this, options);

            this.entityId = this.get('entityId');
            this.num = this.get('num');
            let data = this.get('data');
            if (!data) {
                data = {
                    taskType: "trigger_operation",
                    triggerParam: {
                        actionCode: 'ChangeOwner',
                        actionName: $t('更换负责人'),
                        candidates: {

                        }
                    }
                };
            }
            this.model.set('managerData', data);
        },
        events: {
            'click .b-g-btn': 'handleBtnClick',
            'click .bpm-dislog-close': 'hide'
        },
        show() {
            let $elem = $(template());
            this.find('.bpm-dialog-bd').empty().append($elem).css({
                overflow: 'visible'
            });
            Dialog.prototype.show.call(this);
            this.renderSelect();
        },
        bindEvents() {
            this.on('ensure', this.handleEnsure, this);
        },
        handleEnsure() {
            let managerData = this.model.get('managerData');
            managerData.triggerParam.candidates = this.selector.get('value');
            this.model.set('managerData', managerData);
            if (this.selector.validate()) {
                this.trigger('render', managerData, this.num);
            }
        },
        renderSelect() {
            let value = '';
            let managerData = this.model.get('managerData');
            if (managerData) {
                value = managerData.triggerParam.candidates;
            }

            let selectData = {
                name: "selector",
                value: value,
                label: $t('负责人'),
                type: 'selector',
                readonly: false,
                required: true,
                selector: ['member', 'group', 'master', 'usergroup']
            };
            let model = new Backbone.Model(selectData);
            this.selector = new PaasUI.field.selector({
                model: model
            });

            this.find('.action-manager-selector').html(this.selector.$el);
        }
    });

    module.exports = bpmView;
});