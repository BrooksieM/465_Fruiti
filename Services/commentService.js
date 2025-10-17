////////comment_service//////
(() => {
  // ensure shared store exists
  const store = (globalThis.__store = globalThis.__store || {
    accounts: [],
    nextAccountId: 1,
    commentsByRecipe: {},
    nextCommentIdByRecipe: {},
  });
  if (!store.commentsByRecipe) store.commentsByRecipe = {};
  if (!store.nextCommentIdByRecipe) store.nextCommentIdByRecipe = {};
  const ensureRecipe = (recipeId) => {
    const key = String(recipeId);
    if (!store.commentsByRecipe[key]) {
      store.commentsByRecipe[key] = [];
      store.nextCommentIdByRecipe[key] = 1;
    }
    return key;
  };

  // helpers
  const toId = (v, kind) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error(`invalid ${kind} id`);
    return n;
  };
  const status = (e) => (/not found|valid .* required/i.test(e.message) ? 400 : 400); // simple map

  // dev ping
  app.get('/api/comments/__ping', (_req, res) => res.json({ ok: true }));

  // POST /api/comments?recipe=1  { text }
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

  // GET /api/comments?recipe=1            -> list
  // GET /api/comments?recipe=1&comment=1  -> single
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

  // PUT /api/comments?recipe=1&comment=1  { text }
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

  // PUT /api/comments/like?recipe=1&comment=1
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

  // DELETE /api/comments?recipe=1&comment=1
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
})();

/* CMD tests:
curl.exe "http://localhost:3000/api/comments/__ping"
curl.exe -X POST "http://localhost:3000/api/comments?recipe=1" -H "Content-Type: application/json" -d "{\"text\":\"Nice pie!\"}"
curl.exe "http://localhost:3000/api/comments?recipe=1"
curl.exe "http://localhost:3000/api/comments?recipe=1&comment=1"
curl.exe -X PUT "http://localhost:3000/api/comments?recipe=1&comment=1" -H "Content-Type: application/json" -d "{\"text\":\"Edited\"}"
curl.exe -X PUT "http://localhost:3000/api/comments/like?recipe=1&comment=1"
curl.exe -X DELETE "http://localhost:3000/api/comments?recipe=1&comment=1"
*/
////////comment_service end//////
