const Realms = require('../seeders/data/02-realm_data');

exports.seed = function(knex, Promise) {
	return Promise.join(
		// Deletes ALL existing entries
		knex('realms').del(),

		// Inserts seed entries
		knex('realms').insert(Realms),
	);
};
