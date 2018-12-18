define(function(require, exports, module) {
    const MultiSelectModel = Backbone.Model.extend({
        initialize() {
            this.format();
        },
        format() {
            let me = this;
            let val = me.get('value');
            let options = me.get('options');
            let curSupOption = {};
            let curSubOption = {};
            if (val) {
                _.each(options, (option) => {
                    _.each(option.child_options, (subOption) => {
                        if (val == subOption.value) {
                            curSupOption = option;
                            curSubOption = subOption;
                        }
                    });
                });
            }
            me.set('curSupOption', curSupOption);
            me.set('curSubOption', curSubOption);
        }
    });

    module.exports = MultiSelectModel;
});