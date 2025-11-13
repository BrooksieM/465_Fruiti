// Seller Dashboard JavaScript

// Check authentication and seller status
function checkSellerAuth() {
    console.log('Checking seller authentication...');
    const userData = localStorage.getItem('user');

    if (!userData) {
        console.log('No user found, redirecting to login...');
        showError('Please log in to access the seller dashboard');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return null;
    }

    try {
        const user = JSON.parse(userData);
        console.log('User found:', user);

        if (!user.is_seller) {
            console.log('User is not a seller, redirecting...');
            showError('You need to be a seller to access this page');
            setTimeout(() => {
                window.location.href = '/become-seller';
            }, 2000);
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// Load seller data
async function loadSellerData(userId) {
    try {
        console.log('Loading seller data for user:', userId);

        // Fetch seller application data
        const response = await fetch(`/api/fruitstands/${userId}`, {
            method: 'GET'
        });

        if (!response.ok) {
            console.log('No existing seller data found');
            return null;
        }

        const data = await response.json();
        console.log('Seller data loaded:', data);

        // Populate form fields
        if (data.business_name) {
            document.getElementById('standName').value = data.business_name;
        }
        if (data.phone_number) {
            document.getElementById('phoneNumber').value = data.phone_number;
        }
        if (data.address) {
            document.getElementById('addressLn1').value = data.address;
        }
        if (data.city) {
            document.getElementById('city').value = data.city;
        }
        if (data.state) {
            document.getElementById('state').value = data.state;
        }
        if (data.zipcode) {
            document.getElementById('zipCode').value = data.zipcode;
        }
        if (data.description) {
            document.getElementById('standDescription').value = data.description;
        }

        // Load working hours if available
        if (data.working_hours) {
            loadWorkingHours(data.working_hours);
        }

        // Load produce list if available
        if (data.produce) {
            loadProduce(data.produce);
        }

        return data;
    } catch (error) {
        console.error('Error loading seller data:', error);
        return null;
    }
}

// Load working hours
function loadWorkingHours(hours) {
    // This would populate the hours based on saved data
    console.log('Loading working hours:', hours);
}

// Load produce
function loadProduce(produce) {
    if (!Array.isArray(produce)) return;

    const produceTagsContainer = document.getElementById('produceTags');
    produceTagsContainer.innerHTML = '';

    produce.forEach(fruit => {
        addProduceTag(fruit);
    });
}

// Toggle day open/closed
document.querySelectorAll('.day-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
        const dayRow = this.closest('.day-row');
        const timeInputs = dayRow.querySelectorAll('.time-input');
        const statusText = dayRow.querySelector('.status-text');

        if (this.checked) {
            // Day is open
            timeInputs.forEach(input => {
                input.disabled = false;
                if (!input.value) {
                    input.value = input === timeInputs[0] ? '09:00' : '17:00';
                }
            });
            statusText.textContent = 'Open';
            statusText.classList.remove('closed');
        } else {
            // Day is closed
            timeInputs.forEach(input => {
                input.disabled = true;
            });
            statusText.textContent = 'Closed';
            statusText.classList.add('closed');
        }
    });
});

// Stand image upload preview
document.getElementById('standImageUpload')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('Image size must be less than 5MB');
            this.value = '';
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            this.value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('standImagePreview').src = e.target.result;
            showSuccess('Image preview updated! Click "Save Changes" to save.');
        };
        reader.readAsDataURL(file);
    }
});

// Add fruit to produce list
function addFruit() {
    const input = document.getElementById('newFruitInput');
    const fruitName = input.value.trim();

    if (!fruitName) {
        showError('Please enter a fruit name');
        return;
    }

    // Check if fruit already exists
    const existingTags = document.querySelectorAll('.produce-tag');
    for (let tag of existingTags) {
        if (tag.textContent.replace('×', '').trim().toLowerCase() === fruitName.toLowerCase()) {
            showError('This fruit is already in your list');
            return;
        }
    }

    addProduceTag(fruitName);
    input.value = '';
    showSuccess(`${fruitName} added to your produce list`);
}

// Add produce tag to DOM
function addProduceTag(fruitName) {
    const produceTagsContainer = document.getElementById('produceTags');
    const tag = document.createElement('span');
    tag.className = 'produce-tag';
    tag.innerHTML = `${fruitName} <button class="remove-tag" onclick="removeProduceTag(this)">×</button>`;
    produceTagsContainer.appendChild(tag);
}

// Remove produce tag
function removeProduceTag(button) {
    const tag = button.closest('.produce-tag');
    const fruitName = tag.textContent.replace('×', '').trim();
    tag.remove();
    showSuccess(`${fruitName} removed from your produce list`);
}

// Allow adding fruit with Enter key
document.getElementById('newFruitInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addFruit();
    }
});

// Get working hours data
function getWorkingHours() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = {};

    document.querySelectorAll('.day-row').forEach((row, index) => {
        const dayName = days[index];
        const toggle = row.querySelector('.day-toggle');
        const timeInputs = row.querySelectorAll('.time-input');

        hours[dayName] = {
            open: toggle.checked,
            start: toggle.checked ? timeInputs[0].value : null,
            end: toggle.checked ? timeInputs[1].value : null
        };
    });

    return hours;
}

// Get produce list
function getProduceList() {
    const produceTags = document.querySelectorAll('.produce-tag');
    const produce = [];

    produceTags.forEach(tag => {
        const fruitName = tag.textContent.replace('×', '').trim();
        if (fruitName) {
            produce.push(fruitName);
        }
    });

    return produce;
}

// Save changes
async function saveChanges() {
    console.log('Saving changes...');

    const user = checkSellerAuth();
    if (!user) return;

    const saveBtn = document.querySelector('.save-changes-btn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');

    // Show loading state
    saveBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    hideMessages();

    try {
        // Gather all form data
        const standName = document.getElementById('standName').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const addressLn1 = document.getElementById('addressLn1').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const zipCode = document.getElementById('zipCode').value.trim();
        const description = document.getElementById('standDescription').value.trim();
        const workingHours = getWorkingHours();
        const produce = getProduceList();

        // Basic validation
        if (!standName) {
            throw new Error('Stand name is required');
        }
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }

        const formData = {
            business_name: standName,
            phone_number: phoneNumber,
            address: addressLn1,
            city: city,
            state: state,
            zipcode: zipCode,
            description: description,
            working_hours: workingHours,
            produce: produce
        };

        console.log('Form data:', formData);


        const response = await fetch(`/api/fruitstands/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });


        showSuccess('Changes saved successfully!');

    } catch (error) {
        console.error('Error saving changes:', error);
        showError('Error: ' + error.message);
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Message helpers
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    const errorElement = document.getElementById('errorMessage');

    if (errorElement) errorElement.style.display = 'none';
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';

        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}

function showError(message) {
    const successElement = document.getElementById('successMessage');
    const errorElement = document.getElementById('errorMessage');

    if (successElement) successElement.style.display = 'none';
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideMessages() {
    const successElement = document.getElementById('successMessage');
    const errorElement = document.getElementById('errorMessage');

    if (successElement) successElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Seller dashboard loaded');

    const user = checkSellerAuth();
    if (!user) return;

    // Update navigation
    if (typeof updateNavigationForLoggedInUser === 'function') {
        updateNavigationForLoggedInUser(user);
    }

    // Load existing seller data
    await loadSellerData(user.id);
});
