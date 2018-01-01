const _ = require('lodash');
const Joi = require('joi');
const SchemaUtility = require('../utilities/schema/schema_utility');
const DB = require('../config/mongoose-init');

// Only ONE element follows
const Operator = ['{=}', '{<}', '{<=}', '{>}', '{>=}', '{<>}', '{like}', '{%like}', '{like%}'];
const SQOperators = {
	'{=}': '$eq',
	'{<}': '$lt',
	'{<=}': '$lte',
	'{>}': '$gt',
	'{>=}': '$gte',
	'{<>}': '$ne',
	'{like}': '$like',
	'{%like}': '$like',
	'{like%}': '$like',
	'{not}{like}': '$notLike',
	'{not}{%like}': '$notLike',
	'{not}{like%}': '$notLike',
};


// Array follows
const InOperator = '{in}';
const SQInOperator = {
	'{in}': '$in',
	'{not}{in}': '$notIn'
};
// Array follows ONLY TWO elements
const BtwOperator = '{btw}';
const SQBtwOperator = {
	'{btw}': '$between',
	'{not}{btw}': '$notBetween',
};
// End condition
const NullOperator = '{null}';
const SQNullOperator = {
	'{null}': '$eq',
	'{not}{null}': '$ne',
};
// Changes Where => OR Array with Where elements
const OrOperator = '{or}';
const SQOrOperator = {
	'{or}': '$or',
};
// Changes Like, In, Between => notLike, notIn, notBetween
const NotOperator = '{not}';
const SQNotOperator = {
	'{not}': '$not',
};


const PreHandlerBase = {
	filterParser: function(response, key, value, schema) {
		value.forEach(function(el){
			let actualLevel = response.queryData.filter;
			let error = response.queryData.error;
			let dbAttribute = key;     // DB Attribute name (Camel Case);
			let orPresent = '';
			let notPresent = '';
			let realValue = el;       // Final condition value;
			// OR operator
			if (_.includes(realValue, OrOperator)) {
				orPresent = SQOrOperator[OrOperator];
				realValue = _.replace(realValue, OrOperator, '');
			}
			// NOT operator
			if (_.includes(realValue, NotOperator)) {
				notPresent = '{not}';
				realValue = _.replace(realValue, NotOperator, '');
			}
			if (orPresent) {
				if (!_.has(actualLevel, [orPresent])) {
					_.set(actualLevel, [orPresent], []);
				}
				let tmp = {};
				tmp[dbAttribute] = {};
				actualLevel[orPresent].push(tmp);
				actualLevel = tmp[dbAttribute];
			} else {
				if (!_.has(actualLevel, [dbAttribute])) {
					_.set(actualLevel, [dbAttribute], {});
				}
				actualLevel = actualLevel[dbAttribute];
			}

			// NULL operator
			if (_.includes(realValue, NullOperator)) {
				realValue = _.replace(realValue, NullOperator, '');
				if (!_.has(actualLevel, SQNullOperator[notPresent + NullOperator])) {
					actualLevel[SQNullOperator[notPresent + NullOperator]] = null;
				}
			} else if (_.includes(realValue, BtwOperator)) {
				// BETWEEN operator
				realValue = _.replace(realValue, BtwOperator, '');
				let tmp = _.split(realValue, ',');
				tmp.forEach(function(value){
					const result = Joi.validate({ [dbAttribute]: value }, schema.joiValid);
					if (result.error) {
						error['message'] = result.error.message;
						return response;
					}
				});
				if (!_.has(actualLevel, SQBtwOperator[notPresent + BtwOperator])) {
					actualLevel[SQBtwOperator[notPresent + BtwOperator]] = {};
					actualLevel[SQBtwOperator[notPresent + BtwOperator]] = tmp;
				} else {
					let found = false;
					actualLevel[SQBtwOperator[notPresent + BtwOperator]].forEach(function(cond){
						if (_.isEqual(cond.sort(), tmp.sort())) {
							found = true;
						}
					});
					if (!found) {
						actualLevel[SQBtwOperator[notPresent + BtwOperator]] = tmp;
					}
				}
			} else if (_.includes(realValue, InOperator)) {
				// IN operator
				realValue = _.replace(realValue, InOperator, '');
				let tmp = _.split(realValue, ',');
				tmp.forEach(function(value){
					const result = Joi.validate({ [dbAttribute]: value }, schema.joiValid);
					if (result.error) {
						error['message'] = result.error.message;
						return response;
					}
				});
				if (!_.has(actualLevel, SQInOperator[notPresent + InOperator])) {
					actualLevel[SQInOperator[notPresent + InOperator]] = [];
					actualLevel[SQInOperator[notPresent + InOperator]].push(tmp);
				} else {
					let found = false;
					actualLevel[SQInOperator[notPresent + InOperator]].forEach(function(cond){
						if (_.isEqual(cond.sort(), tmp.sort())) {
							found = true;
						}
					});
					if (!found) {
						actualLevel[SQInOperator[notPresent + InOperator]].push(tmp);
					}
				}
			} else {
				// LOGICAL operator
				let found = false;
				Operator.some(function(op){
					if (_.includes(realValue, op)){
						found = true;
						return true;
					}
				});
				if (!found) {
					realValue = '{=}'+realValue;
				}
				Operator.some(function (op) {
					if (_.includes(realValue, op)) {
						realValue = _.replace(realValue, op, '');
						const result = Joi.validate({[dbAttribute]: realValue}, schema.joiValid);
						if (result.error) {
							error['message'] = result.error.message;
							return response;
						}

						if (op === '{like}') {
							realValue = '%' + realValue + '%'
						} else if (op === '{%like}') {
							realValue = '%' + realValue
						} else if (op === '{like%}') {
							realValue = realValue + '%'
						}

						let attr = schema.attributes[dbAttribute];

						if (attr.type.key === 'BOOLEAN') {
							if (realValue === 'true' || realValue === '1' || realValue === 1) {
								realValue = true;
							} else {
								realValue = false;
							}

						}

						if (!_.has(actualLevel, SQOperators[notPresent + op])) {
							actualLevel[SQOperators[notPresent + op]] = [];
							actualLevel[SQOperators[notPresent + op]].push(realValue);
						} else {
							if (!_.includes(actualLevel[SQOperators[notPresent + op]], realValue)) {
								actualLevel[SQOperators[notPresent + op]].push(realValue);
							}
						}
						return true;
					}
				});
			}

		});
		return response;
	},

	sortParser: function(response, value, schema) {
		let sort = response.queryData.sort;
		value.forEach(function(el){
			let realValue = _.replace(el, '{'+schema.name+'}', '');
			let columns = _.split(realValue, ',');
			columns.forEach(function(col){
				let direction = _.includes(col, '-') ? 'DESC' : 'ASC';

				realValue = _.replace(_.replace(col, '-', ''), '+', '');

				let tmp = [];
				tmp.push(realValue);
				tmp.push(direction);
				sort.push(tmp);
			});

		});
		return response;
	},

	mathParser: function(response, op, value, schema) {
		let realValue = _.replace(value, '{'+schema.name+'}', '');

		if (op === 'min') {
			response.queryData.min = realValue;
			response.queryData.minFlag = true;
		}
		if (op === 'max') {
			response.queryData.max = realValue;
			response.queryData.maxFlag = true;
		}
		if (op === 'sum') {
			response.queryData.sum = realValue;
			response.queryData.sumFlag = true;
		}

		return response;
	},

	extraParser: function(response, op, value, schema) {
		let group = response.queryData.group;
		let fields = response.queryData.fields;
		let include = response.queryData.include;
		let includeFlag = response.queryData.withCountFlag;
		let sort = response.queryData.sort;
		let error = response.queryData.error;
		value.forEach(function(el){
			let responseChanged = false;
			if (op === 'fields') {
				let realValue = _.replace(el, '{'+schema.name+'}', '');

				let tmp = _.split(realValue, ',');
				tmp.forEach(function(col){
					fields.push(col);
				});
				responseChanged = true;
			}

			if (op === 'withCount' && !responseChanged) {
				if (includeFlag === false) {
					response.queryData.include = [];
					include = response.queryData.include;
					includeFlag = true;
				}
				let includeLevel = include;
				let fieldsLevel = fields;
				group.push(schema.name + '.id');
				response.queryData.includeIgnoreAttributes = false;
				if (!_.some(includeLevel, {association: el})) {
					let tmp = {};
					tmp.association = el;
					tmp.attributes = [];
					tmp.duplicating = false;
					fieldsLevel.push([DB.Sequelize.fn('COUNT', DB.Sequelize.col(el + '.' + 'id')), _.camelCase(el) + 'Count']);
					includeLevel.push(tmp);
				}

				responseChanged = true;
			}

			if (op === 'withRelated' && !responseChanged) {
				let includeLevel = include;
				let schemaClone = _.clone(schema);
				let relTree = _.split(el,'.');
				relTree.forEach(function(levelRel, level){
					let firstLevelRelations = SchemaUtility.relationFromSchema(schemaClone, 2);
					firstLevelRelations.forEach(function(rel){
						if (levelRel === rel.name) {
							if (!_.some(includeLevel, {association: rel.name})) {
								if (level === 0) {
									let tmp = {};
									tmp.association = rel.name;
									includeLevel.push(tmp);
									includeLevel = tmp;
								} else if (level > 0) {
									if (!_.has(includeLevel, 'include')) {
										includeLevel['include'] = [];
									}
									if (!_.some(includeLevel['include'], {association: rel.name})) {
										let tmp = {};
										tmp.association = rel.name;
										includeLevel['include'].push(tmp);
										includeLevel = tmp;
									}
								}
							} else {
								includeLevel.forEach(function(elInclude){
									if (_.includes(elInclude.association, rel.name)) {
										includeLevel = elInclude;
									}
								});
							}
							schemaClone = DB.models[rel.model];
						}
					});
				});

				responseChanged = true;
			}

			if (op === 'withFields' && !responseChanged) {
				let relation = '';
				let prefix = '';
				let associations = SchemaUtility.relationFromSchema(schema, 2);

				associations.forEach(function(rel){
					if (_.includes(el, rel.name)) {
						relation = rel.name;
						prefix = '{' + relation + '}';
					}
				});

				let realValue = _.replace(el, prefix, '');

				let includeLevel = include;
				let schemaClone = _.clone(schema);
				let relTree = _.split(relation,'.');
				relTree.forEach(function(levelRel, level){
					let firstLevelRelations = SchemaUtility.relationFromSchema(schemaClone, 2);
					firstLevelRelations.forEach(function(rel){
						if (levelRel === rel.name) {
							if (!_.some(includeLevel, {association: rel.name})) {
								if (level === 0) {
									let tmp = {};
									tmp.association = rel.name;
									includeLevel.push(tmp);
									includeLevel = tmp;
								} else if (level > 0) {
									if (!_.has(includeLevel, 'include')) {
										includeLevel['include'] = [];
									}
									if (!_.some(includeLevel['include'], {association: rel.name})) {
										let tmp = {};
										tmp.association = rel.name;
										includeLevel['include'].push(tmp);
										includeLevel = tmp;
									}
								}
							} else {
								includeLevel.forEach(function(elInclude){
									if (_.includes(elInclude.association, rel.name)) {
										includeLevel = elInclude;
									}
								});
							}
							schemaClone = DB[rel.model];
						}
					});
				});

				let columns = _.split(realValue, ',');

				if (!_.has(includeLevel, 'attributes')) {
					includeLevel['attributes'] = [];
				}
				columns.forEach(function(col){
					includeLevel['attributes'].push(col);
				});

				responseChanged = true;
			}

			if (op === 'withSort' && !responseChanged) {
				let relation = '';
				let prefix = '';
				let associations = SchemaUtility.relationFromSchema(schema, 2);

				associations.forEach(function(rel){
					if (_.includes(el, rel.name)) {
						relation = rel.name;
						prefix = '{' + relation + '}';
					}
				});

				let realValue = _.replace(el, prefix, '');

				let includeLevel = include;
				let schemaClone = _.clone(schema);
				let relTree = _.split(relation,'.');
				relTree.forEach(function(levelRel, level){
					let firstLevelRelations = SchemaUtility.relationFromSchema(schemaClone, 2);
					firstLevelRelations.forEach(function(rel){
						if (levelRel === rel.name) {
							if (!_.some(includeLevel, {association: rel.name})) {
								if (level === 0) {
									let tmp = {};
									tmp.association = rel.name;
									includeLevel.push(tmp);
									includeLevel = tmp;
								} else if (level > 0) {
									if (!_.has(includeLevel, 'include')) {
										includeLevel['include'] = [];
									}
									if (!_.some(includeLevel['include'], {association: rel.name})) {
										let tmp = {};
										tmp.association = rel.name;
										includeLevel['include'].push(tmp);
										includeLevel = tmp;
									}
								}
							} else {
								includeLevel.forEach(function(elInclude){
									if (_.includes(elInclude.association, rel.name)) {
										includeLevel = elInclude;
									}
								});
							}
							schemaClone = DB[rel.model];
						}
					});
				});

				let columns = _.split(realValue, ',');

				columns.forEach(function(col){
					let direction = _.includes(col, '-') ? 'DESC' : 'ASC';

					realValue = _.replace(_.replace(col, '-', ''), '+', '');

					let tmp = [];
					let relArray = _.split(relation,'.');
					relArray.forEach(function(rel){
						tmp.push(rel);
					});
					tmp.push(realValue);
					tmp.push(direction);
					sort.push(tmp);
				});

				responseChanged = true;
			}

			if (op === 'withFilter' && !responseChanged) {
				let relation = '';        // User relation name
				let model = '';           // relation Model
				let attribute = '';       // Relation attribute with condition
				let dbAttribute = '';     // DB Attribute name (Snake Case);
				let prefix = '';
				let suffix = '';
				let orPresent = '';
				let notPresent = '';
				let realValue = '';       // Final condition value;

				// relation and attribute
				let associations = SchemaUtility.relationFromSchema(schema, 2);

				associations.forEach(function(rel){
					if (_.includes(el, '{' + rel.name + '}')) {
						relation = rel.name;
						model = DB.sequelize.models[rel.model];
						prefix = '{' + rel.name + '}';
						Object.keys(model.attributes).map((attr) => {
							if (_.includes(el, '{' + attr + '}')) {
								attribute = attr;
								dbAttribute = attribute;
								suffix = '{' + attribute + '}';
							}
						});
					}
				});

				realValue = _.replace(_.replace(el, prefix, ''), suffix, '');

				let includeLevel = include;
				let schemaClone = _.clone(schema);
				let relTree = _.split(relation,'.');
				relTree.forEach(function(levelRel, level){
					let firstLevelRelations = SchemaUtility.relationFromSchema(schemaClone, 2);
					firstLevelRelations.forEach(function(rel){
						if (levelRel === rel.name) {
							if (!_.some(includeLevel, {association: rel.name})) {
								if (level === 0) {
									let tmp = {};
									tmp.association = rel.name;
									includeLevel.push(tmp);
									includeLevel = tmp;
								} else if (level > 0) {
									if (!_.has(includeLevel, 'include')) {
										includeLevel['include'] = [];
									}
									if (!_.some(includeLevel['include'], {association: rel.name})) {
										let tmp = {};
										tmp.association = rel.name;
										includeLevel['include'].push(tmp);
										includeLevel = tmp;
									}
								}
							} else {
								includeLevel.forEach(function(elInclude){
									if (_.includes(elInclude.association, rel.name)) {
										includeLevel = elInclude;
									}
								});
							}
							schemaClone = DB[rel.model];
						}
					});
				});

				if (!_.has(includeLevel, 'where')) {
					includeLevel['where'] = {};
				}
				let actualLevel = includeLevel['where'];

				// OR operator
				if (_.includes(realValue, OrOperator)) {
					orPresent = SQOrOperator[OrOperator];
					realValue = _.replace(realValue, OrOperator, '');
				}
				// NOT operator
				if (_.includes(realValue, NotOperator)) {
					notPresent = '{not}';
					realValue = _.replace(realValue, NotOperator, '');
				}
				if (orPresent) {
					if (!_.has(actualLevel, [orPresent])) {
						_.set(actualLevel, [orPresent], []);
					}
					let tmp = {};
					tmp[dbAttribute] = {};
					actualLevel[orPresent].push(tmp);
					actualLevel = tmp[dbAttribute];
				} else {
					if (!_.has(actualLevel, [dbAttribute])) {
						_.set(actualLevel, [dbAttribute], {});
					}
					actualLevel = actualLevel[dbAttribute];
				}

				// NULL operator
				if (_.includes(realValue, NullOperator)) {
					realValue = _.replace(realValue, NullOperator, '');
					if (!_.has(actualLevel, SQNullOperator[notPresent + NullOperator])) {
						actualLevel[SQNullOperator[notPresent + NullOperator]] = null;
					}
				} else if (_.includes(realValue, BtwOperator)) {
					// BETWEEN operator
					realValue = _.replace(realValue, BtwOperator, '');
					let tmp = _.split(realValue, ',');
					tmp.forEach(function(value){
						const result = Joi.validate({ [dbAttribute]: value }, schemaClone.joiValid);
						if (result.error) {
							error['message'] = result.error.message;
							return response;
						}
					});
					if (!_.has(actualLevel, SQBtwOperator[notPresent + BtwOperator])) {
						actualLevel[SQBtwOperator[notPresent + BtwOperator]] = {};
						actualLevel[SQBtwOperator[notPresent + BtwOperator]] = tmp;
					} else {
						let found = false;
						actualLevel[SQBtwOperator[notPresent + BtwOperator]].forEach(function(cond){
							if (_.isEqual(cond.sort(), tmp.sort())) {
								found = true;
							}
						});
						if (!found) {
							actualLevel[SQBtwOperator[notPresent + BtwOperator]] = tmp;
						}
					}
				} else if (_.includes(realValue, InOperator)) {
					// IN operator
					realValue = _.replace(realValue, InOperator, '');
					let tmp = _.split(realValue, ',');
					tmp.forEach(function(value){
						const result = Joi.validate({ [dbAttribute]: value }, schemaClone.joiValid);
						if (result.error) {
							error['message'] = result.error.message;
							return response;
						}
					});
					if (!_.has(actualLevel, SQInOperator[notPresent + InOperator])) {
						actualLevel[SQInOperator[notPresent + InOperator]] = [];
						actualLevel[SQInOperator[notPresent + InOperator]].push(tmp);
					} else {
						let found = false;
						actualLevel[SQInOperator[notPresent + InOperator]].forEach(function(cond){
							if (_.isEqual(cond.sort(), tmp.sort())) {
								found = true;
							}
						});
						if (!found) {
							actualLevel[SQInOperator[notPresent + InOperator]].push(tmp);
						}
					}
				} else {
					// LOGICAL operator
					let found = false;
					Operator.some(function(op){
						if (_.includes(realValue, op)){
							found = true;
							return true;
						}
					});
					if (!found) {
						realValue = '{=}'+realValue;
					}
					Operator.some(function (op) {
						if (_.includes(realValue, op)) {
							realValue = _.replace(realValue, op, '');
							const result = Joi.validate({[dbAttribute]: realValue}, schemaClone.joiValid);
							if (result.error) {
								error['message'] = result.error.message;
								return response;
							}

							if (op === '{like}') {
								realValue = '%' + realValue + '%'
							} else if (op === '{%like}') {
								realValue = '%' + realValue
							} else if (op === '{like%}') {
								realValue = realValue + '%'
							}

							let attr = schemaClone.attributes[dbAttribute];

							if (attr.type.key === 'BOOLEAN') {
								realValue = realValue === 'true' || realValue === '1' || realValue === 1;

							}

							if (!_.has(actualLevel, SQOperators[notPresent + op])) {
								actualLevel[SQOperators[notPresent + op]] = [];
								actualLevel[SQOperators[notPresent + op]].push(realValue);
							} else {
								if (!_.includes(actualLevel[SQOperators[notPresent + op]], realValue)) {
									actualLevel[SQOperators[notPresent + op]].push(realValue);
								}
							}
							return true;
						}
					});
				}
			}


		});
		return response;
	},
};



module.exports = PreHandlerBase;