define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./text-html');

    const TextView = BaseView.extend({
        template: template,
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            let me = this;
            let value = this.get('value');
            if (typeof value == 'string' && value.indexOf('${') > -1) {
                this.$el.find('input').css('color', '#6aab3e');
                setTimeout(function() {
                    me.setValue(me.get('label'), value);
                }, 10);
            }
        },
        bindEvents() {
            let me = this;
            let type = me.get('type');
            this.$el.on('input', '.bpm-text>input', (e) => {
                let _v = e.target.value;
                switch (type) {
                    case 'percentile':
                        _v = _v.replace(/[^\d]+/g, '');
                        e.target.value = _v + '%';
                        me.model.set('value', _v);
                        break;
                    case 'number':
                    case 'currency':
                        if (!me.get('blur')) {
                            _v = _v.replace(/[^\d\.]+/g, '');
                        }
                        e.target.value = _v;
                        me.model.set('value', _v);
                        break;
                    default:
                        me.model.set('value', _v);
                }
                if (_v.indexOf('${') == -1) {
                    me.$el.find('input').css('color', '');
                }
                me.trigger('change', me.model);
            });
        },
        setValue(label, value) {
            if (value == '') {
                label = '';
            }
            this.model.set('value', value);
            if (typeof value == 'string' && value.indexOf('${') > -1) {
                this.$el.find('input').css('color', '#6aab3e');
                label = label.replace(/<\/?.+?>/g, "");
            } else {
                this.$el.find('input').css('color', '');
            }
            this.$el.find('input').val(label);
            this.trigger('change', this.model);
        },
        validate() {
            let isOk = BaseView.prototype.validate.call(this);

            if (isOk == false) {
                return false;
            }

            let val = $.trim(this.model.get('value'));
            let required = this.model.get('required');
            let maxLength = this.model.get('maxLength') > 0 ? this.model.get('maxLength') : 100;
            if (required) {
                if (val) {
                    if (_.isString(val) && val.length > maxLength) {
                        this.error(this.model.get('label') + '不能多于' + maxLength + '个字符');
                        return false;
                    }
                } else {
                    this.error(this.model.get('label') + '不能为空');
                    return false;
                }

            }
            //判断是否为数值类型
            if (required && this.get('type') == 'number' && this.get('blur') && val.indexOf('${') == -1 && isNaN(val)) {
                this.error('请输入合法数值');
                return false;
            }

            this.rmError();

            return true;
        }
    });

    module.exports = TextView;
});