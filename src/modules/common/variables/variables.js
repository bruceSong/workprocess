define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./variables-html');

    const VarView = BaseView.extend({
        initialize(options = {}) {
            BaseView.prototype.initialize.call(this, options);
            this.renderVar(options);
            let me = this;
            setTimeout(function() {
                me.bindEvent();
            }, 100);
        },
        events: {
            'click .cal-subvar': 'getVariable',
            'click .item': 'getCalVariable',
            'click .else-subvar': 'getObjVariable'
        },
        bindEvent() {
            let me = this;
            me.$el.closest('.workprocess-form').on('click', (event) => {
                event.preventDefault();
                if (!($(event.target).closest('.paas-workprocess-variables').length || $(event.target).closest('.process-field-add-span').length || $(event.target).closest('.process-variable').length)) {
                    me.hide();
                }
            });
            //tab 切换
            this.find('.tab').on('click', function(e) {
                e.preventDefault();
                let index = $(this).index();
                me.find('.tabs .tab').removeClass('current');
                $(this).addClass('current');
                me.find('.contents .content').removeClass('current');
                me.find(me.find('.contents .content')[index]).addClass('current');
            });
            //左侧菜单切换
            this.$el.find('.sup li').on('click', function() {
                let index = $(this).index();
                me.$el.find('.sup li').removeClass('current');
                $(this).addClass('current');

                me.$el.find('ul.sub').removeClass('current');
                $(me.$el.find('ul.sub')[index]).addClass('current');
            });
            //默认值是空还是0
            if (this.$el.find('.formula-label').length) {
                this.$el.find('.formula-label .input, .formula-label .label').click(function() {
                    let parent = $(this).parent();
                    if (parent.hasClass('checked')) {
                        return;
                    }
                    me.$el.find('.formula-label label').removeClass('checked');
                    parent.addClass('checked');
                });
            }

        },
        renderVar(opt) {
            let html = template({
                obj: opt.data
            });
            this.$el.empty().append(html);
            this.$el.hide();
        },
        getObjVariable(e) {
            let target = $(e.target);
            let defaultValue = '';
            if (this.$el.find('.formula-label').length) {
                this.$el.find('.formula-label label').each(function(index) {
                    if ($(this).hasClass('checked') && index == 1) {
                        defaultValue = '0';
                    }
                });
            }
            let data = {
                type: {
                    label: $t('业务流程'),
                    name: 'workflow'
                },
                variable: {
                    label: '${' + target.html() + '}',
                    name: '${' + target.data('name') + '}',
                    defaultValue: defaultValue
                }
            };
            this.model.set('varData', data);
            this.trigger('select', data);
            this.hide();
        },
        getVariable(e) {
            let target = $(e.target);
            let parent = target.parents('.content').find('.sup .current');
            let parName = parent.attr('data-name');
            let parLabel = parent.html();
            let index = parent.index();

            let defaultValue = '';
            if (this.$el.find('.formula-label').length) {
                this.$el.find('.formula-label label').each(function(index) {
                    if ($(this).hasClass('checked') && index == 1) {
                        defaultValue = '0';
                    }
                });
            }
            if (index > 0) {
                parLabel = $(target.parents('.content').find('.sup li')[0]).attr('title') + '.' + parLabel;
            }
            let data = {
                type: {
                    label: $t('业务流程'),
                    name: 'workflow'
                },
                variable: {
                    label: '${' + parLabel + '.' + target.html() + '}',
                    name: '${' + parName + '.' + target.data('name') + '}',
                    defaultValue: defaultValue
                }
            };

            this.model.set('varData', data);
            this.trigger('select', data);
            this.hide();
        },
        getData() {
            return this.model.get('varData');
        },
        getCalVariable(e) {
            let data = {
                type: 'calVariable',
                variable: {
                    label: $(e.target).html(),
                    name: $(e.target).data('type'),
                    defaultValue: ''
                }
            };
            this.model.set('varData', data);
            this.trigger('select', data);
            this.hide();
        }
    });
    module.exports = VarView;
})