define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./flowinfo-html');

    const FlowInfo = BaseView.extend({
        template: template,
        initialize(options) {
            let me = this;
            me.options = options;
            BaseView.prototype.initialize.call(me, options);
        },
        renderFlowInfo(data) {
            let _html = this.template({
                data: data
            });
            this.$el.html(_html);
        },
        renderInfoData(data) {
            this.renderFlowInfo(data);
            this.model.attributes = data;
            this.entranceView.destroy();
            //更新数据
            this.trigger('updata', data);
        }
    })
    module.exports = FlowInfo;
})