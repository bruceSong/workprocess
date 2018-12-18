/**
 * Created by Chun Hong Zhao on 2017-01-16 14:57:16
 */
define(function(require, exports, module) {
    const BaseUtil = require('base-modules/utils');
    const CRMUtil = require('crm-modules/common/util');
    const VarsData = require('paas-workprocess-assets/data/selectorData');

    const Utils = {
        // TODO this method should be move to base module because the similar code has write in paas/flow module.
        parseFSFnData(oldMembers, oldGroups) {
            let members = _.map(oldMembers, function(member) {
                return {
                    id: member.id,
                    name: member.name,
                    type: member.type,
                    groupIDs: member.circleIds,
                    profileImage: member.profileImage,
                    spell: member.spell,
                    nameSpellList: member.nameSpellList
                };

            });
            let groups = _.map(oldGroups, function(group) {
                return {
                    memberCount: group.memberCount,
                    type: group.type,
                    id: group.id,
                    parentID: group.parentID,
                    name: group.name,
                    spell: group.spell
                };
            });
            return {
                data: {
                    members: members,
                    groups: groups
                }
            };
        },
        getEmployeeNamesByIds(data, type) {
            let ids = BaseUtil.deepClone(data);
            let names = [];
            let length = ids.indexOf('-10000');
            if (length > -1) {
                names.push($t('系统'));
                ids.splice(length, 1);
            }
            const employees = FS.contacts.getEmployeesByIds(ids);

            let me = this;
            _.each(employees, function(employee, index) {
                if (employee) {
                    names.push(employee.name);
                } else {
                    names.push(null);
                    FS.contacts.getEmployeeByIdAsync(ids[index], (data) => {
                        setTimeout(function() {
                            let closes = me.$el.find('.action-close');
                            let ele;
                            closes.each(function() {
                                if ($(this).attr('num') == type) {
                                    ele = $(this).parent().parent();
                                }
                            });

                            let label = [];
                            /*
                            if (names.length) {
                                _.each(names, function(item, o) {
                                    if (o == index) {
                                        label.push('<i>' + data.name + '</i>');
                                    } else {
                                        label.push(item);
                                    }
                                });
                            }*/
                            let m;
                            let html;
                            let txt = '';
                            if (ele.hasClass('wk-manager-content')) {
                                m = ele.find('.remind-text p');
                                txt = $t('分配给：');
                            } else if (ele.hasClass('wk-remind-content')) {
                                m = $(ele.find('.remind-text p')[2]);
                            } else if (ele.hasClass('wk-email-content')) {
                                m = $(ele.find('.remind-text p')[1]).find('.labels');
                            }
                            html = m.html();
                            if (html.indexOf($t('分配给')) > -1) {
                                html = html.replace($t('分配给：'), '');
                            }
                            label = html.split($t('，'));
                            label.splice(index, 0, '<i>' + data.name + '</i>');
                            m.html(txt + label.join($t('，')));

                        }, 100);

                        /*
                        let ele = $('.wk-manager-content .remind-text p');
                        let html = ele.html();
                        let label = [];
                        if (html.indexOf($t('分配给')) > -1) {
                            label = html.replace($t('分配给：'), '').split($t('，'));
                        }
                        label.splice(index, 0, '<i>' + data.name + '</i>');
                        ele.html($t('分配给：') + label.join($t('，')));*/
                    });
                }
            });
            return names;
        },
        getCircleNamesByIds(ids) {
            const circles = FS.contacts.getCirclesByIds(ids);
            let names = [];
            circles.map(function(circle) {
                if (circle) {
                    names.push(circle.name);
                } else {
                    names.push(null);
                }
            });

            return names;
        },
        getMasterNamesByIds(ids) {
            const circles = FS.contacts.getCirclesByIds(ids);
            let names = [];
            circles.map(function(circle) {
                if (circle) {
                    names.push(circle.name + $t('负责人'));
                }
            });

            return names;
        },
        getGroupNamesByIds(ids) {
            let names = [];
            ids.map((id) => {
                const foundGroup = _.findWhere(this.userGroups, {
                    id
                });
                if (foundGroup) {
                    names.push(foundGroup.name);
                }
            });
            return names;
        },
        getProcessNamesByIds(ids) {
            let names = [];
            ids.map((id) => {
                const foundGroup = _.findWhere(VarsData.variable, {
                    id
                });
                if (foundGroup) {
                    names.push(foundGroup.name);
                }
            });
            return names;
        },
        getApplicantNamesByIds(ids) {
            let names = [];
            ids.map((id) => {
                const foundGroup = _.findWhere(VarsData.applicant, {
                    id
                });
                if (foundGroup) {
                    names.push(foundGroup.name);
                }
            });
            return names;
        },
        getEmailsNamesByIds(ids) {
            let names = [];
            ids.map((id) => {
                let name;
                let data = id.replace(new RegExp(/(^\$\{)|\}/, "gm"), '').split('.');
                let parent;
                if (data.length === 2) {
                    parent = _.find(VarsData.lookUpEmails, (p) => {
                        return p.id == '${' + data[0] + '}';
                    });
                } else {
                    parent = _.find(VarsData.lookUpEmails, (p) => {
                        return p.id == '${' + data[0] + '.' + data[1] + '}';
                    });
                }
                let item = _.find(parent.children, (child) => {
                    return child.id == id;
                });
                name = item.name;

                names.push(name);

            });
            return names;
        },
        getEmployeesListByIds(ids) {
            let names = [];
            ids.map((id) => {
                //let data = id.replace(new RegExp(/(^\$\{)|\}/, "gm"), '').split('.');
                let item = _.find(VarsData.employees, (p) => {
                    return p.id == id;
                });
                if (item) {
                    names.push(item.name);
                } else if (id.indexOf('out_owner') > -1) {
                    names.push($t('外部负责人'));
                } else {
                    names.push(null);
                }

            });
            return names;
        },
        /**
         * 获取角色名称
         * @param ids
         */

        getRoleNamesByIds(ids) {
            let names = [];
            ids.map((id) => {
                const foundRole = _.findWhere(this.userRoles, {
                    id
                });
                if (foundRole) {
                    names.push(foundRole.name);
                }
            });
            return names;
        },
        /**
         * 根据选人/组/部门获取名称
         */
        getNamesBySelectIds(ids) {
            return _.union(this.getCircleNamesByIds(ids), this.getEmployeeNamesByIds(ids), this.getGroupNamesByIds(ids));
        },
        // 异步获取离职人员信息
        fetchNotExistsEmployees(eid) {
            let res;
            FS.contacts.getEmployeeByIdAsync(eid, (data) => {
                console.log(data);
                res = data;
                return res;
            });

        },
        getUserGroups(callback) {
            if (!this.userGroups || this.userGroups.length === 0) {
                const THIS = this;
                BaseUtil.FHHApi({
                    url: '/EM1HCRMUdobj/groupShareApi/allGroups',
                    success(res) {
                        if (res.Result.StatusCode === 0) {
                            THIS.userGroups = _.map(res.Value, (item) => {
                                return _.extend(item, {
                                    spell: ''
                                });
                            });
                            if (callback) {
                                callback.call(callback, THIS.userGroups);
                            }
                        } else {
                            console.error(res.Result.FailureMessage);
                        }

                    }
                }, {
                    errorAlertModel: 1
                });
            } else if (callback) {
                callback.call(callback, this.userGroups);
            }
        },
        getUserRoles(callback) {
            if (!this.userRoles || this.userRoles.length === 0) {
                const THIS = this;
                BaseUtil.FHHApi({
                    url: '/EM1HCRMUdobj/roleShareApi/getRoleList',
                    success(res) {
                        if (res.Result.StatusCode === 0) {
                            THIS.userRoles = _.map(res.Value, (item) => {
                                return {
                                    id: item.roleCode,
                                    name: item.roleName
                                }
                            });
                            if (callback) {
                                callback.call(callback, THIS.userRoles);
                            }
                        } else {
                            console.error(res.Result.FailureMessage);
                        }

                    }
                }, {
                    errorAlertModel: 1
                });
            } else if (callback) {
                callback.call(callback, this.userRoles);
            }
        },
        /**
         * svg 转换为base64编码的图片url
         * @param svg 要转换的svg d3 对象
         */
        //    saveSvgToBase64Image(svg){
        //      const deferred = $.Deferred();
        //      const docType = '<?xml version="1.0" standalone="no"?>'
        //        + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        //      const source = (new XMLSerializer()).serializeToString(svg.node());
        //      const blob = new Blob([docType + source], {type: 'image/svg+xml;charset=utf-8'});
        //      const url = window.URL.createObjectURL(blob);
        //      const bound = svg.node().getBoundingClientRect();
        //      const width = bound.width;
        //      const height = bound.height;
        //      const img = paasD3.select('body').append('img')
        //        .attr('width', width)
        //        .attr('height', height)
        //        .node();
        //      img.onload = function () {
        //        const canvas = paasD3.select('body').append('canvas').node();
        //        canvas.width = width;
        //        canvas.height = height;
        //        const ctx = canvas.getContext('2d');
        //        ctx.drawImage(img, 0, 0);
        //        const canvasUrl = canvas.toDataURL('image/jpeg');
        //        deferred.resolve(canvasUrl);
        //        $(canvas).remove();
        //        $(img).remove();
        //      };
        //      img.src = url;
        //
        //      return deferred;
        //    },
        /**
         * set/get json data to/from local storage
         * @param key
         * @param data
         */
        store(key, data) {
            const prefix = 'paas-bpm-';
            if (localStorage) {
                if (data) {
                    const dataString = JSON.stringify(data);
                    localStorage.setItem(`${prefix}${key}`, dataString);
                } else {
                    return JSON.parse(localStorage.getItem(key));
                }
            }
        },
        /**
         * remove store data by key
         * @param key
         */
        removeStore(key) {
            const prefix = 'paas-bpm-';
            if (localStorage) {
                localStorage.removeItem(`${prefix}${key}`);
            }
        },
        /**
         * 获得国家省市区的options
         * @param cb
         * @param noCache
         */
        getAreaOptions(cb, noCache) {
            let xqr;
            let areaOptions;
            if (areaOptions && !noCache) {
                cb && cb(areaOptions);
                return;
            }
            const data = localStorage.getItem('crm_coutry_area_options');
            if (data && !noCache) {
                cb && cb(areaOptions = JSON.parse(data));
                return;
            }
            xqr && xqr.abort();
            xqr = CRMUtil.FHHApi({
                url: '/EM1HCRMUdobj/global/country_area_field_options',
                type: 'get',
                success: function(res) {
                    if (res.Result.StatusCode === 0) {
                        localStorage.setItem('crm_coutry_area_options', res.Value);
                        areaOptions = JSON.parse(res.Value);
                    }
                    cb && cb(areaOptions);
                },
                complete: function() {
                    xqr = null;
                }
            }, {
                errorAlertModel: 1
            })
        }
    };
    Utils.getUserGroups();
    Utils.getUserRoles();
    module.exports = Utils;
});