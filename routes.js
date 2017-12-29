const AuthRoutes = require('./api/auth/v1/routes/auth_routes');
const RoleRoutes = require('./api/role/v1/routes/role_routes');
const UserRoutes = require('./api/user/v1/routes/user_routes');


const Routes = [
	// Authentication Routes
	{ register: AuthRoutes},

	// Role Routes
	{ register: RoleRoutes},

	// User Routes
	{ register: UserRoutes},



];

module.exports = Routes;