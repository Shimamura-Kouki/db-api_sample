export async function up(knex) {
  await knex.schema.alterTable('todos', (t) => {
    t.integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // ユーザー削除時にTODOも削除したいなら
  });
}

export async function down(knex) {
  await knex.schema.alterTable('todos', (t) => {
    t.dropColumn('user_id');
  });
}
