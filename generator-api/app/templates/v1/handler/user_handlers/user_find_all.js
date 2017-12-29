const Boom = require('boom');
const URL = require('url');
const DB = require('../../../../../config/sequelize');
const QueryBase = require('../../../../../utilities/query/prepare_query');

const User = DB.User;


const UserFindAll =
	{
		userFindAll: function (request, reply) {
			let requestData = request.pre.requestData;

			// Calculating records total number
			let totalCount = 0;
			let filteredCount = 0;

			let queryFilters = QueryBase.filters(requestData.queryData);
			let countQueryFilters = QueryBase.countFilters(requestData.queryData);

			request.server.log('info', 'queryFilters: ' + JSON.stringify(queryFilters));

			if (requestData.queryData.count) {
				User
					.count()
					.then(function (totCount) {
						if (totCount.isNaN) {
							return reply(Boom.badRequest('Impossible to count'));
						}
						totalCount = totCount;
						User
							.count(countQueryFilters)
							.then(function (fltCount) {
								if (fltCount.isNaN) {
									return reply(Boom.badRequest('Impossible to count'));
								}
								return reply({
									totalCount: totalCount,
									filteredCount: fltCount
								});
							})
					})
					.catch(function (error) {
						let errorMsg = error.message || 'An error occurred';
						return reply(Boom.gatewayTimeout(errorMsg));
					});
			} else if (requestData.queryData.minFlag) {
				User
					.count()
					.then(function (totCount) {
						if (totCount.isNaN) {
							return reply(Boom.badRequest('Impossible to count'));
						}
						totalCount = totCount;
						User
							.count(countQueryFilters)
							.then(function (fltCount) {
								if (fltCount.isNaN) {
									return reply(Boom.badRequest('Impossible to count'));
								}
								User
									.min(requestData.queryData.min,
										{
											where: requestData.queryData.filter,
										})
									.then(function (count) {
										if (count.isNaN) {
											return reply(Boom.badRequest('Impossible to count'));
										}
										let replyObject = {
											totalCount: totalCount,
											filteredCount: fltCount,
										};
										replyObject[requestData.queryData.min + 'Min'] = count;
										return reply(replyObject);
									})
							})
					})
					.catch(function (error) {
						let errorMsg = error.message || 'An error occurred';
						return reply(Boom.gatewayTimeout(errorMsg));
					});
			} else if (requestData.queryData.maxFlag) {
				User
					.count()
					.then(function (totCount) {
						if (totCount.isNaN) {
							return reply(Boom.badRequest('Impossible to count'));
						}
						totalCount = totCount;
						User
							.count(countQueryFilters)
							.then(function (fltCount) {
								if (fltCount.isNaN) {
									return reply(Boom.badRequest('Impossible to count'));
								}
								User
									.max(requestData.queryData.max,
										{
											where: requestData.queryData.filter,
										})
									.then(function (count) {
										if (count.isNaN) {
											return reply(Boom.badRequest('Impossible to count'));
										}
										let replyObject = {
											totalCount: totalCount,
											filteredCount: fltCount,
										};
										replyObject[requestData.queryData.max + 'Max'] = count;
										return reply(replyObject);
									})
							})
					})
					.catch(function (error) {
						let errorMsg = error.message || 'An error occurred';
						return reply(Boom.gatewayTimeout(errorMsg));
					});
			} else if (requestData.queryData.sumFlag) {
				User
					.count()
					.then(function (totCount) {
						if (totCount.isNaN) {
							return reply(Boom.badRequest('Impossible to count'));
						}
						totalCount = totCount;
						User
							.count(countQueryFilters)
							.then(function (fltCount) {
								if (fltCount.isNaN) {
									return reply(Boom.badRequest('Impossible to count'));
								}
								User
									.sum(requestData.queryData.sum,
										{
											where: requestData.queryData.filter,
										})
									.then(function (sum) {
										if (sum.isNaN) {
											return reply(Boom.badRequest('Impossible to count'));
										}
										let replyObject = {
											totalCount: totalCount,
											filteredCount: fltCount,
										};
										replyObject[requestData.queryData.sum + 'Sum'] = sum;
										return reply(replyObject);
									})
							})
					})
					.catch(function (error) {
						let errorMsg = error.message || 'An error occurred';
						return reply(Boom.gatewayTimeout(errorMsg));
					});
			} else {
				User
					.count()
					.then(function (totCount) {
						if (totCount.isNaN) {
							return reply(Boom.badRequest('Impossible to count'));
						}
						totalCount = totCount;
						User
							.count(countQueryFilters)
							.then(function (fltCount) {
								if (fltCount.isNaN) {
									return reply(Boom.badRequest('Impossible to count'));
								}
								filteredCount = fltCount;
								// User.findAll({
								// 	// attributes: ['id','username'],
								// 	include: [{
								// 		association: 'RealmsRolesUsers',
								// 		// attributes: ['id', 'realmId', 'roleId', 'userId'],
								// 		include: [{
								// 			association: 'Role',
								// 			// attributes: ['id','name'],
								// 		}, {
								// 			association: 'Realm',
								// 			// attributes: ['id','name'],
								// 		}]
								// 	}],
								// })
								// User.findAll({
								// 	attributes: ['id','username'],
								// 	include: [{
								// 		model: DB.Role,
								// 		attributes: ['id','name'],
								// 	}, {
								// 		model: DB.Realm,
								// 		attributes: ['id','name'],
								// 	}],
								// })
								// User.findAll({
								// 	attributes: ['id', 'username'],
								// 	// includeIgnoreAttributes: false,
								// 	include: [{
								// 		association: 'Roles',
								// 		where: {name: 'SuperAdmin'}
								// 	}],
								// 	// group : ['User.id'],
								// 	limit: 10,
								// 	offset: 0,
								// })
								// User.findAll({
								// 	attributes: attributes2,
								// 	includeIgnoreAttributes: false,
								// 	include: [{
								// 		association: 'Roles',
								// 		attributes: [],
								// 		duplicating: false,
								// 	}],
								// 	group: ['User.id'],
								// 	limit: 10,
								// 	offset: 0,
								// })
								User
									.findAll(queryFilters)
									.then(function (result) {
										// if (result.count.isNaN) {
										// 	return reply(Boom.badRequest('Impossible to count'));
										// }
										// filteredCount = result.count;
										if (!result) {
											return reply(Boom.badRequest('No users'));
										}

										let mapper = {
											meta: {
												totalCount: totalCount,
												filteredCount: filteredCount,
												page: requestData.queryData.pagination.page,
												pageCount: Math.floor(totalCount / requestData.queryData.pagination.pageSize) + 1,
												pageSize: requestData.queryData.pagination.pageSize,
												rowCount: result.length,
											},
											data: result,
										};
										return reply(mapper);

									})
							})
					})
					.catch(function (error) {
						let errorMsg = error.message || 'An error occurred';
						return reply(Boom.gatewayTimeout(errorMsg));
					});
			}
		}
	};

module.exports = UserFindAll;