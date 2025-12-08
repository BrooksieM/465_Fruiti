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
    console.log('Loading working hours:', hours);
    
    const dayRows = document.querySelectorAll('.day-row');
    
    dayRows.forEach((row, index) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayName = days[index];
        const dayData = hours[dayName];
        
        if (!dayData) return;
        
        const toggle = row.querySelector('.day-toggle');
        const timeInputs = row.querySelectorAll('.time-input');
        const statusText = row.querySelector('.status-text');
        
        // Set toggle state
        toggle.checked = dayData.open;
        
        // Set time values and enable/disable inputs
        if (dayData.open && dayData.start && dayData.end) {
            timeInputs[0].value = dayData.start;
            timeInputs[1].value = dayData.end;
            timeInputs[0].disabled = false;
            timeInputs[1].disabled = false;
            statusText.textContent = 'Open';
            statusText.classList.remove('closed');
        } else {
            timeInputs[0].value = '';
            timeInputs[1].value = '';
            timeInputs[0].disabled = true;
            timeInputs[1].disabled = true;
            statusText.textContent = 'Closed';
            statusText.classList.add('closed');
        }
    });
    initializeWorkingHoursToggles();
}
function initializeWorkingHoursToggles() {
    const dayRows = document.querySelectorAll('.day-row');
    
    dayRows.forEach(row => {
        const toggle = row.querySelector('.day-toggle');
        const timeInputs = row.querySelectorAll('.time-input');
        const statusText = row.querySelector('.status-text');
        
        toggle.addEventListener('change', function() {
            if (this.checked) {
                // Enable time inputs
                timeInputs[0].disabled = false;
                timeInputs[1].disabled = false;
                
                // Set default times if empty
                if (!timeInputs[0].value) timeInputs[0].value = '09:00';
                if (!timeInputs[1].value) timeInputs[1].value = '17:00';
                
                statusText.textContent = 'Open';
                statusText.classList.remove('closed');
            } else {
                // Disable time inputs
                timeInputs[0].disabled = true;
                timeInputs[1].disabled = true;
                
                statusText.textContent = 'Closed';
                statusText.classList.add('closed');
            }
        });
    });
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

// Global variable to store pending image upload
let pendingImageUpload = null;

// Stand image upload preview (no upload yet)
document.getElementById('standImageUpload')?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Image size must be less than 10MB');
            this.value = '';
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            this.value = '';
            return;
        }

        // Store image for upload when Save Changes is clicked
        const reader = new FileReader();
        reader.onload = function(e) {
            // Store the image data for later upload when Save Changes is clicked
            pendingImageUpload = {
                imageBase64: e.target.result,
                fileName: `stand-${Date.now()}.jpg`
            };

            showSuccess('Image selected. Click "Save Changes" to upload.');
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

        // Save fruit stand data
        await fetch(`/api/fruitstands/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // Upload pending image if there is one
        if (pendingImageUpload) {
            console.log('Uploading pending image...');
            try {
                const imageResponse = await fetch(`/api/fruitstand-images/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pendingImageUpload)
                });

                if (!imageResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const imageResult = await imageResponse.json();
                console.log('Image uploaded:', imageResult);

                // Clear pending upload after successful upload
                pendingImageUpload = null;

                showSuccess('Changes saved and image uploaded successfully!');
            } catch (imageError) {
                console.error('Error uploading image:', imageError);
                showError('Changes saved but image upload failed: ' + imageError.message);
                return;
            }
        } else {
            showSuccess('Changes saved successfully!');
        }

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

// Image Gallery Functions
async function openImageGallery() {
    const user = checkSellerAuth();
    if (!user) return;

    const modal = document.getElementById('imageGalleryModal');
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryLoading = document.getElementById('galleryLoading');
    const galleryEmpty = document.getElementById('galleryEmpty');

    // Show modal and loading state
    modal.style.display = 'flex';
    galleryLoading.style.display = 'block';
    galleryEmpty.style.display = 'none';
    galleryGrid.innerHTML = '';

    try {
        // Fetch images from the fruitstand-image bucket
        const response = await fetch(`/api/fruitstand-images/${user.id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        galleryLoading.style.display = 'none';

        // Show pending preview image first if it exists
        if (pendingImageUpload) {
            const previewItem = document.createElement('div');
            previewItem.className = 'gallery-item';
            previewItem.style.border = '3px solid #4CAF50';
            previewItem.innerHTML = `
                <img src="${pendingImageUpload.imageBase64}" alt="Pending upload">
                <div class="gallery-item-actions">
                    <span style="background: #4CAF50; color: white; padding: 5px 10px; border-radius: 4px; font-size: 0.85rem;">Preview (Not uploaded yet)</span>
                </div>
            `;
            galleryGrid.appendChild(previewItem);
        }

        if (!data.images || data.images.length === 0) {
            if (!pendingImageUpload) {
                galleryEmpty.style.display = 'block';
            }
            return;
        }

        // Display uploaded images in grid
        data.images.forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.className = 'gallery-item';
            imageItem.innerHTML = `
                <img src="${image.url}" alt="Fruit stand image">
                <div class="gallery-item-actions">
                    <button class="gallery-delete-btn" onclick="deleteImage('${image.name}', '${user.id}')">Delete</button>
                </div>
            `;
            galleryGrid.appendChild(imageItem);
        });

    } catch (error) {
        console.error('Error loading images:', error);
        galleryLoading.style.display = 'none';
        showError('Error loading images: ' + error.message);
    }
}

function closeImageGallery() {
    const modal = document.getElementById('imageGalleryModal');
    modal.style.display = 'none';
}

async function deleteImage(imageName, userId) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }

    try {
        const response = await fetch(`/api/fruitstand-images/${userId}/${imageName}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete image');
        }

        showSuccess('Image deleted successfully');
        // Reload the gallery
        openImageGallery();
    } catch (error) {
        console.error('Error deleting image:', error);
        showError('Error deleting image: ' + error.message);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('imageGalleryModal');
    if (e.target === modal) {
        closeImageGallery();
    }
});

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
