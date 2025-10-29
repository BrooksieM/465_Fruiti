// Services/commentService.js

module.exports = function (app, supabase) 
{
  // Dev ping
  app.get('/api/comments/__ping', (_req, res) => res.json({ ok: true }));

  // POST /api/comments?recipe=1 { text }
  app.post('/api/comments', async (req, res) => 
  {
    try 
    {
      const recipeId = Number(req.query.recipe);
      const { text, authorId } = req.body || {};

      if (!Number.isInteger(recipeId) || recipeId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid recipe id' });
      }

      if (!text || !String(text).trim()) 
      {
        return res.status(400).json({ error: 'Text is required' });
      }

      // Check if recipe exists
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', recipeId)
        .single();

      if (recipeError && recipeError.code === 'PGRST116') 
      {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Insert comment
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            recipe_id: recipeId,
            author_id: authorId || null,
            text: String(text).trim(),
            likes: 0,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) 
      {
        console.error('Comment insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({
        recipeId,
        comment: data[0]
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/comments?recipe=1 -> list all comments for recipe
  // GET /api/comments?recipe=1&comment=1 -> get single comment
  app.get('/api/comments', async (req, res) => 
  {
    try 
    {
      const recipeId = Number(req.query.recipe);
      const commentId = req.query.comment ? Number(req.query.comment) : null;

      if (!Number.isInteger(recipeId) || recipeId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid recipe id' });
      }

      if (commentId) 
        {
        // Get single comment
        if (!Number.isInteger(commentId) || commentId <= 0) 
        {
          return res.status(400).json({ error: 'Invalid comment id' });
        }

        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('recipe_id', recipeId)
          .eq('id', commentId)
          .single();

        if (error) 
        {
          if (error.code === 'PGRST116') 
          {
            return res.status(404).json({ error: 'Comment not found' });
          }

          console.error('Comment query error:', error);
          return res.status(500).json({ error: error.message });
        }

        res.json(data);
      } 
      else 
      {
        // Get all comments for recipe
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('recipe_id', recipeId)
          .order('created_at', { ascending: true });

        if (error) 
        {
          console.error('Comments query error:', error);
          return res.status(500).json({ error: error.message });
        }

        res.json(data);
      }
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/comments?recipe=1&comment=1 { text }
  app.put('/api/comments', async (req, res) => 
  {
    try 
    {
      const recipeId = Number(req.query.recipe);
      const commentId = Number(req.query.comment);
      const { text } = req.body || {};

      if (!Number.isInteger(recipeId) || recipeId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid recipe id' });
      }

      if (!Number.isInteger(commentId) || commentId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid comment id' });
      }

      if (!text || !String(text).trim()) 
      {
        return res.status(400).json({ error: 'Text is required' });
      }

      // Check if comment exists and belongs to the recipe
      const { data: existingComment, error: checkError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', commentId)
        .eq('recipe_id', recipeId)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Update comment
      const { data, error } = await supabase
        .from('comments')
        .update({
          text: String(text).trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('recipe_id', recipeId)
        .select();

      if (error) 
      {
        console.error('Comment update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data[0]);
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/comments/like?recipe=1&comment=1
  app.put('/api/comments/like', async (req, res) => 
  {
    try 
    {
      const recipeId = Number(req.query.recipe);
      const commentId = Number(req.query.comment);

      if (!Number.isInteger(recipeId) || recipeId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid recipe id' });
      }

      if (!Number.isInteger(commentId) || commentId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid comment id' });
      }

      // Check if comment exists and belongs to the recipe
      const { data: existingComment, error: checkError } = await supabase
        .from('comments')
        .select('id, likes')
        .eq('id', commentId)
        .eq('recipe_id', recipeId)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Increment likes
      const { data, error } = await supabase
        .from('comments')
        .update({
          likes: existingComment.likes + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('recipe_id', recipeId)
        .select('id, likes');

      if (error) 
      {
        console.error('Like update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        id: data[0].id,
        likes: data[0].likes
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/comments?recipe=1&comment=1
  app.delete('/api/comments', async (req, res) => 
  {
    try 
    {
      const recipeId = Number(req.query.recipe);
      const commentId = Number(req.query.comment);

      if (!Number.isInteger(recipeId) || recipeId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid recipe id' });
      }
      if (!Number.isInteger(commentId) || commentId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid comment id' });
      }

      // Check if comment exists and belongs to the recipe
      const { data: existingComment, error: checkError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', commentId)
        .eq('recipe_id', recipeId)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Delete comment
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('recipe_id', recipeId);

      if (error) 
      {
        console.error('Comment delete error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        recipeId,
        deleted: { id: commentId }
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/comments/stats?recipe=1 -> get comment statistics for a recipe
  app.get('/api/comments/stats', async (req, res) => 
  {
    try 
    {
      const recipeId = Number(req.query.recipe);

      if (!Number.isInteger(recipeId) || recipeId <= 0) 
      {
        return res.status(400).json({ error: 'Invalid recipe id' });
      }

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('recipe_id', recipeId);

      if (error) 
      {
        console.error('Comments stats error:', error);
        return res.status(500).json({ error: error.message });
      }

      const totalComments = data.length;
      const totalLikes = data.reduce((sum, comment) => sum + comment.likes, 0);
      const averageLikes = totalComments > 0 ? totalLikes / totalComments : 0;

      res.json({
        recipeId,
        totalComments,
        totalLikes,
        averageLikes: Math.round(averageLikes * 100) / 100
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};