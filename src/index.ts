import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import createPrismaClient from './utils/db.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import personnelRoutes from './routes/personnel.routes.js';
import materialRoutes from './routes/material.routes.js';
import materialTypeRoutes from './routes/material_type.routes.js';
import requisitionRoutes from './routes/requisition.routes.js';

const prisma = createPrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/material-types', materialTypeRoutes);

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`Server ready at http://localhost:${PORT}`);
});
