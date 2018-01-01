const Validator = require('validator');
const Timestamps = require('mongoose-timestamp');
const SoftDelete = require('mongoose-delete');


module.exports = function (mongoose) {
	const ModelName = "realmRoleUser";
	const Types = mongoose.Schema.Types;
	const Schema = new mongoose.Schema({

		// INTERNAL RELATIONS
		realm: { type: Types.ObjectId, ref: 'Realm' },
		role: { type: Types.ObjectId, ref: 'Role' },
		user: { type: Types.ObjectId, ref: 'User' },

	}, {collection: ModelName});

	Schema.plugin(Timestamps);
	Schema.plugin(SoftDelete, { deletedAt : true });

	return Schema;
};