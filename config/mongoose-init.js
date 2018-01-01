const Mongoose = require('mongoose');
const Q = require('q');
const Dotenv = require('dotenv');
const FS = require('fs');
const _ = require('lodash');
const Log = require('./../utilities/logging/logging');
const Chalk = require("chalk");

const Env       = process.env.NODE_ENV || 'development';
const Config    = require('../config/database')[Env];

Dotenv.config({ silent: true });

let getFiles = function(dir, fileList = []) {

	let	files = FS.readdirSync(dir);
	files.forEach(function(file) {
		if (FS.statSync(dir + '/' + file).isDirectory()) {
			getFiles(dir + '/' + file, fileList);
		}
		else if (_.includes(file, '_model.js')) {
			let schema = _.replace(file, '_model.js', '_schema.js');
			let tmp = {};
			tmp.name = _.upperFirst(_.camelCase(_.replace(file, '_model.js', '')));
			tmp.path = '../' + dir + '/' + file;
			tmp.schema = '../' + dir + '/' + schema;
			fileList.push(tmp);
		}
	});
	return fileList;
};

Mongoose.Promise = Q.Promise;
Mongoose.connect(Config.url);

let modelFiles = getFiles('api');

modelFiles.forEach(function(modelFile){
	let model = require(modelFile.path);
	Mongoose.model(modelFile.name, model(Mongoose));
	let schema = require(modelFile.schema);
	Mongoose[schema.name] = schema;
});

Object.keys(Mongoose.models).map((model) => {
	Log.mongooseLogger.info(Chalk.cyan(model + ' Initialized'));
});

let user = new Mongoose.models.User({firstName: 'Giacomo', lastName: 'Piazzesi'});
let realm = new Mongoose.models.Realm({name: 'WebApp', description: 'Web App Realm'});

module.exports = Mongoose;
