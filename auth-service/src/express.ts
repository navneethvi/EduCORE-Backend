import express from 'express'
import cors from 'cors'

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs'

import userRouter from './routes/student.route';

const app = express()

const swaggerDoc = YAML.load('../api-gateway/infra/api-doc/swagger.yaml')

app.use(cors())

app.get("/", (req, res)=>{
    res.json("helloooo")
})


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.use('/api/users', userRouter);

export default app;