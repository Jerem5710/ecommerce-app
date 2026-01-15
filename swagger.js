const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'API documentation for the E-Commerce application',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Change to your server URL
            },
        ],
    },
    apis: ['./routes/*.js', './server.js'], // Paths to files with Swagger annotations
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;