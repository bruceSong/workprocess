// BPM流程设计器测试落地页
define(function(require, exports) {
    const BPM = require('paas-workprocess/flowsetting');

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
            this.bpm = new BPM;
            this.bpm.show();
        },

        destroy: function() {
            this.bpm.destroy();
            this.bpm = null;
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