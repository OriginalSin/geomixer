var ReliefLayer = function () {
    this.newLayer;
    this.oldLayer;
    this.loading = false;
};

ReliefLayer.prototype.addLayer = function (layer) {
    var blm = nsGmx.leafletMap.gmxBaseLayersManager;
    var r = blm.get("agroRelief");
    nsGmx.leafletMap.addLayer(layer);
    r && r.addLayer(layer);
};

ReliefLayer.prototype.getLayers = function () {
    var blm = nsGmx.leafletMap.gmxBaseLayersManager;
    var r = blm.get("agroRelief");
    return r && r.getLayers();
};

ReliefLayer.prototype.removeLayer = function (layer) {
    if (layer) {
        var blm = nsGmx.leafletMap.gmxBaseLayersManager;
        var r = blm.get("agroRelief");
        nsGmx.leafletMap.removeLayer(layer);
        return r && r.removeLayer(layer);
    }
};

ReliefLayer.prototype.removeLayers = function () {
    var l = this.getLayers();
    for (var i = 0; i < l.length; i++) {
        this.removeLayer(l[i]);
    }
};

ReliefLayer.prototype.main = function () {
    var blm = nsGmx.leafletMap.gmxBaseLayersManager;

    function remove(arr, item) {
        for (var i = arr.length; i--;) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }

    var arr = blm.getActiveIDs();
    remove(arr, "agroRelief");
    blm.setActiveIDs(arr);

    this.staticLayerPtr = new L.ImageOverlay.Pane("", nsGmx.leafletMap.getBounds());

    blm.add('agroRelief', {
        rus: 'Рельеф',
        eng: 'agroRelief',
        icon: 'http://maps.kosmosnimki.ru/api/plugins/reliefLayer/basemap_relief_relief.png',
        minZoom: 1,
        maxZoom: 22,
        description: "",
        layers: [this.staticLayerPtr]
    });

    var arr = blm.getActiveIDs();
    arr.push('agroRelief');
    blm.setActiveIDs(arr);


    var that = this;
    nsGmx.leafletMap.on("moveend", function () {
        that.active && that.refresh();
    });

    that.active = false;

    blm.on("baselayerchange", function (e) {
        if (e.baseLayer && e.baseLayer.id == "agroRelief") {
            that.active = true;
            that.refresh();
        } else {

            that.removeLayers();

            if (that.active) {
                that.setDescription("");
            }
            that.active = false;
        }
    });

    var blm = nsGmx.leafletMap.gmxBaseLayersManager;
    _mapHelper.customParamsManager.addProvider({
        name: "AgroReliefLayerProvider",
        saveState: function () {
            return { "reliefBaseLayerActive": blm.getCurrentID() == "agroRelief" }
        },
        loadState: function (data) {
            if (data.reliefBaseLayerActive) {
                blm.setCurrentID("agroRelief");
            }
        }
    });
};

ReliefLayer.createDescription = function (min, max) {

    var d = max - min;

    var pal = [{ "k": Math.round(min), "c": "#400080" },
        { "k": Math.round(min + d * 0.1), "c": "#0000FF" },
        { "k": Math.round(min + d * 0.2), "c": "#00FFFF" },
        { "k": Math.round(min + d * 0.3), "c": "#00FF00" },
        { "k": Math.round(min + d * 0.5), "c": "#FFFF00" },
        { "k": Math.round(min + d * 0.75), "c": "#FF8000" },
        { "k": Math.round(max), "c": "#FF0000" }];

    var colorDiv = "",
        labelDiv = "";

    for (var i = 0; i < pal.length; i++) {
        var pi = pal[i];

        colorDiv += '<div class="ntReliefColor" style="background-color:' + pi.c + '"></div>';
        labelDiv += '<div class="ntReliefLabel">' + pi.k + '</div>';
    }

    return '<div id="ntReliefDescriptionMain"><div id="ntReliefDescription">Шкала высот рельефа в метрах</div><div>' + colorDiv + '</div><div>' + labelDiv + '</div></div>';

};

ReliefLayer.prototype.setDescription = function (descr) {
    var blm = nsGmx.leafletMap.gmxBaseLayersManager;
    blm.get('agroRelief').options.description = descr;
    if (nsGmx.leafletMap.gmxControlsManager.get('iconLayers')) {
        nsGmx.leafletMap.gmxControlsManager.get('iconLayers')._updateLayers();
        $(".popover.fade.top.in").length && $(".popover.fade.top.in").remove();
    }
};

ReliefLayer.prototype.refresh = function () {

    if (this.loading) {
        this.removeLayers();
    }

    var b = nsGmx.leafletMap.getBounds();

    var sw = L.Projection.Mercator.project(b.getSouthWest());
    var ne = L.Projection.Mercator.project(b.getNorthEast());

    var size = nsGmx.leafletMap.getSize();

    var url = "http://maps.kosmosnimki.ru/TileService.ashx?map=V9WE7&request=GetMap&Service=WMS&layers=4800519514E141FCB700166CB4FDC802&VERSION=1.3.0&CRS=EPSG%3A3395&styles=&width=" +
        size.x + "&height=" + size.y + "&bbox=" + sw.x + "," + sw.y + "," + ne.x + "," + ne.y + "&format=image%2Fjpg&transparent=TRUE&apikey=HQF5P8KENT";

    this.oldLayer = this.getLayers()[0];

    this.newLayer = new L.ImageOverlay.Pane(url, b).setZIndex(-5);

    var that = this;
    this.newLayer.on('load', function () {
        that.loading = false;
        that.removeLayer(that.oldLayer);
    });

    this.addLayer(this.newLayer);
    this.loading = true;

    var urlStat = "http://maps.kosmosnimki.ru/TileService.ashx?map=V9WE7&request=GetStat&Service=WMS&layers=4800519514E141FCB700166CB4FDC802&VERSION=1.3.0&CRS=EPSG%3A3395&styles=&width=" +
        size.x + "&height=" + size.y + "&bbox=" + sw.x + "," + sw.y + "," + ne.x + "," + ne.y + "&format=image%2Fjpg&transparent=TRUE&apikey=HQF5P8KENT";

    var pr = L.gmxUtil.requestJSONP(urlStat).then(
        function (response) {
            var min = response.Result.AutoStretchToMinMax[0].Min,
                max = response.Result.AutoStretchToMinMax[0].Max;
            var d = ReliefLayer.createDescription(min, max);
            that.setDescription(d);
        });
};

var reliefLayer = null;

(function () {

    var publicInterface = {
        pluginName: 'ReliefLayerPlugin',
        afterViewer: function (params) {
            reliefLayer = new ReliefLayer();
            reliefLayer.main();
        }
    };

    window.gmxCore && window.gmxCore.addModule('ReliefLayerPlugin', publicInterface, {
        init: function (module, path) {
            return $.when(
                gmxCore.loadScriptWithCheck([
                    { script: 'http://maps.kosmosnimki.ru/api/leaflet/plugins/L.ImageOverlay.Pane/src/L.ImageOverlay.Pane.js', check: function () { return L.ImageOverlay.Pane; } }
                ])
            );
        },
        css: ['style.css']
    });
})();