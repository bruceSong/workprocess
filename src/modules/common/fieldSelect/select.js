define(function(require, exports, module) {
    const md = {};
    require.async('paas-paasui/ui', () => {
        md.component = PaasUI.field.select_one.extend({
            initialize(options) {
                if (options.model) {
                    options.model.set('optionMap', {});
                }
                let me = this;
                PaasUI.field.select_one.prototype.initialize.call(this, options);

                setTimeout(function() {
                    me.valitActive();
                }, 100);

            },
            validate(flag = false) {
                let opt = this.getOption();
                if (opt) {
                    if (opt.isActive == false) {
                        this.error($t('该字段已被禁用'));
                        return false;
                    }
                } else {
                    let val = this.get('value');
                    if (val && val != '0') {
                        this.error($t('该字段可能已被删除'));
                        return false;
                    }
                }

                this.rmError();

                if (flag == false) {
                    return PaasUI.field.select_one.prototype.validate.call(this);
                }
            },
            valitActive() {
                let isActive = this.get('isActive');
                let res = true;
                if (isActive) {
                    let txt = '';
                    if (isActive == 1) {
                        txt = $t('该字段已被禁用');
                    } else if (isActive == 2) {
                        txt = $t('该字段已被删除');
                    }
                    this.error(txt);
                    res = false;
                } else {
                    this.rmError();
                }
                return res;
            },
            setValue() {
                this.set('value', '');
                this.$el.find('input').val($t('请选择'));
            }
        });
    });

    module.exports = md;
});