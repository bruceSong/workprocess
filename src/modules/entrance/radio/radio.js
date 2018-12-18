define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./radio-html');

    const RadioView = BaseView.extend({
        initialize(options = {}) {
            BaseView.prototype.initialize.call(this, options);
            if (!this.get('value')) {
                this.set('value', this.get('options')[0].value);
                this.set('label', this.get('options')[0].label);
            }
            let html = template({
                data: this.model.attributes
            });
            this.$el.append(html);
        },
        events: {
            'click .radio-icon': 'getValue',
            'click .radio-txt': 'getValue',
            'click .radio-li': 'getValue',
        },
        bindEvents() {
            this._bindEvents.delay(this, 50);
        },
        _bindEvents() {
            let me = this;
            if (me.$el.find('.closeHelp')) {
                me.$el.find('.closeHelp').on('click', function() {
                    me.$el.find('.showUpdateHelp') && me.$el.find('.showUpdateHelp').hide();
                    me.$el.find('.showCircleHelp') && me.$el.find('.showCircleHelp').hide();
                    me.$el.find('.closeHelp').hide();
                })
            }
        },
        getValue(e) {
            let target = $(e.target).closest('.radio-li');
            if (target.hasClass('current') || target.hasClass('readonly')) {
                return;
            }
            this.$el.find('.radio-li').removeClass('current');
            target.addClass('current');
            this.set('value', target.attr('data-value'));
            this.set('label', target.attr('data-label'));

            let subRelationType = false;
            if (target.find('.current-link').length) {
                subRelationType = true;
            }
            this.trigger('change', this, subRelationType);
        },
        setValue(id) {
            if (!id) {
                return;
            }
            let tmp;
            let num;
            _.each(this.get('options'), function(item, index) {
                if (item.value == id) {
                    tmp = item;
                    num = index;
                }
            });
            if (tmp) {
                this.$el.find('.radio-li').removeClass('current');
                $(this.$el.find('.radio-li')[num]).addClass('current');
                this.set('value', tmp.value);
                this.set('label', tmp.value.label);
            }
        }
    });
    module.exports = RadioView;
})