//工作流测试页面
define(function(require, exports) {
    //const BPM = require('paas-workflow/workflow');

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
            //this.bpm = new BPM;
            //this.bpm.show();
            console.log(9999);
        }
    };

    exports.init = function() {
        flow.init(exports.tplEl, exports.tplName);
    };
});