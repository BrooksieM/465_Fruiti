// Services/recipeService.js
// Supabase-backed CRUD for recipes

module.exports = function (app, supabase) 
{
    // Create a recipe
    app.post('/api/recipes', async (req, res) => 
    {
      try 
      {
        const { name, ingredients, instructions } = req.body;

        if (!name || !ingredients || !instructions) 
          return res.status(400).json({ error: 'Missing required fields' });

        const { data, error } = await supabase
          .from('recipes')
          .insert([{ name, ingredients, instructions, created_at: new Date().toISOString() }])
          .select();

        if (error) 
          return res.status(500).json({ error: error.message });

        res.status(201).json(data[0]);
      } 
      catch (error) 
      {
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
  
    // Delete a recipe by :id
    app.delete('/api/recipes/:id', async (req, res) => 
    {
      try 
      {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) 
          return res.status(400).json({ error: 'Invalid recipe ID' });

        const { error: checkError } = await supabase
          .from('recipes')
          .select('id')
          .eq('id', id).single();

        if (checkError) 
          return res.status(404).json({ error: 'Recipe not found' });

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
  
    // Update a recipe (partial)
    app.put('/api/recipes/:id', async (req, res) => 
    {
      try 
      {
        const id = Number(req.params.id);
        const { name, ingredients, instructions } = req.body;

        if (!Number.isInteger(id) || id <= 0) 
          return res.status(400).json({ error: 'Invalid recipe ID' });

        const { error: checkError } = await supabase
          .from('recipes')
          .select('id')
          .eq('id', id).single();

        if (checkError) 
          return res.status(404).json({ error: 'Recipe not found' });

        const { data, error } = await supabase
          .from('recipes')
          .update({ name, ingredients, instructions, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();

        if (error) 
          return res.status(500).json({ error: error.message });

        res.json({ message: 'Recipe updated successfully', recipe: data[0] });
      } 
      catch (error) 
      {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  };
  