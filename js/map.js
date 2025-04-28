const map = L.map('map').setView([46.5, -94.5], 6);

// Base map layer
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create a group to hold your deer data
const deerLayerGroup = L.layerGroup().addTo(map);

// Fetch and add your GeoJSON data
fetch('https://raw.githubusercontent.com/wesleykeller/MN_Deer/74702b75dc1ff60c506f48f199110d9aabb1c16b/deer_data/deer_data.geojson')
  .then(response => response.json())
  .then(data => {
    const colors = generateColorPalette(data.features.length);

    const geojsonLayer = L.geoJSON(data, {
      style: function (feature) {
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
    });

    // Add the geojson layer to the group
    deerLayerGroup.addLayer(geojsonLayer);
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

fetch('https://raw.githubusercontent.com/wesleykeller/MN_Deer/74702b75dc1ff60c506f48f199110d9aabb1c16b/deer_data/deer_data.geojson')
  .then(response => response.json())
  .then(data => {
    // 1. Get min and max six_Yr_ave values
    const values = data.features.map(f => f.properties.six_Yr_ave).filter(v => v != null);
    const min = Math.min(...values);
    const max = Math.max(...values);

    console.log('Min:', min, 'Max:', max); // optional, just to check

    // 2. Create a color function that interpolates colors
    function getColor(d) {
      // Normalize d between 0 and 1
      const t = (d - min) / (max - min);

      // Interpolate between two colors (yellow to dark red for example)
      const r = Math.floor(255 * (1 - t) + 128 * t); // 255 (yellow) to 128 (dark red)
      const g = Math.floor(255 * (1 - t) + 0 * t);   // 255 to 0
      const b = Math.floor(0 * (1 - t) + 0 * t);     // 0 to 0

      return `rgb(${r},${g},${b})`;
    }

    const geojsonLayer = L.geoJSON(data, {
      style: function (feature) {
        const value = feature.properties.six_Yr_ave;
        return {
          fillColor: getColor(value),
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
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
    });

    deerLayerGroup.addLayer(geojsonLayer); // Assuming you have a deerLayerGroup
  })
  .catch(error => console.error('Error loading GeoJSON:', error));

// Set up the Layer Control
const baseMaps = {
  "OpenStreetMap": osm
};

const overlayMaps = {
  "DMU Deer Populations": deerLayerGroup
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
