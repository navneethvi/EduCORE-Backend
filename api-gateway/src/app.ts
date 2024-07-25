// src/app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';
import { createProxyService } from './middleware/proxy-middleware';
import logger from './core/logger';

const app = express();
const port = 3000;

// Set up the Swagger UI for serving the API documentation
const swaggerDoc = YAML.load('../api-gateway/infra/api-doc/swagger.yaml'); // Adjust path as needed

app.use(cors());

// Proxy route
app.use('/api/users', createProxyService('auth'));

// Serve Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Start the server
app.listen(port, () => {
  logger.info(`API Gateway is running on http://localhost:${port}`);
  console.log(`Swagger API running on http://localhost:${port}/api-docs`);
});


  // const swaggerDoc = YAML.load('../api-gateway/infra/api-doc/swagger.yaml')