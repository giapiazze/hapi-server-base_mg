// Roles References:
// roleId: 1 => User
// roleId: 2 => Admin
// roleId: 3 => SuperAdmin
// realmId: 1 => GameApp
// realmId: 2 => WebApp
// realmId: 3 => WebJson


const array = [
	{realmId: 1, roleId: 2, userId: 1},
	{realmId: 1, roleId: 3, userId: 2},
	{realmId: 1, roleId: 1, userId: 3},
	{realmId: 2, roleId: 1, userId: 1},
	{realmId: 2, roleId: 2, userId: 3},
	{realmId: 3, roleId: 1, userId: 1},
	{realmId: 3, roleId: 2, userId: 2},
];

module.exports = array;