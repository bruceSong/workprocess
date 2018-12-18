/**
 * 预设变量定义
 * @author luoying
 */
define(function(require, exports, module) {
    //const ObjsData = require('paas-workprocess-assets/data/vardata');
    //变量
    const variable = [{
        id: 'owner',
        name: $t('数据负责人')
    }, {
        id: 'data_group',
        name: $t('团队成员')
    }, {
        id: 'data_owner_leader',
        name: $t('数据负责人上级')
    }, {
        id: 'data_group_leader',
        name: $t('数据团队成员上级')
    }, {
        id: 'data_owner_main_dept_leader',
        name: $t('数据负责人所在主部门负责人')
    }, {
        id: 'data_group_main_dept_leader',
        name: $t('数据相关团队成员所在主部门负责人')
    }];
    const lookUpEmails = [];
    const employees = [];
    const applicant = [{
        id: 'applicant',
        name: $t('工作流发起人')
    }];

    const init = function(entityId) {
        if (typeof entityId === 'undefined') {
            return;
        }

        function getEmails(objs, type) {
            let res = [];
            if (type) {
                _.each(objs.objectDescribe.fields, function(item) {
                    if (item.type == 'email') {
                        res.push({
                            id: '${' + entityId + '.' + objs.fieldApiName + '.' + item.api_name + '}',
                            name: objs.objectDescribe.display_name + ' / ' + item.label
                        });
                    }
                });
            } else {
                _.each(objs.fields, function(item) {
                    if (item.type == 'email') {
                        res.push({
                            id: '${' + entityId + '.' + item.api_name + '}',
                            name: objs.display_name + ' / ' + item.label
                        });
                    }
                });
            }
            return res;
        }
        PaasUI.utils.fetchFieldData(entityId, function(data) {
            employees.splice(0, employees.length);
            //人员相关变量
            _.each(data.objectDescribe.fields, function(item) {
                if (item.type == 'employee' && ['owner', 'lock_user', 'out_owner'].indexOf(item.api_name) == -1) {
                    employees.push({
                        id: '${' + entityId + '.' + item.api_name + '}',
                        name: item.label
                    });
                }
            });

            lookUpEmails.splice(0, lookUpEmails.length);
            let fields = getEmails(data.objectDescribe);
            if (fields.length) {
                lookUpEmails.push({
                    id: '${' + entityId + '}',
                    name: data.objectDescribe.display_name,
                    children: fields
                });
            }
            _.each(data.refObjectDescribeList, function(item) {
                let tmp = getEmails(item, 1);
                if (tmp.length) {
                    lookUpEmails.push({
                        id: '${' + entityId + '.' + item.fieldApiName + '}',
                        name: item.objectDescribe.display_name,
                        children: tmp
                    });
                }

            });
        });
    };

    module.exports = {
        init,
        variable,
        applicant,
        lookUpEmails,
        employees
    }
});