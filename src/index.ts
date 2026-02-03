import 'dotenv/config'
import express from 'express'
import createprismaClient from './utils/db.js'

const prisma = createprismaClient()
const app = express()
app.use(express.json())

app.get('/test', async (req, res) => {
  try {
    const status = await prisma.personnel.create({
      data: {
        fullname: "John Doe",
        position: "Software Engineer",
      },
    })
    res.json(status)
  } catch (e: any) {
    if (e.code === 'P2002') {
      return res.status(400).json({ error: `Duplicate ${e.meta.driverAdapterError.cause.constraint.fields.join(', ')} detected on ${e.meta.modelName}` })
    } else {
      console.error(e)
    }
    res.status(500).json({ error: String(e) })
  }
})

app.listen(3000, async () => {
  await prisma.$connect()
  console.log('🚀 Server ready at http://localhost:3000')
})
