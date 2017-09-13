/*
=========================================
    WeatherFeature
=========================================
*/
var WeatherFeature = function (stationId, name, distance, latlng, features, color) {

    //индикатор загруженных данных
    this.ready = false;

    this._id = WeatherFeature.staticCounter;
    this._year = null;

    //тип продукта ndvi(HR или MODIS)
    this._product;

    if (color) {
        this._color = color;
    } else if (this._id >= WeatherFeature.colorsArray.length) {
        this._color = shared.getRandomColor();
    } else {
        this._color = WeatherFeature.colorsArray[this._id];
    }

    //здесь хранятся загруженные данные (общей геометрии)
    this.weatherData = [];

    //параметры станции
    this.stationID = stationId || "";
    this.stationDistance = distance || 0;
    this.stationName = name || "";
    this.latLng = latlng || null;

    //выбранные поля
    this.features = features;

    //геометрия загруженных полей
    this.featuresGeometry = [];
    this.commonGeometry = { "type": "MULTIPOLYGON", "coordinates": [] };
    this.extent = [];

    //выбранное поле на карте
    this.selectedMapObjects = [];

    this._featuresDef = [];

    this.graphData = null;
    this.graphData2 = null;

    this._graphDialog = null;

    //видимость на карте и на графике
    this._visibility = true;

    //указатель на dom элемент в панели списка графиков
    this.divInfo = null;

    this.selected = false;

    this.active = false;

    //this._vecLayer = null;

    WeatherFeature.staticCounter++;
};

WeatherFeature.staticCounter = 0;
WeatherFeature.colorsArray = ["#228B22", "#0000ff", "#2f86b8", "#f3cc56", "#53912a", "#22d0ce", "#d467d3", "#a0eabd", "#e6e567", "#ec6857", "#3a3aee", "#9b48ef", "#e827a1", "#a2d123", "#e9874c", "#205416"];

WeatherFeature.prototype.remove = function () {
    if (WeatherFeature.staticCounter > 0)
        WeatherFeature.staticCounter--;
    this.clear();
    this.divInfo && GraphDialog.removeElement(this.divInfo);
};

//удаление ndviFeature с карты и графика
WeatherFeature.prototype.clear = function () {

    this.active = false;

    //if (WeatherFeature.staticCounter > 0)
    //    WeatherFeature.staticCounter--;

    if (this.selected) {
        this._graphDialog.onEmptyClick();
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
    if (this.graphData && this._graphDialog) {
        this._graphDialog.removeWeatherFeature(this);
    }
    this.graphData = null;
    this.graphData2 = null;
    this._graphDialog = null;

    //чистим локальные данные
    this.weatherData = [];
    this.stationName = "";
    this._color = "#FF0000";
};

WeatherFeature.prototype.setLoading = function (loading) {
    //if (loading) {
    //    this.divInfo.colorDiv.innerHTML = "";
    //    this.divInfo.colorDiv.classList.add("ndvigraphics-graphinfo-loading");
    //} else {
    //    this.divInfo.colorDiv.classList.remove("ndvigraphics-graphinfo-loading");
    //    this.divInfo.colorDiv.innerHTML = '<div class="ndvigraphics-circle" style="background-color:' +
    //        this._color + '; border-color:' + this._color + '"></div>';
    //}
};


WeatherFeature.prototype.lightUp = function (color, callback) {

    this.setLoading(true);

    //this.clear();
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

WeatherFeature.prototype.setLighting = function (lighting) {
    if (lighting) {
        for (var i = 0; i < this.selectedMapObjects.length; i++) {
            this.selectedMapObjects[i].setStyle({
                color: this._color,
                weight: 3,
                opacity: 1.0,
                fillColor: this._color,
                fillOpacity: 0.3
            });
            this.selectedMapObjects[i].addTo(nsGmx.leafletMap);
        }
    } else {
        this.setColor(this._color);
    }
};

WeatherFeature.prototype.setColor = function (color) {

    this._color = color;

    //перерисовываем на карте
    for (var i = 0; i < this.selectedMapObjects.length; i++) {
        this.selectedMapObjects[i].setStyle({
            color: color,
            weight: 3,
            opacity: 0,
            fillOpacity: 0
        });
        nsGmx.leafletMap.removeLayer(this.selectedMapObjects[i]);
    }

    if (this.graphData) {
        this.graphData.color = color;
        //this.divInfo.colorDiv.children[0].style.borderColor = color;
        this.graphData.points.fillColor = color;
        //this.divInfo.colorDiv.children[0].style.backgroundColor = color;

        if (this.graphData2) {
            this.graphData2.color = color;
            //this.divInfo.colorDiv.children[0].style.borderColor = color;
            this.graphData2.points.fillColor = color;
            //this.divInfo.colorDiv.children[0].style.backgroundColor = color;
        }

        this._graphDialog.refresh();
    }
};

WeatherFeature.prototype.setVisibility = function (visibility) {
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
        this.graphData2.points.show = this.graphData2.lines.show = visibility;
        this._graphDialog.refresh();

        //
        // ...возможно включение выключение выбранного снимка на карте
        //
    }
};

WeatherFeature.prototype.updateGraphData = function () {

    // var oldLength = this.weatherData.length;
    //удаляем данные с NaN value
    //for (var i = 0; i < this.weatherData.length; i++) {
    //    var ci = this.weatherData[i];
    //    if (isNaN(ci.value) || ci.value == null || ci.value == undefined) {
    //        this.weatherData.splice(i, 1);
    //        i--;
    //    }
    //}

    //переиндексируем
    //if (oldLength > this.weatherData.length) {
    //    for (var i = 0; i < this.weatherData.length; i++) {
    //        this.weatherData[i].id = i;
    //    }
    //}

    //заполняем данные для отображения графиков
    var data = [];
    var data2 = [];
    for (var i = 0; i < this.weatherData.length; i++) {
        var ci = this.weatherData[i];
        var date2000 = new Date("2000", ci.date.getMonth(), ci.date.getDate()).getTime();
        var value = ci.value;
        var value2 = ci.value2;
        if (value <= 0)
            value = 0;

        if (value != null && value != undefined)
            data.push([date2000, value]);

        if (value2 != null && value2 != undefined)
            data2.push([date2000, value2]);
    }

    this.graphData = {
        "data": data,
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
            "radius":2,
            "show": true
        },
        "properties": {
            "weatherFeature": this
        }
    }

    this.graphData2 = {
        "data": data2,
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
        "properties": {
            "weatherFeature": this
        }
    }
};

WeatherFeature.formatDate = function (d, m, y) {
    return WeatherFeature.strpad(d.toString(), 2) + '.' +
        WeatherFeature.strpad(m.toString(), 2) + '.' +
        WeatherFeature.strpad(y.toString(), 4);
}

WeatherFeature.strpad = function (str, len) {
    if (typeof (len) == "undefined") { var len = 0; }
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join("0") + str;
    }
    return str;
};

WeatherFeature.addDays = function (date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
};

WeatherFeature.equalDates = function (d1, d2) {
    return d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear();
};

WeatherFeature.prototype.getWeatherData = function (date) {
    var c = this.weatherData;
    for (var i = 0; i < c.length; i++) {
        var ci = c[i];
        if (WeatherFeature.equalDates(date, ci.date)) {
            return ci;
        }
    }
    return null;
};

WeatherFeature.prototype.importCSV = function () {
    var str = "Day;Date;" + this._product + "%0A";
    var beginDate = new Date(parseInt(this._year), 0, 1);
    var endDate = new Date(parseInt(this._year) + 1, 0, 1);
    var currDate = new Date(parseInt(this._year), 0, 1);
    var i = 0;

    do {
        var currDateStr = WeatherFeature.formatDate(currDate.getDate(), currDate.getMonth() + 1, currDate.getFullYear());
        var c = this.getWeatherData(currDate);
        var val = (c ? c.value.toString() : "");
        str += (i + 1) + ";" + currDateStr + ";" + val + "%0A";
        i++;
        currDate = WeatherFeature.addDays(beginDate, i);
    } while (currDate < endDate);

    var a = document.createElement('a');
    a.href = 'data:attachment/csv,' + str;
    a.target = '_blank';
    a.download = this._product + '_' + this._year + '.csv';
    document.body.appendChild(a);
    a.click();
};