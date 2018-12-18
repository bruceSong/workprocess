define(function(require, exports, module) {
    const FieldView = require('paas-workprocess-modules/action/field/field');
    //const EmailView = require('paas-workprocess-modules/action/email/email');
    const BpmView = require('paas-workprocess-modules/action/bpm/bpm');
    const ManagerView = require('paas-workprocess-modules/action/manager/manager');
    //const LockView = require('paas-workprocess-modules/action/lock/lock');
    const OperatorView = require('paas-workprocess-modules/action/operator/operator');
    const ActionList = {
        'field': FieldView,
        'bpm': BpmView,
        'manager': ManagerView,
        'operate': OperatorView
    }
    module.exports = ActionList;
});