// ========== RATING SERVICE ==========
// This service handles all rating-related functionality for recipes and fruit stands

// ========== RECIPE RATING FUNCTIONS ==========

/**
 * Fetch all ratings for a specific recipe
 * @param {number} recipeId - The ID of the recipe
 * @returns {Promise<Object>} - Object containing ratings array, averageRating, and totalRatings
 */
async function getRecipeRatings(recipeId) {
  try {
    const response = await fetch(`/api/recipes/${recipeId}/ratings`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipe ratings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe ratings:', error);
    return { ratings: [], averageRating: 0, totalRatings: 0 };
  }
}

/**
 * Submit or update a recipe rating
 * @param {number} recipeId - The ID of the recipe
 * @param {number} userId - The ID of the user submitting the rating
 * @param {number} rating - The rating value (1-5)
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>} - Response from the server
 */
async function submitRecipeRating(recipeId, userId, rating, comment = '') {
  try {
    const response = await fetch(`/api/recipes/${recipeId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating,
        user_id: userId,
        comment: comment.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit rating');
    }

    return data;
  } catch (error) {
    console.error('Error submitting recipe rating:', error);
    throw error;
  }
}

// ========== STAR DISPLAY FUNCTIONS ==========

/**
 * Generate HTML for displaying star ratings
 * @param {number} rating - The rating value (0-5)
 * @param {number} maxStars - Maximum number of stars (default: 5)
 * @returns {string} - HTML string for star display
 */
function generateStarsHTML(rating, maxStars = 5) {
  let starsHTML = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<span class="star filled">★</span>';
  }

  // Half star
  if (hasHalfStar) {
    starsHTML += '<span class="star half">★</span>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<span class="star empty">☆</span>';
  }

  return starsHTML;
}

/**
 * Generate HTML for interactive star rating input
 * @param {string} entityType - Type of entity being rated ('recipe' or 'fruitstand')
 * @param {number} entityId - The ID of the entity
 * @returns {string} - HTML string for star rating input
 */
function generateRatingInput(entityType, entityId) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(`
      <button type="button" class="star-btn" data-rating="${i}" onclick="selectRating(${i}, '${entityType}', ${entityId})">
        ☆
      </button>
    `);
  }

  return `
    <div class="rating-input">
      <div class="stars-input" id="${entityType}StarsInput-${entityId}">
        ${stars.join('')}
      </div>
      <input type="hidden" id="${entityType}RatingValue-${entityId}" data-rating="0">
    </div>
  `;
}

/**
 * Select a rating value and update the star display
 * @param {number} rating - The rating value (1-5)
 * @param {string} entityType - Type of entity being rated ('recipe' or 'fruitstand')
 * @param {number} entityId - The ID of the entity
 */
function selectRating(rating, entityType, entityId) {
  const starsInput = document.getElementById(`${entityType}StarsInput-${entityId}`);
  const ratingValue = document.getElementById(`${entityType}RatingValue-${entityId}`);

  if (!starsInput || !ratingValue) {
    console.error('Rating input elements not found');
    return;
  }

  // Update hidden input value
  ratingValue.setAttribute('data-rating', rating);

  // Update star buttons display
  const starButtons = starsInput.querySelectorAll('.star-btn');
  starButtons.forEach((btn, index) => {
    if (index < rating) {
      btn.textContent = '★';
      btn.classList.add('selected');
    } else {
      btn.textContent = '☆';
      btn.classList.remove('selected');
    }
  });
}

/**
 * Show a beautiful toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Create icon based on type
  let icon = '';
  if (type === 'success') {
    icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else if (type === 'error') {
    icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else {
    icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  toast.innerHTML = `
    ${icon}
    <span class="toast-message">${message}</span>
  `;

  // Add toast to container with animation
  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Submit a recipe rating from a form
 * @param {number} recipeId - The ID of the recipe
 */
async function submitRecipeRatingForm(recipeId) {
  try {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      showToast('Please log in to submit a rating', 'error');
      return;
    }

    // Get rating value
    const ratingValue = document.getElementById(`recipeRatingValue-${recipeId}`);
    const rating = parseInt(ratingValue?.getAttribute('data-rating') || '0');

    if (rating === 0) {
      showToast('Please select a star rating', 'error');
      return;
    }

    // Get comment
    const commentInput = document.getElementById(`recipeRatingComment-${recipeId}`);
    const comment = commentInput?.value || '';

    // Submit rating
    await submitRecipeRating(recipeId, user.id, rating, comment);

    // Show beautiful success message
    const stars = '★'.repeat(rating);
    showToast(`${stars} Rating submitted successfully! Thank you for your feedback.`, 'success');

    // Reload the page to show updated rating after 3 seconds
    setTimeout(() => location.reload(), 3000);
  } catch (error) {
    showToast(error.message || 'Failed to submit rating. Please try again.', 'error');
  }
}

// ========== RATING DISPLAY FUNCTIONS ==========

/**
 * Format a date as a relative time string (e.g., "2 days ago")
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Generate HTML for displaying a list of ratings
 * @param {Array} ratings - Array of rating objects
 * @param {number} limit - Maximum number of ratings to display (default: 5)
 * @returns {string} - HTML string for ratings list
 */
function generateRatingsListHTML(ratings, limit = 5) {
  if (!ratings || ratings.length === 0) {
    return '<p class="no-ratings">No ratings yet. Be the first to rate!</p>';
  }

  const limitedRatings = ratings.slice(0, limit);

  return `
    <div class="ratings-list">
      ${limitedRatings.map(rating => `
        <div class="rating-item">
          <div class="rating-header">
            <div class="rating-user">
              <strong>${escapeHtml(rating.user_handle)}</strong>
              <div class="rating-stars-small">
                ${generateStarsHTML(rating.rating)}
              </div>
            </div>
            <span class="rating-date">${formatRelativeDate(rating.created_at)}</span>
          </div>
          ${rating.comment ? `
            <div class="rating-comment">
              ${escapeHtml(rating.comment)}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally accessible
window.getRecipeRatings = getRecipeRatings;
window.submitRecipeRating = submitRecipeRating;
window.submitRecipeRatingForm = submitRecipeRatingForm;
window.generateStarsHTML = generateStarsHTML;
window.generateRatingInput = generateRatingInput;
window.selectRating = selectRating;
window.generateRatingsListHTML = generateRatingsListHTML;
window.formatRelativeDate = formatRelativeDate;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
