module.exports = function(sequelize, DataTypes) {

	let RealmsRolesUsers = sequelize.define('RealmsRolesUsers', {

			// ATTRIBUTES
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
				comment: "Primary and auto incremented key of the table"
			},
			realmId: {
				type: DataTypes.INTEGER,
				references: {
					// This is a reference to another model
					model: 'Realm',
					// This is the column name of the referenced model
					key: 'id',
				}
			},
			roleId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'Role',
					key: 'id',
				}
			},
			userId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'User',
					key: 'id',
				}
			},
		},
		{
			tableName: 'realms_roles_users',
			paranoid: true,
		},
	);

	// Model Relations
	RealmsRolesUsers.associate = function (models) {
		RealmsRolesUsers.belongsTo(models.Realm);
		RealmsRolesUsers.belongsTo(models.Role);
		RealmsRolesUsers.belongsTo(models.User);
	};

	return RealmsRolesUsers;
};
