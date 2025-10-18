// Services/fruitstandService.js
// Supabase-backed CRUD and search for fruit stands

module.exports = function (app, supabase) {
    // Search by city/state/address (?location=Erie)
    app.get('/api/fruitstands/search', async (req, res) => {
      try {
        const { location } = req.query;
        if (!location) return res.status(400).json({ error: 'Location query parameter is required' });
        const { data, error } = await supabase
          .from('fruitstands')
          .select('*')
          .or(`city.ilike.%${location}%,state.ilike.%${location}%,address.ilike.%${location}%`)
          .order('name', { ascending: true });
        if (error) return res.status(500).json({ error: error.message });
        res.json({ location, fruitStands: data });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Create fruit stand
    app.post('/api/fruitstands', async (req, res) => {
      try {
        const { name, address, city, state, zip, phone } = req.body;
        if (!name || !address || !city || !state) {
          return res.status(400).json({ error: 'Missing required fields: name, address, city, and state are required.' });
        }
        const { data, error } = await supabase
          .from('fruitstands')
          .insert([{ name, address, city, state, zip: zip || null, phone: phone || null, created_at: new Date().toISOString() }])
          .select();
        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Fruit stand created successfully!', fruitStand: data[0] });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Hard delete by :id
    app.delete('/api/fruitstands/:id', async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid fruit stand ID' });
        const { error: checkError } = await supabase.from('fruitstands').select('id').eq('id', id).single();
        if (checkError) return res.status(404).json({ error: 'Fruit stand not found' });
        const { error } = await supabase.from('fruitstands').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Fruit stand deleted successfully.', deletedId: id });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Update by :id (partial OK)
    app.put('/api/fruitstands/:id', async (req, res) => {
      try {
        const id = Number(req.params.id);
        const { name, address, city, state, zip, phone } = req.body;
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid fruit stand ID' });
        const { error: checkError } = await supabase.from('fruitstands').select('id').eq('id', id).single();
        if (checkError) return res.status(404).json({ error: 'Fruit stand not found' });
        const { data, error } = await supabase
          .from('fruitstands')
          .update({ name, address, city, state, zip, phone, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Fruit stand updated successfully.', fruitStand: data[0] });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Get one by :id
    app.get('/api/fruitstands/:id', async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid fruit stand ID' });
        const { data, error } = await supabase.from('fruitstands').select('*').eq('id', id).single();
        if (error) {
          // PGRST116 = row not found (PostgREST)
          if (error.code === 'PGRST116') return res.status(404).json({ error: 'Fruit stand not found' });
          return res.status(500).json({ error: error.message });
        }
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Add a rating to a stand
    app.post('/api/fruitstands/:id/rating', async (req, res) => {
      try {
        const id = Number(req.params.id);
        const { rating, user_id, comment } = req.body;
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid fruit stand ID' });
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        const { error: checkError } = await supabase.from('fruitstands').select('id').eq('id', id).single();
        if (checkError) return res.status(404).json({ error: 'Fruit stand not found' });
        const { data, error } = await supabase
          .from('ratings')
          .insert([{ fruitstand_id: id, rating, user_id: user_id || null, comment: comment || null, created_at: new Date().toISOString() }])
          .select();
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Rating submitted successfully.', rating: data[0] });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Address view (pretty format)
    app.get('/api/fruitstands/:id/address', async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid fruit stand ID' });
        const { data, error } = await supabase.from('fruitstands').select('name, address, city, state, zip').eq('id', id).single();
        if (error) {
          if (error.code === 'PGRST116') return res.status(404).json({ error: 'Fruit stand not found' });
          return res.status(500).json({ error: error.message });
        }
        res.json({
          name: data.name,
          fullAddress: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
          addressComponents: { street: data.address, city: data.city, state: data.state, zip: data.zip },
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // List all stands (newest first)
    app.get('/api/fruitstands', async (_req, res) => {
      try {
        const { data, error } = await supabase.from('fruitstands').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  };
  