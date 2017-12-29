const Joi = require('joi');

const filters = {
	id: Joi.alternatives().try(
		Joi.array().description('the model ID PK increment: 1, [1,2]')
      .items(Joi.number().integer().min(1)),
		Joi.number().integer().min(1)).description('the model ID PK increment: 1, [1,2]'),
	name: Joi.string().min(3).max(64).description('the model name'),
	realmId: Joi.number().integer().min(1).description('realm ID FK for Realm relationship'),
};

const pagination = {
	page: Joi.number().integer().min(1).description('page number')
    .default(1),
	pageSize: Joi.number().integer().min(5).max(100).description('rows per page')
    .default(10),
  withRelated: Joi.alternatives().try(
		Joi.array().description('relationships: users, [users, realm]')
      .items(Joi.string().valid('users','realm')),
    Joi.string().description('relationships: users, [users, realm]').valid('users','realm')),
	columns: Joi.alternatives().try(
		Joi.array().description('columns for select: id, [id, name]')
			.items(Joi.string().valid('id', 'name', 'roleId')),
		Joi.string().description('columns for select: id, [id, name]')
			.valid('id', 'name', 'roleId')),
};

const extra = {
	count: Joi.boolean().description('only number of records found'),
};

const sort = {
  sort: Joi.alternatives().try(
	  Joi.array().description('sort column: id, -id, [id, -name]')
		  .items(Joi.string()
        .valid('id', '-id', 'name', '-name', 'realmId', '-realmId')),
	  Joi.string().description('sort column: id, -id, [id, -name]')
		  .valid('id', '-id', 'name', '-name', 'realmId', '-realmId')),
};




const RoleValidations = {
	filters: filters,
	pagination: pagination,
	extra: extra,
  sort: sort,
	query: Joi.object().keys(Object.assign({}, filters, pagination, extra, sort)),
};


module.exports = RoleValidations;