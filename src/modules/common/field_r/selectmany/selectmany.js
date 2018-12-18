define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./selectmany-html');

    const SelectManyView = BaseView.extend({
        template: template,
        initialize(options) {
            let me = this;
            BaseView.prototype.initialize.call(me, options);
            me.values = {};
            me.labels = {};
            let val = me.model.get('value');
            let label = val;
            if (me.model.get('label')) {
                label = me.model.get('label');
            }
            _.each(val, function(v) {
                if (v != '') {
                    me.values[v] = 1;
                }
            });
            _.each(label, function(v) {
                if (v != '') {
                    me.labels[v] = 1;
                }
            });
            me.model.set('value', _.keys(me.values));
            me.model.set('label', _.keys(me.labels));
        },
        events: {
            'click .select_many>span': 'toggleSelect',
            'click .bpm-text': 'toggle'
        },
        bindEvents() {
            this._bindEvents.delay(this, 50);
        },
        _bindEvents() {
            let me = this;
            me.$el.closest('.workprocess-form').on('click', function(e) {
                e.stopPropagation();
                if (!$(e.target).parents('.select_many_list').length && !$(e.target).hasClass('select_many_list')) {
                    me.find('.select_many_ul').hide();
                    //me.trigger('change', me);
                }
            });
            /*
            let me = this;
            $('body').on('click', function(e) {
                if (!$(e.target).parents('.select_many_list').length && !$(e.target).hasClass('select_many_list')) {
                    me.find('.select_many_ul').hide();
                    me.trigger('change', me);
                }
            });*/
        },
        toggle(e) {
            e.stopPropagation();
            if (!this.$el.find('.select_many_list').hasClass('bpm-readonly')) {
                this.find('.select_many_ul').toggle();
                if (this.find('.select_many_ul').css('display') == 'none') {
                    this.trigger('change', this);
                }
            }
        },
        toggleSelect(e) {
            let $target = $(e.target);
            let val = $target.data('value');
            let label = $target.data('label');
            if (!$target.hasClass('bpm-readonly')) {
                if ($target.hasClass('active')) {
                    $target.removeClass('active');
                    delete this.values[val];
                    delete this.labels[label];
                } else {
                    $target.addClass('active');
                    this.values[val] = 1;
                    this.labels[label] = 1;
                }
                this.model.set('value', _.keys(this.values));
                this.model.set('label', _.keys(this.labels));
                var labelHtml = "";
                let labels = _.keys(this.labels);
                if (labels.length) {
                    _.each(labels, function(item, index) {
                        let t = '、';
                        if (index == labels.length - 1) {
                            t = '';
                        }
                        labelHtml += "<span>" + item + t + "</span>";
                    });
                } else {
                    labelHtml = "<span>请选择</span>";
                }
                this.find('.bpm-text').html(labelHtml); //更新到html
                this.trigger('change', this);
            }
        },
        validate() {
            let val = this.model.get('value');
            let label = this.model.get('label');
            let required = this.model.get('required');
            if (required && val.length == 0) {
                this.error(label + '不能为空');
                return false;
            }

            this.rmError();
            return true;
        }
    });

    module.exports = SelectManyView;
});