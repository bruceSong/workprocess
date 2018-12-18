define(function(require, exports, module) {
    const utils = require('base-modules/utils');
    //const constant = require('paas-workprocess-assets/data/objfields');
    const remindVar = require('paas-workprocess-assets/data/variables');

    const VariablesData = {
        objList: {

        },
        objDescribes: [],
        checkExpression(data, callback) {
            let jsonData = {
                json_data: JSON.stringify(data)
            };
            utils.FHHApi({
                url: '/EM1HCRMUdobj/defObjApi/expressionCheck',
                data: jsonData,
                success(res) {
                    callback(res.Result);
                }
            }, {
                errorAlertModel: 1
            });
        },
        clearObj() {
            this.objList = {

            };
        },
        fetchFieldData(entityId, callback) {
            if (!entityId) {
                return;
            }
            let me = this;
            if (me.objList && me.objList[entityId]) {
                callback(me.objList[entityId]);
                return;
            }
            utils.FHHApi({
                url: '/EM1HPROCESS/MetadataAction/FindDescribe?t=' + (new Date()).getTime(),
                data: {
                    apiName: entityId
                },
                success(res) {
                    if (res.Result.StatusCode === 0) {
                        me.objList[entityId] = res.Value;
                        callback(res.Value);
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        /*获取对象列表的描述和*/
        fetchFieldDataList(apiNameList, callback) {
            if (typeof apiNameList == 'undefined' || !apiNameList || !apiNameList.length) {
                return;
            }
            let params = {
                packageName: "CRM",
                apiNames: apiNameList,
                includeFieldsDesc: true
            };
            utils.FHHApi({
                url: '/EM1HPROCESS/MetadataAction/FindCustomObjs',
                data: params,
                success(data) {
                    if (data.Result.StatusCode == 0) {
                        console.log(data);
                        callback && callback();
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        /*批量获取对象列表*/
        fetchObjListData(entityId, callback) {
            if (typeof entityId == 'undefined' || !entityId || !entityId.length) {
                return;
            }
            let me = this;
            if (me.objDescribes && me.objDescribes[entityId]) {
                callback(me.objDescribes[entityId]);
                return;
            }
            let params = {
                packageName: "CRM",
                apiNames: [entityId, 'PersonnelObj'],
                includeLookups: true,
                includeFieldsDesc: true
            };
            utils.FHHApi({
                url: '/EM1HBPM/Metadata/FindDescsByApiNames',
                data: params,
                success(data) {
                    if (data.Result.StatusCode == 0) {
                        let describes = data.Value.customObjects;
                        let objDescribes = {
                            objectDescribe: {},
                            refObjectDescribeList: []
                        };
                        let memberDescribes = {};
                        let refObjectDescribeList = [];
                        //处理人员对象的数据
                        _.each(describes, function(item) {
                            item.api_name = item.objApiName;
                            item.display_name = item.displayName;
                            if (item.objApiName == entityId) {
                                objDescribes.objectDescribe = item;
                            }
                            memberDescribes[item.objApiName] = item;
                        });
                        _.each(objDescribes.objectDescribe.fields, function(item) {
                            let tempMember = item.target_api_name ? memberDescribes[item.target_api_name] : memberDescribes['PersonnelObj'];
                            if (['object_reference', 'employee'].indexOf(item.type) > -1 && tempMember && ['lock_user'].indexOf(item.api_name) == -1) {
                                refObjectDescribeList.push({
                                    fieldApiName: item.api_name,
                                    fieldLabel: item.label,
                                    objectDescribe: tempMember
                                });
                            }
                        });
                        objDescribes.refObjectDescribeList = refObjectDescribeList;
                        me.objDescribes[entityId] = objDescribes;
                        callback && callback(objDescribes);
                    }
                }
            }, {
                errorAlertModel: 1
            });
        },
        getCondition(fields, entityId) {
            let constant = PaasUI.fieldConfig;
            let _fields = _.filter(fields, function(item) {
                let m = true;
                if (!constant.unshow[item.api_name]) {
                    if (!(item.hasOwnProperty("used_in") && item.used_in == 'component')) {
                        if (item.define_type == 'custom') {
                            if (constant.datatype[item.type]) {
                                m = true;
                            }
                        } else {
                            //if (!(istrigger && constant.unshowTrigger[item.api_name])) {
                            if (constant.conditionFields[entityId]) {
                                if (constant.conditionFields[entityId][item.api_name]) {
                                    m = true;
                                }
                            } else if (constant.conditionFields['other'][item.api_name]) {
                                m = true;
                            }
                            if (item.name == 'name' && item.type == 'auto_number') {
                                m = false;
                            }
                            //}
                        }
                    }
                } else if (constant.conShow[item.api_name]) {
                    m = true;
                }
                return m;
            });
            let _groupFields = this.filterGroup(fields, constant.conditionGroup, constant.datatype);
            return _fields.concat(_groupFields);
        },
        getConAllFields(obj, entityId) {
            let me = this;
            let objs = [];
            let data = utils.deepClone(obj);
            data.objectDescribe.fields = me.getCondition(data.objectDescribe.fields, entityId);
            /*
            if (relateObjId) {
                data.objectDescribe.api_name = relateObjId;
            }*/
            objs = objs.concat(data.objectDescribe);
            _.each(data.refObjectDescribeList, function(item) {
                if (item.objectDescribe.api_name.indexOf('.') == -1) {
                    item.objectDescribe.display_name = data.objectDescribe.display_name + '.' + item.fieldLabel;
                    item.objectDescribe.old_api_name = item.objectDescribe.api_name;
                    item.objectDescribe.api_name = data.objectDescribe.api_name + '.' + item.fieldApiName;
                }
                item.objectDescribe.fields = me.getCondition(item.objectDescribe.fields, item.objectDescribe.old_api_name);
                if (item.objectDescribe.fields.length) {
                    objs = objs.concat(item.objectDescribe);
                }
            });

            return objs;
        },
        getAllFields(obj, entityId) {
            let me = this;
            let objs = [];
            let data = utils.deepClone(obj);
            data.objectDescribe.fields = me.getFields(data.objectDescribe.fields, entityId);
            /*
            if (relateObjId) {
                data.objectDescribe.api_name = relateObjId;
            }*/
            objs = objs.concat(data.objectDescribe);
            _.each(data.refObjectDescribeList, function(item) {
                if (item.objectDescribe.api_name.indexOf('.') == -1) {
                    item.objectDescribe.display_name = data.objectDescribe.display_name + '.' + item.fieldLabel;
                    item.objectDescribe.old_api_name = item.objectDescribe.api_name;
                    item.objectDescribe.api_name = data.objectDescribe.api_name + '.' + item.fieldApiName;
                }
                item.objectDescribe.fields = me.getFields(item.objectDescribe.fields, item.objectDescribe.old_api_name);
                if (item.objectDescribe.fields.length) {
                    objs = objs.concat(item.objectDescribe);
                }
            });
            return objs;
        },
        getFields(fields, entityId) {
            let me = this;
            fields = utils.deepClone(fields);
            _.each(fields, function(item) {
                item.value = item.api_name;
            });
            let _fields = _.filter(fields, function(field) {
                /*
                if (field.type == 'employee') {
                    field.type = 'selector';
                }
                */
                return me.filterFields(field, entityId);
            });
            //let _groupFields = this.filterGroup(fields, constant.fieldsGroup, constant.fieldsDatatype);
            return _fields;
        },
        filterFields(field, entityId) {
            let result = false;
            let constant = PaasUI.fieldConfig;
            if (!(field.hasOwnProperty("used_in") && field.used_in == 'component')) {
                if (field.define_type == 'custom') {
                    if (constant.fieldsDatatype[field.type]) {
                        result = true;
                    }
                } else {
                    if (constant.fields[entityId]) {
                        if (constant.fields[entityId][field.api_name]) {
                            return true;
                        }
                    } else if (constant.fields['other'][field.api_name]) {
                        return true;
                    }
                }
            }
            return result;
        },
        filterGroup(fields, groups, typeList) {
            if (!groups.length) {
                return [];
            }
            let _fields = _.filter(fields, function(field) {
                if (field.group_type && groups.indexOf(field.group_type) > -1) {
                    return true;
                }
            });
            let arr = [];
            _.each(_fields, function(val) {
                if (val && val.fields) {
                    _.map(val.fields, function(item) {
                        arr.push(item);
                    });
                }
            });
            let result = _.filter(fields, function(field) {
                if (arr.indexOf(field.api_name) > -1 && typeList[field.type]) {
                    return true;
                }
            });
            return result;
        },
        _getVarFields(objList, fieldType) {
            let result = {
                api_name: objList.api_name,
                display_name: objList.display_name,
                fields: []
            };
            if (objList.old_api_name) {
                result.old_api_name = objList.old_api_name;
            }
            let typeList = ['formula', 'currency', 'number'];
            let newFields = _.filter(objList.fields, function(field) {
                if (field.is_active != false) {
                    if (field.type == fieldType) {
                        if (field.define_type == 'system') {
                            return PaasUI.fieldConfig.system[field.api_name];
                        } else {
                            return true;
                        }
                    } else {
                        if (typeList.indexOf(fieldType) > -1 && typeList.indexOf(field.type) > -1 && field.define_type != 'system') {
                            return true;
                        }
                    }
                }
            });
            result.fields = newFields;
            return result;
        },
        getRemindData(objs) {
            if (typeof objs == 'undefined') {
                return;
            }
            let subFields = [];
            objs = utils.deepClone(objs);
            subFields = subFields.concat(objs.objectDescribe);
            _.each(objs.refObjectDescribeList, function(item) {
                if (item.objectDescribe.api_name.indexOf('.') == -1) {
                    item.objectDescribe.display_name = objs.objectDescribe.display_name + '.' + item.fieldLabel;
                    item.objectDescribe.old_api_name = item.objectDescribe.api_name;
                    item.objectDescribe.api_name = objs.objectDescribe.api_name + '.' + item.fieldApiName;
                }
                subFields = subFields.concat(item.objectDescribe);
            });
            return subFields;
        },
        getRemindFields(objs, entityId, fromApp) {
            let fields = this.getRemindData(objs);
            let constant = PaasUI.fieldConfig;
            //字段过滤
            _.each(fields, function(item1) {
                let entityId = item1.old_api_name ? item1.old_api_name : item1.api_name;
                item1.fields = _.filter(item1.fields, function(item) {
                    if (fromApp == 'message' && item.api_name == 'out_owner') {
                        return true;
                    } else if (item.is_active != false) {
                        if (item.define_type == 'custom') {
                            if (constant.datatype[item.type] && ['employee', 'deparment', 'true_or_false'].indexOf(item.type) == -1) {
                                return true;
                            }
                        } else {
                            if (constant.conditionFields[entityId]) {
                                if (constant.conditionFields[entityId][item.api_name]) {
                                    return true;
                                }
                            } else if (constant.conditionFields['other'][item.api_name]) {
                                return true;
                            }
                        }
                    }
                });
            });
            return fields;
        },
        getRemindVar(string, type) {
            let tmp;
            _.each(remindVar, function(item) {
                if (!item.hasSubVariable) {
                    _.each(item.variables, function(value) {
                        if (type == 1) {
                            if (value.display_name == string) {
                                tmp = value;
                            }
                        } else {
                            if (value.api_name == string) {
                                tmp = value;
                            }
                        }
                    });
                }
            });
            return tmp;
        },
        getSubFieldData(obj, fieldType, relateObjId) {

            let me = this;
            let objs = [];
            let data = utils.deepClone(obj);
            data.objectDescribe = me._getVarFields(data.objectDescribe, fieldType);
            /*
            if (relateObjId) {
                data.objectDescribe.api_name = relateObjId;
            }*/
            objs = objs.concat(data.objectDescribe);
            _.each(data.refObjectDescribeList, function(item) {
                if (!relateObjId || (relateObjId && (item.fieldApiName == relateObjId))) {
                    if (item.objectDescribe.api_name.indexOf('.') == -1) {
                        item.objectDescribe.old_api_name = item.objectDescribe.api_name;
                        item.objectDescribe.api_name = data.objectDescribe.api_name + '.' + item.fieldApiName;
                    }
                    item.objectDescribe = me._getVarFields(item.objectDescribe, fieldType);
                    if (item.objectDescribe.fields.length) {
                        objs = objs.concat(item.objectDescribe);
                    }
                }
            });
            return objs;
        },
        searchRichObjs(val, obj) {
            let res = [];
            let objsList = this.getRemindData(obj);
            val.replace(/\$\{(.+?)\}/g, function(item) {
                let arr = item.match(/\$\{(.*?)\}/);
                if (arr && arr.length) {
                    let m = arr[1];
                    if (m.indexOf('.') > -1) {
                        let tmpArr = m.split('.');
                        tmpArr.pop();
                        let v1 = _.findWhere(objsList, {
                            api_name: tmpArr.join('.')
                        });
                        if (!v1) {
                            tmpArr.pop();
                            let v2 = _.findWhere(objsList, {
                                api_name: tmpArr.join('.')
                            });
                            //目前只支持4级
                            if (v2) {
                                res.push(v2.old_api_name);
                            }
                        } else {
                            res.push(v1.old_api_name);
                        }
                    }
                }
            });
            return res;
        },
        replaceRichText(value, obj, fieldData, objName, from) {
            if (!value || typeof value !== 'string') {
                return value;
            }
            //let content = value.replace(/<[^>]+>/g, "");
            //var reger = new RegExp("\\\$\\\{(.+?)\\\}", "g");
            let me = this;

            if (from == 'formula') {
                value = value.replace(/\*/g, '×').replace(/[^(<;)]\/[^>]/g, '÷');
            }

            let varList = [];
            let result = value.replace(/\$\{(.+?)\}/g, function(item) {
                let arr = item.match(/\$\{(.*?)\}/);
                let string = '${';
                let OK = 0;
                if (arr && arr.length) {
                    let m = arr[1];
                    if (m.indexOf('.') > -1) {
                        let t = m.split('.');
                        let fieldValue = t[t.length - 1];
                        let sFieldName = t[0];
                        if (t.length >= 3) {
                            sFieldName += '.' + t[1];
                        }
                        if (t && t.length) {
                            let subFields;
                            subFields = me.getRemindData(obj);
                            if (t.length >= 3) {
                                if (objName) {
                                    string += objName + '.';
                                } else {
                                    string += subFields[0].display_name + '.';
                                }
                            }
                            let vFields;
                            let v1 = _.findWhere(subFields, {
                                api_name: sFieldName
                            });
                            if (v1) {
                                if (v1.display_name.indexOf('.') > -1) {
                                    string += v1.display_name.split('.')[1];
                                } else {
                                    string += v1.display_name;
                                }
                                vFields = v1.fields;
                            }
                            let v2;
                            if (t.length == 4) {
                                v2 = _.findWhere(subFields, {
                                    api_name: sFieldName + '.' + t[2]
                                });
                                if (v2) {
                                    vFields = v2.fields;
                                    string += '.' + v2.display_name;
                                }
                            }
                            if (v1 || v2) {
                                let tmp = _.findWhere(vFields, {
                                    api_name: fieldValue
                                });
                                if (tmp) {
                                    string += '.' + tmp.label + '}';
                                    let valsingle = {
                                        name: '${' + m + '}',
                                        label: string
                                    };
                                    if (tmp.is_active == false) {
                                        OK = 1;
                                        valsingle.isActive = 1; //被禁用
                                    }
                                    varList.push(valsingle);
                                } else {
                                    OK = 1;
                                    string += '.' + fieldValue + '}';
                                    let valsingle = {
                                        name: '${' + m + '}',
                                        label: string,
                                        isActive: 2
                                    };
                                    varList.push(valsingle);
                                }
                            } else {
                                OK = 2;
                                string = '${' + m + '}';
                                varList.push({
                                    name: '${' + m + '}',
                                    label: string
                                });
                            }
                        }
                    } else {
                        //固定值，搜索匹配变量
                        let vars = me.getRemindVar(m);
                        if (vars) {
                            string += vars.display_name + '}';
                            varList.push({
                                name: '${' + m + '}',
                                label: string
                            });
                        }

                    }

                }
                if (!OK) {
                    string = '<span class="bpm-vars">' + string + '</span>';
                } else if (OK == 1) {
                    string = '<span class="bpm-error">' + string + '</span>';
                }
                return string;
            })
            return {
                varList: varList,
                textList: result
            };
        },
        replaceRichVar(value, varList) {
            if (!value) {
                return {
                    validate: true,
                    result: ''
                };
            }
            /*
             let fields = [];
            if (!varList.length) {
                fields = this.getRemindData(objs);
            }*/
            //let content = value.replace(/<[^>]+>/g, "");
            //var reger = new RegExp("\\\$\\\{(.+?)\\\}", "g");
            let validate = true;
            value = value.replace(/<br\s*\/?>/g, "\r\n");
            let result = value.replace(/\$\{(.+?)\}/g, function(item) {
                if (varList.length) {
                    let tmp = _.findWhere(varList, {
                        label: item
                    });
                    if (tmp) {
                        if (tmp.isActive == 1 || tmp.isActive == 2) {
                            validate = false;
                        }
                        return tmp.name;
                    } else {
                        validate = false;
                        return item;
                    }
                }
                /*
                else {
                    let arr = item.split('.');
                    if (arr && arr.length) {
                        let m = _.filter(fields, {
                            display_name: arr[0]
                        });
                        if (m) {
                            let t = _.filter(m.fields, {
                                label: arr[1]
                            });
                            return '${' + t.label + '}';
                        }
                    }
                }
                */
            })
            result = result.replace(/×/g, '*').replace(/÷/g, '/').replace(/&nbsp;/g, '');
            return {
                validate,
                result
            };
        },
        replaceExpressionVar(value, varList) {
            if (!value) {
                return;
            }
            let result = value.replace(/\$\{(.+?)\}/g, function(item) {
                if (varList.length) {
                    let tmp = _.findWhere(varList, {
                        label: item
                    });
                    if (tmp) {
                        if (tmp.checkName.indexOf('.') > -1) {
                            return tmp.checkName.replace('.', '__r.');
                        } else {
                            return tmp.checkName;
                        }
                    } else {
                        return '';
                    }
                }
            })
            result = result.replace(/×/g, '*').replace(/÷/g, '/').replace(/&nbsp;/g, '');
            return result;
        }
    };
    module.exports = VariablesData;
})