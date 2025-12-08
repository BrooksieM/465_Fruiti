// Favorite Recipes Page Script

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Favorite Recipes page loaded');
  checkAuthAndLoadRecipes();
});

// Check authentication and load recipes
async function checkAuthAndLoadRecipes() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    console.log('❌ User not authenticated, redirecting to login');
    showEmptyState();
    return;
  }

  console.log(`✅ User authenticated: ${user.id}`);
  await loadAndDisplayFavoriteRecipes(user.id);
}

// Load favorite recipes and display them
async function loadAndDisplayFavoriteRecipes(userId) {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const recipesList = document.getElementById('recipesList');

  try {
    // Fetch user's favorite recipes from accounts table
    const userResponse = await fetch(`/api/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to load user data');
    }

    const userData = await userResponse.json();
    // favorite_recipe is JSONB array of recipe IDs: [1, 2, 3, 4]
    let favoriteRecipeIds = userData.favorite_recipe || [];

    // Handle case where it might be a string
    if (typeof favoriteRecipeIds === 'string') {
      try {
        favoriteRecipeIds = JSON.parse(favoriteRecipeIds);
      } catch {
        favoriteRecipeIds = [];
      }
    }

    // Ensure it's an array
    if (!Array.isArray(favoriteRecipeIds)) {
      favoriteRecipeIds = [];
    }

    console.log(`📍 Found ${favoriteRecipeIds.length} favorite recipes`);

    // Hide loading spinner
    loadingSpinner.style.display = 'none';

    // If no favorites, show empty state
    if (favoriteRecipeIds.length === 0) {
      showEmptyState();
      return;
    }

    // Fetch details for each favorite recipe
    let displayedRecipes = 0;
    const recipesMap = new Map();

    for (const recipeId of favoriteRecipeIds) {
      try {
        const recipeResponse = await fetch(`/api/recipes/${recipeId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (recipeResponse.ok) {
          const recipeData = await recipeResponse.json();
          recipesMap.set(recipeId, recipeData);
          displayedRecipes++;
        }
      } catch (error) {
        console.error(`Error fetching recipe ${recipeId}:`, error);
      }
    }

    // Display the recipes
    renderRecipes(Array.from(recipesMap.values()));

    console.log(`✅ Displayed ${displayedRecipes} recipes`);
  } catch (error) {
    console.error('Error loading favorite recipes:', error);
    loadingSpinner.style.display = 'none';
    showErrorState(error.message);
  }
}

// Render recipes in the grid
function renderRecipes(recipes) {
  const recipesList = document.getElementById('recipesList');
  recipesList.innerHTML = '';

  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    recipesList.appendChild(card);
  });
}

// Create a recipe card element
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card-favorite';
  card.setAttribute('data-recipe-id', recipe.id);

  const recipeId = recipe.id;
  const recipeName = recipe.name || 'Unknown Recipe';
  const imageUrl = recipe.image || null;

  // Add difficulty-based class
  const difficultyClass = recipe.difficulty ? `difficulty-${recipe.difficulty.toLowerCase()}` : '';
  card.classList.add(difficultyClass);

  // Create image element or placeholder
  const imageHTML = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(recipeName)}" class="recipe-card-favorite-image" onerror="this.src='../images/placeholder/fruitproj1jpg.jpg'">`
    : `<div class="recipe-card-favorite-placeholder">📖 No Image</div>`;

  card.innerHTML = `
    <div class="recipe-card-favorite-image-container">
      ${imageHTML}
      <button class="btn-star-overlay favorited"
              onclick="removeFavorite(${recipeId}, event)"
              title="Remove from favorites">
        ⭐
      </button>
    </div>

    <div class="recipe-card-favorite-info">
      <h3 class="recipe-name-overlay">${escapeHtml(recipeName)}</h3>
      <p class="recipe-difficulty">${recipe.difficulty || 'N/A'}</p>
    </div>
  `;

  // Add click handler to open modal
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-star-overlay')) return;
    openRecipeModal(recipe);
  });

  return card;
}

// Open recipe modal with full details
function openRecipeModal(recipe) {
  console.log('Opening modal for recipe:', recipe.name);

  // Parse ingredients
  let ingredientsList = [];
  try {
    ingredientsList = typeof recipe.ingredients === 'string'
      ? JSON.parse(recipe.ingredients)
      : recipe.ingredients;
  } catch {
    ingredientsList = [recipe.ingredients];
  }

  // Parse instructions
  let instructionsList = [];
  try {
    instructionsList = typeof recipe.instructions === 'string'
      ? JSON.parse(recipe.instructions)
      : recipe.instructions;
  } catch {
    instructionsList = [recipe.instructions];
  }

  const ingredientHTML = ingredientsList
    .map(ing => `<li>${escapeHtml(ing)}</li>`)
    .join('');

  const instructionHTML = instructionsList
    .map(step => `<li>${escapeHtml(step)}</li>`)
    .join('');

  const estimatedTime = recipe.estimated_time !== undefined ? recipe.estimated_time : (recipe.estimatedTime !== undefined ? recipe.estimatedTime : 'N/A');

  const modal = document.getElementById('recipeModal');
  const recipeDetail = document.getElementById('recipeDetail');

  let detailHTML = `
    <h2>${escapeHtml(recipe.name)}</h2>
    <p><strong>Difficulty:</strong> ${escapeHtml(recipe.difficulty)}</p>
    <p><strong>Time:</strong> ${estimatedTime} ${estimatedTime !== 'N/A' ? 'min' : ''}</p>
    <h3>Ingredients:</h3>
    <ul>
      ${ingredientHTML}
    </ul>
    <h3>Instructions:</h3>
    <ol>
      ${instructionHTML}
    </ol>
  `;

  recipeDetail.innerHTML = detailHTML;
  modal.classList.remove('hidden');
}

// Close recipe modal
function closeRecipeModal() {
  const modal = document.getElementById('recipeModal');
  modal.classList.add('hidden');
}

// Remove a recipe from favorites
async function removeFavorite(recipeId, event) {
  if (event) {
    event.stopPropagation();
  }

  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    alert('Please log in to manage favorites');
    return;
  }

  try {
    // Call API endpoint to remove recipe from favorite_recipe JSONB array in accounts table
    await fetch(`/api/recipes/${recipeId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });

    // Remove the card from the page with animation (optimistic update)
    const card = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      card.style.transition = 'all 0.3s ease';

      setTimeout(() => {
        card.remove();
        checkIfEmptyAndShowState();
      }, 300);
    }

    console.log(`✅ Removed recipe ${recipeId} from favorites`);
  } catch (error) {
    console.error('Error removing favorite:', error);
    alert('Failed to remove favorite: ' + error.message);
  }
}

// Check if grid is empty and show empty state
function checkIfEmptyAndShowState() {
  const recipesList = document.getElementById('recipesList');

  if (recipesList.children.length === 0) {
    showEmptyState();
  }
}

// Show empty state
function showEmptyState() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const recipesList = document.getElementById('recipesList');
  const emptyState = document.getElementById('emptyState');

  loadingSpinner.style.display = 'none';
  recipesList.innerHTML = '';
  emptyState.style.display = 'flex';
}

// Show error state
function showErrorState(message) {
  const recipesList = document.getElementById('recipesList');
  const emptyState = document.getElementById('emptyState');

  recipesList.innerHTML = '';
  emptyState.innerHTML = `
    <div class="empty-icon">⚠️</div>
    <h2>Error Loading Recipes</h2>
    <p>${escapeHtml(message)}</p>
    <button class="btn-explore" onclick="location.reload()">Try Again</button>
  `;
  emptyState.style.display = 'flex';
}

// Utility function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  const modal = document.getElementById('recipeModal');
  if (event.target === modal) {
    closeRecipeModal();
  }
});
