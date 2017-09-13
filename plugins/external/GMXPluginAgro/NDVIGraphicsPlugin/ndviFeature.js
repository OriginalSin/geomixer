/*
=========================================
    NDVIFeature
=========================================
*/
var NDVIFeature = function (features, color) {

    //индикатор загруженных данных
    this.ready = false;

    this._id = NDVIFeature.staticCounter++;
    this._year = null;

    //тип продукта ndvi(HR или MODIS)
    this._product;
    this._resolutionType = null;
    this._gridName = null;

    if (color) {
        this._color = color;
    } else if (NDVIFeature.staticCounter >= NDVIFeature.colorsArray.length) {
        this._color = shared.getRandomColor();
    } else {
        this._color = NDVIFeature.colorsArray[NDVIFeature.staticCounter];
    }

    //здесь хранятся загруженные данные снимков NDVI выбранных полей(общей геометрии)
    this.catalogData = [];

    //выбранные поля
    this.features = features;

    //геометрия загруженных полей
    this.featuresGeometry = [];
    this.commonGeometry = { "type": "MULTIPOLYGON", "coordinates": [] };
    this.extent = [];

    //выбранное поле на карте
    this.selectedMapObjects = [];

    this._featuresDef = [];

    //данные для графика plot
    this.graphData = null;

    //координатная сетка
    this._graphGrid = null;

    //видимость на карте и на графике
    this._visibility = true;

    //указатель на dom элемент в панели списка графиков
    this.divInfo = null;

    this.selected = false;

    this.active = false;

    NDVIFeature.staticCounter++;

    this._vecLayer = null;

    this._center = null;
};

NDVIFeature.staticCounter = 0;
NDVIFeature.colorsArray = ["#228B22", "#0000ff", "#2f86b8", "#f3cc56", "#53912a", "#22d0ce", "#d467d3", "#a0eabd", "#e6e567", "#ec6857", "#3a3aee", "#9b48ef", "#e827a1", "#a2d123", "#e9874c", "#205416"];

NDVIFeature.staticCounter = 0;

//удаление ndviFeature с карты и графика
NDVIFeature.prototype.clear = function () {

    this.active = false;

    if (NDVIFeature.staticCounter > 0)
        NDVIFeature.staticCounter--;

    if (this.selected) {
        this._graphGrid._gridDialog.onEmptyClick();
    }
    this.selected = false;
    this.ready = false;

    //удаляем загрузки
    for (var i = 0; i < this._featuresDef.length; i++) {
        if (this._featuresDef[i]) {
            this._featuresDef[i].reject();
        }
    }
    this._featuresDef = [];

    //убираем с карты
    for (var i = 0; i < this.selectedMapObjects.length; i++) {
        if (this.selectedMapObjects[i]) {
            //this.selectedMapObjects[i].remove();
            nsGmx.leafletMap.removeLayer(this.selectedMapObjects[i]);
            this.featuresGeometry[i] = null;
        }
    }
    this.selectedMapObjects = [];
    this.featuresGeometry = [];
    this.commonGeometry = { "type": "MULTIPOLYGON", "coordinates": [] };
    this.bounds = [];

    //удаляем из графиков
    if (this.graphData && this._graphGrid) {
        this._graphGrid.removeNDVIFeature(this);
    }
    this.graphData = null;
    this._graphGrid = null;

    //чистим локальные данные
    this.catalogData = [];
    this._color = "#FF0000";
};

NDVIFeature.prototype.setLoading = function (loading) {
    if (loading) {
        this.divInfo.colorDiv.innerHTML = "";
        this.divInfo.colorDiv.classList.add("ndvigraphics-graphinfo-loading");
    } else {
        this.divInfo.colorDiv.classList.remove("ndvigraphics-graphinfo-loading");
        this.divInfo.colorDiv.innerHTML = '<div class="ndvigraphics-circle" style="background-color:' +
            (this._resolutionType == "MODIS" ? "#FFF" : this._color) + '; border-color:' + this._color + '"></div>';
    }
};


NDVIFeature.prototype.lightUp = function (color, callback) {

    this.setLoading(true);

    this.clear();
    this.active = true;

    this._color = color;

    //загружаем
    var that = this;
    for (var i = 0; i < this.features.length; i++) {
        (function (featureIndex) {
            that._featuresDef[featureIndex] = new $.Deferred();
            var fi = that.features[featureIndex];

            var fidName = fi.attr.layer.getGmxProperties().identityField;
            var fid = fi.obj[fidName];
            var url = window.serverBase + "/VectorLayer/Search.ashx?WrapStyle=func" +
                      "&layer=" + fi.attr.layer.getGmxProperties().LayerID +
                      "&geometry=true&query=[" + fidName + "]=" + fid;

            sendCrossDomainJSONRequest(url, function (response) {
                var res = response.Result;

                //сохраняем геометрию, она еще пригодится
                if (res.values.length) {
                    that.featuresGeometry[featureIndex] = oldAPI.from_merc_geometry(res.values[0][res.fields.indexOf("geomixergeojson")]);
                }

                var geom = L.gmxUtil.geometryToGeoJSON(res.values[0][res.fields.indexOf("geomixergeojson")], true);
                that.selectedMapObjects[featureIndex] = L.geoJson(geom);
                that.selectedMapObjects[featureIndex].properties = fi.obj;

                if (that._featuresDef[featureIndex]) {
                    that._featuresDef[featureIndex].resolve();
                }
            });
        }(i));
    }

    //выполняется по завершению загрузок
    $.when.apply($, this._featuresDef).then(function () {

        that._center = that._calcCenter();

        //зажигаем поля и делаем общую геометрию
        for (var i = 0; i < that.featuresGeometry.length; i++) {
            var geom = that.featuresGeometry[i];
            //that.selectedMapObjects[i].setGeometry(geom);

            //that.selectedMapObjects[i].addTo(nsGmx.leafletMap);
            that.selectedMapObjects[i].setStyle({
                color: color || "#0000FF",
                weight: 3,
                opacity: 0,
                fillOpacity: 0
            });

            if (that.featuresGeometry[i].type == "POLYGON") {
                //POLYGON
                that.commonGeometry.coordinates.push(geom.coordinates);
            } else {
                //MULTIPOLYGON
                for (var j = 0; j < geom.coordinates.length; j++) {
                    that.commonGeometry.coordinates.push(geom.coordinates[j]);
                }
            }
        }

        callback && callback(that);
    });
};

NDVIFeature.prototype.getCenter = function () {
    return this._center;
};

NDVIFeature.prototype._calcCenter = function () {
    var minLon = 1000000000, minLat = 1000000000,
        maxLon = -1000000000, maxLat = -1000000000;
    for (var i = 0; i < this.featuresGeometry.length; i++) {
        var fi = this.featuresGeometry[i];
        var coords = fi.coordinates;
        if (fi.type == "POLYGON") {
            coords = coords[0];
            for (var j = 0; j < coords.length; j++) {
                var ll = coords[j];
                if (ll[0] > maxLon) maxLon = ll[0];
                if (ll[1] > maxLat) maxLat = ll[1];
                if (ll[0] < minLon) minLon = ll[0];
                if (ll[1] < minLat) minLat = ll[1];
            }
        } else if (fi.type == "MULTIPOLYGON") {
            for (var j = 0; j < coords.length; j++) {
                var cj = coords[j][0];
                for (var k = 0; k < cj.length; k++) {
                    var ll = cj[k];
                    if (ll[0] > maxLon) maxLon = ll[0];
                    if (ll[1] > maxLat) maxLat = ll[1];
                    if (ll[0] < minLon) minLon = ll[0];
                    if (ll[1] < minLat) minLat = ll[1];
                }
            }
        }
    }

    return new L.LatLng(minLat + 0.5 * (maxLat - minLat), minLon + 0.5 * (maxLon - minLon));
};

NDVIFeature.prototype.setLighting = function (lighting) {
    if (lighting) {
        for (var i = 0; i < this.selectedMapObjects.length; i++) {
            this.selectedMapObjects[i].setStyle({
                color: this._color,
                weight: 3,
                opacity: 1.0,
                fillColor: this._color,
                fillOpacity: 0.3
                //outline: { color: this._color, thickness: 3, opacity: 100 },
                //fill: { color: this._color, opacity: 30 },
            });
            this.selectedMapObjects[i].addTo(nsGmx.leafletMap);
        }
    } else {
        this.setColor(this._color);
    }
};

NDVIFeature.prototype.setColor = function (color) {

    this._color = color;

    //перерисовываем на карте
    for (var i = 0; i < this.selectedMapObjects.length; i++) {
        this.selectedMapObjects[i].setStyle({
            color: color,
            weight: 3,
            opacity: 0,
            fillOpacity: 0
            //outline: { color: color, thickness: 3, opacity: 0 }
        });
        nsGmx.leafletMap.removeLayer(this.selectedMapObjects[i]);
    }

    if (this.graphData) {
        this.graphData.color = color;
        this.divInfo.colorDiv.children[0].style.borderColor = color;
        if (this._resolutionType == "LANDSAT") {
            this.graphData.points.fillColor = color;
            this.divInfo.colorDiv.children[0].style.backgroundColor = color;
        }
        this._graphGrid.refresh();
    }
};

NDVIFeature.prototype.setVisibility = function (visibility) {
    if (visibility != this._visibility) {
        this._visibility = visibility;

        //включаем или выключаем контур выделения на карте
        for (var i = 0; i < this.selectedMapObjects.length; i++) {
            //this.selectedMapObjects[i].setVisible(visibility);
            if (visibility) {
                nsGmx.leafletMap.addLayer(this.selectedMapObjects[i]);
            } else {
                nsGmx.leafletMap.removeLayer(this.selectedMapObjects[i]);
            }
        }

        //включаем или выключаем на графике
        this.graphData.points.show = this.graphData.lines.show = visibility;
        this._graphGrid.refresh();

        //
        // ...возможно включение выключение выбранного снимка на карте
        //
    }
};

NDVIFeature.prototype.updateGraphData = function () {

    //данные для NDVI
    if (this._gridName == "ndvi") {
        var oldLength = this.catalogData.length;
        //удаляем данные с validSum < 0.33
        for (var i = 0; i < this.catalogData.length; i++) {
            var ci = this.catalogData[i];
            if (ci.validSum < 0.33 || isNaN(ci.validSum)) {
                this.catalogData.splice(i, 1);
                i--;
            }
        }

        //переиндексируем
        if (oldLength > this.catalogData.length) {
            for (var i = 0; i < this.catalogData.length; i++) {
                this.catalogData[i].id = i;
            }
        }

        //заполняем данные для отображения графиков
        var data = [];
        for (var i = 0; i < this.catalogData.length; i++) {
            var ci = this.catalogData[i];
            var date2000 = new Date("2000", ci.date.getMonth(), ci.date.getDate()).getTime();
            var value = ci.meanNdvi;
            if (value <= 0)
                value = 0;
            data.push([date2000, value]);
        }

        this.graphData = {
            "data": data,
            "color": this._color,
            "label": this._product,
            "lines": {
                "fillColor": this._color,
                "lineWidth": this._resolutionType == "LANDSAT" ? 2 : 1,
                "show": true
            },
            "points": {
                "fill": true,
                "fillColor": this._resolutionType == "LANDSAT" ? this._color : "#FFFFFF",
                "lineWidth": this._resolutionType == "LANDSAT" ? 2 : 1,
                "show": true
            },
            "properties": {
                "ndviFeature": this
            }
        }
    } else {

        this.graphData = {
            "data": [],
            "color": this._color,
            "label": this._product,
            "lines": {
                "fillColor": this._color,
                "lineWidth": 1,
                "show": true
            },
            "points": {
                "fill": true,
                "fillColor": this._color,
                "lineWidth": 1,
                "radius": 2,
                "show": true
            },
            "properties": { "id": this.catalogData[0].properties.id, "year": this._year, "data": [], "ndviFeature": this }
        };

        for (var k = 0; k < this.catalogData.length; k++) {
            var fk = this.catalogData[k].properties;
            var date = fk.Date;
            var year = date.split("-")[0];
            var month = date.split("-")[1];
            var day = date.split("-")[2];
            fk.Date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            fk.Date2000 = new Date(2000, parseInt(month) - 1, parseInt(day));
        }

        this.catalogData.sort(function (a, b) {
            if (a.properties.Date > b.properties.Date)
                return 1;
            else
                return -1;
        });

        //Данные для погоды
        for (var k = 0; k < this.catalogData.length; k++) {
            var fk = this.catalogData[k].properties;
            this.graphData.properties.data.push(fk);
            this.graphData.data.push([fk.Date2000.getTime(), fk.AvgTemp]);
        }
    }
};

NDVIFeature.formatDate = function (d, m, y) {
    return NDVIFeature.strpad(d.toString(), 2) + '.' +
        NDVIFeature.strpad(m.toString(), 2) + '.' +
        NDVIFeature.strpad(y.toString(), 4);
}

NDVIFeature.strpad = function (str, len) {
    if (typeof (len) == "undefined") { var len = 0; }
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join("0") + str;
    }
    return str;
};

NDVIFeature.addDays = function (date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
};

NDVIFeature.equalDates = function (d1, d2) {
    return d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear();
};

NDVIFeature.prototype.getCatalogData = function (date) {
    var c = this.catalogData;
    for (var i = 0; i < c.length; i++) {
        var ci = c[i];
        if (NDVIFeature.equalDates(date, ci.date)) {
            return ci;
        }
    }
    return null;
};

NDVIFeature.prototype.importCSV = function () {
    var str = "Day;Date;NDVI%0A";
    var beginDate = new Date(parseInt(this._year), 0, 1);
    var endDate = new Date(parseInt(this._year) + 1, 0, 1);
    var currDate = new Date(parseInt(this._year), 0, 1);
    var i = 0;

    do {
        var currDateStr = NDVIFeature.formatDate(currDate.getDate(), currDate.getMonth() + 1, currDate.getFullYear());
        var c = this.getCatalogData(currDate);
        var ndvi = (c ? c.meanNdvi.toString() : "");
        str += (i + 1) + ";" + currDateStr + ";" + ndvi + "%0A";
        i++;
        currDate = NDVIFeature.addDays(beginDate, i);
    } while (currDate < endDate);

    var a = document.createElement('a');
    a.href = 'data:attachment/csv,' + str;
    a.target = '_blank';
    a.download = this._product + '_' + this._year + '.csv';
    document.body.appendChild(a);
    a.click();
};