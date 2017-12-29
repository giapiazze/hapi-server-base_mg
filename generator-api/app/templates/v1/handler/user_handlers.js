const UserFindAll = require('./user_handlers/user_find_all');

const UserHandlers =
	{
		userFindAll: (request, reply) => {
			return UserFindAll.userFindAll(request, reply)
		},
		userFindOne: (request, reply) => {
			return UserFindAll.userFindAll(request, reply)
		},
	};

module.exports = UserHandlers;