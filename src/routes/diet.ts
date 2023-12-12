import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { z } from 'zod'

const getDietPramsSchema = z.object({
  id: z.string().uuid(),
})

const createDietBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  role: z.enum(['dentro', 'fora']),
})

export async function dietRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const body = createDietBodySchema.parse(request.body)
    const { name, description, role } = body
    const { sessionId } = request.cookies

    await knex('diet').insert({
      id: randomUUID(),
      name,
      description,
      role,
      userId: sessionId,
    })
  })
  app.patch('/:id', async (request, response) => {
    const body = createDietBodySchema.parse(request.body)
    const { name, description, role } = body

    const { sessionId } = request.cookies

    const { id } = getDietPramsSchema.parse(request.params)

    const mail = await knex('diet').where({ id }).first()

    mail.id = id
    mail.userId = sessionId
    mail.name = name ?? mail.name
    mail.description = description ?? mail.description
    mail.role = role ?? mail.role

    await knex('diet').where('id', id).update(mail)

    return { mail }
  })

  app.delete('/:id', async (request, response) => {
    const { id } = getDietPramsSchema.parse(request.params)

    await knex('diet').where({ id }).delete()

    return response.send('Deletado com sucesso')
  })

  app.get('/:id', async (request, response) => {
    const { id } = getDietPramsSchema.parse(request.params)

    const mailSelect = await knex('diet').where({ id })

    return { mailSelect }
  })
  app.get('/dentroFora', async (request, response) => {
    const dentro = await knex('diet').where('role', 'dentro')
    const fora = await knex('diet').where('role', 'fora')

    return { dentro, fora }
  })
}
