// ========== FRUIT STANDS CRUD OPERATIONS (Supabase) ==========

// GET endpoint to search for nearby fruit stands
module.exports = (app, supabase, supabaseAdmin) => {
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
        const { 
            business_name, 
            phone_number, 
            address, 
            city, 
            state, 
            zipcode, 
            description,
            working_hours,
            produce 
        } = req.body;
        
        if (!Number.isInteger(id) || id <= 0) 
        {
            return res.status(400).json({ error: 'Invalid fruit stand ID' });
        }

        // Check if fruit stand exists
        const { data: existingFruitStand, error: checkError } = await supabase
            .from('seller_applications')
            .select('id')
            .eq('user_id', id)
            .single();

        if (checkError) 
        {
            return res.status(404).json({ error: 'Fruit stand not found' });
        }

        // Update in Supabase
        const { data, error } = await supabase
            .from('seller_applications')
            .update({
                business_name: business_name,
                address: address,
                city: city,
                state: state,
                zipcode: zipcode,
                phone_number: phone_number,
                description: description,
                working_hours: working_hours,
                produce: produce,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', id)
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
            .from('seller_applications')
            .select('*')
            .eq('user_id', id)
            .maybeSingle();

        if (error) 
        {
            if (error.code === 'PGRST116') {
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

// ========== FRUIT STAND IMAGE OPERATIONS (Supabase Storage) ==========

// GET endpoint to fetch all images for a fruit stand
app.get('/api/fruitstand-images/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // List all files in the user's folder in the fruitstand-image bucket
        const { data: files, error } = await supabaseAdmin.storage
            .from('fruitstand-image')
            .list(userId, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('Error listing images:', error);
            return res.status(500).json({ error: error.message });
        }

        // Get public URLs for all images
        const images = files.map(file => {
            const { data } = supabaseAdmin.storage
                .from('fruitstand-image')
                .getPublicUrl(`${userId}/${file.name}`);

            return {
                name: file.name,
                url: data.publicUrl,
                createdAt: file.created_at
            };
        });

        res.json({ images });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE endpoint to delete an image from a fruit stand
app.delete('/api/fruitstand-images/:userId/:imageName', async (req, res) => {
    try {
        const { userId, imageName } = req.params;

        // Delete the file from Supabase storage
        const { error } = await supabaseAdmin.storage
            .from('fruitstand-image')
            .remove([`${userId}/${imageName}`]);

        if (error) {
            console.error('Error deleting image:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({
            message: 'Image deleted successfully',
            deletedImage: imageName
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to upload an image to a fruit stand
app.post('/api/fruitstand-images/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { imageBase64, fileName } = req.body;

        console.log('Upload request received for user:', userId);
        console.log('FileName:', fileName);

        if (!imageBase64 || !fileName) {
            return res.status(400).json({ error: 'Image data and filename are required' });
        }

        // Convert base64 to buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        console.log('Buffer size:', buffer.length, 'bytes');

        // Upload to Supabase storage
        const filePath = `${userId}/${fileName}`;
        console.log('Uploading to path:', filePath);

        const { data, error } = await supabaseAdmin.storage
            .from('fruitstand-image')
            .upload(filePath, buffer, {
                contentType: 'image/jpeg',
                upsert: true  // Changed to true to allow overwriting
            });

        if (error) {
            console.error('Supabase storage error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return res.status(500).json({
                error: error.message || 'Failed to upload to storage',
                details: error
            });
        }

        console.log('Upload successful, data:', data);

        // Get public URL
        const { data: publicUrlData } = supabaseAdmin.storage
            .from('fruitstand-image')
            .getPublicUrl(filePath);

        console.log('Public URL:', publicUrlData.publicUrl);

        res.status(201).json({
            message: 'Image uploaded successfully',
            url: publicUrlData.publicUrl,
            path: data.path
        });
    } catch (error) {
        console.error('Server error in image upload:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
};