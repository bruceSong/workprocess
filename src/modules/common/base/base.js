define(function(require, exports, module) {
    const BaseView = Backbone.View.extend({
        initialize(options) {
            options = options || {};
            this.$el = options.$el || $('<div></div>');
            this.$el.addClass(this.className);
            this.model = options.model || new Backbone.Model;
            this.model.view = this;
            this.render();
            this.bindEvents();
        },
        bindEvents() {

        },
        find(selector) {
            return this.$el.find(selector);
        },
        render() {
            if (this.template) {
                let _html = this.template({
                    data: this.model.attributes
                });
                this.$el.html(_html);
            }
        },
        validate() {
            let val = this.model.get('value');
            let label = this.model.get('label');
            let required = this.model.get('required');
            if (required == true && val === '') {
                //this.error(`请填写${label}`);
                this.error($t('请填写{{label}}', {
                    data: {
                        label
                    }
                }));
                return false;
            }
            this.rmError();
            return true;
        },
        error(msg) {
            let me = this
            if (!me.$error) {
                me.$error = $('<div class="error-msg"></div>');
            }
            me.$error.html(msg);
            me.$el.parent().append(this.$error);
        },
        rmError() {
            this.$error && this.$error.remove();
        },
        get(key) {
            return this.model.get(key);
        },
        set(key, v) {
            this.model.set(key, v);
        },
        getValue() {
            let o = {};
            let name = this.get('name');
            let value = this.get('value');
            if (name) {
                o[name] = value;
                return o;
            }
        },
        show() {
            this.$el.show();
        },
        hide() {
            this.$el.hide();
        },
        toggle() {
            this.$el.toggle();
        },
        destroy() {
            this.$el.remove();
            this.rmError();
        }
    });

    Function.prototype.delay = function(context, s, param) {
        var me = this;
        setTimeout(function() {
            me.apply(context, param);
        }, s);
    };

    module.exports = BaseView;
});