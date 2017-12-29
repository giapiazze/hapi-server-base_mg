const Jwt = require('jsonwebtoken');
const Config = require('../../config/config');

function createToken(user, session, scope, roles, realm, expirationPeriod) {

	let token = {};
	let tokenRoles = [];
	let tokenRealms = [];

	roles.forEach(function(role){
		tokenRoles.push(role.name);
	});

	tokenRealms.push(realm.name);

	if (session) {
		user = session;
		const tokenUser = {
			id: user.id,
			username: user.username,
			email: user.email,
		};
		token = Jwt.sign({
			sessionUser: tokenUser,
			scope: scope,
			roles: tokenRoles,
			realms: tokenRealms,
		}, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: expirationPeriod });
	}
	else {
		const tokenUser = {
			id: user.id,
			username: user.username,
			email: user.email,
		};

		token = Jwt.sign({
			user: tokenUser,
			scope: scope,
			roles: tokenRoles,
			realms: tokenRealms,
		}, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: expirationPeriod });
	}

	return token;
}

module.exports = createToken;