import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import cookie from '@fastify/cookie'
import { dietRoutes } from './routes/diet'
import knex from 'knex'

export const app = fastify()

app.register(cookie)
app.register(usersRoutes, {
  prefix: '/users',
})
app.register(dietRoutes, {
  prefix: '/users/diet',
})

app.get('/hello', async () => {
  const tables = await knex('sqlite_schema').select('*')

  return tables
})
