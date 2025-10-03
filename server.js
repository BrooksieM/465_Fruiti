//server.js

const express = require('express');
const app = express();
app.use(express.json());
// Comments API (added on comments_service branch)
const commentsRouter = require('./src/routes/comments');
app.use('/api/comments', commentsRouter);



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

// this is starting the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Routes:\n  POST   /api/recipes    \n  GET    /api/recipes\n  DELETE /api/recipes/:id`);
});


/*
# API Testing Guide
Follow the steps below to test the `POST`, `GET`, and `DELETE` methods after starting the server.

POST method
	Copy and paste the following command into CMD after starting the server:
		curl -X POST http://localhost:3000/api/recipes -H "Content-Type: application/json" -d "{\"name\":\"Strawberry Pie\",\"ingredients\":[\"strawberries\",\"sugar\",\"flour\"],\"instructions\":[\"Mix ingredients\",\"Bake for 30 minutes\"]}"

GET method
	Open the following link in your browser:
		http://localhost:3000/api/recipes

DELETE method
	Copy and paste the code below to CMD after the server is started
		curl -X DELETE http://localhost:3000/api/recipes/1
*/