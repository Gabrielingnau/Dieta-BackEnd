import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diet', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table
      .enum('role', ['dentro', 'fora'], {
        useNative: true,
        enumName: 'roles',
      })
      .notNullable()
      .defaultTo('dentro')
    table
      .integer('userId')
      .references('sessionId')
      .inTable('users')
      .onDelete('CASCADE')
    table.timestamp('creatd_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diet')
}
