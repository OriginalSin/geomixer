
var CosmosagroStatic = function () {

};

CosmosagroStatic.prototype.main = function () {
    var that = this;

    this.initBaseLayers_first();


    if (/*gmxAPI.map.properties.MapID*/nsGmx.gmxMap.properties.name == "V4G8N") {
        //специально для demoagro
        //gmxAPI.map.loadMap("http://maps.kosmosnimki.ru/", "920D2D4FD93342B58B9C0D3F302EEE54", function (h) {
        var p = L.gmx.loadMap("920D2D4FD93342B58B9C0D3F302EEE54");

        p.then(function (h) {
            //var currId = globalFlashMap.baseLayersManager.getCurrentID();
            var currId = nsGmx.leafletMap.gmxBaseLayersManager.getCurrentID();
            //var blm = globalFlashMap.baseLayersManager;
            var blm = nsGmx.leafletMap.gmxBaseLayersManager;
            //var l = gmxAPI.map.layers["0BD2F4663F1C4D75BA9F43924E4F453E"];
            var l = h.layersByID["0BD2F4663F1C4D75BA9F43924E4F453E"];
            l.setZIndex(100000);
            var s = blm.get("satellite");
            s.addLayer(l);
            var h = blm.get("hybrid");
            h.addLayer(l);
            //globalFlashMap.baseLayersManager.setCurrentID(currId);
            nsGmx.leafletMap.gmxBaseLayersManager.setCurrentID(currId);
        });

    } else {
        var p = L.gmx.loadMap("PLDYO");
        p.then(function (h) {
            //var currId = globalFlashMap.baseLayersManager.getCurrentID();
            setTimeout(function () {
                var currId = nsGmx.leafletMap.gmxBaseLayersManager.getCurrentID();
                that.initBaseLayersCosmosagro(h);
                //globalFlashMap.baseLayersManager.setCurrentID(currId);
                nsGmx.leafletMap.gmxBaseLayersManager.setCurrentID(currId);
                nsGmx.leafletMap.removeLayer(that.oldSatLayer);
            }, 500);
        });
    }
};

CosmosagroStatic.oldSatName = "C9458F2DCB754CEEACC54216C7D1EB0A";

CosmosagroStatic.prototype.initBaseLayersCosmosagro = function (h) {

    //var blm = globalFlashMap.baseLayersManager;
    var blm = nsGmx.leafletMap.gmxBaseLayersManager;

    //специально для всех cosmosagro
    var iconPrefix = 'http://maps.kosmosnimki.ru/api/img/baseLayers/';

    var newSatID = '63E083C0916F4414A2F6B78242F56CA6';

    //перепрописываем подложку снимки
    var sl = blm.get('satellite').getLayers();
    for (var i = 0; i < sl.length; i++) {
        nsGmx.leafletMap.removeLayer(sl[i]);
    }
    blm.remove('satellite');
    blm.add('satellite', { rus: 'Снимки', eng: 'Satellite', icon: iconPrefix + 'basemap_satellite.png', layers: [h.layersByID[newSatID]/*gmxAPI.map.layers[newSatID]*/] });

    //переделываем гибрид
    var hyb = blm.get('hybrid');
    var ll = hyb.getLayers();
    var sl;
    for (var i = 0; i < ll.length; i++) {
        if (ll[i].getGmxProperties().name == CosmosagroStatic.oldSatName) {
            sl = ll[i];
            break;
        }
    }
    if (sl) {
        nsGmx.leafletMap.removeLayer(sl);
        hyb.removeLayer(sl);
        hyb.addLayer(h.layersByID[newSatID]);
    } else {
        alert("Идентификатор слоя гибридной подложки был изменен!");
    }

    this.oldSatLayer = sl;
};


CosmosagroStatic.prototype.initBaseLayers_first = function () {

    function remove(arr, item) {
        for (var i = arr.length; i--;) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }

    var adapter = function (func) {
        return function (i, j, z) {
            var size = Math.pow(2, z - 1);
            return func(i + size, size - j - 1, z);
        }
    }

    var letter = function (x, y) {
        return ["a", "b", "c", "d"][((x + y) % 4 + 4) % 4];
    }

    var iconPrefix = 'http://maps.kosmosnimki.ru/api/img/baseLayers/';


    var blm = nsGmx.leafletMap.gmxBaseLayersManager;

    var a = blm.getActiveIDs();

    if (a.indexOf("Уклоны") != -1 || a.indexOf("slope") != -1) {
        //return;
    } else {

        blm.add("slope");

        var arr = blm.getActiveIDs();
        arr.push('slope');
        blm.setActiveIDs(arr);

        //blm.remove('agroSlope');
        //blm.remove('Уклоны');

        //var arr = blm.getActiveIDs();
        //remove(arr, "Уклоны");
        //remove(arr, "agroSlope");
        //blm.setActiveIDs(arr);


        //var slopeLayer = L.tileLayer.Mercator('http://{s}.tile.cart.kosmosnimki.ru/ds/{z}/{x}/{y}.png',
        //    {
        //        minZoom: 9,
        //        maxZoom: 13
        //    });

        //blm.add('agroSlope', {
        //    rus: 'Уклоны',
        //    eng: 'Slope',
        //    icon: iconPrefix + 'basemap_relief_slope.png',
        //    minZoom: 9,
        //    maxZoom: 13,
        //    description: '<img src = "' + iconPrefix + 'basemap_relief_slope_legend.svg"></img>',
        //    layers: [slopeLayer]
        //});

        //var arr = blm.getActiveIDs();
        //arr.push('agroSlope');
        //blm.setActiveIDs(arr);
    }

    var a = blm.getActiveIDs();

    if (a.indexOf("Экспозиция") != -1 || a.indexOf("aspect") != -1) {
        //return;
    } else {

        blm.add("aspect");

        var arr = blm.getActiveIDs();
        arr.push('aspect');
        blm.setActiveIDs(arr);

        //blm.remove('agroAspect');
        //blm.remove('Экспозиция');

        //var arr = blm.getActiveIDs();
        //remove(arr, "Экспозиция");
        //remove(arr, "agroAspect");
        //blm.setActiveIDs(arr);

        //var aspectLayer = L.tileLayer.Mercator('http://{s}.tile.cart.kosmosnimki.ru/da/{z}/{x}/{y}.png',
        //{
        //    minZoom: 9,
        //    maxZoom: 13
        //});

        //blm.add('agroAspect', {
        //    rus: 'Экспозиция',
        //    eng: 'Aspect',
        //    icon: iconPrefix + 'basemap_aspect.png',
        //    minZoom: 9,
        //    maxZoom: 13,
        //    description: '<img src = "' + iconPrefix + 'basemap_aspect_legend.svg"></img>',
        //    layers: [aspectLayer]
        //});

        //var arr = blm.getActiveIDs();
        //arr.push('agroAspect');
        //blm.setActiveIDs(arr);
    }
};


var cosmosagroStatic = null;

(function () {

    var publicInterface = {
        pluginName: 'CosmosagroStaticPlugin',
        afterViewer: function (params) {
            //выключим подложки
            cosmosagroStatic = new CosmosagroStatic();
            cosmosagroStatic.main();
        }
    };

    window.gmxCore && window.gmxCore.addModule('CosmosagroStaticPlugin', publicInterface, {
        init: function (module, path) {
        }
    });
})();