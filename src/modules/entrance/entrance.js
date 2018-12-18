define(function(require, exports, module) {
    const utils = require('base-modules/utils');
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');
    const Radio = require('./radio/radio');
    const TimeTrigger = require('./timetrigger/timetrigger');
    const Circle = require('./circle/circle');

    const FunUtils = require('paas-workprocess-modules/common/base/richTextUtil');
    const template = require('./entrance-html');
    const CRM = window.CRM || {};

    const EntranceView = BaseView.extend({
        initialize(options = {}) {
            options.title = options.title || $t('新建工作流');
            options.width = 660;
            options.height = 350;
            BaseView.prototype.initialize.call(this, options);
            this.formFields = [{
                name: 'name',
                label: $t('工作流名称'),
                required: true,
                placeholder: $t('请输入'),
                maxLength: 20,
                type: 'text'
            }, {
                name: 'sourceWorkflowId',
                label: $t('API名称'),
                maxLength: 57,
                placeholder: $t('请输入'),
                required: true,
                type: 'text'
            }, {
                name: 'description',
                label: $t('工作流描述'),
                placeholder: $t('请输入最多500字'),
                maxLength: 500,
                type: 'long_text'
            }];
        },
        events: {
            'click .b-g-btn': 'handleBtnClick',
            'click .bpm-dislog-close': 'hide'
        },
        editFlowData(sourceWorkflowId, enable) {
            let url = '/EM1HPROCESS/WorkflowAction/GetDefinitionDetail';
            let me = this;
            utils.FHHApi({
                url: url,
                data: {
                    sourceWorkflowId: sourceWorkflowId
                },
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        let data = res.Value.workflow;
                        me.trigger('nameChange', data)
                        if (enable) {
                            data.sourceWorkflowId = 'crmwf' + FunUtils.generateId(10) + '_crmwf'; //重新生成sourceWorkflowId
                            delete data.id;
                        } else {
                            me.id = data.id;
                        }
                        _.each(data.workflow.activities, function(item) {
                            if (item.itemList && item.itemList.length) {
                                _.each(item.itemList, function(item1) {
                                    //在每个后动作中加入id值
                                    item1.id = utils.uuid();
                                    if (item1.taskType == 'updates') {
                                        item1.updateFieldJson = JSON.parse(item1.updateFieldJson);
                                    } else if (item1.taskType == 'send_email') {
                                        if (item1.recipients && item1.recipients.master) {
                                            item1.recipients.dept_leader = item1.recipients.master;
                                            delete item1.recipients.master;
                                        }
                                    }
                                });
                            }
                        });

                        //条件初始化 
                        _.each(data.workflow.transitions, function(item) {
                            let fromTmp = _.findWhere(data.workflow.activities, {
                                id: item.fromId
                            });
                            let toTmp = _.findWhere(data.workflow.activities, {
                                id: item.toId
                            });
                            if (fromTmp && toTmp && fromTmp.type == 'exclusiveGateway' && toTmp.type == 'executionTask') {
                                if (item.condition.conditions && item.condition.conditions.length) {
                                    if (item.condition.conditions[0].conditions[0].left.value && typeof item.condition.conditions[0].conditions[0].left.expression == 'undefined') {
                                        item.condition = [];
                                    }
                                }
                            }
                        });

                        me.show(data);
                    } else {
                        let dialog = new Dialog({
                            title: $t('提示'),
                            height: 60,
                            btns: [{
                                action: 'confirm',
                                label: $t('确定')
                            }],
                            content: res.Result.FailureMessage
                        });
                        dialog.show();
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        bindEvents() {
            this.on('ensure', this.handleEnsure, this);
            //this.on('save', this.handleSave, this);
        },
        renderCircle() {
            this.circle && this.circle.destroy();

            let data = {};
            if (this.get('formNext') || this.id) {
                data.readonly = true;
            } else {
                data.readonly = false;
            }
            let flowData = this.model.get('flowData');
            if (flowData && flowData.rule && flowData.rule.scheduleTime) {
                data.scheduleTime = flowData.rule.scheduleTime;
            }
            this.circle = new Circle({
                model: new Backbone.Model(data)
            });
            this.$el.find('.pass-trigger-con4').append(this.circle.$el);
        },
        checkWorkFlowId(sourceWorkflowId, callback) {
            let me = this;
            utils.FHHApi({
                url: '/EM1HPROCESS/WorkflowAction/GetApiName',
                data: {
                    sourceWorkflowId: sourceWorkflowId
                },
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        if (!res.Value.exist) {
                            callback.call(me);
                        } else {
                            //加入错误提示
                            me.formCom[1].error($t('API名称重复，请重新填写'));
                        }
                    }
                }
            });
        },
        showNewFeature() {
            let me = this;
            let showTimeHelpBtn = me.$el.find('.showTimeHelp');
            if (showTimeHelpBtn.length) {
                let target = $('.new-feature span');
                if (target.hasClass('close')) {
                    target.removeClass('close');
                } else {
                    target.addClass('close');
                }
            }
            showTimeHelpBtn && showTimeHelpBtn.toggle();
            me.$el.find('.closeHelp') && me.$el.find('.closeHelp').toggle();
        },
        renderRadio(triggerType, unshowCondiotion) {
            let me = this;

            if (!triggerType) {
                triggerType = 1;
            }
            let options = [];
            let activities = [];

            _.each(me.get('tiggerConfig'), function(item) {
                let isShowHelp;
                if (item.triggerType) {
                    if (item.triggerType == 5) {
                        isShowHelp = 'showTimeHelp';
                    }
                }
                if (item.triggerOption) {
                    _.each(item.triggerOption, function(item1) {
                        activities.push({
                            label: item1.label,
                            value: item1.triggerType
                        });
                    });
                }
                options.push({
                    label: item.label,
                    value: item.triggerType ? item.triggerType : 1,
                    tiptxt: item.description,
                    isShowHelp: isShowHelp
                });

            });
            me.activities = activities;
            let data = {
                name: "radio",
                value: triggerType,
                options: options,
                readonly: false,
                required: true
            };
            if (this.get('formNext') || this.id) {
                data.readonly = true;
            } else {
                data.readonly = false;
            }
            //选择客户
            me.radio = new Radio({
                model: new Backbone.Model(data)
            });
            me.radio.on('change', function(model) {
                let triggerType = model.get('value');
                me.showTrigger(triggerType);
            });
            me.$el.find('.pass-trigger-con').html(me.radio.$el);
            me.$el.find('.pass-workprocess-heshi').show();
            me.showTrigger(triggerType, unshowCondiotion);
        },
        showTrigger(triggerType, unshowCondiotion) {
            if (typeof triggerType == 'undefined') {
                triggerType = 1;
            }
            let me = this;
            if (triggerType == 1) {
                me.$el.find('.trigger-operator').show();
                me.$el.find('.trigger-round').hide();
                me.$el.find('.trigger-fixed').hide();
                me.renderAction();
            } else if (triggerType == -1) {
                me.$el.find('.trigger-operator').hide();
                me.$el.find('.trigger-round').show();
                me.$el.find('.trigger-fixed').hide();
                this.renderCircle();
            } else if (triggerType == 2) {
                me.$el.find('.trigger-operator').hide();
                me.$el.find('.trigger-round').hide();
                me.$el.find('.trigger-fixed').hide();
            } else if (triggerType == 5) {
                me.$el.find('.trigger-fixed').show();
                me.$el.find('.trigger-operator').hide();
                me.$el.find('.trigger-round').hide();
                me.renderTimeTrigger();
            }
            if (me.accountObj && me.accountObj.get('value') && !unshowCondiotion) {
                me.rendCondition(me.accountObj.get('value'), '', triggerType);
            }
        },
        renderTimeTrigger() {
            let me = this;
            me.timetrigger && me.timetrigger.destroy();
            let flowData = me.model.get('flowData');

            let entityId = me.accountObj ? me.accountObj.get('value') : flowData.entityId;

            let data = {
                entityId: entityId,
                TimeTriggerDes: me.TimeTriggerDes || ''
            };

            if (this.get('formNext') || this.id) {
                data.readonly = true;
            } else {
                data.readonly = false;
            }

            if (flowData && flowData.rule && flowData.rule.triggerTypes.indexOf(5) > -1) {
                data.quartz = flowData.rule.quartz;
            }

            this.timetrigger = new TimeTrigger({
                model: new Backbone.Model(data)
            });
            this.$el.find('.pass-trigger-con6').append(this.timetrigger.$el);
        },
        rendCondition(entityId, workflowRule, triggerType) {
            let me = this;
            let rule = workflowRule ? workflowRule : '';
            rule.entityId = entityId;

            let data = {
                fromModule: 'filter',
                fromApp: 'workprocess',
                apiName: entityId
            };

            if (rule.conditions) {
                data.originalConditions = {
                    conditionPattern: rule.conditionPattern,
                    conditions: rule.conditions
                };
            }
            if (triggerType) {
                data.triggerType = triggerType;
            }
            me.conditionView && me.conditionView.destroy();
            me.conditionView = new PaasUI.filter({
                model: new Backbone.Model(data)
            });
            me.$el.find('.paas-workprocess-filter-condition').append(me.conditionView.$el);
        },
        setNextData(data) {
            this.model.set('flowData', data);
            this.model.set('formNext', 1);
            this.renderObj(data);
            let triggerTypes = parseInt(data.rule.triggerTypes[0]);
            let radioValue = [1, 3].indexOf(triggerTypes) > 0 ? 1 : triggerTypes;
            this.renderRadio(radioValue, 1);
        },
        validate() {
            let workflowId = this.formCom[1].get('value');
            if (/^[\u3220-\uFA29]+$/.test($.trim(workflowId))) {
                this.formCom[1].error($t('API名称不能输入中文字符，请重新填写'));
                return;
            }

            //设置触发条件统计
            let ok = 1;
            _.each(this.formCom, function(item) {
                if (!item.validate()) {
                    ok = 0;
                }
            });
            if (ok && this.accountObj.validate() && this.radio.validate()) {
                let radioVal = parseInt(this.radio.get('value'));
                if (radioVal == 1) {
                    if (!this.accountAction.validate()) {
                        return;
                    }
                } else if (radioVal == -1) {
                    if (!this.circle.validate()) {
                        return;
                    }
                } else if (radioVal == 5) {
                    if (!this.timetrigger.validate()) {
                        return;
                    }
                }
                if (this.conditionView && !this.conditionView.validate()) {
                    return;
                }
                //判断apiName是否重复
                let data = this.getData();
                let flowData = $.extend({}, this.model.get('flowData'), this.getData());
                let operationId = 'Add';
                let triggerType = data.rule.triggerTypes;
                if (triggerType.indexOf(3) > -1) {
                    operationId = 'Drop';
                } else if (triggerType.indexOf(-1) > -1) {
                    operationId = 'Cyclic';
                } else if (triggerType.indexOf(2) > -1) {
                    operationId = 'Update';
                }
                if (this.id) {
                    flowData.id = this.id;
                    this.trigger('entrance', flowData);
                } else {
                    this.checkWorkFlowId(data.sourceWorkflowId, function() {
                        this.trigger('entrance', flowData);
                    });
                }
                CRM.util.uploadLog && CRM.util.uploadLog('s-Workflow', 'setting', {
                    operationId: operationId,
                    eventType: 'cl',
                    eventData: {
                        apiName: flowData.entityId
                    }
                });
            }
        },
        getData() {
            let data = {};
            let me = this;
            let flowData = this.model.get('flowData');
            _.each(this.formFields, (item, index) => {
                let component = me.formCom[index];
                if (component) {
                    if (item.name == 'sourceWorkflowId') {
                        data[item.name] = component.get('value') + '_crmwf';
                    } else {
                        data[item.name] = component.get('value');
                    }
                }
            });
            data.entityId = this.accountObj.get('value');
            data.entityName = this.accountObj.get('label');
            if (flowData && flowData.rule) {
                data.rule = flowData.rule;
            } else {
                data.rule = {};
            }
            let triggerType = parseInt(this.radio.get('value'));
            if (triggerType == 1) {
                triggerType = parseInt(this.accountAction.get('value'));
            } else if (triggerType == -1) {
                data.rule.scheduleTime = this.circle.getData();
            } else if (triggerType == 5) {
                data.rule.quartz = this.timetrigger.getData();
            }
            data.rule.triggerTypes = [triggerType];
            if (me.conditionView) {
                let conditions = this.conditionView.getData();
                if (conditions && conditions.conditionPattern) {
                    data.rule.conditionPattern = conditions.conditionPattern;
                    data.rule.conditions = conditions.conditions;
                } else {
                    data.rule.conditionPattern = '';
                    data.rule.conditions = [];
                }
            }
            return data;
        },
        handleSave() {
            console.log(8908);
        },
        fetchObjectList(flowInfo) {
            let me = this;
            utils.FHHApi({
                url: '/EM1HPROCESS/MetadataAction/FindCustomObjs',
                data: {
                    packageName: 'CRM',
                    includeFieldsDesc: false
                },
                success(data) {
                    if (data.Result.StatusCode == 0) {
                        let options = [];
                        let objects = data.Value.customObjects;
                        let entries = [];
                        _.each(objects, function(item) {
                            entries.push(item);
                            options.push({
                                label: item.displayName,
                                value: item.objApiName
                            });
                        });
                        me.model.set('cacheObjList', options);
                        me.renderObj(flowInfo);
                    }
                }
            });
        },
        renderObj(data) {
            let me = this;
            let value = '';
            let readonly = false;
            if ((data && data.entityId) || this.get('formNext')) {
                value = data.entityId;
                readonly = true;
            }
            let selectData1 = {
                name: "selector1",
                value: value,
                label: $t('对象'),
                type: 'select_one',
                options: me.get('cacheObjList'),
                readonly: readonly,
                useSearch: true,
                required: true
            };
            //选择客户
            me.accountObj = new PaasUI.field.select_one({
                model: new Backbone.Model(selectData1)
            });
            me.accountObj.on('change', function(model) {
                let val = model.get('value');
                if (val != '-1' && val) {
                    PaasUI.utils.api.fetchDescribeUsedInWorkProcess({
                        apiName: val
                    }).then((data) => {
                        me.set('tiggerConfig', data.triggerConfig);
                        //获取定时触发描述
                        let TimeTriggerDes = _.filter(data.triggerConfig, (item) => {
                            return item.triggerType == 5
                        });
                        if (TimeTriggerDes && TimeTriggerDes.length) {
                            me.TimeTriggerDes = TimeTriggerDes[0].description;
                        }
                        me.renderRadio();
                        me.fetchMemberList();
                    });
                }
            });
            me.$el.find('.pass-trigger-con2').html(me.accountObj.$el);
        },
        renderAction() {
            let lables = '';
            let readonly = false;
            let data = this.model.get('flowData');
            let value = '1';
            if (data && data.rule.triggerTypes[0]) {
                let triggerTypes = parseInt(data.rule.triggerTypes[0]);
                value = [1, 3].indexOf(triggerTypes) > 0 ? triggerTypes : '1';
            }
            if (data) {
                readonly = true;
            }
            let selectData2 = {
                name: "selector2",
                value: value,
                label: lables,
                type: 'select_one',
                options: this.activities,
                readonly: readonly,
                required: true
            };
            //选择触发动作
            this.accountAction = new PaasUI.field['select_one']({
                model: new Backbone.Model(selectData2)
            });
            this.$el.find('.pass-trigger-con3').html(this.accountAction.$el);
        },
        show(data) {
            let me = this;
            let formFields = me.formFields;
            if (data) {
                me.model.set('flowData', data);
                if (data.id) {
                    me.id = data.id;
                }
                _.each(formFields, (item) => {
                    item.value = data[item.name] || '';
                });
            } else {
                _.each(formFields, (item) => {
                    item.value = '';
                });
            }
            let _html = template({
                data: formFields
            });
            let $elem = $(_html);
            me.$el.html($elem).css({
                overflow: 'visible'
            });
            BaseView.prototype.show.call(me);
            me.rendFormComs(data);
            me.fetchObjectList(data);
            if (data) {
                let triggerTypes = parseInt(data.rule.triggerTypes[0]);
                let radioValue = [1, 3].indexOf(triggerTypes) > 0 ? 1 : triggerTypes;
                // PaasUI.utils.fetchWorkProcessDescription(data.entityId, function(res) {
                //     me.set('tiggerConfig', res.triggerConfig);
                //     me.renderRadio(radioValue, 1);
                //     let rule = '';
                //     if (data.rule.conditionPattern) {
                //         rule = {
                //             conditionPattern: data.rule.conditionPattern,
                //             conditions: data.rule.conditions
                //         };
                //     }
                //     me.rendCondition(data.entityId, rule, triggerTypes);
                //     me.fetchMemberList();
                // });
                PaasUI.utils.api.fetchDescribeUsedInWorkProcess({
                    apiName: data.entityId
                }).then((res) => {
                    me.set('tiggerConfig', res.triggerConfig);
                    //获取定时触发描述
                    let TimeTriggerDes = _.filter(res.triggerConfig, (item) => {
                        return item.triggerType == 5
                    });
                    if (TimeTriggerDes && TimeTriggerDes.length) {
                        me.TimeTriggerDes = TimeTriggerDes[0].description;
                    }
                    me.renderRadio(radioValue, 1);
                    let rule = '';
                    if (data.rule.conditionPattern) {
                        rule = {
                            conditionPattern: data.rule.conditionPattern,
                            conditions: data.rule.conditions
                        };
                    }
                    me.rendCondition(data.entityId, rule, triggerTypes);
                    me.fetchMemberList();
                });
            }
        },
        fetchMemberList() {
            //PaasUI.utils.fetchFieldData('PersonnelObj', function() {
            //me.mermberObjList = member;
            //callback && callback.call(me, entityId, rule, triggerTypes);
            //})
        },
        //渲染form中各种文本框
        rendFormComs(data) {
            let me = this;
            let formFields = this.formFields;
            if (data && data.id) {
                formFields[1].readonly = true;
            } else {
                formFields[1].readonly = false;
            }
            if (data && data.sourceWorkflowId) {
                formFields[1].value = data.sourceWorkflowId.replace('_crmwf', '');
            } else {
                formFields[1].value = 'crmwf' + FunUtils.generateId(10);
            }
            me.formCom = [];
            _.each(formFields, function(item, index) {
                me.formCom[index] = new PaasUI.field[item.type]({
                    model: new Backbone.Model(item)
                });
                if (item.name == 'name') {
                    me.formCom[index].on('change', () => {
                        let value = me.formCom[index].model.get('value');
                        me.trigger('nameChange', value);
                    })
                }
                me.$el.find('.item-input-' + item.name).html(me.formCom[index].$el);
            });
            /*
            me.formCom = new PaasUI.formCom({
                $el: me.find('.paas-workprocess-entrance'),
                data: [formFields]
            });
            */
        },
        hide() {
            this.destroy();
        }
    });

    module.exports = EntranceView;
});