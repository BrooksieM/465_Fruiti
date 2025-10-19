//swagger set up
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// SERVICES
require('./Services/accountService')(app, supabase);
require('./Services/adminService')(app, supabase);
require('./Services/articleService')(app, supabase);
require('./Services/authService')(app, supabase);
require('./Services/commentService')(app, supabase);
require('./Services/contactService')(app, supabase);
require('./Services/fruitstandService')(app, supabase);
require('./Services/nutritionService')(app, supabase);
require('./Services/recipeService')(app, supabase);
require('./Services/sellerApplicationService')(app, supabase);