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