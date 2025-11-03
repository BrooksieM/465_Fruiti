let map;
let customMarkers = [];

// Initialize the map
function initMap() {
  // Create the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.0060 }, // Default: NYC
    zoom: 12
  });

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(userLocation);
        
        // Add blue marker for user's location
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
}

// Place a custom marker
function placeMarker(location) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    draggable: true, // Can drag to reposition
    animation: google.maps.Animation.DROP,
    icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
  });

  // Right-click to delete
  marker.addListener('rightclick', function() {
    marker.setMap(null);
    const index = customMarkers.indexOf(marker);
    if (index > -1) {
      customMarkers.splice(index, 1);
    }
  });

  // Click to show info
  marker.addListener('click', function() {
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3>Custom Marker</h3>
          <p><strong>Lat:</strong> ${location.lat().toFixed(6)}</p>
          <p><strong>Lng:</strong> ${location.lng().toFixed(6)}</p>
          <button onclick="deleteThisMarker(${customMarkers.length})" 
                  style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
            Delete
          </button>
        </div>
      `
    });
    infoWindow.open(map, marker);
  });

  customMarkers.push(marker);
}

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

// Make functions accessible globally
window.placeMarkerByAddress = placeMarkerByAddress;
window.clearAllCustomMarkers = clearAllCustomMarkers;
window.deleteThisMarker = deleteThisMarker;