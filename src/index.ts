import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import createPrismaClient from './utils/db.js';
import setupGraphQL from './routes/graphQL.routes.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import personnelRoutes from './routes/personnel.routes.js';
import materialRoutes from './routes/material.routes.js';
import materialTypeRoutes from './routes/material_type.routes.js';
import requisitionRoutes from './routes/requisition.routes.js';
import workplaceRoutes from './routes/workplace.routes.js';

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
app.use('/api/workplaces', workplaceRoutes);

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Initialize and start server
const startServer = async () => {
  try {
    // Connect Prisma
    await prisma.$connect();
    console.log('✓ Prisma connected');

    // Setup GraphQL Apollo Server
    const apolloServer = await setupGraphQL(app);
    console.log(`✓ Apollo Server ready at http://localhost:${PORT}/graphql`);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server ready at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
