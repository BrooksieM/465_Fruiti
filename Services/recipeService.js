module.exports = function (app, supabase)
{
    // Create a recipe (requires authentication)
    app.post('/api/recipes', async (req, res) =>
    {
      try
      {
        const { name, ingredients, instructions, userId } = req.body;

        // Validate required fields
        if (!name || !ingredients || !instructions || !userId)
          return res.status(400).json({ error: 'Missing required fields (name, ingredients, instructions, userId)' });

        // Validate input lengths
        if (typeof name !== 'string' || name.trim().length === 0 || name.length > 255)
          return res.status(400).json({ error: 'Recipe name must be between 1 and 255 characters' });

        if (typeof instructions !== 'string' || instructions.trim().length === 0 || instructions.length > 5000)
          return res.status(400).json({ error: 'Instructions must be between 1 and 5000 characters' });

        // Validate ingredients format
        let parsedIngredients = ingredients;
        if (typeof ingredients === 'string') {
          try {
            parsedIngredients = JSON.parse(ingredients);
            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
              return res.status(400).json({ error: 'Ingredients must be a non-empty array' });
            }
          } catch {
            return res.status(400).json({ error: 'Ingredients must be a valid JSON array' });
          }
        }

        const { data, error } = await supabase
          .from('recipes')
          .insert([{
            name: name.trim(),
            ingredients: JSON.stringify(parsedIngredients),
            instructions: instructions.trim(),
            user_id: userId,
            created_at: new Date().toISOString()
          }])
          .select();

        if (error)
          return res.status(500).json({ error: error.message });

        res.status(201).json(data[0]);
      }
      catch (error)
      {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // List all recipes
    app.get('/api/recipes', async (_req, res) => 
    {
      try 
      {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) 
          return res.status(500).json({ error: error.message });

        res.json(data);
      } 
      catch (error) 
      {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Delete a recipe by :id (requires authentication and ownership)
    app.delete('/api/recipes/:id', async (req, res) =>
    {
      try
      {
        const id = Number(req.params.id);
        const { userId } = req.body;

        // Validate ID
        if (!Number.isInteger(id) || id <= 0)
          return res.status(400).json({ error: 'Invalid recipe ID' });

        // Check if user provided userId
        if (!userId)
          return res.status(401).json({ error: 'User ID required for deletion' });

        // Get the recipe and check ownership
        const { data: recipe, error: checkError } = await supabase
          .from('recipes')
          .select('id, user_id')
          .eq('id', id)
          .single();

        if (checkError)
          return res.status(404).json({ error: 'Recipe not found' });

        // Verify user owns the recipe
        if (recipe.user_id !== userId)
          return res.status(403).json({ error: 'You can only delete your own recipes' });

        // Delete the recipe
        const { error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', id);

        if (error)
          return res.status(500).json({ error: error.message });

        res.status(200).json({ message: 'Recipe deleted successfully', deletedId: id });

      }
      catch (error)
      {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Get a single recipe
    app.get('/api/recipes/:id', async (req, res) => 
    {
      try 
      {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) 
          return res.status(400).json({ error: 'Invalid recipe ID' });

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id).single();

        if (error) 
        {
          if (error.code === 'PGRST116') 
            return res.status(404).json({ error: 'Recipe not found' });

          return res.status(500).json({ error: error.message });
        }
        res.json(data);
      } 
      catch (error) 
      {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Update a recipe (requires authentication and ownership)
    app.put('/api/recipes/:id', async (req, res) =>
    {
      try
      {
        const id = Number(req.params.id);
        const { name, ingredients, instructions, userId } = req.body;

        // Validate ID
        if (!Number.isInteger(id) || id <= 0)
          return res.status(400).json({ error: 'Invalid recipe ID' });

        // Check if user provided userId
        if (!userId)
          return res.status(401).json({ error: 'User ID required for updates' });

        // Validate that at least one field is being updated
        if (!name && !ingredients && !instructions)
          return res.status(400).json({ error: 'At least one field (name, ingredients, instructions) must be provided' });

        // Validate inputs if provided
        if (name && (typeof name !== 'string' || name.trim().length === 0 || name.length > 255))
          return res.status(400).json({ error: 'Recipe name must be between 1 and 255 characters' });

        if (instructions && (typeof instructions !== 'string' || instructions.trim().length === 0 || instructions.length > 5000))
          return res.status(400).json({ error: 'Instructions must be between 1 and 5000 characters' });

        // Validate ingredients format if provided
        let parsedIngredients = ingredients;
        if (ingredients) {
          if (typeof ingredients === 'string') {
            try {
              parsedIngredients = JSON.parse(ingredients);
              if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
                return res.status(400).json({ error: 'Ingredients must be a non-empty array' });
              }
            } catch {
              return res.status(400).json({ error: 'Ingredients must be a valid JSON array' });
            }
          }
        }

        // Get the recipe and check ownership
        const { data: recipe, error: checkError } = await supabase
          .from('recipes')
          .select('id, user_id')
          .eq('id', id)
          .single();

        if (checkError)
          return res.status(404).json({ error: 'Recipe not found' });

        // Verify user owns the recipe
        if (recipe.user_id !== userId)
          return res.status(403).json({ error: 'You can only update your own recipes' });

        // Build update object with only provided fields
        const updateData = { updated_at: new Date().toISOString() };
        if (name) updateData.name = name.trim();
        if (instructions) updateData.instructions = instructions.trim();
        if (ingredients) updateData.ingredients = JSON.stringify(parsedIngredients);

        const { data, error } = await supabase
          .from('recipes')
          .update(updateData)
          .eq('id', id)
          .select();

        if (error)
          return res.status(500).json({ error: error.message });

        res.json({ message: 'Recipe updated successfully', recipe: data[0] });
      }
      catch (error)
      {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
};

  