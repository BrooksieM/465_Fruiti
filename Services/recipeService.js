module.exports = function (app, supabase) {
  const base = '/api/recipes';

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    return value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  }

  function fromArray(value) {
    if (Array.isArray(value)) return value.join('\n');
    if (value == null) return '';
    return String(value);
  }

  function mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      title: row.name || row.title || 'Untitled',
      summary: row.summary || '',
      ingredients: fromArray(row.ingredients),
      steps: row.steps || '',
      servings: row.servings || 0,
      minutes: row.minutes || 0,
      difficulty: row.difficulty || 'easy',
      coverUrl: row.cover_url || row.coverUrl || '',
      createdAt: row.created_at || null,
      likes: row.likes ?? 0,
      dislikes: row.dislikes ?? 0,
      rating: row.rating ?? 0
    };
  }

  app.get(base, async (req, res) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const items = (data || []).map(mapRow);
    res.json(items);
  });

  app.post(base, async (req, res) => {
    const { title, ingredients, steps, summary, servings, minutes, difficulty, coverUrl } = req.body || {};

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ error: 'Missing required fields: title, ingredients, steps' });
    }

    const insert = {
      name: title,
      ingredients: toArray(ingredients),
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

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(mapRow(data));
  });

  app.put(`${base}/:id`, async (req, res) => {
    const id = req.params.id;
    const body = req.body || {};

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

    for (const [key, value] of Object.entries(body)) {
      const column = map[key];
      if (!column) continue;
      if (key === 'ingredients') {
        patch[column] = toArray(value);
      } else {
        patch[column] = value;
      }
    }

    const { data, error } = await supabase
      .from('recipes')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(mapRow(data));
  });

  app.delete(`${base}/:id`, async (req, res) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  });
};
