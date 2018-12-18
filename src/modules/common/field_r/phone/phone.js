define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const TextView = require('paas-workprocess-modules/common/field/text/text');

    const PhoneView = TextView.extend({
        validate() {
            let isOk = BaseView.prototype.validate.call(this);

            if (isOk == false) {
                return false;
            }

            let val = this.model.get('value');
            let matcher = /^[0-9+-;,]{0,100}$/;
            if (val && !matcher.test(val)) {
                this.error('请输入正确的电话号码');
                return false;
            }

            this.rmError();

            return true;
        }
    });

    module.exports = PhoneView;
});