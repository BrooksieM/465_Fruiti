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

