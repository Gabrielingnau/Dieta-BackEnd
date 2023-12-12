import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createTramsactiomBodySchema = z.object({
      name: z.string(),
    })

    const body = createTramsactiomBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 7, // 7 days
      })
    }

    const { name } = body

    await knex('users').insert({
      id: randomUUID(),
      name,
      sessionId,
    })
  })
  app.get('/', async (request, response) => {
    const { sessionId } = request.cookies
    const selectUserId = await knex('diet').where('userId', sessionId).select()

    const quantidade = selectUserId.length

    return { selectUserId, quantidade }
  })
  app.get('/summary', async (request, reply) => {
    const { sessionId } = request.cookies

    const user = await knex('users').first().where({ session_id: sessionId })

    const totalMeals = await knex('meal')
      .count()
      .where({ user_id: user?.id })
      .then((data) => Number(data[0].count))

    const mealsInDiet = await knex('meal')
      .count()
      .where({ is_diet: true, user_id: user?.id })
      .then((data) => Number(data[0].count))

    const mealsOutOfDiet = await knex('meal')
      .count()
      .where({ is_diet: false, user_id: user?.id })
      .then((data) => Number(data[0].count))

    const bestDietSequence = await knex('meal')
      .select('*')
      .where({ user_id: user?.id })
      .orderBy('meal_datetime', 'desc')
      .then((meals) => {
        let bestDietSequence = 0
        let currentBestDietSequence = 0

        meals.forEach((meal) => {
          if (meal.is_diet) {
            currentBestDietSequence++
            if (currentBestDietSequence > bestDietSequence) {
              bestDietSequence = currentBestDietSequence
            }
          } else {
            if (currentBestDietSequence > bestDietSequence) {
              bestDietSequence = currentBestDietSequence
            }
            currentBestDietSequence = 0
          }
        })

        return bestDietSequence
      })

    const summary = {
      total_meals: totalMeals,
      meals_in_diet: mealsInDiet,
      meals_out_of_diet: mealsOutOfDiet,
      best_diet_sequence: bestDietSequence,
    }

    return reply.status(200).send({ summary })
  })
}
