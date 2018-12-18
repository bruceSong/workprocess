define(function(require, exports, module) {

    const BaseView = require('paas-workprocess-modules/common/base/base');
    const DatePicker = require('base-modules/calendar/datepicker');
    const template = require('./date-html');

    const TextView = BaseView.extend({
        template: template,
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);

            let readonly = this.model.get('readonly');
            if (!readonly) {
                this.createDatePicker();
            }
        },
        validate() {
            let val = this.model.get('value');
            let required = this.model.get('required');

            if (required && (val == '')) {
                this.error('请填写日期');
                return false;
            }
            this.rmError();
            return true;
        },
        clear() {
            this.model.set('value', '');
        },
        setValue(label, value) {
            this.$el.find('.f-g-datepicker-input').css('color', '#6aab3e').val(label);
            this.model.set('value', value);
            this.trigger('change', this);
        },
        hideDatepicker() {
            this.datepicker.hide();
        },
        createDatePicker() {
            let me = this
            if (!me.datepicker) {
                let value = me.model.get('value');
                if (typeof value == 'string' && value.indexOf('${') > -1) {
                    value = '';
                }
                me.datepicker = new DatePicker({
                    element: me.$el.find('.bpm-date'),
                    placeholder: '请选择日期',
                    formatStr: 'YYYY-MM-DD',
                    defaultValue: value
                });
                me.datepicker.on('change', (date) => {
                    me.$el.find('.f-g-datepicker-input').css('color', '');
                    let v = date && date._d && new Date(date._d).getTime();
                    me.model.set('value', v);
                    me.trigger('change', me);
                });
                if (typeof me.model.get('value') == 'string' && me.model.get('value').indexOf('${') > -1) {
                    this.setValue(me.get('label'), me.model.get('value'));
                }
            }
        }
    });

    module.exports = TextView;
});