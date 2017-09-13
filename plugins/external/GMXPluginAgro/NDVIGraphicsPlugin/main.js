/*
=================================
NDVIGrphicsPlugin
=================================
*/
var ndviGraphicsManager;
var ndviFieldsCallbackHandler;

function init() {
    window.serverBase = "http://maps.kosmosnimki.ru/";
    ndviFieldsCallbackHandler.initialize();

    ndviFieldsCallbackHandler.onclickCallback = function () {
        ndviGraphicsManager.graphDialog.miniDialog.hide();
    };

    ndviFieldsCallbackHandler.oncontextmenuCallback = function (feature) {
        var year = parseInt(ndviGraphicsManager.graphDialog.miniDialog.getYear());
        var prod = document.getElementById("prodSel").value;
        ndviGraphicsManager.loadNDVIFeature(new NDVIFeature([feature]), prod, year);
        ndviGraphicsManager._dialog.show();
    };

    ndviFieldsCallbackHandler.oncloseCallback = function () {
        ndviGraphicsManager.graphDialog.miniDialog.hide();
    };

    ndviFieldsCallbackHandler.onoptionsmenuclickCallback = function (opt) {
        if (ndviGraphicsManager.graphDialog.miniDialog.visible) {
            ndviGraphicsManager.graphDialog.miniDialog.hide();
        } else {
            var rect = opt.getBoundingClientRect();
            ndviGraphicsManager.graphDialog.miniDialog.setPosition(rect.left, rect.top);
            ndviGraphicsManager.graphDialog.miniDialog.show();
        }
    }

    ndviFieldsCallbackHandler.ontitleCallback = function () {
        var year = ndviGraphicsManager.graphDialog.miniDialog.getYear();
        var prod = document.getElementById("prodSel").value;
        return (prod + " " + year);
    };

    ndviFieldsCallbackHandler.onoptionsmenuleaveCallback = function () {
        setTimeout(function () {
            if (!ndviGraphicsManager.graphDialog.miniDialog._hovered) {
                ndviGraphicsManager.graphDialog.miniDialog.hide();
            }
        }, 100);
    }

    nsGmx.leafletMap.on("mousedown", function () {
        ndviGraphicsManager.graphDialog.miniDialog.hide();
        ndviGraphicsManager.graphDialog.cloneMiniDialog.hide();
    });

    $(".ndvigraphics-control")[0].onmouseleave = function () {
        setTimeout(function () {
            if (!ndviGraphicsManager.graphDialog.cloneMiniDialog._hovered) {
                ndviGraphicsManager.graphDialog.cloneMiniDialog.hide();
            }
        }, 100);
    };

    $(".ndvigraphics-control").bind("click", function () {
        if (!ndviGraphicsManager.graphDialog.cloneMiniDialog._buttonHovered) {
            ndviGraphicsManager.graphDialog.cloneMiniDialog.hide();
        }
    });

    $(".gmx_balloon").bind("close", function () {
        ndviGraphicsManager.graphDialog.miniDialog.hide();
    });
};

(function () {

    var users = [
        'Ins_NPSK',
        'Agro_Krasnodar',
        'Agro_Rostov',
        'Agro_RSHB',
        'demo_user',
        'Agro_Tatarstan',
        'Agro_Omsk',
        'Agro_Niva',
        'ins_rshb',
        'agro_novomos',
        'agro_mordovia',
        'mordovia1514',
        'agro_sunprod',
        'agro_nat'
    ];


    function isUser(login) {
        if (login)
            return users.indexOf(login.toLowerCase()) != -1;
        return true;
    };

    var publicInterface = {
        pluginName: 'NDVIGraphicsPlugin',
        afterViewer: function (params) {

            $.when(gmxCore.loadScript("http://maps.kosmosnimki.ru/api/plugins/ndviGraphics/jquery.flot.time.js")).then(function () {


                NDVIGraphicsManager._userRole = isUser(nsGmx.AuthManager.getLogin());

                params.layers.LANDSAT8.years = [2013, 2014, 2015, 2016];
                params.layers.MODIS.years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
                params.layers.NDVI_01.years = [2013, 2014, 2015, 2016];
                params.layers.NDVI_08.years = [2013, 2014, 2015, 2016];
                params.layers.NDVI_16.years = [2013, 2014, 2015, 2016];

                ndviGraphicsManager = new NDVIGraphicsManager(params);
                ndviFieldsCallbackHandler = new NDVIFieldsCallbackHandler(params);

                var pluginsPath = gmxCore.getModulePath("NDVIGraphicsPlugin") + "../";
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

    window.gmxCore && window.gmxCore.addModule('NDVIGraphicsPlugin', publicInterface, {
        init: function (module, path) {

            return $.when(
                gmxCore.loadScript(path + "jquery.flot.js"),
                gmxCore.loadScript(path + "../themesModule/RequestsQueue.js"),
                gmxCore.loadScript(path + "../themesModule/ThematicHandler.js"),
                gmxCore.loadScript(path + "../themesModule/styleHookManager.js"),
                gmxCore.loadScript(path + "ndviFeature.js"),
                gmxCore.loadScript(path + "ndviFieldsCallbackHandler.js"),
                gmxCore.loadScript(path + "ndviGraphicsManager.js"),
                gmxCore.loadScript(path + "miniDialog.js"),
                gmxCore.loadScript(path + "cloneMiniDialog.js"),
                gmxCore.loadScript(path + "ndviGraphicsDialog.js"),
                gmxCore.loadScript(path + "colpick.js"),
                gmxCore.loadScript(path + "../themesModule/shared.js")
            );
        },
        css: ['style.css', 'colpick.css']
    });
})();