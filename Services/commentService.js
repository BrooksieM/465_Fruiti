// Services/commentService.js
// In-memory comments per recipe with CRUD + like

module.exports = function (app, _supabase) {
  // Reuse the global store so comments persist while the process is alive
  const store = (globalThis.__store = globalThis.__store || {
    accounts: [],
    nextAccountId: 1,
    commentsByRecipe: {},
    nextCommentIdByRecipe: {},
  });
  if (!store.commentsByRecipe) store.commentsByRecipe = {};
  if (!store.nextCommentIdByRecipe) store.nextCommentIdByRecipe = {};

  // Ensure a recipe bucket exists and return its key
  const ensureRecipe = (recipeId) => {
    const key = String(recipeId);
    if (!store.commentsByRecipe[key]) {
      store.commentsByRecipe[key] = [];
      store.nextCommentIdByRecipe[key] = 1;
    }
    return key;
  };

  // Small helpers
  const toId = (v, kind) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error(`invalid ${kind} id`);
    return n;
  };
  const status = (_e) => 400;

  // Health check
  app.get('/api/comments/__ping', (_req, res) => res.json({ ok: true }));

  // Create a comment for a recipe (?recipe=ID), body: { text }
  app.post('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const { text } = req.body || {};
      if (!text || !String(text).trim()) throw new Error('text required');
      const key = ensureRecipe(recipeId);
      const id = store.nextCommentIdByRecipe[key]++;
      const comment = { id, authorId: null, text: String(text).trim(), likes: 0 };
      store.commentsByRecipe[key].push(comment);
      res.status(201).json({ recipeId, comment });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // List comments for a recipe, or fetch one via ?comment=ID
  app.get('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const key = ensureRecipe(recipeId);
      if (req.query.comment) {
        const cid = toId(req.query.comment, 'comment');
        const item = store.commentsByRecipe[key].find((c) => c.id === cid);
        if (!item) throw new Error('comment not found');
        return res.json(item);
      }
      res.json(store.commentsByRecipe[key]);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // Update comment text (?recipe=ID&comment=ID)
  app.put('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const cid = toId(req.query.comment, 'comment');
      const key = ensureRecipe(recipeId);
      const item = store.commentsByRecipe[key].find((c) => c.id === cid);
      if (!item) throw new Error('comment not found');
      const { text } = req.body || {};
      if (!text || !String(text).trim()) throw new Error('text required');
      item.text = String(text).trim();
      res.json(item);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // Increment like counter (?recipe=ID&comment=ID)
  app.put('/api/comments/like', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const cid = toId(req.query.comment, 'comment');
      const key = ensureRecipe(recipeId);
      const item = store.commentsByRecipe[key].find((c) => c.id === cid);
      if (!item) throw new Error('comment not found');
      item.likes += 1;
      res.json({ id: item.id, likes: item.likes });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // Delete a comment (?recipe=ID&comment=ID)
  app.delete('/api/comments', (req, res) => {
    try {
      const recipeId = toId(req.query.recipe, 'recipe');
      const cid = toId(req.query.comment, 'comment');
      const key = ensureRecipe(recipeId);
      const idx = store.commentsByRecipe[key].findIndex((c) => c.id === cid);
      if (idx === -1) throw new Error('comment not found');
      const [deleted] = store.commentsByRecipe[key].splice(idx, 1);
      res.json({ recipeId, deleted });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });
};
