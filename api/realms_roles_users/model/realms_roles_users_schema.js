const Joi = require('joi');


// REALMS ROLES USERS SCHEMA
const RealmsRolesUsersSchema = {
	name: 'RealmsRolesUsers',
	rel: 'RealmsRolesUsers',
	table: 'realms_roles_users',
	schemaQuery: () => {return Joi.object().keys({
		id: Joi.number().min(1),
		realm_id: Joi.number().min(1),
		role_id: Joi.number().min(1),
		user_id: Joi.number().min(1),
		created_at: Joi.date(),
		updated_at: Joi.date(),
		deleted_at: Joi.date(),
	})},
	schemaPayload: () => {return Joi.object().keys({
		id: Joi.number().min(1),
		realm_id: Joi.number().min(1),
		role_id: Joi.number().min(1),
		user_id: Joi.number().min(1),
		created_at: Joi.date(),
		updated_at: Joi.date(),
		deleted_at: Joi.date(),
	})},
};

module.exports = RealmsRolesUsersSchema;