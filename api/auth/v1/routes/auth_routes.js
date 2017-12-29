const AuthHandlers = require('../handler/auth_handlers');
const AuthValidations = require('../../model/auth_validations');

const LoginPre = require('../handler/auth_pre/login_pre');


module.exports.register = (server, options, next) => {

	server.route([
		{
			method: 'POST',
			path: '/v1/login',
			config: {
				handler: AuthHandlers.login,
				auth: false,
				tags: ['Login', 'api', 'v1'],
				description: 'User login.',
				notes: ['Returns TOKENS after User authentication'],
				validate: {
					payload: AuthValidations.payload
				},
				pre: LoginPre,
			},
		}
	]);

	next()
};

module.exports.register.attributes = {
	name: 'api.auth',
	version: '0.0.1',
};
