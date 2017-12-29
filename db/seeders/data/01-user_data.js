const Bcrypt = require('bcrypt');

const utility = {
	passwordHash: function (password) {
		let salt = Bcrypt.genSaltSync(10),
				hash = Bcrypt.hashSync(password, salt);

		return hash;
	}
};


const array = [
	{ id: 1,
		username: 'g.piazzesi',
		password: utility.passwordHash('Pippone72.;'),
		email: 'giapiazze@gmail.com',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{ id: 2,
		username: 'm.vernaccini',
		password: utility.passwordHash('natasha1978'),
		email: 'goriverna@gmail.com',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{ id: 3,
		username: 'a.moschella',
		password: utility.passwordHash('natasha1978'),
		email: 'andrea.moschella@exatek.it',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

module.exports = array;