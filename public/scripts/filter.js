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
    checkbox.addEventListener('change', handleFilterChange);
  });

  timeFilters.forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
  });
}

// Handle filter checkbox changes
function handleFilterChange() {
  const difficultyFilters = document.querySelectorAll('.difficulty-filter');
  const timeFilters = document.querySelectorAll('.time-filter');

  // Get active difficulty filters
  const activeDifficulties = [];
  difficultyFilters.forEach(checkbox => {
    if (checkbox.checked) {
      activeDifficulties.push(checkbox.value);
    }
  });

  // Get active time filters
  const activeTimes = [];
  timeFilters.forEach(checkbox => {
    if (checkbox.checked) {
      activeTimes.push(checkbox.value);
    }
  });

  // Update activeFilters
  activeFilters.difficulty = activeDifficulties;
  activeFilters.time = activeTimes;

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
    case '15-30':
      return time > 15 && time <= 30;
    case '30-60':
      return time > 30 && time <= 60;
    case '60+':
      return time > 60;
    default:
      return false;
  }
}

// Display filtered recipes
function displayFilteredRecipes() {
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
