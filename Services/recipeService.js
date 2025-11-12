module.exports = function (app, supabase) {
  const base = '/api/recipes';

  app.get(base, async (req, res) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const items = (data || []).map(r => ({
      id: r.id,
      title: r.name || r.title || 'Untitled',
      summary: r.summary || '',
      ingredients: r.ingredients || '',
      steps: r.steps || '',
      servings: r.servings || 0,
      minutes: r.minutes || 0,
      difficulty: r.difficulty || 'easy',
      coverUrl: r.cover_url || r.coverUrl || '',
      createdAt: r.created_at || null,
      likes: r.likes ?? 0,
      dislikes: r.dislikes ?? 0,
      rating: r.rating ?? 0
    }));

    res.json(items);
  });

  app.post(base, async (req, res) => {
    const { title, ingredients, steps, summary, servings, minutes, difficulty, coverUrl } = req.body;

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ error: 'Missing required fields: title, ingredients, steps' });
    }

    const insert = {
      name: title,
      ingredients,
      steps,
      summary: summary || '',
      servings: servings ? Number(servings) : null,
      minutes: minutes ? Number(minutes) : null,
      difficulty: difficulty || 'easy',
      cover_url: coverUrl || '',
      likes: 0,
      dislikes: 0,
      rating: 0
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert([insert])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({
      id: data.id,
      title: data.name,
      summary: data.summary || '',
      ingredients: data.ingredients || '',
      steps: data.steps || '',
      servings: data.servings || 0,
      minutes: data.minutes || 0,
      difficulty: data.difficulty || 'easy',
      coverUrl: data.cover_url || '',
      createdAt: data.created_at || null,
      likes: data.likes ?? 0,
      dislikes: data.dislikes ?? 0,
      rating: data.rating ?? 0
    });
  });

  app.put(`${base}/:id`, async (req, res) => {
    const id = req.params.id;
    const map = {
      title: 'name',
      summary: 'summary',
      ingredients: 'ingredients',
      steps: 'steps',
      servings: 'servings',
      minutes: 'minutes',
      difficulty: 'difficulty',
      coverUrl: 'cover_url',
      likes: 'likes',
      dislikes: 'dislikes',
      rating: 'rating'
    };

    const patch = {};
    for (const [k, v] of Object.entries(req.body || {})) {
      if (map[k]) patch[map[k]] = v;
    }

    const { data, error } = await supabase
      .from('recipes')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      id: data.id,
      title: data.name,
      summary: data.summary || '',
      ingredients: data.ingredients || '',
      steps: data.steps || '',
      servings: data.servings || 0,
      minutes: data.minutes || 0,
      difficulty: data.difficulty || 'easy',
      coverUrl: data.cover_url || '',
      createdAt: data.created_at || null,
      likes: data.likes ?? 0,
      dislikes: data.dislikes ?? 0,
      rating: data.rating ?? 0
    });
  });

  app.delete(`${base}/:id`, async (req, res) => {
    const { error } = await supabase.from('recipes').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  });
};
