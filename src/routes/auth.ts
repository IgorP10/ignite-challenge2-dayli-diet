import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../env'

export async function authRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const loginBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = loginBodySchema.parse(request.body)

    // Check if email exists in database
    const user = await knex('users').where('email', email).first()

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: true,
        message: 'Invalid email or password',
      })
    }

    // Match password
    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return reply.status(401).send({ message: 'Invalid email or password' })
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '1h',
    })

    return reply.status(200).send({ success: true, error: false, token })
  })
}
