const Boom = require('boom');
const _ = require('lodash');

const DB = require('../../../../../config/sequelize');
const PreHandlerBase = require('../../../../pre_handler_base');
const UserValidation = require('../../../model/user_validations');

const User = DB.User;

const UserPre = [
	{
		assign: 'requestData',
		method: function (request, reply) {

			let referenceModel = UserValidation;

			let requestData = {
				resourceType: 'users',
				queryData: {
					fields: [],
					filter: {},
					sort: [],
					pagination: {},
					count: false,
					include: [],
					group: [],
					withCountFlag: false,
					min: '',
					minFlag: false,
					max: '',
					maxFlag: false,
					sum: '',
					sumFlag: false,
					error: {},
				}
			};

			// requestData.queryData.fields = ['id'];

			let queryUrl = request.query;
			let error = requestData.queryData.error;

			Object.keys(queryUrl).map((e) => {
				if (!Object.keys(error).length > 0) {
					// Filters
					if (referenceModel.filters.hasOwnProperty(e)) {
						if (_.isString(queryUrl[e]) || _.isBoolean(queryUrl[e])) {
							let tmp = [];
							tmp.push(queryUrl[e]);
							queryUrl[e] = tmp;
						}
						requestData = PreHandlerBase.filterParser(requestData, e, queryUrl[e], User);
					}
				}

				if (!Object.keys(error).length > 0) {
					// SORT
					if (referenceModel.sort.hasOwnProperty(e)) {
						if (_.isString(queryUrl[e])) {
							let tmp = [];
							tmp.push(queryUrl[e]);
							queryUrl[e] = tmp;
						}
						requestData = PreHandlerBase.sortParser(requestData, queryUrl[e], User);
					}
				}

				if (!Object.keys(error).length > 0) {
					// MATH Operations
					if (referenceModel.math.hasOwnProperty(e)) {
						requestData = PreHandlerBase.mathParser(requestData, e, queryUrl[e], User);
					}
				}

				if (!Object.keys(error).length > 0) {
					// Extra
					if (referenceModel.extra.hasOwnProperty(e)) {
						if (e === 'count') {
							requestData.queryData.count = queryUrl[e];
						} else if (_.isString(queryUrl[e])) {
							let tmp = [];
							tmp.push(queryUrl[e]);
							queryUrl[e] = tmp;
							requestData = PreHandlerBase.extraParser(requestData, e, queryUrl[e], User);
						} else {
							requestData = PreHandlerBase.extraParser(requestData, e, queryUrl[e], User);
						}
					}
				}
			});

			let found = false;
			Object.keys(User.attributes).map((attr) => {
				if (_.includes(requestData.queryData.fields, attr)) {
					found = true;
				}
			});

			if (found === false) {
				Object.keys(User.attributes).map((attr) => {
					requestData.queryData.fields.push(attr);
				});
			}

			_.remove(requestData.queryData.fields, function(el) {
				return el === 'password';
			});


			if (Object.keys(error).length > 0) {
				return reply(Boom.badRequest(requestData.queryData.error.message));
			} else {
				// Pagination
				let page = parseInt(queryUrl['page']) || 1;
				let pageSize = parseInt(queryUrl['pageSize']) || 10;
				requestData.queryData.pagination['offset'] = pageSize * (page - 1);
				requestData.queryData.pagination['limit'] = pageSize;
				requestData.queryData.pagination['pageSize'] = pageSize;
				requestData.queryData.pagination['page'] = page;
				request.server.log('info', 'RequestData: ' + JSON.stringify(requestData));
				return reply(requestData);
			}
		}
	},
];


module.exports = UserPre;