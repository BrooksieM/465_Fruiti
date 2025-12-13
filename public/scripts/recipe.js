// Recipe Page Functionality
let currentUser = null;
let allRecipes = [];
let filteredRecipes = [];
let isEditingRecipe = null;
let activeFilters = {
  difficulty: [],
  time: [],
  season: []
};

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatusAndSetup();
  loadRecipes();

  // Check if there's a recipe ID in the URL and open that recipe
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');
  if (recipeId) {
    // Wait for recipes to load, then open the modal
    setTimeout(() => {
      openRecipeById(recipeId);
    }, 1000);
  }

  // Handle form submission
  const recipeForm = document.getElementById('createRecipeForm');
  if (recipeForm) {
    recipeForm.addEventListener('submit', handleCreateRecipe);
  }

  // Handle image preview
  const recipeImage = document.getElementById('recipeImage');
  if (recipeImage) {
    recipeImage.addEventListener('change', handleImagePreview);
  }

  // Handle difficulty circle selection
  const difficultyCircles = document.querySelectorAll('.difficulty-circle');
  difficultyCircles.forEach(circle => {
    circle.addEventListener('click', handleDifficultySelect);
  });

  // Handle season button selection
  const seasonButtons = document.querySelectorAll('.season-button');
  seasonButtons.forEach(button => {
    button.addEventListener('click', handleSeasonSelect);
  });

  // Set Auto as default selected season button
  const autoSeasonButton = document.getElementById('seasonAuto');
  if (autoSeasonButton) {
    autoSeasonButton.classList.add('selected');
  }

  // Handle estimated time validation - max 512
  const estimatedTimeInput = document.getElementById('estimatedTime');
  if (estimatedTimeInput) {
    estimatedTimeInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      if (value > 512) {
        e.target.value = 512;
      }
    });
  }
});

// Check if user is logged in and setup the page accordingly
function checkAuthStatusAndSetup() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  currentUser = user;

  if (isLoggedIn && user) {
    // Show create recipe button for logged-in users
    const createButton = document.getElementById('createRecipeButton');
    if (createButton) {
      createButton.classList.remove('hidden');
    }
  } else {
    // Hide create recipe button for non-logged-in users
    const createButton = document.getElementById('createRecipeButton');
    const recipeForm = document.getElementById('recipeForm');
    if (createButton) {
      createButton.classList.add('hidden');
    }
    if (recipeForm) {
      recipeForm.classList.add('hidden');
    }
  }
}

// Open create recipe modal
function openCreateRecipeModal() {
  const modal = document.getElementById('createRecipeModal');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.querySelector('#createRecipeForm .btn-submit');

  // Reset form
  document.getElementById('createRecipeForm').reset();
  isEditingRecipe = null;
  modalTitle.textContent = 'Create a Recipe';
  submitBtn.textContent = 'Create Recipe';

  modal.classList.remove('hidden');
}

// Close create recipe modal
function closeCreateRecipeModal() {
  const modal = document.getElementById('createRecipeModal');
  modal.classList.add('hidden');
  // Reset form
  document.getElementById('createRecipeForm').reset();
  isEditingRecipe = null;
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.querySelector('#createRecipeForm .btn-submit');
  modalTitle.textContent = 'Create a Recipe';
  submitBtn.textContent = 'Create Recipe';
  // Clear image preview
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  preview.classList.remove('show');
  // Reset ingredients to single input
  const ingredientsContainer = document.getElementById('ingredientsContainer');
  ingredientsContainer.innerHTML = `
    <div class="ingredient-input-wrapper">
      <input type="text" class="ingredient-input" placeholder="Enter ingredient" required>
      <button type="button" class="btn-remove-ingredient hidden" onclick="removeIngredient(this)">Remove</button>
    </div>
  `;
  // Reset instructions to single input
  const instructionsContainer = document.getElementById('instructionsContainer');
  instructionsContainer.innerHTML = `
    <div class="instruction-input-wrapper">
      <input type="text" class="instruction-input" placeholder="Enter instruction step" required>
      <button type="button" class="btn-remove-instruction hidden" onclick="removeInstruction(this)">Remove</button>
    </div>
  `;
}

// Handle difficulty circle selection
function handleDifficultySelect(e) {
  const selectedCircle = e.target.closest('.difficulty-circle');
  const allCircles = document.querySelectorAll('.difficulty-circle');
  const difficultyInput = document.getElementById('difficultyInput');

  // Remove selected class from all circles
  allCircles.forEach(circle => circle.classList.remove('selected'));

  // Add selected class to clicked circle
  selectedCircle.classList.add('selected');

  // Update hidden input
  difficultyInput.value = selectedCircle.getAttribute('data-difficulty');
}

// Handle season button selection
async function handleSeasonSelect(e) {
  const selectedButton = e.target.closest('.season-button');
  const allButtons = document.querySelectorAll('.season-button');
  const seasonInput = document.getElementById('seasonInput');

  // Remove selected class from all buttons
  allButtons.forEach(button => button.classList.remove('selected'));

  // Add selected class to clicked button
  selectedButton.classList.add('selected');

  // Update hidden input
  const selectedSeason = selectedButton.getAttribute('data-season');
  seasonInput.value = selectedSeason;

  // If user selects "auto" and there's an image, analyze it
  if (selectedSeason === 'auto') {
    const preview = document.getElementById('imagePreview');
    const img = preview.querySelector('img');
    if (img && img.src) {
      await analyzeImageForSeason(img.src);
    }
  }
}

// Handle image preview
async function handleImagePreview(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('imagePreview');

  if (file) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const imageDataUrl = event.target.result;
      preview.innerHTML = `<img src="${imageDataUrl}" alt="Recipe preview">`;
      preview.classList.add('show');

      // Only analyze the image for season detection if "auto" is selected
      const seasonInput = document.getElementById('seasonInput');
      if (seasonInput && seasonInput.value === 'auto') {
        await analyzeImageForSeason(imageDataUrl);
      }
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '';
    preview.classList.remove('show');
  }
}

// Analyze image for season using OpenAI
async function analyzeImageForSeason(imageDataUrl) {
  try {
    // Show loading indicator on season buttons
    const seasonButtons = document.querySelectorAll('.season-button');
    const seasonInput = document.getElementById('seasonInput');

    // Add loading state
    seasonButtons.forEach(button => {
      button.style.opacity = '0.5';
      button.style.pointerEvents = 'none';
    });

    const response = await fetch('/api/recipes/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageDataUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const detectedSeason = data.season;

    // Auto-select the detected season
    if (detectedSeason && detectedSeason !== 'none' && detectedSeason !== 'auto') {
      seasonInput.value = detectedSeason;

      seasonButtons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('data-season') === detectedSeason) {
          button.classList.add('selected');
        }
      });

      // Show a subtle notification
      showSuccess(`Season auto-detected: ${detectedSeason.charAt(0).toUpperCase() + detectedSeason.slice(1)}`);
    } else {
      // If no season detected, set to 'none'
      seasonInput.value = 'none';

      seasonButtons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('data-season') === 'none') {
          button.classList.add('selected');
        }
      });

      showInfo('No specific season detected.');
    }

    // Remove loading state
    seasonButtons.forEach(button => {
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
    });

  } catch (error) {
    console.error('Error analyzing image for season:', error);

    // Remove loading state
    const seasonButtons = document.querySelectorAll('.season-button');
    seasonButtons.forEach(button => {
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
    });

    // Don't show error to user, just silently fail and keep current selection
    console.warn('Season auto-detection unavailable, user can select manually');
  }
}

// Common ingredients list for search - Fruits, Vegetables & Seasonings
const COMMON_INGREDIENTS = [
  // Fruits
  'Apple', 'Banana', 'Orange', 'Lemon', 'Lime', 'Strawberry', 'Blueberry',
  'Raspberry', 'Watermelon', 'Mango', 'Pineapple', 'Peach', 'Pear', 'Grape',
  'Kiwi', 'Coconut', 'Avocado', 'Pomegranate', 'Papaya', 'Dragon Fruit',

  // Vegetables
  'Broccoli', 'Carrot', 'Spinach', 'Lettuce', 'Tomato', 'Onion', 'Garlic',
  'Bell Pepper', 'Cucumber', 'Zucchini', 'Eggplant', 'Potato', 'Sweet Potato',
  'Corn', 'Peas', 'Beans', 'Mushroom', 'Celery', 'Cabbage', 'Cauliflower',
  'Kale', 'Arugula', 'Radish', 'Beet', 'Squash', 'Asparagus', 'Green Beans',

  // Seasonings & Herbs
  'Salt', 'Black Pepper', 'Garlic Powder', 'Onion Powder', 'Paprika', 'Cumin',
  'Cinnamon', 'Ginger', 'Turmeric', 'Oregano', 'Basil', 'Thyme', 'Rosemary',
  'Parsley', 'Cilantro', 'Dill', 'Chives', 'Cayenne Pepper', 'Red Pepper Flakes'
];

// Add ingredient input field
function addIngredient() {
  const container = document.getElementById('ingredientsContainer');
  const MAX_INGREDIENTS = 50;
  const currentCount = container.querySelectorAll('.ingredient-input-wrapper').length;

  if (currentCount >= MAX_INGREDIENTS) {
    alert(`Maximum of ${MAX_INGREDIENTS} ingredients allowed`);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'ingredient-input-wrapper';
  wrapper.innerHTML = `
    <input type="text" class="ingredient-input" placeholder="Enter ingredient" required>
    <button type="button" class="btn-remove-ingredient" onclick="removeIngredient(this)">Remove</button>
  `;
  container.appendChild(wrapper);

  // Show remove buttons if there's more than one ingredient
  updateIngredientRemoveButtons();
}

// Remove ingredient input field
function removeIngredient(button) {
  const wrapper = button.closest('.ingredient-input-wrapper');
  const container = document.getElementById('ingredientsContainer');
  
  if (container.querySelectorAll('.ingredient-input-wrapper').length > 1) {
    wrapper.remove();
    updateIngredientRemoveButtons();
  }
}

// Update visibility of ingredient remove buttons
function updateIngredientRemoveButtons() {
  const container = document.getElementById('ingredientsContainer');
  const wrappers = container.querySelectorAll('.ingredient-input-wrapper');
  const removeButtons = container.querySelectorAll('.btn-remove-ingredient');

  removeButtons.forEach((btn, index) => {
    if (wrappers.length === 1) {
      btn.classList.add('hidden');
    } else {
      btn.classList.remove('hidden');
    }
  });
}

// Add instruction input field
function addInstruction() {
  const container = document.getElementById('instructionsContainer');
  const MAX_INSTRUCTIONS = 12;
  const currentCount = container.querySelectorAll('.instruction-input-wrapper').length;

  if (currentCount >= MAX_INSTRUCTIONS) {
    alert(`Maximum of ${MAX_INSTRUCTIONS} instructions allowed`);
    return;
  }

  const newInstruction = document.createElement('div');
  newInstruction.className = 'instruction-input-wrapper';
  newInstruction.innerHTML = `
    <input type="text" class="instruction-input" placeholder="Enter instruction step" required>
    <button type="button" class="btn-remove-instruction" onclick="removeInstruction(this)">Remove</button>
  `;

  container.appendChild(newInstruction);

  // Show remove button for all instructions if there are more than 1
  updateRemoveButtons();
}

// Remove instruction input field
function removeInstruction(button) {
  const container = document.getElementById('instructionsContainer');
  button.closest('.instruction-input-wrapper').remove();

  // Show/hide remove buttons
  updateRemoveButtons();
}

// Update remove button visibility
function updateRemoveButtons() {
  const container = document.getElementById('instructionsContainer');
  const wrappers = container.querySelectorAll('.instruction-input-wrapper');

  wrappers.forEach((wrapper, index) => {
    const removeBtn = wrapper.querySelector('.btn-remove-instruction');
    // Only show remove button if there's more than 1 instruction
    if (wrappers.length > 1) {
      removeBtn.classList.remove('hidden');
    } else {
      removeBtn.classList.add('hidden');
    }
  });
}

// Handle creating or updating a recipe
async function handleCreateRecipe(e) {
  e.preventDefault();

  // Check if user is logged in
  if (!currentUser) {
    alert('Please log in to create a recipe');
    return;
  }

  // Check if user already has 3 recipes (only for new recipes, not edits)
  //  unlimited recipes for 'brstk' (development testing)
  const username = currentUser.user_metadata?.username || currentUser.username || '';
  if (!isEditingRecipe && username !== 'brstk') {
    const userRecipes = allRecipes.filter(recipe => recipe.userId === (currentUser.id || localStorage.getItem('userId')));
    if (userRecipes.length >= 3) {
      showError('You can only create a maximum of 3 recipes');
      return;
    }
  }

  const name = document.getElementById('recipeName').value.trim();
  const difficulty = document.getElementById('difficultyInput').value.trim();
  const estimatedTime = document.getElementById('estimatedTime').value.trim();
  const season = document.getElementById('seasonInput').value.trim();
  const imageFile = document.getElementById('recipeImage').files[0];

  // Get ingredients from input fields
  const ingredientInputs = document.querySelectorAll('.ingredient-input');
  const ingredients = Array.from(ingredientInputs)
    .map(input => input.value.trim())
    .filter(ingredient => ingredient.length > 0);

  // Get instructions from input fields
  const instructionInputs = document.querySelectorAll('.instruction-input');
  const instructionSteps = Array.from(instructionInputs)
    .map(input => input.value.trim())
    .filter(step => step.length > 0);

  // Validate inputs
  if (!name) {
    showError('Please fill in recipe name');
    return;
  }

  if (ingredients.length === 0) {
    showError('Please enter at least one ingredient');
    return;
  }

  if (instructionSteps.length === 0) {
    showError('Please enter at least one instruction step');
    return;
  }

  if (!difficulty) {
    showError('Please select a difficulty level');
    return;
  }

  if (!estimatedTime) {
    showError('Please enter an estimated time');
    return;
  }

  try {
    // Handle image upload if present
    let imageUrl = null;
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        showError('Failed to upload image');
        return;
      }

      const uploadData = await uploadResponse.json();
      imageUrl = uploadData.url;
    }

    const url = isEditingRecipe ? `/api/recipes/${isEditingRecipe}` : '/api/recipes';
    const method = isEditingRecipe ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        ingredients: ingredients,
        instructions: instructionSteps,
        difficulty: difficulty,
        estimatedTime: parseInt(estimatedTime),
        season: season,
        image: imageUrl,
        userId: currentUser.id || localStorage.getItem('userId'),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showError(errorData.error || 'Failed to save recipe');
      return;
    }

    await response.json();
    showSuccess(isEditingRecipe ? 'Recipe updated successfully!' : 'Recipe created successfully!');

    // Reset form and reload recipes
    document.getElementById('createRecipeForm').reset();
    isEditingRecipe = null;
    closeCreateRecipeModal();
    await loadRecipes();
  } catch (error) {
    console.error('Error saving recipe:', error);
    showError('An error occurred while saving the recipe');
  }
}

// Load all recipes
async function loadRecipes() {
  try {
    const response = await fetch('/api/recipes');

    if (!response.ok) {
      showError('Failed to load recipes');
      return;
    }

    allRecipes = await response.json();
    displayRecipes();
  } catch (error) {
    console.error('Error loading recipes:', error);
    showError('An error occurred while loading recipes');
  }
}

// Display recipes in the grid
async function displayRecipes() {
  // Initialize filteredRecipes with all recipes
  filteredRecipes = [...allRecipes];

  const recipesList = document.getElementById('recipesList');
  recipesList.innerHTML = '';

  if (allRecipes.length === 0) {
    recipesList.innerHTML = '<div class="no-recipes">No recipes yet. Be the first to create one!</div>';
  } else {
    // Fetch ratings for all recipes in parallel
    const ratingsPromises = allRecipes.map(recipe =>
      fetch(`/api/recipes/${recipe.id}/ratings`)
        .then(res => res.ok ? res.json() : { averageRating: 0, totalRatings: 0 })
        .catch(() => ({ averageRating: 0, totalRatings: 0 }))
    );

    const ratingsData = await Promise.all(ratingsPromises);

    // Create recipe cards with ratings
    allRecipes.forEach((recipe, index) => {
      const card = createRecipeCard(recipe, ratingsData[index]);
      recipesList.appendChild(card);
    });
  }

  // Load user's favorite recipes if logged in
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

  // Update recipe count in filter sidebar
  const recipeCount = document.getElementById('recipeCount');
  if (recipeCount) {
    const count = allRecipes.length;
    recipeCount.textContent = count === 1 ? '1 recipe found' : `${count} recipes found`;
  }

  // Check if current user has reached recipe limit
  if (currentUser) {
    const createButton = document.getElementById('createRecipeButton');
    if (createButton) {
      const userRecipes = allRecipes.filter(recipe => recipe.userId === (currentUser.id || localStorage.getItem('userId')));
      const btn = createButton.querySelector('.btn-create');

      if (btn) {
        if (userRecipes.length >= 3) {
          btn.disabled = true;
          btn.title = 'You have reached the maximum of 3 recipes';
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        } else {
          btn.disabled = false;
          btn.title = '';
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      }
    }
  }
}

// Create a recipe card element
function createRecipeCard(recipe, ratingsData = null) {
  const card = document.createElement('div');

  // Add difficulty-based class
  const difficultyClass = recipe.difficulty ? `difficulty-${recipe.difficulty.toLowerCase()}` : '';
  card.className = `recipe-card ${difficultyClass}`;
  card.setAttribute('data-recipe-id', recipe.id);

  // Create image element or placeholder
  const imageHTML = recipe.image
    ? `<img src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.name)}" class="recipe-card-image">`
    : `<div class="recipe-card-image-placeholder">No image</div>`;

  const createdBy = recipe.creator_handle || 'Unknown';

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = user && user.id;

  // Favorite button HTML (only show if logged in)
  const favoriteButtonHTML = isLoggedIn ? `
    <button class="btn-star-recipe"
            onclick="toggleRecipeFavorite(${recipe.id}, event)"
            title="Add to favorites"
            style="display: none;">⭐</button>
  ` : '';

  // Get season display
  const seasonName = recipe.season_name || recipe.season || 'auto';
  let seasonDisplayText = seasonName.charAt(0).toUpperCase() + seasonName.slice(1);
  const seasonDisplay = seasonName !== 'auto'
    ? `<p class="recipe-season"><strong>Season:</strong> ${seasonDisplayText}</p>`
    : '';

  // Rating display
  const ratingHTML = ratingsData && ratingsData.totalRatings > 0
    ? `<div class="recipe-rating">
        <div class="rating-stars">${generateStarsHTML(ratingsData.averageRating)}</div>
        <span class="rating-count">${ratingsData.averageRating.toFixed(1)} (${ratingsData.totalRatings})</span>
       </div>`
    : '<div class="recipe-rating"><span class="rating-count">No ratings yet</span></div>';

  card.innerHTML = `
    <div class="recipe-card-image-wrapper">
      ${imageHTML}
      ${favoriteButtonHTML}
    </div>
    <h3>${escapeHtml(recipe.name)}</h3>
    ${ratingHTML}
    <p><strong>Difficulty:</strong> ${escapeHtml(recipe.difficulty)}</p>
    <p><strong>Time:</strong> ${recipe.estimated_time} min</p>
    ${seasonDisplay}
    <p><strong>Created by:</strong> ${escapeHtml(createdBy)}</p>
  `;

  card.addEventListener('click', () => viewRecipeDetail(recipe));

  // Show edit/delete buttons only for the recipe creator (if user is logged in AND owns the recipe)
  if (currentUser) {
    const currentUserId = String(currentUser.id || localStorage.getItem('userId'));
    const recipeOwnerId = String(recipe.user_id || recipe.userId);

    // Only show buttons if the current user owns this recipe
    if (currentUserId === recipeOwnerId) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'recipe-card-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-edit';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editRecipe(recipe);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this recipe?')) {
          deleteRecipe(recipe.id);
        }
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      card.appendChild(actionsDiv);
    }
  }

  return card;
}

// Open recipe modal by ID (used when navigating from homepage)
async function openRecipeById(recipeId) {
  console.log('Opening recipe with ID:', recipeId);
  
  // Try to find the recipe in allRecipes
  let recipe = allRecipes.find(r => r.id == recipeId);
  
  if (!recipe) {
    // If not found in allRecipes, fetch it from the API
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        recipe = await response.json();
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    }
  }
  
  if (recipe) {
    viewRecipeDetail(recipe);
    // Clear the URL parameter after opening (optional - keeps URL clean)
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, '', url);
  } else {
    console.error('Recipe not found:', recipeId);
  }
}

// View recipe details in modal
async function viewRecipeDetail(recipe) {
  const modal = document.getElementById('recipeModal');
  const recipeDetail = document.getElementById('recipeDetail');

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

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = user && user.id;

  // Add favorite button if logged in
  const favoriteButtonHTML = isLoggedIn ? `
    <button class="btn-star-modal"
            onclick="toggleRecipeFavorite(${recipe.id}, event)"
            title="Add to favorites">⭐</button>
  ` : '';

  // Create image HTML
  const imageHTML = recipe.image
    ? `<img src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.name)}" class="recipe-modal-image">`
    : `<div class="recipe-modal-image-placeholder">No image available</div>`;

  // Get season display
  const seasonName = recipe.season_name || recipe.season || 'auto';
  const seasonHTML = seasonName !== 'none' && seasonName !== 'auto'
    ? `<p><strong>Season:</strong> ${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)}</p>`
    : '';

  // Fetch ratings for this recipe
  const ratingsResponse = await fetch(`/api/recipes/${recipe.id}/ratings`);
  const ratingsData = ratingsResponse.ok
    ? await ratingsResponse.json()
    : { ratings: [], averageRating: 0, totalRatings: 0 };

  // Generate ratings summary HTML
  const ratingsSummaryHTML = ratingsData.totalRatings > 0
    ? `<div class="rating-summary">
        <div class="rating-average">
          <div class="rating-number">${ratingsData.averageRating.toFixed(1)}</div>
          <div class="rating-stars">${generateStarsHTML(ratingsData.averageRating)}</div>
          <div class="rating-count">${ratingsData.totalRatings} rating${ratingsData.totalRatings !== 1 ? 's' : ''}</div>
        </div>
      </div>`
    : '<div class="rating-summary"><p class="no-ratings">No ratings yet</p></div>';

  // Check if user can rate this recipe (logged in and not the owner)
  const currentUserId = user?.id;
  const recipeOwnerId = recipe.user_id || recipe.userId;
  const canRate = isLoggedIn && currentUserId !== recipeOwnerId;

  // Generate rating form HTML
  let ratingFormHTML = '';
  if (!isLoggedIn) {
    ratingFormHTML = `
      <div class="login-required-message">
        Please <a href="/login">log in</a> to rate this recipe
      </div>
    `;
  } else if (currentUserId === recipeOwnerId) {
    ratingFormHTML = `
      <div class="own-entity-message">
        You cannot rate your own recipe
      </div>
    `;
  } else {
    ratingFormHTML = `
      <div class="rating-form">
        <h4>Rate this recipe</h4>
        <div class="rating-form-group">
          <label>Your rating:</label>
          ${generateRatingInput('recipe', recipe.id)}
        </div>
        <div class="rating-form-group">
          <label for="recipeRatingComment-${recipe.id}">Comment (optional):</label>
          <textarea class="rating-comment-input" id="recipeRatingComment-${recipe.id}"
                    placeholder="Share your thoughts about this recipe..."></textarea>
        </div>
        <button type="button" class="btn-submit-rating"
                onclick="submitRecipeRatingForm(${recipe.id})">Submit Rating</button>
      </div>
    `;
  }

  let detailHTML = `
    <div class="recipe-header">
      <h2>${escapeHtml(recipe.name)}</h2>
      ${favoriteButtonHTML}
    </div>
    <div class="recipe-modal-image-wrapper">
      ${imageHTML}
    </div>
    <p><strong>Difficulty:</strong> ${escapeHtml(recipe.difficulty)}</p>
    <p><strong>Time:</strong> ${estimatedTime} ${estimatedTime !== 'N/A' ? 'min' : ''}</p>
    ${seasonHTML}
    <h3>Ingredients:</h3>
    <ul>
      ${ingredientHTML}
    </ul>
    <h3>Instructions:</h3>
    <ol>
      ${instructionHTML}
    </ol>

    <div class="rating-section">
      <h3>Ratings & Reviews</h3>
      ${ratingsSummaryHTML}
      ${generateRatingsListHTML(ratingsData.ratings, 5)}
      ${ratingFormHTML}
    </div>
  `;

  // Add edit/delete buttons only if user is the recipe owner
  if (currentUser) {
    const currentUserId = String(currentUser.id || localStorage.getItem('userId'));
    const recipeOwnerId = String(recipe.user_id || recipe.userId);

    if (currentUserId === recipeOwnerId) {
      detailHTML += `
        <div class="modal-actions">
          <button class="btn-edit" onclick="editRecipeFromModal(${recipe.id})">Edit</button>
          <button class="btn-delete" onclick="deleteRecipeFromModal(${recipe.id})">Delete</button>
        </div>
      `;
    }
  }

  recipeDetail.innerHTML = detailHTML;
  modal.classList.remove('hidden');

  // Check if this recipe is in user's favorites and apply styling
  if (isLoggedIn && user && user.id) {
    fetch(`/api/user/${user.id}`)
      .then(response => response.json())
      .then(userData => {
        let favoriteRecipeIds = userData.favorite_recipe || [];

        // Parse if string
        if (typeof favoriteRecipeIds === 'string') {
          try {
            favoriteRecipeIds = JSON.parse(favoriteRecipeIds);
          } catch {
            favoriteRecipeIds = [];
          }
        }

        // Apply favorited class to modal button if needed
        if (Array.isArray(favoriteRecipeIds) && favoriteRecipeIds.includes(recipe.id)) {
          const modalBtn = document.querySelector('.btn-star-modal');
          if (modalBtn) {
            modalBtn.classList.add('favorited');
            modalBtn.title = 'Remove from favorites';
          }
        }
      })
      .catch(error => console.error('Error checking favorite status:', error));
  }
}

// Close recipe modal
function closeRecipeModal() {
  const modal = document.getElementById('recipeModal');
  modal.classList.add('hidden');
}

// Edit recipe
function editRecipe(recipe) {
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

  // Populate form with recipe data
  document.getElementById('recipeName').value = recipe.name;

  // Set ingredients - clear existing and add new ones
  const ingredientsContainer = document.getElementById('ingredientsContainer');
  ingredientsContainer.innerHTML = '';
  ingredientsList.forEach((ingredient, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ingredient-input-wrapper';
    wrapper.innerHTML = `
      <input type="text" class="ingredient-input" placeholder="Enter ingredient" required value="${ingredient.replace(/"/g, '&quot;')}">
      <button type="button" class="btn-remove-ingredient ${index === 0 && ingredientsList.length === 1 ? 'hidden' : ''}" onclick="removeIngredient(this)">Remove</button>
    `;
    ingredientsContainer.appendChild(wrapper);
  });

  // If no ingredients, add one empty field
  if (ingredientsList.length === 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ingredient-input-wrapper';
    wrapper.innerHTML = `
      <input type="text" class="ingredient-input" placeholder="Enter ingredient" required>
      <button type="button" class="btn-remove-ingredient hidden" onclick="removeIngredient(this)">Remove</button>
    `;
    ingredientsContainer.appendChild(wrapper);
  }

  // Set instructions - clear existing and add new ones
  const instructionsContainer = document.getElementById('instructionsContainer');
  instructionsContainer.innerHTML = '';
  instructionsList.forEach((instruction, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'instruction-input-wrapper';
    wrapper.innerHTML = `
      <input type="text" class="instruction-input" placeholder="Enter instruction step" required value="${instruction.replace(/"/g, '&quot;')}">
      <button type="button" class="btn-remove-instruction ${index === 0 && instructionsList.length === 1 ? 'hidden' : ''}" onclick="removeInstruction(this)">Remove</button>
    `;
    instructionsContainer.appendChild(wrapper);
  });

  // If no instructions, add one empty field
  if (instructionsList.length === 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'instruction-input-wrapper';
    wrapper.innerHTML = `
      <input type="text" class="instruction-input" placeholder="Enter instruction step" required>
      <button type="button" class="btn-remove-instruction hidden" onclick="removeInstruction(this)">Remove</button>
    `;
    instructionsContainer.appendChild(wrapper);
  }

  document.getElementById('estimatedTime').value = recipe.estimated_time || '';

  // Set difficulty level
  if (recipe.difficulty) {
    const difficultyInput = document.getElementById('difficultyInput');
    difficultyInput.value = recipe.difficulty;

    // Update circle visual
    const allCircles = document.querySelectorAll('.difficulty-circle');
    allCircles.forEach(circle => {
      circle.classList.remove('selected');
      if (circle.getAttribute('data-difficulty') === recipe.difficulty) {
        circle.classList.add('selected');
      }
    });
  }

  // Set season
  if (recipe.season) {
    const seasonInput = document.getElementById('seasonInput');
    seasonInput.value = recipe.season;

    // Update season button visual
    const allSeasonButtons = document.querySelectorAll('.season-button');
    allSeasonButtons.forEach(button => {
      button.classList.remove('selected');
      if (button.getAttribute('data-season') === recipe.season) {
        button.classList.add('selected');
      }
    });
  }

  isEditingRecipe = recipe.id;

  // Update modal title and button text
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.querySelector('#createRecipeForm .btn-submit');
  modalTitle.textContent = 'Edit Recipe';
  submitBtn.textContent = 'Update Recipe';

  // Clear image preview for editing
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  preview.classList.remove('show');
  document.getElementById('recipeImage').value = '';

  // Open modal
  const modal = document.getElementById('createRecipeModal');
  modal.classList.remove('hidden');

  // Close recipe detail modal
  closeRecipeModal();
}

// Edit recipe from modal
function editRecipeFromModal(recipeId) {
  const recipe = allRecipes.find(r => r.id === recipeId);
  if (recipe) {
    editRecipe(recipe);
  }
}

// Delete recipe
async function deleteRecipe(recipeId) {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUser.id || localStorage.getItem('userId'),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showError(errorData.error || 'Failed to delete recipe');
      return;
    }

    showSuccess('Recipe deleted successfully!');
    await loadRecipes();
  } catch (error) {
    console.error('Error deleting recipe:', error);
    showError('An error occurred while deleting the recipe');
  }
}

// Delete recipe from modal
function deleteRecipeFromModal(recipeId) {
  if (confirm('Are you sure you want to delete this recipe?')) {
    deleteRecipe(recipeId);
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message show';
  errorDiv.textContent = message;

  const container = document.querySelector('.recipe-container');
  container.insertBefore(errorDiv, container.firstChild);

  setTimeout(() => {
    errorDiv.remove();
  }, 4000);
}

// Show success message
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message show';
  successDiv.textContent = message;

  const container = document.querySelector('.recipe-container');
  container.insertBefore(successDiv, container.firstChild);

  setTimeout(() => {
    successDiv.remove();
  }, 4000);
}

// Show info message
function showInfo(message) {
  const infoDiv = document.createElement('div');
  infoDiv.className = 'info-message show';
  infoDiv.textContent = message;

  const container = document.querySelector('.recipe-container');
  container.insertBefore(infoDiv, container.firstChild);

  setTimeout(() => {
    infoDiv.remove();
  }, 4000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Toggle favorite recipe
async function toggleRecipeFavorite(recipeId, event) {
  event.stopPropagation();

  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    alert('Please log in to save recipes');
    return;
  }

  try {
    const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
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
      throw new Error(errorData.error || 'Failed to update favorite');
    }

    const result = await response.json();

    // Update the card's star button appearance
    const card = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (card) {
      const starBtn = card.querySelector('.btn-star-recipe');
      if (starBtn) {
        if (result.isFavorited) {
          starBtn.classList.add('favorited');
          starBtn.title = 'Remove from favorites';
        } else {
          starBtn.classList.remove('favorited');
          starBtn.title = 'Add to favorites';
        }
      }
    }

    // Update the modal button appearance
    const modalBtn = document.querySelector('.btn-star-modal');
    if (modalBtn) {
      if (result.isFavorited) {
        modalBtn.classList.add('favorited');
        modalBtn.title = 'Remove from favorites';
      } else {
        modalBtn.classList.remove('favorited');
        modalBtn.title = 'Add to favorites';
      }
    }

    console.log(`✅ Recipe ${recipeId} favorite toggled`);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    alert('Failed to save recipe: ' + error.message);
  }
}

// Close modals when clicking outside of them
window.addEventListener('click', (event) => {
  const recipeModal = document.getElementById('recipeModal');
  const createRecipeModal = document.getElementById('createRecipeModal');

  if (event.target === recipeModal) {
    closeRecipeModal();
  }

  if (event.target === createRecipeModal) {
    closeCreateRecipeModal();
  }
});
