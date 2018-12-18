define(function(require, exports, module) {

    const BaseView = require('paas-workprocess-modules/common/base/base');
    const Selector = require('paas-workprocess-modules/common/field/selector/selector');
    const template = require('./composite-html');

    const Employee = BaseView.extend({
        template: template,
        initialize(options) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);

            let m = {
                required: this.get('required'),
                singleselect: this.get('singleselect'),
                onChange(name, selected) {
                    if (selected && (selected.person || selected.system)) {
                        let value = [];
                        if (selected.person) {
                            value = value.concat(selected.person);
                        }
                        if (selected.system) {
                            value = value.concat(selected.system);
                        }
                        me.model.set('value', value);
                    }
                    if (selected && selected.dept) {
                        me.model.set('value', selected.dept);
                    }
                    //me.model.set('value', selected);
                    me.trigger('change', me);
                }
            };

            let type = this.get('type');
            if (type == 'employee') {
                m.selector = ['member'];
                m.value = {
                    person: this.get('value')
                };
                m.placeholder = '请选择人员';
            } else if (type == 'department') {
                m.selector = ['group'];
                m.value = {
                    dept: this.get('value')
                };
                m.placeholder = '请选择部门';
            } else if (type == 'responsible') {
                m.selector = ['member', 'system'];
                let value = this.get('value');
                m.value = {

                };
                let length = value.indexOf('-10000');
                if (length > -1) {
                    m.value.system = ['-10000'];
                    value.splice(length, 1);
                }
                if (value.length) {
                    m.value.person = value;
                }
                m.placeholder = '请选择负责人';
            } else if (type == 'fieldEmployee') {
                m.selector = ['member', 'fieldvar'];
                let value = this.get('value');
                if (value.indexOf('-10000') > -1) {
                    m.value = {
                        fieldvar: value
                    }
                } else {
                    m.value = {
                        person: value
                    };
                }
                m.placeholder = '请选择人员';
            }
            m.foldInput = true;
            let model = new Backbone.Model(m);
            me.selector = new Selector({
                model: model
            });
            this.$el.find('.bpm-employee').append(me.selector.$el);

            //me.setDefaultValue.delay(me, 200);
        },
        setDefaultValue() {
            let me = this;
            let val = me.get('value');
            let type = me.get('type');
            if (val) {
                if (type == 'employee') {
                    me.selector.setDefaultValue({
                        person: val
                    });
                } else if (type == 'department') {
                    me.selector.setDefaultValue({
                        dept: val
                    });
                }
            }
        },
        getValue() {
            let o = {};
            let name = this.get('name');
            let value = this.get('value');
            value = value || [];

            if ($('.u-selector-selectinput-item').length == 0) {
                value = [];
            }

            o[name] = value;

            return o;
        },
        validate() {
            let OK = this.selector.validate();
            if (OK) {
                return true;
            } else {
                return false;
            }
        }
    });

    module.exports = Employee;
});