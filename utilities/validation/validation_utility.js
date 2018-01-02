const _ = require('lodash');
const DB = require('../../config/mongoose-init');
const SchemaUtility = require('../schema/schema_utility');
const Pluralize = require('pluralize');


// Operation permitted in query URL
// Everyone can do with prefix {not} or {or}
const numberOperators = ['{=}', '{<}', '{<=}', '{>}', '{>=}', '{<>}'];
const stringOperators = ['{=}', '{like}'];
const nestedOperators = ['{=}', '{<}', '{<=}', '{>}', '{>=}', '{<>}'];
const likeOperators = ['{like}', '{%like}', '{like%}'];
const inOperator = ['{in}'];
const btwOperator = ['{btw}'];
const nullOperator = ['{null}'];

// For the RegExp
const OrOrNot = '(?:{not}|{or})?';
const Or = '(?:{or})?';
let intNumber = "[1-9]{1}[0-9]{0,6}";                                // From 1 to 9.999.999
let floatNumber = "[-+]?([0]|[1-9]{1}[0-9]{0,6})(\.[0-9]{1,6})?";    // From -9,999,999.999,999 to [+]9,999,999.999,999
let username = "([a-zA-Z0-9]+[_.-]?)*[a-zA-Z0-9]";                   // alt(a-zA-Z0-9||_.-) always ends with a-zA-Z0-9 no max length
let password = "^[a-zA-Z0-9àèéìòù\*\.\,\;\:\-\_\|@&%\$]{3,}$";
let pwdRegExp = new RegExp(password);
let email = '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"' +
	'(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")' +
	'@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|' +
	'\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|' +
	'[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]' +
	'|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])';                        // Email
let datetime = '([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?'; // Datetime for DB ex: 2017-08-15 10:00:00


const ValidationBase = {
	// STRING admitted in Filter. Filter is an Operation on Model Attributes
	filterRegExp: () => {
		let result = '';

		nestedOperators.forEach(function(operator, index){
			if (index > 0) {
				result += '|';
			}
			if (operator === '{=}') {
				result += "^" + Or + "(?:" + operator + ")?.+$";
			} else {
				result += "^" + Or + operator + ".+$";
			}
		});

		likeOperators.forEach(function(operator){
			result += '|';
			result += "^" + OrOrNot + operator + ".+$";
		});

		inOperator.forEach(function(operator){
			result += '|';
			result += "^" + OrOrNot + operator + ".+$";
		});

		btwOperator.forEach(function(operator){
			result += '|';
			result += "^" + OrOrNot + operator + ".+$";
		});

		nullOperator.forEach(function(operator){
			result += '|';
			result += "^" + OrOrNot + operator + "$";
		});

		return new RegExp(result);
	},

	// STRING admitted in Field for all Attributes. Model Fields to select
	fieldRegExp: (modelName, relations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let attributes = [];
		let result = '';
		let columns = '(';

		Object.keys(schema.tree).map((attr) => {
			let skip = schema.tree[attr].exclude || false;
			if (!skip && !schema.nested[attr] && !_.includes(relations, attr) && attr !== '_id' && attr !== '__v') {
				attributes.push(attr);
			}
		});

		attributes = _.orderBy(attributes);

		attributes.forEach(function(attr, index){
			if (index > 0) {
				columns += '|';
			} else {
				columns += '|'
			}
			columns += attr;
		});
		columns += ')';

		let prefix = '(?:{' + model.collection.name + '})?';

		result += "^" + prefix + columns + "(," + columns + ")*$";

		return new RegExp(result);
	},

	// Fields to apply sum, min & max. Model Fields to select
	mathFieldRegExp: (modelName, relations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let result = '';
		let columns = '(';

		Object.keys(schema.tree).map((attr) => {

			let skip = schema.tree[attr].exclude || false;
			if (!skip && !schema.nested[attr] && !_.includes(relations, attr) && attr !== '_id' && attr !== '__v') {
				let attribute = schema.tree[attr];
				let type = attribute.name;
				if (attribute.type && attribute.type.name) {
					type = attribute.type.name;
				} else if (attribute.type && attribute.type.schemaName) {
					type = attribute.type.schemaName;
				}

				if (type === 'Number' || type === 'Date') {

					if (columns !== '(') {
						columns += '|';
					}
					columns += attr;
				}
			}

		});
		columns += ')';

		let prefix = '(?:{' + model.collection.name + '})?';

		result += "^" + prefix + columns + "$";

		return new RegExp(result);
	},

	// STRING admitted in withRelated for relations. Possible Relations to include
	withRelatedRegExp: (modelName, modelRelations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let result = '';
		let relations = '(';
		let exclusion = [schema.name];

		modelRelations.forEach(function(rel, index){
			rel = _.replace(rel, ' ', '');
			let localExclusion = [rel];
			if (index > 0) {
				relations += '|';
			}
			relations += rel;

		});
		relations += ')';

		result += "^" + relations + "$";

		return new RegExp(result);
	},

	// STRING admitted in withCount for relations. Possible Relations to include (only ONE level)
	withCountRegExp: (modelName, modelRelations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let result = '';
		let relations = '(';

		modelRelations.forEach(function(rel, index){
			rel = _.replace(rel, ' ', '');
			if (index > 0) {
				relations += '|';
			}

			relations += rel;

		});
		relations += ')';

		result += "^" + relations + "$";

		return new RegExp(result);
	},

	// STRING admitted in with Related Field (related tables attributes) for all possible Relationships
	withRelatedFieldRegExp: (modelName, modelRelations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let result = '';

		modelRelations.forEach(function(rel, index){
			rel = _.replace(rel, ' ', '');

			let attributes = [];
			let attributesList = '';
			let relation = '';
			let attribute = '';
			let ref = '';
			let secondRef = '';

			if (_.includes(rel, '.')) {
				rel = _.replace(rel, ' ', '');
				relation = '{' + rel + '}';
				let parts =_.split(rel, '.');
				attribute =  schema.tree[_.first(parts)];
				ref = attribute.ref;
				if ((attribute[0] && attribute[0].ref) || (attribute.options && attribute.options.ref)) {
					if (attribute.options && attribute.options.ref) {
						ref = attribute.options.ref;
					}
					if (attribute[0] && attribute[0].ref) {
						ref = attribute[0].ref;
					}
				}
				let secondModel = DB.models[ref];
				let secondSchema = secondModel.schema;
				secondRef = _.last(parts);
				attribute = secondSchema.tree[secondRef];
				ref = attribute.ref;
			} else {
				relation = '{' + rel + '}';
				attribute = schema.tree[rel];
				ref = attribute.ref;
			}


			if ((attribute[0] && attribute[0].ref) || (attribute.options && attribute.options.ref)) {
				if (attribute.options && attribute.options.ref) {
					ref = attribute.options.ref;
				}
				if (attribute[0] && attribute[0].ref) {
					ref = attribute[0].ref;
				}
			}

			let relModel = DB.models[ref];
			let relSchema = relModel.schema;

			Object.keys(relSchema.tree).map((attr) => {

				let skip = relSchema.tree[attr].exclude || false;
				if (!skip && !relSchema.nested[attr] && !_.includes(modelRelations, attr) && attr !== '_id' && attr !== '__v') {
					skip = relSchema.tree[attr].ref;
					if ((relSchema.tree[attr][0] && relSchema.tree[attr][0].ref) || (relSchema.tree[attr].options && relSchema.tree[attr].options.ref)) {
						if (relSchema.tree[attr].options && relSchema.tree[attr].options.ref) {
							skip = relSchema.tree[attr].options.ref;
						}
						if (relSchema.tree[attr][0] && relSchema.tree[attr][0].ref) {
							skip = relSchema.tree[attr][0].ref;
						}
					}
					if (typeof skip === "undefined") {
						attributes.push(attr);
					}
				}
			});

			attributes = _.orderBy(attributes);

			let columns = '(';

			attributes.forEach(function(attr, index) {
				if (index > 0) {
					columns += '|';
				}
				columns += attr;
			});

			columns += ')';

			if (index > 0) {
				result += '|';
			}
			result += "^" + relation + columns + "(," + columns + ")*$";
		});

		return new RegExp(result);
	},

	// STRING admitted in Sort Attributes
	sortRegExp: (modelName, modelRelations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let result = '';
		let attributes = [];
		let columns = '(';

		Object.keys(schema.paths).map((attr) => {
			let skip = schema.paths[attr].options.exclude || false;
			if (!skip && !schema.nested[attr] && !_.includes(modelRelations, attr) && attr !== '__v') {
				attributes.push(attr);
			}
		});

		attributes = _.orderBy(attributes);

		attributes.forEach(function(attr, index){
			if (index > 0) {
				columns += '|';
			}
			columns += attr;
		});

		columns += ')';

		let prefix = '(?:{' + model.collection.name + '})?';
		let direction = '(?:(\\-))?';

		result += "^" + prefix + direction + columns + "(," + direction + columns + ")*$";

		return new RegExp(result);
	},

// STRING for with SORT
	withSortRegExp: (modelName, modelRelations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let result = '';

		modelRelations.forEach(function(rel, index){
			let attributes = [];
			let relation = '';
			let attribute = '';
			let ref = '';
			let secondRef = '';

			if (_.includes(rel, '.')) {
				rel = _.replace(rel, ' ', '');
				relation = '{' + rel + '}';
				let parts =_.split(rel, '.');
				attribute =  schema.tree[_.first(parts)];
				ref = attribute.ref;
				if ((attribute[0] && attribute[0].ref) || (attribute.options && attribute.options.ref)) {
					if (attribute.options && attribute.options.ref) {
						ref = attribute.options.ref;
					}
					if (attribute[0] && attribute[0].ref) {
						ref = attribute[0].ref;
					}
				}
				let secondModel = DB.models[ref];
				let secondSchema = secondModel.schema;
				secondRef = _.last(parts);
				attribute = secondSchema.tree[secondRef];
				ref = attribute.ref;
			} else {
				relation = '{' + rel + '}';
				attribute = schema.tree[rel];
				ref = attribute.ref;
			}


			if ((attribute[0] && attribute[0].ref) || (attribute.options && attribute.options.ref)) {
				if (attribute.options && attribute.options.ref) {
					ref = attribute.options.ref;
				}
				if (attribute[0] && attribute[0].ref) {
					ref = attribute[0].ref;
				}
			}

			let relModel = DB.models[ref];
			let relSchema = relModel.schema;

			Object.keys(relSchema.tree).map((attr) => {

				let skip = relSchema.tree[attr].exclude || false;
				if (!skip && !relSchema.nested[attr] && !_.includes(modelRelations, attr) && attr !== '_id' && attr !== '__v') {
					skip = relSchema.tree[attr].ref;
					if ((relSchema.tree[attr][0] && relSchema.tree[attr][0].ref) || (relSchema.tree[attr].options && relSchema.tree[attr].options.ref)) {
						if (relSchema.tree[attr].options && relSchema.tree[attr].options.ref) {
							skip = relSchema.tree[attr].options.ref;
						}
						if (relSchema.tree[attr][0] && relSchema.tree[attr][0].ref) {
							skip = relSchema.tree[attr][0].ref;
						}
					}
					if (typeof skip === "undefined") {
						attributes.push(attr);
					}
				}
			});

			attributes = _.orderBy(attributes);

			let columns = '(';
			attributes.forEach(function(attr, index) {
				if (index > 0) {
					columns += '|';
				}
				columns += attr;
			});

			columns += ')';

			let direction = '(?:(\\+|\\-))?';
			if (index > 0) {
				result += '|';
			}
			result += "^" + relation + direction + columns + "(," + direction + columns + ")*$";
		});

		return new RegExp(result);
	},

	// STRING admitted in with FILTER Relation Attributes filter
	withFilterRegExp: (modelName, relations) => {
		let model = DB.models[modelName];
		let schema = model.schema;
		let result = '';

		relations.forEach(function(rel, index){
			let attributes = [];
			let attributesList = '';
			let relation = '';
			let attribute = '';
			let ref = '';
			let secondRef = '';

			if (_.includes(rel, '.')) {
				rel = _.replace(rel, ' ', '');
				relation = '{' + rel + '}';
				let parts =_.split(rel, '.');
				attribute =  schema.tree[_.first(parts)];
				ref = attribute.ref;
				if ((attribute[0] && attribute[0].ref) || (attribute.options && attribute.options.ref)) {
					if (attribute.options && attribute.options.ref) {
						ref = attribute.options.ref;
					}
					if (attribute[0] && attribute[0].ref) {
						ref = attribute[0].ref;
					}
				}
				let secondModel = DB.models[ref];
				let secondSchema = secondModel.schema;
				secondRef = _.last(parts);
				attribute = secondSchema.tree[secondRef];
				ref = attribute.ref;
			} else {
				relation = '{' + rel + '}';
				attribute = schema.tree[rel];
				ref = attribute.ref;
			}


			if ((attribute[0] && attribute[0].ref) || (attribute.options && attribute.options.ref)) {
				if (attribute.options && attribute.options.ref) {
					ref = attribute.options.ref;
				}
				if (attribute[0] && attribute[0].ref) {
					ref = attribute[0].ref;
				}
			}

			let relModel = DB.models[ref];
			let relSchema = relModel.schema;

			Object.keys(relSchema.tree).map((attr) => {

				let skip = relSchema.tree[attr].exclude || false;
				if (!skip && !relSchema.nested[attr] && !_.includes(relations, attr) && attr !== '_id' && attr !== '__v') {
					skip = relSchema.tree[attr].ref;
					if ((relSchema.tree[attr][0] && relSchema.tree[attr][0].ref) || (relSchema.tree[attr].options && relSchema.tree[attr].options.ref)) {
						if (relSchema.tree[attr].options && relSchema.tree[attr].options.ref) {
							skip = relSchema.tree[attr].options.ref;
						}
						if (relSchema.tree[attr][0] && relSchema.tree[attr][0].ref) {
							skip = relSchema.tree[attr][0].ref;
						}
					}
					if (typeof skip === "undefined") {
						attributes.push(attr);
					}
				}
			});

			attributes = _.orderBy(attributes);

			attributes.forEach(function(attr, index) {
				if (index > 0) {
					attributesList += '|'
				}
				attributesList += '{' + attr + '}';
			});

			if (index > 0) {
				result += '|';
			}
			nestedOperators.forEach(function(operator, index){
				if (index > 0) {
					result += '|';
				}
				result += "^" + relation + Or + "(" + attributesList + ")" + operator + ".+$";
			});

			likeOperators.forEach(function(operator){
				result += '|';
				result += "^" + relation + OrOrNot + "(" + attributesList + ")" + operator + ".+$";
			});

			inOperator.forEach(function(operator){
				result += '|';
				result += "^" + relation + OrOrNot + "(" + attributesList + ")" + operator + ".+$";
			});

			btwOperator.forEach(function(operator){
				result += '|';
				result += "^" + relation + OrOrNot + "(" + attributesList + ")" + operator + ".+$";
			});

			nullOperator.forEach(function(operator){
				result += '|';
				result += "^" + relation + OrOrNot + "(" + attributesList + ")" + operator + "$";
			});
		});

		return new RegExp(result);
	},
};



module.exports = ValidationBase;