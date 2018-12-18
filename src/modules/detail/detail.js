define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const Card = require('paas-workprocess-modules/common/card/card');
    const template = require('paas-workprocess-modules/detail/detail-html');
    //const ConditionView = require('paas-workprocess-modules/trigger/components/condition/condition');
    //const VariablesData = require('paas-workprocess-assets/data/vardata');

    const FlowDetail = BaseView.extend({
        className: 'workprocess-detail',
        initialize(options) {
            let me = this;
            me.options = options;
            BaseView.prototype.initialize.call(me, options);

            this.cavasGates = [];
            this.cavasLins = [];
            this.getGateList();
            this.card = {};
            this.conCard = {};

            let _html = template({
                cavasGates: this.cavasGates,
                cavasLins: this.cavasLins,
                useToolbar: me.options.useToolbar,
                fullScreen: me.options.fullScreen,
            });
            this.$el.html(_html);
            /*
            this.conditionView = new ConditionView({
                model: new Backbone.Model({
                    apiName: this.options.data.entityId,
                    from: 1
                })
            });
            */
            this.getFields(this.checkFields);
        },
        events: {
            'hover .wf-square': 'showTaskDetail',
            'hover .wf-rhomb': 'showConditionDetail',
            'click .svg-full-screen-icon': 'fullScreenSwitch',
            'click .svg-zoom-in-icon': 'zoomIn',
            'click .svg-zoom-out-icon': 'zoomOut',
            'click .svg-location-icon': 'locateCurrentTask'
        },
        hideConditionDetail(e) {
            let num = parseInt($(e.target).parents('.canvas-div').attr('num'));
            this.conCard[num] && this.conCard[num].destroy();
        },
        getFields(callback) {
            let me = this;
            PaasUI.utils.api.fetchDescribe({
                apiName: me.options.data.entityId,
                success(data) {
                    me.model.set('obj', data);
                    let fields = data.objectDescribe.fields;
                    _.each(fields, function(item) {
                        item.value = item.api_name;
                    });
                    me.model.set('fields', fields);
                    callback.apply(me);
                }
            });
            // PaasUI.utils.fetchFieldData(me.options.data.entityId, function(data) {
            //     me.model.set('obj', data);
            //     let fields = data.objectDescribe.fields;
            //     _.each(fields, function(item) {
            //         item.value = item.api_name;
            //     });
            //     me.model.set('fields', fields);
            //     callback.apply(me);
            // });
        },
        //判断字段是否存在
        checkFields() {
            let me = this;
            let fields = me.model.get('fields');
            let data = me.options.data;
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
        handleFields(fields) {
            _.each(fields, (field) => {
                if (field.type == 'country' || field.type == 'province' || field.type == 'city') {
                    field.type = 'select_one';
                    field.sub_type = 'country';
                }
            });
            return fields;
        },
        //把线按照顺序排列到数据中
        getLines(startId) {
            let triggerData = this.options.data;
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
        showTaskDetail(e) {
            let target = $(e.target).closest('.wf-square');
            let num = parseInt($(e.target).parents('.canvas-div').attr('num'));
            if (this.card[num]) {
                target.find('.wf-detail-card').toggle();
                return;
            }
            //查找数据
            let triggerData = this.options.data;
            let tmp = _.findWhere(triggerData.workflow.activities, {
                id: target.attr('id')
            });
            if (tmp) {
                this.card[num] = new Card({
                    model: new Backbone.Model({
                        itemList: tmp.itemList,
                        entityId: triggerData.entityId
                    })
                });
                this.card[num].on('loadMember', function(data, index) {
                    let ele = this.$el.find('.wk-manager-content .remind-text p');
                    let html = ele.html();
                    let label = [];
                    if (html.indexOf($t('分配给')) > -1) {
                        let tmp = html.replace($t('分配给：'), '')
                        if (tmp.indexOf($t('，')) > -1) {
                            label = tmp.split($t('，'));
                        }
                    }
                    label.splice(index, 0, '<i>' + data.name + '</i>');
                    label = label.join($t('，'));
                    ele.html(`${$t("分配给：")}${label}`);
                });
                target.find('.wf-detail-card').append(this.card[num].$el);
                target.find('.wf-detail-card').show();
            }
        },
        showConditionDetail(e) {
            let ele = $(e.target);
            let target = ele.closest('.wf-rhomb');
            let parent = ele.parents('.canvas-div');
            //let num = parseInt(parent.attr('num'));
            if (target.attr('on')) {
                target.find('.wf-detail-card').toggle();
                return;
            }
            //查找数据
            let triggerData = this.options.data;
            let nodeLineId = $($('.wf-horizontal-line', parent)[0]).attr('id');
            let curNodeData = _.findWhere(triggerData.workflow.transitions, {
                id: nodeLineId
            });
            if (curNodeData && curNodeData.condition) {
                let conditionLabel = new PaasUI.filterAnalyze({
                    model: new Backbone.Model({
                        fromApp: 'workprocess',
                        fromModule: 'branch',
                        originalConditions: curNodeData.condition,
                        apiName: triggerData.entityId
                    })
                });
                target.find('.wf-detail-card').html(conditionLabel.$el).show();
                target.attr('on', true);
            }
        },
        getGateList() {
            let me = this;
            let triggerData = this.options.data;
            this.gateLists = [];
            this.getLines('start');
            if (this.gateLists.length > 0) {
                _.each(this.gateLists, function(item, index) {
                    me.cavasGates[index] = [];
                    let tmp = _.findWhere(triggerData.workflow.activities, {
                        id: item.toId
                    });
                    me.cavasGates[index].push(tmp);
                    me.cavasLins.push(item);

                    me.getTransList(tmp.id, index, 1);
                });
            } else {
                return false;
            }
        },
        //获取对应的线
        getTransList(id, index, type) {
            let triggerData = this.options.data;
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
            let triggerData = this.options.data;
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
        },
        zoomIn(e) {
            e && e.stopPropagation();
            let workprocessflow = this.$el.find('.canvas-con');
            let k = parseFloat(workprocessflow.attr('k')) || 1;

            k = k > 10 ? 1 : k;
            if (k < 2) {
                k += 0.1;
                workprocessflow.css({
                    'transform': `scale(${k})`,
                    'transform-origin': '0 0'
                }).attr('k', k);
            }
        },
        zoomOut(e) {
            e && e.stopPropagation();
            let workprocessflow = this.$el.find('.canvas-con');
            let k = parseFloat(workprocessflow.attr('k')) || 1;
            k = k > 10 ? 1 : k;
            if (k > 0) {
                k -= 0.1;
                workprocessflow.css({
                    'transform': `scale(${k})`,
                    'transform-origin': '0 0'
                }).attr('k', k);
            }
        },
        locateCurrentTask(e) {
            e && e.stopPropagation();
            let workprocessflow = this.$el.find('.canvas-con');
            workprocessflow.removeAttr('k').removeAttr('style');
        },
        //全屏展示/关闭
        fullScreenSwitch(e) {
            e.stopPropagation();
            this.trigger('fullScreenSwitch');
        }
    });
    module.exports = FlowDetail;
})