/*
=================================
NDVITimelinePlugin
=================================
*/
var ndviTimelineManager;

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
    'agro_sunprod',
    'agro_kuban',
    'kuban2047',
    'agro_nat'
    ];

    function isUser(login) {
        if (login) {
            return users.indexOf(login.toLowerCase()) != -1;
        }
        return false;
    }

    function isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    var publicInterface = {
        pluginName: 'NDVITimelinePlugin',
        afterViewer: function (params) {

            $.when(gmxCore.loadScript("http://maps.kosmosnimki.ru/api/plugins/themesModule/shared.js")).then(function () {
                //проверочка на совместимость браузера
                if (isIE() && isIE() <= 10) {
                    if (document.domain != "maps.kosmosnimki.ru") {
                        var href = "http://maps.kosmosnimki.ru/api/index.html?" + nsGmx.gmxMap.properties.name;
                        AgroWarning.getInstance().appendHTML('<div style="padding:0px 0px 10px 20px;">Ваш браузер не поддерживает некоторые функции, пожалуйста перейдите по ссылке ниже</div>' +
                            '<div style="padding-left:20px;"><b>Ссылка:</b> <a style="color:blue;" href="' + href + '">' + href + '</a></div>');
                    }
                }

                var userRole = isUser(nsGmx.AuthManager.getLogin());

                ndviTimelineManager = new NDVITimelineManager(params, userRole);
                ndviTimelineManager.start();

                var pluginsPath = gmxCore.getModulePath("NDVITimelinePlugin") + "../";
                gmxCore.loadModule("AgroLegendModule", pluginsPath + "agroLegend/agroLegendPlugin.js", function (agroModule) {
                    agroModule.initLegends();
                });
            });
        }
    };

    window.gmxCore && window.gmxCore.addModule('NDVITimelinePlugin', publicInterface, {
        init: function (module, path) {

            return $.when(
                gmxCore.loadScript(path + "NDVITimelineManager.js"),
                gmxCore.loadScript(path + "../themesModule/RequestsQueue.js"),
                gmxCore.loadScript(path + "../themesModule/ThematicHandler.js"),
                gmxCore.loadScript(path + "../themesModule/styleHookManager.js"),
                gmxCore.loadScript(path + "SlopeManager.js"),
                gmxCore.loadScript(path + "switchControl.js"),
                gmxCore.loadScript(path + "optionsMenu.js"),
                gmxCore.loadScript(path + "bindScrollControl.js"),
                gmxCore.loadScript(path + "ndviTimelineSlider.js"),
                gmxCore.loadScript(path + "layersTool.js"),
                gmxCore.loadScript(path + "agroWarning.js")
            );
        },
        css: 'style.css'
    });
})();