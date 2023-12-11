import fastify from 'fastify'
import { knex } from './database'

export const app = fastify()

app.get('/hello', async () => {
  const tables = await knex('sqlite_schema').select('*')

  return tables
})
