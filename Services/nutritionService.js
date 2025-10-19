// Services/nutritionService.js

module.exports = function (app, _supabase) 
{
  // GET /api/nutrition/:id -> return nutrition for fruit id
  app.get('/api/nutrition/:id', async (req, res) => 
  {
    try 
    {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid fruit id' });
      }

      const { data, error } = await supabase
        .from('nutrition')
        .select('*')
        .eq('id', id)
        .single();

      if (error) 
      {
        if (error.code === 'PGRST116') 
        {
          return res.status(404).json({ error: 'Nutrition not found' });
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
};
