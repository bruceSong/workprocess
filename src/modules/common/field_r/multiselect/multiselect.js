define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./multiselect-html');
    const subSelectTemplate = require('./subselect-html');

    const MultiSelectView = BaseView.extend({
        template: template,
        events: {
            'click .bpm-text': 'toggle'
        },
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
        },
        bindEvents() {
            let me = this;
            me.find('.level-one li').on('click', (e) => {
                let val = $(e.target).data('value');
                let label = $(e.target).data('label');

                let $select = $(e.target).closest('.bpm-select_one');
                $select.find('input').val(label);

                let options = me.model.get('options');
                _.each(options, function(option) {
                    if (option.value == val) {
                        me.model.set('curSupOption', option);
                        me.rendSubSelect({
                            options: option.child_options
                        });
                    }
                });
            });

            me.find('.level-two').on('click', 'li', (e) => {
                let val = $(e.target).data('value');
                let label = $(e.target).data('label');

                let $select = $(e.target).closest('.bpm-select_one');
                $select.find('input').val(label);

                let curOption = me.model.get('curSupOption');
                _.each(curOption.child_options, (opt) => {
                    if (opt.value == val) {
                        me.model.set('value', opt.value);
                    }
                });
            });

            me.$el.parent().on('click', (e) => {
                e.stopPropagation();
                me.find('.select-list').hide();
            });
        },
        rendSubSelect(data) {
            let _html = subSelectTemplate(data);
            this.find('.level-two>.select-list').html(_html);

            this.find('.level-two input').val(data.options[0].label);
            this.model.set('value', data.options[0].value);
        },
        toggle(e) {
            e.stopPropagation();
            let $select = $(e.currentTarget).parent();
            if (!$select.hasClass('bpm-readonly')) {
                if ($select.hasClass('level-one')) {
                    this.find('.level-two>.select-list').hide();
                } else {
                    this.find('.level-one>.select-list').hide();
                }
                $select.find('.select-list').toggle();
            }
        }
    });

    module.exports = MultiSelectView;
});