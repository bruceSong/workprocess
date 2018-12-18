define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./percentile-html');

    const PercentileView = BaseView.extend({
        template: template,
        events: {
            'click': 'focus'
        },
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            let v = this.get('value') + '';
            this.find('.percentitle-code').css({
                left: v.length * 7 + 10
            });
        },
        bindEvents() {
            let me = this;
            this.$el.on('input', '.bpm-text>input', function(e) {
                let v = e.target.value;
                v = v.replace(/[^\d]+/g, '').slice(0, 10);
                e.target.value = v;
                me.model.set('value', v);

                me.find('.percentitle-code').css({
                    left: v.length * 7 + 10
                });
                me.trigger('change', me.model);
            });
        },
        validate() {
            let isOk = BaseView.prototype.validate.call(this);

            if (isOk == false) {
                return false;
            }

            let val = this.model.get('value');
            let required = this.model.get('required');
            if (required && val.length > 100) {
                this.error('单行文本不能多余100个字符');
                return false;
            }

            this.rmError();

            return true;
        },
        focus() {
            this.find('input').focus();
        }
    });

    module.exports = PercentileView;
});