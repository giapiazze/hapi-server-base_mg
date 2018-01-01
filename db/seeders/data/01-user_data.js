const Bcrypt = require('bcrypt');

const utility = {
	passwordHash: function (password) {
		let salt = Bcrypt.genSaltSync(10),
				hash = Bcrypt.hashSync(password, salt);

		return hash;
	}
};


const array = [
	{ username: 'g.piazzesi',
		password: utility.passwordHash('Pippone72.;'),
		email: 'giapiazze@gmail.com',
		isActive: true,
		firstName: 'Giacomo',
		lastName: 'Piazzesi',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{ username: 'm.vernaccini',
		password: utility.passwordHash('natasha1978'),
		email: 'goriverna@gmail.com',
		isActive: true,
		firstName: 'Marco',
		lastName: 'Vernaccini',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{ username: 'a.moschella',
		password: utility.passwordHash('natasha1978'),
		email: 'andrea.moschella@exatek.it',
		isActive: true,
		firstName: 'Andrea',
		lastName: 'Moschella',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

module.exports = array;