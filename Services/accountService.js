////////account_service/////
(() => {
  // shared in-memory store (safe-init if it already exists)
  const store = (globalThis.__store = globalThis.__store || {
    accounts: [],
    nextAccountId: 1,
    commentsByRecipe: {},
    nextCommentIdByRecipe: {},
  });
  if (!Array.isArray(store.accounts)) store.accounts = [];
  if (!Number.isInteger(store.nextAccountId)) {
    store.nextAccountId = (store.accounts.reduce((m, a) => Math.max(m, a.id || 0), 0) + 1) || 1;
  }

  // helpers
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

  // routes
  app.get('/api/accounts/__ping', (_req, res) => res.json({ ok: true }));

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

  app.get('/api/accounts', (_req, res) => res.json(store.accounts));

  app.get('/api/accounts/:id', (req, res) => {
    try {
      res.json(mustAccount(toId(req.params.id)));
    } catch (e) {
      res.status(status(e)).json({ error: e.message });
    }
  });

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
})();

/* CMD tests:
curl.exe "http://localhost:3000/api/accounts/__ping"
curl.exe -X POST "http://localhost:3000/api/accounts" -H "Content-Type: application/json" -d "{\"handle\":\"buyer7\",\"email\":\"b7@example.com\"}"
curl.exe "http://localhost:3000/api/accounts"
curl.exe "http://localhost:3000/api/accounts/1"
curl.exe -X PUT "http://localhost:3000/api/accounts/1" -H "Content-Type: application/json" -d "{\"handle\":\"buyer77\"}"
curl.exe -X PUT "http://localhost:3000/api/accounts/1/profile-picture" -H "Content-Type: application/json" -d "{\"url\":\"https://img.example.com/a.png\"}"
curl.exe -X PUT "http://localhost:3000/api/accounts/1/payment-method" -H "Content-Type: application/json" -d "{\"brand\":\"visa\",\"last4\":\"4242\"}"
curl.exe -X DELETE "http://localhost:3000/api/accounts/1"
*/
////////account_service end//////