/**
 * Accounts API
 * Mount path: /api/accounts
 *
 * HOW TO TEST (Windows CMD)
 * ----------------------------------------------------------
 * Health:
 *   curl.exe http://localhost:3000/api/accounts/__ping
 *
 * Create account:
 *   curl.exe -X POST http://localhost:3000/api/accounts -H "Content-Type: application/json" -d "{\"handle\":\"buyer7\",\"email\":\"b7@example.com\"}"
 *
 * List accounts:
 *   curl.exe http://localhost:3000/api/accounts
 *
 * Get one (replace 1 with the returned id):
 *   curl.exe http://localhost:3000/api/accounts/1
 *
 * Edit (handle/email):
 *   curl.exe -X PUT http://localhost:3000/api/accounts/1 -H "Content-Type: application/json" -d "{\"handle\":\"buyer7_edit\",\"email\":\"b7@example.com\"}"
 *
 * Update profile picture:
 *   curl.exe -X PUT http://localhost:3000/api/accounts/1/profile-picture -H "Content-Type: application/json" -d "{\"url\":\"https://example.com/a.png\"}"
 *
 * Update payment method:
 *   curl.exe -X PUT http://localhost:3000/api/accounts/1/payment-method -H "Content-Type: application/json" -d "{\"brand\":\"visa\",\"last4\":\"4242\"}"
 *
 * Delete:
 *   curl.exe -X DELETE http://localhost:3000/api/accounts/1
 * ----------------------------------------------------------
 */

const express = require('express');
const { accounts, nextAcctId } = require('../data/store');

const r = express.Router();

// Health (quick check the router is mounted)
r.get('/__ping', (_req, res) => res.json({ ok: true, scope: 'accounts' }));

// Create account -> POST /api/accounts
// Body: { handle, email }
r.post('/', (req, res) => {
  const { handle, email } = req.body || {};
  if (!handle || !email) return res.status(400).json({ error: 'handle and email required' });
  if (accounts.some(a => a.handle === handle)) return res.status(409).json({ error: 'handle already exists' });

  const a = { id: nextAcctId(), handle, email, avatar: null, paymentMethod: null };
  accounts.push(a);
  res.status(201).json(a);
});

// List accounts -> GET /api/accounts
r.get('/', (_req, res) => res.json(accounts));

// View one -> GET /api/accounts/:id
r.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const a = accounts.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: 'not found' });
  res.json(a);
});

// Edit (handle/email) -> PUT /api/accounts/:id
r.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const a = accounts.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: 'not found' });

  const { handle, email } = req.body || {};
  if (handle) a.handle = handle;
  if (email) a.email = email;
  res.json(a);
});

// Update profile picture -> PUT /api/accounts/:id/profile-picture
// Body: { url }
r.put('/:id/profile-picture', (req, res) => {
  const id = Number(req.params.id);
  const a = accounts.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: 'not found' });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  a.avatar = url;
  res.json({ avatar: a.avatar });
});

// Update payment method -> PUT /api/accounts/:id/payment-method
// Body: { brand, last4 }
r.put('/:id/payment-method', (req, res) => {
  const id = Number(req.params.id);
  const a = accounts.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: 'not found' });

  const { brand, last4 } = req.body || {};
  if (!brand || !last4) return res.status(400).json({ error: 'brand and last4 required' });
  a.paymentMethod = { brand, last4 };
  res.json(a.paymentMethod);
});

// Delete -> DELETE /api/accounts/:id
r.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = accounts.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const [deleted] = accounts.splice(idx, 1);
  res.json({ deleted });
});

module.exports = r;
