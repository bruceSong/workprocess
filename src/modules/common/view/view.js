/**
 * Backbone View 基类
 * @author songgenlei
 */

define(function(require, exports, module) {
    var View = Backbone.View.extend({
        tagName: 'div',
        initialize: function() {
            this.bindEvents();
        },
        bindEvents: function() {

        },
        render: function(obj) {
            if (obj && this.template) {
                var _html = this.template(obj);
                this.$el.html(_html);

                this.model = new Backbone.Model(obj);
            }
        },
        append: function(view) {
            this.$el.append(view.$el);
        },
        appendTo: function(view) {
            this.$el.appendTo(view.$el);
        },
        hide: function() {
            this.$el.hide();
        },
        show: function() {
            this.$el.show();
        },
        toggle: function() {
            this.$el.toggle();
        },
        find: function(selector) {
            return this.$el.find(selector);
        }
    });

    Function.prototype.delay = function(context, s, param) {
        var me = this;
        setTimeout(function() {
            me.apply(context, param);
        }, s);
    };

    module.exports = View;
});