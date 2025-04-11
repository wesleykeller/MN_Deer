const map = L.map('map').setView([46.5, -94.5], 6);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON directly from local file
fetch('https://raw.githubusercontent.com/wesleykeller/MN_Deer/36ebbb3da1d50f5cf490c26ee52727f974ba66ca/deer_data/deer_data.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data).addTo(map);
  })
  .catch(error => console.error('Error loading GeoJSON:', error));
