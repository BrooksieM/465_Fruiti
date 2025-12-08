// Filter Functionality for Recipe Page

// Initialize filter event listeners
document.addEventListener('DOMContentLoaded', () => {
  setupFilterListeners();
});

// Setup event listeners for all filter checkboxes
function setupFilterListeners() {
  const difficultyFilters = document.querySelectorAll('.difficulty-filter');
  const timeFilters = document.querySelectorAll('.time-filter');

  difficultyFilters.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => handleDifficultyFilterChange(e));
  });

  timeFilters.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => handleTimeFilterChange(e));
  });
}

// Handle difficulty filter changes - only allow one selection
function handleDifficultyFilterChange(e) {
  const difficultyFilters = document.querySelectorAll('.difficulty-filter');

  // Uncheck all other difficulty filters
  difficultyFilters.forEach(checkbox => {
    if (checkbox !== e.target) {
      checkbox.checked = false;
    }
  });

  // Get active difficulty filter
  const activeDifficulty = e.target.checked ? e.target.value : null;
  activeFilters.difficulty = activeDifficulty ? [activeDifficulty] : [];

  // Apply filters and display results
  applyFilters();
}

// Handle time filter changes - only allow one selection
function handleTimeFilterChange(e) {
  const timeFilters = document.querySelectorAll('.time-filter');

  // Uncheck all other time filters
  timeFilters.forEach(checkbox => {
    if (checkbox !== e.target) {
      checkbox.checked = false;
    }
  });

  // Get active time filter
  const activeTime = e.target.checked ? e.target.value : null;
  activeFilters.time = activeTime ? [activeTime] : [];

  // Apply filters and display results
  applyFilters();
}

// Apply filters to recipes
function applyFilters() {
  // Start with all recipes
  filteredRecipes = allRecipes.filter(recipe => {
    const difficultyMatch = activeFilters.difficulty.length === 0 ||
                           activeFilters.difficulty.includes(recipe.difficulty);

    const timeMatch = activeFilters.time.length === 0 ||
                     activeFilters.time.some(timeRange => {
                       return isRecipeInTimeRange(recipe.estimated_time || recipe.estimatedTime, timeRange);
                     });

    return difficultyMatch && timeMatch;
  });

  // Display filtered recipes
  displayFilteredRecipes();
}

// Check if recipe time falls within the selected time range
function isRecipeInTimeRange(cookingTime, timeRange) {
  if (cookingTime === null || cookingTime === undefined) {
    return false;
  }

  const time = parseInt(cookingTime);

  switch(timeRange) {
    case '0-15':
      return time <= 15;
    case '15-45':
      return time > 15 && time <= 45;
    case '45-75':
      return time > 45 && time <= 75;
    case '75+':
      return time > 75;
    default:
      return false;
  }
}

// Display filtered recipes
async function displayFilteredRecipes() {
  const recipesList = document.getElementById('recipesList');
  const recipeCount = document.getElementById('recipeCount');

  // Clear the recipes list
  recipesList.innerHTML = '';

  if (filteredRecipes.length === 0) {
    recipesList.innerHTML = '<div class="no-recipes">No recipes found matching your filters.</div>';
    recipeCount.textContent = '0 recipes found';
  } else {
    // Display each filtered recipe
    filteredRecipes.forEach(recipe => {
      const card = createRecipeCard(recipe);
      recipesList.appendChild(card);
    });

    // Update recipe count
    const count = filteredRecipes.length;
    recipeCount.textContent = count === 1 ? '1 recipe found' : `${count} recipes found`;

    // Apply favorited class to recipe cards for logged-in users
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      try {
        const response = await fetch(`/api/user/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          let favoriteRecipeIds = userData.favorite_recipe || [];

          // Parse if string
          if (typeof favoriteRecipeIds === 'string') {
            try {
              favoriteRecipeIds = JSON.parse(favoriteRecipeIds);
            } catch {
              favoriteRecipeIds = [];
            }
          }

          // Apply favorited class to recipe cards
          if (Array.isArray(favoriteRecipeIds)) {
            favoriteRecipeIds.forEach(recipeId => {
              const card = document.querySelector(`[data-recipe-id="${recipeId}"]`);
              if (card) {
                const starBtn = card.querySelector('.btn-star-recipe');
                if (starBtn) {
                  starBtn.classList.add('favorited');
                  starBtn.title = 'Remove from favorites';
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading favorite recipes:', error);
      }
    }
  }
}

// Clear all filters
function clearFilters() {
  const difficultyFilters = document.querySelectorAll('.difficulty-filter');
  const timeFilters = document.querySelectorAll('.time-filter');

  // Uncheck all checkboxes
  difficultyFilters.forEach(checkbox => {
    checkbox.checked = false;
  });

  timeFilters.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Reset active filters
  activeFilters.difficulty = [];
  activeFilters.time = [];

  // Display all recipes
  filteredRecipes = [...allRecipes];
  displayFilteredRecipes();
}
