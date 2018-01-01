const Joi = require('joi');


// REALMS
const RealmSchema = {
	name: 'RealmSchemas',
	rel: 'Realms',
	collection: 'Realm',
	schemaQuery: () => {return Joi.object().keys({
		id: Joi.string().length(24),
		name: Joi.string().min(4).max(64),
		description: Joi.string().min(5),
		created_at: Joi.date(),
		updated_at: Joi.date(),
		deleted_at: Joi.date(),
	})},
	schemaPayload: () => {return Joi.object().keys({
		id: Joi.string().length(24),
		name: Joi.string().min(4).max(64),
		description: Joi.string().min(5),
		createdAt: Joi.date(),
		updatedAt: Joi.date(),
		deletedAt: Joi.date(),
	})},
};

module.exports = RealmSchema;