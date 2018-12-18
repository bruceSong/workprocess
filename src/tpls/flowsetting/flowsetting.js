// 工作流设计器
define(function(require, exports) {
    const Flowsettting = require('paas-workprocess/flowsetting');

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
            this.flowsetting = new Flowsettting;
            this.flowsetting.show();
            /*
            this.flowsetting.rendProcessView({
                entityId: 'ContactObj',
                entityName: '客户',
                name: 'fdsf',
                description: 'sdfsdf',
                sourceWorkflowId: 'a113df_crmwf',
                triggerTypes: [1, 3],
                triggerTypeLabels: ['新建', '作废']
            });*/
        },
        destroy: function() {
            this.flowsetting.destroy();
            this.flowsetting = null;
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