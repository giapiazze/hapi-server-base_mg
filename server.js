const Hapi = require('hapi');
const Log = require('./utilities/logging/logging');
const Chalk = require("chalk");

const Plugins = require('./plugins');
const Routes = require('./routes');
const Auth = require('./auth');

const Config = require('./config/config');

const HOST = Config.get('/host');
const PORT = Config.get('/port');



// Create a server with a host and port
const server = new Hapi.Server({
	debug: {
		request: ['error']
	},
	connections: {
		routes: {
			security: true,
			cors: true,
		}
	},
});

server.connection({
	host: HOST,
	port: PORT,
});

server.realm.modifiers.route.prefix = '/api';

// Auth module
server.register(Auth, (err) => {
		if (err) {
			Log.apiLogger.error(Chalk.red('Failed to register auth: ' + err));
		}

		// Plugins
		server.register(Plugins, (err) => {
			if (err) {
				Log.apiLogger.error(Chalk.red('Failed to load plugin:' + err));
			}

			// Routes
			server.register(Routes, (err) => {
				if (err) {
					Log.apiLogger.error(Chalk.red('Failed to register routes: ' + err));
				}

				// Start the server
				server.start((err) => {

					if (err) {
						throw err;
					}

					Log.apiLogger.info(Chalk.black('Auth loaded'));
					Log.apiLogger.info(Chalk.black('Plugins loaded'));
					Log.apiLogger.info(Chalk.black('Routes loaded'));
					Log.apiLogger.info(Chalk.black('Server running at: ' + server.info.uri));
				})
			})
		})
	},
);




//
// //EXPORT
// module.exports = server;