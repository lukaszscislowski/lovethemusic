'use strict'

const position = [20.99995, 52.23277]; 
const token ='pk.eyJ1IjoibHVrYXNzY2lzbG93c2tpIiwiYSI6ImNrZXNqdnByZjI3dXYzMm84ZXhvMnUwbGMifQ._r0pVN6tU8tETyE60m0GAg'; //twój własny token
const styleUrl = 'mapbox://styles/mapbox/dark-v10';

function map() {
    if (!mapboxgl.supported()) {
        alert('Your browser does not support Mapbox GL');
    } else {
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
        container: 'map',
        style: styleUrl,
        zoom:13.7,
        center: position
    });
}
}



map.on("load", function () {
    map.loadImage("images/marker.png", function(error, image) {
        if (error) throw error;
        map.addImage("custom-marker", image);
        map.addLayer({
          id: "markers",
          type: "symbol",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features:[{"type":"Feature","geometry":{"type":"Point","coordinates":position}}]}
          },
          layout: {
            "icon-image": "custom-marker",
          }
        });
      });
  });

export { map }