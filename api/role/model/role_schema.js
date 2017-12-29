const Joi = require('joi');


//ROLE SCHEMA
const RoleSchema = {
	name: 'Role',
	rel: 'Roles',
	table: 'roles',
	schemaQuery: () => {return Joi.object().keys({
		id: Joi.number().min(1),
		name: Joi.string().min(1).max(64),
		description: Joi.string().min(1),
		created_at: Joi.date(),
		updated_at: Joi.date(),
		deleted_at: Joi.date(),
	})},
	schemaPayload: () => {return Joi.object().keys({
		id: Joi.number().min(1),
		name: Joi.string().min(5).max(64),
		description: Joi.string().min(5),
		created_at: Joi.date(),
		updated_at: Joi.date(),
		deleted_at: Joi.date(),
	})},
	
};

module.exports = RoleSchema;