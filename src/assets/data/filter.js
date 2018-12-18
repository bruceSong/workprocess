define(function(require, exports) {
	//text
	let text = [{
		label: $t('等于'),
		value: 'equals'
	}, {
		label: $t('不等于'),
		value: 'notEquals'
	}, {
		label: $t('包含'),
		value: 'contains'
	}, {
		label: $t('不包含'),
		value: 'notContains'
	}, {
		label: $t('为空'),
		value: 'empty'
	}, {
		label: $t('不为空'),
		value: 'notEmpty'
	}];
	//number
	let num = [{
		label: $t('等于'),
		value: '=='
	}, {
		label: $t('不等于'),
		value: '!='
	}, {
		label: $t('大于'),
		value: '>'
	}, {
		label: $t('小于'),
		value: '<'
	}, {
		label: $t('大于等于'),
		value: '>='
	}, {
		label: $t('小于等于'),
		value: '<='
	}, {
		label: $t('为空'),
		value: 'empty'
	}, {
		label: $t('不为空'),
		value: 'notEmpty'
	}];
	//单选
	let select = [{
		label: $t('等于'),
		value: 'equals'
	}, {
		label: $t('不等于'),
		value: 'notEquals'
	}, {
		label: $t('为空'),
		value: 'empty'
	}, {
		label: $t('不为空'),
		value: 'notEmpty'
	}];

	let selectMany = [{
		label: $t('包含'),
		value: 'hasAnyOf'
	}, {
		label: $t('不包含'),
		value: 'hasNoneOf'
	}, {
		label: $t('为空'),
		value: 'empty'
	}, {
		label: $t('不为空'),
		value: 'notEmpty'
	}]

	let bool = [{
		label: $t('是'),
		value: 'isTrue'
	}, {
		label: $t('否'),
		value: 'isFalse'
	}, {
		label: $t('为空'),
		value: 'empty'
	}, {
		label: $t('不为空'),
		value: 'notEmpty'
	}]
	//日期 （string）
	let date = [{
		label: $t('等于'),
		value: '=='
	}, {
		label: $t('不等于'),
		value: '!='
	}, {
		label: $t('早于'),
		value: '<='
	}, {
		label: $t('晚于'),
		value: '>='
	}, {
		label: $t('为空'),
		value: 'empty'
	}, {
		label: $t('不为空'),
		value: 'notEmpty'
	}];
	let time = [{
		label: $t('等于'),
		value: '=='
	}, {
		label: $t('不等于'),
		value: '!='
	}, {
		label: $t('早于'),
		value: '<='
	}, {
		label: $t('晚于'),
		value: '>='
	}];
	let employee = [{
		label: $t('等于'),
		value: 'equals'
	}, {
		label: $t('不等于'),
		value: 'notEquals'
	}, {
		label: $t('包含'),
		value: 'contains'
	}, {
		label: $t('不包含'),
		value: 'notContains'
	}, {
		label: $t('为空'),
		value: 'empty'
	}, {
		label: $t('不为空'),
		value: 'notEmpty'
	}];
	//负责人所在部门
	let OWNER_MAIN_DEPT_PATH = [{
		label: $t('属于'),
		value: 'hasAnyOf'
	}, {
		label: $t('不属于'),
		value: 'hasNoneOf'
	}];

	let data = [
		{ cond: [], type: 'string', rendererType: '', defObjType: 'split_line' },////分割线
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'text' },////单行文本
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'long_text' },////多行文本
		{ cond: num, type: 'number', rendererType: 'Number', defObjType: 'number' },////整数
		// { cond: num, type: 'number', rendererType: 'Number', defObjType: 'number' },////小数
		{ cond: num, type: 'number', rendererType: 'Number', defObjType: 'currency' },////金额
		{ cond: date, type: 'number', rendererType: 'Date', defObjType: 'date' },////日期
		{ cond: time, type: 'number', rendererType: 'Time', defObjType: 'time' },//时间
		{ cond: date, type: 'number', rendererType: 'DateTime', defObjType: 'date_time' },////日期时间
		{ cond: select, type: 'string', rendererType: 'SingleSelect', defObjType: 'select_one' },////单选
		{ cond: selectMany, type: 'string', rendererType: 'Select', defObjType: 'select_many' },////多选
		{ cond: [], type: 'string', rendererType: '', defObjType: 'image' },////图像
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'location' },////地址
		{ cond: bool, type: 'boolean', rendererType: 'Null', defObjType: 'true_or_false' },////布尔
		{ cond: select, type: 'string', rendererType: 'SingleSelect', defObjType: 'multi_level_select_one' },////级联单选
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'object_reference' },////查找类型
		{ cond: [], type: 'string', rendererType: '', defObjType: 'file_attachment' },////附件
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'phone_number' },////电话
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'email' },////邮件
		{ cond: num, type: 'number', rendererType: 'Number', defObjType: 'formula' },////计算型字段
		{ cond: employee, type: 'string', rendererType: 'PickPerson', defObjType: 'employee' },////员工
		{ cond: employee, type: 'string', rendererType: 'PickDept', defObjType: 'department' },////部门
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'url' },////网址
		{ cond: text, type: 'string', rendererType: 'Text', defObjType: 'auto_number' },//自增编号
		{ cond: select, type: 'string', rendererType: 'SingleSelect', defObjType: 'district' },//区
		{ cond: select, type: 'string', rendererType: 'SingleSelect', defObjType: 'country' },//国家
		{ cond: select, type: 'string', rendererType: 'SingleSelect', defObjType: 'city' },//城市
		{ cond: select, type: 'string', rendererType: 'SingleSelect', defObjType: 'province' },//省
		{ cond: OWNER_MAIN_DEPT_PATH, type: 'string', rendererType: 'PickDept', defObjType: '@OWNER_MAIN_DEPT_PATH'},//负责人所在部门，流程业务自定义
		{ cond: select, type: 'string', rendererType: 'SingleSelect', defObjType: 'record_type' },////record_type
	];

	// 根据类型获取过滤条件列表
	exports.getFilter = (type, local) => {
		let key = local ? 'type' : 'defObjType';
		return _.find(data, item => item[key] == type);
	};
	//根据type找到对应的crmType集合
	exports.getCrmTypeList = (rendererType) => {
		let crmTypes = [];
		_.each(data, item => item['rendererType'] === rendererType && crmTypes.push(item.crmType));
		return crmTypes;
	};

	exports.getDefObjTypeList = (rendererType) => {
		let defObjTypes = [];
		let dates = {DateTime: ['date_time'], Time: ['time', 'date_time'], Date: ['date', 'date_time']};
		if (dates[rendererType]) {
			return dates[rendererType];
		}
		_.each(data, item => item['rendererType'] === rendererType && defObjTypes.push(item.defObjType));
		return defObjTypes;
	}

	// 获取指定过滤器
	exports.getFilterItem = (type, filterValue) => {
		let filter = exports.getFilter(type);
		if (!filter) return null;
		return _.find(filter.cond, c => c.value === filterValue);
	};
});
