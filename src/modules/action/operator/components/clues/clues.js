define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    //const Select = require('paas-workprocess-modules/common/field/select/select');
    const template = require('./clues-html');
    const utils = require('base-modules/utils');

    const Clues = BaseView.extend({
        initialize(options = {}) {
            BaseView.prototype.initialize.call(this, options);
            options.dataLabel = $t('线索池');
            if (options.entityId == 'AccountObj') {
                options.dataLabel = $t('公海');
            }
            this.entityId = options.entityId;
            let html = template({
                data: {
                    type: options.type,
                    isTxt: options.isTxt,
                    dataLabel: options.dataLabel
                }
            });
            this.$el.append(html);
            this.model.set('cluesList', []);
            this.model.set('type', options.type);
            this.model.set('cluesData', options);
            if (options.type == 1) {
                this.fetchClues();
            }
        },
        events: {
            'click .li-span': 'selectClues'
        },
        selectClues(e) {
            let target = $(e.target).parent();
            let cluesData = this.model.get('cluesData');
            if (target.hasClass('current')) {
                return;
            }
            this.$el.find('.li').removeClass('current');
            target.addClass('current');
            if (target.index() == 0) {
                cluesData.type = 0;
                //初始化指定线过池
                //let label = `请选择目标${cluesData.dataLabel}`;
                let label = $t('请选择目标{{cluesData.dataLabel}}', {
                    data: {
                        cluesData
                    }
                });
                this.find('.cule-selecotr')
                    .html(`<div class="bpm-select_one bpm-readonly"><div class="bpm-text"><input type="text" readonly="readonly" value="${label}"></div></div>`);
            } else {
                cluesData.type = 1;
                this.fetchClues();
            }
            this.model.set('type', cluesData.type);
            this.trigger('change', '');
            this.model.set('cluesData', cluesData);
        },
        fetchClues() {
            let cluesList = this.model.get('cluesList');
            let cluesData = this.model.get('cluesData');
            if (cluesList.length) {
                this.renderSpecial();
                return;
            }
            let url = '/EM1HCRM/HighSeas/GetAllHighSeasList';
            if (this.entityId == 'LeadsObj') {
                url = '/EM1HCRM/SalesCluePool/GetSalesCluePoolShortInfo';
            }
            let me = this;
            utils.FHHApi({
                url: url,
                data: {},
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        let cluesList = [];
                        if (cluesData.entityId == 'LeadsObj') {
                            _.each(res.Value.SalesCluePoolShortInfoList, function(item) {
                                cluesList.push({
                                    label: item.Name,
                                    value: item.SalesCulePoolID
                                });
                            });
                        } else {
                            _.each(res.Value.HighSeasList, function(item) {
                                cluesList.push({
                                    label: item.Name,
                                    value: item.HighSeasID
                                });
                            });
                        }
                        me.model.set('cluesList', cluesList);
                        me.renderSpecial();
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        renderSpecial() {
            let me = this;
            let fieldValue = '';
            let cluesData = this.model.get('cluesData');
            if (cluesData.belongTo) {
                fieldValue = cluesData.belongTo;
            }
            let cluesList = this.model.get('cluesList');
            let selectData = {
                name: "selector",
                value: fieldValue,
                label: '',
                type: 'select_one',
                options: cluesList,
                readonly: false,
                useSearch: true,
                required: true
            };
            let model = new Backbone.Model(selectData);
            let selector = new PaasUI.field.select_one({
                model: model
            });
            this.find('.cule-selecotr').html(selector.$el);
            selector.on('change', function(model) {
                me.trigger('change', model.get('value'));
            });
            this.selector = selector;
        },
        validate() {
            let cluesData = this.model.get('cluesData');
            if (cluesData.type == 1 && this.selector && this.selector.get('value') == '') {
                this.error($t('请选择目标{{cluesData.dataLabel}}', {
                    data: {
                        cluesData
                    }
                }));
                return false;
            }
            this.rmError();
            return true;
        }
    });
    module.exports = Clues;
});