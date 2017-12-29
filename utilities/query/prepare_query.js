const _ = require('lodash');


const QueryBase = {
	filters: (queryData) => {

		let queryObject = {};

		if (queryData.fields.length > 0) {
			queryObject.attributes = queryData.fields;
		}

		if (_.includes(Object.keys(queryData), 'includeIgnoreAttributes')) {
			queryObject.includeIgnoreAttributes = queryData.includeIgnoreAttributes;
		}

		if (queryData.include.length > 0) {
			queryObject.include = queryData.include;
		}

		if (Object.keys(queryData.filter).length > 0) {
			queryObject.where = queryData.filter;
		}

		if (queryData.sort.length > 0) {
			queryObject.order = queryData.sort;
		}

		if (queryData.group.length > 0) {
			queryObject.group = queryData.group;
		}

		if (Object.keys(queryData.pagination).length > 0) {
			queryObject.limit = queryData.pagination.limit;
			queryObject.offset = queryData.pagination.offset;
		}

		return queryObject;
	},

	countFilters: (queryData) => {

		let queryObject = {};

		if (queryData.include.length > 0) {
			queryObject.include = queryData.include;
		}

		if (Object.keys(queryData.filter).length > 0) {
			queryObject.where = queryData.filter;
		}

		return queryObject;
	}


};

module.exports = QueryBase;