// Services/kvRecipes.js
// Tiny file-backed KV: data/recipes.json

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const storePath = path.join(process.cwd(), 'data', 'recipes.json');

async function readAll() {
  try {
    const raw = await fs.readFile(storePath, 'utf-8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, '{}');
    return {};
  }
}

async function writeAll(obj) {
  await fs.writeFile(storePath, JSON.stringify(obj, null, 2));
}

function now() { return new Date().toISOString(); }

function uid() {
  return crypto.randomUUID ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

module.exports = { readAll, writeAll, now, uid };
