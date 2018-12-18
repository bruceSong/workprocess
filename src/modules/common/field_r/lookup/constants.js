define(function(require, exports, module) {
    var objectTypeMap = {
        AccountFinInfoObj: {
            type: 1,
            display_name: '线索'
        },
        AccountObj: {
            type: 2,
            display_name: '客户'
        },
        ContactObj: {
            type: 3,
            display_name: '联系'
        },
        ProductObj: {
            type: 4,
            display_name: '产品'
        },
        PaymentObj: {
            type: 5,
            display_name: '回款'
        },
        RefundObj: {
            type: 6,
            display_name: '退款'
        },
        OpportunityObj: {
            type: 8,
            display_name: '商机'
        },
        InvoiceApplicationObj: {
            type: 9,
            display_name: '开票'
        },
        SalesOrderObj: {
            type: 11,
            display_name: '订单'
        },
        VisitingObj: {
            type: 13,
            display_name: '拜访'
        },
        ContractObj: {
            type: 16,
            display_name: '合同'
        }
    };

    module.exports = {
        objectTypeMap: objectTypeMap
    };
});