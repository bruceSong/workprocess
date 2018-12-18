define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    const template = require('./setting-html');
    const utils = require('base-modules/utils');
    const NodeView = require('paas-workprocess-modules/node/node');
    const FlowInfoView = require('paas-workprocess-modules/flowinfo/flowinfo');
    const CRM = window.CRM || {};
    //const VariablesData = require('paas-workprocess-assets/data/vardata');
    //const Functions = require('paas-workprocess-modules/common/base/function');
    //const Mermberutils = require('paas-workprocess-modules/common/utils/utils');

    const FlowSetting = BaseView.extend({
        template: template,
        initialize(options) {
            let me = this;
            me.options = options;
            BaseView.prototype.initialize.call(me, options);
            let flowInfo = this.model.attributes;
            //this.renderFlowInfo(flowInfo);
            if (!flowInfo.workflow) {
                flowInfo.workflow = {
                    activities: [{
                        id: "start",
                        type: "startEvent"
                    }, {
                        type: "endEvent",
                        id: "end"
                    }],
                    variables: [],
                    transitions: [{
                        id: "line0",
                        fromId: "start",
                        toId: "nodeGateway0",
                        serialNumber: 0
                    }]
                };
            }

            let triggerData = {
                name: flowInfo.name,
                description: flowInfo.description,
                sourceWorkflowId: flowInfo.sourceWorkflowId,
                entityId: flowInfo.entityId,
                rule: flowInfo.rule,
                workflow: flowInfo.workflow
            }
            if (flowInfo && flowInfo.id) {
                triggerData.id = flowInfo.id;
            }
            if (flowInfo.scheduleTime) {
                triggerData.scheduleTime = flowInfo.scheduleTime;
            }
            this.model.set('triggerData', triggerData);
            //渲染 node 节点
            this.maxNum = 20;
            this.node = [];
            this.num = 0;
            this.getSener();

            //是否要创建网关节点
            let gatewayList = _.where(this.model.get('triggerData').workflow.activities, {
                type: 'exclusiveGateway'
            });
            if (gatewayList.length == 0) {
                this.initNode();
                this.createNode();
            } else {
                this.gateLists = [];
                this.getLines('start');
                _.each(this.gateLists, function(item) {
                    let num = parseInt(item.toId.replace('nodeGateway', ''));
                    me.createNode(num);
                    if (num >= me.num) {
                        me.num = num + 1;
                    }
                });
            }
            this.dragData = {
                start: 0,
                end: 0
            };
            this.nodeLock = 0;
            this.getFields(this.checkFields);

            //初始化人员选择器中的变量
            PaasUI.utils.selectorDataInit(triggerData.entityId);
        },
        events: {
            'click .j-save': 'saveWorkFlow',
            'click .j-exit': 'cancelDialog',
            'click .node-close': 'delNodeList',
            'click .wf-circle-add': 'addGateNode',
            'hover .canvas-div': 'changeBgColor',
            'dragstart .canvas-div': 'dragStart',
            'dragenter .canvas-div': 'dragEnter',
            'dragend .canvas-div': 'dragEnd',
            'click .canvas-right': 'stopPropagation',
            'click .flow-process': 'toggerRightCon'
        },
        toggerRightCon() {
            let me = this;
            if (me.$el.find('.canvas-right-con').hasClass('ani-first')) {
                me.$el.find('.canvas-right-con').addClass('ani-second')
            }
            me.updateState();
        },
        updateState() {
            let me = this;
            $('.wf-square').each(function() {
                me.validatePerAction($(this).attr('id'));
            });
            me.$el.find('.wf-rhomb').removeClass('current');
            me.$el.find('.wf-square').removeClass('current');
        },
        validatePerAction(taskId) {
            let triggerData = this.model.get('triggerData');
            let actionTmp = _.findWhere(triggerData.workflow.activities, {
                id: taskId
            });
            if (actionTmp) {
                if (!(actionTmp.itemList && actionTmp.itemList.length)) {
                    this.$el.find('#' + taskId).addClass('error-node');
                }
            }
        },
        stopPropagation(e) {
            e && e.stopPropagation();
        },
        getFields(callback) {
            let me = this;
            let triggerData = me.get('triggerData');
            PaasUI.utils.api.fetchDescribe({
                apiName: triggerData.entityId,
                success(res) {
                    let data = utils.deepClone(res);
                    me.model.set('obj', data);
                    let fields = data.objectDescribe.fields;
                    _.each(fields, function(item) {
                        item.value = item.api_name;
                    });
                    me.model.set('fields', fields);
                    callback.apply(me);
                }
            });
            // PaasUI.utils.fetchFieldData(triggerData.entityId, function(res) {
            //     let data = utils.deepClone(res);
            //     me.model.set('obj', data);
            //     let fields = data.objectDescribe.fields;
            //     _.each(fields, function(item) {
            //         item.value = item.api_name;
            //     });
            //     me.model.set('fields', fields);
            //     callback.apply(me);
            // }, 1);
        },
        //判断字段是否存在
        checkFields() {
            let fields = this.model.get('fields');
            let data = this.model.get('triggerData');
            let me = this;
            let res = true;
            fields['@OWNER_MAIN_DEPT_PATH'] = {
                type: 'department',
                api_name: '@OWNER_MAIN_DEPT_PATH',
                label: $t('负责人所在主部门'),
                define_type: 'package',
                is_reuqired: false,
            };
            //判断字段更新
            /*
            _.each(data.workflow.activities, function(item) {
                res = true;
                if (item.itemList && item.itemList.length) {
                    _.each(item.itemList, function(item1) {
                        if (item1.taskType == 'updates') {
                            _.each(item1.updateFieldJson, function(fval) {
                                if (fval) {
                                    let tmp = _.findWhere(fields, {
                                        value: fval.key.split('.')[1]
                                    });
                                    if (tmp) {
                                        if (!tmp.is_active) {
                                            res = false;
                                            return false;
                                        }
                                    } else {
                                        res = false;
                                        return false;
                                    }
                                }
                            });
                        }
                    });
                    if (!res) {
                        if (!me.$el.find('#' + item.id).hasClass('error-node')) {
                            me.$el.find('#' + item.id).addClass('error-node');
                        }
                    }
                }
            });
            */
            //判断条件
            let conditionList = _.filter(data.workflow.transitions, function(item) {
                let fromTmp = _.findWhere(data.workflow.activities, {
                    id: item.fromId
                });
                let toTmp = _.findWhere(data.workflow.activities, {
                    id: item.toId
                });
                if (fromTmp && toTmp && fromTmp.type == 'exclusiveGateway' && toTmp.type == 'executionTask') {
                    return true;
                } else {
                    return false;
                }
            });
            _.each(conditionList, function(item) {
                res = true;
                if (item.condition && item.condition.conditions && item.condition.conditions.length) {
                    _.each(item.condition.conditions, function(item1) {
                        _.each(item1.conditions, function(item2) {
                            if (item2.left.expression) {
                                let tmp = _.findWhere(fields, {
                                    api_name: item2.left.expression
                                });
                                if (tmp) {
                                    if (tmp.is_active == false) {
                                        res = false;
                                        return false;
                                    }
                                } else {
                                    res = false;
                                    return false;
                                }
                            }
                        });
                    });
                }
                if (!res) {
                    if (!me.$el.find('#' + item.fromId).hasClass('error-node')) {
                        me.$el.find('#' + item.fromId).addClass('error-node');
                    }
                }
            });

        },
        getSener() {
            let url = '/EM1HCRMTemplate/workflowEmailSet/getAccountInfo';
            let me = this;
            utils.FHHApi({
                url: url,
                data: {},
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        if (res.Value.status == 5) {
                            me.emailSender = res.Value.account;
                        } else {
                            me.emailSender = null;
                        }
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        //把线按照顺序排列到数据中
        getLines(startId) {
            let triggerData = this.model.get('triggerData');
            let tmp = _.filter(triggerData.workflow.transitions, function(item) {
                let toTmp = _.findWhere(triggerData.workflow.activities, {
                    id: item.toId
                });
                if (item.fromId == startId && toTmp && toTmp.type != 'executionTask') {
                    return true;
                }
            });
            if (tmp.length) {
                if (tmp[0].toId != 'end') {
                    this.gateLists.push(tmp[0]);
                    this.getLines(tmp[0].toId);
                }
            }
        },
        validateData() {
            //判断是否填加一个后动作
            let triggerData = this.model.get('triggerData');
            let actionList = _.filter(triggerData.workflow.activities, function(item) {
                return item.type == "executionTask";
            });
            let me = this;

            let result = false;
            _.each(actionList, function(item) {
                if (!(item.itemList && item.itemList.length)) {
                    me.$el.find('#' + item.id).addClass('error-node');
                    result = true;
                } else if (me.$el.find('#' + item.id).hasClass('error-node')) {
                    result = true;
                }
            });
            //对象是否存在的判断
            /*
            let tmp = _.findWhere(this.model.get('cacheObjList'), {
                value: triggerData.entityId
            });
            if (!tmp) {
                this.showTips({
                    content: '该对象已被删除，不能编辑'
                });
                result = true;
            }
            */
            let conditionList = _.filter(triggerData.workflow.transitions, function(item) {
                let fromTmp = _.findWhere(triggerData.workflow.activities, {
                    id: item.fromId
                });
                let toTmp = _.findWhere(triggerData.workflow.activities, {
                    id: item.toId
                });
                if (fromTmp && toTmp && fromTmp.type == 'exclusiveGateway' && toTmp.type == 'executionTask') {
                    return true;
                } else {
                    return false;
                }
            });
            _.each(conditionList, function(item) {
                if (me.$el.find('#' + item.fromId).hasClass('error-node')) {
                    result = true;
                }
            });
            return result;
        },
        //删除每个节点的数据
        delNodeData(target) {
            let triggerData = this.model.get('triggerData');
            let activities = [];
            let nodeGatewayId = $('.wf-rhomb', target).attr('id');
            let nodeActionId = $('.wf-square', target).attr('id');
            let nodeEndId = $('.wf-end-node-circle', target).attr('id');
            let nodeLineArr = $('.wf-horizontal-line', target);
            let LineId = $('.wf-vertical-line', target).attr('id');
            _.each(triggerData.workflow.activities, function(item) {
                if ([nodeGatewayId, nodeActionId, nodeEndId].indexOf(item.id) == -1) {
                    activities.push(item);
                }
            });
            let variablesId = [];
            let NextNodeId = '';
            let transitions = [];
            _.filter(triggerData.workflow.transitions, function(item) {
                let arrLine = [$(nodeLineArr[0]).attr('id'), $(nodeLineArr[1]).attr('id'), LineId];
                if (item.id == LineId) {
                    NextNodeId = item.toId;
                }
                if (arrLine.indexOf(item.id) > -1) {
                    //查询需要删除的variables
                    if (item.condition && item.condition.conditions) {
                        _.each(item.condition.conditions, function(value1) {
                            _.each(value1.conditions, function(value2) {
                                variablesId.push(value2.left.expression);
                            });
                        });
                    }
                } else {
                    transitions.push(item);
                }
            });
            let act = [];
            let me = this;
            _.each(transitions, function(item) {
                if (item.toId == nodeGatewayId) {
                    if (item.id.indexOf('line') == -1 && NextNodeId == 'end') {
                        //这种类型为配置为下一个节点
                        act = me.resetEnd(item);
                    } else {
                        item.toId = NextNodeId;
                    }
                }
            });
            let variables = [];
            _.each(triggerData.workflow.variables, function(item) {
                if (variablesId.indexOf(item.id) == -1) {
                    variables.push(item);
                }
            });

            triggerData.workflow.activities = activities.concat(act);
            triggerData.workflow.transitions = transitions;
            triggerData.workflow.variables = variables;
            this.model.set('triggerData', triggerData);
        },
        delNodeList(e) {
            e.preventDefault();
            let me = this;
            let target = $(e.target).parents('.canvas-div');
            let nodeAction = $('.wf-square', target);
            let nodeLine = $('.wf-horizontal-line', target);
            let nodeEnd = $('.wf-end-node-circle', target);
            //let num = target.attr('num');
            let triggerData = this.model.get('triggerData');
            let status = 0;
            let tmp = _.findWhere(triggerData.workflow.transitions, {
                id: $(nodeLine[0]).attr('id')
            });
            let tmp1 = _.findWhere(triggerData.workflow.activities, {
                id: nodeAction.attr('id')
            });
            let tmp2 = _.findWhere(triggerData.workflow.transitions, {
                id: $(nodeLine[1]).attr('id')
            });
            let txt = '';
            let txt1 = '';
            if (tmp && tmp.condition && tmp.condition.conditions) {
                txt += $t('该条件');
                status = 1;
                txt1 = $t('并');
            }
            if (tmp1 && tmp1.itemList.length) {
                if (status == 1) {
                    txt += $t('和');
                } else {
                    txt += $t('该');
                }
                txt += $t('立即执行的活动');
                status = 1;
                if (!txt1) {
                    txt1 = $t('并');
                }
            }
            if ((tmp && tmp.condition && tmp.condition.conditions) || (tmp1 && tmp1.itemList.length)) {
                txt += $t('已配置，');
            }
            if (tmp2 && tmp2.toId != nodeEnd.attr('id')) {
                txt1 += $t('已匹配下一条件，');
                status = 1;
            }

            function callback(target) {
                target.parent().remove();
                me.delNodeData(target.parents('.cavase-node-con')); //删除数据
            }

            if (tmp) {
                if (status) {
                    let dialog = this.showTips({
                        btns: [{
                            action: 'ensure',
                            label: $t('确定')
                        }, {
                            action: 'cancel',
                            label: $t('取消')
                        }],
                        content: txt + txt1 + $t('确认删除吗？')
                    });
                    dialog.on('ensure', () => {
                        me.dialog.hide();
                        callback(target);
                    });
                    this.dialog = dialog;
                } else {
                    callback(target);
                }
            } else {
                callback(target);
            }
        },
        changeBgColor(e) {
            let curNode = $(e.target).closest('.canvas-div');
            let length = this.$el.find('.canvas-div').length - 1;
            if (curNode.hasClass('bot-div')) {
                return;
            }
            if (curNode.hasClass('current')) {
                curNode.removeClass('current');
                if (length > 1) {
                    //显示排序和关闭按钮
                    curNode.find('.node-sort').css('display', 'none');
                    curNode.find('.node-close').css('display', 'none');
                }
            } else {
                curNode.addClass('current');
                if (length > 1) {
                    //显示排序和关闭按钮
                    curNode.find('.node-sort').css('display', 'block');
                    curNode.find('.node-close').css('display', 'block');
                }
            }
        },
        dragStart(e) {
            this.nodeLock = 1;
            if (e.originalEvent.clientX > 80 || $('.canvas-div').length <= 2) {
                return false;
            }
            e.originalEvent.dataTransfer.setData("Text", e.target.id);
            let target = $(e.target);
            target.css({
                'opacity': 0.5
            });
            this.dragData.start = target.attr('num');
        },
        dragEnter(e) {
            if (!this.nodeLock) {
                return;
            }
            let target = $(e.target);
            if (!target.hasClass('canvas-div')) {
                target = target.parents('.canvas-div');
            }
            if (target) {
                let num = target.attr('num');
                $('.wf-biaozhun-line').hide();
                if (num) {
                    this.dragData.end = num;
                    target.parent().find('.wf-biaozhun-line').css('display', 'block');
                } else {
                    this.dragData.end = -1;
                    target.find('.wf-biaozhun-line').css('display', 'block');
                }
            }
        },
        dragEnd() {
            this.nodeLock = 0;
            let start = parseInt(this.dragData.start);
            let end = parseInt(this.dragData.end);
            if (start >= 0 && end >= -1) {
                this.swap();
            }
        },
        searchNode(nodeId) {
            let triggerData = this.model.get('triggerData');
            let temp = _.findWhere(triggerData.workflow.activities, {
                id: nodeId
            });
            return temp;
        },
        initNode() {
            let num = this.num;
            let next = parseInt(num) + 1;
            let triggerData = this.model.get('triggerData');
            //更新线的数据
            if (num > 0) {
                _.each(triggerData.workflow.transitions, function(item) {
                    if (item.toId == 'end') {
                        item.toId = 'nodeGateway' + num;
                    }
                });
            }
            let lang_name = $t('条件{{next}}', {
                data: {
                    next
                }
            });
            let lang_num = $t('条件{{num}}', {
                data: {
                    num
                }
            });
            triggerData.workflow.activities.push({
                id: `nodeGateway${num}`,
                name: lang_name,
                description: lang_num,
                defaultTransitionId: "line" + next,
                type: "exclusiveGateway"
            }, {
                id: "nodeAction" + num,
                name: $t('立即执行的活动'),
                description: "",
                type: "executionTask",
                itemList: []
            }, {
                type: "endEvent",
                id: "nodeEnd" + num
            });
            triggerData.workflow.transitions.push({
                id: "nodeLineFirst" + num,
                fromId: "nodeGateway" + num,
                toId: "nodeAction" + num,
                condition: {

                },
                serialNumber: 0
            }, {
                id: "nodeLineNext" + num,
                fromId: "nodeAction" + num,
                toId: "nodeEnd" + num,
                serialNumber: 0
            }, {
                id: "line" + next,
                fromId: "nodeGateway" + num,
                toId: "end",
                serialNumber: 0
            });
            this.model.set('triggerData', triggerData);
        },
        createNode(num) {
            let me = this;
            let data = this.model.get('triggerData');
            //this.node && this.node.destroy();
            let node = new NodeView({
                model: new Backbone.Model(data),
                num: typeof num == 'undefined' ? this.num : num,
                emailSender: this.emailSender
            });

            node.on('updateData', function(data) {
                me.model.set('triggerData', data);
            });
            node.on('updateState', function() {
                me.updateState();
            });
            this.node[this.num] = node;
            if (typeof num == 'undefined') {
                this.num++;
            }
            this.find('.wf-canvas-con').append(node.$el);
        },
        resetEnd(item) {
            let arr = [];
            let num = parseInt(item.fromId.replace('nodeAction', ''));
            item.toId = 'nodeEnd' + num;
            this.$el.find('#nodeEnd' + num).removeClass('next-icon');
            this.$el.find('#nodeEnd' + num).find('em').html(`${$t("结束")}`);
            let selectList = this.$el.find('#nodeEnd' + num).find('.node-select-list');
            selectList.attr('on', 0);
            selectList.find('a').removeClass('current');
            $(selectList.find('a')[0]).addClass('current');
            arr.push({
                type: "endEvent",
                id: "nodeEnd" + num
            });
            return arr;
        },
        swap() {
            let dragData = this.dragData;
            //html结构
            let startElement;
            let endElement;
            let maxEnd = '';
            let t, n = true;
            _.each($('.canvas-div'), function(item, index) {
                if ($(item).attr('num') == dragData.start) {
                    startElement = $(item);
                    t = index;
                }
                if ($(item).attr('num') && ($(item).attr('num') == dragData.end)) {
                    endElement = $(item);
                    if (t + 1 == index) {
                        n = false;
                    }
                }
            });
            if (!endElement) {
                let length = this.find('.wf-canvas-con .canvas-div').length;
                endElement = $(this.find('.wf-canvas-con .canvas-div')[length - 1]);
                maxEnd = endElement.attr('num');
            }
            //加入动画
            startElement.css({
                opacity: 1
            });
            if (parseInt(dragData.end) == -1) {
                $('.bot-div').find('.wf-biaozhun-line').hide();
            } else {
                endElement.parent().find('.wf-biaozhun-line').hide();
            }
            if (dragData.start == dragData.end || (dragData.start == maxEnd && dragData.end == -1) || !n) {
                return;
            }
            if (parseInt(dragData.end) == -1) {
                endElement.parent().after(startElement.parent());
            } else {
                endElement.parent().before(startElement.parent());
            }

            //是否匹配到下一条件列表—显隐
            $('.node-select-list').each(function(index) {
                if (index < $('.node-select-list').length - 1) {
                    $(this).attr('on', 1);
                } else {
                    $(this).attr('on', 0);
                }
            });

            //data数据
            let triggerData = this.model.get('triggerData');
            let startGateNode = startElement.find('span[node-type=exclusiveGateway]');
            let endGateNode = endElement.find('span[node-type=exclusiveGateway]');
            let startGateId = startGateNode.attr('id');
            let endGateId = endGateNode.attr('id');
            let nextLine = parseInt(dragData.start) + 1;
            let tmp = _.findWhere(triggerData.workflow.transitions, {
                id: 'line' + nextLine
            });
            let nextNode = this.searchNode(tmp.toId);
            let act = [];

            let me = this;

            _.each(triggerData.workflow.transitions, function(item) {
                let fromTemp = _.findWhere(triggerData.workflow.activities, {
                    id: item.fromId
                });
                if (parseInt(dragData.end) == -1) {
                    if (item.toId == 'end') {
                        item.toId = startGateId;
                    } else if (item.toId == startGateId) {
                        item.toId = nextNode.id;
                    } else if (item.toId == nextNode.id) {
                        if (fromTemp.type == 'executionTask') {
                            act = me.resetEnd(item);
                        } else {
                            item.toId = 'end';
                        }
                    }
                } else {
                    //最后一个节点——end
                    //来自开始节点
                    if (item.toId == startGateId) {
                        //如果有匹配到下一条件，修改数据
                        if (fromTemp.type == 'executionTask' && item.toId.indexOf('nodeEnd') == -1 && nextNode.id == 'end') {
                            act = me.resetEnd(item);
                        } else {
                            item.toId = nextNode.id;
                        }
                        //从开始节点出来的线
                    } else if (item.toId == nextNode.id) {
                        item.toId = endGateId;
                        //从结束节点来的线
                    } else if (item.toId == endGateId) {
                        item.toId = startGateId;
                    }
                    if (item.id == 'line' + nextLine) {
                        item.toId = endGateId;
                    }
                }
            });

            triggerData.workflow.activities = triggerData.workflow.activities.concat(act);
            this.model.set('triggerData', triggerData);
        },
        showTips(data) {
            let btns = [{
                action: 'cancel',
                label: $t('确定')
            }];
            if (data.btns) {
                btns = data.btns;
            }
            let dialog = new Dialog({
                title: data.title ? data.title : $t('提示'),
                height: data.height ? data.height : 60,
                btns: btns,
                isClose: data.isClose,
                content: data.content
            });
            dialog.show();
            return dialog;
        },
        addGateNode(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            //加到最多条件
            if ($('.cavase-node-con').length >= this.maxNum) {
                let content = $t('最多添加{{maxNum}}个条件，不能继续添加', {
                    data: {
                        maxNum: this.maxNum
                    }
                });
                this.showTips({
                    content: content
                });
                return;
            }
            this.initNode();
            this.createNode();
        },
        renderFlowInfo(data) {
            let me = this;
            this.flowInfo = new FlowInfoView({
                model: new Backbone.Model(data)
            });
            this.flowInfo.on('updata', function(data) {
                let triggerData = me.get('triggerData');
                triggerData.name = data.name;
                triggerData.description = data.description;
                triggerData.sourceWorkflowId = data.sourceWorkflowId;
                triggerData.entityId = data.entityId;
                triggerData.triggerTypes = data.triggerTypes;
                triggerData.triggerTypeLabels = data.triggerTypeLabels;
                me.model.set('triggerData', triggerData);
            });
            this.find('.canvas-right').empty().append(this.flowInfo.$el);
        },
        saveFlow() {
            let me = this;
            let dialog = this.showTips({
                title: $t('保存流程'),
                height: 80,
                isClose: false,
                btns: [{
                    action: 'ensure',
                    label: $t('立即启用')
                }, {
                    action: 'ensure1',
                    label: $t('暂不启用')
                }],
                content: $t('流程已保存，是否立即启用本工作流')
            });
            dialog.on('ensure', () => {
                me.lockWorkFlow(true);
            });
            dialog.on('ensure1', () => {
                me.lockWorkFlow(false);
            });
            this.dialog = dialog;
        },
        //禁用工作流
        lockWorkFlow(enabled) {
            let me = this;
            if (me.isLoad == 1) {
                return;
            }
            me.isLoad = 1;
            utils.FHHApi({
                url: '/EM1HPROCESS/WorkflowAction/EnableDefinition',
                data: {
                    sourceWorkflowId: this.model.get('triggerData').sourceWorkflowId,
                    enabled: enabled
                },
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        me.dialog.hide();
                        me.destroy();
                        me.trigger('flowsave');
                    } else {
                        console.log('失败');
                    }
                    me.isLoad = 0;
                }
            }, {
                errorAlertModel: 1
            });
        },
        findFieldType(fieldName) {
            let fields = this.model.get('fields');
            let tmp = _.findWhere(fields, {
                api_name: fieldName
            });
            if (tmp) {
                if (['employee', 'department'].indexOf(tmp.type) > -1) {
                    return {
                        name: 'list',
                        elementType: {
                            name: PaasUI.utils.getValueType(tmp.type)
                        }
                    }
                } else {
                    return {
                        name: PaasUI.utils.getValueType(tmp.type)
                    }
                }
            } else {
                return false;
            }
        },
        getData() {
            let me = this;
            let data = utils.deepClone(this.model.get('triggerData'));
            if (data.hasOwnProperty("triggerTypeLabels")) {
                delete data.triggerTypeLabels;
            }
            if (data.hasOwnProperty("entityName")) {
                delete data.entityName;
            }
            //对itemlist里面的字段和bpm进行转码
            _.each(data.workflow.activities, function(item) {
                if (item.itemList && item.itemList.length) {
                    let itemList = [];
                    _.each(item.itemList, function(item1) {
                        if (item1) {
                            if (item1.hasOwnProperty("id")) {
                                delete item1.id;
                            }
                            if (item1.taskType == 'updates') {
                                let updateField = [];
                                _.each(item1.updateFieldJson, function(fval) {
                                    if (fval) {
                                        updateField.push(fval);
                                    }
                                });
                                item1.updateFieldJson = JSON.stringify(updateField);
                            } else if (item1.taskType == 'send_qixin' || item1.taskType == 'send_email') {
                                if (item1.recipients && item1.recipients.hasOwnProperty("label")) {
                                    delete item1.recipients.label;
                                }
                            } else if (item1.taskType == 'trigger_operation' && item1.triggerParam.actionCode == 'ChangeOwner') {
                                if (item1.triggerParam.candidates && item1.triggerParam.candidates.hasOwnProperty("label")) {
                                    delete item1.triggerParam.candidates.label;
                                }
                            }
                            itemList.push(item1);
                        }
                    });
                    item.itemList = itemList;
                }
            });

            //当条件为空时，补充数据
            _.each(data.workflow.transitions, function(item) {
                let fromTmp = _.findWhere(data.workflow.activities, {
                    id: item.fromId
                });
                let toTmp = _.findWhere(data.workflow.activities, {
                    id: item.toId
                });
                if (fromTmp && toTmp && fromTmp.type == 'exclusiveGateway' && toTmp.type == 'executionTask') {
                    if (!(item.condition && item.condition.conditions && item.condition.conditions.length)) {
                        item.condition = {
                            type: "or",
                            conditions: [{
                                type: "and",
                                conditions: [{
                                    left: {
                                        value: "workprocess"
                                    },
                                    right: {
                                        type: {
                                            name: "text"
                                        },
                                        value: "workprocess"
                                    },
                                    type: "equals"
                                }]
                            }]
                        };
                    }
                }
            });

            // //更新variables
            // let variables = [];
            // let tmp = _.filter(data.workflow.transitions, function(item) {
            //     let fromTmp = _.findWhere(data.workflow.activities, {
            //         id: item.fromId
            //     });
            //     let toTmp = _.findWhere(data.workflow.activities, {
            //         id: item.toId
            //     });
            //     if (fromTmp && toTmp && fromTmp.type == 'exclusiveGateway' && toTmp.type == 'executionTask') {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // });
            // if (tmp.length) {
            //     _.each(tmp, function(item1) {
            //         if (item1.condition && item1.condition.conditions && item1.condition.conditions.length) {
            //             _.each(item1.condition.conditions, function(item) {
            //                 _.each(item.conditions, function(value) {
            //                     if (!value.left.expression && !value.left.value) {
            //                         return;
            //                     }
            //                     let leftName = value.left.expression ? value.left.expression : value.left.value;
            //                     let tmp1 = _.findWhere(variables, {
            //                         id: leftName
            //                     });
            //                     if (!tmp1) {
            //                         let type = {
            //                             name: 'text'
            //                         };
            //                         if (value.right && value.right.type) {
            //                             type = value.right.type;
            //                         } else {
            //                             // type = {
            //                             //     name: me.findFieldType(value.left.expression)
            //                             // };
            //                             type = me.findFieldType(value.left.expression);
            //                         }
            //                         variables.push({
            //                             id: leftName,
            //                             type: type
            //                         });
            //                     }
            //                 });
            //             });
            //         }
            //     });
            // }
            data.workflow.variables = PaasUI.utils.getVariablesByTransitions({
                objectDescribe: me.model.get('obj').objectDescribe,
                transitions: data.workflow.transitions
            });
            return data;
        },
        saveWorkFlow() {
            if (this.isLoad == 1) {
                return;
            }
            this.isLoad = 1;
            if (this.validateData()) {
                this.isLoad = 0;
                return;
            }
            let data = this.getData();
            //console.log(data);
            let url = '/EM1HPROCESS/WorkflowAction/CreateDefinition';
            let operationId = 'AddSave';
            if (data.id) {
                url = '/EM1HPROCESS/WorkflowAction/UpdateDefinition';
                operationId = 'EditSave';
            }

            CRM.util.uploadLog && CRM.util.uploadLog('s-Workflow', 'List', {
                operationId: operationId,
                eventType: 'cl',
                eventData: {
                    apiName: data.entityId
                }
            });

            let me = this;
            utils.FHHApi({
                url: url,
                data: data,
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        me.saveFlow();
                    } else {
                        me.showTips({
                            content: res.Result.FailureMessage
                        });
                    }
                    me.isLoad = 0;
                }
            }, {
                errorAlertModel: 1
            });
        },
        cancelDialog() {
            let me = this;
            let dialog = new Dialog({
                title: $t('提示'),
                btns: [{
                    action: 'ensure',
                    label: $t('确 定')
                }, {
                    action: 'cancel',
                    label: $t('取 消')
                }],
                height: 45,
                content: $t('确认关闭吗？')
            });
            dialog.show();
            dialog.on('ensure', () => {
                dialog && dialog.destroy();
                me.destroy();
                if (me.flowInfo) {
                    me.flowInfo.destroy();
                    me.flowInfo = null;
                }
            });
        }
    });
    module.exports = FlowSetting;
})