var LayersTool = function (caption, layersArr) {
    var layersArr = layersArr || [];

    //var attr = {
    //    id: "timelineLayersTools",
    //    rus: caption,
    //    eng: caption,
    //    overlay: true,
    //    onClick: function (e) {
    //        for (var i = 0; i < layersArr.length; i++) {
    //            gmxAPI.map.layers[layersArr[i]].setVisible(true);
    //        }
    //    },
    //    onCancel: function (e) {
    //        for (var i = 0; i < layersArr.length; i++) {
    //            gmxAPI.map.layers[layersArr[i]].setVisible(false);
    //        }
    //    },
    //    onmouseover: function () { this.style.color = "orange"; },
    //    onmouseout: function () { this.style.color = "wheat"; },
    //    hint: caption
    //};

    var lmap = nsGmx.leafletMap;
    var gmxLayers = lmap.gmxControlsManager.get('layers');
    var layerGroup = new L.layerGroup();

    for (var i = 0; i < layersArr.length; i++) {
        layerGroup.addLayer(layersArr[i]);
    }

    gmxLayers.addOverlay(layerGroup, caption);
    //lmap.gmxControlsManager.controlsManager.get('layers').addOverlay(weatherLayer, _gtxt('WeatherPlugin.WeatherButton'))
    //L.Control.Layers
    //lmap
    //    .on('layeradd', function (ev) {
    //        if (ev.layer === layerGroup) {
    //        }
    //    })
    //    .on('layerremove', function (ev) {
    //        if (ev.layer === layerGroup) {
    //        }
    //    });

    //this._tools = new gmxAPI._ToolsContainer('timelineLayersTools');
    //this._layersTool = this._tools.addTool('timelineLayersTools', attr);
};