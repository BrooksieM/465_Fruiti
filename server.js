//server.js

const express = require('express');
const app = express();
app.use(express.json());

// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

// the array for recipes
let recipes = [
    {id: 1, name: 'Apple Pie', ingredients: ['apple'], instructions: ['Make an apple pie']},
    {id: 2, name: 'Blueberry Pie', ingredients: ['blueberry'], instructions: ['Make an blueberry']}
];

// ========== RECIPES CRUD OPERATIONS (Supabase) ==========

// POST endpoint to create a recipe
app.post('/api/recipes', async (req, res) => {
    try {
        const { name, ingredients, instructions } = req.body;
        
        // Check if all required fields are satisfied
        if (!name || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert into Supabase (auto-increment ID handled by database)
        const { data, error } = await supabase
            .from('recipes')
            .insert([
                { 
                    name, 
                    ingredients, 
                    instructions,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Respond with the created recipe (Supabase returns the inserted row)
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to retrieve all recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Select error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Return the array of recipes in JSON format
        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE endpoint to delete a recipe with the specified id
app.delete('/api/recipes/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        
        // Validating the input
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid recipe ID' });
        }

        // Check if recipe exists
        const { data: existingRecipe, error: checkError } = await supabase
            .from('recipes')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Delete recipe from Supabase
        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ 
            message: 'Recipe deleted successfully',
            deletedId: id 
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to get a specific recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid recipe ID' });
        }

        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Recipe not found' });
            }
            console.error('Select error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT endpoint to update a recipe
app.put('/api/recipes/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, ingredients, instructions } = req.body;
        
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid recipe ID' });
        }

        // Check if recipe exists
        const { data: existingRecipe, error: checkError } = await supabase
            .from('recipes')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Update recipe in Supabase
        const { data, error } = await supabase
            .from('recipes')
            .update({
                name,
                ingredients,
                instructions,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Update error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({
            message: 'Recipe updated successfully',
            recipe: data[0]
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/*
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
*/


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

// SELLER_APPLICATION SERVICE //////////////////////////////////

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

////////comment_service//////
(() => {
  // ensure shared store exists
  const store = (globalThis.__store = globalThis.__store || {
    accounts: [],
    nextAccountId: 1,
    commentsByRecipe: {},
    nextCommentIdByRecipe: {},
  });
  if (!store.commentsByRecipe) store.commentsByRecipe = {};
  if (!store.nextCommentIdByRecipe) store.nextCommentIdByRecipe = {};
  const ensureRecipe = (recipeId) => {
    const key = String(recipeId);
    if (!store.commentsByRecipe[key]) {
      store.commentsByRecipe[key] = [];
      store.nextCommentIdByRecipe[key] = 1;
    }
    return key;
  };

  // helpers
  const toId = (v, kind) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error(`invalid ${kind} id`);
    return n;
  };
  const status = (e) => (/not found|valid .* required/i.test(e.message) ? 400 : 400); // simple map

  // dev ping
  app.get('/api/comments/__ping', (_req, res) => res.json({ ok: true }));

  // POST /api/comments?recipe=1  { text }
  app.post('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const { text } = req.body || {};
      if (!text || !String(text).trim()) throw new Error('text required');
      const key = ensureRecipe(recipeId);
      const id = store.nextCommentIdByRecipe[key]++;
      const comment = { id, authorId: null, text: String(text).trim(), likes: 0 };
      store.commentsByRecipe[key].push(comment);
      res.status(201).json({ recipeId, comment });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // GET /api/comments?recipe=1            -> list
  // GET /api/comments?recipe=1&comment=1  -> single
  app.get('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const key = ensureRecipe(recipeId);
      if (req.query.comment) {
        const cid = toId(req.query.comment, 'comment');
        const item = store.commentsByRecipe[key].find((c) => c.id === cid);
        if (!item) throw new Error('comment not found');
        return res.json(item);
      }
      res.json(store.commentsByRecipe[key]);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // PUT /api/comments?recipe=1&comment=1  { text }
  app.put('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const cid = toId(req.query.comment, 'comment');
      const key = ensureRecipe(recipeId);
      const item = store.commentsByRecipe[key].find((c) => c.id === cid);
      if (!item) throw new Error('comment not found');
      const { text } = req.body || {};
      if (!text || !String(text).trim()) throw new Error('text required');
      item.text = String(text).trim();
      res.json(item);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // PUT /api/comments/like?recipe=1&comment=1
  app.put('/api/comments/like', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const cid = toId(req.query.comment, 'comment');
      const key = ensureRecipe(recipeId);
      const item = store.commentsByRecipe[key].find((c) => c.id === cid);
      if (!item) throw new Error('comment not found');
      item.likes += 1;
      res.json({ id: item.id, likes: item.likes });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // DELETE /api/comments?recipe=1&comment=1
  app.delete('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const cid = toId(req.query.comment, 'comment');
      const key = ensureRecipe(recipeId);
      const idx = store.commentsByRecipe[key].findIndex((c) => c.id === cid);
      if (idx === -1) throw new Error('comment not found');
      const [deleted] = store.commentsByRecipe[key].splice(idx, 1);
      res.json({ recipeId, deleted });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });
})();

/* CMD tests:
curl.exe "http://localhost:3000/api/comments/__ping"
curl.exe -X POST "http://localhost:3000/api/comments?recipe=1" -H "Content-Type: application/json" -d "{\"text\":\"Nice pie!\"}"
curl.exe "http://localhost:3000/api/comments?recipe=1"
curl.exe "http://localhost:3000/api/comments?recipe=1&comment=1"
curl.exe -X PUT "http://localhost:3000/api/comments?recipe=1&comment=1" -H "Content-Type: application/json" -d "{\"text\":\"Edited\"}"
curl.exe -X PUT "http://localhost:3000/api/comments/like?recipe=1&comment=1"
curl.exe -X DELETE "http://localhost:3000/api/comments?recipe=1&comment=1"
*/
////////comment_service end//////

////////account_service/////
(() => {
  // shared in-memory store (safe-init if it already exists)
  const store = (globalThis.__store = globalThis.__store || {
    accounts: [],
    nextAccountId: 1,
    commentsByRecipe: {},
    nextCommentIdByRecipe: {},
  });
  if (!Array.isArray(store.accounts)) store.accounts = [];
  if (!Number.isInteger(store.nextAccountId)) {
    store.nextAccountId = (store.accounts.reduce((m, a) => Math.max(m, a.id || 0), 0) + 1) || 1;
  }

  // helpers
  const toId = (v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('invalid id');
    return n;
  };
  const mustAccount = (id) => {
    const a = store.accounts.find((x) => x.id === id);
    if (!a) throw new Error('not found');
    return a;
  };
  const status = (e) => (/not found/i.test(e.message) ? 404 : 400);

  // routes
  app.get('/api/accounts/__ping', (_req, res) => res.json({ ok: true }));

  app.post('/api/accounts', (req, res) => {
    try {
      const { handle, email, ...extra } = req.body || {};
      if (!handle || !email) throw new Error('handle and email are required');
      const acct = {
        id: store.nextAccountId++,
        handle,
        email,
        avatar: null,
        paymentMethod: null,
        ...extra,
      };
      store.accounts.push(acct);
      res.status(201).json(acct);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  app.get('/api/accounts', (_req, res) => res.json(store.accounts));

  app.get('/api/accounts/:id', (req, res) => {
    try {
      res.json(mustAccount(toId(req.params.id)));
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  app.put('/api/accounts/:id', (req, res) => {
    try {
      const a = mustAccount(toId(req.params.id));
      const { handle, email, ...rest } = req.body || {};
      if (handle !== undefined) a.handle = handle;
      if (email !== undefined) a.email = email;
      Object.assign(a, rest);
      res.json(a);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  app.put('/api/accounts/:id/profile-picture', (req, res) => {
    try {
      const a = mustAccount(toId(req.params.id));
      const { url } = req.body || {};
      if (!url) throw new Error('url required');
      a.avatar = url;
      res.json({ avatar: a.avatar });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  app.put('/api/accounts/:id/payment-method', (req, res) => {
    try {
      const a = mustAccount(toId(req.params.id));
      const { brand, last4 } = req.body || {};
      if (!brand || !last4) throw new Error('brand and last4 required');
      a.paymentMethod = { brand, last4 };
      res.json(a.paymentMethod);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  app.delete('/api/accounts/:id', (req, res) => {
    try {
      const id = toId(req.params.id);
      const idx = store.accounts.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('not found');
      const [deleted] = store.accounts.splice(idx, 1);
      res.json({ deleted });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });
})();

/* CMD tests:
curl.exe "http://localhost:3000/api/accounts/__ping"
curl.exe -X POST "http://localhost:3000/api/accounts" -H "Content-Type: application/json" -d "{\"handle\":\"buyer7\",\"email\":\"b7@example.com\"}"
curl.exe "http://localhost:3000/api/accounts"
curl.exe "http://localhost:3000/api/accounts/1"
curl.exe -X PUT "http://localhost:3000/api/accounts/1" -H "Content-Type: application/json" -d "{\"handle\":\"buyer77\"}"
curl.exe -X PUT "http://localhost:3000/api/accounts/1/profile-picture" -H "Content-Type: application/json" -d "{\"url\":\"https://img.example.com/a.png\"}"
curl.exe -X PUT "http://localhost:3000/api/accounts/1/payment-method" -H "Content-Type: application/json" -d "{\"brand\":\"visa\",\"last4\":\"4242\"}"
curl.exe -X DELETE "http://localhost:3000/api/accounts/1"
*/
////////account_service end//////

////////fruitstand_service/////

//search for nearby fruit stands
app.get('/api/fruitstands/search', (req, res) => {
    const { location } = req.query;
    if (!location) {
        return res.status(400).json({ error: 'Location query parameter is required' });
    }
    // random shit for it
    const fruitStands = [
        { id: 1, name: 'Fresh Fruits Stand', location: 'Downtown', distance: '0.5 miles' },
        { id: 2, name: 'Organic Fruit Market', location: 'Uptown', distance: '1.2 miles' },
    ];
    res.json({ location, fruitStands });
});

const fruitStands = [
  { id: 1, name: 'Fresh Fruits Stand', address: '123 Main St', city: 'Downtown', state: 'CA' },
  { id: 2, name: 'Organic Fruit Market', address: '456 Green Ave', city: 'Uptown', state: 'CA' },
];

// POST /api/fruitstands - create a new fruit stand
app.post('/api/fruitstands', (req, res) => {
  const { name, address, city, state, zip, phone } = req.body;

  // Basic validation
  if (!name || !address || !city || !state) {
    return res.status(400).json({
      error: 'Missing required fields: name, address, city, and state are required.',
    });
  }

  // Create a new fruit stand object
  const newFruitStand = {
    id: fruitStands.length + 1,
    name,
    address,
    city,
    state,
    zip: zip || null,
    phone: phone || null,
    createdAt: new Date(),
  };

  // Add to in-memory array
  fruitStands.push(newFruitStand);

  // Respond with success
  res.status(201).json({
    message: 'Fruit stand created successfully!',
    fruitStand: newFruitStand,
  });
});

//user deletes their fruit stand
app.delete('/api/fruitstands/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = fruitStands.findIndex((fs) => fs.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Fruit stand not found.' });
  }
  fruitStands.splice(index, 1);
  res.json({ message: 'Fruit stand deleted successfully.' });
});

//user updates their fruit stand info
app.put('/api/fruitstands/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const fruitStand = fruitStands.find((fs) => fs.id === id);
  if (!fruitStand) {
    return res.status(404).json({ error: 'Fruit stand not found.' });
  }
  const { name, address, city, state, zip, phone } = req.body;
  if (name) fruitStand.name = name;
  if (address) fruitStand.address = address;
  if (city) fruitStand.city = city;
  if (state) fruitStand.state = state;
  if (zip) fruitStand.zip = zip;
  if (phone) fruitStand.phone = phone;
  res.json({ message: 'Fruit stand updated successfully.', fruitStand });
});

//get fruit stand details by id
app.get('/api/fruitstands/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const fruitStand = fruitStands.find((fs) => fs.id === id);
  if (!fruitStand) {
    return res.status(404).json({ error: 'Fruit stand not found.' });
  }
  res.json(fruitStand);
});

//rate a fruit stand
app.post('/api/fruitstands/:id/rating', (req, res) => {
  const id = parseInt(req.params.id);
  const fruitStand = fruitStands.find((fs) => fs.id === id);
  if (!fruitStand) {
    return res.status(404).json({ error: 'Fruit stand not found.' });
  }
  // GOTTA DO BETTER VALIDATION LATER
  const { rating } = req.body;
  res.json({ message: 'Rating submitted successfully.' });
});

//get the address of a fruit stand and send it to google maps WILL NEED TO DO AGAIN LATER
app.get('/api/fruitstands/:id/address', (req, res) => {
  const id = parseInt(req.params.id);
  const fruitStand = fruitStands.find((fs) => fs.id === id);
  if (!fruitStand) {
    return res.status(404).json({ error: 'Fruit stand not found.' });
  }
  // Implement logic to get directions using fruitStand address
  res.json({ message: 'Directions feature coming soon.' });
});

////////fruitstand_service end//////

////////admin_shit/////

//view all logged in users
app.get('/api/admin/account', (req, res) => {
  // Implement logic to retrieve all logged in users
  res.json({ message: 'This is where the user list would go.' });
});

//delete a users account
app.delete('/api/admin/account/:id', (req, res) => {
  // Implement logic to delete a user's account
  res.json({ message: 'User account deleted successfully.' });
});

//restore a users account
app.post('/api/admin/account/:id/restore', (req, res) => {
  // Implement logic to restore a user's account
  res.json({ message: 'User account restored successfully.' });
});

////////admin_shit end//////

// this is starting the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Routes:\n  POST   /api/recipes    \n  GET    /api/recipes\n  DELETE /api/recipes/:id`);
});

