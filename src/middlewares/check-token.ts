import { FastifyReply, FastifyRequest } from 'fastify'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { env } from '../env'
import '../../custom.d.ts'

interface DecodedToken extends JwtPayload {
  userId: string
}

export async function checkToken(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization

  if (!token) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const decodedToken = jwt.verify(token, env.JWT_SECRET) as DecodedToken
    const userId = decodedToken.userId

    request.userId = userId
  } catch (error) {
    return reply.status(401).send({ message: 'Invalid Token' })
  }
}
