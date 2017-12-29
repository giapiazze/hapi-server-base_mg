const Users = require('../seeders/data/01-user_data');


exports.seed = function(knex, Promise) {
	return Promise.join(
		// Deletes ALL existing entries
		knex('users').del(),

		// Inserts seed entries
		knex('users').insert(Users),
	);
};

