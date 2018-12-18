/**
 * 常量定义
 * @author luoying
 */
define(function() {
    const contactData = FS.getAppStore('contactData');
    return {
        // 企业ID
        ENTERPRISE_ID: contactData.enterpriseID,
        // 企业账号
        ENTERPRISE_ACCOUNT: contactData.enterpriseAccount,
        // 业务线
        APPID: 'CRM',
        // 后动作个数上限
        ACTION_MAX_ACOUNT: 10,
        // 全部确认操作
        ACTION_AGREE_TYPE: 'agree',
        // 被驳回操作
        ACTION_REJECT_TYPE: 'reject',
        // 企信提醒操作
        ACTION_QX_REMIND: 'send_qixin',
        // 更新字段操作
        ACTION_FIELD_UPDATE: 'updates',
        // 审批流名称最多字数
        NAME_MAXLENGTH: 20,
        // 审批流描述最多字数
        DESC_MAXLENGTH: 500,
        // 企信提醒标题最多字数
        QX_REMIND_TITLE_MAXLENGTH: 20,
        // 企信提醒内容最多字数
        QX_REMIND_CONTENT_MAXLENGTH: 200,
        // 下拉列表占位选项值
        SELECT_TMP_OPTION: -1,
        //审批流默认触发对象
        TRIGGER_OBJECT: 'AccountObj',
        //审批流默认触发条件
        TRIGGER_ACTION: [1],
        //审批流默认触发字段类型（单行文本）
        TRIGGER_FIELD: 'text',
        // 可用设置自由流程的对象：订单和退货单
        CUSTOMFLOW_OBJECT: [11, 12],
        //APINAME 前缀
        APINAME_PREFIX: 'appr',
        //APINAME 后缀
        APINAME_SUFFIX: '__crmappr',
        //用户组
        USER_GROUP_LIST: [],
        //角色
        ROLE_LIST: [],

        PRESET_OBJECT: {
            'AccountObj': 1,
            'SalesOrderObj': 1,
            'ReturnedGoodsInvoiceObj': 1
        },

        // system字段白名单
        FIELD_IS_SYSTEM: {
            last_modified_by: 1,
            last_modified_time: 1,
            created_by: 1,
            create_time: 1,
        },

        //维护一份过滤筛选列表
        FIELD_TYPE_CONDITION: {
            text: 1,
            long_text: 1,
            phone_number: 1,
            email: 1,
            number: 1,
            currency: 1,
            date: 1,
            time: 1,
            date_time: 1,
            select_one: 1,
            select_many: 1,
            true_or_false: 1,
            // employee: 1,
            // department: 1,
            formula: 1,
            // object_reference: 1,
            country: 1,
            province: 1,
            city: 1,
            district: 1,
            record_type: 1,
            url: 1,
            '@OWNER_MAIN_DEPT_PATH': 1
        },

        FIELD_TYPE_QXREMIND: {
            text: 1,
            long_text: 1,
            phone_number: 1,
            email: 1,
            number: 1,
            currency: 1,
            date: 1,
            time: 1,
            date_time: 1,
            select_one: 1,
            select_many: 1,
            // true_or_false: 1,
            // employee: 1,
            // department: 1,
            formula: 1,
            // object_reference: 1,
            country: 1,
            province: 1,
            city: 1,
            district: 1,
            record_type: 1,
            url: 1,
        },

        // 过滤掉的奇葩
        FIELD_FOR_COMPATIBLE: {
            owner_department: 1,
            owner: 1,
            filling_checker_id: 1,
            last_modified_by: 1,
            created_by: 1,
            completion_rate: 1,
            remaining_time: 1,
        },

        // 过滤条件和发送企信的package,system字段
        FIELD_FOR_CONDITION: {
            AccountObj: {
                name: 1,
                account_no: 1,
                account_type: 1,
                account_level: 1,
                account_source: 1,
                industry_level1: 1,
                industry_level2: 1,
                country: 1,
                province: 1,
                city: 1,
                district: 1,
                tel: 1,
                email: 1,
                address: 1,
                url: 1,
                remark: 1,
                high_seas_name: 1,
                deal_status: 1,
                last_deal_closed_time: 1,
                transfer_count: 1,
                last_followed_time: 1,
                '@OWNER_MAIN_DEPT_PATH': 1,
                last_modified_time: 1,
                create_time: 1,
                completion_rate: 1,
                remaining_time: 1,
                recycled_reason: 1,
                owner: 1,
                // filling_checker_id: 1,
                last_modified_by: 1,
                created_by: 1,
            },

            SalesOrderObj: {
                account_no: 1,
                opportunity_id: 1,
                name: 1,
                order_time: 1,
                product_amount: 1,
                discount: 1,
                order_amount: 1,
                returned_goods_amount: 1,
                payment_amount: 1,
                refund_amount: 1,
                invoice_amount: 1,
                receivable_amount: 1,
                ship_to_tel: 1,
                ship_to_add: 1,
                delivery_date: 1,
                receipt_type: 1,
                remark: 1,
                submit_time: 1,
                '@OWNER_MAIN_DEPT_PATH': 1,
                last_modified_time: 1,
                create_time: 1,
                last_modified_by: 1,
                created_by: 1,
                owner: 1,
            },

            ReturnedGoodsInvoiceObj: {
                account_name: 1,
                name: 1,
                returned_goods_inv_amount: 1,
                returned_goods_time: 1,
                returned_goods_reason: 1,
                remark: 1,
                status: 1,
                submit_time: 1,
                is_unread: 1,
                '@OWNER_MAIN_DEPT_PATH': 1,
                last_modified_time: 1,
                create_time: 1,
                last_modified_by: 1,
                created_by: 1,
                owner: 1,
            },

            other: {
                name: 1,
                // owner_department: 1,
                create_time: 1,
                last_modified_time: 1,
                record_type: 1,
                '@OWNER_MAIN_DEPT_PATH': 1,
                last_modified_by: 1,
                created_by: 1,
                owner: 1
            }
        },

        FIELD_TYPE_UPDATE: {
            number: 1,
            currency: 1,
            date: 1,
            time: 1,
            date_time: 1,
            select_one: 1,
            select_many: 1,
            true_or_false: 1,
            // employee: 1,
        },

        FIELD_NOT_UPDATE: {
            AccountObj: {
                industry_level1: 1,
                industry_level2: 1,
                province: 1,
                city: 1,
                district: 1,
                location: 1,
                address: 1,
                high_seas_name: 1,
                status: 1,
                sales_stage_ID: 1,
                total_order_amount: 1,
                total_payment_amount: 1,
                total_refund_amount: 1,
                deal_status: 1,
                last_deal_closed_time: 1,
                total_opportunity_revenue: 1,
                last_deal_closed_amount: 1,
                owner: 1,
                owner_modified_time: 1,
                last_owner: 1,
                claimed_time: 1,
                expire_time: 1,
                last_modified_time: 1,
                returned_time: 1,
                last_followed_time: 1,
                remaining_time: 1,
                account_status: 1,
                owner_department: 1,
                transfer_count: 1,
                filling_checker_id: 1
            },
            SalesOrderObj: {
                account_id: 1,
                opportunity_id: 1,
                name: 1,
                product_id: 1,
                product_amount: 1,
                discount: 1,
                order_amount: 1,
                order_time: 1,
                returned_goods_amount: 1,
                payment_amount: 1,
                refund_amount: 1,
                invoice_amount: 1,
                receivable_amount: 1,
                owner: 1,
                order_status: 1,
                created_by: 1,
                create_time: 1,
                submit_time: 1,
                last_modified_time: 1,
                last_modified_by: 1,
                is_deleted: 1,
                owner_department: 1,
            },
            ReturnedGoodsInvoiceObj: {
                account_id: 1,
                account_name: 1,
                order_id: 1,
                name: 1,
                owner: 1,
                owner_name: 1,
                deparment: 1,
                remark: 1,
                status: 1,
                submit_time: 1,
                approval_flow_node: 1,
                approval_flow_id: 1,
                last_approver: 1,
                last_approved_time: 1,
                last_modified_by: 1,
                last_modified_time: 1,
                created_by: 1,
                created_by_name: 1,
                create_time: 1,
                is_unread: 1,
                returned_goods_inv_amount: 1
            },
            ContactObj: {
                account_id: 1,
                opportunity_id: 1,
                name: 1,
                product_id: 1
            },
            other: {
                name: 1,
                department: 1,
                created_by: 1,
                create_time: 1,
                last_modified_by: 1,
                last_modified_time: 1,
            }
        },
    };
});