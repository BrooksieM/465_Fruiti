////// NUTRITION SERVICE ////////////////////////////////////////////////

/**
 * HOW TO TEST (Windows CMD)
 *
 * get nutrition by fruit id:
 *   curl.exe "http://localhost:3000/api/nutrition/1"
 *   curl.exe "http://localhost:3000/api/nutrition/2"
 *   curl.exe "http://localhost:3000/api/nutrition/3"
 */

const nutritionByFruitId = {
  1: { fruitId: 1, name: 'Apple',     calories: 95,  carbs_g: 25, protein_g: 0.5, fat_g: 0.3, fiber_g: 4.4, vitaminC_mg: 8.4 },
  2: { fruitId: 2, name: 'Blueberry', calories: 85,  carbs_g: 21, protein_g: 1.1, fat_g: 0.5, fiber_g: 3.6, vitaminC_mg: 14.4 },
  3: { fruitId: 3, name: 'Banana',    calories: 105, carbs_g: 27, protein_g: 1.3, fat_g: 0.4, fiber_g: 3.1, vitaminC_mg: 10.3 },
};

// GET /api/nutrition/:id -> return nutrition for fruit id
app.get('/api/nutrition/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid fruit id' });
  const data = nutritionByFruitId[id];
  if (!data) return res.status(404).json({ error: 'Nutrition not found' });
  res.json(data);
});

///// END NUTRITION SERVICE ////////////////////////////////////////////////