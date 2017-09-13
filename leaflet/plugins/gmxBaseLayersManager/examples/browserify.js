var L = require('leaflet');
var BaseLayersManager = require('../');

window.addEventListener('load', function() {
    var map = new L.Map(document.body, {
        layers: [],
        center: new L.LatLng(50, 20),
        zoom: 3
    });

    var baseLayersManager = new BaseLayersManager(map);

    baseLayersManager.initDefaults().then(function() {
        var baseLayers = ['map', 'hybrid', 'satellite', 'OSM', 'relief', 'outline', 'grey', '2GIS', 'osm_spring', 'osm_summer', 'osm_autumn', 'osm_winter', 'osm_night', 'OSMHybrid'],
            currentID = baseLayers[0];
        baseLayersManager.setActiveIDs(baseLayers).setCurrentID(currentID);
        var i = 0;
        setInterval(function() {
            if (i === baseLayers.length - 1) {
                i = 0;
            } else {
                i++;
            }
            baseLayersManager.setCurrentID(baseLayers[i]);
        }, 5000);
    });
});