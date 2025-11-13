// navigationForLoggedInUser.js

// Debug function to check localStorage
function debugUserData() {
    console.log('=== DEBUG: Checking localStorage ===');
    const userData = localStorage.getItem('user');
    
    if (!userData) {
        console.log('❌ No user data found in localStorage');
        console.log('All localStorage items:', Object.keys(localStorage));
        return null;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('✅ User data found:', user);
        console.log('🔑 User ID:', user.id);
        return user;
    } catch (error) {
        console.log('❌ Error parsing user data:', error);
        return null;
    }
}

// Update navigation based on login status
function updateNavigationForLoggedInUser(user) {
    const authButtons = document.getElementById('authButtons');
    console.log('🔄 Updating navigation for user:', user);
    
    if (user && user.id) {
        // User is logged in - show profile dropdown
        const avatarUrl = user.avatar || '../images/default-avatar.png';
        const username = user.username || user.handle || 'User';
        const email = user.email;
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="profile-dropdown-btn" id="profileDropdownBtn">
                    <img src="${avatarUrl}" alt="Profile" class="profile-avatar" 
                         onerror="this.src='../images/default-avatar.png'">
                </button>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="dropdown-header">
                        <div class="dropdown-username">${username}</div>
                        <div class="dropdown-email">${email}</div>
                    </div>
                    
                    <div class="dropdown-section">
                        <button class="dropdown-item" onclick="goToSettings()">
                            <span>⚙️</span> Account Preferences
                        </button>

                    </div>
                    
                    <div class="dropdown-section">
                        <button class="dropdown-item" onclick="goToStars()">
                            <span>⭐</span> Saved Recipes
                        </button>
                        <button class="dropdown-item" onclick="goToFruitStand()">
                            <span>❤️</span> Favorite Fruit Stands
                        </button>
                    </div>
                    
                    
                    <div class="dropdown-section">
                        <button class="dropdown-item" onclick="logout()">
                            <span>🚪</span> Sign out
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize dropdown functionality
        initializeProfileDropdown();
        console.log('✅ Navigation updated with profile dropdown');
    } else {
        console.log('❌ No user found, keeping login/signup buttons');
    }
}

// Profile dropdown functionality
function initializeProfileDropdown() {
    const dropdownBtn = document.getElementById('profileDropdownBtn');
    const dropdown = document.getElementById('profileDropdown');
    
    if (dropdownBtn && dropdown) {
        // Toggle dropdown on button click
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdown.classList.remove('show');
        });
        
        // Prevent dropdown from closing when clicking inside
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        console.log('✅ Dropdown functionality initialized');
    }
}

// Navigation functions for dropdown items
function goToProfile() {
    window.location.href = 'profile.html';
}


function goToStars() {
    window.location.href = 'stars.html';
}


function goToOrganizations() {
    window.location.href = 'organizations.html';
}

function goToSettings() {
    location.href = '/settings';
}


// Logout function
function logout() {
    console.log('🚪 Logging out...');
    localStorage.removeItem('user');
    localStorage.removeItem('userStatus');
    window.location.href = '/';

    localStorage.setItem('isLoggedIn', 'false');
}

// Check authentication status when page loads
function checkAuthStatus() {
    console.log('🔍 Checking authentication status...');
    const user = debugUserData();
    
    if (user && user.id) {
        console.log('✅ User is authenticated, updating navigation...');
        updateNavigationForLoggedInUser(user);
    } else {
        console.log('❌ User not authenticated, keeping default buttons');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, checking auth status...');
    checkAuthStatus();
});