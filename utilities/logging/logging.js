const Logging = require('loggin');


module.exports = {
	apiLogger: Logging.getLogger('Api'),
	mongooseLogger: Logging.getLogger('Mongoose'),
	gulpLogger: Logging.getLogger('Gulp'),
};