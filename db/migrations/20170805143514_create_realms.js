
exports.up = function(knex, Promise) {
	return knex.schema.createTable('realms', function(tbl) {
		tbl.increments('id').primary();
		tbl.string('name', 64).notNullable();
		tbl.string('description').nullable();

		// DB Validation
		tbl.unique(['name']);

		// Timestamp
		tbl.timestamp('createdAt').defaultTo(knex.fn.now());
		tbl.timestamp('updatedAt').defaultTo(knex.fn.now());
		tbl.timestamp('deletedAt').nullable();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema
		.dropTable('realms')
};

// Spiegazioni
// La definizione della Kiave Primaria si fa solo durante la creazione della tabella
//
// La costrizione notNullable è solo un promemoria in quanto è ben gestito da Bookshelf
// Book e Joi durante il transito del dato in Hapi
//
// Il nullable, idem, promemoria, anche inutile in quanto lo sono tutti di default!!
//
// I valori di default dei tre timestamp ignoro se siano necessari, quindi la loro
// presenza potrebbe ribadire solo ciò che Bookshelf fa in autonomia. Qui mi servono,
// oltre che come promemoria, anche come valore di default durante la "semina"
//
// Bookshelf non può validare la UNICITA' di un attributo durante l'inserimento
// quindi tale costrizione si impone al DB fa durante la creazione della tabella mediante
// array di attributi che DEVONO essere unici.
