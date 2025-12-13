// Favorite Fruit Stands Page Script

const MAX_FAVORITES = 5;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Favorite Fruit Stands page loaded');
  checkAuthAndLoadStands();
});

// Check authentication and load stands
async function checkAuthAndLoadStands() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    console.log('❌ User not authenticated, redirecting to login');
    showEmptyState();
    return;
  }

  console.log(`✅ User authenticated: ${user.id}`);
  await loadAndDisplayFavoriteFruitStands(user.id);
}

// Load favorite fruit stands and display them
async function loadAndDisplayFavoriteFruitStands(userId) {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const standsList = document.getElementById('standsList');
  const maxMessage = document.getElementById('maxFavoritesMessage');

  try {
    // Fetch favorite stands
    const favoritesResponse = await fetch(`/api/favorite-fruit-stands?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!favoritesResponse.ok) {
      throw new Error('Failed to load favorite stands');
    }

    const favoritesData = await favoritesResponse.json();
    const favoriteStandIds = favoritesData.favorite_stands || [];

    console.log(`📍 Found ${favoriteStandIds.length} favorite stands`);

    // Hide loading spinner
    loadingSpinner.style.display = 'none';

    // If no favorites, show empty state
    if (favoriteStandIds.length === 0) {
      showEmptyState();
      return;
    }

    // Limit to max 5 stands
    const standsToDisplay = favoriteStandIds.slice(0, MAX_FAVORITES);

    // Fetch details for each favorite stand
    let displayedStands = 0;
    const fruitStandsMap = new Map();

    for (const standId of standsToDisplay) {
      try {
        const standResponse = await fetch(`/api/fruitstands/${standId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (standResponse.ok) {
          const standData = await standResponse.json();
          // Only add if standData is valid and not null
          if (standData && standData.id) {
            fruitStandsMap.set(standId, standData);
            displayedStands++;
          } else {
            console.warn(`Stand ${standId} returned invalid data:`, standData);
          }
        } else {
          console.warn(`Failed to fetch stand ${standId}: ${standResponse.status}`);
        }
      } catch (error) {
        console.error(`Error fetching stand ${standId}:`, error);
      }
    }

    // Display the stands (filter out any null values just in case)
    const validStands = Array.from(fruitStandsMap.values()).filter(stand => stand && stand.id);

    // Check if we have any valid stands to display
    if (validStands.length === 0) {
      showEmptyState();
      return;
    }

    renderFruitStands(validStands, userId);

    // Show max favorites message if at limit
    if (favoriteStandIds.length >= MAX_FAVORITES) {
      maxMessage.style.display = 'block';
    }

    console.log(`✅ Displayed ${displayedStands} fruit stands`);
  } catch (error) {
    console.error('Error loading favorite fruit stands:', error);
    loadingSpinner.style.display = 'none';
    showErrorState(error.message);
  }
}

// Render fruit stands in the grid
function renderFruitStands(stands, userId) {
  const standsList = document.getElementById('standsList');
  standsList.innerHTML = '';

  stands.forEach((stand) => {
    const card = createStandCard(stand, userId);
    standsList.appendChild(card);
  });
}

// Create a stand card element
function createStandCard(stand, userId) {
  // Check if stand data is valid
  if (!stand || !stand.id) {
    console.error('Invalid stand data:', stand);
    return document.createElement('div'); // Return empty div if invalid
  }

  const card = document.createElement('div');
  card.className = 'stand-card';
  card.setAttribute('data-seller-id', stand.id);

  const standId = stand.id;
  const standName = stand.business_name || stand.name || 'Unknown Stand';

  // Fetch and display image
  loadStandImage(standId, stand.user_id || standId);

  card.innerHTML = `
    <div class="stand-card-image-container">
      <img id="stand-image-${standId}" src="../images/default-stand.png" alt="${escapeHtml(standName)}" class="stand-card-image"
           onerror="this.src='../images/default-stand.png'">
      <button class="btn-heart-overlay favorited"
              onclick="removeFavorite(${standId}, event)"
              title="Unfavorite this stand">
        ❤️
      </button>
    </div>

    <div class="stand-card-info">
      <h3 class="stand-name-overlay">${escapeHtml(standName)}</h3>
    </div>
  `;

  // Add click handler to open modal
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-heart-overlay')) return;
    openStandModal(stand);
  });

  return card;
}

// Load stand image from API
async function loadStandImage(standId, userId) {
  try {
    const imageResponse = await fetch(`/api/fruitstand-images/${userId}`);
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      const images = imageData.images || [];
      if (images.length > 0) {
        const imageElement = document.getElementById(`stand-image-${standId}`);
        if (imageElement) {
          imageElement.src = images[0].url;
        }
      }
    }
  } catch (error) {
    console.error(`Error loading image for stand ${standId}:`, error);
  }
}

// Remove a fruit stand from favorites
async function removeFavorite(standId, event) {
  if (event) {
    event.stopPropagation();
  }

  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    alert('Please log in to manage favorites');
    return;
  }

  try {
    const response = await fetch(`/api/favorite-fruit-stands/${standId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove favorite');
    }

    // Remove the card from the page with animation
    const card = document.querySelector(`[data-seller-id="${standId}"]`);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      card.style.transition = 'all 0.3s ease';

      setTimeout(() => {
        card.remove();
        checkIfEmptyAndShowState();
      }, 300);
    }

    console.log(`✅ Removed stand ${standId} from favorites`);
  } catch (error) {
    console.error('Error removing favorite:', error);
    alert('Failed to remove favorite: ' + error.message);
  }
}

// Open stand modal with full details (same as gmaps page)
async function openStandModal(stand) {
  console.log('Opening modal for stand:', stand.business_name);
  const fullAddress = [stand.address, stand.city, stand.state, stand.zipcode].filter(Boolean).join(', ');

  // Show the modal using the same function from gmaps
  await showSellerModal(stand, fullAddress);
}

// Check if grid is empty and show empty state
function checkIfEmptyAndShowState() {
  const standsList = document.getElementById('standsList');
  const maxMessage = document.getElementById('maxFavoritesMessage');

  if (standsList.children.length === 0) {
    showEmptyState();
    maxMessage.style.display = 'none';
  }
}

// Show empty state
function showEmptyState() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const standsList = document.getElementById('standsList');
  const emptyState = document.getElementById('emptyState');
  const maxMessage = document.getElementById('maxFavoritesMessage');

  loadingSpinner.style.display = 'none';
  standsList.innerHTML = '';
  emptyState.style.display = 'flex';
  maxMessage.style.display = 'none';
}

// Show error state
function showErrorState(message) {
  const standsList = document.getElementById('standsList');
  const emptyState = document.getElementById('emptyState');

  standsList.innerHTML = '';
  emptyState.innerHTML = `
    <div class="empty-icon">⚠️</div>
    <h2>Error Loading Stands</h2>
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
