define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./timetrigger-html');

    const TimeTrigger = BaseView.extend({
        template: template,
        events: {},
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            this.getFieldList();
            this.renderOperator();
            let quartz = this.get('quartz');
            if (quartz && typeof quartz.executionTime != 'undefined') {
                this.renderTime();
            }
            this.renderCircel();
            this.renderUnit();
            this.renderHistoryRadio();
        },
        //历史数据
        renderHistoryRadio() {
            let value = false;
            let quartz = this.get('quartz');
            if (quartz && quartz.fullData) {
                value = quartz.fullData;
            }
            let list = [{
                label: $t('否'),
                value: false
            }, {
                label: $t('是') + '(' + $t('新建、更新流程定义当天凌晨会匹配历史数据，满足条件会生成待办任务') + ')',
                value: true
            }];
            let data = {
                name: "",
                value: value,
                label: $t('历史数据'),
                type: 'radio',
                options: list,
                readonly: false,
                required: true
            };
            this.history = new PaasUI.field.radio({
                model: new Backbone.Model(data)
            });
            this.$el.find('.trigger-history-con').html(this.history.$el);
        },
        renderUnit(isShowHour, defaultValue) {
            this.unit && this.unit.destroy();
            let value = '';
            let quartz = this.get('quartz');
            if (quartz && quartz.intervalUnit) {
                value = quartz.intervalUnit;
                if (value == 'hour') {
                    isShowHour = true;
                }
            }

            let list = [{
                label: $t('小时'),
                value: 'hour'
            }, {
                label: $t('天'),
                value: 'day'
            }, {
                label: $t('周'),
                value: 'week'
            }, {
                label: $t('月'),
                value: 'month'
            }];
            if (!isShowHour) {
                list.splice(0, 1);
            }
            value = typeof defaultValue != 'undefined' ? defaultValue : value;
            let readonly = false;
            let data = {
                name: "intervalUnit",
                value: value,
                label: $t('单位'),
                type: 'select_one',
                options: list,
                readonly: readonly,
                required: true
            };
            this.unit = new PaasUI.field.select_one({
                model: new Backbone.Model(data)
            });
            this.$el.find('.pass-trigger-unit').html(this.unit.$el);
        },
        getFieldList() {
            let me = this;
            PaasUI.utils.api.fetchDescribe({
                apiName: me.get('entityId'),
                success(data) {
                    me.set('obj', data);
                    PaasUI.utils.getTimeTriggerInfilter(data).then((fields) => {
                        me.model.set('timeFields', fields);
                        me.renderFields();
                        me.renderValue();
                    });
                }
            });
        },
        renderFields() {
            let me = this;
            let list = me.get('timeFields');
            list = list.concat([{
                api_name: 'NOW()',
                type: 'date_time',
                label: $t('当前日期时间')
            }, {
                api_name: '${last_day_of_every_month}',
                type: 'date',
                label: $t('每月最后一天')
            }]);
            let readonly = false;
            let value = '';
            let quartz = this.get('quartz');
            if (quartz && quartz.sourceTime) {
                value = quartz.sourceTime;
            }
            if (value && ['NOW()', '${last_day_of_every_month}'].indexOf(value) == -1) {
                let arr = value.match(/\$\{(.*?)\}/);
                value = arr[1].split('.')[1];
            }
            let data = {
                name: "field",
                value: value,
                label: $t('字段'),
                type: 'select_one',
                options: list,
                readonly: readonly,
                useSearch: true,
                required: true
            };
            me.field = new PaasUI.field.select_one({
                model: new Backbone.Model(data)
            });
            me.field.on('change', function(model) {
                let field = _.findWhere(list, {
                    api_name: model.get('value')
                });
                if (!field) {
                    return;
                }
                let isNow = false;
                if (field.api_name == 'NOW()') {
                    isNow = true;
                }
                me.renderOperator(isNow, '');

                me.renderCircel('');
                me.renderValue('');

                let type = field.type;
                let isShowHour;
                me.set('type', type);
                if (type == 'date') {
                    me.$el.find('.timetrigger-container').show();
                    me.renderTime('');
                    isShowHour = false;
                } else {
                    me.$el.find('.timetrigger-container').hide();
                    if (me.time) {
                        me.time.destroy();
                        me.time = null;
                    }
                    isShowHour = true;
                }
                me.renderUnit(isShowHour, '');
            });
            me.$el.find('.pass-trigger-field').append(this.field.$el);
        },
        renderOperator(isNow, defaultValue) {
            this.operator && this.operator.destroy();
            let list = [{
                label: $t('之前'),
                value: 'before'
            }, {
                label: $t('之后'),
                value: 'after'
            }];
            if (isNow) {
                list.splice(0, 1);
            }
            let value = '';
            let quartz = this.get('quartz');
            if (quartz && quartz.operator) {
                value = quartz.operator;
            }
            value = typeof defaultValue != 'undefined' ? defaultValue : value;
            let readonly = false;
            let data = {
                name: "field",
                value: value,
                label: '',
                type: 'select_one',
                options: list,
                readonly: readonly,
                required: true
            };
            this.operator = new PaasUI.field.select_one({
                model: new Backbone.Model(data)
            });
            this.$el.find('.pass-trigger-operator').html(this.operator.$el);
        },
        renderValue(defaultValue) {
            let value = '';
            let label = '';
            let quartz = this.get('quartz');
            if (quartz && quartz.interval) {
                value = quartz.interval;
                //let res = PaasUI.utils.replaceRichText(value, this.get('obj'));
                //label = res.textList;
                label = PaasUI.utils.replaceRichTextV2Async({
                    content: value,
                    objAndRefObjList: this.model.get('obj')
                }).content;
            }
            if (typeof defaultValue != 'undefined') {
                value = defaultValue;
                label = '';
            }

            let data = {
                type: "number",
                entityId: this.get('entityId'),
                value: value,
                label: label,
                isHideLookupData: true,
                required: true
            };
            this.value = new PaasUI.calculate({
                model: new Backbone.Model(data)
            });
            this.$el.find('.pass-trigger-value').html(this.value.$el);
        },
        renderTime(defaultValue) {
            let list = [];
            for (let i = 0; i < 24; i++) {
                list.push({
                    label: i + $t('点'),
                    value: i
                });
            }
            let value = 10;
            let quartz = this.get('quartz');
            if (quartz && typeof quartz.executionTime != 'undefined') {
                value = quartz.executionTime;
                this.$el.find('.timetrigger-container').show();
            }
            value = typeof defaultValue != 'undefined' ? defaultValue : value;

            let readonly = false;
            let data = {
                name: "time",
                value: value,
                label: $t('时间'),
                type: 'select_one',
                options: list,
                readonly: readonly,
                required: true
            };
            this.time = new PaasUI.field.select_one({
                model: new Backbone.Model(data)
            });
            this.$el.find('.pass-trigger-time').html(this.time.$el);
        },
        renderCircel(defaultValue) {
            let list = [{
                label: $t('仅执行一次'),
                value: 'once'
            }, {
                label: $t('每天'),
                value: 'everyday'
            }, {
                label: $t('每周'),
                value: 'weekly'
            }, {
                label: $t('每月'),
                value: 'monthly'
            }, {
                label: $t('每年'),
                value: 'yearly'
            }];
            let value = '';
            let quartz = this.get('quartz');
            if (quartz && quartz.cycle) {
                value = quartz.cycle;
            }
            value = typeof defaultValue != 'undefined' ? defaultValue : value;

            let readonly = false;
            let data = {
                name: "time",
                value: value,
                label: $t('循环次数'),
                type: 'select_one',
                options: list,
                readonly: readonly,
                required: true
            };
            this.circle = new PaasUI.field.select_one({
                model: new Backbone.Model(data)
            });
            this.$el.find('.pass-trigger-cycles').html(this.circle.$el);
        },
        validate() {
            let me = this;
            if (!me.field.validate()) {
                return false;
            }
            if (!me.operator.validate() || !me.value.validate() || !me.unit.validate()) {
                return false;
            }
            if (me.get('type') == 'date' && me.time && !me.time.validate()) {
                return false;
            }
            if (!me.circle.validate()) {
                return false;
            }
            return true;
        },
        getData() {
            let me = this;
            let data = {
                sourceTime: '',
                operator: '',
                interval: '',
                intervalUnit: '',
                cycle: '',
                fullData: false
            };
            let sourceTime = me.field.get('value');
            if (['NOW()', '${last_day_of_every_month}'].indexOf(sourceTime) == -1) {
                sourceTime = '${' + me.get('entityId') + '.' + sourceTime + '}';
            }
            data.sourceTime = sourceTime;
            data.operator = me.operator.get('value');
            data.interval = me.value.get('value');
            data.intervalUnit = me.unit.get('value');
            if (me.time && typeof me.time.get('value') != 'undefined') {
                data.executionTime = me.time.get('value');
            }
            if (me.history) {
                let historyValue = me.history.get('value');
                if (historyValue === 'true' || historyValue === true) {
                    data.fullData = true;
                }
                if (historyValue === 'false' || historyValue === false) {
                    data.fullData = false;
                }
            }
            data.cycle = me.circle.get('value');
            return data;
        },
    })
    module.exports = TimeTrigger;
});