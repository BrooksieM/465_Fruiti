// Fetch and display featured recipes on the homepage
async function loadFeaturedRecipes() {
  const container = document.getElementById('featuredRecipes');

  try {
    // Fetch top-rated recipes
    const response = await fetch('/api/recipes/top-rated/featured?limit=3');
    const recipes = await response.json();

    if (!recipes || recipes.length === 0) {
      container.innerHTML = `
        <div class="loading-placeholder">
          <p>No recipes available at the moment. Check back soon!</p>
        </div>
      `;
      return;
    }

    // Clear loading placeholder
    container.innerHTML = '';

    // Create cards for each featured recipe
    for (const recipe of recipes) {
      const card = createRecipeCard(recipe);
      container.appendChild(card);
    }
  } catch (error) {
    console.error('Error loading featured recipes:', error);
    container.innerHTML = `
      <div class="loading-placeholder">
        <p>Unable to load featured recipes. Please try again later.</p>
      </div>
    `;
  }
}

// Create a card element for a recipe
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'featured-recipe-card';

  // Get recipe image or use placeholder
  const imageUrl = recipe.image || '../images/placeholder/recipe-placeholder.png';

  // Format recipe name
  const recipeName = recipe.name;

  // Get difficulty badge color
  const difficultyColors = {
    'Easy': '#4caf50',
    'Medium': '#ff9800',
    'Hard': '#f44336'
  };
  const difficultyColor = difficultyColors[recipe.difficulty] || '#999';

  // Format estimated time
  const timeText = recipe.estimated_time 
    ? `${recipe.estimated_time} min` 
    : 'N/A';

  // Get ingredients count
  const ingredientsCount = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients.length 
    : 0;

  // Get author handle
  const author = recipe.accounts?.handle || recipe.creator_handle || 'Anonymous';

  // Get rating info
  const averageRating = recipe.averageRating || 0;
  const totalRatings = recipe.totalRatings || 0;
  const ratingDisplay = averageRating > 0 
    ? `⭐ ${averageRating.toFixed(1)} (${totalRatings})` 
    : '⭐ No ratings yet';

  // Create card HTML
  card.innerHTML = `
    <img src="${imageUrl}" alt="${escapeHtml(recipeName)}" class="recipe-image" onerror="this.src='../images/placeholder/recipe-placeholder.png'">
    <div class="recipe-info">
      <h3 class="recipe-name">${escapeHtml(recipeName)}</h3>
      <div class="recipe-author">by @${escapeHtml(author)}</div>
      <div class="recipe-rating-display">${ratingDisplay}</div>
      <div class="recipe-meta">
        <span class="recipe-time">⏱️ ${timeText}</span>
      </div>
      <div class="recipe-footer">
        <span class="recipe-difficulty" style="background-color: ${difficultyColor}">
          ${escapeHtml(recipe.difficulty)}
        </span>
        <button class="view-recipe-btn">View Recipe</button>
      </div>
    </div>
  `;

  // Make entire card clickable
  card.addEventListener('click', () => {
    window.location.href = `/recipe?id=${recipe.id}`;
  });

  return card;
}

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Load featured recipes when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedRecipes();
});
