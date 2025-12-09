// Fetch and display featured fruit stands on the homepage
async function loadFeaturedStands() {
  const container = document.getElementById('featuredStands');

  try {
    // Fetch all approved sellers
    const response = await fetch('/api/approved-sellers');
    const data = await response.json();

    if (!data.sellers || data.sellers.length === 0) {
      container.innerHTML = `
        <div class="loading-placeholder">
          <p>No fruit stands available at the moment. Check back soon!</p>
        </div>
      `;
      return;
    }

    // Get a random selection of 3 stands (or fewer if not enough available)
    const featuredCount = Math.min(3, data.sellers.length);
    const shuffled = [...data.sellers].sort(() => 0.5 - Math.random());
    const featuredStands = shuffled.slice(0, featuredCount);

    // Clear loading placeholder
    container.innerHTML = '';

    // Create cards for each featured stand
    for (const stand of featuredStands) {
      const card = await createStandCard(stand);
      container.appendChild(card);
    }
  } catch (error) {
    console.error('Error loading featured stands:', error);
    container.innerHTML = `
      <div class="loading-placeholder">
        <p>Unable to load featured stands. Please try again later.</p>
      </div>
    `;
  }
}

// Create a card element for a fruit stand
async function createStandCard(stand) {
  const card = document.createElement('div');
  card.className = 'featured-stand-card';

  // Fetch stand images
  let imageUrl = '../images/default-stand.png';
  try {
    const imageResponse = await fetch(`/api/fruitstand-images/${stand.user_id}`);
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      if (imageData.images && imageData.images.length > 0) {
        imageUrl = imageData.images[0].url;
      }
    }
  } catch (error) {
    console.log('No custom image for stand:', stand.business_name);
  }

  // Format business name
  const businessName = stand.business_name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Create location string
  const location = `${stand.city}, ${stand.state}`;

  // Get description or use default
  const description = stand.description || 'Fresh local fruits and produce. Visit us today!';

  // Create card HTML
  card.innerHTML = `
    <img src="${imageUrl}" alt="${escapeHtml(businessName)}" class="stand-image" onerror="this.src='../images/default-stand.png'">
    <div class="stand-info">
      <h3 class="stand-name">${escapeHtml(businessName)}</h3>
      <div class="stand-location">
        <span>${escapeHtml(location)}</span>
      </div>
      <p class="stand-description">${escapeHtml(description)}</p>
      <div class="stand-footer">
        <span class="stand-badge">Featured</span>
        <button class="view-details-btn">View Details</button>
      </div>
    </div>
  `;

  // Make entire card clickable
  card.addEventListener('click', () => {
    viewStandDetails(stand);
  });

  return card;
}

// View stand details - open modal
async function viewStandDetails(seller) {
  try {
    const fullAddress = `${seller.address}, ${seller.city}, ${seller.state} ${seller.zipcode}`;

    // Check if the showSellerModal function exists (from complete.js)
    if (typeof showSellerModal === 'function') {
      showSellerModal(seller, fullAddress);
    } else {
      console.error('showSellerModal function not found');
    }

    // Center map on this location if coordinates are available
    if (typeof map !== 'undefined' && seller.latitude && seller.longitude) {
      map.setCenter({ lat: seller.latitude, lng: seller.longitude });
      map.setZoom(15);
    }
  } catch (error) {
    console.error('Error viewing stand details:', error);
    alert('Unable to load stand details. Please try again.');
  }
}

// Utility function to escape HTML
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

// Load featured stands when page loads
document.addEventListener('DOMContentLoaded', loadFeaturedStands);

// Make functions globally accessible
window.viewStandDetails = viewStandDetails;
