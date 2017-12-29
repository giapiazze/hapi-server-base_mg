module.exports = function(sequelize, DataTypes) {

	let Role = sequelize.define('Role', {

	// ATTRIBUTES
	name: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
		validation: {
			len: [3,64]
		},
	},
	description: {
		type: DataTypes.STRING,
		allowNull: true,
	},
		},
		{
			tableName: 'roles',
			paranoid: true,
		},
	);

	// Class Method
	Role.associate = function (models) {
		Role.belongsToMany(models.Realm, { through: models.RealmsRolesUsers });
		Role.belongsToMany(models.User, { through: models.RealmsRolesUsers });
	};

	return Role;
};