define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./textarea-html');

    const TextAreaView = BaseView.extend({
        template: template,
        bindEvents() {
            let me = this;
            this.$el.on('input', 'textarea', (e) => {
                let _v = e.target.value;
                me.model.set('value', _v);
                me.trigger('change', me.model);
            });
        },
        validate() {
            let isOk = BaseView.prototype.validate.call(this);
            if (isOk == false) {
                return false;
            }
            let val = this.model.get('value');
            //let required = this.model.get('required');
            let maxLength = this.model.get('maxLength') > 0 ? this.model.get('maxLength') : 1000;
            if ((val && val.length > maxLength)) {
                this.error(this.model.get('label') + '不能多余' + maxLength + '个字符');
                return false;
            }

            this.rmError();

            return true;
        }
    });

    module.exports = TextAreaView;
});