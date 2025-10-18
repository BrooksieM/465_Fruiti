// Services/adminService.js
// Lightweight admin endpoints (placeholders now; wire to real admin logic later)

module.exports = function (app, supabase) {
  // Sanity probe for service wiring
  app.get('/api/admin/__ping', (_req, res) => res.json({ ok: true }));

  // Example list endpoint (replace with a real query if needed)
  app.get('/api/admin/health', async (_req, res) => {
    try {
      // If you later depend on Supabase, expand checks here
      const up = !!supabase;
      res.json({ up, time: new Date().toISOString() });
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  // Placeholder admin account listing
  app.get('/api/admin/account', (_req, res) => {
    res.json({ message: 'This is where the user list would go.' });
  });

  // Placeholder delete
  app.delete('/api/admin/account/:id', (_req, res) => {
    res.json({ message: 'User account deleted successfully.' });
  });

  // Placeholder restore
  app.post('/api/admin/account/:id/restore', (_req, res) => {
    res.json({ message: 'User account restored successfully.' });
  });
};
