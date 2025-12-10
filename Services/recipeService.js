const { analyzeRecipeImageForSeason } = require('./openaiService');

module.exports = function (app, supabase, supabaseAdmin)
{
    // Create a recipe (requires authentication)
    app.post('/api/recipes', async (req, res) =>
    {
      try
      {
        const { name, ingredients, instructions, difficulty, estimatedTime, image, userId, season } = req.body;

        // Validate required fields
        if (!name || !ingredients || !instructions || !userId)
          return res.status(400).json({ error: 'Missing required fields (name, ingredients, instructions, userId)' });

        if (!difficulty || !estimatedTime)
          return res.status(400).json({ error: 'Missing required fields (difficulty, estimatedTime)' });

        // Validate input lengths
        if (typeof name !== 'string' || name.trim().length === 0 || name.length > 255)
          return res.status(400).json({ error: 'Recipe name must be between 1 and 255 characters' });

        // Validate instructions format
        let parsedInstructions = instructions;
        if (typeof instructions === 'string') {
          try {
            parsedInstructions = JSON.parse(instructions);
            if (!Array.isArray(parsedInstructions) || parsedInstructions.length === 0) {
              return res.status(400).json({ error: 'Instructions must be a non-empty array' });
            }
          } catch {
            return res.status(400).json({ error: 'Instructions must be a valid JSON array' });
          }
        }

        // Validate difficulty
        if (!['Easy', 'Medium', 'Hard'].includes(difficulty))
          return res.status(400).json({ error: 'Difficulty must be Easy, Medium, or Hard' });

        // Validate estimated time
        if (!Number.isInteger(estimatedTime) || estimatedTime <= 0)
          return res.status(400).json({ error: 'Estimated time must be a positive integer' });

        // Validate season (optional field)
        const validSeasons = ['spring', 'summer', 'fall', 'winter', 'none', 'auto'];
        if (season && !validSeasons.includes(season.toLowerCase())) {
          return res.status(400).json({ error: 'Season must be one of: spring, summer, fall, winter, none, or auto' });
        }

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
          .from('recipe_new')
          .insert([{
            name: name.trim(),
            ingredients: parsedIngredients,
            instructions: parsedInstructions,
            difficulty: difficulty,
            estimated_time: estimatedTime,
            image: image || null,
            user_id: userId,
            season_name: season ? season.toLowerCase() : 'auto',
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
          .from('recipe_new')
          .select('*, accounts(handle)')
          .order('created_at', { ascending: false });

        if (error)
          return res.status(500).json({ error: error.message });

        // Map the data to include creator handle at top level for easier frontend access
        const recipesWithCreator = data.map(recipe => ({
          ...recipe,
          creator_handle: recipe.accounts?.handle || 'Unknown'
        }));

        res.json(recipesWithCreator);
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
          .from('recipe_new')
          .select('id, user_id, image')
          .eq('id', id)
          .single();

        if (checkError)
          return res.status(404).json({ error: 'Recipe not found' });

        // Verify user owns the recipe
        if (recipe.user_id !== userId)
          return res.status(403).json({ error: 'You can only delete your own recipes' });

        // Delete the image from Supabase Storage if it exists
        if (recipe.image) {
          try {
            let filename;

            // Handle both URL and filename formats
            if (recipe.image.includes('/')) {
              // If it's a full URL, extract the filename
              filename = recipe.image.split('/').pop();
            } else {
              // If it's just a filename, use it directly
              filename = recipe.image;
            }

            await supabaseAdmin.storage
              .from('recipe-images')
              .remove([filename]);
          } catch (storageError) {
            console.error('Error deleting image from storage:', storageError);
            // Continue with recipe deletion even if image deletion fails
          }
        }

        // Delete the recipe
        const { error } = await supabase
          .from('recipe_new')
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
          .from('recipe_new')
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
        const { name, ingredients, instructions, difficulty, estimatedTime, image, userId, season } = req.body;

        // Validate ID
        if (!Number.isInteger(id) || id <= 0)
          return res.status(400).json({ error: 'Invalid recipe ID' });

        // Check if user provided userId
        if (!userId)
          return res.status(401).json({ error: 'User ID required for updates' });

        // Validate that at least one field is being updated
        if (!name && !ingredients && !instructions && !difficulty && !estimatedTime && !image && !season)
          return res.status(400).json({ error: 'At least one field must be provided' });

        // Validate inputs if provided
        if (name && (typeof name !== 'string' || name.trim().length === 0 || name.length > 255))
          return res.status(400).json({ error: 'Recipe name must be between 1 and 255 characters' });

        // Validate instructions format if provided
        let parsedInstructions = instructions;
        if (instructions) {
          if (typeof instructions === 'string') {
            try {
              parsedInstructions = JSON.parse(instructions);
              if (!Array.isArray(parsedInstructions) || parsedInstructions.length === 0) {
                return res.status(400).json({ error: 'Instructions must be a non-empty array' });
              }
            } catch {
              return res.status(400).json({ error: 'Instructions must be a valid JSON array' });
            }
          }
        }

        // Validate difficulty if provided
        if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty))
          return res.status(400).json({ error: 'Difficulty must be Easy, Medium, or Hard' });

        // Validate estimated time if provided
        if (estimatedTime && (!Number.isInteger(estimatedTime) || estimatedTime <= 0))
          return res.status(400).json({ error: 'Estimated time must be a positive integer' });

        // Validate season if provided
        const validSeasons = ['spring', 'summer', 'fall', 'winter', 'none', 'auto'];
        if (season && !validSeasons.includes(season.toLowerCase())) {
          return res.status(400).json({ error: 'Season must be one of: spring, summer, fall, winter, none, or auto' });
        }

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
          .from('recipe_new')
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
        if (instructions) updateData.instructions = parsedInstructions;
        if (ingredients) updateData.ingredients = parsedIngredients;
        if (difficulty) updateData.difficulty = difficulty;
        if (estimatedTime) updateData.estimated_time = estimatedTime;
        if (image) updateData.image = image;
        if (season) updateData.season_name = season.toLowerCase();

        const { data, error } = await supabase
          .from('recipe_new')
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

    // Analyze recipe image for season using OpenAI
    app.post('/api/recipes/analyze-image', async (req, res) =>
    {
      try
      {
        const { imageUrl } = req.body;

        // Validate required fields
        if (!imageUrl)
          return res.status(400).json({ error: 'Missing required field: imageUrl' });

        // Call OpenAI to analyze the image
        const detectedSeason = await analyzeRecipeImageForSeason(imageUrl);

        res.status(200).json({
          season: detectedSeason,
          message: `Image analyzed successfully. Detected season: ${detectedSeason}`
        });
      }
      catch (error)
      {
        console.error('Error analyzing recipe image:', error);
        res.status(500).json({
          error: 'Failed to analyze image',
          details: error.message
        });
      }
    });

  // ========== RECIPE RATING ENDPOINTS ==========

  // Submit or update a recipe rating
  app.post('/api/recipes/:recipeId/rating', async (req, res) => {
    try {
      const recipeId = Number(req.params.recipeId);
      const { rating, user_id, comment } = req.body;

      // Validate inputs
      if (!Number.isInteger(recipeId) || recipeId <= 0) {
        return res.status(400).json({ error: 'Invalid recipe ID' });
      }

      if (!rating || !user_id) {
        return res.status(400).json({ error: 'Rating and user_id are required' });
      }

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Check if recipe exists
      const { data: recipe, error: recipeError } = await supabase
        .from('recipe_new')
        .select('id, user_id')
        .eq('id', recipeId)
        .single();

      if (recipeError || !recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Prevent users from rating their own recipes
      if (recipe.user_id === user_id) {
        return res.status(403).json({ error: 'You cannot rate your own recipe' });
      }

      // Check if user has already rated this recipe
      const { data: existingRating } = await supabase
        .from('recipe_ratings')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user_id)
        .single();

      let result;
      if (existingRating) {
        // Update existing rating
        const { data, error } = await supabase
          .from('recipe_ratings')
          .update({
            rating,
            comment: comment || null,
            updated_at: new Date().toISOString()
          })
          .eq('recipe_id', recipeId)
          .eq('user_id', user_id)
          .select();

        if (error) {
          console.error('Error updating rating:', error);
          return res.status(500).json({ error: 'Failed to update rating' });
        }
        result = data[0];
      } else {
        // Insert new rating
        const { data, error } = await supabase
          .from('recipe_ratings')
          .insert([{
            recipe_id: recipeId,
            user_id: user_id,
            rating,
            comment: comment || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (error) {
          console.error('Error inserting rating:', error);
          return res.status(500).json({ error: 'Failed to submit rating' });
        }
        result = data[0];
      }

      res.status(200).json({
        message: 'Rating submitted successfully',
        rating: result
      });
    } catch (error) {
      console.error('Error in recipe rating endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all ratings for a recipe
  app.get('/api/recipes/:recipeId/ratings', async (req, res) => {
    try {
      const recipeId = Number(req.params.recipeId);

      if (!Number.isInteger(recipeId) || recipeId <= 0) {
        return res.status(400).json({ error: 'Invalid recipe ID' });
      }

      // Fetch all ratings
      const { data: ratings, error } = await supabase
        .from('recipe_ratings')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ratings:', error);
        return res.status(500).json({ error: 'Failed to fetch ratings' });
      }

      // Calculate average rating
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      // Fetch user handles for each rating
      const formattedRatings = await Promise.all(ratings.map(async (rating) => {
        let userHandle = 'Unknown User';

        try {
          const { data: userData } = await supabase
            .from('accounts')
            .select('handle')
            .eq('id', rating.user_id)
            .single();

          if (userData) {
            userHandle = userData.handle;
          }
        } catch (err) {
          console.error(`Error fetching user handle for user ${rating.user_id}:`, err);
        }

        return {
          id: rating.id,
          recipe_id: rating.recipe_id,
          user_id: rating.user_id,
          user_handle: userHandle,
          rating: rating.rating,
          comment: rating.comment,
          created_at: rating.created_at,
          updated_at: rating.updated_at
        };
      }));

      res.status(200).json({
        ratings: formattedRatings,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: ratings.length
      });
    } catch (error) {
      console.error('Error in get ratings endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get top-rated recipes
  app.get('/api/recipes/top-rated/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 3;

      // Get all recipes with their ratings
      const { data: recipes, error: recipesError } = await supabase
        .from('recipe_new')
        .select('*, accounts(handle)')
        .order('created_at', { ascending: false });

      if (recipesError) {
        return res.status(500).json({ error: recipesError.message });
      }

      // For each recipe, get its average rating
      const recipesWithRatings = await Promise.all(recipes.map(async (recipe) => {
        const { data: ratings, error: ratingsError } = await supabase
          .from('recipe_ratings')
          .select('rating')
          .eq('recipe_id', recipe.id);

        if (ratingsError) {
          console.error(`Error fetching ratings for recipe ${recipe.id}:`, ratingsError);
          return {
            ...recipe,
            creator_handle: recipe.accounts?.handle || 'Unknown',
            averageRating: 0,
            totalRatings: 0
          };
        }

        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

        return {
          ...recipe,
          creator_handle: recipe.accounts?.handle || 'Unknown',
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: ratings.length
        };
      }));

      // Sort by average rating (desc), then by total ratings (desc)
      recipesWithRatings.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.totalRatings - a.totalRatings;
      });

      // Return top N recipes
      res.json(recipesWithRatings.slice(0, limit));
    } catch (error) {
      console.error('Error fetching top-rated recipes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};


