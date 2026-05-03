// public/googleMaps.js
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8
  });

  google.maps.event.addListener(map, 'click', function(event) {
    const location = event.latLng;
    console.log('Selected location:', location.toString());
    // Store the selected location for the sandwich
  });
}

// Ensure the initMap function is globally accessible
window.initMap = initMap;
