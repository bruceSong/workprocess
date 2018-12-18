define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const constants = require('./constants');
    const template = require('./lookup-html');

    const LookUpView = BaseView.extend({
        template: template,
        events: {
            'click .lookup-btn': 'pickObject'
        },
        initialize(options) {
            if (options && options.model) {
                let relatedObjectName = options.model.get('relatedObjectName') || '';
                options.model.set('relatedObjectName', relatedObjectName);
            }
            BaseView.prototype.initialize.call(this, options);
            let apiName = this.get('relatedEntityId');
            this.isCustomObj = /__c$/.test(apiName);
        },
        pickObject() {
            this.isCustomObj ? this.pickCustomObj() : this.pickBuildInObj();
        },
        pickBuildInObj() {
            let me = this;
            require.async('crm-modules/components/pickobject/pickobject', (PickObject) => {
                me.pickobject = new PickObject();
                me.pickobject.render({
                    TargetObject: constants.objectTypeMap[me.get('relatedEntityId')].type,
                    DataID: me.get('value')
                });
                me.pickobject.on('select', (obj) => {
                    me.model.set('value', obj.id);
                    me.find('input').val(obj.Name);
                });
            });
        },
        pickCustomObj() {
            let me = this;
            require.async('crm-modules/components/pickselfobject/pickselfobject', (PickSelf) => {
                me.pickobject = new PickSelf();
                me.pickobject.on('select', (obj) => {
                    me.model.set('value', obj._id);
                    me.find('input').val(obj.name);
                });
                me.pickobject.render({
                    apiname: me.get('relatedEntityId'),
                    dataId: me.get('value'),
                    relatedname: me.get('target_related_list_name')
                })
            })
        },
        validate() {
            let isOk = BaseView.prototype.validate.call(this);

            if (isOk == false) {
                return false;
            }

            let val = this.model.get('value');
            let required = this.model.get('required');
            if (required && val.length > 100) {
                this.error('单行文本不能多余100个字符');
                return false;
            }

            this.rmError();

            return true;
        }
    });

    module.exports = LookUpView;
});