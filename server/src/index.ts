import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import contractRoutes from './routes/contractRoutes';
import violationRoutes from './routes/violationRoutes';
import { getDatabase } from './database/database';
import { seedDatabase } from './database/seed';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ViaTrack API',
      version: '1.0.0',
      description: 'API para registro e listagem de infrações de trânsito',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/contracts', contractRoutes);
app.use('/api/violations', violationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

getDatabase();
seedDatabase();

app.listen(PORT, () => {
  console.log(` ViaTrack API rodando em http://localhost:${PORT}`);
  console.log(` Documentação Swagger em http://localhost:${PORT}/api-docs`);
});

export default app;
