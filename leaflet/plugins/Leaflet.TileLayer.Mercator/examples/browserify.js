var L = require('leaflet');
var tileLayerMercator = require('../')

window.addEventListener('load', function(e) {
    var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    });

    var map = L.map(document.body, {
        layers: [osm],
        center: new L.LatLng(60.025308, 29.657592),
        zoom: 9
    });

    var rumap = tileLayerMercator('http://{s}.tile.cart.kosmosnimki.ru/m/{z}/{x}/{y}.png', {
        maxZoom: 19,
        maxNativeZoom: 17,
        attribution: 'Scanex'
    });

    var LayersControl = L.control.layers({
        osm: osm,
        rumap: rumap
    }, {}, {
        collapsed: false
    }).addTo(map);
});