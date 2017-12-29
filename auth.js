const AuthJWT2 = require('hapi-auth-jwt2');

const Config = require('./config/config');


module.exports.register = (server, options, next) => {
	const authStrategy = Config.get('/serverHapiConfig/authStrategy');

	let validate = function (decodedToken, request, callback) {

		let user = decodedToken.user;
		callback(
			null,
			Boolean(user),
			{ user, scope: decodedToken.scope, roles: decodedToken.roles, realms: decodedToken.realms }
		);

	};


	server.register(AuthJWT2, (err) => {
		if (err) {
			server.log('error', 'Failed to load auth:' + err);
		}

		server.auth.strategy(authStrategy, 'jwt',
			{
				key: Config.get('/jwtSecret'),          // Never Share your secret key
				validateFunc: validate,                 // validate function defined above
				verifyOptions: {algorithms: ['HS256']}  // pick a strong algorithm
			});

		server.auth.default(authStrategy);

	});

	next();

};

module.exports.register.attributes = {
	name: 'auth',
	version: '0.0.1',
};