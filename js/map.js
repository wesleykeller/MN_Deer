// Initialize map
const map = L.map('map').setView([46.5, -94.5], 6);

// Base map layer Google Satellite
const googleSat = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  attribution: 'Google',
  subdomains: '0123'
 }).addTo(map);

// Base map layer OSM
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create LayerGroups
const DPU_Data = L.layerGroup().addTo(map);
const DPA_Data = L.layerGroup().addTo(map);
const DPU_CropDensity = L.layerGroup().addTo(map);
const DPA_CropDensity = L.layerGroup().addTo(map);

// Helper: create popup table
function createPopupTable(properties) {
  let table = '<table style="border-collapse: collapse; width: 100%;">';
  for (let key in properties) {
    table += `
      <tr>
        <td style="border: 1px solid #ccc; padding: 4px;"><strong>${key}</strong></td>
        <td style="border: 1px solid #ccc; padding: 4px;">${properties[key]}</td>
      </tr>
    `;
  }
  table += '</table>';
  return table;
}

// Function to load a graduated color layer based on a specific column
function loadGraduatedLayer(url, targetGroup, column, min, max) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      function getColor(d) {
        if (d === null) {
          return 'grey'; // Grey color for null values
        }
        const t = (d - min) / (max - min);
        const r = Math.floor(255 * (1 - t) + 128 * t);
        const g = Math.floor(255 * (1 - t) + 0 * t);
        const b = Math.floor(0 * (1 - t) + 0 * t);
        return `rgb(${r},${g},${b})`;
      }

      const geojsonLayer = L.geoJSON(data, {
        style: function (feature) {
          const value = feature.properties[column];
          return {
            fillColor: getColor(value),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8
          };
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties) {
            layer.bindPopup(createPopupTable(feature.properties));
          }
        }
      });

      targetGroup.addLayer(geojsonLayer);
    })
    .catch(error => console.error(`Error loading ${url}:`, error));
}

// Get min and max values for the column and create the legend
function getMinMax(url, column) {
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      const values = data.features.map(f => f.properties[column]).filter(v => v != null);
      const min = Math.min(...values);
      const max = Math.max(...values);
      return { min, max };
    })
    .catch(error => {
      console.error('Error loading data for min/max calculation:', error);
    });
}

// Create the legend
function createLegend(min, max, column) {
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [];
    const numGrades = 6;
    const step = (max - min) / numGrades;
    for (let i = 0; i <= numGrades; i++) {
      grades.push(min + i * step);
    }

    let labels = grades.slice(0, -1).map((from, i) => {
      const to = grades[i + 1];
      return `<i style="background:${getColor((from + to) / 2)}"></i> ${from.toFixed(0)}&ndash;${to.toFixed(0)}`;
    });

    // Add the grey color entry for null values
    labels.unshift(`<i style="background:grey"></i> Null Values`);

    div.innerHTML = labels.join('<br>');
    return div;
  };
  legend.addTo(map);
}

// Load data and create graduated layers for "six_yr_ave"
getMinMax('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DMU_data.geojson', 'six_yr_ave')
  .then(({ min, max }) => {
    loadGraduatedLayer('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DMU_data.geojson', DPU_Data, 'six_yr_ave', min, max);
    createLegend(min, max, 'six_yr_ave'); // Create the legend for DMU layer
  });

getMinMax('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DPA_data.geojson', 'six_yr_ave')
  .then(({ min, max }) => {
    loadGraduatedLayer('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DPA_data.geojson', DPA_Data, 'six_yr_ave', min, max);
  });

// Load data and create graduated layers for "Crop_Density"
getMinMax('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DMU_data.geojson', 'Crop_Density')
  .then(({ min, max }) => {
    loadGraduatedLayer('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DMU_data.geojson', DPU_CropDensity, 'Crop_Density', min, max);
    createLegend(min, max, 'Crop_Density'); // Create the legend for Crop_Density DMU layer
  });

getMinMax('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DPA_data.geojson', 'Crop_Density')
  .then(({ min, max }) => {
    loadGraduatedLayer('https://raw.githubusercontent.com/wesleykeller/MN_Deer/main/deer_data/DPA_data.geojson', DPA_CropDensity, 'Crop_Density', min, max);
  });

// Set up layer control
const baseMaps = { 'Google Satellite': googleSat, "OpenStreetMap": osm};

const overlayMaps = {
  "DMU - Deer Populations": DPU_Data,
  "DPA - Deer Populations": DPA_Data,
  "DMU - Crop Density": DPU_CropDensity,
  "DPA - Crop Density": DPA_CropDensity
};
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// JavaScript to toggle the footer popup visibility
const closeFooterButton = document.getElementById('closeFooter');
const footerPopup = document.getElementById('footerPopup');

// Toggle the visibility of the footer popup when the close button is clicked
closeFooterButton.addEventListener('click', function () {
  footerPopup.classList.toggle('minimized');
});
