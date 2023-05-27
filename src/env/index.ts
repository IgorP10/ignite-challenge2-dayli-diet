import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.APP_MODE === 'test') {
  config({ path: '.env.test' })
}

if (process.env.APP_MODE !== 'test') {
  config()
}

const envSchema = z.object({
  APP_MODE: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_CLIENT: z.enum(['pg', 'sqlite']).default('sqlite'),
  DATABASE_URL: z.string(),
  APP_PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data
