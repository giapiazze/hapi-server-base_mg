const Joi = require('joi');


const auth = {
	authorization: Joi.string().required(),
};



const HeaderValidations = {
	header: Joi.object().keys(Object.assign({}, auth)).options({ allowUnknown: true }),
};


module.exports = HeaderValidations;