/**
 * Created by huojing on 2017-06-26s
 */
define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./nodetrigger-html');

    const TriggerView = BaseView.extend({
        template: template,
        initialize(options) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);

            let data = options.data;
            this.curNode = options.curNode;
            this.model.set('triggerData', data);
            this.errorNum = {
                name: 0,
                conditions: 0
            };
            //有条件的话需要进行右侧渲染
            let curNodeData = this.getConditonData();
            if (curNodeData && curNodeData.condition) {
                this.renderConDedition(curNodeData.condition);
            }
            this.renderInput();
        },
        events: {
            'click .title-edit-btn': 'renderCondition'
        },
        renderInput() {
            let me = this;
            let triggerData = me.model.get('triggerData');
            let value = '';
            let tmp = _.findWhere(triggerData.workflow.activities, {
                id: me.curNode
            });
            if (tmp) {
                value = tmp.name;
            }
            let data = {
                name: 'name',
                label: $t('条件名称'),
                required: true,
                maxlength: 12,
                type: 'text',
                value: value
            };
            //选择客户
            let inputObj = new PaasUI.field.text({
                model: new Backbone.Model(data)
            });
            inputObj.on('change', function(model) {
                let val = model.get('value');
                _.each(triggerData.workflow.activities, function(item) {
                    if (item.id == me.curNode) {
                        item.name = val;
                    }
                });
                me.model.set('triggerData', triggerData);
                me.trigger('saveTriiger', triggerData);
                me.trigger('saveDescript', val);
                if (!val) {
                    me.errorNum.name = 1;
                } else {
                    me.errorNum.name = 0;
                }
                me.addErrorElement();
            });
            this.find('.trigger-info').append(inputObj.$el);
        },
        renderConDedition(condition) {
            let me = this;
            if (!condition || !condition.conditions || !condition.conditions.length) {
                me.$el.find('.no-condition').show();
                me.$el.find('.title-edit-btn').html($t('添加'));
                me.$el.find('.process-trigger-content').html('');
                me.errorNum.conditions = 0;
                me.addErrorElement();
                return;
            }
            let conditionLabel = new PaasUI.filterAnalyze({
                model: new Backbone.Model({
                    fromApp: 'workprocess',
                    fromModule: 'branch',
                    originalConditions: condition,
                    apiName: me.model.get('triggerData').entityId,
                })
            });
            me.$el.find('.process-trigger-content').html(conditionLabel.$el);
            me.$el.find('.no-condition').hide();
            me.$el.find('.title-edit-btn').html($t('编辑'));
            setTimeout(function() {
                if (me.$el.find('.process-trigger-content .error-msg').length > 0) {
                    me.errorNum.conditions = 1;
                } else {
                    me.errorNum.conditions = 0;
                }
                me.addErrorElement();
            }, 200);
        },
        addErrorElement() {
            let me = this;
            let ele = me.$el.find('.process-trigger-content');
            if (me.errorNum.conditions > 0 || me.errorNum.name > 0) {
                if (!ele.hasClass('error-action')) {
                    ele.addClass('error-action');
                }
            } else if (ele.hasClass('error-action')) {
                ele.removeClass('error-action');
            }
            setTimeout(function() {
                me.trigger('changeError');
            }, 50);
        },
        getConditonData() {
            let data = this.model.get('triggerData');
            let node = _.findWhere(data.workflow.activities, {
                id: this.curNode
            });
            let conditionTransLine;
            if (node) {
                conditionTransLine = _.filter(data.workflow.transitions, function(item) {
                    if (item.fromId == node.id && node.defaultTransitionId != item.id) {
                        return true;
                    }
                });
                this.curTransId = conditionTransLine[0].id;
            }
            return conditionTransLine[0];
        },
        setConditionData(data) {
            let me = this;
            if (!this.curTransId) {
                this.getConditonData();
            }
            let workflowData = me.model.get('triggerData');
            _.each(workflowData.workflow.transitions, function(item) {
                if (item.id == me.curTransId) {
                    item.condition = data;
                }
            });
            let num = 0;
            if (data && data.conditions && data.conditions.length) {
                num = data.conditions.length;
            }
            me.model.set('triggerData', workflowData);
            me.trigger('saveTriiger', workflowData, num);
        },
        renderCondition(e) {
            e && e.stopPropagation();
            let me = this;
            let curNodeData = this.getConditonData();
            let data = {};
            if (curNodeData && curNodeData.condition) {
                data = curNodeData.condition;
            }
            let condition = new PaasUI.TriggerCondition({
                model: new Backbone.Model({
                    fromApp: 'workprocess',
                    fromModule: 'branch',
                    originalConditions: data,
                    apiName: me.model.get('triggerData').entityId,
                })
            });
            condition.on('update', function(data) {
                me.renderConDedition(data);
                me.setConditionData(data);
            });
        }
    });
    module.exports = TriggerView;
});