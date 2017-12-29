module.exports = function(sequelize, DataTypes) {

	let Realm = sequelize.define('Realm', {

			// ATTRIBUTES
			name: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
				validation: {
					len: [3, 64]
				},
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			tableName: 'realms',
			paranoid: true,
		},
	);

	// Class Method
	Realm.associate = function (models) {
		Realm.belongsToMany(models.Role, { through: models.RealmsRolesUsers });
		Realm.belongsToMany(models.User, { through: models.RealmsRolesUsers });
	};

	return Realm;
};