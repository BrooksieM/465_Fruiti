// public/js/recipe-live.js
// Live page JS that talks to the JSON-backed /recipes API.

const API = '/recipes';

const els = {
  q: document.getElementById('q'),
  qGo: document.getElementById('qGo'),
  cards: document.getElementById('cards'),
  createBtn: document.getElementById('createBtn'),
  rTitle: document.getElementById('rTitle'),
  rSummary: document.getElementById('rSummary'),
  rCover: document.getElementById('rCover'),
  rServ: document.getElementById('rServ'),
  rMin: document.getElementById('rMin'),
  rIngr: document.getElementById('rIngr'),
  rSteps: document.getElementById('rSteps'),
  detail: document.getElementById('detail'),
  dTitle: document.getElementById('dTitle'),
  dSummary: document.getElementById('dSummary'),
  dMeta: document.getElementById('dMeta'),
  dCounts: document.getElementById('dCounts'),
  dCover: document.getElementById('dCover'),
  dIngr: document.getElementById('dIngr'),
  dSteps: document.getElementById('dSteps'),
  likeBtn: document.getElementById('likeBtn'),
  unlikeBtn: document.getElementById('unlikeBtn'),
  revRating: document.getElementById('revRating'),
  revBody: document.getElementById('revBody'),
  revSend: document.getElementById('revSend'),
  revList: document.getElementById('revList')
};

let selectedId = null;

async function getJSON(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function card(x) {
  const el = document.createElement('article');
  el.className = 'card';
  const h2 = document.createElement('h2'); h2.textContent = x.title;
  const imgWrap = document.createElement('div'); imgWrap.className = 'media';
  const img = document.createElement('img'); img.className = 'card-img'; img.alt = x.title; img.src = x.coverUrl || '/images/placeholder/fruitproj3jpg.jpg';
  imgWrap.appendChild(img);
  const stats = document.createElement('div'); stats.className = 'stats';
  stats.textContent = `⭐ ${x.avgRating} · ${x.reviewCount} reviews · ❤️ ${x.likeCount}`;
  const btn = document.createElement('button'); btn.textContent = 'Open'; btn.onclick = () => openRecipe(x.id);
  el.appendChild(h2); el.appendChild(imgWrap); el.appendChild(stats); el.appendChild(btn);
  return el;
}

async function refresh() {
  const q = els.q.value.trim();
  const data = await getJSON(`${API}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  els.cards.innerHTML = '';
  data.forEach(x => els.cards.appendChild(card(x)));
}

function li(text) {
  const el = document.createElement('li'); el.textContent = text; return el;
}

async function openRecipe(idOrSlug) {
  const x = await getJSON(`${API}/${idOrSlug}`);
  selectedId = x.id;

  els.detail.style.display = '';
  els.dTitle.textContent = x.title;
  els.dSummary.textContent = x.summary || '';
  els.dMeta.textContent = `Servings: ${x.servings ?? '-'} · Minutes: ${x.minutes ?? '-'}`;
  const avg = x.reviews.length ? (x.reviews.reduce((a,b)=>a+b.rating,0)/x.reviews.length).toFixed(2) : 0;
  els.dCounts.textContent = `❤️ ${x.likes.length} · ⭐ ${avg} (${x.reviews.length})`;
  if (x.coverUrl) { els.dCover.src = x.coverUrl; els.dCover.style.display = ''; } else { els.dCover.style.display = 'none'; }

  els.dIngr.innerHTML = ''; x.ingredients.forEach(i => els.dIngr.appendChild(li(i.line)));
  els.dSteps.innerHTML = ''; x.steps.forEach(s => els.dSteps.appendChild(li(s.instruction)));

  els.revList.innerHTML = '';
  x.reviews.slice().reverse().forEach(r => {
    const d = document.createElement('div'); d.className = 'rev';
    const a = document.createElement('div'); a.textContent = `⭐ ${r.rating}`;
    const b = document.createElement('div'); b.textContent = r.body || '';
    const c = document.createElement('div'); c.className = 'ts'; c.textContent = r.createdAt;
    d.appendChild(a); d.appendChild(b); d.appendChild(c);
    els.revList.appendChild(d);
  });
}

async function createRecipe() {
  const payload = {
    title: els.rTitle.value.trim(),
    summary: els.rSummary.value.trim(),
    coverUrl: els.rCover.value.trim(),
    servings: els.rServ.value ? +els.rServ.value : null,
    minutes: els.rMin.value ? +els.rMin.value : null,
    ingredients: els.rIngr.value.split('\n').map(s=>s.trim()).filter(Boolean),
    steps: els.rSteps.value.split('\n').map(s=>s.trim()).filter(Boolean),
    authorId: 'u1'
  };
  if (!payload.title) return;
  await getJSON(API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  els.rTitle.value=''; els.rSummary.value=''; els.rCover.value=''; els.rServ.value=''; els.rMin.value=''; els.rIngr.value=''; els.rSteps.value='';
  await refresh();
}

async function like() {
  if (!selectedId) return;
  await getJSON(`${API}/${selectedId}/like`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId:'u2' }) });
  await openRecipe(selectedId);
}

async function unlike() {
  if (!selectedId) return;
  await getJSON(`${API}/${selectedId}/like`, { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId:'u2' }) });
  await openRecipe(selectedId);
}

async function addReview() {
  if (!selectedId) return;
  const rating = +els.revRating.value;
  const body = els.revBody.value.trim();
  await getJSON(`${API}/${selectedId}/reviews`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId:'u3', rating, body }) });
  els.revBody.value='';
  await openRecipe(selectedId);
}

els.qGo.onclick = refresh;
els.createBtn.onclick = createRecipe;
els.likeBtn.onclick = like;
els.unlikeBtn.onclick = unlike;
els.revSend.onclick = addReview;

refresh();
