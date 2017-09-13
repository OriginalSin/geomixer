/*
=======================================================
    NDVIGraphicsManager
=======================================================
*/
var NDVIGraphicsManager = function (params) {
    //параметры плагина
    this.pluginParams = params;

    //загруженные палитры по url
    this.palettesUrl = {};

    this._dialog = new GraphDialog();
    this.graphDialog = new NDVIGraphicsDialog(this._dialog, params);
    this.initDialogEvents();

    this.selectionModis = "ndvi";
    this.selectionLandsat = "ndvi";

    //массив id'шников для удаления с карты
    this._removeItems = [];

    //загруженные палитры по url'ам
    this._palettes = {};
    this.tempLayers = {};

    //хранилище ndviFeatures
    this.ndviFeatures = [];

    this.selectedFeature = null;

    //инициализация контрола расскраски по средним NDVI
    var ts = new ThematicStrategy(params.layers.LANDSAT8.palette.ndvi.url, function (val) {
        var color;

        val = Math.round(val);

        if (val == 0 || val == -100) {
            color = shared.RGB2HEX(0, 179, 255);
        } else if (val < 101) {
            color = shared.RGB2HEX(0, 0, 0);
        } else if (val > 201) {
            color = shared.RGB2HEX(255, 255, 255);
        } else {
            var c = this.palette[val];
            color = shared.RGB2HEX(c.partRed, c.partGreen, c.partBlue);
        }

        return color;
    });

    this._meanNDVIManager = new ThematicHandler(ts);
    this._meanNDVIManager.katalogName = params.layers.LANDSAT8.name;
    this._meanNDVIManager.dataSource = "F28D06701EF2432DB21BFDB4015EF9CE";

    //инициализация контрола посторения тематики неоднородности
    var tsneondn = new ThematicStrategy(null, function (val) {
        if (val >= 0) {
            var color = this.palette[10 * Math.floor(val / 10)];
            return shared.RGB2HEX(color.r, color.g, color.b);
        }
        return shared.RGB2HEX(0, 179, 255);
    });
    tsneondn._requestValueCallback = ThematicStrategy.__neodnrValue;
    tsneondn.returnDataArr = ["Hist"];
    tsneondn.palette = {
        "0": { "r": 0, "g": 0, "b": 0 },
        "10": { "r": 245, "g": 12, "b": 50 },
        "20": { "r": 245, "g": 12, "b": 50 },
        "30": { "r": 245, "g": 12, "b": 50 },
        "40": { "r": 227, "g": 145, "b": 57 },
        "50": { "r": 230, "g": 200, "b": 78 },
        "60": { "r": 240, "g": 240, "b": 24 },
        "70": { "r": 223, "g": 237, "b": 92 },
        "80": { "r": 179, "g": 214, "b": 109 },
        "90": { "r": 125, "g": 235, "b": 21 },
        "100": { "r": 30, "g": 163, "b": 18 }
    };
    this._neodnrManager = new ThematicHandler(tsneondn);
    this._neodnrManager.manualOnly = false;
    this._neodnrManager.dataSource = "1F7E5026D73447D09897217CE737F565";
    this._neodnrManager.katalogName = params.layers.CLASSIFICATION.name;


    //слой и стили которые будем раскрашивать по средним vci
    this._meanVCILayer = null;

    this.loadExMap();

    this._preRenderHookedLayers = [];

    this._styleBackup = [];
};

var AgroShared = {};
AgroShared._meanVCIStyleData = {};

//кеш геометрий слоев
NDVIGraphicsManager.geomCache = [];

//здесь храянтся все загруженные слои всех загруженных карт
NDVIGraphicsManager.layerCollection = {};

//Эта функция возвращает массив полигонов
NDVIGraphicsManager.inverseMercatorGeometry = function (geometry) {
    var res = [];
    if (geometry.type === "POLYGON") {
        res.push(gmxAPI.from_merc_geometry({ "type": "POLYGON", "coordinates": geometry.coordinates }));
    } else if (geometry.type === "MULTIPOLYGON") {
        var poligons = geometry.coordinates;
        for (var i = 0; i < poligons.length; i++) {
            res.push(gmxAPI.from_merc_geometry({ "type": "POLYGON", "coordinates": poligons[i] }));
        }
    }
    return res;
};

NDVIGraphicsManager.prototype.repaintSelectedLayers = function () {
    if (this.selectedFeature) {
        var f = this.selectedFeature.features;
        for (var i = 0; i < f.length; i++) {
            f[i].attr.layer.repaint();
        }
    }
};

NDVIGraphicsManager.prototype.loadExMap = function () {
    var that = this;
    var p = L.gmx.loadMap(this.pluginParams.exMap.name);

    p.then(function (h) {

        //сохраняем слои
        for (var i in h.layersByID) {
            if (!NDVIGraphicsManager.layerCollection[i]) {
                NDVIGraphicsManager.layerCollection[i] = h.layersByID[i];
            }
        }

        that.initializeLayers();
        that.initializeImageProcessor();

        that._meanVCILayer = h.layersByID["58B949C8E8454CF297184034DD8A62CD"];
        that._meanVCILayer.setZIndex(-1);
        AgroShared._meanVCIStyleData = {};
        setTimeout(function () {
            var regionId = that._meanVCILayer._gmx.tileAttributeIndexes["Region"];
            var districtId = that._meanVCILayer._gmx.tileAttributeIndexes["District"];
            that._meanVCILayer.setStyleHook(function (data) {
                var nameId = data.properties[regionId] + ":" + data.properties[districtId];
                var s = AgroShared._meanVCIStyleData[nameId];
                if (s) {
                    return s;
                } else {
                    return null;
                }
            });
        }, 0);
    });

    //сохраняем загруженные слои
    $(window._queryExternalMaps).bind('map_loaded', function (e) {
        for (var i in nsGmx.gmxMap.layersByID) {
            if (!NDVIGraphicsManager.layerCollection[i]) {
                NDVIGraphicsManager.layerCollection[i] = nsGmx.gmxMap.layersByID[i];
            }
        }

        that.initializeLayers();
        that.initializeImageProcessor();
    });
};


NDVIGraphicsManager.prototype.getLayersCommonGeometry = function (ndviFeature, callback) {

    var that = this;
    var defArr = [];
    var geometryArray = [];
    var equalLayers = [];

    for (var i = 0; i < ndviFeature.features.length; i++) {
        (function (index) {
            var layerName = ndviFeature.features[index].attr.layer.properties.name;
            if (!equalLayers[layerName]) {
                equalLayers[layerName] = true;
                defArr[index] = new $.Deferred();
                if (!NDVIGraphicsManager.geomCache[layerName]) {
                    NDVIGraphicsManager.geomCache[layerName] = [];
                    //Получаем геометрию полей с сервера
                    var url = window.serverBase + "/VectorLayer/Search.ashx?WrapStyle=func" +
                              "&layer=" + layerName +
                              "&geometry=true";

                    sendCrossDomainJSONRequest(url, function (response) {
                        var res = response.Result;
                        var geom_index = res.fields.indexOf("geomixergeojson");
                        for (var j = 0; j < res.values.length; j++) {
                            var geom = NDVIGraphicsManager.inverseMercatorGeometry(res.values[j][geom_index]);
                            NDVIGraphicsManager.geomCache[layerName].push.apply(NDVIGraphicsManager.geomCache[layerName], geom);
                        }
                        geometryArray[index] = NDVIGraphicsManager.geomCache[layerName];
                        defArr[index].resolve();
                    });
                } else {
                    geometryArray[index] = NDVIGraphicsManager.geomCache[layerName];
                    defArr[index].resolve();
                }
            }
        }(i));
    }

    $.when.apply($, defArr).then(function () {
        var commonGeometry = { "type": "MULTIPOLYGON", "coordinates": [] };
        //делаем общую геометрию
        for (var i = 0; i < geometryArray.length; i++) {
            var geom = geometryArray[i];
            for (var j = 0; j < geom.length; j++) {
                var gj = geom[j];
                if (gj.type == "POLYGON") {
                    commonGeometry.coordinates.push(gj.coordinates);
                } else {
                    //MULTYPOLYGON
                    for (var k = 0; k < gj.coordinates.length; k++) {
                        commonGeometry.coordinates.push(gj.coordinates[k]);
                    }
                }
            }
        }

        callback && callback.call(that, commonGeometry);
    });
};

/*
========================================
    Отбражение продуктов на карте
========================================
*/
NDVIGraphicsManager.prototype.showModisNDVI = function (selectedFeature, catalogData) {
    this.showCatalog("MODIS", selectedFeature, catalogData);
};

NDVIGraphicsManager.prototype.showModisQUALITY = function (selectedFeature, catalogData) {
    this.showCatalog("MODIS", selectedFeature, catalogData, "quality");
};

NDVIGraphicsManager.prototype.showModisVCI = function (selectedFeature, catalogData) {
    //this._meanVCILayer.setVisible(false);
    var url = 'http://maps.kosmosnimki.ru/VectorLayer/Search.ashx?WrapStyle=func&geometry=false&tables=[{%22LayerName%22:%224B68E05D988E404D962F5CC79FFCE67F%22,%22Alias%22:%22v%22},{%22LayerName%22:%2258B949C8E8454CF297184034DD8A62CD%22,%22Alias%22:%22a%22,%22Join%22:%22Inner%22,%22On%22:%22[v].area_id%20=%20[a].ogc_fid%22}]&columns=[{%22Value%22:%22[a].[Region]%22},{%22Value%22:%22[a].[District]%22},{%22Value%22:%22[v].[Value]%22}]';
    var query = '&query="Type"=' + 0 +
        ' AND "date"=' + "'" + shared.formatDate(catalogData.date.getDate(), catalogData.date.getMonth() + 1, catalogData.date.getFullYear()) + "'";

    //делаем запрос и раскрашиваем
    var that = this;
    sendCrossDomainJSONRequest(url + query, function (res) {

        if (!that.selectedFeature) return;

        AgroShared._meanVCIStyleData = {};
        var data = res.Result;
        for (var i = 0; i < data.values.length; i++) {
            var VCI = data.values[i][2];
            var r = 0, g = 0, b = 0, a = 100;
            if (VCI <= 20) {
                //красный
                r = 255;
                g = 0;
                b = 0;
            } else if (VCI <= 40) {
                //розовый
                r = 255;
                g = 127;
                b = 127;
            } else if (VCI <= 60) {
                //желтый
                r = 255;
                g = 255;
                b = 0;
            } else if (VCI <= 80) {
                //зеленый
                r = 0;
                g = 255;
                b = 0;
            } else if (VCI <= 100) {
                //темно зеленый
                r = 0;
                g = 128;
                b = 0;
            } else {
                //VCI > 100
                r = 0;
                g = 0;
                b = 0;
            }

            var nameId = data.values[i][0] + ":" + data.values[i][1];

            AgroShared._meanVCIStyleData[nameId] = {
                fillStyle: "rgb(" + r + "," + g + "," + b + ")",
                fillOpacity: 1.0,
                strokeStyle: "rgb(" + (r - (r > 0 ? 15 : 0)) + "," + (g - (g > 0 ? 15 : 0)) + "," + (b - (b > 0 ? 15 : 0)) + ")",
                opacity: a,
                weight: 1
            };
        }

        var typeId = that._meanVCILayer._gmx.tileAttributeIndexes["Type"];

        that._meanVCILayer.setFilter(function (item) {
            var p = item.properties;
            if (p[typeId] == 0) {
                return true;
            }
            return false;
        });

        //that._meanVCILayer.setVisible(true);
        nsGmx.leafletMap.addLayer(that._meanVCILayer);
        //that._meanVCILayer.setVisibilityFilter('"Type"=0');
        //that._meanVCILayer.setVisible(true);
    });

};

NDVIGraphicsManager.ITEM_ID = 1000;

NDVIGraphicsManager.prototype.showLandsatNDVI = function (selectedFeature, catalogData) {

    this.showCatalog("LANDSAT8", selectedFeature, catalogData);
};

NDVIGraphicsManager.prototype.showCatalog = function (optionName, selectedFeature, catalogData, modisProductType) {
    var query = "";
    var product = selectedFeature._product;
    var shots = catalogData.features;
    if (selectedFeature._resolutionType == "MODIS") {
        modisProductType = modisProductType || "ndvi";
        var sceneFieldName = this.pluginParams.layers[selectedFeature._product].sceneFieldName || "filename";
        for (var i = 0; i < shots.length; i++) {
            var fi = shots[i];
            if (!fi.prodtype) {
                fi.prodtype = this.pluginParams.layers[selectedFeature._product].palette[modisProductType].prodtype;
            }
            if (fi.prodtype.toUpperCase() == this.pluginParams.layers[selectedFeature._product].palette[modisProductType].prodtype) {
                if (fi[sceneFieldName]) {
                    query += "[" + sceneFieldName + "]='" + fi[sceneFieldName] + "'" + " OR ";
                } else {
                    query += "[gmx_id]='" + fi["gmx_id"] + "'" + " OR ";
                }
            }
        }
    } else {
        var sceneidFieldNameLandsat8 = this.pluginParams.layers[product].sceneFieldName;
        var sceneFieldName = this.pluginParams.layers[optionName].sceneFieldName || "sceneid";
        for (var i = 0; i < shots.length; i++) {
            var fi = shots[i];
            if (fi[sceneidFieldNameLandsat8]) {
                query += "[" + sceneFieldName + "]='" + fi[sceneidFieldNameLandsat8] + "'" + " OR ";
            } else {
                query += "[gmx_id]='" + fi["gmx_id"] + "'" + " OR ";
            }
        }
    }

    query = query.substring(0, query.length - 4);

    var that = this;
    sendCrossDomainPostRequest(window.serverBase + "VectorLayer/Search.ashx", {
        'query': query,
        'geometry': true,
        'layer': this.pluginParams.layers[optionName].name,
        'WrapStyle': "window"
    }, function (result) {

        if (!that.selectedFeature) return;

        var val = result.Result.values;
        var layer = that.tempLayers[optionName];
        var data = [];
        //var gmxId = result.Result.fields.indexOf("GMX_RasterCatalogID");
        //var prodtypeId = result.Result.fields.indexOf("prodtype");
        for (var i = 0; i < val.length; i++) {
            var vi = val[i];
            var id = i + 1;
            var d = [id];
            for (var p = 1; p < vi.length; p++) {
                d.push(vi[p]);
            }
            data.push(d);
            that._removeItems.push(id);
        }
        layer.addData(data);

        if (optionName == "LANDSAT8" || optionName == "CLASSIFICATION") {
            var f = selectedFeature.features;
            for (var i = 0; i < f.length; i++) {
                var styles = f[i].attr.layer.getStyles();
                that._styleBackup[i] = { "f": f[i].attr.layer, "rop": [], "hop": [] };
                for (var j = 0; j < styles.length; j++) {
                    if (styles[j].RenderStyle) {
                        that._styleBackup[i].rop[j] = styles[j].RenderStyle.fillOpacity;
                        styles[j].RenderStyle.fillOpacity = 0.0;
                    }
                    if (styles[j].HoverStyle) {
                        that._styleBackup[i].hop[j] = styles[j].HoverStyle.fillOpacity;
                        styles[j].HoverStyle.fillOpacity = 0.0;
                    }
                }
                f[i].attr.layer.setStyles(styles);
                f[i].attr.layer.addPreRenderHook(l_hook);
                that._preRenderHookedLayers.push(f[i].attr.layer);
            }
        }
        nsGmx.leafletMap.addLayer(layer);
    });
};

NDVIGraphicsManager.prototype.showLandsatRGB = function (selectedFeature, catalogData) {
    this.showCatalog("RGB", selectedFeature, catalogData);
};

NDVIGraphicsManager.prototype.showLandsatRGB2 = function (selectedFeature, catalogData) {
    this.showCatalog("RGB2", selectedFeature, catalogData);
};

NDVIGraphicsManager.prototype.showLandsatCLASS = function (selectedFeature, catalogData) {
    this.showCatalog("CLASSIFICATION", selectedFeature, catalogData);
};

NDVIGraphicsManager.tolesBG = {};

NDVIGraphicsManager.prototype.clearMap = function () {

    for (var i = 0; i < this._styleBackup.length; i++) {
        var s = this._styleBackup[i].f.getStyles();
        for (var j = 0; j < this._styleBackup[i].rop.length; j++) {
            s[j].RenderStyle.fillOpacity = this._styleBackup[i].rop[j];
        }
        for (var j = 0; j < this._styleBackup[i].hop.length; j++) {
            s[j].HoverStyle.fillOpacity = this._styleBackup[i].hop[j];
        }
        this._styleBackup[i].f.setStyles(s);
    }

    this._styleBackup = [];

    for (var i = 0; i < this._preRenderHookedLayers.length; i++) {
        this._preRenderHookedLayers[i].removePreRenderHook(l_hook);
    }
    this._preRenderHookedLayers.length = 0;
    this._preRenderHookedLayers = [];

    NDVIGraphicsManager.tolesBG = {};

    for (var l in this.tempLayers) {
        this.tempLayers[l].removeData(this._removeItems);
        nsGmx.leafletMap.removeLayer(this.tempLayers[l]);
    }
    this._removeItems.length = 0;
    this._removeItems = [];

    //скрываем слои с тематиками
    this._hideNDVI_MEAN();
    this._hideINHOMOGENUITY();

    nsGmx.leafletMap.removeLayer(this._meanVCILayer);
};

NDVIGraphicsManager.prototype.initDialogEvents = function () {

    var that = this;

    this.graphDialog.onclear = function () {
        that.graphDialog.cloneMiniDialog.hide();
        that.removeNDVIFeatures();
    };

    this._dialog.onmaximize = function () {
        that.graphDialog.setMinimized(false);
        that.graphDialog.cloneMiniDialog.hide();
    };

    this._dialog.oncollapse = function () {
        that.graphDialog.setMinimized(true);
        that.graphDialog.cloneMiniDialog.hide();
    };

    this._dialog.onclose = function () {
        that.removeNDVIFeatures();
        that.graphDialog.clearAll();
        that._dialog.hide();
        that.graphDialog.cloneMiniDialog.hide();
    };

    this.graphDialog.onModisSelect = function (val) {
        that.selectionModis = val;
        console.log(val);
    };

    this.graphDialog.onLandsatSelect = function (val) {
        that.selectionLandsat = val;
        console.log(val);
    };

    var selectedData;
    var selectedDataIndex = -1;
    this.graphDialog.onPointClick = function (item) {
        if (that.selectedFeature) {
            //выключаем выделение
            if (that.selectedFeature._id == item.series.properties.ndviFeature._id &&
                selectedDataIndex == item.dataIndex) {
                that.selectedFeature.selected = false;
                selectedData = null;
                selectedDataIndex = -1;
                that.selectedFeature._graphGrid._plot.unhighlight();
                that.clearMap();

                //очищяем всплывалку
                selectedBalloonInfoHtml = "";
                that.graphDialog.setBalloonInfoVisibility(false, that.selectedFeature._gridName);
                that.graphDialog.setBalloonInfoHtml("", that.selectedFeature._gridName);
                that.graphDialog.setBottomVisibility(false);

                that.selectedFeature = null;
                return;
            }
            that.selectedFeature.divInfo.style.backgroundColor = "";
        }
        that.selectedFeature = item.series.properties.ndviFeature;
        selectedData = that.selectedFeature.catalogData[item.dataIndex];
        selectedDataIndex = item.dataIndex;
        that.selectedFeature.divInfo.style.backgroundColor = "rgba(" + shared.hexToR(that.selectedFeature._color) + "," +
            shared.hexToG(that.selectedFeature._color) + "," + shared.hexToB(that.selectedFeature._color) + ", 0.2)";

        selectedBalloonInfoHtml = that.selectedFeature._graphGrid.balloonDialog.innerHTML;
        that.selectedFeature.selected = true;

        document.getElementById("ndvigraphics-label-empty").style.display = "none";
        document.getElementById("ndvigraphics-label-hr").style.display = "none";
        document.getElementById("ndvigraphics-label-modis").style.display = "none";

        var groupName;
        if (that.selectedFeature._resolutionType == "MODIS") {
            if (that.selectedFeature._product == "MODIS") {
                document.getElementById("ndvigraphics-label-modis").style.display = "block";
                groupName = "modisGroup";
            } else {
                document.getElementById("ndvigraphics-label-empty").style.display = "block";
                groupName = "emptyGroup";
            }
        } else if (that.selectedFeature._resolutionType == "LANDSAT") {
            document.getElementById("ndvigraphics-label-hr").style.display = "block";
            groupName = "landsatGroup";
        }
        that.graphDialog.setBottomVisibility(true);

        //какой продукт включен получаем из радиокнопки
        var product = $('input[name=' + groupName + ']:checked').val();
        that.showProduct(product, that.selectedFeature, selectedData);
    };

    this.graphDialog.onEmptyClick = function (item) {
        if (that.selectedFeature) {

            overFeature && overFeature.setLighting(false);

            that.selectedFeature.divInfo.style.backgroundColor = "";
            that.selectedFeature.selected = false;
            //that.selectedFeature = null;
            selectedData = null;
            selectedDataIndex = -1;
            that.clearMap();

            that.selectedFeature._graphGrid._plot.unhighlight();

            //очищяем всплывалку
            selectedBalloonInfoHtml = "";
            that.graphDialog.setBalloonInfoVisibility(false, that.selectedFeature._gridName);
            that.graphDialog.setBalloonInfoHtml("", that.selectedFeature._gridName);
            that.graphDialog.setBottomVisibility(false);

            that.selectedFeature = null;
        }
    };

    var overFeature = null;
    this.graphDialog.onPointOver = function (item) {

        overFeature && overFeature.setLighting(false);

        if (!that.selectedFeature && overFeature && overFeature._id != item.series.properties.ndviFeature._id ||
            that.selectedFeature && overFeature._id != that.selectedFeature._id) {
            overFeature.divInfo.style.backgroundColor = "";
            overFeature.setLighting(false);
        }
        overFeature = item.series.properties.ndviFeature;
        overFeature.divInfo.style.backgroundColor = "rgba(" + shared.hexToR(overFeature._color) + "," +
            shared.hexToG(overFeature._color) + "," + shared.hexToB(overFeature._color) + ", 0.2)";
        overFeature.setLighting(true);

        that.graphDialog.setBalloonInfoVisibility(true, overFeature._gridName);

        var d = overFeature.catalogData[item.dataIndex];

        if (overFeature._gridName == "ndvi") {
            var prod = overFeature._product;
            var data = shared.dateToString(d.date);
            var znach = d.meanNdvi.toFixed(2);

            var sceneIdField = that.pluginParams.layers[prod].sceneFieldName || "sceneid";

            var scene = "";
            for (var i = 0; i < d.features.length; i++) {
                if (d.features[i].filename) {
                    if (d.features[i].prodtype && d.features[i].prodtype.toUpperCase() == that.pluginParams.layers[prod].palette.ndvi.prodtype.toUpperCase()) {
                        scene += d.features[i].filename + (i < d.features.length - 1 ? ", " : "");
                    }
                } else if (d.features[i][sceneIdField]) {
                    scene += d.features[i][sceneIdField] + (i < d.features.length - 1 ? ", " : "");
                }
            }

            var infoHtml = '<div style="margin: 5px 0px 0px 0px;">' +
            '<div class="ndvigraphics-balloon-line">' +
            '<div class="ndvigraphics-balloon-item"><div class="ndvigraphics-balloon-text">' + data + '</div></div>' +
            '<div class="ndvigraphics-balloon-item"><div class="ndvigraphics-balloon-label">ndvi=</div><div class="ndvigraphics-balloon-text">' + znach + '</div></div>' +
            '</div>' +
            '<div class="ndvigraphics-balloon-line">' +
            '<div class="ndvigraphics-balloon-item"><div ' +
            (d.features.length > 1 ? 'title="' + scene + '" ' : "") +
            'style="width:184px;" class="ndvigraphics-balloon-text">' + scene + '</div></div>' +
            '</div>';
        } else {
            var data = shared.dateToString(d.properties.Date);
            var znach = item.datapoint[1].toFixed(2);

            var infoHtml = '<div style="margin: 5px 0px 0px 0px;">' +
            '<div class="ndvigraphics-balloon-line">' +
            '<div class="ndvigraphics-balloon-item"><div class="ndvigraphics-balloon-text">' + data + '</div></div>' +
            '<div class="ndvigraphics-balloon-item"><div class="ndvigraphics-balloon-label">' + (that.pluginParams.layers[overFeature._product].sign || "value") + '=</div><div class="ndvigraphics-balloon-text">' + znach + '</div></div>' +
            '</div>';
        }

        that.graphDialog.setBalloonInfoHtml(infoHtml, overFeature._gridName);
    };

    var selectedBalloonInfoHtml = "";
    this.graphDialog.onPointOut = function (item) {
        if (!that.selectedFeature || that.selectedFeature && overFeature._id != that.selectedFeature._id) {
            overFeature.divInfo.style.backgroundColor = "";
        }

        if (!that.selectedFeature || that.selectedFeature && that.selectedFeature._gridName != overFeature._gridName) {
            that.graphDialog.setBalloonInfoVisibility(false, overFeature._gridName);
        }

        that.graphDialog.setBalloonInfoHtml(selectedBalloonInfoHtml, overFeature._gridName);
        overFeature.setLighting(false);
    };

    //=============================
    //События при выборе продукта
    //=============================
    this.graphDialog.onmodisndvi = function (e) {
        if (that.selectedFeature) {
            that.showProduct("ndvi_modis", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onmodisquality = function (e) {
        if (that.selectedFeature) {
            that.showProduct("quality_modis", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onmodisvci = function (e) {
        if (that.selectedFeature) {
            that.showProduct("vci_modis", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onhrndvi = function (e) {
        if (that.selectedFeature) {
            that.showProduct("ndvi_hr", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onhrndvimean = function (e) {
        if (that.selectedFeature) {
            that.showProduct("ndviMean_hr", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onhrrgb = function (e) {
        if (that.selectedFeature) {
            that.showProduct("rgb_hr", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onhrrgb2 = function (e) {
        if (that.selectedFeature) {
            that.showProduct("rgb2_hr", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onhrclass = function (e) {
        if (that.selectedFeature) {
            that.showProduct("class_hr", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onhrhomogenuity = function (e) {
        if (that.selectedFeature) {
            that.showProduct("homogen_hr", that.selectedFeature, selectedData);
        }
    };

    this.graphDialog.onclone = function (ndviFeature) {
        that.cloneNDVIFeature(ndviFeature, that.graphDialog.cloneMiniDialog.getProduct(), that.graphDialog.cloneMiniDialog.getYear());
    };
};


NDVIGraphicsManager.prototype.showProduct = function (product, selectedFeature, selectedData) {
    this.clearMap();
    switch (product) {
        case "ndvi_modis":
            this.showModisNDVI(selectedFeature, selectedData);
            break;
        case "quality_modis":
            this.showModisQUALITY(selectedFeature, selectedData);
            break;
        case "vci_modis":
            this.showModisVCI(selectedFeature, selectedData);
            break;
        case "ndvi_hr":
            this.showLandsatNDVI(selectedFeature, selectedData);
            break;
        case "ndviMean_hr":
            this.showLandsatNDVI_MEAN(selectedFeature, selectedData);
            break;
        case "homogen_hr":
            this.showINHOMOGENUITY(selectedFeature, selectedData);
            break;
        case "rgb_hr":
            this.showLandsatRGB(selectedFeature, selectedData);
            break;
        case "rgb2_hr":
            this.showLandsatRGB2(selectedFeature, selectedData);
            break;
        case "class_hr":
            this.showLandsatCLASS(selectedFeature, selectedData);
            break;
        default:
            alert("Алгоритм продукта неопределен.");
    }
};

NDVIGraphicsManager.prototype.showLandsatNDVI_MEAN = function (selectedFeature, selectedData) {

    var layers = [];
    for (var i = 0; i < selectedFeature.features.length; i++) {
        var fi = selectedFeature.features[i];
        layers.push(fi.attr.layer);
    }

    var rkArr = [];
    var fnArr = [];
    for (var i = 0; i < selectedData.features.length; i++) {
        var fi = selectedData.features[i].GMX_RasterCatalogID;
        var fni = selectedData.features[i].sceneid;
        fnArr.push(fni);
        rkArr.push(fi);
    }

    this._meanNDVIManager.start(layers, shared.dateToString(selectedData.date, true), rkArr, fnArr);
};

NDVIGraphicsManager.prototype._hideNDVI_MEAN = function () {
    this._meanNDVIManager.clear();
};

NDVIGraphicsManager.prototype.showINHOMOGENUITY = function (selectedFeature, selectedData) {
    //ищем gmxId в каталоге классификаций
    var query = "";
    var sceneFiledName = this.pluginParams.layers.CLASSIFICATION.sceneFieldName || "sceneid";
    for (var i = 0; i < selectedData.features.length; i++) {
        var sceneid = selectedData.features[i][this.pluginParams.layers.LANDSAT8.sceneFieldName || "sceneid"];
        query += "[" + sceneFiledName + "]='" + sceneid + (i < selectedData.features.length - 1 ? "' OR " : "'");
    }

    var url = window.serverBase + "VectorLayer/Search.ashx?WrapStyle=func" +
        "&layer=" + this.pluginParams.layers.CLASSIFICATION.name +
        "&returnGeometry=false&query=" + query;

    var that = this;
    sendCrossDomainJSONRequest(url, function (response) {
        if (response.Status == "ok") {
            var layers = [];
            for (var i = 0; i < selectedFeature.features.length; i++) {
                var fi = selectedFeature.features[i];
                //layers.push(fi.attr.layer.properties.name);
                layers.push(fi.attr.layer);
            }

            var res = response.Result;
            var id = res.fields.indexOf("GMX_RasterCatalogID");
            var sid = res.fields.indexOf("sceneid");
            var rkArr = [];
            var fnArr = [];
            for (var i = 0; i < res.values.length; i++) {
                rkArr.push(res.values[i][id]);
                fnArr.push(res.values[i][sid]);
            }

            that._neodnrManager.start(layers, shared.dateToString(selectedData.date, true), rkArr, fnArr);
        }
    });
};

NDVIGraphicsManager.prototype._hideINHOMOGENUITY = function () {
    this._neodnrManager.clear();
};


/**
 * @param {Object} feature .
 * @param {String} product "MODIS", "HR".
 * @param {Integer} year.
 */
NDVIGraphicsManager.prototype.loadNDVIFeature = function (ndviFeature, product, year) {

    ndviFeature._graphicManager = this;
    ndviFeature._resolutionType = this.pluginParams.layers[product].resolutionType;
    ndviFeature._product = product;
    ndviFeature._year = year;
    ndviFeature.catalogData = [];
    ndviFeature._gridName = this.pluginParams.layers[product].grid || "ndvi";

    if (!ndviFeature.divInfo) {
        this.graphDialog.addNDVIFeatureRight(ndviFeature);
    } else {
        ndviFeature.divInfo.divYear.innerHTML = year;
    }

    var that = this;
    ndviFeature.lightUp(ndviFeature._color, function (f) {
        that._loadFeatureCatalogsCallback.call(that, f);
    });

    this.ndviFeatures.push(ndviFeature);
};


/**
 * @param {Object} feature .
 * @param {String} product "MODIS", "HR".
 * @param {Integer} year.
 */
NDVIGraphicsManager.prototype.cloneNDVIFeature = function (ndviFeature, product, year) {

    var nnf = new NDVIFeature(ndviFeature.features)

    nnf._gridName = this.pluginParams.layers[product].grid;
    nnf._resolutionType = this.pluginParams.layers[product].resolutionType;
    nnf._product = product;
    nnf._year = year;
    nnf.catalogData = [];

    this.graphDialog.addNDVIFeatureRight(nnf, ndviFeature.divInfo);

    var that = this;
    nnf.lightUp(nnf._color, function (f) {
        that._loadFeatureCatalogsCallback.call(that, f);
    });

    this.ndviFeatures.push(nnf);
};


NDVIGraphicsManager.prototype.removeNDVIFeatures = function () {
    for (var i = 0; i < this.ndviFeatures.length; i++) {
        this.ndviFeatures[i].clear();
        GraphDialog.removeElement(this.ndviFeatures[i].divInfo);
    }
    this.ndviFeatures.length = 0;
    this.ndviFeatures = [];

    this.graphDialog.onEmptyClick();

    this.clearMap();
};

//формирует запрос поиска пересекаемых полей и снимков из КР
NDVIGraphicsManager.prototype._createIntersectsQuery = function (features) {
    var res = "";
    for (var i = 0; i < features.length; i++) {
        var fi = features[i];
        var prop = fi.attr.layer.getGmxProperties();
        var fidName = prop.identityField;
        res += "intersects([geomixergeojson],GeometryFromVectorLayer('" + prop.LayerID + "'," + fi.obj[fidName] + "))";
        if (i < features.length - 1) {
            res += " or ";
        }
    }
    return res;
};

NDVIGraphicsManager.prototype._loadFeatureCatalogsCallback = function (ndviFeature) {
    //для графиков ndvi
    if (ndviFeature._gridName == "ndvi") {
        var dateColumnName = this.pluginParams.layers[ndviFeature._product].dateColumnName;

        //формируем запрос на пересечение с геометрией
        var query = "year([" + dateColumnName + "])=" + ndviFeature._year.toString() +
            " and (" + this._createIntersectsQuery(ndviFeature.features) + ")";

        var that = this;
        sendCrossDomainPostRequest(window.serverBase + "VectorLayer/Search.ashx", {
            "WrapStyle": "window",
            "layer": that.pluginParams.layers[ndviFeature._product].name,
            "geometry": false,
            "query": query
        }, function (data) {
            var res = data.Result,
                values = res.values,
                fields = res.fields;

            //данные по запросу отсутствуют
            if (values.length == 0) {
                ndviFeature.ready = true;
                ndviFeature.setLoading(false);
                return;
            }

            var features = [];
            for (var i = 0; i < values.length; i++) {
                var vi = values[i];
                var feature = {};
                for (var j = 0; j < fields.length; j++) {
                    var fj = fields[j];
                    var fk = fields.indexOf(fj);
                    feature[fj] = vi[fk];
                }
                features.push(feature);
            }

            //сортируем по дате
            features.sort(function (a, b) {
                return a[dateColumnName] - b[dateColumnName];
            });

            //группируем по годам
            var groupedFeatures = __groupBy(features, function (item) {
                return [item[dateColumnName]];
            });

            for (var i = 0; i < groupedFeatures.length; i++) {
                ndviFeature.catalogData.push({
                    "id": i,
                    "meanNdvi": -1,
                    "valid": 1,
                    "date": new Date(groupedFeatures[i][0][dateColumnName] * 1000),
                    "features": groupedFeatures[i]
                });
            }

            //делаем запрос за средним ndvi
            that._loadFeatureRasterHist(ndviFeature);
        });
    } else {
        //для грфиков температур и осадков        
        var url = 'http://sender.kosmosnimki.ru/cosmosagro/GetNearestGridPoint.ashx?lat=' + ndviFeature._center.lat + '&lon=' + ndviFeature._center.lng + '&limit=1';
        var that = this;
        //получаем список гридов
        $.getJSON(url, function (grids) {

            var url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/11A381497B4A4AE4A4ED6580E1674B72/search?' +
            "query=gridpoint_id IN (" + grids[0].Id + ") AND Date >= '01.01." + ndviFeature._year + "' AND Date < '01.01." + (parseInt(ndviFeature._year) + 1) + "' &" +
            'columns=[{"Value":"gridpoint_id","Alias":"id"},{"Value":"Date"},{"Value":"' + that.pluginParams.layers[ndviFeature._product].valueField + '"}]&orderby=id&api_key=BB3RFQQXTR';

            $.getJSON(url, function (response) {

                ndviFeature.catalogData = response.features;

                //добавляем загруженную информацию на график
                ndviFeature.updateGraphData();
                ndviFeature.ready = true;
                ndviFeature.setLoading(false);
                that.graphDialog.addNDVIFeature(ndviFeature);
            })
        });
    }
};

NDVIGraphicsManager.prototype._loadFeatureRasterHist = function (ndviFeature) {

    var ITEMS_LIMIT = 40;
    var limitsDef = [];
    var catalogData = ndviFeature.catalogData;
    var queriesArr = [];
    var queriesCount = Math.ceil(catalogData.length / ITEMS_LIMIT);

    for (var k = 0; k < queriesCount; k++) {
        queriesArr[k] = {
            "Border": ndviFeature.commonGeometry,
            "BorderSRS": "EPSG:4326",
            "Items": []
        };
    }

    for (var i = 0; i < catalogData.length; i++) {
        var ci = catalogData[i];
        var gmxArr = [];
        for (var j = 0; j < ci.features.length; j++) {
            var fj = ci.features[j];
            //В списке для получения средних значений ndvi должны быть только ndvi снимки
            if (!fj.prodtype || fj.prodtype === this.pluginParams.layers[ndviFeature._product].palette.ndvi.prodtype) {
                gmxArr.push(fj.GMX_RasterCatalogID);
            }
        }
        queriesArr[Math.floor(i / ITEMS_LIMIT)].Items.push({
            "Name": ci.id,
            "Layers": gmxArr,
            "Bands": ["g"],
            "Return": ["Stat"],
            "NoData": [0, 0, 0]
        });
    }

    var that = this;

    for (var i = 0; i < queriesArr.length; i++) {

        var def = new $.Deferred();
        limitsDef[i] = def;

        (function (inDef) {
            sendCrossDomainPostRequest(window.serverBase + 'plugins/getrasterhist.ashx', {
                'WrapStyle': 'window',
                'Request': JSON.stringify(queriesArr[i])
            }, function (data) {
                var res = data.Result;
                for (var i = 0; i < res.length; i++) {
                    var ri = res[i];
                    var meanNdvi;
                    if (that.pluginParams.layers[ndviFeature._product].ndviFunc) {
                        var meanNdvi = that.pluginParams.layers[ndviFeature._product].ndviFunc(ri.Bands.g.Mean);
                    } else {
                        var meanNdvi = (ri.Bands.g.Mean - 1.0) / 100.0;
                    }

                    var catId = parseInt(ri.Name);
                    catalogData[catId].meanNdvi = meanNdvi;
                    catalogData[catId].validSum = ri.ValidPixels / (ri.ValidPixels + ri.NoDataPixels + ri.BackgroundPixels);
                }

                inDef.resolve();
            })
        }(def));
    }

    $.when.apply($, limitsDef).then(function () {
        if (ndviFeature.active) {
            //добавляем загруженную информацию на график
            ndviFeature.updateGraphData();
            ndviFeature.ready = true;
            ndviFeature.setLoading(false);
            that.graphDialog.addNDVIFeature(ndviFeature);
        }
    });
};

/*
==================================
    Раскраска и палтирты слоев
==================================
*/
NDVIGraphicsManager.prototype._applyPalette = function (url, dstCanvas, srcCanvas, shotType, info) {
    //если есть url, значит есть палитра.
    var that = this;
    if (url) {
        this._palettes[url] = this._palettes[url] || shared.loadPaletteSync(url);
        this._palettes[url].then(function (palette) {
            var canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 256;

            var isMODIS = false;
            if (shotType === "MODIS" || shotType === "NDVI_08" || shotType === "NDVI_16") {
                isMODIS = true;
            }


            shared.zoomTile(srcCanvas, info.source.x, info.source.y, info.source.z,
               info.destination.x, info.destination.y, nsGmx.leafletMap.getZoom(),
               dstCanvas,
               function (r, g, b, a) {
                   if (shotType === "MODIS" && !document.getElementById("quality_modis").checked) {
                       r += 101;
                   }
                   var pal = palette[r];
                   if (pal) {
                       return [pal.partRed, pal.partGreen, pal.partBlue, 255];
                   } else {
                       if (r == 0 && g == 0 && b == 0) {
                           return [0, 179, 255, 255];
                       }
                       if (r < 101) {
                           return [0, 0, 0, 255];
                       }
                       if (r > 201) {
                           return [255, 255, 255, 255];
                       }
                       return [0, 0, 0, 255];
                   }
               }, shared.NEAREST);
        });
    }
};

NDVIGraphicsManager.prototype.initializeImageProcessor = function () {
    var layers = this.pluginParams.layers;
    for (var l in layers) {
        var ll = layers[l];
        if (ll.palette && (ll.palette.ndvi || ll.palette.classification)) {
            this.tempLayers[l] && this._setLayerImageProcessing(this.tempLayers[l], l);
        }
    }
};

NDVIGraphicsManager.prototype._setLayerImageProcessing = function (layer, shotType) {
    var that = this;
    layer.setRasterHook(
        function (dstCanvas, srcImage, sx, sy, sw, sh, dx, dy, dw, dh, info) {
            that._tileImageProcessing(dstCanvas, srcImage, sx, sy, sw, sh, dx, dy, dw, dh, info, shotType, layer);
        });
};

NDVIGraphicsManager.prototype._tileImageProcessing = function (dstCanvas, srcImage, sx, sy, sw, sh, dx, dy, dw, dh, info, shotType, layer) {

    var prodType = info.geoItem.properties[layer._gmx.tileAttributeIndexes["prodtype"]],
        layerPalette = this.pluginParams.layers[shotType].palette,
        url;

    if (shotType === "CLASSIFICATION") {
        var n = layerPalette.classification;
        var url = n.url;
        this._applyClassificationPalette(url, dstCanvas, srcImage, info);
    } else {
        if (layerPalette) {
            var q = layerPalette.quality,
                n = layerPalette.ndvi;

            if (prodType === q.prodtype) {
                url = q.url
            } else {
                url = n.url
            }
        }

        this._applyPalette(url, dstCanvas, srcImage, shotType, info);
    }
};

NDVIGraphicsManager.checkGreyImageData = function (data) {
    for (var i = 0; i < data.length; i += 4) {
        if (((data[i] & data[i + 1]) ^ data[i + 2])) {
            return false;
        }
    }
    return true;
};

NDVIGraphicsManager.prototype._applyClassificationPalette = function (url, dstCanvas, srcCanvas, info) {
    this._palettes[url] = this._palettes[url] || shared.loadPaletteSync(url);
    this._palettes[url].then(function (palette) {
        var canvas = document.createElement("canvas");
        var w = 256,
            h = 256;
        canvas.width = w;
        canvas.height = h;
        var context = canvas.getContext('2d');
        context.drawImage(srcCanvas, 0, 0, w, h);
        var imgd = context.getImageData(0, 0, w, h);
        var pix = imgd.data;

        if (NDVIGraphicsManager.checkGreyImageData(pix)) {
            shared.zoomTile(srcCanvas, info.source.x, info.source.y, info.source.z,
               info.destination.x, info.destination.y, nsGmx.leafletMap.getZoom(),
               dstCanvas,
               function (r, g, b, a) {
                   var px = r;
                   var pal = palette[px];
                   if (pal !== undefined) {
                       if (r == 0 && g == 0 && b == 0) {
                           return [0, 179, 255, 255];
                       } else {
                           return [pal.partRed, pal.partGreen, pal.partBlue, 255];
                       }
                   }
                   return [0, 0, 0, 255];
               }, shared.NEAREST);

        } else {
            shared.zoomTile(srcCanvas, info.source.x, info.source.y, info.source.z,
               info.destination.x, info.destination.y, nsGmx.leafletMap.getZoom(),
               dstCanvas, null, shared.NEAREST);
        }
    });
};

NDVIGraphicsManager.prototype.initializeLayers = function () {

    var layers = this.pluginParams.layers;

    for (var l in layers) {

        if (this.tempLayers[l]) continue;

        var sl = NDVIGraphicsManager.layerCollection[this.pluginParams.layers[l].name];

        if (sl) {
            var prop = sl.getGmxProperties();

            var attributes = [],
                attrTypes = [];

            for (var i = 0; i < prop.attributes.length; i++) {
                attributes[i] = prop.attributes[i];
            }

            for (var i = 0; i < prop.attrTypes.length; i++) {
                attrTypes[i] = prop.attrTypes[i];
            }

            this.tempLayers[l] = L.gmx.createLayer({
                "properties": {
                    //"Temporal": true,
                    "IsRasterCatalog": true,
                    "name": "TemporaryLayer",
                    "attrTypes": attrTypes,
                    "attributes": attributes,
                    "hostName": "maps.kosmosnimki.ru",
                    "identityField": "ogc_fid",
                    "mapName": nsGmx.gmxMap.properties.name,
                    //"MinZoom": 0,
                    //"MaxZoom": 14,
                    "type": "Vector",
                    "GeometryType": 'polygon',
                    "RCMinZoomForRasters": 3,
                    "styles": [{
                        "DisableBalloonOnClick": false,
                        "MinZoom": 0,
                        "MaxZoom": 22,
                        "RenderStyle": { outline: { thickness: 0 }, fill: { opacity: 100 } },
                        "HoverStyle": null
                    }],
                }
            });

            this.tempLayers[l].enablePopup();
            var style = sl.getStyles();
            var htmlTemplate = style[0].Balloon;
            this.tempLayers[l].bindPopup(htmlTemplate);

            if (l == "LANDSAT8" || l == "CLASSIFICATION") {
                this.tempLayers[l].addRenderHook(kr_hook);
            }
        }
    }

};



var kr_hook = function (tile, info) {
    var id = info.z + '_' + info.x + '_' + info.y;
    NDVIGraphicsManager.tolesBG[id] = tile;
    tile.style.display = 'none';
    ndviGraphicsManager.repaintSelectedLayers();
};

var l_hook = function (tile, info) {
    var id = info.z + '_' + info.x + '_' + info.y;
    if (NDVIGraphicsManager.tolesBG[id]) {
        tile.getContext('2d').drawImage(NDVIGraphicsManager.tolesBG[id], 0, 0, 256, 256);
    }
};