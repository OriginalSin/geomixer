
(function () {

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    };

    function showPosition(position) {
        var z = nsGmx.leafletMap.getZoom()
        var lon = parseFloat(position.coords.longitude);
        var lat = parseFloat(position.coords.latitude);
        //gmxAPI.map.moveTo(lon, lat, z);
        nsGmx.leafletMap.setView(new L.latLng(lat, lon), z)
    };

    function isTablet() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    };

    function setProductFieldsVisible() {
        var that = this;
        var layers = nsGmx.gmxMap.layersByID;
        $.each(layers, function (i, v) {
            if (!($.isEmptyObject(v.properties.MetaProperties)))
                if (!($.isEmptyObject(v.properties.MetaProperties.product)))
                    if ($.trim(v.properties.MetaProperties.product.Value) == "fields")
                        nsGmx.leafletMap.addLayer(nsGmx.gmxMap.layersByID[v.properties.name]);
        });
    };

    function removeControls(list) {
        for (var i = 0; i < list.length; i++) {
            var c = nsGmx.leafletMap.gmxControlIconManager.get(list[i]);
            if (c) {
                try {
                    nsGmx.leafletMap.removeControl(c);
                } catch (e) {
                    //...
                }
            }
        }
        $(".gmx-slider-control.leaflet-control").css("display", "none");
    };

    function initControls() {
        var btnGlc = L.control.gmxIcon({
            'id': "geolocation-button",
            'togglable': false,
            'title': "Мое местоположение"
        });

        btnGlc.on('click', function (e) {
            getLocation();
        });

        btnGlc.addTo(nsGmx.leafletMap);
    };

    function main() {
        var t = isTablet();

        var u = nsGmx.AuthManager.getLogin() == "agro_kuban";

        if (t && u) {
            //сворачиваем левую панель
            $('#leftCollapser').click();
            setProductFieldsVisible();

            removeControls(['drawing', 'bookmark', 'createLayer', 'createRasterLayer', 'createVectorLayer', 'drawing', 'editTool', 'gmxprint', 'gridTool', 'saveMap', 'uploadFile']);

            initControls();

            //getLocation();
        }
    };

    var publicInterface = {
        pluginName: 'AgroKubanPlugin',
        afterViewer: function (params) {
            main();
        }
    };

    window.gmxCore && window.gmxCore.addModule('AgroKubanPlugin', publicInterface, {
        init: function (module, path) {
        },
        css: ['agroKuban.css']
    });
})();