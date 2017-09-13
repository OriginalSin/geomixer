
var ExperimentalPalette = function () {
    this._layersHookList = {};
    this._palettes = [];
};


ExperimentalPalette.prototype.initialize = function () {
    this.initializeLayersImageProcessing();

    //инициализация слоев из внешних карт
    var that = this;
    $(window._queryExternalMaps).bind('map_loaded', function (e) {
        that.initializeLayersImageProcessing();
    });

};

ExperimentalPalette.prototype.initializeLayersImageProcessing = function () {
    var layers = this.getNDVILayers();
    for (var i = 0; i < layers.length; i++) {
        this.setLayerImageProcessing(layers[i]);
    }
};

ExperimentalPalette.prototype.getNDVILayers = function () {
    var fieldLayers = [];
    var that = this;
    $.each(gmxAPI.map.layers, function (i, v) {
        if (!that._layersHookList[v.properties.name]) {
            if (!($.isEmptyObject(v.properties.MetaProperties)))
                if (!($.isEmptyObject(v.properties.MetaProperties.product)))
                    if ($.trim(v.properties.MetaProperties.product.Value) == "ndvi") {
                        that._layersHookList[v.properties.name] = gmxAPI.map.layers[v.properties.name];
                        fieldLayers.push(v);
                    }
        }
    });
    return fieldLayers;
};

ExperimentalPalette.prototype.setLayerImageProcessing = function (layer) {
    var that = this;
    layer.addImageProcessingHook(
        function (canvasObj, attr) {
            that._tileImageProcessing(canvasObj, attr);
        });
};

ExperimentalPalette.prototype._tileImageProcessing = function (canvasObj, attr) {
    this._applyPalette(attr, canvasObj, "http://127.0.0.1/api/plugins/experimentalPalette/palette/NDVI_interp_legend.icxleg.xml", attr.callback);
};

ExperimentalPalette.prototype._applyPalette = function (attr, canvasObj, url, callback) {
    var that = this;
    if (url) {
        this._palettes[url] = this._palettes[url] || shared.loadPaletteSync(url);
        this._palettes[url].then(function (palette) {

            var canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 256;

            shared.zoomTile(canvasObj/*attr.from.img*/, attr.tpx/*attr.from.x*/, attr.tpy/*attr.from.y*/, gmxAPI.map.getZ()/*attr.from.z*/,
               attr.tpx, attr.tpy, gmxAPI.map.getZ(),
               canvas,
               function (r, g, b, a) {
                   var pal = palette[r];
                   if (pal) {
                       return [pal.partRed, pal.partGreen, pal.partBlue, 255];
                   } else {
                       if (r == 0 && g == 0 && b == 0) {
                           return ([0, 179, 255, 255]);
                       }
                       if (r < 101) {
                           return [0, 0, 0, 255];
                       }
                       if (r > 201) {
                           return [255, 255, 255, 255];
                       }
                   }
               }, shared.NEAREST);

            setTimeout(function () { callback(canvas); }, 0);
        });
    }
};

var experimentalPalette = null;

(function () {

    var publicInterface = {
        pluginName: 'ExperimentalPalettePlugin',
        afterViewer: function (params) {
            experimentalPalette = new ExperimentalPalette();
            experimentalPalette.initialize();
        }
    };

    window.gmxCore && window.gmxCore.addModule('ExperimentalPalettePlugin', publicInterface, {
        init: function (module, path) {
            return $.when(
                gmxCore.loadScript(path + "../themesModule/shared.js")
            );
        }
    });
})();