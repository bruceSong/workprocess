define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const TextView = require('paas-workprocess-modules/common/field/text/text');

    const EmailView = TextView.extend({
        validate() {
            let isOk = BaseView.prototype.validate.call(this);

            if (isOk == false) {
                return false;
            }

            let val = this.model.get('value');
            let matcher = /^\w+([+-.]\w+)*@\w+(\.\w+)+$/;
            if (val && !matcher.test(val)) {
                this.error('请输入正确的电子邮箱');
                return false;
            }
            this.rmError();
            return true;
        }
    });

    module.exports = EmailView;
});