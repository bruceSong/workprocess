/**
 * 接口请求层定义
 * @author luoying
 */
define(function(require, exports, module) {
    const contacts = FS.contacts;
    const utils = require('base-modules/utils');
    const constant = require('paas-workprocess-assets/data/constant');
    const moduleName = 's-Appr';
    const operationMap = {
        1: 'Add',
        2: 'Drop',
        3: 'AddDrop',
        4: 'OwnerDept',
        11: 'Single',
        12: 'Multiple',
        13: 'Countersignature',
        14: 'Leader',
        15: 'LeaderUpperOne',
        16: 'LeaderUpperTwo',
        17: 'LeaderUpperThree',
        18: 'AfterConfirmSendMessage',
        19: 'AfterRejectSendMessage',
        20: 'AfterConfirmUpdateField',
        21: 'AfterRejectUpdateField'
    };
    // const STATUS_SUCCESS = [0, 200];

    const _onSucess = (res, callback) => {
        let value = res.Value;
        if (!value || typeof value === 'string' || (_.isEmpty(value) && !_.isArray(value))) {
            let msg = (res.Result || {}).FailureMessage;
            if (msg) {
                utils.alert(msg);
                return;
            }
            utils.alert($t('服务器内部错误！'));
            return;
        }

        // if (value.status !== void 0 && !_.contains(STATUS_SUCCESS, value.status)) {
        //   utils.alert(value.message || $t('服务器内部错误！'));
        //   return;
        // }
        callback(value);
    }

    const _onError = (callback) => {
        utils.alert($t('客户端错误！'));
        callback(null);
    }

    const _parseDefObjects = (items) => {
        return _.map(items, (item) => {
            return {
                label: item.display_name,
                name: item.api_name,
                value: item.api_name,
                fields: null,
                is_active: item.is_active
            }
        })
    }

    const _parseCRMFields = (items) => {
        let fields = [];
        _.each(items, (item) => {
            // 排除分割线
            if (item.FieldType === 1) return;
            let parseData = {
                id: item.UserDefinedFieldID,
                type: item.FieldType,
                name: item.FieldName,
                label: item.FieldCaption,
                value: item.FieldName
            };
            if (item.FieldType === 8) {
                parseData.options = _.map(item.EnumDetails, (d) => {
                    return {
                        label: d.ItemName,
                        value: d.ItemCode
                    }
                });
            }

            fields.push(parseData);
        });
        return fields;
    }

    const _parseDefObjFields = (value, object) => {
        // value.objectDescribe.fields
        // value.refObjectDescribeList
        let fields = [];
        let lookupFields = {};
        //解析fields
        let _parseFields = (items) => {
            let _fields = [];
            _fields.push({
                type: '@OWNER_MAIN_DEPT_PATH',
                name: '@OWNER_MAIN_DEPT_PATH',
                value: '@OWNER_MAIN_DEPT_PATH',
                label: $t('负责人所在主部门'),
                define_type: 'package',
                is_reuqired: false,
            })
            let _f = constant.FIELD_FOR_CONDITION[object] || constant.FIELD_FOR_CONDITION['other'];

            _.each(items, (item) => {
                if (item.api_name === 'name') {
                    let _d = {
                        type: item.type,
                        name: item.api_name,
                        value: item.api_name,
                        label: item.label,
                        define_type: item.define_type,
                        is_reuqired: item.is_reuqired
                    };
                    _fields.unshift(_d);
                } else {
                    // if (_comein[item.type] !== 1) return;
                    if (item.define_type === 'system' && constant.FIELD_IS_SYSTEM[item.api_name] !== 1) {
                        return;
                    }
                    if (item.define_type === 'package' && !_f[item.api_name]) return;
                    let _d = {
                        type: item.type,
                        name: item.api_name,
                        value: item.api_name,
                        label: item.label,
                        define_type: item.define_type,
                        is_reuqired: item.is_reuqired,
                        is_active: item.is_active
                    };

                    if (_d.type === 'select_one' || _d.type === 'select_many' || _d.type === 'country' || _d.type === 'province' || _d.type === 'city' || _d.type === 'district') {
                        _d.options = item.options;
                        if (item.cascade_parent_api_name) {
                            _d.cascade_parent_api_name = item.cascade_parent_api_name;
                        }
                    }

                    if (_d.type === 'record_type') {
                        _d.options = _.map(item.options, (option) => {
                            return {
                                label: option.label,
                                value: option.api_name
                            }
                        });
                    }

                    _fields.push(_d);
                }
            });

            return _fields;
        }

        fields = _parseFields(value.objectDescribe.fields);
        _.each(value.refObjectDescribeList, (refObject) => {
            let api_name = refObject.fieldApiName;
            let label = refObject.fieldLabel;
            let items = refObject.objectDescribe.fields;
            let target_api_name = refObject.objectDescribe.api_name;
            lookupFields[api_name] = {
                api_name: target_api_name,
                name: api_name,
                label: label,
                fields: _parseFields(items)
            };
        });

        return {
            fields,
            lookupFields
        }
    };

    module.exports = {
        //获取自定义对象
        getDefObjects(includeSys, callback) {
            return utils.FHHApi({
                url: '/EM1HCRMUdobj/defObjApi/findDescribeList',
                data: {
                    isDraft: false,
                    isIncludeSystemObj: includeSys,
                    isIncludeFieldDescribe: false,
                    isIncludeUnActived: true
                },
                success: (res) => _onSucess(res, (value) => callback(_parseDefObjects(value.objectDescribeList))),
                error: () => _onError(callback)
            });
        },
        // 根据对象获取字段列表
        getCRMFields(object, callback) {
            return utils.FHHApi({
                url: '/EM1HCRM/UserDefinedField/GetUserDefinedFieldListByOwnerType',
                data: {
                    OwnerType: object
                },
                success: (res) => _onSucess(res, (value) => callback(_parseCRMFields(value.Items))),
                error: () => _onError(callback)
            });
        },
        //获取自定义对象字段列表
        getDefObjFields(object, callback) {
            return utils.FHHApi({
                url: '/EM1HCRMUdobj/defObjApi/findDescribeByApiName',
                data: {
                    apiname: object,
                    include_layout: false,
                    include_ref_describe: true
                },
                success: (res) => _onSucess(res, (value) => callback(_parseDefObjFields(value, object))),
                error: () => _onError(callback)
            });
        },

        // 查询审批流
        fetch(id, callback) {
            return utils.FHHApi({
                url: '/EM1HWORKFLOW/wfDefService/afDetail',
                data: {
                    tenantId: constant.ENTERPRISE_ID,
                    appId: constant.APPID,
                    userId: contacts.getCurrentEmployee().id + '',
                    workflowId: id
                },
                success: (res) => _onSucess(res, (value) => callback(value)),
                error: () => _onError(callback)
            });
        },

        // 启用或停用流程
        // status:true-启用，false-停用
        enable(id, status, callback) {
            return utils.FHHApi({
                url: '/EM1HWORKFLOW/wfDefService/enableFlow',
                data: {
                    tenantId: constant.ENTERPRISE_ID,
                    appId: constant.APPID,
                    userId: contacts.getCurrentEmployee().id + '',
                    sourceWorkflowId: id,
                    enable: status
                },
                success: (res) => _onSucess(res, callback),
                error: () => _onError(callback)
            });
        },

        fetchRoleList(callback) {
            return utils.FHHApi({
                url: '/EM1HCRMUdobj/roleShareApi/getRoleList',
                success: (res) => _onSucess(res, callback),
                error: () => _onError(callback)
            })
        },

        fetchGroupList(callback) {
            return utils.FHHApi({
                url: '/EM1HCRMUdobj/groupShareApi/allGroups',
                success: (res) => _onSucess(res, callback),
                error: () => _onError(callback)
            })
        },

        //国家省市区
        fetchCAFO(callback) {
            return utils.FHHApi({
                url: '/EM1HCRMUdobj/global/country_area_field_options',
                type: 'get',
                success: (res) => {
                    if (res.Result.StatusCode === 0) {
                        callback(res.Value)
                    }
                }
            });
        },

        /**
         * @desc paas/workflow埋点统计
         * @param moduleType  {{Number}}  module类型
         * @param subM        {{String}} 子模块  require
         * @param data        {{传递数据}}
         * wiki: http://wiki.firstshare.cn/pages/viewpage.action?pageId=37090738
         */
        uploadLog(data) {
            let subM;
            data.eventId = operationMap[data.eventId];
            if (data.id < 4) {
                subM = 'Setting';
                if (data.id !== 4) data.eventId = data.eventId + data.prefix;
            } else {
                subM = 'setting'
            }
            data.operationId = data ? data.eventId : ''; // 后变更修改增加的时间id
            data = $.extend(true, {
                biz: 'FS-CRM',
                module: moduleName,
                pageData: {
                    pageId: location.hash
                },
                eventId: '', // module_subM_operationId
                operationId: '', // add edit view
                eventType: 'pv', // pv cl
                eventData: {
                    eventId: data.eventId || ''
                },
                subModule: subM,
                dataVersion: 1
            }, data || {});
            data.eventId = moduleName + '_' + subM + '_' + data.operationId + (data.eventData.type ? data.eventData.type : '');
            data.eventData.source = data.eventData.source ? data.eventData.source : (subM || moduleName || '');
            data.pageData = JSON.stringify(data.pageData);
            data.eventData = JSON.stringify(data.eventData);
            utils.uploadLog('crmbiz', data);
        }
    };
});