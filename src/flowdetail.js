define(function(require, exports, module) {
    require('./assets/style/all.css');
    const FlowDetail = require('paas-workprocess-modules/detail/detail');

    const WorkProcess = function(options = {}) {
        this.options = options;
    }

    WorkProcess.prototype = {
        constructor: WorkProcess,
        show() {
            let me = this;
            me.params = {
                data: me.options.data,
                fullScreen: me.options.fullScreen,
                useToolbar: me.options.useToolbar
            }
            require.async('paas-paasui/ui', () => {
                me.flowdetail && me.flowdetail.destroy();
                me.popLayer = new window.PaasUI.popLayer({
                    useHeader: false
                });
                me.flowdetail = new FlowDetail(me.params);
                me.options.el && me.options.el.append(me.flowdetail.$el);
                me.options.fullScreen && me.toggelFullScreen()

                me.flowdetail.on('fullScreenSwitch', me.toggelFullScreen, me);
            });
        },
        toggelFullScreen() {
            let me = this;
            me.params.fullScreen = true;
            me.svg = new FlowDetail(me.params);
            me.popLayer.show({
                step: 1,
                $el: me.svg.$el
            });
            me.svg.on('fullScreenSwitch', () => {
                me.params.fullScreen = false;
                me.popLayer && me.popLayer.destroy();
                me.svg && me.svg.destroy();
            });
        },
        destroy() {

        }
    };
    $.extend(WorkProcess.prototype, Backbone.View.prototype);
    module.exports = WorkProcess;
});