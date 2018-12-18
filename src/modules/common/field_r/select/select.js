 define(function(require, exports, module) {
     const BaseView = require('paas-workprocess-modules/common/base/base');
     const template = require('./select-html');

     const SelectView = BaseView.extend({
         template: template,
         events: {
             'click .bpm-text': 'toggle'
         },
         initialize(options) {
             if (options.model) {
                 options.model.set('optionMap', {});
             }
             let me = this;
             BaseView.prototype.initialize.call(this, options);

             setTimeout(function() {
                 me.valitActive();
             }, 100);

         },
         valitActive() {
             let isActive = this.get('isActive');
             let res = true;
             if (isActive) {
                 let txt = '';
                 if (isActive == 1) {
                     txt = '该字段已被禁用';
                 } else if (isActive == 2) {
                     txt = '该字段已被删除';
                 }
                 this.error(txt);
                 res = false;
             } else {
                 this.rmError();
             }
             return res;
         },
         bindEvents() {
             this._bindEvents.delay(this, 50);
         },
         _bindEvents() {
             let me = this;
             me.$el.on('click', '.select-list', function(e) {
                 let val = $(e.target).attr('data-value');
                 let label = $(e.target).attr('data-label');
                 let isActive = 0;
                 if (val === '') {
                     return;
                 }
                 if ($(e.target).attr('data-isActive') == 'false') {
                     isActive = 1;
                 }

                 //let opts = me.model.get('options');

                 me.model.set('value', val);
                 me.model.set('label', label);
                 me.model.set('isActive', isActive);
                 /*
                 _.each(opts, function(opt) {
                     if (opt.value == val) {
                         me.model.set('value', opt.value);
                         me.model.set('label', opt.label);
                     }
                 });
                */
                 me.find('.bpm-text>input').val(label);
                 me.find('.select-list').hide();
                 me.valitActive();
                 me.trigger('change', me.model);
             });

             $('body').on('click', (event) => {
                 event.preventDefault();
                 let target = $(event.target);
                 if (!target.closest('.bpm-text').length || target.closest('.bpm-text')[0] != me.$el.find('.bpm-text')[0]) {
                     me.$el.find('.select-list').hide();
                 }
             });
         },
         renderOptions(arr) {
             let me = this;
             let options = me.model.get('options');
             let html = ' <li data-value="-1" data-label="请选择">请选择</li>';
             _.each(options, function(item) {
                 if (arr.indexOf(item.value) == -1 || item.value == me.get('value')) {
                     html += '<li data-value="' + item.value + '" data-label="' + item.label + '">' + item.label + '</li>';
                 }
             });
             this.$el.find('.options').html(html);
         },
         toggle() {
             //e.stopPropagation();
             if (!this.$el.find('.bpm-select_one').hasClass('bpm-readonly')) {
                 this.find('.select-list').toggle();
             }
         },
         rerend(options) {
             let defaultValue = this.get('value');
             let clearDefaultValue = true;
             let optionMap = {};
             _.map(options, (item) => {
                 _.map(item, (obj) => {
                     _.map(obj, (id) => {
                         optionMap[id] = 1;
                         if (id == defaultValue) {
                             clearDefaultValue = false;
                         }
                     });
                 });
             });
             this.model.set('optionMap', optionMap);
             this.model.set('readonly', false);

             if (clearDefaultValue) {
                 this.model.set('value', '');
                 this.find('input').val('请选择');
                 this.trigger('change', this.model);
             }

             this.render();

             if (_.isEmpty(optionMap)) {
                 this.clear();
             }
         },
         validate() {
             if (!this.valitActive()) {
                 return false;
             }
             let val = this.model.get('value');
             let label = this.model.get('label');
             let required = this.model.get('required');
             if (required && (val === '' || val === '-1' || val === -1)) {
                 if (label == '请选择') {
                     label = '';
                 }
                 this.error('请选择' + label);
                 return false;
             }
             this.rmError();
             return true;
         },
         getOption() {
             let v = this.get('value');
             let options = this.get('options');
             if (v && options) {
                 let option;
                 _.each(options, (item) => {
                     if (item.value == v) {
                         option = item;
                     }
                 });
                 return option;
             }
         },
         setValue() {
             this.model.set('value', '');
             this.find('input').val('请选择');
         },
         clear() {
             this.find('input').val('');
             this.find('.select-list').html('');
         }
     });

     module.exports = SelectView;
 });