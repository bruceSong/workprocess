define(function() {
    var fields = {
        'AccountObj': ['account_type', 'account_level', 'account_source']
    }

    var types = ['text', 'select_one', 'select_many', 'number', 'date', 'email', 'phone_number', 'time', 'date_time', 'true_or_false', 'percentile', 'url', 'department', 'employee'];
    return {
        fields,
        types
    }
})