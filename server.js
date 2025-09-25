const express = require('express');
const app = express();
app.use(express.json());

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

// this is starting the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});