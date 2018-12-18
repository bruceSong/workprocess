define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./dialog-html');

    const Dialog = BaseView.extend({
        template: template,
        initialize(options) {
            this.config = {
                title: '',
                content: '',
                btns: [{
                    action: 'ensure',
                    label: $t('保 存')
                }, {
                    action: 'cancel',
                    label: $t('取 消')
                }],
                isClose: options.isClose || true,
                isStopPropagation: true,
                rewrite: {},
                width: 500,
                zIndex: 9999,
                maxHeight: $(window).height() - 300,
                minHeight: 120
            };

            $.extend(this.config, options);

            BaseView.prototype.initialize.call(this, options);

            this.$el.addClass('workprocess-dialog');
            this.$layer = $('<div class="bpm-dislog-layer"></div>');
        },
        events: {
            'click .b-g-btn': 'handleBtnClick',
            'click .bpm-dislog-close': 'hide',
            'click': 'stopPropagation'
        },
        render() {
            let html = this.template(this.config);
            this.$el.html(html);
        },
        show(content) {
            this.setContent(content);
            this.setBound();
            this.$layer.appendTo(document.body);
        },
        hide(e) {
            e && e.preventDefault();
            //e && e.stopPropagation();
            this.$el.hide();
            this.$layer.remove();
        },
        setBound() {
            this.$el.show();

            let $dialogBody = this.getBody();
            let height = $dialogBody.height();
            if (this.config.height) {
                height = this.config.height;
            } else {
                height = height > this.config.maxHeight ? this.config.maxHeight : height;
                height = height < this.config.minHeight ? this.config.minHeight : height;
            }

            this.$el.css({
                width: this.config.width,
                height: height + 144,
                marginLeft: -this.config.width / 2,
                marginTop: -(height + 144) / 2,
                zIndex: this.config.zIndex
            });

            $dialogBody.css({
                height: height
            });

            this.$layer.css({
                zIndex: this.config.zIndex - 1
            });
        },
        handleBtnClick(e) {
            let actionType = $(e.target).attr('action-type');
            let $dialogHD = this.find('.bpm-dialog-bd')
            this.trigger(actionType, $dialogHD);

            if (actionType == 'ensure' || actionType == 'ensure1') {
                if (this.config.rewrite && this.config.rewrite.save) {
                    this.config.rewrite.save.call(this, $dialogHD);
                }
            } else {
                this.hide();
            }
        },
        getBody() {
            return this.find('.bpm-dialog-bd');
        },
        setTitle(title) {
            this.$el.find('.bpm-dialog-hd').html(title);
        },
        setContent(content) {
            if (typeof content == 'string') {
                this.$el.find('.bpm-dialog-bd').html(content);
            } else if (content instanceof jQuery) {
                this.$el.find('.bpm-dialog-bd').empty().append(content);
            }
            $('body').append(this.$el);
        },
        stopPropagation(e) {
            if (this.config.isStopPropagation) {
                e.stopPropagation();
            }
        },
        destroy() {
            BaseView.prototype.destroy.call(this);
            this.$layer.remove();
        }
    });

    module.exports = Dialog;
});