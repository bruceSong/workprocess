/**
 * 预设变量定义
 * @author luoying
 */
define(function() {
    return [{
        "label": $t('对象及字段'),
        "name": "object",
        "hasSubVariable": true,
        "variables": []
    }, {
        "label": $t('变量'),
        "name": "variables",
        "hasSubVariable": false,
        "variables": [{
            "display_name": $t('工作流触发时间'),
            "api_name": "workflowInstanceStartTime"
        }, {
            "display_name": $t('流程发起人'),
            "api_name": "applicantName"
        }]
    }];
});