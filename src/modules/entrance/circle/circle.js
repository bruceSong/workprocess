define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    //const Select = require('paas-workprocess-modules/common/field/select/select');
    const Time = require('../time/time');
    const template = require('./circle-html');

    const ToolTip = BaseView.extend({
        template: template,
        events: {
            'click .workprocess-circle-month .bpm-text': 'showCalandar',
            'click .circle-month-calendar-link': 'setCalandar'
        },
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            if (!this.model.get('scheduleTime')) {
                this.model.set('scheduleTime', {
                    type: 'everyday',
                    when: []
                });
            }
            this.renderSelect();
            this.bindEvent();
        },
        bindEvent() {
            let me = this;
            window.PaasUI.Events.on('body:click', function() {
                if (me.$el.find('.circle-month-calendar').length) {
                    me.$el.find('.circle-month-calendar').hide();
                }
            });
        },
        showCalandar(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            if ($(e.target).closest('.readonly').length) {
                return;
            }
            let ele = this.$el.find('.workprocess-circle-month .circle-month-calendar');
            if (ele.css('display') == 'none') {
                ele.css('display', 'block');
            } else {
                ele.css('display', 'none');
            }
        },
        setCalandar(e) {
            e && e.preventDefault();
            e && e.stopPropagation();
            let ele = $(e.target);
            if (ele.hasClass('active')) {
                return;
            }
            this.$el.find('.circle-month-calendar-link').removeClass('active');
            let val = parseInt(ele.attr('data-value'));

            let label = val + $t('日');
            if (val == -1) {
                label = $t('每月最后一天');
            }
            this.$el.find('.workprocess-circle-month .bpm-text input').val(label);
            ele.addClass('active');
            this.$el.find('.circle-month-calendar').hide();

            let scheduleTime = this.model.get('scheduleTime');
            scheduleTime.when = [val];
            this.model.set('scheduleTime', scheduleTime);
            /*
            me.renderTime();
            this.$el.find('.workprocess-circle-time').show();
            */
        },
        renderTime() {
            let value = this.model.get('scheduleTime').time;
            let data = {
                name: "radio",
                value: value,
                type: 'time',
                readonly: false,
                required: true
            };
            //选择客户
            this.time = new Time({
                model: new Backbone.Model(data)
            });
            this.$el.find('.workprocess-circle-time').html(this.time.$el);
        },
        renderSelect() {
            let me = this;
            let scheduleTime = this.model.get('scheduleTime');
            let value = scheduleTime.type;
            let data = {
                label: '',
                value: value,
                options: [{
                    label: $t('每天'),
                    value: 'everyday'
                }, {
                    label: $t('每周'),
                    value: 'weekly'
                }, {
                    label: $t('每月'),
                    value: 'monthly'
                }]
            };
            if (this.model.get('readonly')) {
                data.readonly = true;
            } else {
                data.readonly = false;
            }
            me.select = new PaasUI.field.select_one({
                model: new Backbone.Model(data)
            });
            me.select.on('change', function(model) {
                let val = model.get('value');
                let scheduleTime = me.model.get('scheduleTime');
                scheduleTime.type = val;
                scheduleTime.when = [];
                me.model.set('scheduleTime', scheduleTime);
                if (val == 'weekly') {
                    me.renderWeek();
                    me.$el.find('.workprocess-circle-week').show();
                    me.$el.find('.workprocess-circle-month').hide();
                    //me.$el.find('.workprocess-circle-time').hide();
                } else if (val == 'monthly') {
                    me.renderMonth();
                    me.$el.find('.workprocess-circle-month').show();
                    me.$el.find('.workprocess-circle-week').hide();
                    //me.$el.find('.workprocess-circle-time').hide();
                } else {
                    me.$el.find('.workprocess-circle-month').hide();
                    me.$el.find('.workprocess-circle-week').hide();
                }
            });
            me.$el.find('.workprocess-circle-first').append(me.select.$el);
            if (value == 'weekly') {
                this.renderWeek();
            } else if (value == 'monthly') {
                this.renderMonth();
            }
        },
        renderWeek() {
            let value = '';
            let scheduleTime = this.model.get('scheduleTime');
            if (scheduleTime && scheduleTime.type && scheduleTime.type == 'weekly' && scheduleTime.when.length) {
                value = scheduleTime.when[0];
            }
            let me = this;
            let data = {
                label: $t('周几'),
                value: value,
                readonly: false,
                required: true,
                options: [{
                    label: $t('周一'),
                    value: 1
                }, {
                    label: $t('周二'),
                    value: 2
                }, {
                    label: $t('周三'),
                    value: 3
                }, {
                    label: $t('周四'),
                    value: 4
                }, {
                    label: $t('周五'),
                    value: 5
                }, {
                    label: $t('周六'),
                    value: 6
                }, {
                    label: $t('周日'),
                    value: 7
                }]
            };
            if (this.model.get('readonly')) {
                data.readonly = true;
            } else {
                data.readonly = false;
            }
            me.week = new PaasUI.field.select_one({
                model: new Backbone.Model(data)
            });
            me.week.on('change', function(model) {
                let value = model.get('value');
                if (value && value != '-1') {
                    let scheduleTime = me.model.get('scheduleTime');
                    scheduleTime.when = [parseInt(value)];
                    me.model.set('scheduleTime', scheduleTime);
                    //me.renderTime();
                    me.$el.find('.workprocess-circle-time').show();
                }
            });
            me.$el.find('.workprocess-circle-week').html(this.week.$el);
        },
        renderMonth() {
            let value;
            let scheduleTime = this.model.get('scheduleTime');
            if (scheduleTime && scheduleTime.type && scheduleTime.type == 'monthly' && scheduleTime.when.length) {
                value = scheduleTime.when[0];
            }
            let month = 31;
            let cur;
            let inputVal = value ? (value == -1 ? $t('每月最后一天') : `${value}${$t("日")}`) : $t('请选择');
            let curMonthClass = '';
            if (this.model.get('readonly')) {
                curMonthClass = ' readonly';
            } else {
                curMonthClass = '';
            }

            let html = '<div class="bpm-select_one"><div class="bpm-text ' + curMonthClass + '"><input readonly type="text" value="' + inputVal + '" ></div><div class="circle-month-calendar">';
            for (let i = 1; i <= month; i++) {
                if (i == value) {
                    cur = 'class="active"';
                } else {
                    cur = '';
                }
                html += '<a href="#" ' + cur + ' data-value="' + i + '" class="circle-month-calendar-link">' + i + '</a>';
            }
            if (value == -1) {
                cur = 'class="active"';
            } else {
                cur = '';
            }
            let theMonthLastDay = $t('每月最后一天');
            let selectDate = $t('请选择日期');
            html += `<span ${cur} data-value="-1" class="circle-month-calendar-link">${theMonthLastDay}</span></div><div class="error-msg">${selectDate}</div></div>`;
            this.$el.find('.workprocess-circle-month').html(html);
        },
        getData() {
            /*
            let type = this.select.get('value');
            let when = [];

            if (type == 'weekly') {
                when.push(this.week.get('value'));
            } else if (type == 'monthly') {
                when.push(this.get('monthValue'));
            }
            */
            return this.model.get('scheduleTime');
        },
        validate() {
            let scheduleTime = this.model.get('scheduleTime');
            let val = scheduleTime.type;
            if (!val || val == '-1') {
                this.select.error($t('请选择触发类型'));
                return false;
            } else {
                this.select.rmError();
            }
            if (val == 'weekly') {
                if (!this.week.validate()) {
                    return false;
                }
            }
            if (val == 'monthly') {
                if (!scheduleTime.when.length) {
                    this.$el.find('.workprocess-circle-month .error-msg').show();
                    return false;
                } else {
                    this.$el.find('.workprocess-circle-month .error-msg').hide();
                    return true;
                }
            }
            /*
            if (val == 'everyday' && !this.time.validate()) {
                return false;
            }
            */
            return true;
        }
    })
    module.exports = ToolTip;
});