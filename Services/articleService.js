// Services/articleService.js

module.exports = function (app, supabase) 
{
  // GET /api/articles?ids=1,2,3  -> list by ids (order preserved). No ids -> return all.
  app.get('/api/articles', async (req, res) => 
  {
    try 
    {
      const raw = (req.query.ids || '').trim();
      
      if (!raw) 
      {
        // Return all articles
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) 
        {
          console.error('Articles query error:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.json({ count: data.length, data: data });
      }

      // Handle specific IDs
      const ids = raw.split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n > 0);

      if (!ids.length) 
      {
        return res.status(400).json({ error: 'ids must be a comma-separated list of integers' });
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .in('id', ids)
        .order('id');

      if (error) 
      {
        console.error('Articles query error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Preserve the order from the query
      const byId = new Map(data.map(a => [a.id, a]));
      const found = ids.map(id => byId.get(id)).filter(Boolean);

      res.json({ count: found.length, data: found });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/articles/:id -> full article
  app.get('/api/articles/:id', async (req, res) => 
  {
    try 
    {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid article id' });
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) 
      {
        if (error.code === 'PGRST116') 
        {
          return res.status(404).json({ error: 'Article not found' });
        }

        console.error('Article query error:', error);
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