define(function(require, exports, module) {
    const BaseView = require('paas-workprocess-modules/common/base/base');
    const template = require('./file-html');
    const filesTableTemplate = require('./filestable-html');

    const duplcateArray = (arr) => {
        let o = {};
        _.each(arr, (item) => {
            o[item.path] = item;
        });
        let res = [];
        _.each(o, (item) => {
            res.push(item);
        });
        return res;
    }

    const TextView = BaseView.extend({
        template: template,
        events: {
            'click .upload-btn': 'upload'
        },
        initialize(options) {
            BaseView.prototype.initialize.call(this, options);
            this.rendFileList();
        },
        bindEvents() {
            let me = this;
            me.model.on('change', me.rendFileList, me);
            me.$el.on('click', '.j-attach-del', (e) => {
                let co = $(e.target).closest('.bpm-readonly');
                if (co.length == 0) {
                    me.deleteFile(e);
                }
            });
        },
        upload(e) {
            let me = this;
            let co = $(e.target).closest('.bpm-readonly');
            if (co.length == 0) {
                require.async('crm-modules/components/upload/upload', (Upload) => {
                    if (!me.diskUpload) {
                        me.diskUpload = new Upload({
                            onlyTemp: true,
                            zIndex: 2000
                        });
                        me.diskUpload.on('suc', (file, temp) => {
                            temp = temp.map((item) => {
                                let size = parseInt(item.AttachSize);
                                return {
                                    path: item.TempFileName,
                                    ext: item.FileExtension,
                                    filename: item.AttachName,
                                    size: size
                                }
                            });
                            let val = me.model.get('value');
                            if (val instanceof Array) {
                                if (temp.length + val.length > this.amountLimit) {
                                    require.async('crm-modules/common/util', (util) => {
                                        util.alert('附件最多只能上传' + this.amountLimit + '个!');
                                    });
                                    temp = temp.slice(0, this.amountLimit - val.length);
                                }
                                temp = temp.concat(val);
                            }
                            me.model.set('value', temp);
                        });
                    }

                    me.diskUpload.show({
                        dirId: '',
                        dirName: ''
                    })
                });
            }
        },
        rendFileList() {
            let val = this.model.get('value');
            this.amountLimit = this.model.get('file_amount_limit');
            let _html = filesTableTemplate({
                fileList: val
            });
            this.find('.crm-g-attach').html(_html);
            if (val.length >= this.amountLimit) {
                this.find('.upload-btn').css('display', 'none');
            } else {
                this.find('.upload-btn').css('display', 'block');
            }
        },
        deleteFile(e) {
            let val = this.model.get('value');
            let filePath = e.target.getAttribute('data-path');
            let temp = _.filter(val, (file) => {
                return file.path != filePath;
            });
            this.model.set('value', temp);
        },
        getValue() {
            let o = {};
            let name = this.get('name');
            let value = this.get('value');
            value = value || [];
            value = duplcateArray(value);

            o[name] = value;

            return o;
        },
        validate() {
            let value = this.get('value');
            let required = this.get('required');
            if (required && value.length == 0) {
                this.error('请上传附件');
                return false;
            }

            this.rmError();

            return true;
        }
    });

    module.exports = TextView;
});