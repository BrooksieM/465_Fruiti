// getRecipe.js
const express = require('express');
const app = express();
app.use(express.json());

//A simple array to act as our "database"
let recipe = [
    {id: 1, name: 'Apple Pie', ingredients: ['apple']},
    {id: 2, name: 'Blueberry Pie', ingredients: ['blueberry']}
];

//GET endpoint to retrive all products 
app.get('/api/recipe', (req, res) => {
    //Return the array of recipe
    res.json(recipe);
}
)

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));