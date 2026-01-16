import 'dotenv/config'
import Fastify from 'fastify'

const app = Fastify({
  logger: true
})

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