const Joi = require('joi');


const payload = Joi.alternatives().try(
	Joi.object({
		username: Joi.string().min(5).max(64).required(),
		password: Joi.string().required(),
		realm: Joi.string().max(64).required(),
	}),
	Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
		realm: Joi.string().max(64).required(),
	}),
);



const AuthValidations = {
	payload: payload,
};


module.exports = AuthValidations;