const Roles = require('../seeders/data/03-role_data');


exports.seed = function(knex, Promise) {
	return Promise.join(
		// Deletes ALL existing entries
		knex('roles').del(),

		// Inserts seed entries
		knex('roles').insert(Roles),
	);
};