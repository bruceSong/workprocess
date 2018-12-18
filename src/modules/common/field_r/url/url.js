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
            let matcher = /^(((http[s]?|ftp):\/\/|www\.)[a-z0-9\.\-]+\.([a-z]{2,4})|((http[s]?|ftp):\/\/)?(([01]?[\d]{1,2})|(2[0-4][\d])|(25[0-5]))(\.(([01]?[\d]{1,2})|(2[0-4][\d])|(25[0-5]))){3})(:\d+)?(\/[a-z0-9\$\^\*\+\?\(\)\{\}\.\-_~!@#%&:;\/=<>]*)?/;
            if (val && !matcher.test(val)) {
                this.error('请输入正确的网址');
                return false;
            }
            this.rmError();
            return true;
        }
    });

    module.exports = EmailView;
});