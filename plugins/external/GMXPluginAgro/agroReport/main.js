var repTable;

function showReportTableMenu() {
    var repMenu = new RepMenu();
    repTable = new RepTable(repMenu);
    repTable.showTable();
};

(function () {

    var publicInterface = {
        pluginName: 'AgroReportPlugin',
        afterViewer: function (params) {
            showReportTableMenu();
        }
    };

    window.gmxCore && window.gmxCore.addModule('AgroReportPlugin', publicInterface, {
        init: function (module, path) {
            return $.when(
                gmxCore.loadScript(path + "repMenu.js"),
                gmxCore.loadScript(path + "repTable.js")
            );
        },
        css: 'style.css'
    });
})();