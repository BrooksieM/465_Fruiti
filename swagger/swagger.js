const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

module.exports = (app, PORT) => {
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
    apis: 
    [
      path.join(__dirname, './docs/fruitstand.js'),
      path.join(__dirname, '../Services/*.js')
    ],
  };

  const specs = swaggerJsdoc(options);
  
  // add debug logging (from chatGPT suggestion)
  console.log('Swagger looking for files in:', path.join(__dirname, './docs/fruitstand.js'));
  console.log('Number of paths found:', specs.paths ? Object.keys(specs.paths).length : 0);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
};