const map = L.map('map').setView([46.5, -94.5], 6);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

fetch('https://raw.githubusercontent.com/wesleykeller/MN_Deer/74702b75dc1ff60c506f48f199110d9aabb1c16b/deer_data/deer_data.geojson')
  .then(response => response.json())
  .then(data => {
    // Generate a list of unique colors
    const colors = generateColorPalette(data.features.length);

    // Add a unique color to each feature (index-based)
    L.geoJSON(data, {
      style: function (feature, layer) {
        const index = data.features.indexOf(feature);
        return {
          color: colors[index],
          weight: 2,
          fillOpacity: 0.6
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties) {
          let table = '<table style="border-collapse: collapse; width: 100%;">';
          for (let key in feature.properties) {
            table += `
              <tr>
                <td style="border: 1px solid #ccc; padding: 4px;"><strong>${key}</strong></td>
                <td style="border: 1px solid #ccc; padding: 4px;">${feature.properties[key]}</td>
              </tr>
            `;
          }
          table += '</table>';
          layer.bindPopup(table);
        }
      }
    }).addTo(map);
  })
  .catch(error => console.error('Error loading GeoJSON:', error));

// Helper function to generate N unique HSL colors
function generateColorPalette(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation for good color spacing
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
}

