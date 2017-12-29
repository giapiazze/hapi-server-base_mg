
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(tbl) {
  	tbl.increments();
	  tbl.string('username', 64).notNullable();
	  tbl.string('password', 128).notNullable();
  	tbl.string('email').notNullable();
	  tbl.boolean('isActive').notNullable().defaultTo(false);

	  // DB Validation
	  tbl.unique(['username']);
	  tbl.unique(['email']);

	  // Timestamp
	  tbl.timestamp('createdAt').defaultTo(knex.fn.now());
	  tbl.timestamp('updatedAt').defaultTo(knex.fn.now());
	  tbl.timestamp('deletedAt').nullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
