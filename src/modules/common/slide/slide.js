define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const ScrollBar = require('base-modules/ui/scrollbar/scrollbar');
    const template = require('./slide-html');

    const Slide = BaseView.extend({
        template: template,
        className: 'bpm-slide',
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);

            this.config = {
                width: 926,
                className: '',
                zIndex: 888
            };
            $.extend(this.config, options);

            this.render(this.config);
            $('body').append(this.$el);

            this.$el.addClass(this.config.className);
            this.$el.css({
                width: this.config.width,
                zIndex: this.config.zIndex
            });
        },
        events: {
            'click .slide-con': 'stopPropagation',
            'click .close-btn': 'hide'
        },
        bindEvents() {
            let me = this;
            $('body').on('click', function() {
                me.hide();
            })
        },
        stopPropagation(e) {
            e.stopPropagation();
        },
        show(html) {
            if (typeof html == 'string') {
                this.$el.find('.slide-con').html(html);
            }

            this.$el.animate({
                right: 0
            }, 300);
            new ScrollBar(this.$el.find('.bpm-slide-content'));
        },
        hide(e) {
            e && e.stopPropagation && e.stopPropagation();
            this.$el.animate({
                right: -this.config.width
            }, 300);
        }
    });

    module.exports = Slide;
});