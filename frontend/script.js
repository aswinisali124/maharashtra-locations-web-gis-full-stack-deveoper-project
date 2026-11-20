// ============================================================
// MAHARASHTRA LOCATIONS WEB GIS
// Complete JavaScript Code
// ============================================================


//  SAMPLE LOCATIONS DATA
// ============================================================

const sampleLocations = [
    {
        id: 1,
        name: "Gateway of India",
        city: "Mumbai",
        lat: 18.9220,
        lng: 72.8347
    },
    {
        id: 2,
        name: "Marine Drive",
        city: "Mumbai",
        lat: 18.9440,
        lng: 72.8238
    },
    {
        id: 3,
        name: "Dadar Station",
        city: "Mumbai",
        lat: 19.0180,
        lng: 72.8438
    },
    {
        id: 4,
        name: "Thane Station",
        city: "Thane",
        lat: 19.1860,
        lng: 72.9750
    },
    {
        id: 5,
        name: "Pune Station",
        city: "Pune",
        lat: 18.5289,
        lng: 73.8744
    },
    {
        id: 6,
        name: "Shaniwar Wada",
        city: "Pune",
        lat: 18.5195,
        lng: 73.8553
    },
    {
        id: 7,
        name: "Nashik Road Station",
        city: "Nashik",
        lat: 19.9470,
        lng: 73.8420
    },
    {
        id: 8,
        name: "Panchavati",
        city: "Nashik",
        lat: 20.0059,
        lng: 73.7900
    },
    {
        id: 9,
        name: "Nagpur Station",
        city: "Nagpur",
        lat: 21.1500,
        lng: 79.0880
    },
   
];


//  INITIAL MAP SETTINGS
// ============================================================

const initialMapCenter = [20.5937, 78.9629];

const initialZoom = 5;

const map = L.map("map", {
  zoomControl: false
}).setView(
  initialMapCenter,
  initialZoom
);

L.control.zoom({
  position: 'bottomleft'
}).addTo(map);

// Scale Bar - bottom-left
L.control.scale({
  position: 'bottomleft',
  metric: true,
  imperial: true,
  maxWidth: 150
}).addTo(map);


// North Arrow
const northControl = L.control({position: 'topright'});
northControl.onAdd = function(){
  const div = L.DomUtil.create('div', 'north-arrow');
  div.innerHTML = '▲ N';
  return div;
};
northControl.addTo(map);


//  BASE MAP LAYERS
// ============================================================

// OpenStreetMap

const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
);

// Satellite Map

const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri"
    }
);

const terrain = L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 17,
        attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | style &copy; OpenTopoMap'
    }
);


const toner = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    {
        maxZoom: 20,
        attribution:
            '&copy; Stadia Maps &copy; Stamen Design &copy; OpenMapTiles &copy; OpenStreetMap contributors'
    }
); // NOTE: Stadia needs API key for heavy use. If tiles go grey, remove toner/terrain and keep OSM + Satellite + Light.

// Light Map

const cartoLight = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
        maxZoom: 20,
        attribution:
            "&copy; OpenStreetMap contributors &copy; CARTO"
    }
);


// Add default map

osm.addTo(map);


//  MARKER COLORS
// ============================================================

const markerColors = {
    "Mumbai": "#dc2626",
    "Thane": "#2563eb",
    "Pune": "#7c3aed",
    "Nashik": "#d906d2",
    "Nagpur": "#16a34a",

};


// MARKER CLUSTER
// ============================================================

const markerClusterGroup = L.markerClusterGroup();

const markerById = new Map();


// Create location marker

function createLocationMarker(location) {

    const color =
        markerColors[location.city] || "#bfbc13";

    const marker = L.circleMarker(
        [location.lat, location.lng],
        {
            radius: 8,
            color: "#ffffff",
            weight: 2,
            fillColor: color,
            fillOpacity: 0.95
        }
    );

    marker.bindPopup(`
        <div>
            <strong>${location.name}</strong><br>
            City: ${location.city}<br>
            Latitude: ${location.lat}<br>
            Longitude: ${location.lng}
        </div>
    `);

    return marker;
}


// Add markers to map

sampleLocations.forEach(function (location) {

    const marker = createLocationMarker(location);

    markerById.set(location.id, marker);

    markerClusterGroup.addLayer(marker);

});


// Add cluster group

map.addLayer(markerClusterGroup);

//  LAYER CONTROL
// ============================================================

// Empty GeoJSON layer - created first so it can be in control
const puneLayer = L.geoJSON(null, {
  style: {
    color: "#7c3aed",
    weight: 2,
    fillOpacity: 0.4
  },
  // fix: points from PostGIS API need circleMarkers, polygons need style above
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 7,
      color: "#ffffff",
      weight: 2,
      fillColor: "#7c3aed",
      fillOpacity: 0.95
    });
  },
  onEachFeature: function(feature, layer) {
    const p = feature.properties || {};
    layer.bindPopup(`
      <strong>${p.name || 'Unknown'}</strong><br>
      City: ${p.city || ''}
    `);
  }
}).addTo(map);

//  LAYER CONTROL
L.control.layers(
  {
    "OpenStreetMap": osm,
    "Satellite": satellite,
    "terrain":terrain,
     "toner":toner,
     "Light Map": cartoLight
  },
  {
    "Locations Clusters": markerClusterGroup,
    "Pune Facilities (GeoJSON)": puneLayer
  },
  {
    collapsed: false
  }
).addTo(map);

// Load Polygon GeoJSON
// fetch("pune_facilities.geojson")
//   .then(res => res.json())
//   .then(data => {
//     const polygonLayer = L.geoJSON(data, {
//       style: {
//         color: "#7c3aed",
//         weight: 2,
//         fillOpacity: 0.4
//       },
//       onEachFeature: function(feature, layer) {
//         layer.bindPopup(`
//           <strong>${feature.properties.name}</strong><br>
//           City: ${feature.properties.city}<br>
//           ID: ${feature.properties.id}
//         `);
//       }
//     }).addTo(map);

//     map.fitBounds(polygonLayer.getBounds());
//   });


// 1. Local polygons - College, Hospital, Mula River
fetch("./pune_facilities.geojson")
  .then(res => {
    if (!res.ok) throw new Error("pune_facilities.geojson not found - keep it next to index.html");
    return res.json();
  })
  .then(data => {
    puneLayer.addData(data);
  })
  .catch(err => console.log("Local GeoJSON off:", err.message));

// 2. Load facilities from PostGIS API and render them (fallback to sample data)
fetch("http://localhost:3000/api/facilities")
  .then(res => {
    if (!res.ok) throw new Error("API not running - run node server.js");
    return res.json();
  })
  .then(geojson => {
    console.log("PostGIS API OK, features:", geojson.features ? geojson.features.length : 0);
    if (!geojson.features || geojson.features.length === 0) return;

    // Convert GeoJSON features into the same shape as sampleLocations
    const apiLocations = geojson.features.map(f => ({
      id: f.properties.id,
      name: f.properties.name,
      city: f.properties.city,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0]
    }));

    // Point the app at the API data instead of the hard-coded array
    replaceData(apiLocations);
  })
  .catch(err => {
    console.log("API off, using sample data:", err.message);
  });

// Swap the active dataset and rebuild markers, table and stats
function replaceData(locations) {
    // Clear old markers
    markerClusterGroup.clearLayers();
    markerById.clear();

    // Build markers from the new data
    locations.forEach(function (location) {
        const marker = createLocationMarker(location);
        markerById.set(location.id, marker);
        markerClusterGroup.addLayer(marker);
    });

    // Make search / filter / reset use the new data
    sampleLocations.length = 0;
    locations.forEach(loc => sampleLocations.push(loc));

    // Refresh table and dashboard
    renderTable(sampleLocations);
    updateStatistics(sampleLocations);

    // Fit map to the new points
    if (sampleLocations.length > 0) {
        map.fitBounds(
            sampleLocations.map(l => [l.lat, l.lng]),
            { padding: [35, 35], maxZoom: 7 }
        );
    }
}


//  FIT MAP TO LOCATIONS
// ============================================================

if (sampleLocations.length > 0) {

    const allCoordinates = sampleLocations.map(
        location => [location.lat, location.lng]
    );

    map.fitBounds(
        allCoordinates,
        {
            padding: [35, 35],
            maxZoom: 7
        }
    );

}


// UPDATE DASHBOARD STATISTICS
// ============================================================

function updateStatistics(records) {

    document.getElementById("totalCount").textContent =
        records.length;

    document.getElementById("mumbaiCount").textContent =
        records.filter(item => item.city === "Mumbai").length;

    document.getElementById("thaneCount").textContent =
        records.filter(item => item.city === "Thane").length;

    document.getElementById("puneCount").textContent =
        records.filter(item => item.city === "Pune").length;

    document.getElementById("nashikCount").textContent =
        records.filter(item => item.city === "Nashik").length;

    document.getElementById("nagpurCount").textContent =
        records.filter(item => item.city === "Nagpur").length;

   
}


//  ZOOM TO LOCATION
// ============================================================

function zoomToLocation(locationId) {

    const location = sampleLocations.find(
        item => item.id === Number(locationId)
    );

    const marker = markerById.get(Number(locationId));

    if (!location || !marker) {
        return;
    }

    markerClusterGroup.zoomToShowLayer(
        marker,
        function () {

            map.flyTo(
                [location.lat, location.lng],
                14,
                {
                    animate: true,
                    duration: 1.2
                }
            );

            marker.openPopup();

        }
    );

}


// RENDER LOCATIONS TABLE
// ============================================================

function renderTable(records) {

    const tableBody =
        document.getElementById("locationsTable");

    tableBody.innerHTML = "";

    document.getElementById("resultCount").textContent =
        `${records.length} result${records.length === 1 ? "" : "s"}`;


    // If no records found

    if (records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    No locations found.
                    Try another search or city.
                </td>
            </tr>
        `;

        return;
    }


    // Create table rows

    records.forEach(function (location) {

        const row = document.createElement("tr");


        // Name column

        const nameCell = document.createElement("td");

        nameCell.textContent = location.name;


        // City column

        const cityCell = document.createElement("td");

        cityCell.textContent = location.city;


        // Zoom column

        const zoomCell = document.createElement("td");

        const zoomButton = document.createElement("button");

        zoomButton.type = "button";

        zoomButton.className = "zoom-button";

        zoomButton.textContent = "Zoom";

        zoomButton.title = `Zoom to ${location.name}`;


        // Zoom button click event

        zoomButton.addEventListener(
            "click",
            function () {

                zoomToLocation(location.id);

            }
        );


        zoomCell.appendChild(zoomButton);


        // Add cells to row

        row.append(
            nameCell,
            cityCell,
            zoomCell
        );


        // Add row to table

        tableBody.appendChild(row);

    });

}


//  SEARCH AND CITY FILTER
// ============================================================

function filterLocations() {

    const searchTerm = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();


    const selectedCity =
        document.getElementById("City").value;


    // Filter records

    const filteredLocations = sampleLocations.filter(
        function (location) {

            const matchesSearch =
                location.name.toLowerCase().includes(searchTerm) ||
                location.city.toLowerCase().includes(searchTerm);


            const matchesCity =
                selectedCity === "All" ||
                location.city === selectedCity;


            return matchesSearch && matchesCity;

        }
    );


    // Clear previous markers

    markerClusterGroup.clearLayers();


    // Add filtered markers

    filteredLocations.forEach(function (location) {

        const marker = markerById.get(location.id);

        if (marker) {

            markerClusterGroup.addLayer(marker);

        }

    });


    // Update table

    renderTable(filteredLocations);


    // Update statistics

    updateStatistics(filteredLocations);


    // Zoom to filtered locations

    if (filteredLocations.length > 0) {

        const coordinates = filteredLocations.map(
            location => [location.lat, location.lng]
        );

        map.fitBounds(
            coordinates,
            {
                padding: [35, 35],
                maxZoom: 12
            }
        );

    }

}


//  SEARCH BUTTON
// ============================================================

document
    .getElementById("searchBtn")
    .addEventListener("click", filterLocations);


// Search using Enter key

document
    .getElementById("searchInput")
    .addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            filterLocations();

        }

    });


//  CITY FILTER
// ============================================================

document
    .getElementById("City")
    .addEventListener("change", filterLocations);


//  RESET BUTTON
// ============================================================

document
    .getElementById("resetBtn")
    .addEventListener("click", function () {


        // Clear search input

        document.getElementById("searchInput").value = "";


        // Reset city dropdown

        document.getElementById("City").value = "All";


        // Clear markers

        markerClusterGroup.clearLayers();


        // Restore all markers

        sampleLocations.forEach(function (location) {

            markerClusterGroup.addLayer(
                markerById.get(location.id)
            );

        });


        // Restore table

        renderTable(sampleLocations);


        // Restore dashboard

        updateStatistics(sampleLocations);


        // Reset map

        map.flyTo(
            initialMapCenter,
            initialZoom,
            {
                animate: true,
                duration: 1.0
            }
        );

    });


//  INITIAL TABLE AND DASHBOARD
// ============================================================

renderTable(sampleLocations);

updateStatistics(sampleLocations);


// ============================================================
// END OF MAHARASHTRA LOCATIONS WEB GIS
// ============================================================