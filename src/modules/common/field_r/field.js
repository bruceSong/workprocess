define(function(require, exports, module) {
    const TextView = require('./text/text');
    const TextAreaView = require('./textarea/textarea');
    const EmailView = require('./email/email');
    const UrlView = require('./url/url');
    const PhoneView = require('./phone/phone');
    const SelectView = require('./select/select');
    const SelectManyView = require('./selectmany/selectmany');
    const MultiSelect = require('./multiselect/multiselect');
    const ComplexSelect = require('./complexselect/complexselect');
    const LocationView = require('./location/location');
    const FileView = require('./file/file');
    const DateView = require('./date/date');
    //const DateTime = require('./datetime/datetime');
    //const TimeView = require('./time/time');
    const LookUpView = require('./lookup/lookup');
    const Composite = require('./composite/composite');
    const BooleanView = require('./boolean/boolean');
    const PercentileView = require('./percentile/percentile');
    const RichText = require('./richtext/richtext');
    const Selector = require('./selector/selector');
    const RadioView = require('./radio/radio');
    const Default = require('./default/default');

    const Fields = {
        text: TextView,
        long_text: TextAreaView,
        number: TextView,
        auto_number: TextView,
        email: EmailView,
        phone_number: PhoneView,
        currency: TextView,
        time: DateView,
        url: UrlView,
        percentile: PercentileView,
        date: DateView,
        date_time: DateView,
        select_one: SelectView,
        select_many: SelectManyView,
        multi_level_select_one: MultiSelect,
        select_level_one: ComplexSelect, // 为处理级关关系而特定的类型
        select_level_one_first: ComplexSelect, // 为处理级关关系而特定的类型
        location: LocationView,
        file_attachment: FileView,
        object_reference: LookUpView,
        true_or_false: BooleanView,
        employee: Composite,
        department: Composite,
        fieldEmployee: Composite,
        richtext: RichText,
        selector: Selector,
        radio: RadioView,
        default: Default
    };

    module.exports = Fields;
});