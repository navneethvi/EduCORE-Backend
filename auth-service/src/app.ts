import app from './express';
import connectDB from './config/database';

import {logger} from "@envy-core/common";

const port = 3001;

connectDB()

app.listen(port, () => {
  logger.info(`Auth Service is running on http://localhost:${port}`);
  logger.info(`Swagger Auth running on http://localhost:${port}/api-docs`);
});
