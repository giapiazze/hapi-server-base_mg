const GoodPack = require('./plugins/good_plugin');
// const Auth = require ('../plugins/auth');
const SwaggerPack = require('./plugins/swagger_plugin');


const Plugins = [
	// logging
	GoodPack,

	// Swagger
	SwaggerPack.inert,
	SwaggerPack.vision,
	SwaggerPack.swagger,

	// // local auth plugin
	// { register: Auth },
];

module.exports = Plugins;
