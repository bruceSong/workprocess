define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./location-html');

    const LocationView = BaseView.extend({
        template: template,
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
        },
        getValue() {
            let val = this.searchMap.getValue();
            let name = this.get('name');
            let value = '';

            if (val) {
                value = val.lng + '#%$' + val.lat + '#%$' + val.name;
            }

            let o = {};
            o[name] = value;

            return o;
        },
        render() {
            let me = this;
            BaseView.prototype.render.call(this);
            require.async('crm-modules/components/searchmap/searchmap', (SearchMap) => {
                if (!me.searchMap) {
                    me.searchMap = new SearchMap({
                        el: me.$el.find('.location-box')
                    });
                    me.searchMap.on('change', () => {
                        me.hideSug();
                    });
                    me.$el.on('focus', 'input', () => {
                        me.$el.find('.error-msg').remove();
                    });
                }
                me.searchMap.render();

                let val = me.get('value');
                if (val) {
                    me.setDefaultValue(val);
                }
            });
        },
        setDefaultValue(value) {
            if (!value) return;
            let val = value.split('#%$');
            if (val.length > 2) {
                this.searchMap.setValue({
                    lng: val[0],
                    lat: val[1],
                    name: val[2]
                });
                this.find('.bpm-text').html(val[2]);
            }
        },
        hideSug() {
            this.find('.map-result').hide();
        },
        validate() {
            let val = this.searchMap.getValue();
            let required = this.model.get('required');
            if (!val && required) {
                this.error('请填写地址');
                return false;
            }

            this.rmError();

            return true;
        }
    });

    module.exports = LocationView;
});