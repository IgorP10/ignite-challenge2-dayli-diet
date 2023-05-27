import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.APP_PORT,
  })
  .then(() => {
    console.log('Server is running 🚀')
  })
