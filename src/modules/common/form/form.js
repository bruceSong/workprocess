define(function(require, exports, module) {
    var BaseView = require('paas-workprocess-modules/common/base/base');
    var FormCollection = require('./collection');

    var Fields = require('paas-workprocess-modules/common/field/field');

    var FormView = BaseView.extend({
        initialize: function(options) {
            this.collection = new FormCollection;
            this.views = {};

            BaseView.prototype.initialize.call(this, options);

            this.collection.init(options);
        },
        bindEvents: function() {
            this.collection.on('add', this.addComponents, this);
        },
        addComponents: function(m) {
            var apiName = m.get('name') || m.get('api_name');
            var type = m.get('type');
            var $el = this.find('#' + apiName + ' .item-wrapper');
            var FormCom = Fields[type];

            if (FormCom && $el.length) {
                if (type == 'employee') {
                    this.views[apiName] = new FormCom({
                        $el: $el,
                        model: m,
                        selector: ['member'],
                    });
                } else if (type == 'department') {
                    this.views[apiName] = new FormCom({
                        $el: $el,
                        model: m,
                        selector: ['group'],
                    });
                } else {
                    this.views[apiName] = new FormCom({
                        $el: $el,
                        model: m,
                        selector: ['group'],
                    });
                }
            }
        },
        validate: function() {
            var isOk = true;
            var coms = [];
            _.each(this.views, function(com) {
                var bol = com.validate();
                if (bol == false) {
                    isOk = false;
                    coms.push(com);
                }
            });
            if (coms.length) {
                var $box = this.$el.parent();
                var $panel = this.$el.find('.workprocess-form');
                var _top = coms[0].$el.offset().top - $panel.offset().top;
                $box.scrollTop(_top);
            }
            return isOk;
        },
        getData: function() {
            let data = {};
            _.each(this.views, (view) => {
                let v = view.getValue();
                if (v) {
                    $.extend(data, v);
                }
            });

            return data;
        }
    });

    module.exports = FormView;
});