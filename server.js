//server.js

const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;
const path = require('path'); // Add this line
app.use(express.static('public'));


// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/UI/homepage.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/UI/signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/UI/login.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/UI/settingspage.html'));
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

