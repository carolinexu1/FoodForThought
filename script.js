/*https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=Cheddar%20Cheese*/

//Code atrributed to Mapbox tutorial demos 
mapboxgl.accessToken = 'pk.eyJ1IjoiYWlyY28xIiwiYSI6ImNsZXVmYm9taTBwcmszeHBoM2RzZmRhYXAifQ.Yca0w5GxkfQFnnD71t2iTg';
const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-77.0369, 38.9072],
  zoom: 9
});

// Create a default Marker
const marker1 = new mapboxgl.Marker()
  .setLngLat([-77.014702, 38.927231])
  .addTo(map);

const marker2 = new mapboxgl.Marker()
  .setLngLat([-74, 41])
  .addTo(map);

const marker3 = new mapboxgl.Marker()
  .setLngLat([-118, 34])
  .addTo(map);

const marker4 = new mapboxgl.Marker()
  .setLngLat([-89, 42])
  .addTo(map);

const marker5 = new mapboxgl.Marker()
  .setLngLat([-97, 33])
  .addTo(map);

var globlong = 0;
var globlat = 0;

// attempt at popup on map
function makepopup() {
  const monument = [globlong, globlat]
  console.log(monument)
  const popup = new mapboxgl.Popup({ offset: 25 }).setText(
    'This is a test text!'
  );

  const el = document.createElement('div');
  el.id = 'marker';

  new mapboxgl.Marker(el)
    .setLngLat(monument)
    .setPopup(popup) // sets a popup on this marker
    .addTo(map);

  console.log(monument)
}


const coordinatesGeocoder = function(query) {
  // Match anything which looks like
  // decimal degrees coordinate pair.
  const matches = query.match(
    /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
  );
  if (!matches) {
    return null;
  }

  function coordinateFeature(lng, lat) {
    return {
      center: [lng, lat],
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      place_name: 'Lat: ' + lat + ' Lng: ' + lng,
      place_type: ['coordinate'],
      properties: {},
      text: 'Hello',
      type: 'Feature'
    };
  }

  const coord1 = Number(matches[1]); //longitude
  const coord2 = Number(matches[2]); //latitude 
  const geocodes = [];

  console.log("This is coord1")
  console.log(coord1)
  console.log("This is coord2")
  console.log(coord2)

  if (coord1 < -90 || coord1 > 90) {
    // must be lng, lat
    geocodes.push(coordinateFeature(coord1, coord2));
  }

  if (coord2 < -90 || coord2 > 90) {
    // must be lat, lng
    geocodes.push(coordinateFeature(coord2, coord1));
  }

  if (geocodes.length === 0) {
    // else could be either lng, lat or lat, lng
    geocodes.push(coordinateFeature(coord1, coord2));
    geocodes.push(coordinateFeature(coord2, coord1));
  }

  globlong = coord1;
  globlat = coord2;

  console.log(coord1, coord2)
  return geocodes;
};

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    localGeocoder: coordinatesGeocoder,
    zoom: 9,
    placeholder: 'Try: -40, 170',
    mapboxgl: mapboxgl,
    reverseGeocode: true
  })
);

const distanceContainer = document.getElementById('distance');
// GeoJSON object to hold our measurement features
const geojson = {
  'type': 'FeatureCollection',
  'features': []
};

// Used to draw a line between points
const linestring = {
  'type': 'Feature',
  'geometry': {
    'type': 'LineString',
    'coordinates': []
  }
};

map.on('load', () => {
  map.addSource('geojson', {
    'type': 'geojson',
    'data': geojson
  });

  // Add styles to the map
  map.addLayer({
    id: 'measure-points',
    type: 'circle',
    source: 'geojson',
    paint: {
      'circle-radius': 5,
      'circle-color': '#000'
    },
    filter: ['in', '$type', 'Point']
  });
  map.addLayer({
    id: 'measure-lines',
    type: 'line',
    source: 'geojson',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#000',
      'line-width': 2.5
    },
    filter: ['in', '$type', 'LineString']
  });

  map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['measure-points']
    });

    // Remove the linestring from the group
    // so we can redraw it based on the points collection.
    if (geojson.features.length > 1) geojson.features.pop();

    // Clear the distance container to populate it with a new value.
    distanceContainer.innerHTML = '';

    // If a feature was clicked, remove it from the map.
    if (features.length) {
      const id = features[0].properties.id;
      geojson.features = geojson.features.filter(
        (point) => point.properties.id !== id
      );
    } else {
      const point = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [e.lngLat.lng, e.lngLat.lat]
        },
        'properties': {
          'id': String(new Date().getTime())
        }
      };

      geojson.features.push(point);
    }

    if (geojson.features.length > 1) {
      linestring.geometry.coordinates = geojson.features.map(
        (point) => point.geometry.coordinates
      );

      geojson.features.push(linestring);

      // Populate the distanceContainer with total distance
      const value = document.createElement('pre');
      const distance = turf.length(linestring);
      value.textContent = `Total distance: ${distance.toLocaleString()}km`;
      distanceContainer.appendChild(value);
    }

    map.getSource('geojson').setData(geojson);
  });
});

map.on('mousemove', (e) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['measure-points']
  });
  // Change the cursor to a pointer when hovering over a point on the map.
  // Otherwise cursor is a crosshair.
  map.getCanvas().style.cursor = features.length
    ? 'pointer'
    : 'crosshair';
});