const Timestamps = require('mongoose-timestamp');
const SoftDelete = require('mongoose-delete');


module.exports = function (mongoose) {
	const ModelName = "realm";
	const Types = mongoose.Schema.Types;
	const Schema = new mongoose.Schema({

			// ATTRIBUTES
			name: {
				type: Types.String,
				unique: true,
				required: true,
				minlength: 3,
				maxlength: 64,
			},
			description: {
				type: Types.String,
				allowNull: true,
				required: true,
			},


		},
		{collection: ModelName,
			toObject: {
				virtuals: true
			},
			toJSON: {
				virtuals: true
			}
		},
	);

	// VIRTUAL RELATIONS
	Schema.virtual('realmRoleUsers', {
		ref: 'RealmRoleUser', // The model to use
		localField: '_id', // Find people where `localField`
		foreignField: 'realm', // is equal to `foreignField`
		// If `justOne` is true, 'members' will be a single doc as opposed to
		// an array. `justOne` is false by default.
		justOne: false
	});

	Schema.plugin(Timestamps);
	Schema.plugin(SoftDelete, { deletedAt : true });

	return Schema;
};