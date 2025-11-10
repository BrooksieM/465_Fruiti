// public/js/recipe.js
// Card grid + drawer + create/like/review/delete + optional image upload. Uses /recipes API.

const API = '/recipes';

// ---- auth helpers (from localStorage user) ----
function currentUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
function authHeaders() {
  const u = currentUser();
  return u ? {
    'x-user-id': String(u.id || u.handle || u.email || u.username || u.userId || u),
    'x-user-handle': String(u.handle || u.username || u.email || '')
  } : {};
}

// ---- small DOM helpers ----
const $id = (id) => document.getElementById(id);
const $ = (sel, el = document) => el.querySelector(sel);

async function getJSON(url, init) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ---- elements ----
const els = {
  cards: null,
  createBtn: null,
  rTitle: null, rDiff: null, rSummary: null, rCover: null, rCoverFile: null, rServ: null, rMin: null, rIngr: null, rSteps: null,
  drawer: null, drawerClose: null,
  dTitle: null, dCover: null, dSummary: null, dMeta: null, dCounts: null, dIngr: null, dSteps: null,
  likeBtn: null, unlikeBtn: null, revRating: null, revBody: null, revSend: null, revList: null,
};

let selectedId = null;

// ---- rendering ----
function li(text) {
  const el = document.createElement('li');
  el.textContent = text;
  return el;
}

function card(x) {
  const el = document.createElement('div');
  el.className = 'recipe-card';
  el.tabIndex = 0;

  const img = document.createElement('img');
  img.className = 'recipe-img';
  if (x.coverUrl) { img.src = x.coverUrl; img.alt = x.title || ''; }
  el.appendChild(img);

  const h3 = document.createElement('h3');
  h3.textContent = x.title || '';
  el.appendChild(h3);

  const p = document.createElement('p');
  p.className = 'recipe-summary';
  p.textContent = x.summary || '';
  el.appendChild(p);

  const meta = document.createElement('div');
  meta.className = 'recipe-meta';
  const mins = Number.isFinite(x.minutes) ? x.minutes : '—';
  meta.textContent = `Servings: ${x.servings ?? '—'} • Minutes: ${mins}`;
  el.appendChild(meta);

  const avg = x.reviews?.length ? (x.reviews.reduce((a,b)=>a + (b.rating || 0), 0) / x.reviews.length).toFixed(1) : '0.0';
  const counts = document.createElement('div');
  counts.className = 'recipe-counts';
  counts.textContent = `❤️ ${x.likes?.length || 0} • ⭐ ${avg} (${x.reviews?.length || 0})`;
  el.appendChild(counts);

  // owner-only delete
  const u = currentUser();
  if (u && x.authorId && String(x.authorId) === String(u.id || u.handle || u.email || u.username || u.userId || u)) {
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'btn-danger';
    del.onclick = (ev) => { ev.stopPropagation(); deleteRecipe(x.id); };
    el.appendChild(del);
  }

  el.onclick = () => openDetail(x.id);
  el.onkeyup = (e) => { if (e.key === 'Enter') openDetail(x.id); };

  return el;
}

async function refresh() {
  const list = await getJSON(`${API}`);
  els.cards.innerHTML = '';
  list.forEach(x => els.cards.appendChild(card(x)));
}

// ---- detail drawer ----
async function openDetail(idOrSlug) {
  const x = await getJSON(`${API}/${idOrSlug}`);
  selectedId = x.id;

  els.drawer.hidden = false;
  els.drawer.setAttribute('aria-hidden', 'false');

  els.dTitle.textContent = x.title;
  els.dSummary.textContent = x.summary || '';
  const mins = Number.isFinite(x.minutes) ? x.minutes : '—';
  els.dMeta.textContent = `Servings: ${x.servings ?? '—'} • Minutes: ${mins}`;

  const avg = x.reviews.length ? (x.reviews.reduce((a,b)=>a + b.rating, 0) / x.reviews.length).toFixed(1) : '0.0';
  els.dCounts.textContent = `❤️ ${x.likes.length} • ⭐ ${avg} (${x.reviews.length})`;

  if (x.coverUrl) { els.dCover.src = x.coverUrl; els.dCover.hidden = false; } else { els.dCover.hidden = true; }

  els.dIngr.innerHTML = '';
  x.ingredients.forEach(i => els.dIngr.appendChild(li(i.line)));

  els.dSteps.innerHTML = '';
  x.steps.forEach(s => els.dSteps.appendChild(li(s.instruction)));

  els.revList.innerHTML = '';
  x.reviews.slice().reverse().forEach(r => {
    const d = document.createElement('div'); d.className = 'rev';
    d.textContent = `⭐ ${r.rating} — ${r.body || ''} · ${new Date(r.createdAt).toLocaleString()}`;
    els.revList.appendChild(d);
  });
}

// ---- actions ----
async function createRecipe() {
  // 1) upload file if provided to get a URL
  let coverUrl = els.rCover.value.trim();
  const file = els.rCoverFile.files && els.rCoverFile.files[0];
  if (file) {
    const fd = new FormData();
    fd.append('image', file);
    const r = await fetch(`${API}/upload`, { method: 'POST', headers: authHeaders(), body: fd });
    if (!r.ok) throw new Error(await r.text());
    const up = await r.json();
    coverUrl = up.url;
  }

  // 2) require login
  if (!currentUser()) { alert('Please log in to create a recipe.'); return; }

  // 3) create
  const payload = {
    title: els.rTitle.value.trim(),
    difficulty: els.rDiff.value,
    summary: els.rSummary.value.trim(),
    coverUrl,
    servings: els.rServ.value.trim(),
    minutes: els.rMin.value.trim(),
    ingredients: els.rIngr.value.split('\n').map(s => s.trim()).filter(Boolean),
    steps: els.rSteps.value.split('\n').map(s => s.trim()).filter(Boolean)
  };

  await getJSON(`${API}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });

  // clear
  els.rTitle.value = '';
  els.rSummary.value = '';
  els.rCover.value = '';
  els.rCoverFile.value = '';
  els.rServ.value = '';
  els.rMin.value = '';
  els.rIngr.value = '';
  els.rSteps.value = '';

  await refresh();
}

async function like() {
  if (!selectedId) return;
  const u = currentUser();
  if (!u) { alert('Please log in.'); return; }
  await getJSON(`${API}/${selectedId}/like`, { method: 'POST', headers: authHeaders() });
  await openDetail(selectedId);
  await refresh();
}

async function unlike() {
  if (!selectedId) return;
  const u = currentUser();
  if (!u) { alert('Please log in.'); return; }
  await getJSON(`${API}/${selectedId}/like`, { method: 'DELETE', headers: authHeaders() });
  await openDetail(selectedId);
  await refresh();
}

async function addReview() {
  if (!selectedId) return;
  const u = currentUser();
  if (!u) { alert('Please log in.'); return; }
  const rating = +els.revRating.value;
  const body = els.revBody.value.trim();
  if (!(rating >= 1 && rating <= 5)) return;

  await getJSON(`${API}/${selectedId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ rating, body })
  });

  els.revBody.value = '';
  await openDetail(selectedId);
  await refresh();
}

async function deleteRecipe(id) {
  const u = currentUser();
  if (!u) { alert('Please log in.'); return; }
  if (!confirm('Delete this recipe?')) return;

  const r = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() }
  });
  if (!r.ok) { alert('Failed to delete'); return; }
  await refresh();
}

// ---- mount ----
function mount() {
  // grid + form
  els.cards = $id('cards');
  els.createBtn = $id('createBtn');
  els.rTitle = $id('rTitle');
  els.rDiff = $id('rDiff');
  els.rSummary = $id('rSummary');
  els.rCover = $id('rCover');
  els.rCoverFile = $id('rCoverFile');
  els.rServ = $id('rServ');
  els.rMin = $id('rMin');
  els.rIngr = $id('rIngr');
  els.rSteps = $id('rSteps');

  // drawer
  els.drawer = $id('drawer');
  els.drawerClose = $id('drawerClose');
  els.dTitle = $id('dTitle');
  els.dCover = $id('dCover');
  els.dSummary = $id('dSummary');
  els.dMeta = $id('dMeta');
  els.dCounts = $id('dCounts');
  els.dIngr = $id('dIngr');
  els.dSteps = $id('dSteps');
  els.likeBtn = $id('likeBtn');
  els.unlikeBtn = $id('unlikeBtn');
  els.revRating = $id('revRating');
  els.revBody = $id('revBody');
  els.revSend = $id('revSend');
  els.revList = $id('revList');

  // events
  if (els.createBtn) els.createBtn.onclick = createRecipe;
  if (els.likeBtn) els.likeBtn.onclick = like;
  if (els.unlikeBtn) els.unlikeBtn.onclick = unlike;
  if (els.revSend) els.revSend.onclick = addReview;

  // drawer close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.drawer && els.drawer.hidden === false) {
      els.drawer.hidden = true;
      els.drawer.setAttribute('aria-hidden', 'true');
    }
  });
  if (els.drawerClose) els.drawerClose.onclick = () => {
    els.drawer.hidden = true;
    els.drawer.setAttribute('aria-hidden', 'true');
  };

  // hide any legacy modal if present
  const oldModal = document.getElementById('reviewModal');
  if (oldModal) oldModal.style.display = 'none';

  refresh();
}

document.addEventListener('DOMContentLoaded', mount);
