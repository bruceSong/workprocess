define(function(require, exports, module) {

    const utils = require('paas-workprocess-modules/common/utils/utils');
    const VariablesData = require('paas-workprocess-assets/data/vardata');

    module.exports = {
        formateData(string, type) {
            let date = new Date(string);
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hours = date.getHours();
            let min = date.getMinutes();
            let seconds = date.getSeconds();
            if (type == 'date') {
                return year + '-' + month + '-' + day;
            } else if (type == 'date_time') {
                return year + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + seconds;
            } else if (type == 'time') {
                return hours + ':' + min;
            }
        },
        /*用正则表达式实现html转码*/
        htmlEncodeByRegExp: function(str) {
            if (typeof str == 'undefined' || str === '' || str === null) {
                return '';
            }
            if (str === 0) {
                return 0;
            }
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            //s = s.replace(/\s/g, "&nbsp;");
            s = s.replace(/\r\n/g, "<br />")
            s = s.replace(/\n/g, "<br />");
            return s;
        },
        getCommonLabel(data, type) {
            if (typeof data == 'undefined') {
                return;
            }
            /*
            if (data && data.recipients.hasOwnProperty("label") && !data.label) {
                delete data.label;
            }
            if ($.isEmptyObject(data)) {
                data.label = '';
                return data;
            }
            */
            let label = [];
            if (data.person && data.person.length) {
                label = label.concat(utils.getEmployeeNamesByIds.call(this, data.person, type));
            }
            if (data.dept && data.dept.length) {
                label = label.concat(utils.getCircleNamesByIds(data.dept));
            }
            if (data.group && data.group.length) {
                label = label.concat(utils.getGroupNamesByIds(data.group));
            }
            if (data.role && data.role.length) {
                label = label.concat(utils.getRoleNamesByIds(data.role));
            }
            if (data.dept_leader && data.dept_leader.length) {
                label = label.concat(utils.getMasterNamesByIds(data.dept_leader));
            }
            if (data.ext_process && data.ext_process.length) {
                label = label.concat(utils.getProcessNamesByIds(data.ext_process));
            }
            if (data.applicant && data.applicant.length) {
                label = label.concat(utils.getApplicantNamesByIds(data.applicant));
            }
            if (data.emails && data.emails.length) {
                label = label.concat(utils.getEmailsNamesByIds(data.emails));
            }
            if (data.extUserType && data.extUserType.length) {
                label = label.concat(utils.getEmployeesListByIds(data.extUserType));
            }
            /*
            data.label = label.join(',');
            data.label = data.label.replace(/,/g, $t('，'));
            */
            return label;
        },
        getValueType(type) {
            let result;
            switch (type) {
                case 'number':
                case 'currency':
                case 'date':
                case 'date_time':
                case 'time':
                case 'percentile':
                case 'formula':
                    result = 'number';
                    break;
                case 'auto_number':
                    result = 'text';
                    break;
                case 'true_or_false':
                    result = 'boolean';
                    break;
                default:
                    result = 'text';
                    break;
            }

            return result;
        },
        getRecLable(data, type) {

            if (typeof data == 'undefined' || typeof data.recipients == 'undefined') {
                return;
            }
            if (data && data.recipients && data.recipients.hasOwnProperty("label") && !data.recipients.label) {
                delete data.recipients.label;
            }
            if ($.isEmptyObject(data.recipients)) {
                data.recipients.label = '';
                return data;
            }
            /*
            if (!(data.recipients.hasOwnProperty("label") && data.recipients.label)) {
            */
            let label = [];
            if (data.recipients.person && data.recipients.person.length) {
                label = label.concat(utils.getEmployeeNamesByIds.call(this, data.recipients.person, type));
            }
            if (data.recipients.dept && data.recipients.dept.length) {
                label = label.concat(utils.getCircleNamesByIds(data.recipients.dept));
            }
            if (data.recipients.group && data.recipients.group.length) {
                label = label.concat(utils.getGroupNamesByIds(data.recipients.group));
            }
            if (data.recipients.role && data.recipients.role.length) {
                label = label.concat(utils.getRoleNamesByIds(data.recipients.role));
            }
            if (data.recipients.dept_leader && data.recipients.dept_leader.length) {
                label = label.concat(utils.getMasterNamesByIds(data.recipients.dept_leader));
            }
            if (data.recipients.ext_process && data.recipients.ext_process.length) {
                label = label.concat(utils.getProcessNamesByIds(data.recipients.ext_process));
            }
            if (data.recipients.applicant && data.recipients.applicant.length) {
                label = label.concat(utils.getApplicantNamesByIds(data.recipients.applicant));
            }
            if (data.recipients.emails && data.recipients.emails.length) {
                label = label.concat(utils.getEmailsNamesByIds(data.recipients.emails));
            }
            //label = label.substring(1);
            data.recipients.label = label.join(',');
            //}
            data.recipients.label = data.recipients.label.replace(/,/g, $t('，'));
            return data;
        },
        searchField(fieldname, relateObjs) {
            if (typeof fieldname == 'undefined') {
                return;
            }
            if (fieldname.indexOf('.') == -1) {
                return;
            }
            let res;
            //先查本对象是否有此字段
            let fieldsArr = fieldname.split('.');
            if (fieldsArr.length == 2) {
                res = _.findWhere(relateObjs.objectDescribe.fields, {
                    api_name: fieldsArr[1]
                });

            } else if (fieldsArr.length == 3) {
                _.each(relateObjs.refObjectDescribeList, function(item) {
                    if (item.fieldApiName == fieldsArr[1]) {
                        res = _.findWhere(item.objectDescribe.fields, {
                            api_name: fieldsArr[2]
                        });
                    }
                });
            }
            return res;
        },
        getFieldLabel(key, fieldInfo, obj) {
            let label = obj.objectDescribe.display_name;
            let fieldsArr = key.split('.');
            let length = fieldsArr.length;
            if (length > 2) {
                for (var i = 1; i < length - 1; i++) {
                    let tmp = _.findWhere(obj.refObjectDescribeList, {
                        fieldApiName: fieldsArr[i]
                    });
                    if (tmp) {
                        label += '.' + tmp.fieldLabel;
                    }
                }
            }
            label += '.' + fieldInfo.label;
            return label;
        },

        getFieldsInfo(data, objs) {
            let arr = [];
            if (!data || !data.key) {
                return;
            }
            let key = data.key.match(/\$\{(.*?)\}/)[1];

            let temp = this.searchField(key, objs);
            if (temp) {
                if (temp.is_active == false) {
                    arr.push('<i>' + temp.label + '</i>');
                } else {
                    let fieldLabel = this.getFieldLabel(key, temp, objs);
                    arr.push(fieldLabel);
                }
                if (['number', 'currency', 'date', 'date_time', 'time'].indexOf(temp.type) == -1) {
                    let value = data.value;
                    if (temp.options) {
                        let valueArr = [];
                        if (!(value instanceof Array)) {
                            valueArr.push(value);
                        } else {
                            valueArr = value;
                        }
                        _.each(valueArr, function(item1) {
                            _.each(temp.options, function(val) {
                                if (val.value.toString() == item1 || val.value === item1) {
                                    arr.push(val.label);
                                }
                            });
                        });
                    } else if (temp.type == 'employee') {
                        let label = utils.getEmployeeNamesByIds(value);
                        arr.push(label.join($t('，')));
                    } else if (temp.type == 'department') {
                        let label = utils.getCircleNamesByIds(value);
                        arr.push(label.join($t('，')));
                    } else {
                        if (temp.type == 'percentile') {
                            value = value + '%';
                        }
                        arr.push(value);
                    }
                } else {
                    let val = data.value;
                    let value = '';
                    if (['date', 'date_time', 'time'].indexOf(temp.type) > -1 && typeof val === 'number' && !isNaN(val)) {
                        value = this.formateData(val, temp.type);
                    } else {
                        value = VariablesData.replaceRichText(val, objs, temp).textList;
                    }
                    arr.push(value);
                }
            } else {
                arr.push('<i>' + key.split('.')[1] + '</i>');
                arr.push(data.value);
            }
            return arr;
        }
    }
})