export async function up(knex) {
  await knex.schema.createTable('todos', (t) => {
    t.increments('id').primary();
    t.string('title', 255).notNullable();
    t.boolean('done').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
}
export async function down(knex) {
  await knex.schema.dropTableIfExists('todos');
}
