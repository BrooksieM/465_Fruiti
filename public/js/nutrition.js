const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const fruitSelect = document.getElementById('fruitSelect');
const loadBtn = document.getElementById('loadBtn');
const card = document.getElementById('nutriCard');

async function fetchNutrition(id) {
  const res = await fetch(`/api/nutrition/${id}`);
  if (!res.ok) throw new Error('Failed to load nutrition');
  return res.json(); // expects shape from your /api/nutrition/:id service
}

// TODO: When you give me fruit IDs + names, we can pre-fill <select>.
// For now, this keeps the UI wired but idle.
loadBtn.addEventListener('click', async () => {
  const id = fruitSelect.value;
  if (!id) return;
  try {
    const n = await fetchNutrition(id); // uses your service
    // Example property names; adjust to your table fields once you share them
    document.getElementById('nutriName').textContent = n.name || 'Fruit';
    document.getElementById('nutriServing').textContent = n.serving || 'Per 100 g';
    document.getElementById('nutriCalories').textContent = n.calories ?? '—';
    document.getElementById('nutriCarbs').textContent = n.carbs ?? '—';
    document.getElementById('nutriFiber').textContent = n.fiber ?? '—';
    document.getElementById('nutriSugar').textContent = n.sugar ?? '—';
    document.getElementById('nutriProtein').textContent = n.protein ?? '—';
    document.getElementById('nutriFat').textContent = n.fat ?? '—';
    document.getElementById('nutriNotes').textContent = n.notes || '';
    card.hidden = false;
  } catch (e) {
    alert('Nutrition not found yet for this fruit.');
  }
});
