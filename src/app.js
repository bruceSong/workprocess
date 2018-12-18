/**
 * 声明路由规则
 * TODO 当以后改成路由免声明模式，此文件可以删除
 */
define(function(require) {
    var util = require('base-modules/utils');
    var name = 'paas-workprocess';
    _.each(['#paas/workprocess/flow', '#paas/workprocess/flowdetail', '#paas/workprocess/flowsetting'], function(route) {
        var dir = route.replace(/\/=\/.*/, '').replace('#' + name.replace(/\-/, '/') + '/', '');
        util.tplRouterReg(route, name, {
            layout: dir + '/' + dir + '.html'
        });
    });
});