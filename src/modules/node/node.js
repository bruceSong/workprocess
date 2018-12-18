/**
 * Created by huojing on 2017-06-28
 */

define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./node-html');

    const TriggerView = require('./components/nodetrigger/nodetrigger.js');
    const ActionView = require('./components/nodeaction/nodeaction.js');
    const CRM = window.CRM || {};

    const NodeView = BaseView.extend({
        initialize(options) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);
            //var workflowData = this.model.attributes;
            //this.model.set('workflowData', workflowData);
            this.num = options.num;
            this.emailSender = options.emailSender;
            this.cavasGates = []; //网关数组
            this.cavasLins = []; //线数组
            this.getGateList();
            this.nodeEnd = 0; //结束是否匹配下一条件
            //渲染
            let _html = template({
                cavasGates: this.cavasGates,
                cavasLins: this.cavasLins,
                num: this.num
            });
            this.$el.addClass('cavase-node-con');
            this.$el.html(_html);
            this.bindEvent();

            setTimeout(function() {
                //是否匹配到下一条件列表—显隐
                $('.node-select-list').each(function(index) {
                    if (index < $('.node-select-list').length - 1) {
                        $(this).attr('on', 1);
                    } else {
                        $(this).attr('on', 0);
                    }
                });
            }, 10);

        },
        events: {
            'click .wf-rhomb': 'renderRhomb',
            'click .wf-square': 'renderSquare'
        },
        bindEvent() {
            let me = this;
            this.$el.find('.wf-end-node-circle').on('hover', function() {
                let selectList = me.find('.node-select-list');
                if (parseInt(selectList.attr('on'))) {
                    me.find('.node-select-list').toggle();
                }
            });
            //点击展开下一节点
            this.$el.find('.select-ul a').on('click', function(e) {
                e.preventDefault();
                if ($(this).hasClass('current')) {
                    return;
                }
                let parent = $(e.target).parents('.cavase-node-con');
                let em = parent.find('.wf-end-node-circle').find('em');
                let txt = $.trim(em.html());
                //取消前面2个节点的状态
                me.$el.find('.select-ul a').removeClass('current');
                this.className = 'current';

                //取消
                if (txt == $t('匹配下一条件')) {
                    if (me.unrelateNextNode(parent)) {
                        me.find('.wf-end-node-circle').removeClass('next-icon');
                        me.find('.wf-end-node-circle').find('em').html($t('结束'));
                    }
                } else if (txt == $t('结束')) {
                    if (me.relateNextNode(parent)) {
                        me.find('.wf-end-node-circle').addClass('next-icon');
                        me.find('.wf-end-node-circle').find('em').html($t('匹配下一条件'));

                        CRM.util.uploadLog && CRM.util.uploadLog('s-Workflow', 'setting', {
                            operationId: 'Match-the-next-condition',
                            eventType: 'cl'
                        });

                    }
                }
            });
        },
        relateNextNode(target) {
            let nodeEndId = $('.wf-end-node-circle', target).attr('id');
            let nodeGatewayId = $('.wf-rhomb', target).attr('id');
            //let nodeActionId = $('.wf-square', target).attr('id');
            let nodeLineNextId = $($('.wf-horizontal-line', target)[1]).attr('id');
            let triggerData = this.model.attributes;
            let tmp = _.filter(triggerData.workflow.transitions, function(item) {
                let toTmp = _.findWhere(triggerData.workflow.activities, {
                    id: item.toId
                });
                if (item.fromId == nodeGatewayId && toTmp && toTmp.type != 'executionTask') {
                    return true;
                }
            });
            //删除节点
            triggerData.workflow.activities = _.filter(triggerData.workflow.activities, function(item) {
                return item.id != nodeEndId;
            });
            //更改线
            _.each(triggerData.workflow.transitions, function(item) {
                if (item.id == nodeLineNextId) {
                    item.toId = tmp[0].toId;
                }
            });
            this.model.attributes = triggerData;
            this.trigger('updateData', triggerData);
            return true;
        },
        unrelateNextNode(target) {
            let nodeEndId = $('.wf-end-node-circle', target).attr('id');
            let nodeLineNextId = $($('.wf-horizontal-line', target)[1]).attr('id');
            let triggerData = this.model.attributes;
            triggerData.workflow.activities.push({
                type: "endEvent",
                id: nodeEndId
            });
            _.each(triggerData.workflow.transitions, function(item) {
                if (item.id == nodeLineNextId) {
                    item.toId = nodeEndId;
                }
            });
            this.model.attributes = triggerData;
            this.trigger('updateData', triggerData);
            return true;
        },
        renderRhomb(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            let me = this;
            let data = this.model.attributes;
            let target = $(e.target);
            if (!target.hasClass('wf-rhomb')) {
                target = target.parents('.wf-rhomb');
            }
            if (target.hasClass('current')) {
                //target.addClass('current');
                //this.showRightCon();
                return;
            }

            me.trigger('updateState');
            //me.updateState();
            target.addClass('current');

            let id = target.attr('id') ? target.attr('id') : target.parent().attr('id');
            let trigger = new TriggerView({
                data: data,
                curNode: id,
            });
            //更新description字段
            trigger.on('saveDescript', function(value) {
                target.find('em strong').text(value);
            });
            trigger.on('saveTriiger', function(value) {
                me.model.attributes = value;
                /*
                if (num > 0) {
                    target.removeClass('error-node');
                }*/
                me.trigger('updateData', value);
            });
            trigger.on('changeError', function() {
                let length = this.$el.find('.error-action').length;
                if (length) {
                    if (!target.hasClass('error-node')) {
                        target.addClass('error-node');
                    }
                } else {
                    if (target.hasClass('error-node')) {
                        target.removeClass('error-node');
                    }
                }
            });
            $('.canvas-right').empty().append(trigger.$el);
            this.showRightCon();
        },
        renderSquare(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            let me = this;
            let data = this.model.attributes;
            let target = $(e.target);
            if (!target.hasClass('wf-square')) {
                target = target.parents('.wf-square');
            }
            if (target.hasClass('current')) {
                return;
            }
            //$('.wf-square').removeClass('current');
            me.trigger('updateState');
            target.addClass('current');
            target.hasClass('error-node') && target.removeClass('error-node');

            let id = target.attr('id') ? target.attr('id') : target.parent().attr('id');
            let action = new ActionView({
                curNode: id,
                emailSender: me.emailSender,
                data: data
            });
            action.on('saveAction', function(value, num) {
                me.model.attributes = value;
                let element = target.find('i');
                if (num > 0) {
                    if (element.length) {
                        element.html(num);
                    } else {
                        target.append('<i>' + num + '</i>');
                    }
                    //隐藏错误标签
                    if (!this.$el.find('.error-action').length) {
                        if (target.hasClass('error-node')) {
                            target.removeClass('error-node');
                        }
                    }
                } else {
                    element && element.remove();
                }
                me.trigger('updateData', value);
            });
            action.on('changeError', function() {
                let length = this.$el.find('.error-action').length;
                if (length) {
                    if (!target.hasClass('error-node')) {
                        target.addClass('error-node');
                    }
                } else {
                    if (target.hasClass('error-node')) {
                        target.removeClass('error-node');
                    }
                }
            });
            $('.canvas-right').empty().append(action.$el);
            this.showRightCon();
        },
        showRightCon() {
            //$('.canvas-right-con').show();
            if ($('.canvas-right-con').hasClass('ani-second')) {
                $('.canvas-right-con').removeClass('ani-second');
            }
            if (!$('.canvas-right-con').hasClass('ani-first')) {
                $('.canvas-right-con').addClass('ani-first');
            }
        },
        getGateList() {
            let me = this;
            let triggerData = this.model.attributes;
            let gateLists = _.findWhere(triggerData.workflow.activities, {
                id: 'nodeGateway' + this.num
            });
            if (gateLists) {
                me.cavasGates[0] = [];
                me.cavasGates[0].push(gateLists);
                let tmp = _.findWhere(triggerData.workflow.transitions, {
                    id: gateLists.defaultTransitionId
                });
                if (tmp) {
                    me.cavasLins.push(tmp);
                }
                me.getTransList(gateLists.id, 0, 1);
            } else {
                return false;
            }
        },
        //获取对应的线
        getTransList(id, index, type) {
            let triggerData = this.model.attributes;
            let transitions = triggerData.workflow.transitions;
            let temp = _.filter(transitions, function(item) {
                let m;
                if (type == 1) {
                    m = (item.fromId == id && item.condition);
                } else {
                    m = (item.fromId == id);
                }
                if (m) {
                    return true;
                } else {
                    return false;
                }
            });
            if (temp.length == 1) {
                this.cavasGates[index].push(temp[0]);
                if (temp[0].toId.indexOf('nodeGateway') == -1) {
                    this.getNodeList(temp[0].toId, index);
                }
                return temp[0];
            } else {
                return false;
            }
        },
        //获取节点信息
        getNodeList(id, index) {
            let me = this;
            let triggerData = this.model.attributes;
            let activities = triggerData.workflow.activities;
            let temp = _.findWhere(activities, {
                id: id
            });
            if (temp) {
                this.cavasGates[index].push(temp);
                if (temp.type != 'endEvent') {
                    me.getTransList(temp.id, index);
                }
                return temp;
            } else {
                return false;
            }
        }
    });
    module.exports = NodeView;
});