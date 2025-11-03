// public/js/recipe.js
// Card grid + drawer + create/like/review + image upload. Uses /recipes API.

const API = '/recipes';

const els = {
  cards: null,
  createBtn: null,
  rTitle: null, rDiff: null, rSummary: null, rCover: null, rCoverFile: null, rServ: null, rMin: null, rIngr: null, rSteps: null,
  drawer: null, drawerClose: null,
  dTitle: null, dCover: null, dSummary: null, dMeta: null, dCounts: null, dIngr: null, dSteps: null,
  likeBtn: null, unlikeBtn: null, revRating: null, revBody: null, revSend: null, revList: null,
};

let selectedId = null;
const SEED_IF_EMPTY = true;

function $id(id){ return document.getElementById(id); }

async function getJSON(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) {
    let msg = '';
    try { msg = await r.text(); } catch {}
    throw new Error(msg || `HTTP ${r.status}`);
  }
  return r.json();
}

/* -------- UI helpers -------- */

function stat(text, icon) {
  const span = document.createElement('span');
  span.className = 'stat';
  span.innerHTML = `${icon} ${text}`;
  return span;
}

function card(item) {
  const a = document.createElement('article');
  a.className = 'card';
  a.dataset.diff = item.difficulty || 'Easy';

  const h2 = document.createElement('h2');
  h2.textContent = item.title;

  const media = document.createElement('div');
  media.className = 'media';
  const img = document.createElement('img');
  img.src = item.coverUrl || '/images/placeholder/fruitproj3jpg.jpg';
  img.alt = item.title;
  media.appendChild(img);

  const stats = document.createElement('div');
  stats.className = 'stats';
  const rating = Number(item.avgRating || 0).toFixed(1);
  const mins = Number.isFinite(item.minutes) ? `${item.minutes} mins` : '—';
  stats.appendChild(stat(rating, '⭐'));
  stats.appendChild(stat(item.difficulty || 'Easy', '≋'));
  stats.appendChild(stat(mins, '⏱'));

  a.appendChild(h2);
  a.appendChild(media);
  a.appendChild(stats);

  a.onclick = () => openDetail(item.id);
  return a;
}

function li(text){ const el = document.createElement('li'); el.textContent = text; return el; }

/* -------- Data flow -------- */

async function refresh() {
  let data = await getJSON(`${API}`);
  if (SEED_IF_EMPTY && (!Array.isArray(data) || data.length === 0)) {
    await seedDemo();
    data = await getJSON(`${API}`);
  }
  els.cards.innerHTML = '';
  data.forEach(x => els.cards.appendChild(card(x)));
}

async function openDetail(idOrSlug) {
  const x = await getJSON(`${API}/${idOrSlug}`);
  selectedId = x.id;

  els.drawer.hidden = false;
  els.drawer.setAttribute('aria-hidden','false');

  els.dTitle.textContent = x.title;
  els.dSummary.textContent = x.summary || '';
  const mins = Number.isFinite(x.minutes) ? x.minutes : '—';
  els.dMeta.textContent = `Servings: ${x.servings ?? '—'} • Minutes: ${mins}`;

  const avg = x.reviews.length ? (x.reviews.reduce((a,b)=>a+b.rating,0)/x.reviews.length).toFixed(1) : '0.0';
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

async function createRecipe() {
  // 1) if file chosen, upload it to /recipes/upload to get a URL
  let coverUrl = els.rCover.value.trim();
  const file = els.rCoverFile.files && els.rCoverFile.files[0];
  if (file) {
    const fd = new FormData();
    fd.append('image', file);
    const r = await fetch(`${API}/upload`, { method:'POST', body: fd });
    if (!r.ok) throw new Error(await r.text());
    const up = await r.json();
    coverUrl = up.url; // use uploaded URL
  }

  // 2) create recipe
  const payload = {
    title: els.rTitle.value.trim(),
    difficulty: els.rDiff.value,
    summary: els.rSummary.value.trim(),
    coverUrl,
    servings: els.rServ.value ? +els.rServ.value : null,
    minutes: els.rMin.value ? +els.rMin.value : null,
    ingredients: els.rIngr.value.split('\n').map(s=>s.trim()).filter(Boolean),
    steps: els.rSteps.value.split('\n').map(s=>s.trim()).filter(Boolean),
    authorId: 'u1'
  };
  if (!payload.title) return;

  await getJSON(`${API}`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });

  // clear form
  ['rTitle','rSummary','rCover','rServ','rMin','rIngr','rSteps'].forEach(id => els[id].value = '');
  if (els.rCoverFile) els.rCoverFile.value = '';
  els.rDiff.value = 'Easy';

  await refresh(); // grid shows the new card
}

async function like() {
  if (!selectedId) return;
  await getJSON(`${API}/${selectedId}/like`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ userId:'u2' })
  });
  await openDetail(selectedId); // update drawer stats
  await refresh();              // update card rating if avg changed
}

async function unlike() {
  if (!selectedId) return;
  await getJSON(`${API}/${selectedId}/like`, {
    method:'DELETE',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ userId:'u2' })
  });
  await openDetail(selectedId);
  await refresh();
}

async function addReview() {
  if (!selectedId) return;
  const rating = +els.revRating.value;
  const body = els.revBody.value.trim();
  if (!(rating >= 1 && rating <= 5)) return;

  await getJSON(`${API}/${selectedId}/reviews`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ userId:'u3', rating, body })
  });

  els.revBody.value = '';
  // refresh both the drawer (to show new review) and grid (to update card avg)
  await openDetail(selectedId);
  await refresh();
}

/* -------- Demo seed (optional) -------- */

async function seedDemo() {
  const demo = [
    {
      title: 'French Apple Pie',
      summary: 'Caramelized apple tart (Tarte Tatin).',
      coverUrl: '/images/recipes/french-apple-pie.jpg',
      servings: 8, minutes: 50, difficulty: 'Medium',
      ingredients: ['Apples','Butter','Sugar','Puff pastry'],
      steps: ['Caramelize apples','Cover with pastry','Bake','Invert']
    },
    {
      title: 'Apple Pie',
      summary: 'Classic lattice-topped apple pie.',
      coverUrl: '/images/recipes/apple-pie.jpg',
      servings: 8, minutes: 60, difficulty: 'Easy',
      ingredients: ['Apples','Flour','Butter','Sugar','Cinnamon'],
      steps: ['Make crust','Prepare apples','Assemble','Bake until golden']
    }
  ];
  for (const r of demo) {
    try {
      await getJSON(`${API}`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(r)
      });
    } catch {}
  }
}

/* -------- Mount -------- */

function mount() {
  // grid + form
  els.cards = $id('cards');
  els.createBtn = $id('createBtn');
  els.rTitle = $id('rTitle');
  els.rDiff  = $id('rDiff');
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

  // drawer behavior
  if (els.drawer) {
    els.drawer.hidden = true;
    els.drawer.setAttribute('aria-hidden','true');
    els.drawer.addEventListener('click', (e) => {
      if (e.target === els.drawer) {
        els.drawer.hidden = true;
        els.drawer.setAttribute('aria-hidden','true');
      }
    });
  }
  if (els.drawerClose) els.drawerClose.onclick = () => {
    els.drawer.hidden = true;
    els.drawer.setAttribute('aria-hidden','true');
  };

  // events
  if (els.createBtn) els.createBtn.onclick = createRecipe;
  if (els.likeBtn) els.likeBtn.onclick = like;
  if (els.unlikeBtn) els.unlikeBtn.onclick = unlike;
  if (els.revSend) els.revSend.onclick = addReview;

  // hide any legacy modal
  const oldModal = document.getElementById('reviewModal');
  if (oldModal) oldModal.style.display = 'none';

  refresh();
}

document.addEventListener('DOMContentLoaded', mount);
