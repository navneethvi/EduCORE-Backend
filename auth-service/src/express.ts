import express from 'express'

import cors from 'cors'
import { configDotenv } from 'dotenv';
import cookieParser from 'cookie-parser';



import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs'

import userRouter from './routes/user.route';

import { ErrorHandler } from '@envy-core/common';

const app = express()

configDotenv()

app.use(cookieParser())

const swaggerDoc = YAML.load('../api-gateway/infra/api-doc/swagger.yaml')

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, 
  }));


app.get("/", (req, res)=>{
    res.json("helloooo")
})


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.use('/api/users', userRouter);

app.use(ErrorHandler.handleError)

export default app;