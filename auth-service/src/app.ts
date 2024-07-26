import app from './express';
import connectDB from './config/database';

const port = 3001;

connectDB()

app.listen(port, () => {
  console.log(`Auth Service is running on http://localhost:${port}`);
  console.log(`Swagger Auth running on http://localhost:${port}/api-docs`);
});
