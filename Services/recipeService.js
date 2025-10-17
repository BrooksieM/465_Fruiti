
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