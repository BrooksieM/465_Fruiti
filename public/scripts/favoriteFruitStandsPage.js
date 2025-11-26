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
          fruitStandsMap.set(standId, standData);
          displayedStands++;
        }
      } catch (error) {
        console.error(`Error fetching stand ${standId}:`, error);
      }
    }

    // Display the stands
    renderFruitStands(Array.from(fruitStandsMap.values()), userId);

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
  const card = document.createElement('div');
  card.className = 'stand-card';
  card.setAttribute('data-seller-id', stand.id);

  const standId = stand.id;
  const standName = stand.business_name || stand.name || 'Unknown Stand';
  const address = stand.address || '';
  const city = stand.city || '';
  const state = stand.state || '';
  const zipcode = stand.zipcode || '';
  const phone = stand.phone_number || stand.phone || '';

  const fullAddress = [address, city, state, zipcode].filter(Boolean).join(', ');

  card.innerHTML = `
    <div class="stand-card-header">
      <h2 class="stand-name">${escapeHtml(standName)}</h2>
      <button class="btn-heart favorited"
              onclick="removeFavorite(${standId}, event)"
              title="Unfavorite this stand">
        ❤️
      </button>
    </div>

    <div class="stand-card-body">
      ${address ? `
        <div class="stand-info">
          <div class="stand-info-icon">📍</div>
          <div class="stand-info-content stand-address">${escapeHtml(address)}</div>
        </div>
      ` : ''}

      ${fullAddress && fullAddress !== address ? `
        <div class="stand-info">
          <div class="stand-info-icon">🌍</div>
          <div class="stand-info-content stand-location">${escapeHtml(fullAddress)}</div>
        </div>
      ` : ''}

      ${phone ? `
        <div class="stand-info">
          <div class="stand-info-icon">📞</div>
          <div class="stand-info-content stand-phone">
            <a href="tel:${escapeHtml(phone)}" style="text-decoration: none; color: #666;">
              ${escapeHtml(phone)}
            </a>
          </div>
        </div>
      ` : ''}
    </div>

    <div class="stand-card-footer">
      <button class="btn-visit" onclick="openStand(${standId})">View Details</button>
      <button class="btn-remove" onclick="removeFavorite(${standId}, event)">Remove</button>
    </div>
  `;

  return card;
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

// Open stand details (placeholder for future implementation)
function openStand(standId) {
  console.log(`Opening stand ${standId}`);
  // TODO: Implement navigation to stand details page
  alert(`Stand ${standId} details view coming soon!`);
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
