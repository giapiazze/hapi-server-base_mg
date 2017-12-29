const RealmsRolesUsers = require('../seeders/data/04-realms_roles_users_data');


exports.seed = function(knex, Promise) {
	return Promise.join(
		// Deletes ALL existing entries
		knex('realms_roles_users').del(),

		// Inserts seed entries
		knex('realms_roles_users').insert(RealmsRolesUsers),
	);
};