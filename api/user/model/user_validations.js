const Joi = require('joi');
const DB = require('../../../config/mongoose-init');
const ValidationBase = require('../../../utilities/validation/validation_utility');
const SchemaUtility = require('../../../utilities/schema/schema_utility');
const QueryHelper = require('../../../utilities/query/query-helper');

const User = DB.models.User;
const FLRelations = SchemaUtility.relationsFromSchema(User.modelName, 1, 1);
const SLRelations = SchemaUtility.relationsFromSchema(User.modelName, 2, 2);
const ALLRelations = SchemaUtility.relationsFromSchema(User.modelName, 1, 2);
const Attributes = QueryHelper.createAttributesFilter({}, User);

const filters = {
	_id: Joi.alternatives().try(
		Joi.array().items(
			Joi.string().regex(ValidationBase.filterRegExp())
				.example('{<=}35'),
			Joi.number().integer().min(1)
				.example(35)
		).description('the user ID PK increment: [{=}]1 vs [{>}1,{<>}20,{<=}100]')
			.example(['{>}35', '{<}50']),
		Joi.string().regex(ValidationBase.filterRegExp())
			.example('{in}35,40'),
		Joi.number().integer().min(1)
			.example(40),
	),
	username: Joi.alternatives().try(
		Joi.array().items(
			Joi.string().min(3).regex(ValidationBase.filterRegExp())
				.example('{like}luigi.rossi'),
		).description('the username: name vs [{=}pippo1,{<>}pippo3,{like}pip]')
			.example(['{like}rossi', '{like}bianchi']),
		Joi.string().min(3).regex(ValidationBase.filterRegExp())
			.example('{<>}luigi.rossi,marco.tardelli-gobbo'),
	),
	email: Joi.alternatives().try(
		Joi.array().items(
			Joi.string().max(255).regex(ValidationBase.filterRegExp())
				.example('{=}luigi.rossi@eataly.it'),
			Joi.string().max(255)
				.example('{like}eataly.it'),
		).description('the user email: name vs [{=}pippo1@lol.it,{<>}pippo3@lol.it,{like}pip]')
			.example(['{like}rossi.it', '{like}verdi.it']),
		Joi.string().max(255).regex(ValidationBase.filterRegExp())
			.example('{<>}luigi.rossi@eataly.it'),
		Joi.string().email(),
	),
	firstName: Joi.alternatives().try(
		Joi.array().items(
			Joi.string().min(3).regex(ValidationBase.filterRegExp())
				.example('{like}Luigi'),
		).description('the first name: name vs [{=}Luigi,{<>}Gino,{like}olo]')
			.example(['{like}Luigi', '{like}Luigi']),
		Joi.string().min(3).regex(ValidationBase.filterRegExp())
			.example('{<>}Mario,Marco'),
	),
	lastName: Joi.alternatives().try(
		Joi.array().items(
			Joi.string().min(3).regex(ValidationBase.filterRegExp())
				.example('{like}Rossi'),
		).description('the last name: last name vs [{=}Rossi,{<>}Bianchi,{like}ini]')
			.example(['{like}Bossi', '{like}Bianchi']),
		Joi.string().min(3).regex(ValidationBase.filterRegExp())
			.example('{<>}Rossi,Tardelli'),
	),
	isActive: Joi.alternatives().try(
		Joi.array().description('the user active: true, [true, false]')
			.items(Joi.boolean().valid(true, false)),
		Joi.boolean().description('the user active: true, [true, false]').valid(true, false)
	),
	deleted: Joi.alternatives().try(
		Joi.array().description('the user is deleted: true, [true, false]')
			.items(Joi.boolean().valid(true, false)),
		Joi.boolean().description('the user is deleted: true, [true, false]').valid(true, false)
	),
	createdAt: Joi.alternatives().try(
		Joi.array().description('the creation date: 2017-08-15[ 09:00:00] vs [{btw}2017-08-17 09:00:00,2017-08-17 23:30:00]')
			.items(Joi.string().max(255)
				.regex(ValidationBase.filterRegExp('date')))
			.example(['{>=}2017-08-01', '{<}2017-09-01']),
		Joi.string().max(255).regex(ValidationBase.filterRegExp())
			.example('{=}2017-08-17 10:00:00'),
	),
	updatedAt: Joi.alternatives().try(
		Joi.array().items(
			Joi.string().max(255).regex(ValidationBase.filterRegExp())
				.example('{=}2017-08-17 10:00:00'),
		).description('the update date: [{=}]2017-08-15[ 09:00:00] vs [{btw}2017-08-17 09:00:00,2017-08-17 23:30:00]')
			.example(['{>=}2017-08-01', '{<}2017-09-01']),
		Joi.string().max(255).regex(ValidationBase.filterRegExp('date'))
			.example('2017-08-17 10:00:00'),
	),
	deletedAt: Joi.alternatives().try(
		Joi.array().items(
			Joi.string().max(255).regex(ValidationBase.filterRegExp())
				.example('{=}2017-08-17 10:00:00'),
		).description('the delete date: 2017-08-15 09:00:00 vs [{btw}2017-08-17 09:00:00,2017-08-17 23:30:00]')
			.example(['{>}2017-08-17 10:00:00', '{<}2017-08-31 10:00:00']),
		Joi.string().max(255).regex(ValidationBase.filterRegExp())
			.example('2017-08-17 10:00:00'),
	),
};

const pagination = {
	$page: Joi.number().integer().min(1).description('page number')
		.default(1),
	$pageSize: Joi.number().integer().min(5).max(100).description('rows per page')
		.default(10),
};

const sort = {
	$sort: Joi.alternatives().try(
		Joi.array().description('sort column: [{user}][-]id,[{user}][-]username vs [-_id, username]')
			.items(
				Joi.string().max(255)
					.regex(ValidationBase.sortRegExp(User.modelName, FLRelations.split(',')))
					.example('-createdAt'))
			.example(['{user}-email','username']),
		Joi.string().max(255)
			.regex(ValidationBase.sortRegExp(User.modelName, FLRelations.split(',')))
			.example('-username'),
	),
};

const math = {
	$min:
		Joi.string().description('selected attribute MIN: {user}createdAt vs updatedAt]').max(255)
			.regex(ValidationBase.mathFieldRegExp(User.modelName, FLRelations.split(',')))
			.example('{user}createdAt'),
	$max:
		Joi.string().description('selected attribute MAX: {user}createdAt vs updatedAt]').max(255)
			.regex(ValidationBase.mathFieldRegExp(User.modelName, FLRelations.split(',')))
			.example('{user}updatedAt'),
	$sum:
		Joi.string().description('selected attribute SUM: {user}createdAt vs updatedAt]').max(255)
			.regex(ValidationBase.mathFieldRegExp(User.modelName, FLRelations.split(',')))
			.example('{user}deletedAt'),
};

const extra = {
	$count: Joi.boolean().description('only number of records found'),
	$fields: Joi.alternatives().try(
		Joi.array().description('selected attributes: [{user}id, [id, username, {user}email]')
			.items(
				Joi.string().max(255)
					.regex(ValidationBase.fieldRegExp(User.modelName, FLRelations.split(','))))
			.example(['{user}id','{user}username']),
		Joi.string().max(255)
			.regex(ValidationBase.fieldRegExp(User.modelName, FLRelations.split(',')))
			.example('{user}id')
	),
	$withFilter: Joi.alternatives().try(
		Joi.array().description('filter by relationships fields: {realmRoleUsers.role}[{or|not}]{name}[{=}], [{realmRoleUsers.realm}{not}{name}{like}]')
			.items(Joi.string().max(255)
				.regex(ValidationBase.withFilterRegExp(User.modelName, ALLRelations.split(','))))
			.example(['{realmRoleUsers.role}{id}{=}3','{realmRoleUsers.realm}{name}{like}App']),
		Joi.string().max(255)
			.regex(ValidationBase.withFilterRegExp(User.modelName, ALLRelations.split(',')))
			.example('{realmRoleUsers.role}{not}{description}{null}')
	),
	$withCount: Joi.alternatives().try(
		Joi.array().description('count relationships occurrences: realmRoleUsers.role, [realmRoleUsers.role, realmRoleUsers.realm]')
			.items(
				Joi.string().max(255)
					.regex(ValidationBase.withCountRegExp(User.modelName, ALLRelations.split(','))))
			.example(['realmRoleUsers.realm','realmRoleUsers.role']),
		Joi.string().max(255).description('relationships: realmRoleUsers.role, [realmRoleUsers.role, realmRoleUsers.realm]')
			.regex(ValidationBase.withCountRegExp(User.modelName, ALLRelations.split(',')))
			.example('realmRoleUsers.role')
	),
	$withRelated: Joi.alternatives().try(
		Joi.array().description('includes relationships: realmRoleUsers, [realmRoleUsers.role, realmRoleUsers.realm]')
			.items(
				Joi.string().max(255)
					.regex(ValidationBase.withRelatedRegExp(User.modelName, ALLRelations.split(','))))
			.example(['realmRoleUsers.realm','realmRoleUsers.role']),
		Joi.string().max(255)
			.regex(ValidationBase.withRelatedRegExp(User.modelName, ALLRelations.split(',')))
			.example('realmRoleUsers.realm'),
	),
	$withFields: Joi.alternatives().try(
		Joi.array().description('selects relationships fields: {realmRoleUsers.role}name, [{realmRoleUsers.realm}name,description]')
			.items(Joi.string().max(255)
				.regex(ValidationBase.withRelatedFieldRegExp(User.modelName, ALLRelations.split(','))))
			.example(['{realmRoleUsers.realm}name','{realmRoleUsers.role}id']),
		Joi.string().max(255)
			.regex(ValidationBase.withRelatedFieldRegExp(User.modelName, ALLRelations.split(',')))
			.example('{realmRoleUsers.role}name,description'),
	),
	$withSort: Joi.alternatives().try(
		Joi.array().description('sort related field: {realmRoleUsers.role}[+,-]id vs [-id, -name]')
			.items(Joi.string().max(255)
				.regex(ValidationBase.withSortRegExp(User.modelName, ALLRelations.split(','))))
			.example(['{realmRoleUsers.role}+name','{realmRoleUsers.realm}-description']),
		Joi.string().max(255)
			.regex(ValidationBase.withSortRegExp(User.modelName, ALLRelations.split(',')))
			.example('{realmRoleUsers.realm}description')
	),
};



const UserValidations = {
	filters: filters,
	pagination: pagination,
	sort: sort,
	math: math,
	extra: extra,
	query: Joi.object().keys(Object.assign({}, filters, pagination, sort, math, extra)),
	FLRelations: FLRelations,
	SLRelations: SLRelations,
	Attributes: Attributes,
};


module.exports = UserValidations;