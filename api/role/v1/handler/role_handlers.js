const RoleFindAll = require('./role_handlers/role_find_all');

const RoleHandlers =
	{
		roleFindAll: (request, reply) => {
			return RoleFindAll.roleFindAll(request, reply)
		},
	};

module.exports = RoleHandlers;