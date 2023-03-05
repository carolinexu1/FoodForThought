/*https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=Cheddar%20Cheese*/

mapboxgl.accessToken = 'pk.eyJ1IjoiYWlyY28xIiwiYSI6ImNsZXVmYm9taTBwcmszeHBoM2RzZmRhYXAifQ.Yca0w5GxkfQFnnD71t2iTg';
const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-77.0369, 38.9072],
  zoom: 9
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
  .setLngLat([-77.014702, 38.927231])
  .addTo(map);

// Create a default Marker
const marker2 = new mapboxgl.Marker()
  .setLngLat([-77.127690, 38.888660])
  .addTo(map);

var globlong = 0;
var globlat = 0;

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


//var tempcoords = [];

/* Given a query in the form "lng, lat" or "lat, lng"
* returns the matching geographic coordinate(s)
* as search results in carmen geojson format,
* https://github.com/mapbox/carmen/blob/master/carmen-geojson.md */
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

  // var tempcords = geocodes
  // var tempr = (tempcords[0].place_name).split(" ")
  // var lat = tempr[1]
  // var long = tempr[3]
  // console.log(tempcords)
  //console.log("This is lat " + lat + " This is long " + long)

  // Add the control to the map
  //console.log("Before makepopup")
  //makepopup();
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