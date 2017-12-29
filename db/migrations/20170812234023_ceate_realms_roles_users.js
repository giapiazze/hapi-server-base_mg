
exports.up = function(knex, Promise) {
	return knex.schema.createTable('realms_roles_users', function(tbl) {
		tbl.increments('id').primary();

		// Foreign Keys
		tbl.integer('realmId')
			.unsigned()
			.notNullable()
			.references('realms.id');
		tbl.integer('roleId')
			.unsigned()
			.notNullable()
			.references('roles.id');
		tbl.integer('userId')
			.unsigned()
			.notNullable()
			.references('users.id');

		// DB Validation
		tbl.unique(['realmId', 'roleId', 'userId']);

		// Timestamp
		tbl.timestamp('createdAt').defaultTo(knex.fn.now());
		tbl.timestamp('updatedAt').defaultTo(knex.fn.now());
		tbl.timestamp('deletedAt').nullable();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema
		.dropTable('realms_roles_users');
};

// La tabella di JOIN tripla per realizzare la N-N-N così strutturata dovrebbe
// sia essere una tabella pivot "normale" di quelle che ci sono ma non si maneggiano
// sia una tabella maneggiabile da modello di Bookshelf in maniera tale da poter
// utilizzare la funzione "through" di Bookshelf. La doppia modalità di utilizzo
// perché ancora non so bene come aggiornare il suo contenuto...peggio la cancellazione!!!