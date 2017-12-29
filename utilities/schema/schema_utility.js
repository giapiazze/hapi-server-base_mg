const DB = require('../../config/mongoose');
const Pluralize = require('pluralize');
const _ = require('lodash');


//HELPER to get array of relations from a schema

const SchemaUtility = {
	relationFromSchema: (schema, level) => {
		let relations = [];

		Object.keys(schema.associations).map((rel) => {
			let relModel = {};
			let localExclusion = [rel];

			if (DB.sequelize.models[Pluralize.singular(rel)]) {
				relModel = DB.sequelize.models[Pluralize.singular(rel)];
			} else if (DB.sequelize.models[rel]) {
				relModel = DB.sequelize.models[rel];
			}

			relations.push({name: rel, model: relModel.name});

			if (level === 2) {
				Object.keys(relModel.associations).map((relOfRel) => {
					if (!_.includes(localExclusion, relOfRel)) {
						if (DB.sequelize.models[Pluralize.singular(relOfRel)]) {
							relModel = DB.sequelize.models[Pluralize.singular(relOfRel)];
						} else if (DB.sequelize.models[relOfRel]) {
							relModel = DB.sequelize.models[relOfRel];
						}

						relations.push({name: rel + '.' + relOfRel, model: relModel.name});
					}
				});
			}

		});

		return relations;
	},

	relationsFromSchema: (schema, startLevel, endLevel) => {
		let firstLevel = [];
		let secondLevel = [];
		let relations = '';

		Object.keys(schema.associations).map((rel) => {
			let relModel = {};
			let localExclusion = [rel];

			if (DB.sequelize.models[Pluralize.singular(rel)]) {
				relModel = DB.sequelize.models[Pluralize.singular(rel)];
			} else if (DB.sequelize.models[rel]) {
				relModel = DB.sequelize.models[rel];
			}

			if (startLevel === 1) {
				firstLevel.push(rel);
			}

			if (endLevel === 2) {
				Object.keys(relModel.associations).map((relOfRel) => {
					if (!_.includes(localExclusion, relOfRel)) {
						if (DB.sequelize.models[Pluralize.singular(relOfRel)]) {
							relModel = DB.sequelize.models[Pluralize.singular(relOfRel)];
						} else if (DB.sequelize.models[relOfRel]) {
							relModel = DB.sequelize.models[relOfRel];
						}

						secondLevel.push(rel + '.' + relOfRel);

					}
				});
			}

		});

		firstLevel = _.sortedUniq(firstLevel);
		secondLevel = _.sortedUniq(secondLevel);

		relations += _.join(firstLevel, ', ');
		relations += _.join(secondLevel, ', ');

		return relations;
	},
};

module.exports = SchemaUtility;