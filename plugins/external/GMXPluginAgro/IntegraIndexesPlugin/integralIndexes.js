var IntegralIndexes = function () {
    this.datedYear = 2000;
    this.currentYear = 2014;
    this.day = 10;
    this.month = 9;

    this._rkDef = null;
    this._currRKs = [];

    this._tilesAjQueues = [];
    this._currentFilename = "";
    this._visibility = false;

    this._defFn = null;

    this._onMoveEndListener = null;

    this._itemsIDToRemove = [];
    this._tempLayer = null;
};

// максимальный разброс дней даты снимка
IntegralIndexes.dayAccuracy = 4;

IntegralIndexes.externalMap = { "host": "maps.kosmosnimki.ru", "name": "PLDYO" };
IntegralIndexes.ndviLayer = { "name": "3AD0B4A220D349848A383D828781DF4C", "dateColumnName": "ninthday", "prodtypeColumnName": "prodtype", "prodtype": "NDVI16" };

IntegralIndexes.prototype.createTempLayer = function () {
    var prop = {
        "properties": {
            "IsRasterCatalog": true,
            "name": "TemporaryLayer",
            "attrTypes": ["string"],
            "attributes": ["GMX_RasterCatalogID"],
            "hostName": "maps.kosmosnimki.ru",
            "identityField": "ogc_fid",
            "mapName": "PPIDH",
            "MinZoom": 0,
            "MaxZoom": 14
        }
    };

    var style = {
        "outline": { color: 0x000000, thickness: 0, opacity: 0 }
    };

    this._tempLayer = gmxAPI.map.addLayer(prop);
    this._tempLayer.setVisible(true);
    this._tempLayer.setStyle(style);
    this._tempLayer.disableHoverBalloon();

    this.setLayerImageProcessing();
};

IntegralIndexes.prototype.clearTempLayer = function () {
    if (this._tempLayer) {
        this._tempLayer.removeItems(this._itemsIDToRemove);
        this._tempLayer.setVisible(false);
        this._itemsIDToRemove.length = 0;
        this._itemsIDToRemove = [];
    }
};

IntegralIndexes.prototype.showTempLayer = function (idArr, geometry) {
    var items = [];
    for (var i = 0; i < idArr.length; i++) {
        var id = 0 + i;
        var item = {
            "id": id,
            "properties": { "GMX_RasterCatalogID": idArr[i] },
            "geometry": geometry
        };
        items.push(item);
        this._itemsIDToRemove.push(id);
    }
    this._tempLayer.addItems(items);
    this._tempLayer.setVisible(false);
};

IntegralIndexes.prototype.setCurrentDate = function (day, month, currYear) {
    this.day = day;
    this.month = month;
    this.currentYear = currYear;
};

IntegralIndexes.prototype.setDatedYear = function (datedYear) {
    this.datedYear = datedYear;
};

IntegralIndexes.prototype.setVisibleFilename = function (filename, date) {
    this._currentFilename = filename;

    if (!this._tempLayer) {
        this.createTempLayer();
    }

    this.clearTempLayer();

    if (filename.length) {

        this._defFn = new $.Deferred();
        this._rkDef = new $.Deferred();

        var that = this;

        if (date) {
            this.setCurrentDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
            this.onMoveEnd(function () {
                if (that._tempLayer) {
                    that._tempLayer.setVisibile(true);
                }
            });
            this._defFn.resolve();
        } else {
            var q = ("[filename]='" + filename + "'");
            sendCrossDomainPostRequest(window.serverBase + "VectorLayer/Search.ashx", {
                'query': q,
                'geometry': true,
                'layer': IntegralIndexes.ndviLayer.name,
                'WrapStyle': "window"
            }, function (result) {
                var res = result.Result;
                var dateIndex = res.fields.indexOf(IntegralIndexes.ndviLayer.dateColumnName);
                var date = new Date(res.values[0][dateIndex] * 1000);

                var gmxIDindex = res.fields.indexOf("GMX_RasterCatalogID");
                var gmxID = res.values[0][gmxIDindex];

                that.setCurrentDate(date.getDate(), date.getMonth() + 1, date.getFullYear());

                that._defFn.resolve();

                var idArr = [gmxID];

                that.showTempLayer(idArr, gmxAPI.from_merc_geometry(res.values[0][res.values[0].length - 1]));

                that.onMoveEnd(function () {
                    that._tempLayer.setVisible(true);
                });
            });
        }
    }
};

IntegralIndexes.prototype.setVisibility = function (visibility) {
    this._visibility = visibility;
    if (this._tempLayer) {
        this._tempLayer.setVisible(visibility);
    }
};

IntegralIndexes.getBorder = function () {
    var ext = gmxAPI._leaflet.LMap.getBounds();
    return {
        "type": "POLYGON",
        "coordinates":
            [[[gmxAPI.merc_x(ext._southWest.lng), gmxAPI.merc_y(ext._southWest.lat)],
             [gmxAPI.merc_x(ext._southWest.lng), gmxAPI.merc_y(ext._northEast.lat)],
             [gmxAPI.merc_x(ext._northEast.lng), gmxAPI.merc_y(ext._northEast.lat)],
             [gmxAPI.merc_x(ext._northEast.lng), gmxAPI.merc_y(ext._southWest.lat)],
             [gmxAPI.merc_x(ext._southWest.lng), gmxAPI.merc_y(ext._southWest.lat)]]]
    };
};

IntegralIndexes.prototype.onMoveEnd = function (callback) {
    var that = this;

    var startDay = this.day - IntegralIndexes.dayAccuracy,
        endDay = this.day + IntegralIndexes.dayAccuracy;

    //var q = ("(year([" + IntegralIndexes.ndviLayer.dateColumnName + "])>='" + this.datedYear.toString() +
    //    "')AND(year([" + IntegralIndexes.ndviLayer.dateColumnName + "])<='" + this.currentYear.toString() +
    //    "')AND(day([" + IntegralIndexes.ndviLayer.dateColumnName + "])>='" + startDay.toString() +
    //    "')AND(day([" + IntegralIndexes.ndviLayer.dateColumnName + "])<='" + endDay.toString() +
    //    "')AND(month([" + IntegralIndexes.ndviLayer.dateColumnName + "])='" + this.month.toString() +
    //    "')AND([filename]<>'" + this._currentFilename + "')") +
    //    (IntegralIndexes.ndviLayer.prodtypeColumnName ? ("AND([" + IntegralIndexes.ndviLayer.prodtypeColumnName + "]='" + IntegralIndexes.ndviLayer.prodtype + "')") : "");

    this.datedYear = 2000;

    var q = ("(year([" + IntegralIndexes.ndviLayer.dateColumnName + "])>='" + this.datedYear.toString() +
            "')AND(year([" + IntegralIndexes.ndviLayer.dateColumnName + "])<='" + "2014" +
            "')AND(day([" + IntegralIndexes.ndviLayer.dateColumnName + "])>='" + startDay.toString() +
            "')AND(day([" + IntegralIndexes.ndviLayer.dateColumnName + "])<='" + endDay.toString() +
            "')AND(month([" + IntegralIndexes.ndviLayer.dateColumnName + "])='" + this.month.toString() +
            "')AND([filename]<>'" + this._currentFilename + "')") +
            (IntegralIndexes.ndviLayer.prodtypeColumnName ? ("AND([" + IntegralIndexes.ndviLayer.prodtypeColumnName + "]='" + IntegralIndexes.ndviLayer.prodtype + "')") : "");

    sendCrossDomainPostRequest(window.serverBase + "VectorLayer/Search.ashx", {
        'border': JSON.stringify(IntegralIndexes.getBorder()),
        'query': q,
        'geometry': false,
        'layer': IntegralIndexes.ndviLayer.name,
        'WrapStyle': "window"
    }, function (result) {
        var res = result.Result;
        var index = res.fields.indexOf("GMX_RasterCatalogID");
        that._currRKs.length = 0;
        for (var i = 0; i < res.values.length; i++) {
            that._currRKs.push(res.values[i][index]);
        }
        that._rkDef.resolve(that._currRKs);

        if (callback)
            callback.call(that);
    });
};

IntegralIndexes.prototype.setMoveHandler = function () {
    if (!this._onMoveEndListener) {
        var that = this;
        this._onMoveEndListener = gmxAPI.map.addListener("onMoveEnd", function (arg) {

            that.clear();
            that._rkDef = new $.Deferred();

            that._defFn.then(function () {
                that.onMoveEnd();
            });
        });
    }
};

IntegralIndexes.prototype.removeMoveHandler = function () {
    if (this._onMoveEndListener) {
        gmxAPI.map.removeListener("onMoveEnd", this._onMoveEndListener);
        this._onMoveEndListener = null;
    }
};

IntegralIndexes.prototype.clear = function () {

    if (this._rkDef)
        this._rkDef.reject();

    for (var i = 0; i < this._tilesAjQueues.length; i++) {
        this._tilesAjQueues[i].clear();
    }
};

IntegralIndexes.getPixelsFromImage = function (img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var imgd = ctx.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
    return pix;
};

IntegralIndexes.putPixelsToCanvas = function (canvas, data) {
    var context = canvas.getContext('2d');
    var imageData = context.createImageData(canvas.width, canvas.height);
    imageData.data.set(data);
    context.putImageData(imageData, 0, 0);
};

IntegralIndexes.prototype.setLayerImageProcessing = function () {
    var that = this;
    this._tempLayer.addImageProcessingHook(
        function (canvasObj, attr) {

            that._rkDef.then(function (list) {

                var tilesQueue = new AjQueue();
                that._tilesAjQueues.push(tilesQueue)


                var dZ = gmxAPI.map.getZ() - attr.from.z;
                var dZ2 = Math.pow(2, dZ);
                var currSize = 256 / dZ2;

                var offsetX = (attr.tpx - attr.from.x * dZ2) * currSize,
                    offsetY = (dZ2 - 1 - (attr.tpy - attr.from.y * dZ2)) * currSize;

                //prepare tiles requests for this tile
                var requests = [];
                for (var i = 0; i < list.length; i++) {
                    requests.push({
                        'x': attr.from.x,
                        'y': attr.from.y,
                        'z': attr.from.z,
                        "layerName": list[i],
                        "tileSenderPrefix": that._tempLayer.tileSenderPrefix.substr(0, that._tempLayer.tileSenderPrefix.indexOf("&LayerName="))
                    })
                }

                var NDVImin = [],
                    NDVImax = [];

                for (var i = 0; i < 256 * 256; i++) {
                    NDVImin[i] = 100000000;
                    NDVImax[i] = -100000000;
                }

                tilesQueue.initialize(requests, that,
                    function (img) {
                        //another one tile has loaded, store the pixels

                        if (img) {

                            var pix = IntegralIndexes.getPixelsFromImage(img);

                            for (var i = 0, j = 0; i < pix.length; i += 4, j++) {
                                //pix[i] = 0 - nodata
                                if (pix[i]) {
                                    var ndvi = (pix[i] - 1) * 0.01;
                                    if (ndvi > NDVImax[j])
                                        NDVImax[j] = ndvi;
                                    if (ndvi < NDVImin[j])
                                        NDVImin[j] = ndvi;
                                }
                            }
                        }

                    }, function () {
                        //all tiles have loaded

                        var xNDVImax = [];
                        var xNDVImin = [];

                        var segSize = Math.floor(256 / currSize);

                        //zoomify tiling
                        for (var i = 0; i < 256; i++) {
                            var ix = offsetY + Math.floor(i / segSize);
                            for (var j = 0; j < 256; j++) {
                                var jx = offsetX + Math.floor(j / segSize);
                                var ind = ix * 256 + jx;
                                xNDVImax.push(NDVImax[ind]);
                                xNDVImin.push(NDVImin[ind]);
                            }
                        }

                        var currPix = IntegralIndexes.getPixelsFromImage(attr.from.img);
                        var pix = [];

                        for (var i = 0; i < 256; i++) {
                            for (var j = 0; j < 256; j++) {
                                var currInd = ((Math.floor(i / dZ2) + offsetY) * 256 + Math.floor(j / dZ2) + offsetX) * 4;
                                var k = i * 256 + j;
                                var ind = k * 4;
                                pix[ind] = currPix[currInd];
                                pix[ind + 1] = currPix[currInd + 1];
                                pix[ind + 2] = currPix[currInd + 2];
                                pix[ind + 3] = currPix[currInd + 3];

                                //isn't black - no data
                                if (pix[ind] != 0) {
                                    var NDVIi = (pix[ind] - 1) * 0.01;

                                    //учтем текущее значение ndvi для минимаксимума
                                    if (NDVIi > xNDVImax[k])
                                        xNDVImax[k] = NDVIi;

                                    if (NDVIi < xNDVImin[k])
                                        xNDVImin[k] = NDVIi;

                                    var VCI = ((NDVIi - xNDVImin[k]) / (xNDVImax[k] - xNDVImin[k])) * 100;

                                    //if (VCI < 30) {
                                    //    pix[ind] = 255;
                                    //    pix[ind + 1] = 0;
                                    //    pix[ind + 2] = 0;
                                    //} else if (VCI >= 30 && VCI < 70) {
                                    //    pix[ind] = 255;
                                    //    pix[ind + 1] = 255;
                                    //    pix[ind + 2] = 0;
                                    //} else if (VCI >= 70 && VCI <= 100) {
                                    //    pix[ind] = 0;
                                    //    pix[ind + 1] = 255;
                                    //    pix[ind + 2] = 0;
                                    //} else {
                                    //    //VCI > 100
                                    //    pix[ind] = 255;
                                    //    pix[ind + 1] = 255;
                                    //    pix[ind + 2] = 0;
                                    //}

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
                                        pix[ind] = 0;
                                        pix[ind + 1] = 0;
                                        pix[ind + 2] = 0;
                                    }

                                    pix[ind] = r;
                                    pix[ind + 1] = g;
                                    pix[ind + 2] = b;

                                } else {
                                    pix[i] = pix[i + 1] = pix[i + 2] = 0;
                                }
                            }
                        }

                        var canvas = document.createElement("canvas");
                        canvas.width = 256;
                        canvas.height = 256;
                        IntegralIndexes.putPixelsToCanvas(canvas, pix);

                        setTimeout(function () {
                            attr.callback(canvas);
                        }, 0);
                    });

                tilesQueue.start();

            });
        });
};