(function () {
    const API = '/api/recipes';
  
    const els = {
      grid: document.getElementById('cards') || document.getElementById('recipesGrid'),
      form: document.getElementById('createRecipeForm'),
      title: document.getElementById('rTitle'),
      summary: document.getElementById('rSummary'),
      cover: document.getElementById('rCover'),
      servings: document.getElementById('rServ'),
      minutes: document.getElementById('rMin'),
      ingredients: document.getElementById('rIngr'),
      steps: document.getElementById('rSteps')
    };
  
    async function fetchJSON(url, opts) {
      const res = await fetch(url, { credentials: 'same-origin', ...opts });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      return ct.includes('application/json') ? res.json() : null;
    }
  
    function card(recipe) {
      const d = document.createElement('div');
      d.className = 'recipe-card decorated';
      d.innerHTML = `
        <div class="card-image">
          <img src="${recipe.coverUrl || '/images/placeholder_recipe.jpg'}" alt="">
        </div>
        <div class="card-body">
          <h3 class="card-title">${recipe.title || 'Untitled'}</h3>
          <p class="card-summary">${recipe.summary || ''}</p>
          <div class="card-meta">
            <span>${recipe.minutes ? `${recipe.minutes} min` : ''}</span>
            <span>${recipe.servings ? `${recipe.servings} servings` : ''}</span>
            <span class="diff ${recipe.difficulty || 'easy'}">${recipe.difficulty || 'easy'}</span>
          </div>
          <div class="card-actions">
            <button class="like-btn" aria-label="Like">👍 <span>${recipe.likes ?? 0}</span></button>
            <button class="dislike-btn" aria-label="Dislike">👎 <span>${recipe.dislikes ?? 0}</span></button>
          </div>
        </div>
      `;
  
      const likeBtn = d.querySelector('.like-btn');
      const dislikeBtn = d.querySelector('.dislike-btn');
  
      likeBtn.addEventListener('click', async () => {
        const payload = { likes: (recipe.likes ?? 0) + 1 };
        const updated = await fetchJSON(`${API}/${recipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        recipe.likes = updated.likes;
        likeBtn.querySelector('span').textContent = recipe.likes;
      });
  
      dislikeBtn.addEventListener('click', async () => {
        const payload = { dislikes: (recipe.dislikes ?? 0) + 1 };
        const updated = await fetchJSON(`${API}/${recipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        recipe.dislikes = updated.dislikes;
        dislikeBtn.querySelector('span').textContent = recipe.dislikes;
      });
  
      return d;
    }
  
    async function renderList() {
      if (!els.grid) return;
      els.grid.innerHTML = '';
      const data = await fetchJSON(API);
      const list = Array.isArray(data) ? data : [];
      list.forEach(r => els.grid.appendChild(card(r)));
    }
  
    async function handleCreate(e) {
      if (!els.form) return;
      e.preventDefault();
  
      const payload = {
        title: els.title?.value?.trim(),
        summary: els.summary?.value?.trim(),
        coverUrl: els.cover?.value?.trim(),
        servings: Number(els.servings?.value || 0),
        minutes: Number(els.minutes?.value || 0),
        ingredients: els.ingredients?.value || '',
        steps: els.steps?.value || '',
        difficulty: (document.querySelector('input[name="difficulty"]:checked')?.value) || 'easy'
      };
  
      await fetchJSON(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      await renderList();
      try { els.form.reset(); } catch (_) {}
    }
  
    document.addEventListener('DOMContentLoaded', () => {
      renderList().catch(console.error);
      if (els.form) els.form.addEventListener('submit', handleCreate);
    });
  })();
  