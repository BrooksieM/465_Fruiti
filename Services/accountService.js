// Services/accountService.js
// Exposes CRUD-style endpoints for in-memory "accounts" (no DB)
// The module exports a function that receives Express `app` and optional `supabase`

module.exports = function (app, _supabase) {
  // Simple in-memory store shared across services via globalThis
  const store = (globalThis.__store = globalThis.__store || {
    accounts: [],
    nextAccountId: 1,
    commentsByRecipe: {},
    nextCommentIdByRecipe: {},
  });

  // Defensive normalization in case hot-reload altered values
  if (!Array.isArray(store.accounts)) store.accounts = [];
  if (!Number.isInteger(store.nextAccountId)) {
    store.nextAccountId =
      (store.accounts.reduce((m, a) => Math.max(m, a.id || 0), 0) + 1) || 1;
  }

  // Helpers
  const toId = (v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('invalid id');
    return n;
  };
  const mustAccount = (id) => {
    const a = store.accounts.find((x) => x.id === id);
    if (!a) throw new Error('not found');
    return a;
  };
  const status = (e) => (/not found/i.test(e.message) ? 404 : 400);

  // Health check for Postman / readiness
  app.get('/api/accounts/__ping', (_req, res) => res.json({ ok: true }));

  // Create account
  // Body: { handle, email, ...extra }
  app.post('/api/accounts', (req, res) => {
    try {
      const { handle, email, ...extra } = req.body || {};
      if (!handle || !email) throw new Error('handle and email are required');
      const acct = {
        id: store.nextAccountId++,
        handle,
        email,
        avatar: null,
        paymentMethod: null,
        ...extra,
      };
      store.accounts.push(acct);
      res.status(201).json(acct);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // List accounts
  app.get('/api/accounts', (_req, res) => res.json(store.accounts));

  // Get one account
  app.get('/api/accounts/:id', (req, res) => {
    try {
      res.json(mustAccount(toId(req.params.id)));
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // Update account (partial)
  // Body can include: handle, email, and any additional fields
  app.put('/api/accounts/:id', (req, res) => {
    try {
      const a = mustAccount(toId(req.params.id));
      const { handle, email, ...rest } = req.body || {};
      if (handle !== undefined) a.handle = handle;
      if (email !== undefined) a.email = email;
      Object.assign(a, rest);
      res.json(a);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // Set/replace avatar URL
  app.put('/api/accounts/:id/profile-picture', (req, res) => {
    try {
      const a = mustAccount(toId(req.params.id));
      const { url } = req.body || {};
      if (!url) throw new Error('url required');
      a.avatar = url;
      res.json({ avatar: a.avatar });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // Upsert payment method details
  app.put('/api/accounts/:id/payment-method', (req, res) => {
    try {
      const a = mustAccount(toId(req.params.id));
      const { brand, last4 } = req.body || {};
      if (!brand || !last4) throw new Error('brand and last4 required');
      a.paymentMethod = { brand, last4 };
      res.json(a.paymentMethod);
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

  // Delete account by ID
  app.delete('/api/accounts/:id', (req, res) => {
    try {
      const id = toId(req.params.id);
      const idx = store.accounts.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('not found');
      const [deleted] = store.accounts.splice(idx, 1);
      res.json({ deleted });
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });
};
