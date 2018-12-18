define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const Selector = require('./selector-data');
    const template = require('./selector-html');

    const SelectorView = BaseView.extend({
        template: template,
        initialize(options) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);

            let data = {
                el: me.find('.bpm-selector'),
                placeholder: '请选择'
            };

            let placeholder = this.get('placeholder');
            if (placeholder) {
                data.placeholder = placeholder;
            }

            let entityId = this.get('entityId');
            if (entityId) {
                data.entityId = entityId;
            }

            let value = this.get('value');
            if (value) {
                if (value.dept_leader) {
                    value.master = value.dept_leader;
                    delete value.dept_leader;
                }
                data.value = value;
            }

            let selector = this.get('selector');
            if (selector) {
                data.selector = selector;
            }

            let singleselect = this.get('singleselect');
            if (singleselect) {
                data.singleselect = singleselect;
            }

            let grayItems = this.get('grayItems');
            if (grayItems) {
                data.grayItems = grayItems;
            }
            let foldInput = this.get('foldInput');
            if (foldInput) {
                data.foldInput = foldInput;
            }
            data.onChange = (name, selected) => {
                me.handleChange(name, selected);
            };

            me.selectorView = new Selector(data);
        },
        handleChange(name, selected) {
            if (selected.master) {
                selected.dept_leader = selected.master;
                delete selected.master;
            }
            this.model.set('value', selected);
            if (this.get('onChange')) {
                this.get('onChange')(name, selected);
            }
        },
        validate() {
            var val = this.model.get('value');
            var t = 0;
            if ((val.person && val.person.length) || (val.dept && val.dept.length) || (val.group && val.group.length) || (val.role && val.role.length) || (val.master && val.master.length) || (val.ext_process && val.ext_process.length) || (val.applicant && val.applicant.length) || (val.emails && val.emails.length) || (val.dept_leader && val.dept_leader.length) || (val.system && val.system.length)) {
                t = 1;
            }
            var required = this.model.get('required');
            if (required == true && !t) {
                this.error('请选择处理人');
                return false;
            }
            this.rmError();
            return true;
        }
    });

    module.exports = SelectorView;
});