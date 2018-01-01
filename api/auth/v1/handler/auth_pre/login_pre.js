const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Token = require('../../../../../utilities/token/token');
const DB = require('../../../../../config/mongoose-init');

const Config = require('../../../../../config/config');
const AUTH_STRATEGIES = Config.get('/constants/AUTH_STRATEGIES');
const expirationPeriod = Config.get('/expirationPeriod');
const authStrategy = Config.get('/serverHapiConfig/authStrategy');

const User = DB.models.User;
const Realm = DB.models.Realm;
const Role = DB.models.Role;


const LoginPre = [
	// {
	// 	assign: 'abuseDetected',
	// 	method: function (request, reply) {
	//
	// 		const ip = request.info.remoteAddress;
	// 		const email = request.payload.email;
	//
	// 		AuthAttempt.abuseDetected(ip, email, Log)
	// 			.then(function (detected) {
	// 				if (detected) {
	// 					return reply(Boom.badRequest('Maximum number of auth attempts reached. Please try again later.'));
	// 				}
	// 				return reply();
	// 			})
	// 			.catch(function (error) {
	// 				Log.error(error);
	// 				return reply(Boom.gatewayTimeout('An error occurred.'));
	// 			});
	// 	}
	// },
	{
		assign: 'user',
		method: function (request, reply) {

			const db = DB;
			const email = request.payload.email;
			const username = request.payload.username;
			const password = request.payload.password;
			let v = db.models;

			let user = {};

			const usernameReq = async (param) => {
				let user = {};
				try {
					user = await User
						.findOne({where:
							{
								$or: [
									{	username: {$eq: param} },
									{	email: {$eq: param}	}
								]}
						});
					if (!user) {
						return reply(Boom.unauthorized('Invalid username or password'));
					}
					let match = Bcrypt.compareSync(password, user.password);
					if (match) {
						return reply(user);
					}
					return reply(Boom.unauthorized('Invalid username or password'));
				}
				catch (error) {
					let errorMsg = error.message || 'An error occurred';
					return reply(Boom.gatewayTimeout(errorMsg));
				}
			};


			if (username) {
				usernameReq(username);
			} else if (email) {
				usernameReq(email);
			}

		}
	},
	{
		assign: 'realm',
		method: function (request, reply) {

			let realmName = request.payload.realm;

			Realm
				.findOne({where:
					{name: realmName}})
				.then(function(result){
					let realm = result;
					if (!realm) {
						return reply(Boom.unauthorized('Invalid realm'));
					} else {
						return reply(realm);
					}
				});
			// .catch(function (error) {
			// 	let errorMsg = error.message || 'An error occurred';
			// 	return reply(Boom.gatewayTimeout(errorMsg));
			// });
		}
	},
// {
// 	// assign: 'logAttempt',
// 	// method: function (request, reply) {
// 	//
// 	// 	if (request.pre.user) {
// 	// 		return reply();
// 	// 	}
// 	//
// 	// 	const ip = request.info.remoteAddress;
// 	// 	const email = request.payload.email;
// 	//
// 	// 	AuthAttempt.createInstance(ip, email, Log)
// 	// 		.then(function (authAttempt) {
// 	// 			return reply(Boom.badRequest('Invalid Email or Password.'));
// 	// 		})
// 	// 		.catch(function (error) {
// 	// 			Log.error(error);
// 	// 			return reply(Boom.gatewayTimeout('An error occurred.'));
// 	// 		});
// 	// }
// },
	{
		assign: 'isActive',
		method: function (request, reply) {

			let user = request.pre.user;

			if (user.isActive) {
				return reply();
			}
			else {
				return reply(Boom.badRequest('Account is inactive.'));
			}
		}
	},
	// {
	// 	assign: 'session',
	// 	method: function (request, reply) {
	// 		if (authStrategy === AUTH_STRATEGIES.TOKEN) {
	// 			reply(null);
	// 		}
	// 		else {
	// 			Session.createInstance(request.pre.user)
	// 				.then(function (session) {
	// 					return reply(session);
	// 				})
	// 				.catch(function (error) {
	// 					Log.error(error);
	// 					return reply(Boom.gatewayTimeout('An error occurred.'));
	// 				});
	// 		}
	// 	}
	// },
	{
		assign: 'roles',
		method: function (request, reply) {

			let user = request.pre.user;
			let realm = request.pre.realm;
			let roles = [];

			User
				.findOne({
					where: {id: user.id},
					include: [{
						model: Role,
						through: {
							where: {realmId: realm.id}
						}
					}]
				})
				.then(function(result){
					roles = result.Roles;
					if(roles && roles.length){
						return reply(roles);
					} else {
						return reply(Boom.unauthorized('No roles'));
					}
				})
				.catch(function (error) {
					let errorMsg = error.message || 'An error occurred';
					return reply(Boom.gatewayTimeout(errorMsg));
				});

			// return Permission.getScope(request.pre.user, Log)
			// 	.then(function (scope) {
			// 		return reply(scope);
			// 	});
		}
	},
	{
		assign: 'scope',
		method: function (request, reply) {

			let realm = request.pre.realm;
			let roles = request.pre.roles;
			let scope = [];

			// Add Realm-Roles to Scope
			roles.forEach(function (role){
				if (role.name.indexOf('User') !== -1) {
					scope = scope.concat(realm.name+'-'+role.name+'-'+request.pre.user.id)
				} else {
					scope = scope.concat(realm.name+'-'+role.name);
				}
			});

			return reply(scope);

			// return Permission.getScope(request.pre.user, Log)
			// 	.then(function (scope) {
			// 		return reply(scope);
			// 	});

		}
	},
	{
		assign: 'standardToken',
		method: function (request, reply) {

			let user = request.pre.user;
			let realm = request.pre.realm;
			let roles = request.pre.roles;
			let scope = request.pre.scope;

			switch (authStrategy) {
				case AUTH_STRATEGIES.PURE_TOKEN:
					reply(Token(user, null, scope, roles, realm, expirationPeriod.short));
					break;
				case AUTH_STRATEGIES.SESSION_TOKEN:
					reply(Token(user, null, scope, roles, realm, expirationPeriod.short));
					break;
				default:
					break;
			}
		}
	},
	// {
	// 	assign: 'sessionToken',
	// 	method: function (request, reply) {
	// 		switch (authStrategy) {
	// 			case AUTH_STRATEGIES.TOKEN:
	// 				reply(null);
	// 				break;
	// 			case AUTH_STRATEGIES.SESSION:
	// 				reply(Token(null, request.pre.session, request.pre.scope, expirationPeriod.long, Log));
	// 				break;
	// 			case AUTH_STRATEGIES.REFRESH:
	// 				reply(null);
	// 				break;
	// 			default:
	// 				break;
	// 		}
	// 	}
	// },
	{
		assign: 'refreshToken',
		method: function (request, reply) {

			let user = request.pre.user;
			let realm = request.pre.realm;
			let roles = request.pre.roles;
			let scope = request.pre.scope;

			switch (authStrategy) {
				case AUTH_STRATEGIES.PURE_TOKEN:
					reply(Token(null, user, scope, roles, realm, expirationPeriod.long));
					break;
				case AUTH_STRATEGIES.SESSION_TOKEN:
					reply(Token(null, user, scope, roles, realm, expirationPeriod.long));
					break;
				default:
					break;
			}
		}
	}
];

module.exports = LoginPre;