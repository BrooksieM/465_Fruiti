// public/js/recipe-auth-addon.js
// Non-invasive auth addon: headers + gate create + delete button with existing styles.

(function () {
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

  // Patch fetch to transparently add headers for /recipes
  const _fetch = window.fetch;
  window.fetch = function (input, init = {}) {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.includes('/recipes')) {
        const extra = authHeaders();
        init.headers = Object.assign({}, init.headers || {}, extra);
      }
    } catch {}
    return _fetch(input, init);
  };

  // When DOM is ready, wire up create gating and delete button in the drawer/cards if available
  document.addEventListener('DOMContentLoaded', () => {
    // Gate "Create" button without changing any markup
    const createBtn = document.getElementById('createBtn');
    if (createBtn) {
      const orig = createBtn.onclick;
      createBtn.onclick = async function (e) {
        if (!currentUser()) { alert('Please log in to create a recipe.'); return; }
        if (orig) return orig.call(this, e);
      };
    }

    // Add a delegated Delete button using existing 'btn' style when viewing detail drawer
    // We don't change your markup; we only append a button that matches your existing buttons.
    const drawer = document.getElementById('drawer');
    if (drawer) {
      const actions = drawer.querySelector('.actions');
      if (actions) {
        // Create Delete button if not present
        let delBtn = actions.querySelector('[data-role="del-recipe"]');
        if (!delBtn) {
          delBtn = document.createElement('button');
          delBtn.className = 'btn';           // use existing button style
          delBtn.textContent = 'Delete';
          delBtn.setAttribute('data-role', 'del-recipe');
          actions.appendChild(delBtn);
        }

        delBtn.onclick = async () => {
          const u = currentUser();
          if (!u) { alert('Please log in.'); return; }
          // get currently open recipe id from the detail header if your code exposes it;
          // fallback: ask API by title; ideally your recipe.js has a selectedId—try to read it:
          const id = window.selectedId || window.__recipeSelectedId;
          if (!id) { alert('Open a recipe first.'); return; }
          if (!confirm('Delete this recipe?')) return;

          const resp = await fetch(`/recipes/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (!resp.ok) {
            const t = await resp.text().catch(()=> '');
            alert(t || 'Failed to delete');
            return;
          }

          // If your script exposes refresh()/openDetail(), call them safely:
          try { if (typeof window.refresh === 'function') await window.refresh(); } catch {}
          try {
            if (drawer.hidden === false) {
              drawer.hidden = true;
              drawer.setAttribute('aria-hidden', 'true');
            }
          } catch {}
        };
      }
    }
  });
})();
