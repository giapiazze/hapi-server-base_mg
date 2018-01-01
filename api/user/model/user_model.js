const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcryptjs');
const Chalk = require('chalk');
const Validator = require('validator');
const Timestamps = require('mongoose-timestamp');
const SoftDelete = require('mongoose-delete');
const Pagination = require('mongoose-paginate');


module.exports = function (mongoose) {
	const ModelName = "user";
	const Types = mongoose.Schema.Types;
	const Schema = new mongoose.Schema({
			username: {
				type: Types.String,
				unique: true,
				required: true,
				minlength: 3,
				maxlength: 64,
			},
			isActive: {
				type: Types.Boolean,
				allowOnUpdate: false,
				default: false
			},
			password: {
				type: Types.String,
				required: true,
				exclude: true,
				allowOnUpdate: false
			},
			firstName: {
				type: Types.String,
				required: true
			},
			lastName: {
				type: Types.String,
				required: true
			},
			email: {
				type: Types.String,
				required: true,
				unique: true,
				validate: { validator: Validator.isEmail , message: 'Invalid email.' }
			},
			resetPassword: {
				token: {
					allowOnCreate: false,
					allowOnUpdate: false,
					exclude: true,
					type: Types.String
				},
				expires: {
					allowOnCreate: false,
					allowOnUpdate: false,
					exclude: true,
					type: Types.Date
				}
			},
			activateAccount: {
				token: {
					allowOnCreate: false,
					allowOnUpdate: false,
					exclude: true,
					type: Types.String
				},
				expires: {
					allowOnCreate: false,
					allowOnUpdate: false,
					exclude: true,
					type: Types.Date
				}
			},
			// INTERNAL RELATIONS
			// realmRoleUsers: [{ type: Types.ObjectId, ref: 'RealmRoleUser' }],
		},
		{ collection: ModelName,
			toObject: {
				virtuals: true
			},
			toJSON: {
				virtuals: true
			} }

	);

	// VIRTUAL RELATIONS
	Schema.virtual('realmRoleUsers', {
		ref: 'RealmRoleUser', // The model to use
		localField: '_id', // Find people where `localField`
		foreignField: 'user', // is equal to `foreignField`
		// If `justOne` is true, 'members' will be a single doc as opposed to
		// an array. `justOne` is false by default.
		justOne: false
	});

	Schema.plugin(Timestamps);
	Schema.plugin(SoftDelete, { deletedAt : true });
	Schema.plugin(Pagination);

	return Schema;
};