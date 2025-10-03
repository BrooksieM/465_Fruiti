/**
 * Comments API
 * Mount path: /api/comments
 *
 * HOW TO TEST (Windows CMD)
 * ----------------------------------------------------------
 * Create a comment on recipe 1:
 *   curl.exe -X POST http://localhost:3000/api/comments?recipe=1 -H "Content-Type: application/json" -d "{\"text\":\"Nice pie!\"}"
 *
 * List comments for recipe 1:
 *   curl.exe http://localhost:3000/api/comments?recipe=1
 *
 * Edit comment id=1 on recipe 1 (note ^& escapes & in CMD):
 *   curl.exe -X PUT http://localhost:3000/api/comments?recipe=1^&comment=1 -H "Content-Type: application/json" -d "{\"text\":\"Edited\"}"
 *
 * Like comment id=1 on recipe 1:
 *   curl.exe -X PUT http://localhost:3000/api/comments/like?recipe=1^&comment=1
 *
 * Delete comment id=1 on recipe 1:
 *   curl.exe -X DELETE http://localhost:3000/api/comments?recipe=1^&comment=1
 * ----------------------------------------------------------
 */
const express = require('express');
const { commentsByRecipe, nextCommentId } = require('../data/store');

const r = express.Router();

// health
r.get('/__ping', (_req, res) => res.json({ ok: true, scope: 'comments' }));

// helper: resolve a recipe comments list via ?recipe=:id
function getList(req) {
  const recipeId = Number(req.query.recipe);
  if (!Number.isInteger(recipeId) || recipeId <= 0) return { error: 'valid recipe query param required' };
  const list = commentsByRecipe[recipeId] || (commentsByRecipe[recipeId] = []);
  return { recipeId, list };
}

// GET /api/comments?recipe=:id   -> list comments
r.get('/', (req, res) => {
  const { error, list } = getList(req);
  if (error) return res.status(400).json({ error });
  res.json(list);
});

// POST /api/comments?recipe=:id  -> create comment { text, authorId? }
r.post('/', (req, res) => {
  const { error, list, recipeId } = getList(req);
  if (error) return res.status(400).json({ error });
  const { authorId = null, text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });
  const c = { id: nextCommentId(list), authorId, text, likes: 0 };
  list.push(c);
  res.status(201).json({ recipeId, comment: c });
});

// PUT /api/comments?recipe=:id&comment=:id  -> edit comment { text }
r.put('/', (req, res) => {
  const { error, list } = getList(req);
  if (error) return res.status(400).json({ error });
  const commentId = Number(req.query.comment);
  const c = list.find(x => x.id === commentId);
  if (!c) return res.status(404).json({ error: 'comment not found' });
  const { text } = req.body || {};
  if (text) c.text = text;
  res.json(c);
});

// PUT /api/comments/like?recipe=:id&comment=:id -> like a comment
r.put('/like', (req, res) => {
  const { error, list } = getList(req);
  if (error) return res.status(400).json({ error });
  const commentId = Number(req.query.comment);
  const c = list.find(x => x.id === commentId);
  if (!c) return res.status(404).json({ error: 'comment not found' });
  c.likes += 1;
  res.json({ id: c.id, likes: c.likes });
});

// DELETE /api/comments?recipe=:id&comment=:id  -> delete comment
r.delete('/', (req, res) => {
  const { error, list } = getList(req);
  if (error) return res.status(400).json({ error });
  const commentId = Number(req.query.comment);
  const idx = list.findIndex(x => x.id === commentId);
  if (idx === -1) return res.status(404).json({ error: 'comment not found' });
  const [deleted] = list.splice(idx, 1);
  res.json({ deleted });
});

module.exports = r;
