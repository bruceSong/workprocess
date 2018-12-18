define(function(require, exports, modules) {

    const BaseView = require('paas-workprocess-modules/common/base/base');
    const moment = require('base-moment');
    const template = require('./calendar-html');

    const Calendar = BaseView.extend({
        template: template,
        className: 'flow-calendar',
        events: {
            'click .left-btn': 'rendPrevMonth',
            'click .right-btn': 'rendNextMonth',
            'click .day-item': 'setDate',
            'click .hours>li': 'setHours',
            'click .minutes>li': 'setMinutes',
            'click .flow-calendar-ensure': 'handleEnsure'
        },
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            this.date = new Date();
            this.date.setHours(0);
            this.date.setMinutes(0);
            this.date.setSeconds(0); //初始化秒
            this.date.setMilliseconds(0); //初始化毫秒
            this.getDefaultValue();
            this.rendContent();
        },
        getDefaultValue() {
            let value = this.get('value');
            let dateReg = /^\d{4}-\d{1,2}-\d{1,2}$/;
            if ((typeof value == 'string' && dateReg.test(value))) {
                let d = value.split('-');
                this.date.setFullYear(parseInt(d[0]));
                this.date.setMonth(parseInt(d[1]));
                this.date.setDate(parseInt(d[2]));
                //this.set('hasDefaultValue', true);
                this.defaultDate = new Date();
                this.defaultDate.setTime(this.date.getTime());
            } else if (typeof value == 'number') {
                this.date.setTime(value);
                //this.set('hasDefaultValue', true);
                this.defaultDate = new Date();
                this.defaultDate.setTime(this.date.getTime());
            }
        },
        rendContent() {
            // 头部日期
            let time = this.date.getTime();
            let yearAndMonth = moment.unix(time / 1000).format("YYYY年MM月");
            this.find('.year-and-month').html(yearAndMonth);

            let d = new Date();
            d.setTime(time);
            d.setDate(1);
            // 本月第一天是星期几
            let theFirstDay = d.getDay();
            let month = d.getMonth();
            d.setMonth(month + 1);
            d.setDate(0);
            // 本月有多少天
            let theMonthDays = d.getDate();
            // 本月最后一天是星期几
            let theLastDay = d.getDay();

            d.setMonth(month);
            d.setDate(0);
            // 上个月有多少天
            let prevMonthDays = d.getDate();

            d.setMonth(month + 2);
            d.setDate(0);
            // 下个月有多不天
            //let nextMonthDays = d.getDate();

            let _html = [];
            theFirstDay = theFirstDay == 0 ? 7 : theFirstDay;
            for (let i = theFirstDay - 2; i >= 0; i--) {
                let tm = prevMonthDays - i;
                _html.push('<div class="day-item gray">' + tm + '</div>');
            }

            // 今天是几号
            let today = new Date().getDate();
            for (let i = 1; i <= theMonthDays; i++) {
                if (this.defaultDate) {
                    if (this.date.getFullYear() == this.defaultDate.getFullYear() &&
                        this.date.getMonth() == this.defaultDate.getMonth() &&
                        i == this.defaultDate.getDate()
                    ) {
                        _html.push('<div class="day-item today">' + i + '</div>');
                    } else if (today == i) {
                        _html.push('<div class="day-item current">' + i + '</div>');
                    } else {
                        _html.push('<div class="day-item">' + i + '</div>');
                    }
                } else {
                    if (today == i) {
                        _html.push('<div class="day-item current">' + i + '</div>');
                    } else {
                        _html.push('<div class="day-item">' + i + '</div>');
                    }
                }
            }
            theLastDay = theLastDay == 0 ? 7 : theLastDay;
            for (let i = 1; i <= 7 - theLastDay; i++) {
                _html.push('<div class="day-item gray">' + i + '</div>');
            }

            _html = _html.join('');

            this.find('.content').html(_html);

            let type = this.get('type');
            if (type == 'time' || type == 'date_time') {
                this.rendHoursAndMinutes();
            }
        },
        show() {
            this.$el.show();
        },
        hide() {
            this.$el.hide();
        },
        rendPrevMonth() {
            let month = this.date.getMonth();
            this.date.setMonth(month - 1);
            this.rendContent();
        },
        rendNextMonth() {
            let month = this.date.getMonth();
            this.date.setMonth(month + 1);
            this.rendContent();
        },
        rendHoursAndMinutes() {
            let type = this.get('type');
            let _hours = [];
            for (let i = 0; i < 24; i++) {
                if (this.defaultDate && this.defaultDate.getHours() == i) {
                    _hours.push('<li class="active"><span>' + i + '</span></li>');
                } else {
                    if (type == 'time' && i == 0) {
                        _hours.push('<li class="active"><span>' + i + '</span></li>');
                    } else {
                        _hours.push('<li><span>' + i + '</span></li>');
                    }
                }
            }
            _hours = _hours.join('');
            this.find('ul.hours').html(_hours);

            let _minutes = [];
            for (let i = 0; i < 60; i = i + 5) {
                if (this.defaultDate && this.defaultDate.getMinutes() == i) {
                    _minutes.push('<li class="active"><span>' + i + '</span></li>');
                } else {
                    if (type == 'time' && i == 0) {
                        _minutes.push('<li class="active"><span>' + i + '</span></li>');
                    } else {
                        _minutes.push('<li><span>' + i + '</span></li>');
                    }
                }
            }
            _minutes = _minutes.join('');
            this.find('ul.minutes').html(_minutes);

            if (!this.defaultDate && this.get('type') == 'date_time') {
                this.find('.time-content-box').addClass('gray');
            }
        },
        setDate(e) {
            if ($(e.target).hasClass('gray') || $(e.target).closest('days').length) {
                return;
            }
            // 设置日期
            let day = parseInt($(e.target).text());
            this.date.setDate(day);
            // 高高操作
            this.find('.day-item').removeClass('today');
            $(e.target).addClass('today');
            this.find('.time-content-box').removeClass('gray');

            // 如果类型为date_time， 同时设置小时和分种为0
            let type = this.get('type');
            if (type == 'date_time') {
                this.date.setHours(0);
                this.date.setMinutes(0);
                this.find('ul.hours>li').removeClass('active').eq(0).addClass('active');
                this.find('ul.minutes>li').removeClass('active').eq(0).addClass('active');
            }

            // 如果类型为date，则触发确定动作
            if (type == 'date') {
                this.handleEnsure();
            }
        },
        setHours(e) {
            if (!this.find('.time-content-box').hasClass('gray')) {
                let $elem = $(e.currentTarget);
                this.find('ul.hours>li').removeClass('active');
                $elem.addClass('active');
                let hours = parseInt($elem.text());
                this.date.setHours(hours);
            }

        },
        setMinutes(e) {
            if (!this.find('.time-content-box').hasClass('gray')) {
                let $elem = $(e.currentTarget);
                this.find('ul.minutes>li').removeClass('active');
                $elem.addClass('active');
                let minutes = parseInt($elem.text());
                this.date.setMinutes(minutes);
            }
        },
        handleEnsure() {
            // 如果已经选择了日期，则派发change事件
            let type = this.get('type');
            let time = this.date.getTime();
            if (type == 'date_time' && this.find('div.today').length > 0) {
                let formatDate = moment.unix(time / 1000).format("YYYY年MM月DD日 HH:mm");
                this.trigger('change', {
                    value: time,
                    label: formatDate
                });
            }

            if (type == 'time') {
                let formatDate = moment.unix(time / 1000).format("HH:mm");
                this.trigger('change', {
                    value: time,
                    label: formatDate
                });
            }

            if (type == 'date') {
                let formatDate = moment.unix(time / 1000).format("YYYY年MM月DD日");
                this.trigger('change', {
                    value: time,
                    label: formatDate
                });
            }

            this.hide();
        }
    });

    modules.exports = Calendar;
});