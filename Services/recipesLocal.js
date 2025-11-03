// Services/recipesLocal.js
// JSON-backed Recipes API with image upload. No DB changes.

const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const { readAll, writeAll, now, uid } = require('./kvRecipes');

const router = express.Router();

/* ------------ helpers ------------ */

function toSlug(s) {
  return String(s || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 64);
}

/* -------- image upload -------- */

const uploadDir = path.join(process.cwd(), 'public', 'images', 'recipes');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try { await fs.mkdir(uploadDir, { recursive: true }); } catch {}
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const base = path.parse(file.originalname).name
      .toLowerCase().replace(/[^a-z0-9\-]+/g, '-').slice(0, 40);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({ storage });

// POST /recipes/upload  (multipart) -> { url: "/images/recipes/<file>" }
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  res.json({ url: `/images/recipes/${req.file.filename}` });
});

/* --------- recipes --------- */

// GET /recipes?q=...
router.get('/', async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const store = await readAll();
  const items = Object.values(store)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(x => !q || (x.title || '').toLowerCase().includes(q));

  const shaped = items.map(x => {
    const avg = x.reviews.length ? x.reviews.reduce((s,r)=>s+r.rating,0)/x.reviews.length : 0;
    return {
      id: x.id,
      title: x.title,
      slug: x.slug,
      summary: x.summary,
      coverUrl: x.coverUrl,
      servings: x.servings,
      minutes: x.minutes,
      difficulty: x.difficulty || 'Easy',
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
      avgRating: +avg.toFixed(1),
      reviewCount: x.reviews.length,
      likeCount: x.likes.length
    };
  });

  res.json(shaped);
});

// POST /recipes  (JSON)
router.post('/', async (req, res) => {
  const { title, summary, coverUrl, servings, minutes, ingredients, steps, authorId, difficulty } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });

  const store = await readAll();
  const item = {
    id: uid(),
    slug: toSlug(title),
    title: String(title),
    summary: String(summary || ''),
    coverUrl: String(coverUrl || ''),
    servings: Number.isFinite(+servings) ? +servings : null,
    minutes: Number.isFinite(+minutes) ? +minutes : null,
    difficulty: ['Easy','Medium','Hard'].includes(difficulty) ? difficulty : 'Easy',
    ingredients: Array.isArray(ingredients) ? ingredients.map((t,i)=>({ id: uid(), line: String(t), pos: i })) : [],
    steps: Array.isArray(steps) ? steps.map((t,i)=>({ id: uid(), instruction: String(t), pos: i })) : [],
    reviews: [],
    likes: [],
    authorId: authorId || null,
    createdAt: now(),
    updatedAt: now()
  };

  store[item.id] = item;
  await writeAll(store);
  res.status(201).json(item);
});

// GET /recipes/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  const key = req.params.idOrSlug;
  const store = await readAll();
  const item = store[key] || Object.values(store).find(x => x.slug === key);
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});

// POST /recipes/:id/like   { userId }
router.post('/:id/like', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  if (!item.likes.includes(userId)) item.likes.push(userId);
  item.updatedAt = now();
  await writeAll(store);

  // return updated snapshot for convenience
  const avg = item.reviews.length ? item.reviews.reduce((s,r)=>s+r.rating,0)/item.reviews.length : 0;
  res.json({ likeCount: item.likes.length, avgRating: +avg.toFixed(1) });
});

// DELETE /recipes/:id/like   { userId }
router.delete('/:id/like', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  item.likes = item.likes.filter(x => x !== userId);
  item.updatedAt = now();
  await writeAll(store);

  const avg = item.reviews.length ? item.reviews.reduce((s,r)=>s+r.rating,0)/item.reviews.length : 0;
  res.json({ likeCount: item.likes.length, avgRating: +avg.toFixed(1) });
});

// POST /recipes/:id/reviews  { userId, rating 1..5, body }
router.post('/:id/reviews', async (req, res) => {
  const { userId, rating, body } = req.body || {};
  const r = +rating;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  if (!(r >= 1 && r <= 5)) return res.status(400).json({ error: 'rating 1..5' });

  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  const review = { id: uid(), reviewerId: userId, rating: r, body: String(body || ''), createdAt: now() };
  item.reviews.push(review);
  item.updatedAt = now();
  await writeAll(store);

  const avg = item.reviews.length ? item.reviews.reduce((s,r)=>s+r.rating,0)/item.reviews.length : 0;
  res.status(201).json({ ...review, avgRating: +avg.toFixed(1), reviewCount: item.reviews.length });
});

// DELETE /recipes/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', async (req, res) => {
  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  const before = item.reviews.length;
  item.reviews = item.reviews.filter(r => r.id !== req.params.reviewId);
  if (item.reviews.length === before) return res.status(404).json({ error: 'review not found' });

  item.updatedAt = now();
  await writeAll(store);
  res.json({ ok: true });
});

module.exports = router;
