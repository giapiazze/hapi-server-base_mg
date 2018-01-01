const Gulp = require('gulp');
const Exit = require('gulp-exit');
const Q = require('q');
const DB = require('../../config/mongoose-init');
const Config = require('../../config/config');
const Users = require('../seeders/data/01-user_data');
const Realms = require('../seeders/data/02-realm_data');
const Roles = require('../seeders/data/03-role_data');
const Log = require('../../utilities/logging/logging');
const Chalk = require("chalk");
const _ = require('lodash');
const HandlerHelper = require('../../utilities/handler/handler-helper');

Gulp.task('seed', function() {
	let realms = [];
	let roles = [];
	let users = [];
	let realmRoleUsers = [];

	dropCollections()
		.then(function () {
			return HandlerHelper.create(DB.models.Realm, Realms);
		})
		.then(function (result) {
			realms = result;
			realms.forEach(function(item, index) {
				Log.apiLogger.info(Chalk.blue(index + '(obj): ' + JSON.stringify(item)));
			});
			return HandlerHelper.create(DB.models.Role, Roles);
		})
		.then(function (result) {
			roles = result;
			roles.forEach(function (item, index) {
				Log.apiLogger.info(Chalk.blue(index + '(obj): ' + JSON.stringify(item)));
			});
			return HandlerHelper.create(DB.models.User, Users);
		})
		.then(function (result) {
			users = result;
			users.forEach(function (item, index) {
				Log.apiLogger.info(Chalk.blue(index + '(obj): ' + JSON.stringify(item)));
			});

			const array = [
				{realm: realms[0]._id, role: roles[1]._id, user: users[0]._id},
				{realm: realms[0]._id, role: roles[2]._id, user: users[1]._id},
				{realm: realms[0]._id, role: roles[0]._id, user: users[2]._id},
				{realm: realms[1]._id, role: roles[1]._id, user: users[0]._id},
				{realm: realms[1]._id, role: roles[1]._id, user: users[2]._id},
				{realm: realms[2]._id, role: roles[1]._id, user: users[0]._id},
				{realm: realms[2]._id, role: roles[1]._id, user: users[1]._id},
				{realm: realms[2]._id, role: roles[2]._id, user: users[2]._id},
			];

			return HandlerHelper.create(DB.models.RealmRoleUser, array);
		})
		.then(function (result) {
				realmRoleUsers = result;
				realmRoleUsers.forEach(function(item, index) {
					Log.apiLogger.info(Chalk.blue(index + '(obj): ' + JSON.stringify(item)));
				});
		});


});

function dropCollections() {
	Log.gulpLogger.info('Unseed DB');
	let deferred = Q.defer();

	DB.models.User.remove({})
		.then(function() {
			Log.gulpLogger.info(Chalk.cyan('Realms removed'));
			return DB.models.Realm.remove({});
		})
		.then(function() {
			Log.gulpLogger.info(Chalk.cyan('Roles removed'));
			return DB.models.Role.remove({});
		})
		.then(function() {
			Log.gulpLogger.info(Chalk.cyan('RealmRoleUsers removed'));
			return DB.models.RealmRoleUser.remove({});
		})
		.then(function() {
			Log.gulpLogger.info(Chalk.cyan('Users removed'));
			deferred.resolve();
		})
		.catch(function (error) {
			Log.gulpLogger.error(Chalk.red(error));
			return Gulp.src("")
				.pipe(Exit());
		});

	return deferred.promise;
}
