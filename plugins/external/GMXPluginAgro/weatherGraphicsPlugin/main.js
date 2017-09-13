/*
=================================
WeatherGraphicsPlugin
=================================
*/
var weatherGraphicsManager;
var weatherFieldsCallbackHandler;

function init() {
    window.serverBase = "http://maps.kosmosnimki.ru/";

    weatherFieldsCallbackHandler.initialize();

    weatherFieldsCallbackHandler.onclickCallback = function () {
        weatherGraphicsManager.graphDialog.miniDialog.hide();
    };

    weatherFieldsCallbackHandler.oncontextmenuCallback = function (feature) {
        var year = parseInt(weatherGraphicsManager.graphDialog.miniDialog.getYear());
        var prod = document.getElementById("prodSel").value;
        weatherGraphicsManager.loadWeatherFeature(new WeatherFeature([feature]), prod, year);
        weatherGraphicsManager._dialog.show();
    };

    weatherFieldsCallbackHandler.oncloseCallback = function () {
        weatherGraphicsManager.graphDialog.miniDialog.hide();
    };

    weatherFieldsCallbackHandler.onoptionsmenuclickCallback = function (opt) {
        if (weatherGraphicsManager.graphDialog.miniDialog.visible) {
            weatherGraphicsManager.graphDialog.miniDialog.hide();
        } else {
            var rect = opt.getBoundingClientRect();
            weatherGraphicsManager.graphDialog.miniDialog.setPosition(rect.left, rect.top);
            weatherGraphicsManager.graphDialog.miniDialog.show();
        }
    }

    weatherFieldsCallbackHandler.ontitleCallback = function () {
        var year = weatherGraphicsManager.graphDialog.miniDialog.getYear();
        var prod = document.getElementById("prodSel").value;
        return (prod + " " + year);
    };

    weatherFieldsCallbackHandler.onoptionsmenuleaveCallback = function () {
        setTimeout(function () {
            if (!weatherGraphicsManager.graphDialog.miniDialog._hovered) {
                weatherGraphicsManager.graphDialog.miniDialog.hide();
            }
        }, 100);
    }

    nsGmx.leafletMap.on("mousedown", function () {
        weatherGraphicsManager.graphDialog.miniDialog.hide();
        weatherGraphicsManager.graphDialog.cloneMiniDialog.hide();
    });

    $(".ndvigraphics-control")[0].onmouseleave = function () {
        setTimeout(function () {
            if (!weatherGraphicsManager.graphDialog.cloneMiniDialog._hovered) {
                weatherGraphicsManager.graphDialog.cloneMiniDialog.hide();
            }
        }, 100);
    };

    $(".ndvigraphics-control").bind("click", function () {
        if (!weatherGraphicsManager.graphDialog.cloneMiniDialog._buttonHovered) {
            weatherGraphicsManager.graphDialog.cloneMiniDialog.hide();
        }
    });

    $(".gmx_balloon").bind("close", function () {
        weatherGraphicsManager.graphDialog.miniDialog.hide();
    });


    weatherFieldsCallbackHandler.onLaunchWeatherCallback = function (years, feature, prod) {

        var fidName = feature.attr.layer.getGmxProperties().identityField;
        var fid = feature.obj[fidName];
        var url = window.serverBase + "/VectorLayer/Search.ashx?WrapStyle=func" +
                  "&layer=" + feature.attr.layer.getGmxProperties().LayerID +
                  "&geometry=true&query=[" + fidName + "]=" + fid;

        sendCrossDomainJSONRequest(url, function (response) {

            var geom = response.Result.values[0][response.Result.values[0].length - 1];
            var minLon = 100000000000, maxLon = -10000000000,
                minLat = 100000000000, maxLat = -10000000000;
            if (geom.type == "POLYGON") {
                var c = geom.coordinates[0];
                for (var i = 0; i < c.length; i++) {
                    var ll = c[i];
                    if (ll[0] > maxLon) maxLon = ll[0];
                    if (ll[0] < minLon) minLon = ll[0];
                    if (ll[1] > maxLat) maxLat = ll[1];
                    if (ll[1] < minLat) minLat = ll[1];
                }
            } else {//multypolygon
                alert("multi");
            }

            var center = L.point(minLon + (maxLon - minLon) * 0.5, minLat + (maxLat - minLat) * 0.5);
            var centerLL = L.Projection.Mercator.unproject(center);

            years = [2016];
            prod = "PRECIP";
            feature.center = centerLL;

            weatherGraphicsManager.clearAll();
            weatherGraphicsManager.loadWeatherFeatures(years, feature, prod);
            weatherGraphicsManager.loadGridData([2016, 2015, 2014, 2013, 2012, 2011], feature);
        });
    }
};

(function () {

    var publicInterface = {
        pluginName: 'WeatherGraphicsPlugin',
        afterViewer: function (params) {

            $.when(gmxCore.loadScript("http://maps.kosmosnimki.ru/api/plugins/weatherGraphics/jquery.flot.time.js")).then(function () {

                weatherGraphicsManager = new WeatherGraphicsManager(params);
                weatherFieldsCallbackHandler = new WeatherFieldsCallbackHandler(params);

                var pluginsPath = gmxCore.getModulePath("WeatherGraphicsPlugin") + "../";
                gmxCore.loadModule("AgroLegendModule", pluginsPath + "agroLegend/agroLegendPlugin.js", function (agroModule) {
                    agroModule.initLegends();
                });

                gmxCore.loadModule("AgroLegendModule", pluginsPath + "agroLegend/agroLegendPlugin.js", function (agroModule) {
                    agroModule.initLegends();
                });

                init();
            });
        }
    };

    window.gmxCore && window.gmxCore.addModule('WeatherGraphicsPlugin', publicInterface, {
        init: function (module, path) {

            return $.when(
                gmxCore.loadScript(path + "jquery.flot.js"),
                //gmxCore.loadScript(path + "../themesModule/RequestsQueue.js"),
                //gmxCore.loadScript(path + "../themesModule/ThematicHandler.js"),
                //gmxCore.loadScript(path + "../themesModule/styleHookManager.js"),
                gmxCore.loadScript(path + "weatherFeature.js"),
                gmxCore.loadScript(path + "weatherFieldsCallbackHandler.js"),
                gmxCore.loadScript(path + "weatherGraphicsManager.js"),
                gmxCore.loadScript(path + "weatherGraphicsDialog.js"),
                gmxCore.loadScript(path + "miniDialog.js"),
                gmxCore.loadScript(path + "cloneMiniDialog.js"),
                gmxCore.loadScript(path + "colpick.js"),
                gmxCore.loadScript(path + "../themesModule/shared.js")
            );
        },
        css: ['style.css', 'colpick.css']
    });
})();