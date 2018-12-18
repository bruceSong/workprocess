define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const SelectView = require('../select/select');
    const template = require('./complexselect-html');

    const ComplexSelect = BaseView.extend({
        template: template,
        render(options) {
            let me = this;
            me.coms = {};
            BaseView.prototype.render.call(me, options);

            let names = me.get('names');
            if (names) {
                names.forEach((item, i) => {
                    item.type = i == 0 ? 'select_level_one_first' : 'select_level_one';
                    item.options = item.options || [];
                    item.value = item.value || '';
                    item.idx = i;

                    let m = new Backbone.Model(item);
                    me.coms[i] = new SelectView({
                        model: m
                    });
                    me.coms[i].on('change', me.handleChange, me);

                    me.find('.bpm-complexselect').append(me.coms[i].$el);
                });

                me.rerendSubSelect();
            }
        },
        handleChange(m) {
            let parentOptions = m.get('options');
            let val = m.get('value');
            let idx = m.get('idx');
            let option = _.find(parentOptions, (item) => {
                return item.value == val;
            });
            if (option) {
                _.map(this.coms, (com, i) => {
                    if (i > idx) {
                        if (i == m.get('idx') + 1) {
                            com.rerend(option.child_options);
                        } else {
                            com.clear();
                        }
                    }
                });
            }

            let names = this.get('names');
            names[idx].value = m.get('value');
            _.each(names, (item, i) => {
                if (i > idx) {
                    item.value = '';
                    console.log(item.value);
                }
            });
        },
        rerendSubSelect() {
            let me = this;
            _.each(me.coms, (com, i) => {
                i = parseInt(i);
                let option = com.getOption();
                let nextCom = me.coms[i + 1];
                if (option && nextCom) {
                    nextCom.rerend(option.child_options);
                }
            });
        },
        getValue() {
            let o = {};
            let names = this.get('names');
            _.each(names, (item) => {
                if (item.value || item.value == '') {
                    o[item.name] = item.value;
                }
            });
            return o;
        },
        validate() {
            let names = this.get('names');
            let topValue = names[0].value;
            let required = this.get('required');

            if (required || topValue) {
                if (names[0].name == 'country') {
                    if (!topValue) {
                        return false
                    }
                } else {
                    let me = this;
                    let isOK = true;
                    _.each(names, (item) => {
                        if (!item.value) {
                            isOK = false;
                            me.error(`请选择${item.label}`);
                        }
                    });
                    return isOK;
                }
            }

            return true;
        }
    });

    module.exports = ComplexSelect;
});