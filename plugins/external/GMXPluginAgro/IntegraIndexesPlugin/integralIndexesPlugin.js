window.gmxCore && window.gmxCore.addModule('IntegralIndexesModule', {
    pluginName: 'IntegralIndexesPlugin',
    afterViewer: function (params) {
    },
    initIntergralIndexes: function (obj) {
        obj.initializeIntegralScheme();
    }
}, {
    init: function (module, path) {
        return $.when(
            gmxCore.loadScript(path + "ajQueue.js"),
            gmxCore.loadScript(path + "integralIndexes.js")
        );
    }
});