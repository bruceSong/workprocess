/**
 * Created by Chun Hong Zhao on 2017-01-12 11:44:13
 */
define(function(require, exports, module) {
    //const groups = FS.contacts.getAllCircles();
    const VarsData = require('paas-workprocess-assets/data/selectorData');
    const SelectInput = require('vue-selector-input');
    //部门负责人
    /*
    const department = [];
    _.each(groups, function(item) {
        if (item.circlePrincipalId) {
            let name = FS.contacts.getEmployeeById(item.circlePrincipalId);
            department.push(name);
        }
    });
    */
    const Selector = Backbone.View.extend({
        initialize() {
            this.render();
        },
        render() {
            let me = this;
            me.options.selector = me.options.selector || ['member', 'group', 'master', 'usergroup', 'role', 'system', 'ext_process', 'emails', 'applicant', 'fieldvar'];

            let data = {
                el: me.el,
                parentNode: me.el,
                label: me.options.placeholder || "请选择", //框内显示label
                tabs: [],
                single: me.options.singleselect || false,
                foldInput: me.options.foldInput || true,
                zIndex: 10000
            };
            me.options.selector.map((item) => {
                switch (item) {
                    case 'member': //同事
                        data.member = true;
                        break;
                    case 'group': //部门
                        //data.group = true;
                        if (me.options.isCompany) {
                            data.group = {
                                company: true
                            };
                        } else {
                            data.group = true;
                        }
                        break;
                    case 'role': //角色
                        data.role = true;
                        break;
                    case 'master': //角色
                        data.master = true;
                        break;
                    case 'usergroup': //角色
                        data.usergroup = true;
                        break;
                    case 'system': //角色
                        data.tabs.push({
                            id: 'system',
                            title: '系统负责人',
                            type: 'list',
                            data: [{
                                id: '-10000',
                                name: '系统'
                            }]
                        });
                        break;
                    case 'fieldvar': //角色
                        data.tabs.push({
                            id: 'fieldvar',
                            title: '变量',
                            type: 'list',
                            data: [{
                                id: '-10000',
                                name: '当前节点工作流变量'
                            }]
                        });
                        break;
                    case 'ext_process': //角色
                        data.tabs.push({
                            id: 'ext_process',
                            title: '数据相关变量',
                            type: 'list',
                            data: VarsData.variable
                        });
                        break;
                    case 'emails': //角色
                        data.tabs.push({
                            id: 'emails',
                            title: '相关对象变量',
                            type: 'tree',
                            cascade: true,
                            onlyLeafNode: true,
                            data: {
                                id: 0,
                                name: '全部',
                                children: VarsData.lookUpEmails
                            }
                        });
                        break;
                    case 'applicant': //角色
                        data.tabs.push({
                            id: 'applicant',
                            title: '流程相关变量',
                            type: 'list',
                            data: VarsData.applicant
                        });
                        break;
                }
            });

            me.selector = new SelectInput(data);
            me.setDefaultValue(me.options.value);
            me.setGrayItems(me.options.grayItems);
            me.selector.on('change', me.handleChange.bind(me));
        },
        /**
         * 设置选人组件 默认选中的值
         */
        setDefaultValue(value) {
            if (value) {
                const defaultValue = this._convertValue(value);
                this.selector.setValue(defaultValue);
            }
        },
        /**
         * 设置选人组件 默认置灰的值
         */
        setGrayItems(value) {
            if (value) {
                const grayItems = this._convertValue(value);
                this.selector.addGrayItems(grayItems);
            }
        },
        _convertValue(value) {
            const result = {};
            if (value.person) {
                result.member = value.person;
            }
            if (value.dept) {
                result.group = value.dept;
            }
            if (value.group) {
                result.usergroup = value.group;
            }
            if (value.role) {
                result.role = value.role;
            }
            if (value.master) {
                result.master = value.master;
            }
            if (value.dept_leader) {
                result.dept_leader = value.dept_leader;
            }
            if (value.ext_process) {
                result.ext_process = value.ext_process;
            }
            if (value.applicant) {
                result.applicant = value.applicant;
            }
            if (value.system) {
                result.system = value.system;
            }
            if (value.emails) {
                result.emails = value.emails;
            }
            return result;
        },
        getSelectedIds(data) {
            let result = {};
            // 人
            let person = [];
            // 部门
            let dept = [];
            // 角色
            let role = [];
            // 用户组
            let group = [];
            // 合并后的 label
            let label = [];
            //部门负责人
            let master = [];
            //变量
            let ext_process = [];
            let applicant = [];
            let system = [];
            let emails = [];
            let dept_leader = [];
            data.group && data.group.map((item) => {
                dept.push(item.id + '')
                label.push(item.name);
            });
            data.member && data.member.map((item) => {
                person.push(item.id + '');
                label.push(item.name);
            });
            data.usergroup && data.usergroup.map((item) => {
                group.push(item.id + '');
                label.push(item.name);
            });
            data.role && data.role.map((item) => {
                role.push(item.id + '');
                label.push(item.name + '');
            });
            data.master && data.master.map((item) => {
                master.push(item.id + '');
                label.push(item.name + '');
            });
            data.dept_leader && data.dept_leader.map((item) => {
                dept_leader.push(item.id + '');
                label.push(item.name + '');
            });
            data.ext_process && data.ext_process.map((item) => {
                ext_process.push(item.id + '');
                label.push(item.name + '');
            });

            data.applicant && data.applicant.map((item) => {
                applicant.push(item.id + '');
                label.push(item.name + '');
            });

            data.system && data.system.map((item) => {
                system.push(item.id + '');
                label.push(item.name + '');
            });

            data.emails && data.emails.map((item) => {
                emails.push(item.id + '');
                label.push(item.name + '');
            });

            if (dept.length) {
                result.dept = dept;
            }
            if (person.length) {
                result.person = person;
            }
            if (group.length) {
                result.group = group;
            }
            if (role.length) {
                result.role = role;
            }
            if (master.length) {
                result.master = master;
            }
            if (master.length) {
                result.dept_leader = dept_leader;
            }
            if (ext_process.length) {
                result.ext_process = ext_process;
            }
            if (applicant.length) {
                result.applicant = applicant;
            }
            if (system.length) {
                result.system = system;
            }
            if (emails.length) {
                result.emails = emails;
            }
            result.label = label.join(',');
            return result;
        },
        handleChange() {
            const value = this.getValue();
            if (this.options.onChange) {
                this.options.onChange.call(this.options.onChange, value.label, value);
            }
        },
        getValue() {
            const selected = this.selector.getSelectedItems();
            const value = this.getSelectedIds(selected);
            return value;
        },
        getLabel() {
            const value = this.getValue();
            return value.label;
        },
        destroy() {
            this.$el.empty();
            this.selector.on('close');
            this.selector.on('change');
            this.selector = null;
        }
    });

    module.exports = Selector;
});