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

//edit a recipe
app.put('/api/recipes/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, ingredients, instructions } = req.body;
    //Validating the input
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    if (!name || !ingredients || !instructions) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    //Check if there's an recipe with the ID specified by the user
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found in System' });
    }
    //editing a recipe
    recipe.name = name;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    res.status(200).json(recipe);
});

//system reads recipe
app.get('/api/recipes/:id', (req, res) => {
    const id = Number(req.params.id);
    //Validating the input (copied from edit a recipe)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    //check if recipe exists by user
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found in System' });
    }
    res.status(200).json(recipe);
});

// TODO: ALLOW USER TO VIEW MULTIPLE THUMBAILS OF RECIPES

//post a review of the recipe
app.post('/api/recipes/:id/reviews', (req, res) => {
    const id = Number(req.params.id);
    const { review } = req.body;
    //Validating the input
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    if (!review) {
        return res.status(400).json({ error: 'Missing review field' });
    }
    //Check if there's an recipe with the ID specified by the user
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found in System' });
    }
    //If reviews array does not exist, create it
    if (!recipe.reviews) {
        recipe.reviews = [];
    }
    //Add the new review to the reviews array
    recipe.reviews.push(review);
    res.status(201).json({ message: 'Review added', review });
  });
// this is starting the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Routes:\n  POST   /api/recipes    \n  GET    /api/recipes\n  DELETE /api/recipes/:id`);
});

