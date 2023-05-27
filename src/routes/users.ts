import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as crypto from 'crypto'
import { knex } from '../database'
import { hash } from 'bcrypt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
      phone: z.string(),
    })

    const { name, email, password, phone } = createUserBodySchema.parse(
      request.body,
    )

    // Check if email is already in use
    const existingUser = await knex('users').where('email', email).first()

    if (existingUser) {
      return reply.status(400).send({ message: 'Email is already in use' })
    }

    // Hash of password
    const hashedPassword = await hash(password, 10)

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      phone,
    })

    return reply.status(201).send({ message: 'User created successfully' })
  })
}
