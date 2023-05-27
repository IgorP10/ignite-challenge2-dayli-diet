import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as crypto from 'crypto'
import { knex } from '../database'
import { format } from 'date-fns'
import { checkToken } from '../middlewares/check-token'
import {
  getTotalMealCount,
  getDietMealCount,
  getNonDietMealCount,
  getBestDietSequence,
} from '../services/metricsService'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkToken)

  // TODO: Get meals
  app.get('/', async (request, reply) => {
    const meals = await knex('meals')
      .select('*')
      .where('user_id', request.userId)

    return reply.status(200).send({ meals })
  })

  // TODO: Get meal by id
  app.get('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .select('*')
      .where('user_id', request.userId)
      .andWhere('id', id)
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found' })
    }

    return reply.status(200).send({ meal })
  })

  // TODO: Add or Edit meal
  app.post('/', async (request, reply) => {
    const DateTimeSchema = z
      .string()
      .refine((value) => {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
        return regex.test(value)
      }, 'Invalid date and time format')
      .transform((value) => {
        const date = new Date(value)
        return format(date, 'yyyy-MM-dd HH:mm:ss')
      })

    const createMealBodySchema = z.object({
      id: z.string().uuid().nullable(),
      name: z.string(),
      description: z.string(),
      dateAndTimeOfMeal: DateTimeSchema,
      fromDiet: z.boolean(),
    })

    const { id, name, description, dateAndTimeOfMeal, fromDiet } =
      createMealBodySchema.parse(request.body)

    if (id) {
      const meal = await knex('meals')
        .select('*')
        .where('user_id', request.userId)
        .andWhere('id', id)
        .first()

      if (!meal) {
        return reply.status(404).send({ message: 'Meal not found' })
      }

      await knex('meals')
        .where('id', id)
        .update({
          name,
          description,
          date_and_time_of_meal: knex.raw('?', [dateAndTimeOfMeal]),
          from_diet: fromDiet,
          updated_at: knex.fn.now(),
        })

      return reply.status(200).send({ message: 'Meal updated successfully' })
    }

    await knex('meals').insert({
      id: crypto.randomUUID(),
      name,
      description,
      date_and_time_of_meal: knex.raw('?', [dateAndTimeOfMeal]),
      user_id: request.userId,
      from_diet: fromDiet,
    })

    return reply.status(201).send({ message: 'Meal created successfully' })
  })

  // TODO: Delete meal
  app.delete('/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .select('*')
      .where('user_id', request.userId)
      .andWhere('id', id)
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found' })
    }

    await knex('meals').where('id', id).del()

    return reply.status(200).send({ message: 'Meal deleted successfully' })
  })

  app.get('/metrics', async (request, reply) => {
    const userId = request.userId

    try {
      const totalMealCount = await getTotalMealCount(userId)
      const dietMealCount = await getDietMealCount(userId)
      const nonDietMealCount = await getNonDietMealCount(userId)
      const bestDietSequence = await getBestDietSequence(userId)

      return reply.status(200).send({
        totalMealCount,
        dietMealCount,
        nonDietMealCount,
        bestDietSequence,
      })
    } catch (error) {
      return reply.status(500).send({ message: 'Error retrieving metrics' })
    }
  })
}
