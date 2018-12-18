define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const Select = require('paas-workprocess-modules/common/field/select/select');

    const template = require('./boolean-html');

    const BooleanView = BaseView.extend({
        template: template,
        initialize(options) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);
            let val = me.get('value');
            if (val === '') {
                me.set('value', '-1');
                val = '-1';
            } else if (val == 'true' || val == 'false') {
                val = Boolean(val);
            }
            let opts = [{
                'label': '是',
                'value': true
            }, {
                'label': '否',
                'value': false
            }];
            let selectData = {
                name: "selector1",
                value: val,
                label: me.get('label'),
                type: 'select_one',
                options: opts,
                boolean: false,
                readonly: me.get('readonly'),
                required: me.get('required')
            };

            //选择客户
            let selector = new Select({
                $el: this.$el.find('.bpm-boolean'),
                model: new Backbone.Model(selectData)
            });
            selector.on('change', function(item) {
                me.set('value', item.get('value'));
                me.set('label', item.get('label'));
                me.trigger('change', me.model);
            });
            this.selector = selector;
        },
        validate() {
            let val = this.model.get('value');
            let required = this.model.get('required');
            if (required && (val === '' || val == '-1')) {
                this.error('请选择是或者否');
                return false;
            }

            this.rmError();
            return true;
        }
    });

    module.exports = BooleanView;
});