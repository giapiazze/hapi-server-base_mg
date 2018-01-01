const Joi = require('joi');


// REALMS ROLES USERS SCHEMA
const RealmRoleUserSchema = {
	name: 'RealmRoleUserSchemas',
	rel: 'RealmRoleUsers',
	collection: 'RealmRoleUser',
	schemaQuery: () => {return Joi.object().keys({
		id: Joi.string().length(24),
		realm: Joi.string().length(24),
		role: Joi.string().length(24),
		user: Joi.string().length(24),
		created_at: Joi.date(),
		updated_at: Joi.date(),
		deleted_at: Joi.date(),
	})},
	schemaPayload: () => {return Joi.object().keys({
		id: Joi.string().length(24),
		realm: Joi.string().length(24),
		role: Joi.string().length(24),
		user: Joi.string().length(24),
		created_at: Joi.date(),
		updated_at: Joi.date(),
		deleted_at: Joi.date(),
	})},
};

module.exports = RealmRoleUserSchema;