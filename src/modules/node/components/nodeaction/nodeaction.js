/**
 * Created by huojing on 2017-06-26s
 */
define(function(require, exports, module) {
    const utils = require('base-modules/utils');
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('paas-workprocess-modules/node/components/nodeaction/nodeaction-html');
    const Card = require('paas-workprocess-modules/common/card/card');
    const Actionlist = require('paas-workprocess-modules/node/components/nodeaction/actionlist');
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    const CRM = window.CRM || {};

    const ActionView = BaseView.extend({
        initialize(options) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);

            let data = options.data;
            me.model.set('triggerData', data);
            me.curNode = options.curNode;
            //me.actionNum = 0;
            me.actionList = {};
            me.emailSender = options.emailSender;

            let _html = template({
                data: data
            });
            let $elem = $(_html);
            me.$el.append($elem);

            let tmp = _.findWhere(data.workflow.activities, {
                id: me.curNode
            });
            let itemList = tmp.itemList;
            if ($('#' + me.curNode).hasClass('error-node')) {
                me.$el.find('.no-error-data').show();
                me.$el.find('.no-data').hide();
            }
            let cardData = {
                entityId: data.entityId
            };
            if (tmp && itemList.length) {
                me.actionNum = me.getExecutionLength(itemList);
                cardData.itemList = itemList;
                _.each(itemList, function(item) {
                    me.actionList[item.id] = item;
                });
            }

            me.card = new Card({
                model: new Backbone.Model(cardData)
            });
            me.$el.find('.wk-action-content').append(me.card.$el);
            me.card.on('changeError', function(error) {
                if (error) {
                    me.trigger('changeError');
                }
            });

            //判断是否显示数据操作
            if (!(data.entityId == 'AccountObj' || data.entityId == 'LeadsObj')) {
                this.$el.find('li[data-action="operate"]').remove();
            }
            if (me.actionNum) {
                this.$el.find('.no-error-data').hide();
                this.$el.find('.no-data').hide();
                this.updateActionBtn();
            }
            this.bindEvent();

        },
        events: {
            'click .j-save': 'saveAction',
            'click .j-exit': 'cancelDialog',
            'click .action-close': 'delAction',
            'click .action-edit': 'editActions',
            'click .node-action-add-btn': 'showActionList',
            'click .node-action-add-div li': 'showActions'
        },
        getExecutionLength(itemList) {
            let execuArray = ['updates', 'send_qixin', 'external_message', 'trigger_bpm', 'send_email', 'trigger_operation', 'custom_function', 'feed_sales_record', 'feed_schedule', 'feed_task'];
            let index = 0;
            for (var i in itemList) {
                if (execuArray.indexOf(itemList[i].taskType) > -1) {
                    index++;
                }
            }
            return index;
        },
        showActionList(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            this.find('.node-action-add-div ul').toggle();
        },
        showActions(e) {
            e && e.stopPropagation();
            let ele = $(e.target);
            let action = ele.attr('data-action');
            this.$el.find('.node-action-add-div ul').hide();
            this.ActionCondition(action);
        },
        bindEvent() {
            let me = this;
            $('body').on('click', function(e) {
                if (!$(e.target).parents('.node-action-add-div').length) {
                    me.find('.node-action-add-div ul').hide();
                }
            });
        },
        editActions(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            let target = $(e.target).parent('h3');
            let num = target.attr('num');
            let data = this.getCurData(num);
            this.ActionCondition(target.attr('data-action'), data, num);
        },
        //删除动作
        delAction(e) {
            let me = this;
            e && e.preventDefault();
            e && e.stopPropagation();

            let comfirmView = utils.confirm($t('确认删除该动作？'), $t('提示'));
            comfirmView.on('confirm', () => {
                let $actionCardTitle = $(e.target).parent('h3');
                let num = $actionCardTitle.attr('num');
                let taskType = $actionCardTitle.attr('data-action');
                let nodeClass = 'wk-' + taskType + '-content';
                me.$el.find('li[data-action=' + taskType + ']').css('display', 'block');
                $(e.target).parents('.' + nodeClass).remove(); //节点删除
                me.delData(num);
                comfirmView.destroy();
            });
        },
        delData(num) {
            //数据删除
            let me = this;
            _.each(me.actionList, function(item, key) {
                if (num == item.id) {
                    delete me.actionList[key];
                }
            });
            me.updateData();
            me.trigger('changeError');
        },
        sendLog(action) {
            let operationId;
            switch (action) {
                case 'message':
                    operationId = 'After-SendMessage';
                    break;
                case 'lock':
                    operationId = 'After-Lock';
                    break;
            }
            CRM.util.uploadLog && CRM.util.uploadLog('s-Workflow', 'setting', {
                operationId: operationId,
                eventType: 'cl'
            });
        },
        ActionCondition(action, data, num) {
            let me = this;
            let actionNum = num;
            if (isNaN(parseInt(actionNum))) {
                if (!me.checkActionNum()) {
                    return;
                }
                me.sendLog(action);
                actionNum = utils.uuid();
            }
            if (typeof me.action == 'undefined') {
                me.action = [];
            }
            let m = {
                entityId: me.model.get('triggerData').entityId,
                num: actionNum
            };
            if (data) {
                m.data = data;
            }
            //let fun = action == 'lock' ? PaasUI.actions[action] : Actionlist[action] || PaasUI.actions[action];
            let fun = Actionlist[action] || PaasUI.actions[action];
            me.action[actionNum] = new fun({
                model: new Backbone.Model(m)
            });
            me.action[actionNum].show();
            me.action[actionNum].on('render', function(item, num) {
                if (!item) {
                    return;
                }
                item.id = num;
                me.card.renderActionContent(item, 'edit');
                me.actionList[num] = item;
                me.updateData();
                me.action[actionNum].destroy();
            });
        },
        checkActionNum() {
            let actionList = _.filter(this.actionList, function(item) {
                return item;
            });
            if (actionList.length >= 10) {
                let dialog = new Dialog({
                    title: $t('提示'),
                    height: 40,
                    btns: [{
                        action: 'confirm',
                        label: $t('确定')
                    }],
                    content: $t('最多填加10个后动作')
                });
                dialog.show();
                return false;
            }
            return true;
        },
        updateActionBtn() {
            let me = this;
            _.each(me.actionList, function(item) {
                if (!item) {
                    return;
                }
                let type = '';
                switch (item.taskType) {
                    case 'updates':
                        type = 'field';
                        break;
                    case 'trigger_bpm':
                        type = 'bpm';
                        break;
                    case 'trigger_operation':
                        if (item.triggerParam.actionCode == 'Lock' || item.triggerParam.actionCode == 'Unlock') {
                            type = 'lock';
                        } else if (item.triggerParam.actionCode == 'ChangeOwner') {
                            type = 'manager';
                        } else if (item.triggerParam.actionCode == 'Return' || item.triggerParam.actionCode == 'Move') {
                            type = 'operate';
                        }
                        break;
                }
                me.$el.find('li[data-action="' + type + '"]').css('display', 'none');
            });

        },
        updateData() {
            let me = this;
            me.$el.find('.no-error-data').hide();
            me.actionNum = me.getExecutionLength(me.actionList);

            if (me.actionNum == 0) {
                me.$el.find('.no-data').show();
            } else {
                me.$el.find('.no-data').hide();
            }
            let actionList = [];
            for (var i in me.actionList) {
                actionList.push(me.actionList[i]);
            }

            let triggerData = me.model.get('triggerData');
            _.each(triggerData.workflow.activities, function(item) {
                if (item.id == me.curNode) {
                    item.itemList = actionList;
                }
            });
            me.model.set('triggerData', triggerData);
            me.updateActionBtn();

            me.trigger('saveAction', triggerData, me.actionNum);
        },
        getCurData(num) {
            let result = _.filter(this.actionList, function(item) {
                return item.id == num;
            });
            return result[0];
        }
    });
    module.exports = ActionView;
});