// Check if user already has a fruit stand and redirect appropriately
async function checkExistingFruitstand() {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      // Not logged in, allow to view page
      return;
    }

    const user = JSON.parse(userData);
    const userId = user.id;
    
    if (!userId) {
      return;
    }

    // Check if user is a seller
    if (!user.is_seller) {
      // Not a seller, allow to view become-seller page
      return;
    }

    const response = await fetch(`/api/fruitstands/user/${userId}`);

    if (response.ok) {
      // User already has a fruit stand, redirect to extension page
      console.log('User has existing fruit stand, redirecting to extension page');
      window.location.href = '/extend-subscription';
    }
    // If no fruit stand (404), continue normally on become-seller page
  } catch (error) {
    console.error('Error checking existing fruit stand:', error);
  }
}

// Run check when page loads
document.addEventListener('DOMContentLoaded', checkExistingFruitstand);
