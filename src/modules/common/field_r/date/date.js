define(function(require, exports, module) {

    const BaseView = require('paas-workprocess-modules/common/base/base');
    const DatePicker = require('paas-workprocess-modules/common/calendar/calendar');
    const template = require('./date-html');
    const moment = require('base-moment');

    const TextView = BaseView.extend({
        template: template,
        className: 'process-date-con',
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            this.createDatePicker();
            let label;
            if (!(typeof this.get('label') == 'string' && this.get('label').indexOf('${') > -1)) {
                let type = this.get('type');
                label = moment.unix(this.get('value') / 1000);
                if (type == 'date_time') {
                    label = label.format("YYYY年MM月DD日 HH:mm");
                } else if (type == 'time') {
                    label = label.format("HH:mm");
                } else {
                    label = label.format("YYYY年MM月DD日");
                }
            } else {
                label = this.get('label');
            }
            this.setValue(label, this.get('value'));
            this.bindEvent();
        },
        bindEvent() {
            let me = this;
            me.$el.find('.date-input').on('click', function() {
                me.date.show();
            });
            me.$el.find('.span-close').on('click', function() {
                me.setValue('', '');
            });
            $('body').on('click', function(event) {
                event.preventDefault();
                if (!$(event.target).closest('.process-date-con').length) {
                    me.date.hide();
                }
            });
        },
        validate() {
            let val = this.model.get('value');
            let required = this.model.get('required');

            if (required && (val == '')) {
                this.error('请选择日期');
                return false;
            }
            this.rmError();
            return true;
        },
        clear() {
            this.model.set('value', '');
        },
        setValue(label, value) {
            if (value == '') {
                label = '<em>点击选择日期</em>';
            } else {
                if (label.indexOf('${') > 1 && label.indexOf('bpm-vars') == -1) {
                    label = '<span class="bpm-vars">' + label + '</span>';
                }
            }
            this.model.set('value', value);
            this.model.set('label', label);
            this.$el.find('.date-input').html(label);
            this.trigger('change', this);
        },
        hideDatepicker() {
            this.datepicker.hide();
        },
        createDatePicker() {
            let me = this;
            let value = me.model.get('value');
            if (typeof value == 'string' && value.indexOf('${') > -1) {
                value = '';
            }
            let type = 'date';
            if (me.model.get('type')) {
                type = me.model.get('type');
            }
            let selectData = {
                name: "selector",
                value: value,
                label: '',
                type: type
            };
            let model2 = new Backbone.Model(selectData);
            this.date = new DatePicker({
                model: model2
            });
            this.date.on('change', function(value) {
                me.setValue(value.label, value.value);
            });
            this.$el.append(this.date.$el);
        }
    });

    module.exports = TextView;
});