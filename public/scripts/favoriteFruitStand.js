// Favorite Fruit Stands Functionality

// Toggle favorite status for a fruit stand
async function toggleFavoriteFruitStand(sellerId) {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    alert('Please log in to save fruit stands');
    return;
  }

  try {
    console.log(`Toggling favorite for seller ${sellerId} with user ${user.id}`);

    const response = await fetch(`/api/favorite-fruit-stands/${sellerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Error response:', responseText);
      try {
        const errorData = JSON.parse(responseText);
        showError(errorData.error || 'Failed to update favorite');
      } catch {
        showError(`Failed to update favorite (Status: ${response.status})`);
      }
      return;
    }

    const result = await response.json();
    console.log('Success result:', result);

    // Update the favorite button UI
    const favBtn = document.querySelector(`[data-seller-id="${sellerId}"] .btn-heart`);
    if (favBtn) {
      favBtn.classList.toggle('favorited');
      favBtn.innerHTML = favBtn.classList.contains('favorited') ? '❤️' : '🤍';
      favBtn.title = favBtn.classList.contains('favorited') ? 'Unfavorite this stand' : 'Favorite this stand';
    }

    if (result.message) {
      showSuccess(result.message);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showError('An error occurred while saving the fruit stand');
  }
}

// Load user's favorite fruit stands
async function loadFavoriteFruitStands() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    return [];
  }

  try {
    const response = await fetch(`/api/favorite-fruit-stands?userId=${user.id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to load favorite fruit stands');
      return [];
    }

    const data = await response.json();
    return data.favorite_stands || [];
  } catch (error) {
    console.error('Error loading favorite fruit stands:', error);
    return [];
  }
}

// Check if a fruit stand is favorited
async function isFruitStandFavorited(sellerId) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    return false;
  }

  try {
    const favorites = await loadFavoriteFruitStands();
    return favorites.includes(sellerId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

// Update favorite button appearance
async function updateFavoriteFruitStandButton(sellerId, buttonElement) {
  const isFavorited = await isFruitStandFavorited(sellerId);

  if (isFavorited) {
    buttonElement.classList.add('favorited');
    buttonElement.innerHTML = '❤️';
    buttonElement.title = 'Unfavorite this stand';
  } else {
    buttonElement.classList.remove('favorited');
    buttonElement.innerHTML = '🤍';
    buttonElement.title = 'Favorite this stand';
  }
}

// Show error message
function showError(message) {
  console.error(message);
  // You can replace this with a toast notification if you have one
  alert(message);
}

// Show success message
function showSuccess(message) {
  console.log(message);
  // You can replace this with a toast notification if you have one
}
