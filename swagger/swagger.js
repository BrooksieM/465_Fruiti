// swagger/swagger.js
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

module.exports = (app, PORT) => {
    // copied from rm
    const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Fruiti API',
        version: '1.0.0',
        description: 'API documentation for the Fruiti project',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Dev server',
        },
      ],
    },
    // path to services folder
    apis: ['../Services/*.js'],
  };

  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
