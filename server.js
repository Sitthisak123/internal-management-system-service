import 'dotenv/config'
import Fastify from 'fastify'
import prismaPlugin from './src/utils/prismaPlugin.ts'

const app = Fastify({
  logger: true
})
app.register(prismaPlugin)

// Declare a route
app.get('/', async function handler(request, reply) {
  const users = await app.prisma.user.findFirst()

  return { hello: 'world', users }
})

// Run the server!
try {
  await app.listen({ port: 3000 })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}