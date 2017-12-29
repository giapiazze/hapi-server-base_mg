const Dotenv = require('dotenv');

Dotenv.config({ silent: true });

module.exports = {

	"development": {
		"url": "mongodb://"+process.env.DB_USER+":"+process.env.DB_PWD+"@ds133077.mlab.com:33077/hapi_development",
	},

	"test": {
		"url": "mongodb://"+process.env.DB_USER+":"+process.env.DB_PWD+"@ds133077.mlab.com:33077/hapi_development",
	},

  "production": {
	  "url": "mongodb://" + process.env.DB_USER + ":" + process.env.DB_PWD + "@ds133077.mlab.com:33077/hapi_development",
  },
};

