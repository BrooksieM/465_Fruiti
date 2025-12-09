let map;
let customMarkers = [];
let sellerMarkers = [];
let allSellers = []; // Store all sellers for filtering
let filterCenter = null; // Store the center point for distance filtering
let filterRadius = 50; // Default radius in miles
let userLocation = null; // Store user's location
let filterActive = false; // Track if filter is active

// Initialize the map
function initMap()
 {
  const mapStyles = [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }]
    }
  ];

  // creating map (default given by gmaps NYC)
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.0060 }, 
    zoom: 12,
    styles: mapStyles
  });

  // getting users location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(userLocation);

        // Set as default filter center
        filterCenter = userLocation;

        // blue marker for users location
        new google.maps.Marker({
          position: userLocation,
          map: map,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          title: "Your Location"
        });
      },
      (error) => {
        console.log("Location not available, using default");
      }
    );
  }

  // Enable clicking on map to place markers
  map.addListener('click', function(event) {
    placeMarker(event.latLng);
  });

  // Load and display approved sellers on the map
  loadSellerMarkers();
}

// Fetch approved sellers and display them as markers
function loadSellerMarkers() {
  console.log('Loading seller markers...');
  fetch('/api/approved-sellers')
    .then(response => response.json())
    .then(data => {
      console.log('Sellers data received:', data);
      console.log('Full sellers array:', JSON.stringify(data.sellers, null, 2));
      if (data.sellers && data.sellers.length > 0) {
        // Store all sellers for filtering
        allSellers = data.sellers;

        data.sellers.forEach(seller => {
          console.log(`Processing seller: ${seller.business_name}`, {
            working_hours: seller.working_hours,
            produce: seller.produce
          });
          // Create full address string
          const fullAddress = `${seller.address}, ${seller.city}, ${seller.state} ${seller.zipcode}`;

          // Check if seller has pre-geocoded coordinates
          if (seller.latitude && seller.longitude) {
            console.log(`Using pre-geocoded coordinates for ${seller.business_name}: ${seller.latitude}, ${seller.longitude}`);
            const location = {
              lat: parseFloat(seller.latitude),
              lng: parseFloat(seller.longitude)
            };
            displaySellerMarker(seller, location, fullAddress);
          } else {
            console.warn(`No coordinates found for ${seller.business_name}, attempting fallback geocoding...`);
            // Fallback: Geocode the address if coordinates are not available
            geocodeWithNominatim(fullAddress, function(location) {
              if (location) {
                console.log(`Nominatim geocoded ${seller.business_name} to:`, location.lat, location.lng);
                displaySellerMarker(seller, location, fullAddress);
              } else {
                console.error(`Failed to geocode ${seller.business_name}`);
              }
            });
          }
        });
      } else {
        console.log('No sellers found');
      }
    })
    .catch(error => console.error('Error loading sellers:', error));
}

// Display a seller marker on the map
function displaySellerMarker(seller, location, fullAddress) {
  // Create a fruit stand SVG icon
  const fruitStandSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
      <!-- Tent/Roof -->
      <polygon points="10,50 50,20 90,50" fill="#FF6B6B" stroke="#8B0000" stroke-width="2"/>
      <!-- Left side of tent -->
      <polygon points="10,50 50,20 50,80" fill="#FF8A8A" stroke="#8B0000" stroke-width="2" opacity="0.8"/>
      <!-- Stand poles -->
      <rect x="35" y="75" width="4" height="15" fill="#8B6F47"/>
      <rect x="61" y="75" width="4" height="15" fill="#8B6F47"/>
      <!-- Counter/Base -->
      <rect x="20" y="80" width="60" height="12" fill="#D2B48C" stroke="#8B6F47" stroke-width="1"/>
      <!-- Fruit decoration - oranges on top -->
      <circle cx="35" cy="72" r="5" fill="#FF9500" stroke="#E67E22" stroke-width="1"/>
      <circle cx="50" cy="70" r="5" fill="#FFB347" stroke="#E67E22" stroke-width="1"/>
      <circle cx="65" cy="72" r="5" fill="#FF9500" stroke="#E67E22" stroke-width="1"/>
    </svg>
  `;

  const businessName = seller.business_name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Check if this fruitstand belongs to the current signed-in user
  let userLabel = '';
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.id === seller.user_id) {
        userLabel = `<div style="background: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; color: #019456; white-space: nowrap; margin-bottom: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); pointer-events: none;">Your Stand</div>`;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // Create custom marker HTML with icon and name below
  const markerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      ${userLabel}
      <div style="width: 40px; height: 40px; pointer-events: none;">${fruitStandSVG}</div>
      <div style="background: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #000; white-space: nowrap; margin-top: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); pointer-events: none;">${businessName}</div>
    </div>
  `;

  // Create a div element for the marker
  const markerDiv = document.createElement('div');
  markerDiv.innerHTML = markerHTML;
  markerDiv.style.cursor = 'pointer';

  // Create custom marker using OverlayView
  class CustomMarker extends google.maps.OverlayView {
    constructor(position, content, seller, fullAddress) {
      super();
      this.position = position;
      this.content = content;
      this.seller = seller;
      this.fullAddress = fullAddress;
    }

    onAdd() {
      const pane = this.getPanes().overlayMouseTarget;
      pane.appendChild(this.content);

      // Add click listener with proper event handling
      this.content.addEventListener('click', (e) => {
        e.stopPropagation();
        showSellerModal(this.seller, this.fullAddress);
      }, true);
    }

    draw() {
      const projection = this.getProjection();
      const position = projection.fromLatLngToDivPixel(this.position);
      this.content.style.left = (position.x - 35) + 'px';
      this.content.style.top = (position.y - 60) + 'px';
      this.content.style.position = 'absolute';
      this.content.style.zIndex = '100';
    }

    onRemove() {
      if (this.content.parentElement) {
        this.content.parentElement.removeChild(this.content);
      }
    }
  }

  const customMarker = new CustomMarker(location, markerDiv, seller, fullAddress);
  customMarker.setMap(map);

  console.log('Marker created for:', seller.business_name);

  sellerMarkers.push(customMarker);
}

// Fallback geocoding using OpenStreetMap Nominatim API (free, no API key needed)
function geocodeWithNominatim(address, callback) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const result = data[0];
        callback({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        });
      } else {
        callback(null);
      }
    })
    .catch(error => {
      console.error('Nominatim geocoding error:', error);
      callback(null);
    });
}

// Utility function to escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// // Place a custom marker
// function placeMarker(location) {
//   const marker = new google.maps.Marker({
//     position: location,
//     map: map,
//     draggable: true, // Can drag to reposition
//     animation: google.maps.Animation.DROP,
//     icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
//   });

//   // Right-click to delete
//   marker.addListener('rightclick', function() {
//     marker.setMap(null);
//     const index = customMarkers.indexOf(marker);
//     if (index > -1) {
//       customMarkers.splice(index, 1);
//     }
//   });

//   // Click to show info
//   marker.addListener('click', function() {
//     const infoWindow = new google.maps.InfoWindow({
//       content: `
//         <div style="padding: 10px;">
//           <h3>Custom Marker</h3>
//           <p><strong>Lat:</strong> ${location.lat().toFixed(6)}</p>
//           <p><strong>Lng:</strong> ${location.lng().toFixed(6)}</p>
//           <button onclick="deleteThisMarker(${customMarkers.length})" 
//                   style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
//             Delete
//           </button>
//         </div>
//       `
//     });
//     infoWindow.open(map, marker);
//   });

//   customMarkers.push(marker);
// }

// Place marker by address search
function placeMarkerByAddress(address) {
  const geocoder = new google.maps.Geocoder();
  
  geocoder.geocode({ address: address }, function(results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      placeMarker(results[0].geometry.location);
    } else {
      alert('Could not find address');
    }
  });
}

// Clear all custom markers
function clearAllCustomMarkers() {
  customMarkers.forEach(marker => marker.setMap(null));
  customMarkers = [];
}

// Delete specific marker
function deleteThisMarker(index) {
  if (customMarkers[index - 1]) {
    customMarkers[index - 1].setMap(null);
    customMarkers.splice(index - 1, 1);
  }
}

// Show seller modal
async function showSellerModal(seller, fullAddress) {
  const sellerHandle = seller.handle || 'N/A';
  const phoneNumber = seller.phone_number || 'N/A';
  const description = seller.description || 'No description provided';

  // Parse working_hours if it's a string (Supabase sometimes returns stringified JSON)
  let workingHours = seller.working_hours;
  if (typeof workingHours === 'string') {
    try {
      workingHours = JSON.parse(workingHours);
    } catch (e) {
      console.error('Failed to parse working_hours:', e);
      workingHours = null;
    }
  }

  // Parse produce if it's a string
  let produce = seller.produce;
  if (typeof produce === 'string') {
    try {
      produce = JSON.parse(produce);
    } catch (e) {
      console.error('Failed to parse produce:', e);
      produce = null;
    }
  }

  // Debug logging
  console.log('Seller data received:', seller);
  console.log('Raw working_hours:', seller.working_hours, 'Type:', typeof seller.working_hours);
  console.log('Raw produce:', seller.produce, 'Type:', typeof seller.produce);
  console.log('Working hours (parsed):', workingHours);
  console.log('Produce (parsed):', produce);
  console.log('All seller keys:', Object.keys(seller));

  // Fetch seller's images from fruitstand-image bucket
  let sellerImages = [];
  try {
    const imageResponse = await fetch(`/api/fruitstand-images/${seller.user_id}`);
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      sellerImages = imageData.images || [];
      console.log('Loaded seller images:', sellerImages);
    }
  } catch (error) {
    console.error('Error loading seller images:', error);
  }

  // Create image gallery HTML
  let imageGalleryHTML = '';
  if (sellerImages.length > 0) {
    imageGalleryHTML = `
      <div class="seller-image-gallery">
        <div class="gallery-main-image">
          <img id="mainGalleryImage" src="${sellerImages[0].url}" alt="${escapeHtml(seller.business_name)}"
               onerror="this.src='../images/default-stand.png'">
        </div>
        ${sellerImages.length > 1 ? `
          <div class="gallery-thumbnails">
            ${sellerImages.map((img, index) => `
              <img src="${img.url}" alt="Gallery image ${index + 1}"
                   class="gallery-thumbnail ${index === 0 ? 'active' : ''}"
                   onclick="changeMainImage('${img.url}', this)"
                   onerror="this.src='../images/default-stand.png'">
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } else {
    imageGalleryHTML = `
      <div class="seller-image-banner">
        <img src="../images/default-stand.png" alt="${escapeHtml(seller.business_name)}" class="seller-banner-image"
             onerror="this.src='../images/default-avatar.png'">
      </div>
    `;
  }

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = user && user.id;
  const isFavorited = isLoggedIn ? await isFruitStandFavorited(seller.user_id) : false;

  const modalHTML = `
    <div class="custom-modal" id="sellerModal" data-seller-id="${seller.user_id}">
      <div class="modal-overlay" onclick="closeSellerModal()"></div>
      <div class="modal-content seller-modal-large">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <h3>${escapeHtml(seller.business_name)}</h3>
            ${isLoggedIn ? `
              <button class="btn-heart" onclick="toggleFavoriteFruitStand(${seller.user_id})" title="${isFavorited ? 'Unfavorite this stand' : 'Favorite this stand'}">
                ${isFavorited ? '❤️' : '🤍'}
              </button>
            ` : ''}
          </div>
          <button class="close-btn" onclick="closeSellerModal()">×</button>
        </div>

        ${imageGalleryHTML}

        <div class="modal-body seller-modal-body-vertical">
          <div class="seller-info-group">
            <h4>Description</h4>
            <p>${escapeHtml(description)}</p>
          </div>

          <div class="seller-info-group">
            <h4>Contact Information</h4>
            <p><strong>Username:</strong> ${escapeHtml(sellerHandle)}</p>

            <p><strong>Stand Address:</strong> ${escapeHtml(fullAddress)}</p>
          </div>

          ${produce && Array.isArray(produce) && produce.length > 0 ? `
            <div class="seller-info-group">
              <h4>Available Produce</h4>
              <div class="produce-list">
                ${produce.map(fruit => `<span class="produce-item">${escapeHtml(typeof fruit === 'string' ? fruit : JSON.stringify(fruit))}</span>`).join('')}
              </div>
            </div>
          ` : `<div class="seller-info-group"><h4>Available Produce</h4><p style="color: #999; font-style: italic;">Not available</p></div>`}

          ${workingHours && typeof workingHours === 'object' && Object.keys(workingHours).length > 0 ? `
            <div class="seller-info-group">
              <h4>Working Hours</h4>
              <div class="hours-display">
                ${Object.entries(workingHours).map(([day, hours]) => {
                  const isOpen = typeof hours === 'object' && hours.open;
                  const timeStr = isOpen ? `${hours.start} - ${hours.end}` : 'Closed';
                  return `<div class="hour-row"><span class="day">${day}:</span><span class="time">${timeStr}</span></div>`;
                }).join('')}
              </div>
            </div>
          ` : `<div class="seller-info-group"><h4>Working Hours</h4><p style="color: #999; font-style: italic;">Not available</p></div>`}
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeSellerModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  // Remove any existing modal
  const existingModal = document.getElementById('sellerModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Insert new modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Change main gallery image
function changeMainImage(imageUrl, thumbnail) {
  const mainImage = document.getElementById('mainGalleryImage');
  if (mainImage) {
    mainImage.src = imageUrl;
  }

  // Update active thumbnail
  const thumbnails = document.querySelectorAll('.gallery-thumbnail');
  thumbnails.forEach(thumb => thumb.classList.remove('active'));
  if (thumbnail) {
    thumbnail.classList.add('active');
  }
}

// Close seller modal
function closeSellerModal() {
  const modal = document.getElementById('sellerModal');
  if (modal) {
    modal.remove();
  }
}

// Contact seller function
function contactSeller(phoneNumber) {
  alert('Contact this seller at ' + phoneNumber);
}

// Calculate distance between two points in miles using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Clear all seller markers from map
function clearSellerMarkers() {
  sellerMarkers.forEach(marker => {
    if (marker && marker.setMap) {
      marker.setMap(null);
    }
  });
  sellerMarkers = [];
}

// Filter and display sellers based on zipcode and radius
function filterSellers() {
  if (!filterActive || !filterCenter) {
    // No filter active, show all sellers
    clearSellerMarkers();
    allSellers.forEach(seller => {
      const fullAddress = `${seller.address}, ${seller.city}, ${seller.state} ${seller.zipcode}`;
      if (seller.latitude && seller.longitude) {
        const location = {
          lat: parseFloat(seller.latitude),
          lng: parseFloat(seller.longitude)
        };
        displaySellerMarker(seller, location, fullAddress);
      }
    });
    return;
  }

  // Filter sellers by distance
  clearSellerMarkers();
  let filteredCount = 0;
  allSellers.forEach(seller => {
    if (seller.latitude && seller.longitude) {
      const distance = calculateDistance(
        filterCenter.lat,
        filterCenter.lng,
        parseFloat(seller.latitude),
        parseFloat(seller.longitude)
      );

      if (distance <= filterRadius) {
        const fullAddress = `${seller.address}, ${seller.city}, ${seller.state} ${seller.zipcode}`;
        const location = {
          lat: parseFloat(seller.latitude),
          lng: parseFloat(seller.longitude)
        };
        displaySellerMarker(seller, location, fullAddress);
        filteredCount++;
      }
    }
  });

  console.log(`Showing ${filteredCount} stands within ${filterRadius} miles`);
}

// Geocode zipcode and apply filter
async function applyZipcodeFilter(zipcode) {
  if (!zipcode || zipcode.length !== 5) {
    console.error('Invalid zipcode');
    return;
  }

  try {
    // Use Nominatim API to geocode the ZIP code
    const encodedZipcode = encodeURIComponent(zipcode + ', USA');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedZipcode}&countrycodes=us&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Fruiti-App/1.0 (fruit stand locator app)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      filterCenter = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };

      // Center map on the zipcode
      map.setCenter(filterCenter);
      map.setZoom(10);

      // Activate filter
      filterActive = true;

      // Apply the filter
      filterSellers();

      console.log(`Filter applied: ZIP ${zipcode}, Radius ${filterRadius} miles`);
    } else {
      alert('Invalid ZIP code. Please try again.');
      console.error('No results found for ZIP code:', zipcode);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    alert('Error geocoding ZIP code. Please try again.');
  }
}

// Clear filter and show all sellers
function clearFilter() {
  // Reset to user location if available, otherwise null
  filterCenter = userLocation;
  filterActive = false;
  document.getElementById('zipcodeSearch').value = '';
  filterSellers();
  console.log('Filter cleared, showing all sellers');
}

// Initialize filter controls
function initializeFilterControls() {
  const zipcodeInput = document.getElementById('zipcodeSearch');
  const rangeSlider = document.getElementById('rangeSlider');
  const rangeValue = document.getElementById('rangeValue');
  const clearBtn = document.getElementById('clearFilter');

  // Only allow numbers in zipcode input
  zipcodeInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  // Apply filter when user types 5 digits
  zipcodeInput.addEventListener('input', function(e) {
    if (this.value.length === 5) {
      applyZipcodeFilter(this.value);
    }
  });

  // Update range value display and gradient
  rangeSlider.addEventListener('input', function(e) {
    const value = parseInt(this.value);
    rangeValue.textContent = value;
    filterRadius = value;

    // Update slider gradient
    const percent = ((value - 10) / (100 - 10)) * 100;
    this.style.background = `linear-gradient(to right, #019456 0%, #019456 ${percent}%, #e0e0e0 ${percent}%, #e0e0e0 100%)`;

    // Activate filter if we have a center point (user location or zipcode)
    if (filterCenter) {
      filterActive = true;
      filterSellers();
    }
  });

  // Clear filter button
  clearBtn.addEventListener('click', clearFilter);

  console.log('Filter controls initialized');
}

// Make functions accessible globally
window.placeMarkerByAddress = placeMarkerByAddress;
window.clearAllCustomMarkers = clearAllCustomMarkers;
window.deleteThisMarker = deleteThisMarker;
window.loadSellerMarkers = loadSellerMarkers;
window.showSellerModal = showSellerModal;
window.closeSellerModal = closeSellerModal;
window.contactSeller = contactSeller;
window.changeMainImage = changeMainImage;
window.initializeFilterControls = initializeFilterControls;

// Initialize filter controls when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFilterControls);
} else {
  initializeFilterControls();
}