define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./checkbox-html');
    const Checkbox = BaseView.extend({
        template,
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
        },
        events: {
            'click .flow-checkbox': 'toggle'
        },
        toggle(e) {
            let me = this;
            let $el = $(e.currentTarget);

            if ($el.find('i').hasClass('flow-readonly')) {
                return false;
            }

            if ($el.hasClass('active')) {
                $el.removeClass('active')
                me.set('value', false);
            } else {
                $el.addClass('active')
                me.set('value', true);
            }

            me.trigger('change', me.model);
        },
        getValue() {
            let o = {};
            let name = this.get('name');
            let value = this.get('value');
            if (name) {
                o[name] = value;
                return o;
            }
        }
    });

    module.exports = Checkbox;
});