// Services/fruitstandService.js
// Supabase-backed CRUD and search for fruit stands

module.exports = function (app, supabase) 
{

// GET endpoint to search for nearby fruit stands
module.exports = (app, supabase) => {
app.get('/api/fruitstands/search', async (req, res) => {
    try 
    {
        const { location } = req.query;
        
        if (!location) 
        {
            return res.status(400).json({ error: 'Location query parameter is required' });
        }

        // Search fruit stands by location (city, state, or address)
        const { data, error } = await supabase
            .from('fruitstands')
            .select('*')
            .or(`city.ilike.%${location}%,state.ilike.%${location}%,address.ilike.%${location}%`)
            .order('name', { ascending: true });

        if (error) 
        {
            console.error('Search error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ 
            location, 
            fruitStands: data 
        });
    } 
    catch (error) 
    {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to create a new fruit stand
/**
 * @swagger
 * /api/fruitstands:
 *   post:
 *     summary: Create a new fruit stand
 *     description: Adds a new fruit stand to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - city
 *               - state
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the fruit stand
 *               address:
 *                 type: string
 *                 description: Street address
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fruit stand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fruitStand:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 */
app.post('/api/fruitstands', async (req, res) => {
    try 
    {
        const { name, address, city, state, zip, phone } = req.body;

        // Basic validation
        if (!name || !address || !city || !state) 
        {
            return res.status(400).json(
              {
                error: 'Missing required fields: name, address, city, and state are required.'
            });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('fruitstands')
            .insert([
                {
                    name,
                    address,
                    city,
                    state,
                    zip: zip || null,
                    phone: phone || null,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) 
        {
            console.error('Insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Fruit stand created successfully!',
            fruitStand: data[0]
        });
    } 
    catch (error) 
    {
        console.error('Server error:', error); // error logging
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE endpoint to delete a fruit stand, idk this shit didnt work 
app.delete('/api/fruitstands/:id', async (req, res) => {
    try 
    {
        const id = Number(req.params.id);
        
        if (!Number.isInteger(id) || id <= 0) 
        {
            return res.status(400).json({ error: 'Invalid fruit stand ID' });
        }

        // Check if fruit stand exists
        const { data: existingFruitStand, error: checkError } = await supabase
            .from('fruitstands')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) 
        {
            return res.status(404).json({ error: 'Fruit stand not found' });
        }

        // Delete from Supabase
        const { error } = await supabase
            .from('fruitstands')
            .delete()
            .eq('id', id);

        if (error) 
        {
            console.error('Delete error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ 
            message: 'Fruit stand deleted successfully.',
            deletedId: id 
        });
    } 
    catch (error) 
    {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT endpoint to update a fruit stand
app.put('/api/fruitstands/:id', async (req, res) => {
    try 
    {
        const id = Number(req.params.id);
        const { name, address, city, state, zip, phone } = req.body;
        
        if (!Number.isInteger(id) || id <= 0) 
        {
            return res.status(400).json({ error: 'Invalid fruit stand ID' });
        }

        // Check if fruit stand exists
        const { data: existingFruitStand, error: checkError } = await supabase
            .from('fruitstands')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) 
        {
            return res.status(404).json({ error: 'Fruit stand not found' });
        }

        // Update in Supabase
        const { data, error } = await supabase
            .from('fruitstands')
            .update({
                name,
                address,
                city,
                state,
                zip,
                phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) 
        {
            console.error('Update error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({
            message: 'Fruit stand updated successfully.',
            fruitStand: data[0]
        });
    } 
    catch (error) 
    {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to get fruit stand details by ID
app.get('/api/fruitstands/:id', async (req, res) => {
    try 
    {
        const id = Number(req.params.id);
        
        if (!Number.isInteger(id) || id <= 0) 
        {
            return res.status(400).json({ error: 'Invalid fruit stand ID' });
        }

        const { data, error } = await supabase
            .from('fruitstands')
            .select('*')
            .eq('id', id)
            .single();

        if (error) 
        {
            if (error.code === 'PGRST116') 
            {
                return res.status(404).json({ error: 'Fruit stand not found' });
            }
            console.error('Select error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } 
    catch (error) 
    {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to rate a fruit stand
app.post('/api/fruitstands/:id/rating', async (req, res) => {
    try 
    {
        const id = Number(req.params.id);
        const { rating, user_id, comment } = req.body;
        
        if (!Number.isInteger(id) || id <= 0) 
        {
            return res.status(400).json({ error: 'Invalid fruit stand ID' });
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) 
        {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if fruit stand exists
        const { data: existingFruitStand, error: checkError } = await supabase
            .from('fruitstands')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) 
        {
            return res.status(404).json({ error: 'Fruit stand not found' });
        }

        // Insert rating into ratings table (you'll need to create this table)
        const { data, error } = await supabase
            .from('ratings')
            .insert([
                {
                    fruitstand_id: id,
                    rating,
                    user_id: user_id || null,
                    comment: comment || null,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) 
        {
            console.error('Rating insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ 
            message: 'Rating submitted successfully.',
            rating: data[0]
        });
    } 
    catch (error) 
    {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to get fruit stand address
app.get('/api/fruitstands/:id/address', async (req, res) => {
    try 
    {
        const id = Number(req.params.id);
        
        if (!Number.isInteger(id) || id <= 0) 
        {
            return res.status(400).json({ error: 'Invalid fruit stand ID' });
        }

        const { data, error } = await supabase
            .from('fruitstands')
            .select('name, address, city, state, zip')
            .eq('id', id)
            .single();

        if (error) 
        {
            if (error.code === 'PGRST116')
            {
                return res.status(404).json({ error: 'Fruit stand not found' });
            }
            console.error('Select error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Return address data that can be used with Google Maps
        res.json({
            name: data.name,
            fullAddress: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
            addressComponents: {
                street: data.address,
                city: data.city,
                state: data.state,
                zip: data.zip
            }
        });
    } 
    catch (error) 
    {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to retrieve all fruit stands
app.get('/api/fruitstands', async (req, res) => {
    try 
    {
        const { data, error } = await supabase
            .from('fruitstands')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) 
        {
            console.error('Select error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } 
    catch (error) 
    {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  };
  
};
