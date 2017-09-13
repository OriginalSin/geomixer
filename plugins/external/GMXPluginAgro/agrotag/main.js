(function () {

    var title = 'Создать хозяйство';

    function createLayerDialog() {
        var parent = _div(null, [['attr', 'id', 'newLayer'], ['css', 'height', '100%']]);
        var dialogDiv = showDialog(title, parent, 340, 340, false, false);

        nsGmx.createLayerEditor(null, 'Vector', parent, {
            MetaProperties: {
                "project": { Type: 'String', Value: 'cosmosagro' },
                "product": { Type: 'String', Value: 'fields' }
            }
        }, {
            additionalUI: {
                main: [$('<div><div style="margin-top: 10px;"><div style="float:left;width: 55px;"><b>project</b>:</div><div>cosmosagro</div></div> \
                                  <div style="padding-top: 5px;"><div style="float:left; width: 55px;"><b>product</b>:</div><div>fields</div></div></div>')]
            },
            standardTabs: ['main', 'attrs']
        });
    };

    function addMenu() {

        var c = nsGmx.leafletMap.gmxControlIconManager.get('createLayer');
        if (c) {
            c.addIcon(L.control.gmxIcon({
                id: 'agroCreateVectorLayer',
                togglable: false,
                title: title
            }).on('click', function (ev) {
                createLayerDialog();
            }));

            _menuUp.addChildItem({
                id: 'agroCreateVectorLayer_menu',
                title: title,
                func: function () {
                    createLayerDialog();
                },
                delimiter: true
            }, 'dataMenu', "layerList");
        }
    };

    var publicInterface = {
        pluginName: 'AgroTagPlugin',
        afterViewer: function (params) {
            addMenu();
        }
    };

    window.gmxCore && window.gmxCore.addModule('AgroTagPlugin', publicInterface, {
        init: function (module, path) {

        },
        css: ["style.css"]
    });
})();