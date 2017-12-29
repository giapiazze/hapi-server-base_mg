const Mongoose = require('mongoose');
const Dotenv = require('dotenv');
const FS = require('fs');
const _ = require('lodash');

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

Mongoose.connect(Config.url);

let modelFiles = getFiles('api');

modelFiles.forEach(function(modelFile){
	if (modelFile.name === 'User') {
		let model = require(modelFile.path);
		Mongoose.model(modelFile.name, model(Mongoose));
		let schema = require(modelFile.schema);
		Mongoose[schema.name] = schema;
	}
});

module.exports = Mongoose;
