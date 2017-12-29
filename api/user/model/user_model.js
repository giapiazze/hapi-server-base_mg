const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcryptjs');
const Chalk = require('chalk');
const Validator = require('validator');

module.exports = function (mongoose) {
	const modelName = "User";
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
		}
	}, {collection: modelName});

	return Schema;
};