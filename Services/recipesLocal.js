// Services/recipesLocal.js
// JSON-backed Recipes API with image upload. No DB changes.

const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const { readAll, writeAll, now, uid } = require('./kvRecipes');

const router = express.Router();

/* ------------ lightweight auth via headers ------------ */
/* The UI stores the logged-in user in localStorage and sends:
   - x-user-id
   - x-user-handle (optional)
*/
function attachUser(req, _res, next) {
  const uid = req.get('x-user-id');
  const handle = req.get('x-user-handle');
  if (uid) req.user = { id: String(uid), handle: handle || null };
  next();
}
router.use(attachUser);

function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'auth required' });
  next();
}

/* ------------ helpers ------------ */

function toSlug(s) {
  return String(s || '')
    .toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function ensureDir(p) {
  try { await fs.mkdir(p, { recursive: true }); } catch {}
}

/* ------------ static images path + upload ------------ */

const publicDir = path.join(process.cwd(), 'public');
const recipeImgDir = path.join(publicDir, 'images', 'recipes');

const storage = multer.diskStorage({
  destination: async function (_req, _file, cb) {
    try { await ensureDir(recipeImgDir); } catch {}
    cb(null, recipeImgDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({ storage });

// POST /recipes/upload (multipart) → { url: "/images/recipes/<file>" }
router.post('/upload', requireUser, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  res.json({ url: `/images/recipes/${req.file.filename}` });
});

/* ------------ recipes collection ------------ */

// GET /recipes?q=...
router.get('/', async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const store = await readAll();
  const items = Object.values(store)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(x => !q || (x.title || '').toLowerCase().includes(q));
  res.json(items);
});

// POST /recipes (auth required)
router.post('/', requireUser, async (req, res) => {
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
    difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Easy',
    ingredients: Array.isArray(ingredients) ? ingredients.map((t, i) => ({ id: uid(), line: String(t), pos: i })) : [],
    steps: Array.isArray(steps) ? steps.map((t, i) => ({ id: uid(), instruction: String(t), pos: i })) : [],
    reviews: [],
    likes: [],
    authorId: (req.user && req.user.id) || authorId || null,
    createdAt: now(),
    updatedAt: now()
  };

  store[item.id] = item;
  await writeAll(store);
  res.status(201).json(item);
});

/* ------------ single recipe ------------ */

// helper to find by id or slug
async function findByIdOrSlug(idOrSlug) {
  const store = await readAll();
  if (store[idOrSlug]) return store[idOrSlug];
  const hit = Object.values(store).find(x => x.slug === idOrSlug);
  return hit || null;
}

// GET /recipes/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  const item = await findByIdOrSlug(req.params.idOrSlug);
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});

/* ------------ likes ------------ */

// POST /recipes/:id/like (auth required)
router.post('/:id/like', requireUser, async (req, res) => {
  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  const uid = String(req.user.id);
  if (!item.likes.includes(uid)) item.likes.push(uid);
  item.updatedAt = now();

  await writeAll(store);
  res.json({ ok: true, likes: item.likes.length });
});

// DELETE /recipes/:id/like (auth required)
router.delete('/:id/like', requireUser, async (req, res) => {
  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  const uid = String(req.user.id);
  item.likes = item.likes.filter(x => String(x) !== uid);
  item.updatedAt = now();

  await writeAll(store);
  res.json({ ok: true, likes: item.likes.length });
});

/* ------------ reviews ------------ */

// POST /recipes/:id/reviews  (auth required)
router.post('/:id/reviews', requireUser, async (req, res) => {
  const { rating, body } = req.body || {};
  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  const r = Math.max(1, Math.min(5, Number(rating)));
  const review = { id: uid(), userId: String(req.user.id), rating: r, body: String(body || ''), createdAt: now() };
  item.reviews.push(review);
  item.updatedAt = now();

  await writeAll(store);
  res.status(201).json(review);
});

// DELETE /recipes/:id/reviews/:reviewId  (auth required; author of review or recipe owner may remove)
router.delete('/:id/reviews/:reviewId', requireUser, async (req, res) => {
  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  const before = item.reviews.length;
  item.reviews = item.reviews.filter(r =>
    !(String(r.id) === String(req.params.reviewId) &&
      (String(r.userId) === String(req.user.id) || String(item.authorId) === String(req.user.id)))
  );
  if (item.reviews.length === before) return res.status(404).json({ error: 'review not found' });

  item.updatedAt = now();
  await writeAll(store);
  res.json({ ok: true });
});

/* ------------ delete recipe (author only) ------------ */

// DELETE /recipes/:id (auth required + owner)
router.delete('/:id', requireUser, async (req, res) => {
  const store = await readAll();
  const item = store[req.params.id];
  if (!item) return res.status(404).json({ error: 'not found' });

  if (!item.authorId || String(item.authorId) !== String(req.user.id)) {
    return res.status(403).json({ error: 'not your recipe' });
  }
  delete store[req.params.id];
  await writeAll(store);
  res.json({ ok: true });
});

module.exports = router;
