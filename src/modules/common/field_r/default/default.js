define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./default-html');

    const DefaultView = BaseView.extend({
        template: template,
        setValue(label, value) {
            if (value == '') {
                label = '';
            }
            this.model.set('value', value);
            this.$el.find('.bpm-default-text').html(label);
            this.trigger('change', this.model);
        },
        validate() {
            if (this.get('value') === '') {
                this.error('请填写配置字段');
                return false;
            }
            if (this.get('label').indexOf('bpm-error') > -1) {
                this.error('标红变量已被禁用/删除');
                return false;
            }
            return true;
        }
    });

    module.exports = DefaultView;
});