import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { Express, json } from 'express';
import { ApolloServer } from '@apollo/server';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  AllResolvers,
  MaterialTypeType,
  MaterialType,
  UsersType,
  MrFormType,
  MrFormMaterialType,
  DelLogsType,
} from '../controllers/graphQL.controller';

export async function setupGraphQL(app: Express): Promise<ApolloServer> {
  // Build the GraphQL schema using TypeGraphQL
  const schema = await buildSchema({
    resolvers: AllResolvers,
    emitSchemaFile: './schema.graphql', // This will generate a schema.graphql file
  });

  // Create Apollo Server with the schema
  const server = new ApolloServer({
    schema,
    includeStacktraceInErrorResponses: true,
  });

  // Start the Apollo Server
  await server.start();

  // Create Apollo's middleware handler
  const handler = async (req: any, res: any) => {
    // Handle GET requests - return 405
    if (req.method === 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed. Use POST for GraphQL queries.' });
    }

    const body = req.body;

    if (!body) {
      return res.status(400).json({ error: 'Request body is empty' });
    }

    if (typeof body === 'string') {
      req.body = JSON.parse(body);
    }

    const { query, variables, operationName } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'GraphQL query is required' });
    }

    const result = await server.executeOperation(
      {
        query,
        variables,
        operationName,
      }
    );

    if (result.body.kind === 'single') {
      res.json(result.body.singleResult);
    } else {
      res.json(result.body);
    }
  };

  // Mount the GraphQL handler with explicit JSON parsing
  app.post('/graphql', json(), authenticateToken, handler);
  
  // Handle GET requests for GraphQL Sandbox/Playground IDE
  app.get('/graphql', (req, res) => {
    res.status(200).json({ 
      message: 'GraphQL endpoint',
      instructions: 'Send POST requests with GraphQL JSON query to this endpoint'
    });
  });

  return server;
}

export default setupGraphQL;
