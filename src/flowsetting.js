define(function(require, exports, module) {
    require('./assets/style/all.css');
    const EntranceView = require('paas-workprocess-modules/entrance/entrance');
    const ProcessView = require('paas-workprocess-modules/setting/setting');
    const Dialog = require('paas-workprocess-modules/common/dialog/dialog');

    const WorkProcess = function() {

    }

    WorkProcess.prototype = {
        constructor: WorkProcess,
        init(callback) {
            require.async('paas-paasui/ui', () => {
                callback();
            });
        },
        show(sourceWorkflowId, enable) {
            this.init(this._show.bind(this, sourceWorkflowId, enable))
        },
        _show(sourceWorkflowId, enable) {
            let me = this;
            me.entranceView = new EntranceView;
            me.entranceView.on('entrance', (data) => {
                //let data = me.entranceView.getData();
                me.rendProcessView(data);
                me.popLayer.setStep(2);
            });

            if (sourceWorkflowId) {
                me.entranceView.editFlowData(sourceWorkflowId, enable);
            } else {
                me.entranceView.show();
            }

            me.popLayer && me.popLayer.destroy();

            let title = sourceWorkflowId ? $t('编辑工作流') : $t('新建工作流');
            me.popLayer = new PaasUI.popLayer({
                title,
                newFeature: true,
                appName: 'workprocess'
            });
            //改变标题
            me.entranceView.on('nameChange', (e) => {
                let action = sourceWorkflowId ? $t('编辑') : $t('新建');
                let value = e.name ? e.name : e;
                //me.popLayer.setTitle(`${action}${value}工作流`)
                me.popLayer.setTitle($t('{{action}}{{value}}工作流', {
                    data: {
                        action,
                        value
                    }
                }));
            });
            //退出时
            me.popLayer.on('cancel', () => {
                me.cancelDialog();
            });
            //切换步骤时候
            me.popLayer.on('stepChange', (e) => {
                if (e.step == 2) {
                    me.entranceView.validate();
                } else if (e.step == 1) {
                    if (!me.processView) {
                        return;
                    }
                    let data = me.processView.get('triggerData');
                    me.entranceView.setNextData(data);
                    me.popLayer.setStep(e.step);
                }
            });
            me.popLayer.on('showNewFeature', () => {
                me.entranceView && me.entranceView.showNewFeature();
            });
            me.popLayer.show({
                step: 1,
                $el: me.entranceView.$el
            });
        },
        rendProcessView(data) {
            let me = this;
            me.processView && me.processView.destroy();
            me.processView = new ProcessView({
                isUpdate: this.isUpdate,
                model: new Backbone.Model(data)
            });
            this.processView.on('flowsave', () => {
                me.trigger('refresh');
                me.processView.destroy();
                me.popLayer.destroy();
            });

            me.popLayer.off('ensure');
            me.popLayer.on('ensure', () => {
                me.processView.saveWorkFlow();
            });
            me.popLayer.show({
                step: 2,
                $el: me.processView.$el
            });
        },
        cancelDialog() {
            let me = this;
            let dialog = new Dialog({
                title: $t('提示'),
                btns: [{
                    action: 'ensure',
                    label: $t('确 定')
                }, {
                    action: 'cancel',
                    label: $t('取 消')
                }],
                height: 45,
                content: $t('确认关闭吗？')
            });
            dialog.show();
            dialog.on('ensure', () => {
                dialog && dialog.destroy();
                me.popLayer && me.popLayer.destroy();
                delete me.popLayer;
            });
        },
        destroy() {
            if (this.processView && this.processView.destroy) {
                this.processView.destroy();
                this.processView = null;
            }
        }
    };
    $.extend(WorkProcess.prototype, Backbone.View.prototype);
    module.exports = WorkProcess;
});