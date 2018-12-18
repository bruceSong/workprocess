define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const moment = require('base-moment');

    const DateTime = BaseView.extend({
        events: {
            'click .bpm-datetime span': 'clearValue'
        },
        render() {
            this.__render.delay(this, 50);
        },
        __render() {
            let readonly = this.get('readonly');
            if (readonly == true) {
                let $container = $('<div class="bpm-text bpm-readonly"></div>');
                this.$el.append($container);

                let v = this.get('value');
                $container.html(moment.unix(v / 1000).format("YYYY-MM-DD HH:mm"));
            } else {
                let $container = $('<div class="bpm-datetime"><span>×</span></div>');
                this.$el.append($container);
                this.dateTime = $container.Spark({
                    type: "datepicker.datepicker-input",
                    option: {
                        placeholder: "点击选择日期时间",
                        islabel: false,
                        isicon: false
                    }
                });
                this.dateTime.on('change', this.handleChange.bind(this));
                let val = this.get('value');
                if (typeof val == 'string' && val.indexOf('${') > -1) {
                    this.setValue(this.get('label'), val);
                } else if (val) {
                    this.dateTime.setValue(val);
                }
            }

        },
        setValue(label, value) {
            this.$el.find('.u-datepicker-input input').css('color', '#6aab3e').val(label);
            this.set('value', value);
            this.trigger('change', this);
        },
        handleChange(e) {
            var date = new Date();
            date.setFullYear(e.year);
            date.setMonth(e.month - 1);
            date.setDate(e.day);
            date.setHours(e.hour);
            date.setMinutes(e.minite);
            this.model.set('value', date.getTime());
            this.$el.find('.u-datepicker-input input').css('color', '');
            this.trigger('change', this);
        },
        clearValue() {
            this.dateTime.clear();
            this.set('value', null);
        }
    });

    module.exports = DateTime;
});