const DB = require('../../config/mongoose-init');
const Pluralize = require('pluralize');
const _ = require('lodash');


//HELPER to get array of relations from a schema

const SchemaUtility = {
	relationFromSchema: (model, level) => {
		let schema = model.schema;
		let relations = [];

		Object.keys(schema.tree).map((rel) => {
			let attribute = schema.tree[rel];

			if ((Array.isArray(attribute) && attribute[0].ref) || attribute.ref || (attribute.options && attribute.options.ref)) {
				let ref = attribute.ref;
				if (attribute.options && attribute.options.ref) {
					ref = attribute.options.ref;
				}
				if (attribute[0] && attribute[0].ref) {
					ref = attribute[0].ref;
				}
				Object.keys(DB.models).map((relatedModel) => {
					if (relatedModel === ref) {
							relations.push({name: rel, model: ref});
						if (level === 2) {
							let tree = DB.models[relatedModel].schema.tree;
							Object.keys(tree).map((secondRel) => {
								let attribute = tree[secondRel];
								if ((Array.isArray(attribute) && attribute[0].ref) || attribute.ref || (attribute.options && attribute.options.ref)) {
									let ref = attribute.ref;
									if (attribute.options && attribute.options.ref) {
										ref = attribute.options.ref;
									}
									if (attribute[0] && attribute[0].ref) {
										ref = attribute[0].ref;
									}
									Object.keys(DB.models).map((model) => {
										if (model === ref) {
											relations.push({name: rel + '.' + secondRel, model: ref});
										}
									});
								}
							});
						}
					}
				});
			}
		});

		return relations;
	},

	relationsFromSchema: (modelName, startLevel, endLevel) => {
		let firstLevel = [];
		let secondLevel = [];
		let relations = '';
		let model = DB.models[modelName];
		let schema = model.schema;

		Object.keys(schema.tree).map((rel) => {
			let attribute = schema.tree[rel];

			if ((Array.isArray(attribute) && attribute[0].ref) || attribute.ref || (attribute.options && attribute.options.ref)) {
				let ref = attribute.ref;
				if (attribute.options && attribute.options.ref) {
					ref = attribute.options.ref;
				}
				if (attribute[0] && attribute[0].ref) {
					ref = attribute[0].ref;
				}
				Object.keys(DB.models).map((relatedModel) => {
					if (relatedModel === ref) {
						if (startLevel === 1) {
							firstLevel.push(rel);
						}
						if (startLevel === 2 || endLevel === 2) {
							let tree = DB.models[relatedModel].schema.tree;
							Object.keys(tree).map((secondRel) => {
								let attribute = tree[secondRel];
								if ((Array.isArray(attribute) && attribute[0].ref) || attribute.ref || (attribute.options && attribute.options.ref)) {
									let ref = attribute.ref;
									if (attribute.options && attribute.options.ref) {
										ref = attribute.options.ref;
									}
									if (attribute[0] && attribute[0].ref) {
										ref = attribute[0].ref;
									}
									Object.keys(DB.models).map((model) => {
										if (model === ref) {
											secondLevel.push(rel + '.' + secondRel);
										}
									});
								}
							});
						}
					}
				});
			}
		});

		if (!_.isEmpty(firstLevel)) {
			firstLevel = _.sortedUniq(firstLevel);
			relations += _.join(firstLevel, ', ');
			if (!_.isEmpty(secondLevel)) {
				secondLevel = _.sortedUniq(secondLevel);
				relations += ', ' + _.join(secondLevel, ', ');
			}
		} else if (!_.isEmpty(secondLevel)) {
			secondLevel = _.sortedUniq(secondLevel);
			relations += _.join(secondLevel, ', ');
		}

		return relations;
	},
};

module.exports = SchemaUtility;