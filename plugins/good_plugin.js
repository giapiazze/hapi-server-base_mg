const Good = require('good');

const Options = {
	reporters: {
		myConsoleReporter: [
			{
				module: 'good-squeeze',
				name: 'Squeeze',
				args: [{log: '*', request: '*', response: '*'}]
			}, {
				module: 'good-console'
			}, 'stdout'],
		myFileReporter: [
			{
				module: 'good-squeeze',
				name: 'Squeeze',
				args: [{log: 'user', request: '*', response: '*'}]
			}, {
				module: 'good-squeeze',
				name: 'SafeJson'
			}, {
				module: 'good-file',
				args: ['./log/good_log.log']
			}]
	},
};

const GoodPack = {
	register: Good,
	options: Options
};

module.exports = GoodPack;