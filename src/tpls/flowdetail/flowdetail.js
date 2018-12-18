// 工作流设计器
define(function(require, exports) {
    const FlowDetail = require('paas-workprocess/flowdetail');

    const flow = {
        $el: null,
        init: function(el, tplName) {
            this.$el = $(el);
            this.render();

            // 销毁
            const me = this;
            FS.tpl.event.one('beforeremove' + tplName, function(tplName2) {
                if (tplName2 === tplName) {
                    me.destroy();
                }
            });
        },
        render: function() {
            this.flowdetail = new FlowDetail;
            this.flowdetail.show();
        },
        destroy: function() {
            this.flowdetail.destroy();
            this.flowdetail = null;
            if (this.$el) {
                this.$el.remove();
                this.$el = null;
            }
        }
    };

    exports.init = function() {
        flow.init(exports.tplEl, exports.tplName);
    };
});