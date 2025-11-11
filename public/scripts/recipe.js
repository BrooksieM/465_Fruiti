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

// Toggle recipe form visibility
function toggleRecipeForm() {
  const recipeForm = document.getElementById('recipeForm');
  const createButton = document.getElementById('createRecipeButton');

  if (recipeForm.classList.contains('hidden')) {
    recipeForm.classList.remove('hidden');
    createButton.classList.add('hidden');
    // Reset form
    document.getElementById('createRecipeForm').reset();
    isEditingRecipe = null;
  } else {
    recipeForm.classList.add('hidden');
    createButton.classList.remove('hidden');
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

  const name = document.getElementById('recipeName').value.trim();
  const ingredientsInput = document.getElementById('ingredients').value.trim();
  const instructions = document.getElementById('instructions').value.trim();

  // Validate inputs
  if (!name || !ingredientsInput || !instructions) {
    showError('Please fill in all fields');
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
        userId: currentUser.id || localStorage.getItem('userId'),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showError(errorData.error || 'Failed to save recipe');
      return;
    }

    const data = await response.json();
    showSuccess(isEditingRecipe ? 'Recipe updated successfully!' : 'Recipe created successfully!');

    // Reset form and reload recipes
    document.getElementById('createRecipeForm').reset();
    isEditingRecipe = null;
    toggleRecipeForm();
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
    return;
  }

  allRecipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    recipesList.appendChild(card);
  });
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

  isEditingRecipe = recipe.id;

  // Show form and hide button
  const recipeForm = document.getElementById('recipeForm');
  const createButton = document.getElementById('createRecipeButton');
  recipeForm.classList.remove('hidden');
  createButton.classList.add('hidden');

  // Update button text
  const submitBtn = document.querySelector('.btn-submit');
  submitBtn.textContent = 'Update Recipe';

  // Close modal
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

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  const modal = document.getElementById('recipeModal');
  if (event.target === modal) {
    closeRecipeModal();
  }
});
