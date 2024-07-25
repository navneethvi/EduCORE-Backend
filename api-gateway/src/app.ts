import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs'

import cors from 'cors'
import userRoute from './routes/user-routes';

const app = express();
const port = 3000;

app.use(cors())

//* Set up the Swagger UI for serving the API documentation

const swaggerDoc = YAML.load('../api-gateway/infra/api-doc/swagger.yaml')

app.use('/api/users', userRoute)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))



app.listen(port, () => {
  console.log(`API Gateway is running on http://localhost:${port}`);
  console.log(`Swagger API running on http://localhost:${port}/api-docs`);
});
