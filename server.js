const express = require('express');
const app = express();
app.use(express.json());

console.log('Loaded file:', __filename);
// the array for recipes

let recipes = [
    {id: 1, name: 'Apple Pie', ingredients: ['apple']},
    {id: 2, name: 'Blueberry Pie', ingredients: ['blueberry']}
];

// logic for posting recipe
app.post('/api/recipes', (req, res) => {
    const { name, ingredients, instructions } = req.body;
    if (!name || !ingredients || !instructions) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const newRecipe = { id: recipes.length + 1, name, ingredients, instructions };
    recipes.push(newRecipe);
    res.status(201).json(newRecipe);
});

//GET endpoint to retrive all products 
app.get('/api/recipes', (req, res) => {
        //Return the array of recipe
    res.json(recipes);
});

app.get('/', (req, res) => {
    res.send('this is the post recipe part');
});

app.delete('/api/recipe/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid recipe ID' });
  }
  const idx = recipes.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  const [deletedRecipe] = recipes.splice(idx, 1);
  res.status(200).json({ message: 'Recipe deleted', deletedRecipe });
});

// this is starting the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Routes:\n  GET    /\n  GET    /api/recipe\n  DELETE /api/recipe/:id`);
});