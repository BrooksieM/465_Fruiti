// Services/articleService.js
// Static article catalogue with list and detail endpoints

module.exports = function (app, _supabase) {
  // Demo data; swap with DB later
  const articles = [
    { id: 1, title: 'How to Pick Fresh Apples', thumbnail: '/img/a1.jpg', summary: 'Quick tips for apples', body: 'Full body: apples...' },
    { id: 2, title: 'Blueberries 101',         thumbnail: '/img/a2.jpg', summary: 'All about blueberries', body: 'Full body: blueberries...' },
    { id: 3, title: 'Perfect Pie Crust',       thumbnail: '/img/a3.jpg', summary: 'Flaky crust basics',    body: 'Full body: pie crust...' },
    { id: 4, title: 'Farmers Market Guide',    thumbnail: '/img/a4.jpg', summary: 'Shop like a pro',       body: 'Full body: market...' },
  ];

  // List all or filter by `ids` query (?ids=1,3)
  app.get('/api/articles', (req, res) => {
    const raw = (req.query.ids || '').trim();
    if (!raw) return res.json({ count: articles.length, data: articles });
    const ids = raw.split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n > 0);
    if (!ids.length) return res.status(400).json({ error: 'ids must be a comma-separated list of integers' });
    const byId = new Map(articles.map(a => [a.id, a]));
    const found = ids.map(id => byId.get(id)).filter(Boolean);
    res.json({ count: found.length, data: found });
  });

  // Get article by :id
  app.get('/api/articles/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid article id' });
    const a = articles.find(x => x.id === id);
    if (!a) return res.status(404).json({ error: 'Article not found' });
    res.json(a);
  });
};
