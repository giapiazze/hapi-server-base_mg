const Login = require('./auth_handlers/login');

const AuthHandlers =
	{
		login: (request, reply) => {
			return Login.login(request, reply)
		},
	};

module.exports = AuthHandlers;