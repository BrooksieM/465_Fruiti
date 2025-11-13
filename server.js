//server.js

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());
const PORT = 3000;
const path = require('path');
app.use(express.static('public'));


// Load environment variables from .env file
require('dotenv').config();

// Load Google Maps API key from gmaps_api/.env
require('dotenv').config({ path: './gmaps_api/.env' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Supabase client with service role key for file uploads
// const supabaseAdmin = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pageRoutes);
app.use('/api', apiRoutes);
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/UI/homepage.html'));
// });

// app.get('/signup', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/UI/signup.html'));
// });

// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/UI/login.html'));
// });

// app.get('/settings', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/UI/settingspage.html'));
// });

// app.get('/nutrition', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/UI/nutrition.html'));
// });

// app.get('/aboutus', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/UI/aboutus.html'));
// });

// app.get('/become-seller', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/UI/become-seller.html'));
// });

// // API endpoint to serve Google Maps API key
// app.get('/api/gmaps-key', (req, res) => {
//   res.json({ apiKey: process.env.GMAPS_API_KEY });
// });

// // app.get('/seller-payment', (req, res) => {
// //   res.sendFile(path.join(__dirname, 'public/UI/payment/seller-payment.html'));
// // });

app.get('/seller-payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/UI/payment/seller-payment.html'));
  
});

async function testConnection() {
  // Simple test - adjust based on your table structure
  const { data, error } = await supabase
    .from('userInfo')  // Replace with your actual table
    .select('*');

  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful!');
  }
}
testConnection();

console.log('Loaded file:', __filename);

// SERVICES
require('./Services/accountService')(app, supabase);
require('./Services/adminService')(app, supabase);
require('./Services/articleService')(app, supabase);
// require('./Services/authService')(app, supabase);
require('./Services/commentService')(app, supabase);
// require('./Services/contactService')(app, supabase);
require('./Services/fruitstandService')(app, supabase);
require('./Services/nutritionService')(app, supabase);
require('./Services/recipeService')(app, supabase);
require('./Services/sellerApplicationService')(app, supabase);
require('./Services/uploadService')(app, supabase);

//swagger 
const swaggerSetup = require('./swagger/swagger');
swaggerSetup(app, PORT);


//defauklt route
app.get('/', (req, res) => 
{
  res.send('Welcome to the Fruiti API!');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Routes:\n  POST   /api/recipes    \n  GET    /api/recipes\n  DELETE /api/recipes/:id`);
});

