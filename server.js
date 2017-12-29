const Hapi = require('hapi');

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
			server.log('error', 'Failed to register auth: ' + err);
		}

		// Plugins
		server.register(Plugins, (err) => {
			if (err) {
				server.log('error', 'Failed to load plugin:' + err);
			}

			// Routes
			server.register(Routes, (err) => {
				if (err) {
					server.log('error', 'Failed to register routes: ' + err);
				}

				// Start the server
				server.start((err) => {

					if (err) {
						throw err;
					}

					server.log('info', 'Auth loaded');
					server.log('info', 'Plugins loaded');
					server.log('info', 'Routes loaded');
					server.log('info', 'Server running at: ' + server.info.uri);
				})
			})
		})
	},
);




//
// //EXPORT
// module.exports = server;