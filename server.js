//server.js

const express = require('express');
const app = express();
app.use(express.json());

console.log('Loaded file:', __filename);

// the array for recipes
let recipes = [
    {id: 1, name: 'Apple Pie', ingredients: ['apple'], instructions: ['Make an apple pie']},
    {id: 2, name: 'Blueberry Pie', ingredients: ['blueberry'], instructions: ['Make an blueberry']}
];

// POST endpoint to create a product
app.post('/api/recipes', (req, res) => {
    const { name, ingredients, instructions } = req.body;
    //Check if all required fields are satisfied
    if (!name || !ingredients || !instructions) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    //Auto increments the id number
    const newRecipe = { id: recipes.length + 1, name, ingredients, instructions };
    recipes.push(newRecipe);
    //Respond with a 201 status code with the new Recipe
    res.status(201).json(newRecipe);
});

//GET endpoint to retrive all products 
app.get('/api/recipes', (req, res) => {
    //Return the array of recipe in JSON format
    res.json(recipes);
});

app.get('/', (req, res) => {
    res.send('this is the post recipe part');
});

//DELETE endpoint to delete a product with the specified id
app.delete('/api/recipes/:id', (req, res) => {
  const id = Number(req.params.id);
  //Validating the input
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid recipe ID' });
  }
  //Check if there's an recipe with the ID specified by the user
  const idx = recipes.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  //Delete recipe
  const [deletedRecipe] = recipes.splice(idx, 1);
  res.status(200).json({ message: 'Recipe deleted', deletedRecipe });
});

////// NUTRITION SERVICE ////////////////////////////////////////////////

/**
 * HOW TO TEST (Windows CMD)
 *
 * get nutrition by fruit id:
 *   curl.exe "http://localhost:3000/api/nutrition/1"
 *   curl.exe "http://localhost:3000/api/nutrition/2"
 *   curl.exe "http://localhost:3000/api/nutrition/3"
 */

const nutritionByFruitId = {
  1: { fruitId: 1, name: 'Apple',     calories: 95,  carbs_g: 25, protein_g: 0.5, fat_g: 0.3, fiber_g: 4.4, vitaminC_mg: 8.4 },
  2: { fruitId: 2, name: 'Blueberry', calories: 85,  carbs_g: 21, protein_g: 1.1, fat_g: 0.5, fiber_g: 3.6, vitaminC_mg: 14.4 },
  3: { fruitId: 3, name: 'Banana',    calories: 105, carbs_g: 27, protein_g: 1.3, fat_g: 0.4, fiber_g: 3.1, vitaminC_mg: 10.3 },
};

// GET /api/nutrition/:id -> return nutrition for fruit id
app.get('/api/nutrition/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid fruit id' });
  const data = nutritionByFruitId[id];
  if (!data) return res.status(404).json({ error: 'Nutrition not found' });
  res.json(data);
});

///// END NUTRITION SERVICE ////////////////////////////////////////////////

/////// ARTICLES SERVICE //////////////////////////////////////////

/**
 * HOW TO TEST (Windows CMD)
 *
 * list specific articles (thumbnails & meta):
 *   curl.exe "http://localhost:3000/api/articles?ids=1,2,3"
 *
 * list all articles:
 *   curl.exe "http://localhost:3000/api/articles"
 *
 * get full article by id:
 *   curl.exe "http://localhost:3000/api/articles/2"
 */

const articles = [
  { id: 1, title: 'How to Pick Fresh Apples', thumbnail: '/img/a1.jpg', summary: 'Quick tips for apples', body: 'Full body: apples...' },
  { id: 2, title: 'Blueberries 101',         thumbnail: '/img/a2.jpg', summary: 'All about blueberries', body: 'Full body: blueberries...' },
  { id: 3, title: 'Perfect Pie Crust',       thumbnail: '/img/a3.jpg', summary: 'Flaky crust basics',    body: 'Full body: pie crust...' },
  { id: 4, title: 'Farmers Market Guide',    thumbnail: '/img/a4.jpg', summary: 'Shop like a pro',       body: 'Full body: market...' },
];

// GET /api/articles?ids=1,2,3  -> list by ids (order preserved). No ids -> return all.
app.get('/api/articles', (req, res) => {
  const raw = (req.query.ids || '').trim();
  if (!raw) return res.json({ count: articles.length, data: articles });

  const ids = raw.split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n > 0);
  if (!ids.length) return res.status(400).json({ error: 'ids must be a comma-separated list of integers' });

  const byId = new Map(articles.map(a => [a.id, a]));
  const found = ids.map(id => byId.get(id)).filter(Boolean);
  return res.json({ count: found.length, data: found });
});

// GET /api/articles/:id -> full article
app.get('/api/articles/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid article id' });
  const a = articles.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: 'Article not found' });
  res.json(a);
});

/////// END ARTICLES SERVICE //////////////////////////////////////////

// SELLER APPLICATION SERVICE //////////////////////////////////

let subscriptions = [
    { id: 1, name: 'Monthly', price: 5.99, duration: '1 month' },
    { id: 2, name: '6mo', price: 12.00, duration: '3 months' },
    { id: 3, name: 'Year', price: 15.00, duration: '12 months' },
];


//view application of becoming a seller
app.get('/api/seller_application', (req, res) => {
    res.send('This is the seller application page');
});

//selecting subscription plan / 3
app.get('/api/seller_subscription/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const plan = subscriptions.find((p) => p.id === id);

    if (!plan) return res.status(404).json({ error: 'Subscription plan not found.' });

    res.status(200).json({
        message: `Subscription plan details for ID: ${id}`,
        plan,
    });
});


//inputting payment information
app.get('/api/seller_payment', (req, res) => {
    res.send('This is the payment information page');
});

//updating sub plan
app.put('/api/seller_subscription/:id', (req, res) => {
    const id = req.params.id;
    res.send(`This is the update subscription plan page for plan ID: ${id}`);
});

//cancelling sub plan
app.delete('/api/seller_subscription/:id', (req, res) => {
    const id = req.params.id;
    res.send(`This is the cancel subscription plan page for plan ID: ${id}`);
});

//choosing a specific plan
app.get('/api/seller_subscription/:id', (req, res) => {
    const id = req.params.id;
    res.send(`This is the subscription plan page for plan ID: ${id}`);
});



////////////////////////END OF SELLER APP///////////////

// this is starting the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Routes:\n  POST   /api/recipes    \n  GET    /api/recipes\n  DELETE /api/recipes/:id`);
});

