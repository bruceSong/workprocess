define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./time-html');

    const ToolTip = BaseView.extend({
        template: template,
        events: {
            'click .entrance-zhixing-time .process-date .date-input': 'showTime',
            'click .time li': 'setTime'
        },
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            let value = this.model.get('value');
            if (value) {
                this.$el.find('.date-input').html(value + ':00');
            }
        },
        showTime() {
            let ele = this.$el.find('.flow-calendar');
            if (ele.css('display') == 'none') {
                ele.css('display', 'block');
            } else {
                ele.css('display', 'none');
            }
        },
        setTime(e) {
            let ele = $(e.target).closest('li');
            if (ele.hasClass('active')) {
                return;
            }
            this.$el.find('.flow-calendar li').removeClass('active');
            let val = ele.attr('data-value');
            this.set('value', val);
            this.$el.find('.date-input').html(val + ':00');
            ele.addClass('active');
            this.$el.find('.flow-calendar').hide();
        },
        validate() {
            if (!this.get('value')) {
                this.error($t('请选择执行时间'));
                return false;
            } else {
                this.rmError();
            }
            return true;
        }
    })
    module.exports = ToolTip;
});