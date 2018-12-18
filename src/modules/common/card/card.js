define(function(require, exports, module) {
    //const baseUtils = require('base-modules/utils');
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./card-html');
    const FieldTpl = require('./template/fieldtpl-html');
    const TaskTpl = require('./template/tasktpl-html');
    const RemindTpl = require('./template/remindtpl-html');
    const LockTpl = require('./template/locktpl-html');
    const BpmTpl = require('./template/bpmtpl-html');
    const FunctionTpl = require('./template/functiontpl-html');
    const OperateTpl = require('./template/operatetpl-html');
    const FeedTpl = require('./template/feedtpl-html');
    const ManagerTpl = require('./template/managertpl-html');
    const MessageTpl = require('./template/messagetpl-html');
    const ScheduleTpl = require('./template/scheduletpl-html');
    const EmailTpl = require('./template/emailtpl-html');

    const Ajax = require('base-modules/utils');
    //const VariablesData = require('paas-workprocess-assets/data/vardata');
    const scheduleData = require('paas-workprocess-assets/data/scheduleData');
    const taskData = require('paas-workprocess-assets/data/taskData');

    const CardView = BaseView.extend({
        className: 'workprocess-action-card',
        initialize(options = {}) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);
            let html = template();
            me.$el.append(html);

            me.feedTypeList = []; //只有在相关feed类型时需要

            let itemList = this.get('itemList');
            let condition = this.get('condition');
            let ok = 0;
            if (itemList && itemList.length) {
                _.each(itemList, function(item) {
                    if (me.renderActionContent(item)) {
                        ok = 1;
                    }
                });
            }
            if (!ok) {
                me.setData();
            }

            if (condition && condition.length) {
                me.renderConDedition(condition);
            }
        },
        renderActionContent(item, type) {
            let me = this;
            let t = 0;
            let index = item.id;
            let oldElement = '';
            //如果type=='edit',先判断是否num=index的框，有的话，删除
            if (type == 'edit') {
                let element = me.$el.find('h3[num="' + index + '"]');
                if (element && element.length) {
                    //element.parent().remove();
                    oldElement = element.parent();
                }
            }
            //如果有后动作，去掉按钮
            switch (item.taskType) {
                case 'updates':
                    t = 1;
                    me.setData(item, index, me.renderFieldContent, oldElement);
                    break;
                case 'send_qixin':
                    t = 1;
                    me.setData(item, index, me.renderRemindContent, oldElement);
                    break;
                case 'trigger_bpm':
                    me.renderBpmContent(item, index, oldElement);
                    break;
                case 'send_email':
                    me.renderEmailContent(item, index, oldElement);
                    break;
                case 'trigger_operation':
                    if (item.triggerParam.actionCode == 'Lock' || item.triggerParam.actionCode == 'Unlock') {
                        me.renderLock(item, index, oldElement);
                    } else if (item.triggerParam.actionCode == 'ChangeOwner') {
                        me.renderManagerContent(item, index, oldElement);
                    } else if (item.triggerParam.actionCode == 'Return' || item.triggerParam.actionCode == 'Move') {
                        if (!me.$el.find('.wk-operate-content').length) {
                            me.$el.find('.wk-action-content').append('<div class="wk-operate-content"></div>');
                        }
                        me.setData(item, index, me.fetchSeas, oldElement);
                    }
                    break;
                case 'feed_sales_record':
                    me.setData(item, index, me.fetchType, oldElement);
                    break;
                case 'feed_schedule':
                    me.setData(item, index, me.renderScheduleContent, oldElement);
                    break;
                case 'feed_task':
                    me.setData(item, index, me.renderTaskContent, oldElement);
                    break;
                case 'external_message':
                    me.setData(item, index, me.renderMessageContent, oldElement);
                    break;
                case 'custom_function':
                    me.renderFunctionContent(item, index, oldElement);
                    break;
            }
            return t;
        },
        FetchMessageContent(callback) {
            let me = this;
            if (me.messList) {
                callback && callback();
                return;
            }
            Ajax.FHHApi({
                url: '/EM1APROCESS/MetadataAction/GetExternalNotice',
                data: {
                    entityId: me.get('entityId')
                },
                success(data) {
                    if (data.Result.StatusCode == 0) {
                        me.messList = data.Value;
                        callback && callback();
                    }
                }
            });
        },
        renderMessageContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let me = this;
            if (!oldElement) {
                oldElement = $('<div class="wk-wechat-content"></div>');
                me.$el.append(oldElement);
            }
            let tm = PaasUI.utils.getCommonLabel(data.actionMapping.receiverIds, num);
            let label = [];
            let string = '';
            _.each(tm, function(item) {
                if (item) {
                    label.push(item);
                }
            });
            if (label.length) {
                string = label.join($t('，'));
            }

            //let title = PaasUI.utils.replaceRichText(data.actionMapping.title, me.model.get('obj')).textList;
            //let content = PaasUI.utils.replaceRichText(data.actionMapping.content, me.model.get('obj')).textList;
            let title = PaasUI.utils.replaceRichTextV2Async({
                content: data.actionMapping.title,
                objAndRefObjList: this.model.get('obj')
            }).content;
            let content = PaasUI.utils.replaceRichTextV2Async({
                content: data.actionMapping.content,
                objAndRefObjList: this.model.get('obj')
            }).content;
            me.FetchMessageContent(function() {
                let messList = me.messList;
                //跳转链接
                let appById;
                _.each(messList.apps, function(item) {
                    if (item.value == data.actionMapping.appType) {
                        appById = item;
                    }
                });
                let appName = '';
                if (appById) {
                    appName = appById.label;
                } else {
                    appName = $t('已删除');
                }
                //互联应用
                let forwardById;
                _.each(messList.forwards, function(item) {
                    if (item.value == data.actionMapping.forwardType) {
                        forwardById = item;
                    }
                });
                let forwardName = '';
                if (forwardById) {
                    forwardName = forwardById.label;
                } else {
                    forwardName = $t('已删除');
                }
                let dataTpl = {
                    num: num,
                    title: title,
                    content: content,
                    forwardName: forwardName,
                    appName: appName,
                    remindPerson: string
                }
                //企业匹配字段外部角色
                let fieldObjects = data.actionMapping.downObjects;
                if (fieldObjects) {
                    let objData = fieldObjects[0].objectId.replace(/\$\{|\}/g, '').split('.');
                    let objApiName = objData[0];
                    let objectId = objData[1];
                    PaasUI.utils.api.fetchDescribe({
                        apiName: objApiName
                    }).then((res) => {
                        let roleIds = data.actionMapping.roleIds;
                        let objFieldData = _.find(res.refObjectDescribeList, (item) => {
                            return item.fieldApiName == objectId;
                        });
                        dataTpl.objectFieldLabel = objFieldData.fieldLabel;
                        if (roleIds) {
                            PaasUI.utils.getExternalRolesLabel({
                                externalAppId: data.actionMapping.appType,
                                roleIds: roleIds
                            }).then((externalRolesLabel) => {
                                dataTpl.rolesLabel = externalRolesLabel;
                                let _html = MessageTpl({
                                    dataTpl
                                });
                                if (oldElement) {
                                    oldElement.after(_html);
                                    oldElement.remove();
                                } else {
                                    me.$el.append(_html);
                                }
                            })
                        } else {
                            let _html = MessageTpl({
                                dataTpl
                            });
                            if (oldElement) {
                                oldElement.after(_html);
                                oldElement.remove();
                            } else {
                                me.$el.append(_html);
                            }
                        }
                    })
                } else {
                    let _html = MessageTpl({
                        dataTpl
                    });
                    if (oldElement) {
                        oldElement.after(_html);
                        oldElement.remove();
                    } else {
                        me.$el.append(_html);
                    }
                }
            });
        },
        getFunction(data, callback) {
            let me = this;
            let functionApiName = data.actionMapping.functionApiName;
            /*
            if (me.functionList && me.functionList[functionApiName]) {
                callback && callback(me.functionList[functionApiName]);
                return;
            }
            */
            Ajax.FHHApi({
                url: '/EM1HCRMUdobj/function/find',
                data: {
                    binding_object_api_name: me.get('entityId'),
                    api_name: functionApiName
                },
                success(data) {
                    if (data.Result.StatusCode == 0) {
                        callback && callback(data.Value.function);
                    }
                }
            });
        },
        fetchType(item, num, oldElement) {
            let me = this;
            let data = Ajax.deepClone(item);
            if (!oldElement) {
                oldElement = $('<div class="wk-feed-content"></div>');
                me.$el.append(oldElement);
            }
            if (me.feedTypeList && me.feedTypeList.length) {
                let tmp = _.findWhere(me.feedTypeList, {
                    CustomTagID: data.actionMapping.tagId
                });
                if (!tmp) {
                    tmp.Name = $t('该类型已被删除');
                }
                data.actionMapping.tagName = tmp.Name;
                me.renderFeedContent.apply(me, [data, num, oldElement]);
                return;
            }
            Ajax.FHHApi({
                url: '/EM1HCRM/CustomTag/GetCustomTagList',
                data: {
                    Type: 1
                },
                success(res) {
                    if (res.Result.StatusCode == 0) {
                        me.feedTypeList = res.Value.CustomTagList;
                        let tmp = _.findWhere(me.feedTypeList, {
                            CustomTagID: data.actionMapping.tagId
                        });
                        if (!tmp) {
                            tmp.Name = $t('该类型已被删除');
                        }
                        data.actionMapping.tagName = tmp.Name;
                        me.renderFeedContent.apply(me, [data, num, oldElement]);
                    }
                }
            });
        },
        renderFunctionContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let me = this;
            if (!oldElement) {
                oldElement = $('<div class="wk-function-content"></div>');
                me.$el.append(oldElement);
            }
            me.getFunction(data, function(data) {
                let isError = 0;
                if (!data) {
                    data = {
                        function_name: $t('该函数已删除')
                    }
                    isError = 1;
                }
                let _html = FunctionTpl({
                    data: {
                        isError: isError,
                        num: num,
                        function_name: data.function_name,
                        function_remark: data.remark
                    }
                });
                if (oldElement) {
                    oldElement.after(_html);
                    oldElement.remove();
                } else {
                    me.$el.append(_html);
                }
            });
        },
        renderFeedContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let tm = PaasUI.utils.getCommonLabel(data.actionMapping.carbonCopyEmployeeIds, num);
            let label = [];
            let string = '';
            _.each(tm, function(item) {
                if (item) {
                    label.push(item);
                }
            });
            if (label.length) {
                string = label.join($t('，'));
            }
            let content = PaasUI.utils.replaceRichTextV2Async({
                content: data.actionMapping.content,
                objAndRefObjList: this.model.get('obj')
            }).content;
            //let content = PaasUI.utils.replaceRichText(data.actionMapping.content, this.model.get('obj')).textList;
            let _html = FeedTpl({
                data: {
                    num: num,
                    content: content,
                    tagName: data.actionMapping.tagName,
                    copyStr: string
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                this.$el.append(_html);
            }
        },
        renderTaskContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let tm = PaasUI.utils.getCommonLabel(data.actionMapping.carbonCopyEmployeeIds, num);
            let tm1 = PaasUI.utils.getCommonLabel(data.actionMapping.attenderEmployeeIds, num);
            let label = [];
            let string = '';
            _.each(tm, function(item) {
                if (item) {
                    label.push(item);
                }
            });
            if (label.length) {
                string = label.join($t('，'));
            }

            //let content = PaasUI.utils.replaceRichText(data.actionMapping.content, this.model.get('obj')).textList;
            //let title = PaasUI.utils.replaceRichText(data.actionMapping.title, this.model.get('obj')).textList;
            let content = PaasUI.utils.replaceRichTextV2Async({
                content: data.actionMapping.content,
                objAndRefObjList: this.model.get('obj')
            }).content;
            let title = PaasUI.utils.replaceRichTextV2Async({
                content: data.actionMapping.title,
                objAndRefObjList: this.model.get('obj')
            }).content;

            let deadLine = data.actionMapping.deadLine;
            let deadLineString = '';
            if (_.isNumber(deadLine) || (_.isString(deadLine) && deadLine.match(/^\d+$/))) {
                deadLineString = PaasUI.utils.formateData(deadLine, 'date_time');
            } else {
                deadLineString = PaasUI.utils.replaceRichTextV2Async({
                    content: deadLine,
                    objAndRefObjList: this.model.get('obj')
                }).content;
                //deadLineString = PaasUI.utils.replaceRichText(deadLine, this.model.get('obj')).textList;
            }

            let remindArr = [];
            _.each(data.actionMapping.remindTimes, function(item) {
                let tmp = taskData.filter(items => items.value == item);
                let t = tmp[0].label;
                remindArr.push(t);
            });

            let _html = TaskTpl({
                data: {
                    num: num,
                    title: title,
                    content: content,
                    deadLineString: deadLineString,
                    attenderEmployeeIdStr: tm1,
                    remindArr: remindArr,
                    copystr: string
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                this.$el.append(_html);
            }
            //this.trigger('render', this);
        },
        renderManagerContent(data, num, oldElement) {
            let m = {};
            m.recipients = data.triggerParam.candidates;

            let result = PaasUI.utils.getRecLable(m, num);
            let label = [];
            let string = '';
            let tm = result.recipients.label.split($t('，'));
            _.each(tm, function(item) {
                if (item) {
                    label.push(item);
                }
            });
            if (label.length) {
                string = label.join($t('，'));
            }

            let _html = ManagerTpl({
                data: {
                    num: num,
                    person: string
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                this.$el.append(_html);
            }
            //this.trigger('render', this);
        },
        renderScheduleContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let tm1 = [];
            let tm = PaasUI.utils.getCommonLabel(data.actionMapping.attenderEmployeeIds, num);
            if (data.actionMapping.receiptEmployeeIds) {
                tm1 = PaasUI.utils.getCommonLabel(data.actionMapping.receiptEmployeeIds, num);
            }

            let label = [];
            let string = '';

            _.each(tm, function(item) {
                if (item) {
                    label.push(item);
                }
            });
            if (label.length) {
                string = label.join($t('，'));
            }
            //let content = PaasUI.utils.replaceRichText(data.actionMapping.content, this.model.get('obj')).textList;
            let content = PaasUI.utils.replaceRichTextV2Async({
                content: data.actionMapping.content,
                objAndRefObjList: this.model.get('obj')
            }).content;

            let beginTime = data.actionMapping.beginTime;
            let beginTimeString = '';
            if (_.isNumber(beginTime) || (_.isString(beginTime) && beginTime.match(/^\d+$/))) {
                beginTimeString = PaasUI.utils.formateData(beginTime, 'date_time');
            } else {
                beginTimeString = PaasUI.utils.replaceRichTextV2Async({
                    content: beginTime,
                    objAndRefObjList: this.model.get('obj')
                }).content;
                //beginTimeString = PaasUI.utils.replaceRichText(beginTime, this.model.get('obj')).textList;
            }

            let endTime = data.actionMapping.endTime;
            let endTimeString = '';
            if (endTime) {
                if (_.isNumber(endTime) || (_.isString(endTime) && endTime.match(/^\d+$/))) {
                    endTimeString = PaasUI.utils.formateData(endTime, 'date_time');
                } else {
                    //endTimeString = PaasUI.utils.replaceRichText(endTime, this.model.get('obj')).textList;
                    endTimeString = PaasUI.utils.replaceRichTextV2Async({
                        content: endTime,
                        objAndRefObjList: this.model.get('obj')
                    }).content;
                }
            }

            let remindArr = [];
            _.each(data.actionMapping.remindTypes, function(item) {
                let tmp = _.findWhere(scheduleData, {
                    value: item.value
                });
                let t = tmp.label;
                if (item.time) {
                    t += ' ' + PaasUI.utils.formateData(item.time, 'time');
                }
                remindArr.push(t);
            });

            let _html = ScheduleTpl({
                data: {
                    num: num,
                    content: content,
                    person: string,
                    allDay: data.actionMapping.allDay,
                    beginTimeString: beginTimeString,
                    endTimeString: endTimeString,
                    remindArr: remindArr,
                    receiptEmployeeIds: data.actionMapping.receiptEmployeeIds,
                    receiptEmployeeIdsStr: tm1
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                this.$el.append(_html);
            }
            //this.trigger('render', this);
        },
        renderConDedition(conditionsLable) {
            if (!conditionsLable || !conditionsLable.length) {
                return;
            }
            let html = '';
            _.each(conditionsLable, function(value, index1) {
                if (value.length) {
                    let txt = $t('且');
                    _.each(value, function(item, index2) {
                        if (index1 == 0 && index2 == 0) {
                            txt = $t('当');
                        } else {
                            txt = $t('且');
                        }
                        let operatorLabel = item.operator ? item.operator : $t('请选择');
                        let rightLabel = item.right;
                        /*
                        if (_.isArray(rightLabel)) {
                            rightLabel = rightLabel.join('、');
                        } else if (rightLabel && !(typeof(rightLabel) == 'string' && rightLabel.indexOf('${') > -1)) {
                            if (item.type == 'date' || item.type == 'date_time' || item.type == 'time') {
                                rightLabel = PaasUI.utils.formateData(rightLabel, item.type);
                            } else if (typeof(rightLabel) == 'string') {
                                rightLabel = PaasUI.utils.htmlEncodeByRegExp(rightLabel);
                            }
                        } else {
                            rightLabel = PaasUI.utils.htmlEncodeByRegExp(rightLabel);
                        }
                        */
                        html += '<div class="con-p"><span class="tg-info">' + txt + ' (and)</span><span class="tg-txt" title="' + item.left + '">' + item.left + '</span><span class="tg-info1">' + operatorLabel + '</span><span class="tg-txt"  title="' + rightLabel + '">' + rightLabel + '</span></div>';
                    });
                    if (index1 < conditionsLable.length - 1) {
                        let label = $t('或') + '(or)';
                        html += `<div class="or-con">${label}</div>`;
                    }
                } else {
                    let label = $t('未设置条件，默认为真');
                    html = `<div class="no-condition">${label}</div>`;
                }
            });
            this.$el.append(`<div class="wf-detail-con-card">${html}</div>`);
        },
        renderEmailContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let email = '';

            let result = PaasUI.utils.getRecLable(data, num);

            let label = [];
            let string = '';
            if (result.recipients.label) {
                let tm = result.recipients.label.split($t('，'));
                _.each(tm, function(item) {
                    if (item) {
                        label.push(item);
                    }
                });
            }
            if (label.length) {
                string = label.join($t('，'));
            }

            if (data.emailAddress.length) {
                email += data.emailAddress.join($t('，'));
            }

            if (result.recipients.label && data.emailAddress.length) {
                email += $t('，');
            }

            let _html = EmailTpl({
                data: {
                    num: num,
                    sender: result.sender,
                    email: email,
                    emailStr: string,
                    title: result.title
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                this.$el.append(_html);
            }
            //this.trigger('render', this);
        },
        getBpmLable(res, callback) {
            let me = this;
            let newRes = Ajax.deepClone(res);
            Ajax.FHHApi({
                url: '/EM1HBPM/ProcessDefinition/GetAvailableWorkflows',
                data: {
                    entryType: me.get('entityId')
                },
                success(data) {
                    if (data.Result.StatusCode == 0) {
                        let content = res.triggerParam;
                        let bpmList = _.filter(data.Value.outlines, function(item) {
                            return item.id == content.id;
                        });
                        if (bpmList.length) {
                            newRes.sourceworkflowName = bpmList[0].name;
                            callback(newRes);
                        } else {
                            let label = $t('流程被禁用或删除');
                            newRes.sourceworkflowName = `<span class="bpm-error">${label}</span>`;
                            newRes.isError = 1;
                            callback(newRes);
                        }

                    }
                }
            });
        },
        renderBpmContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let me = this;
            if (!oldElement) {
                oldElement = $('<div class="wk-bpm-content"></div>');
                me.$el.append(oldElement);
            }
            me.getBpmLable(data, function(res) {
                let isError = 0;
                if (res.isError) {
                    isError = 1;
                }
                let _html = BpmTpl({
                    data: {
                        isError: isError,
                        num: num,
                        sourceworkflowName: res.sourceworkflowName
                    }
                });
                if (oldElement) {
                    oldElement.after(_html);
                    oldElement.remove();
                } else {
                    me.$el.append(_html);
                }
                //me.trigger('render', me);
                me.handleErrorChange(isError);
            });
        },
        findBackReason(reason) {
            if (typeof reason == 'undefined') {
                return false;
            }
            let obj = this.model.get('obj');
            let backReason = obj.objectDescribe.fields['back_reason'];
            if (backReason && backReason.is_active !== false) {
                let m = false;
                let txt = reason;
                _.each(backReason.options, function(item) {
                    if (item.value == reason) {
                        m = true;
                        txt = item.label;
                    }
                });
                return {
                    m,
                    txt
                }
            } else {
                return false;
            }
        },
        renderOperatorContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let me = this;
            let content = '';
            let label = data.triggerParam.actionName.substring(2);
            //let content1 = '';
            //let html = '';

            let dataLabel = $t('线索');
            if (me.get('entityId') == 'AccountObj') {
                dataLabel = $t('公海');
            }
            let reasonTxt = '';
            let t1, t2, t3;
            if (data.triggerParam.actionCode == 'Return') {
                t1 = me.findSeas(data.triggerParam.belongTo);
                t2 = me.findSeas(data.triggerParam.unBelongTo);
                t3 = me.findBackReason(data.triggerParam.reason);

                if (t1 === false) {
                    t1 = data.triggerParam.belongTo;
                }
                if (t2 === false) {
                    t2 = data.triggerParam.unBelongTo;
                }
                if (t3) {
                    reasonTxt = '';
                    if (!t3.m) {
                        if (t3.txt !== '') {
                            let label = $t('退回原因已被删除');
                            reasonTxt += `<span class="bpm-error">${label}</span>`;
                        }
                    } else {
                        reasonTxt += t3.txt;
                    }
                }

                if (t1 == '') {
                    //t1 = `其所属${label}`;
                    t1 = $t('其所属{{label}}', {
                        data: {
                            label
                        }
                    });
                }
            } else if (data.triggerParam.actionCode == 'Move') {
                content = me.findSeas(data.triggerParam.belongTo);
            }

            let _html = OperateTpl({
                data: {
                    num: num,
                    actionCode: data.triggerParam.actionCode,
                    belongTo: t1,
                    unBelongTo: t2,
                    reason: reasonTxt,
                    actionName: label,
                    dataLabel: dataLabel,
                    content: content
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                me.$el.append(_html);
            }
            //me.trigger('render', me);
        },
        findSeas(belongTo) {
            if (typeof belongTo == 'undefined' || belongTo == '') {
                return false;
            }
            let seasList = this.model.get('seasList');
            let tmp = _.findWhere(seasList, {
                value: belongTo
            });
            if (tmp) {
                return tmp.label;
            }
            return false;
        },
        fetchSeas(item, num, oldElement) {
            let me = this;
            let entityId = me.get('entityId');
            let url = '/EM1HCRM/HighSeas/GetAllHighSeasList';
            if (entityId == 'LeadsObj') {
                url = '/EM1HCRM/SalesCluePool/GetSalesCluePoolShortInfo';
            }
            if (!oldElement) {
                oldElement = $('<div class="wk-operate-content"></div>');
                me.$el.append(oldElement);
            }
            Ajax.FHHApi({
                url: url,
                data: {},
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        let cluesList = [];
                        if (entityId == 'LeadsObj') {
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
                        me.renderOperatorContent.call(me, item, num, oldElement);
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        renderLock(data, num, oldElement) {
            let str = {
                'Lock': $t('数据锁定，锁定后数据将无法编辑'),
                'Unlock': $t('数据解锁，数据将可编辑')
            }
            let _html = LockTpl({
                data: {
                    num: num,
                    str: str,
                    actionName: data.triggerParam.actionName,
                    actionCode: data.triggerParam.actionCode
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                this.$el.append(_html);
            }
            //this.trigger('render', this);
        },
        renderFieldContent(data, num, oldElement) {
            if (!data) {
                return;
            }
            let me = this;
            let updateFieldJson = [];
            let isError = 0;
            _.each(data.updateFieldJson, function(item) {
                //let fields = me.model.get('fields');
                let labels = [];
                //if (fields) {
                labels = PaasUI.utils.getFieldsInfo(item, me.model.get('obj'));
                //}
                _.each(labels, function(item1) {
                    //显示配置错误
                    if (item1.indexOf('<i>') > -1 || item1.indexOf('bpm-error') > -1) {
                        isError = 1;
                    }
                });
                updateFieldJson.push(labels);
            });

            let _html = FieldTpl({
                data: {
                    isError: isError,
                    num: num,
                    updateField: updateFieldJson
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                me.$el.append(_html);
            }
            //me.trigger('render', me);
        },
        // setData(item, index, callback) {
        //     let me = this;
        //     PaasUI.utils.fetchObjListData(me.get('entityId'), function(data) {
        //         me.model.set('obj', data);
        //         let fields = data.objectDescribe.fields;
        //         _.each(fields, function(item) {
        //             item.value = item.api_name;
        //         });
        //         let _fields = PaasUI.utils.getFields(fields, me.get('entityId'));
        //         me.model.set('fields', _fields);
        //         callback && callback.call(me, item, index);
        //     });
        // },
        setData(item, index, callback, oldElement) {
            let me = this;
            PaasUI.utils.api.fetchDescribeExtraPersonnelObj({
                apiName: me.get('entityId'),
                success(res) {
                    me.model.set('obj', res);
                    //let data = baseUtils.deepClone(res.objectDescribe);
                    //data.objectDescribe = PaasUI.utils.getUpFieldsVars(data);
                    //me.model.set('fields', data.objectDescribe.fields);
                    callback && callback.call(me, item, index, oldElement);
                }
            });
            // PaasUI.utils.fetchObjListData(me.get('entityId'), (res) => {
            //     me.model.set('obj', res);
            //     let data = baseUtils.deepClone(res.objectDescribe);
            //     data.objectDescribe = PaasUI.utils.getUpFieldsVars(data);
            //     //let _fields = PaasUI.utils.getFields(fields, me.get('entityId'));
            //     me.model.set('fields', data.objectDescribe.fields);
            //     callback && callback.call(me, item, index);
            // });
        },
        handleErrorChange(errorCode) {
            if (!errorCode) {
                return;
            }
            let me = this;
            setTimeout(function() {
                me.trigger('changeError');
            }, 20);
        },
        renderRemindContent(data, num, oldElement) {
            if (!data) {
                return;
            }

            let me = this;
            let result = PaasUI.utils.getRecLable(data, num);

            let label = [];
            let string = '';
            let isError = 0;
            let tm = result.recipients.label.split($t('，'));
            _.each(tm, function(item) {
                if (item) {
                    label.push(item);
                } else {
                    isError = 1;
                }
            });
            if (label.length) {
                string = label.join($t('，'));
            }

            //let title = PaasUI.utils.replaceRichText(result.title, me.model.get('obj')).textList;
            //let content = PaasUI.utils.replaceRichText(result.content, me.model.get('obj')).textList;
            let title = PaasUI.utils.replaceRichTextV2Async({
                content: result.title,
                objAndRefObjList: me.model.get('obj')
            }).content;
            let content = PaasUI.utils.replaceRichTextV2Async({
                content: result.content,
                objAndRefObjList: me.model.get('obj')
            }).content;
            if (title.indexOf('bpm-error') > -1 || content.indexOf('bpm-error') > -1) {
                isError = 1;
            }

            let _html = RemindTpl({
                data: {
                    isError: isError,
                    num: num,
                    title: title,
                    content: content,
                    reminder: string
                }
            });
            if (oldElement) {
                oldElement.after(_html);
                oldElement.remove();
            } else {
                me.$el.append(_html);
            }
        },
    });
    module.exports = CardView;
})