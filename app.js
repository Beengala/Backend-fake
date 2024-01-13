// app.js
require('dotenv').config();

const express = require('express');
const db = require('./db/database');
const userRoutes = require('./routes/users')
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Beengala - API',
            version: '1.0.0',
            description: 'This is Beengala documentation for the consumption of APIS.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development Server'
            }
        ],
    },
    apis: ['./swagger/*.yaml'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/users', userRoutes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
