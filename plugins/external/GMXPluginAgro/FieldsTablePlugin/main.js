var fieldsTable2;

(function () {

    var printableAliases = {
        "Num": "id",
        "Name": "Номер",
        "farm": "Схема полей",
        "Kultura": "Культура",
        "sort": "Сорт",
        "Area": "Площадь рассчитанная, га",
        "Area_zak": "Площадь от заказчика, га"
    };

    var sizes = ["10%", "18%", "38%", "17%", "17%"];
    var aliases = { "Num": "ID", "Name": "Номер", "Kultura": "Культура", "Area_zak": "Площадь зак. (га)", "Area": "Площадь (га)" };
    var possibleAliases = { "Num": ["field_id"], "Name": ["name"], "Kultura": ["crop", "Culture", "Культура"], "Area": ["area_sys"], "Area_zak": ["area_user"] };
    var sumFieldName = "Area";
    //var aliases = { "name": "название", "value": "значение" };
    //var sumFieldName = "value";

    function showFieldsTableMenu(layer) {

        //gmxAPI.map.layers[layer.name].setVisible(true);
        var ll = nsGmx.gmxMap.layersByID[layer.name];
        nsGmx.leafletMap.addLayer(ll);


        if (fieldsTable2 && layer.name == fieldsTable2._layerName) {
            return;
        }

        //var l = gmxAPI.map.layers[layer.name];

        if (fieldsTable2) {
            fieldsTable2.clearCache();
            fieldsTable2.removeAllSelection();
            fieldsTable2.clear();
            fieldsTable2 = null;
        }

        var fieldsMenu = new LeftMenuEx();
        fieldsTable2 = new FieldsTableEx(fieldsMenu, aliases, sumFieldName, printableAliases, layer.identityField/*gmxAPI.map.layers[layer.name].properties.identityField*/, layer.attributes, possibleAliases, sizes);
        fieldsTable2.showFieldsTable(layer);
    };

    function initLayersTreeDoubleClick() {
        _layersTree.treeModel.forEachNode(function (node) {
            if (node.type === "layer") {
                var l = nsGmx.gmxMap.layersByID[node.content.properties.name];
                //var prop = gmxAPI.map.layers[node.content.properties.name].properties;
                var prop = l.getGmxProperties();
                if (prop.type === "Vector" && prop.GeometryType === "polygon" &&
                    !($.isEmptyObject(prop.MetaProperties.project)) &&
                    ($.trim(prop.MetaProperties.project.Value) == "InsuranceGeo" ||
                     $.trim(prop.MetaProperties.project.Value) == "cosmosagro")) {
                    $(node).on('dblclick', function () {
                        showFieldsTableMenu(node.content.properties);
                    })
                }
            }
        });
    };

    var publicInterface = {
        pluginName: 'FieldsTablePlugin',
        afterViewer: function (params) {
            //инициализация после того, как дерево загрузится
            initLayersTreeDoubleClick();

            //автоматически показать таблицу
            if (params.autoloadId) {
                var layer = gmxAPI.map.layers[params.autoloadId];
                if (layer) {
                    showFieldsTableMenu(layer.properties);
                }
            }
        }
    };

    window.gmxCore && window.gmxCore.addModule('FieldsTablePlugin', publicInterface, {
        init: function (module, path) {

            nsGmx.ContextMenuController.addContextMenuElem({
                title: function () { return "Поля хозяйства";/*_gtxt("Поля хозяйства");*/ },
                //isVisible: function (context) {
                //    return !context.layerManagerFlag && (_queryMapLayers.currentMapRights() === "edit" || _queryMapLayers.layerRights(context.elem.name) == 'edit') && context.elem.type === "Vector";
                //},
                clickCallback: function (context) {
                    showFieldsTableMenu(context.elem);
                }
            }, 'Layer');

            return $.when(
                gmxCore.loadScript(path + "LeftMenuEx.js"),
                gmxCore.loadScript(path + "FieldsTableEx.js"),
                gmxCore.loadScript(path + "../themesModule/styleHookManager.js"),
                gmxCore.loadScript(path + "../themesModule/shared.js")
            );
        },
        css: 'style.css'
    });
})();