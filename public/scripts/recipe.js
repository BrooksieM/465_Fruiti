// Recipe Page Functionality
let currentUser = null;
let allRecipes = [];
let isEditingRecipe = null;

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatusAndSetup();
  loadRecipes();

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

// Handle image preview
function handleImagePreview(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('imagePreview');

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      preview.innerHTML = `<img src="${event.target.result}" alt="Recipe preview">`;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '';
    preview.classList.remove('show');
  }
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
  if (!isEditingRecipe) {
    const userRecipes = allRecipes.filter(recipe => recipe.userId === (currentUser.id || localStorage.getItem('userId')));
    if (userRecipes.length >= 3) {
      showError('You can only create a maximum of 3 recipes');
      return;
    }
  }

  const name = document.getElementById('recipeName').value.trim();
  const ingredientsInput = document.getElementById('ingredients').value.trim();
  const instructions = document.getElementById('instructions').value.trim();
  const difficulty = document.getElementById('difficultyInput').value.trim();
  const estimatedTime = document.getElementById('estimatedTime').value.trim();
  const imageFile = document.getElementById('recipeImage').files[0];

  // Validate inputs
  if (!name || !ingredientsInput || !instructions) {
    showError('Please fill in all fields');
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

  // Parse ingredients - split by comma or newline
  const ingredients = ingredientsInput
    .split(/[,\n]/)
    .map(ing => ing.trim())
    .filter(ing => ing.length > 0);

  if (ingredients.length === 0) {
    showError('Please enter at least one ingredient');
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
        ingredients: JSON.stringify(ingredients),
        instructions: instructions,
        difficulty: difficulty,
        estimatedTime: parseInt(estimatedTime),
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
function displayRecipes() {
  const recipesList = document.getElementById('recipesList');
  recipesList.innerHTML = '';

  if (allRecipes.length === 0) {
    recipesList.innerHTML = '<div class="no-recipes">No recipes yet. Be the first to create one!</div>';
  } else {
    allRecipes.forEach(recipe => {
      const card = createRecipeCard(recipe);
      recipesList.appendChild(card);
    });
  }

  // Check if current user has reached recipe limit
  if (currentUser) {
    const createButton = document.getElementById('createRecipeButton');
    const userRecipes = allRecipes.filter(recipe => recipe.userId === (currentUser.id || localStorage.getItem('userId')));
    const btn = createButton.querySelector('.btn-create');

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

// Create a recipe card element
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';

  // Parse ingredients if it's a JSON string
  let ingredientsList = [];
  try {
    ingredientsList = typeof recipe.ingredients === 'string'
      ? JSON.parse(recipe.ingredients)
      : recipe.ingredients;
  } catch {
    ingredientsList = [recipe.ingredients];
  }

  const ingredientPreview = ingredientsList.slice(0, 2).join(', ');
  const ingredientSuffix = ingredientsList.length > 2 ? ` +${ingredientsList.length - 2} more` : '';

  card.innerHTML = `
    <h3>${escapeHtml(recipe.name)}</h3>
    <p><strong>Ingredients:</strong> ${escapeHtml(ingredientPreview)}${ingredientSuffix}</p>
    <p><strong>Instructions:</strong> ${escapeHtml(recipe.instructions.substring(0, 100))}...</p>
  `;

  card.addEventListener('click', () => viewRecipeDetail(recipe));

  // Show edit/delete buttons only for the recipe creator (if user is logged in)
  if (currentUser) {
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

  return card;
}

// View recipe details in modal
function viewRecipeDetail(recipe) {
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

  const ingredientHTML = ingredientsList
    .map(ing => `<li>${escapeHtml(ing)}</li>`)
    .join('');

  let detailHTML = `
    <h2>${escapeHtml(recipe.name)}</h2>
    <h3>Ingredients:</h3>
    <ul>
      ${ingredientHTML}
    </ul>
    <h3>Instructions:</h3>
    <p>${escapeHtml(recipe.instructions)}</p>
  `;

  // Add edit/delete buttons if user is logged in
  if (currentUser) {
    detailHTML += `
      <div class="modal-actions">
        <button class="btn-edit" onclick="editRecipeFromModal(${recipe.id})">Edit</button>
        <button class="btn-delete" onclick="deleteRecipeFromModal(${recipe.id})">Delete</button>
      </div>
    `;
  }

  recipeDetail.innerHTML = detailHTML;
  modal.classList.remove('hidden');
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

  // Populate form with recipe data
  document.getElementById('recipeName').value = recipe.name;
  document.getElementById('ingredients').value = ingredientsList.join(', ');
  document.getElementById('instructions').value = recipe.instructions;
  document.getElementById('estimatedTime').value = recipe.estimatedTime || '';

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
