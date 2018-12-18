define(function(require, exports, module) {
    const MultiSelectModel = require('paas-workprocess-modules/common/field/multiselect/multiselectmodel');
    const FormCollection = Backbone.Collection.extend({
        init(options) {
            let me = this;
            if (options.data) {
                _.each(options.data, function(form) {
                    _.each(form, function(item) {
                        item.value = item.value === undefined ? '' : item.value;

                        let m;
                        if (item.type == 'multi_level_select_one') {
                            m = new MultiSelectModel(item);
                        } else {
                            m = new Backbone.Model(item);
                        }
                        me.add(m);
                    });
                });
            }
        },
        getData() {
            let data = {};
            _.each(this.models, function(m) {
                let names = m.get('names');
                let type = m.get('type');
                if (names) {
                    _.each(names, (item) => {
                        data[item.name] = item.value;
                    });
                } else if (type == 'location') {
                    let val = m.view.getData();
                    if (val) {
                        data[m.get('name')] = val.lng + '#%$' + val.lat + '#%$' + val.name
                    } else {
                        data[m.get('name')] = '';
                    }
                } else {
                    data[m.get('name')] = m.get('value');
                }
            });
            return data;
        }
    });

    module.exports = FormCollection;
});