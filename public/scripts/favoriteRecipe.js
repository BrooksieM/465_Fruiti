// Favorite Recipes Functionality

// Toggle favorite status for a recipe
async function toggleFavorite(recipeId) {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isLoggedIn || !user) {
    alert('Please log in to save recipes');
    return;
  }

  try {
    const response = await fetch(`/api/favorites/${recipeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id || localStorage.getItem('userId'),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showError(errorData.error || 'Failed to update favorite');
      return;
    }

    // Update the favorite button UI
    const favBtn = document.querySelector(`[data-recipe-id="${recipeId}"] .btn-favorite`);
    if (favBtn) {
      favBtn.classList.toggle('favorited');
      favBtn.textContent = favBtn.classList.contains('favorited') ? ' Saved' : ' Save';
    }

    const result = await response.json();
    if (result.message) {
      showSuccess(result.message);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showError('An error occurred while saving the recipe');
  }
}

// Load user's favorite recipes
async function loadFavoriteRecipes() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isLoggedIn || !user) {
    return;
  }

  try {
    const response = await fetch(`/api/favorites`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to load favorite recipes');
      return;
    }

    const favorites = await response.json();
    return favorites.map(fav => fav.recipe_id);
  } catch (error) {
    console.error('Error loading favorite recipes:', error);
    return [];
  }
}

// Check if a recipe is favorited
async function isRecipeFavorited(recipeId) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    return false;
  }

  try {
    const favorites = await loadFavoriteRecipes();
    return favorites.includes(recipeId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

// Update favorite button appearance
async function updateFavoriteButton(recipeId, buttonElement) {
  const isFavorited = await isRecipeFavorited(recipeId);

  if (isFavorited) {
    buttonElement.classList.add('favorited');
    buttonElement.textContent = ' Saved';
  } else {
    buttonElement.classList.remove('favorited');
    buttonElement.textContent = ' Save';
  }
}
