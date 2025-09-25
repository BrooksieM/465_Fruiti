// server.js (or Server.js)
const express = require('express');
const app = express();
app.use(express.json());

console.log('Loaded file:', __filename);

let recipes = [
  { id: 1, name: 'Pasta', ingredients: ['noodles', 'tomato sauce'] },
  { id: 2, name: 'Salad', ingredients: ['lettuce', 'tomato', 'olive oil'] },
  { id: 3, name: 'Omelette', ingredients: ['eggs', 'salt', 'pepper'] }
];

app.get('/', (req, res) => {
  res.send('API running. Try GET /api/recipe and DELETE /api/recipe/:id');
});

app.get('/api/recipe', (req, res) => {
  res.json(recipes);
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Routes:\n  GET    /\n  GET    /api/recipe\n  DELETE /api/recipe/:id`);
});
