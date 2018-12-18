define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const moment = require('base-moment');

    const TimeView = BaseView.extend({
        events: {
            'click .bpm-time span': 'clearValue'
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
                $container.html(moment.unix(v / 1000).format("HH:mm"));
            } else {
                let $container = $('<div class="bpm-time"><span>×</span></div>');
                this.$el.append($container);
                this.dateTime = $container.Spark({
                    type: "form.time",
                    option: {
                        placeholder: "点击选择时间",
                        islabel: false,
                        isicon: false
                    }
                });
                this.dateTime.on('change', this.handleChange.bind(this));

                let val = this.get('value');
                if (typeof val == 'string' && val.indexOf('${') > -1) {
                    this.setValue(this.get('label'), val);
                } else if (val) {
                    this.setDefaultValue(val);
                }
            }

        },
        setValue(label, value) {
            this.$el.find('.u-time-input input').css('color', '#6aab3e').val(label);
            this.model.set('value', value);
            this.trigger('change', this);
        },
        setDefaultValue(value) {
            let date = new Date(value);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            this.dateTime.setValue(`${hours}:${minutes}`);
        },
        handleChange(e) {
            if (e === null) {
                this.model.set('value', '');
            } else {
                let date = new Date();
                date.setHours(e.hour);
                date.setMinutes(e.minite);
                this.model.set('value', date.getTime());
                this.$el.find('.u-time-input input').css('color', '');
            }
            this.trigger('change', this);
        },
        clearValue() {
            this.dateTime.clear();
            this.model.set('value', null);
        }
    });

    module.exports = TimeView;
});