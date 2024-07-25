import express from 'express';
// import swaggerUi from 'swagger-ui-express';




const app = express();
const port = 3001;

// app.use(cors())

app.get('/api/users', (req, res)=>{
    console.log("Hellooooooooooooooo");
    
})

//* Set up the Swagger UI for serving the API documentation

// const swaggerDoc = YAML.load('../api-gateway/infra/api-doc/swagger.yaml')

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// app.use('/api/users', userRoute)


app.listen(port, () => {
  console.log(`Auth Service is running on http://localhost:${port}`);
  console.log(`Swagger API running on http://localhost:${port}/api-docs`);
});
