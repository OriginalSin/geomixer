/*
=======================================================
    WeatherGraphicsManager
=======================================================
*/
var WeatherGraphicsManager = function (params) {
    //параметры плагина
    this.pluginParams = params;

    this._dialog = new GraphDialog();
    this.graphDialog = new WeatherGraphicsDialog(this._dialog, params);
    this.initDialogEvents();

    //массив id'шников для удаления с карты
    this._removeItems = [];

    //хранилище ndviFeatures
    this.weatherFeatures = [];

    //слои карты
    this.layerCollection = {};

    this.initialize();

    this.weatherYearStationData = {};
    this.weatherYearGridData = {};

    this._yearsFilter = [2016];
    this.selectedWeatherFeature = null;
};

WeatherGraphicsManager.prototype.updateYearsFilter = function () {
    //if (this._yearsFilter.length == 0) {
    //    for (var i = 0; i < this.weatherFeatures.length; i++) {
    //        this.weatherFeatures[i].divInfo.style.display = "block";
    //    }
    //} else {
    //    for (var i = 0; i < this.weatherFeatures.length; i++) {
    //        var wf = this.weatherFeatures[i];
    //        if (this._yearsFilter.indexOf(wf._year) != -1) {
    //            wf.divInfo.style.display = "block";
    //        } else {
    //            wf.divInfo.style.display = "none";
    //        }
    //    }
    //}

    this.updateSelectedStationVisibility();
    this.graphDialog.refresh();

    var f = (this.selectedWeatherFeature ? this.selectedWeatherFeature.features[0] : this.weatherFeatures[0].features[0]);
    for (var i = 0; i < this._yearsFilter.length; i++) {
        var y = this._yearsFilter[i];
        if (!weatherGraphicsManager.weatherYearStationData[y]) {
            this.loadWeatherFeatures([y], f, "PRECIP");
        }
    }
};

WeatherGraphicsManager.prototype.setYearsFilter = function (yearsArr) {
    this._yearsFilter = yearsArr;
    this.updateYearsFilter();
};

WeatherGraphicsManager.prototype.updateSelectedStationVisibility = function () {
    if (this.selectedWeatherFeature) {
        for (var i = 0; i < this.weatherFeatures.length; i++) {
            var wfi = this.weatherFeatures[i];
            if (this.selectedWeatherFeature.stationID == wfi.stationID && this.isVisibleYear(wfi._year)) {
                var color = WeatherGraphicsDialog.yearColorArray[wfi._year];
                if (color != wfi._color) {
                    wfi.setColor(color);
                }
                wfi.setVisibility(true);
            } else {
                wfi.setVisibility(false);
            }
        }
    }
};

WeatherGraphicsManager.prototype.setStation = function (weatherFeature) {

    this.selectedWeatherFeature = weatherFeature;
    this.updateSelectedStationVisibility();

    //for (var i = 0; i < this.weatherFeatures.length; i++) {
    //    this.weatherFeatures[i].setVisibility(false);
    //}
    //weatherFeature.setVisibility(true);
};

WeatherGraphicsManager.prototype.isVisibleYear = function (year) {
    return this._yearsFilter.length == 0 || this._yearsFilter.indexOf(year) != -1;
};

WeatherGraphicsManager.prototype.initialize = function () {
    //сохраняем слои карты в общую коллекцию
    for (var i in nsGmx.gmxMap.layersByID) {
        this.layerCollection[i] = nsGmx.gmxMap.layersByID[i];
    }

    var that = this;

    //инициализация слоев из внешних карт
    $(window._queryExternalMaps).bind('map_loaded', function (e) {
        for (var i in nsGmx.gmxMap.layersByID) {
            if (!that.layerCollection[i]) {
                that.layerCollection[i] = nsGmx.gmxMap.layersByID[i];
            }
        }
    });
}

WeatherGraphicsManager.prototype.initDialogEvents = function () {

    var that = this;

    this.graphDialog.onclear = function () {
        that.graphDialog.cloneMiniDialog.hide();
        that.removeWeatherFeatures();
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
        //that.graphDialog.graphicType = 0;
        //$(".wGraphicsTypeInput")[0].checked = true;
        that.clearAll();
        that._dialog.hide();
        that.graphDialog.cloneMiniDialog.hide();
    };

    var overFeature = null;
    this.graphDialog.onPointOver = function (item) {

        overFeature && overFeature.setLighting(false);

        if (!that.selectedFeature && overFeature && overFeature._id != item.series.properties.weatherFeature._id ||
            that.selectedFeature && overFeature._id != that.selectedFeature._id) {
            overFeature.divInfo.style.backgroundColor = "";
            overFeature.setLighting(false);
        }
        overFeature = item.series.properties.weatherFeature;
        //overFeature.divInfo.style.backgroundColor = "rgba(" + shared.hexToR(overFeature._color) + "," +
        //    shared.hexToG(overFeature._color) + "," + shared.hexToB(overFeature._color) + ", 0.2)";
        //overFeature.setLighting(true);

        that.graphDialog.setBalloonInfoVisibility(true);

        var d = overFeature.weatherData[item.dataIndex];

        var prod = overFeature._product;
        var data = shared.dateToString(d.date);
        var znach = d.value.toFixed(2);

        var infoHtml = '<div style="margin: 5px 0px 0px 0px;">' +
        '<div class="ndvigraphics-balloon-line">' +
        //'<div class="ndvigraphics-balloon-item"><div class="ndvigraphics-balloon-text" style="width: 40px;">' + prod + '</div></div>' +
        '<div class="ndvigraphics-balloon-item"><div class="ndvigraphics-balloon-text">' + data + '</div></div>' +
        '<div class="ndvigraphics-balloon-item"><div class="ndvigraphics-balloon-label">value=</div><div class="ndvigraphics-balloon-text">' + znach + '</div></div>' +
        '</div>' +
        '<div class="ndvigraphics-balloon-line">' +
        '<div class="ndvigraphics-balloon-item"><div ' +
        '</div>';

        that.graphDialog.setBalloonInfoHtml(infoHtml);
    };

    var selectedBalloonInfoHtml = "";
    this.graphDialog.onPointOut = function (item) {
        if (!that.selectedFeature || that.selectedFeature && overFeature._id != that.selectedFeature._id) {
            overFeature.divInfo.style.backgroundColor = "";
        }

        if (!that.selectedFeature) {
            that.graphDialog.setBalloonInfoVisibility(false);
        }

        that.graphDialog.setBalloonInfoHtml(selectedBalloonInfoHtml);
        overFeature.setLighting(false);
    };

    this.graphDialog.onclone = function (weatherFeature) {
        that.cloneWeatherFeature(weatherFeature, that.graphDialog.cloneMiniDialog.getProduct(), parseInt(that.graphDialog.cloneMiniDialog.getYear()));
    };

    this.graphDialog.onfilterchange = function (yearsFilter) {
        that.setYearsFilter(yearsFilter);
    };

    this.graphDialog.onchange = function (weatherFeature) {
        that.setStation(weatherFeature);
    };
};

WeatherGraphicsManager.prototype.clearAll = function () {
    this.graphDialog.graphicType = 0;
    $(".wGraphicsTypeInput")[0].checked = true;
    $(".wYearInput").attr("checked", false);
    $("#wYearInput_2016")[0].checked = true;
    this.graphDialog.selectedGridId = null;
    this._yearsFilter = [2016];
    this.weatherYearStationData = {};
    this.weatherYearGridData = {};
    this.selectedWeatherFeature = null;
    this.removeWeatherFeatures();
    this.graphDialog.graphicsArray = [];
    this.graphDialog.graphicsArray2 = [];
    this.graphDialog.refresh();
    WeatherGraphicsDialog.plotOptions2.yaxis.max = 50;
    WeatherGraphicsDialog.plotOptions2.yaxis.min = -50;
    WeatherGraphicsDialog.plotOptions.yaxis.max = 50;
    WeatherGraphicsDialog.plotOptions.yaxis.min = 0;
    this.graphDialog._plot = $.plot($("#ndvigraphics-flot"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions);
    this.graphDialog._plot2 = $.plot($("#ndvigraphics-flot2"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions2);
    document.getElementById("ndvigraphics-right-grid").innerHTML = "";
};

/**
 * @param {Object} feature .
 * @param {String} product "MODIS", "HR".
 * @param {Integer} year.
 */
WeatherGraphicsManager.prototype.loadWeatherFeature = function (weatherFeature, product, year) {

    weatherFeature._graphicManager = this;
    weatherFeature._name = this.pluginParams.products[product].name;
    weatherFeature._product = product;
    weatherFeature._year = year;
    weatherFeature._color = WeatherGraphicsDialog.yearColorArray[year];

    weatherFeature.weatherData = [];

    if (!weatherFeature.divInfo) {
        var exists = false;
        for (var i = 0; i < this.weatherFeatures.length; i++) {
            if (this.weatherFeatures[i].stationID == weatherFeature.stationID) {
                exists = true;
                break;
            }
        }
        this.graphDialog.addWeatherFeatureRight(weatherFeature, null, !exists);
        if (this._yearsFilter.length == 0) {
            !exists && (weatherFeature.divInfo.style.display = "block");
        } else if (this._yearsFilter.indexOf(year) == -1) {
            weatherFeature.divInfo.style.display = "none";
        }
    } else {
        weatherFeature.divInfo.divYear.innerHTML = year;
    }

    var that = this;
    weatherFeature.lightUp(weatherFeature._color, function (f) {
        that._loadWeatherFeatureDataCallback.call(that, f);
    });

    this.weatherFeatures.push(weatherFeature);
};

WeatherGraphicsManager.prototype._loadWeatherFeatureDataCallback = function (weatherFeature) {
    if (weatherFeature.active) {

        var y = weatherFeature._year;
        var id = weatherFeature.stationID;
        var name = weatherFeature._name;

        var data = weatherGraphicsManager.weatherYearStationData[y][id];
        data.sort(function (a, b) {
            return a.Date - b.Date;
        })

        for (var i = 0; i < data.length; i++) {
            var value = data[i][name],
                date = data[i].Date;
            var value2 = data[i]["Temp"];
            var wd = { "value": value, "value2": value2, "date": date };
            weatherFeature.weatherData.push(wd);
        }


        //добавляем загруженную информацию на график
        weatherFeature.updateGraphData();
        weatherFeature.ready = true;
        weatherFeature.setLoading(false);
        weatherFeature._visibility = false;
        if (this.selectedWeatherFeature && weatherFeature.stationID == this.selectedWeatherFeature.stationID &&
            this.isVisibleYear(weatherFeature._year)) {
            weatherFeature._visibility = true;
        }
        this.graphDialog.addWeatherFeature(weatherFeature);
        //}
    }
};

/**
 * @param {Object} feature .
 * @param {String} product "MODIS", "HR".
 * @param {Integer} year.
 */
//WeatherGraphicsManager.prototype.cloneWeatherFeature = function (weatherFeature, prod, year) {
//    //var url = 'http://127.0.0.1/myrest/ver1/layers/BE7487BC0AD443C0A21DE187558314F8/search?' +
//    //          "query=station_id IN (" + weatherFeature.stationID + ") AND Date >= '01.01." + year + "' AND Date < '01.01." + (year + 1) + "' &" +
//    //          'columns=[{"Value":"station_id","Alias":"id"},{"Value":"Date"},{"Value":"' +
//    //          weatherGraphicsManager.pluginParams.products[prod].name + '"}]&orderby=id&api_key=BB3RFQQXTR';

//    var url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/BE7487BC0AD443C0A21DE187558314F8/search?' +
//          "query=station_id IN (" + weatherFeature.stationID + ") AND Date >= '01.01." + year + "' AND Date < '01.01." + (year + 1) + "' &" +
//          'columns=[{"Value":"station_id","Alias":"id"},{"Value":"Date"},{"Value":"' +
//          weatherGraphicsManager.pluginParams.products[prod].name + '"}]&orderby=id&api_key=BB3RFQQXTR';

//    var that = this;

//    //сохраняем кеш данных всех станций по году
//    $.getJSON(url, function (response) {

//        var f = response.features;

//        //Date: "2015-03-08"
//        //Hail: false
//        //MaxTemp: -1.5
//        //MaxWind: 4.010000228881836
//        //MinTemp: -6
//        //Precip: null
//        //Snow: false
//        //SnowDepth: null
//        //Temp: -3.1700000762939453
//        //Wind: 2.259999990463257
//        //id: 2199

//        //заплолняем weatherGraphicsManager.weatherYearStationData
//        for (var k = 0; k < f.length; k++) {
//            var fk = f[k].properties;
//            var date = fk.Date;
//            var y = date.split("-")[0];
//            var month = date.split("-")[1];
//            var day = date.split("-")[2];
//            fk.Date = new Date(parseInt(y), parseInt(month) - 1, parseInt(day));
//            var id = fk.id;

//            if (!that.weatherYearStationData[y])
//                that.weatherYearStationData[y] = {};

//            if (!that.weatherYearStationData[y][id])
//                that.weatherYearStationData[y][id] = [];

//            that.weatherYearStationData[y][id].push(fk);

//        }

//        //для каждой станции делаем запрос по ее идентификатору(имени)
//        var stationID = weatherFeature.stationID;
//        //(stationId, name, distance, latlng, features, color) {
//        var stationName = weatherFeature.stationName;
//        var stationDistance = weatherFeature.stationDistance;
//        var latlng = L.latLng(weatherFeature.latLng.lat, weatherFeature.latLng.lng);
//        that.weatherYearStationData[year][stationID] &&
//            that.loadWeatherFeature(new WeatherFeature(stationID, stationName, stationDistance, latlng, weatherFeature.features), prod, year);
//    });
//};

WeatherGraphicsManager.prototype.removeWeatherFeatures = function () {
    for (var i = 0; i < this.weatherFeatures.length; i++) {
        this.weatherFeatures[i].remove();
    }
    this.weatherFeatures.length = 0;
    this.weatherFeatures = [];
};

WeatherGraphicsManager.prototype.loadWeatherFeatures = function (years, feature, prod) {
    var center = feature.center;
    var url = 'http://sender.kosmosnimki.ru/cosmosagro/GetNearestWeatherStation.ashx?lat=' + center.lat + '&lon=' + center.lng + '&limit=10';
    //var url = 'http://127.0.0.1/cosmosagro/GetNearestWeatherStation.ashx?lat=' + center.lat + '&lon=' + center.lng + '&limit=10';

    var that = this;

    //получаем список станций
    $.getJSON(url, function (stations) {

        var stationList = "";// ex. 3035, 3086, 2652, 12184, 2417
        for (var j = 0; j < stations.length - 1; j++) {
            stationList += stations[j].Id + ",";
        }
        stationList += stations[j].Id;

        //по всем выбранным годам
        for (var i = 0; i < years.length; i++) {

            var years_i = parseInt(years[i]);

            //var url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/BE7487BC0AD443C0A21DE187558314F8/search?' +
            //"query=station_id IN (" + stationList + ") AND Date >= '01.01." + year + "' AND Date < '01.01." + year + 1 + "' &" +
            //'columns=[{"Value":"station_id","Alias":"id"},{"Value":"Date"},{"Value":"Temp"},{"Value":"MaxTemp"},' +
            //'{"Value":"MinTemp"},{"Value":"Wind"},{"Value":"MaxWind"},{"Value":"Precip"},{"Value":"SnowDepth"},' +
            //'{"Value":"Snow"},{"Value":"Hail"}]&orderby=id';

            var url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/BE7487BC0AD443C0A21DE187558314F8/search?' +
            "query=station_id IN (" + stationList + ") AND Date >= '01.01." + years_i + "' AND Date < '01.01." + (years_i + 1) + "' &" +
            'columns=[{"Value":"station_id","Alias":"id"},{"Value":"Date"},{"Value":"Precip"},{"Value":"Temp"}]&orderby=id&api_key=BB3RFQQXTR';

            //var url = 'http://127.0.0.1/myrest/ver1/layers/BE7487BC0AD443C0A21DE187558314F8/search?' +
            //"query=station_id IN (" + stationList + ") AND Date >= '01.01." + years_i + "' AND Date < '01.01." + (years_i + 1) + "' &" +
            //'columns=[{"Value":"station_id","Alias":"id"},{"Value":"Date"},{"Value":"' +
            //that.pluginParams.products[prod].name + '"}]&orderby=id&api_key=BB3RFQQXTR';

            (function (murl, myear) {
                //сохраняем кеш данных всех станций по году
                $.getJSON(murl, function (response) {

                    var f = response.features;

                    //заплолняем weatherGraphicsManager.weatherYearStationData
                    for (var k = 0; k < f.length; k++) {
                        var fk = f[k].properties;
                        var date = fk.Date;
                        var year = date.split("-")[0];
                        var month = date.split("-")[1];
                        var day = date.split("-")[2];
                        fk.Date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        var id = fk.id;


                        if (!that.weatherYearStationData[year])
                            that.weatherYearStationData[year] = {};

                        if (!that.weatherYearStationData[year][id])
                            that.weatherYearStationData[year][id] = [];

                        that.weatherYearStationData[year][id].push(fk);

                    }

                    //для каждой станции делаем запрос по ее идентификатору(имени)
                    for (var j = 0; j < stations.length; j++) {
                        var stationID = stations[j].Id;
                        //(stationId, name, distance, latlng, features, color) {
                        var stationName = stations[j].Station;
                        var stationDistance = stations[j].Dist;
                        var latlng = L.latLng(stations[j].Lat, stations[j].Lon);
                        that.weatherYearStationData[myear][stationID] &&
                        that.loadWeatherFeature(new WeatherFeature(stationID, stationName, stationDistance, latlng, [feature]), prod, myear);
                    }
                });
            })(url, years_i);
        }
    });
};

WeatherGraphicsManager.colorLuminance = function(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }

    return rgb;
}

WeatherGraphicsManager.prototype.loadGridData = function (years, feature) {
    var center = feature.center;
    var url = 'http://sender.kosmosnimki.ru/cosmosagro/GetNearestGridPoint.ashx?lat=' + center.lat + '&lon=' + center.lng + '&limit=10';

    var that = this;
    //получаем список гридов
    $.getJSON(url, function (grids) {

        var gridList = "";// ex. 3035, 3086, 2652, 12184, 2417
        for (var j = 0; j < grids.length - 1; j++) {
            gridList += grids[j].Id + ",";
        }
        gridList += grids[j].Id;

        var defArr = [];

        for (var i = 0; i < years.length; i++) {
            (function (ii) {
                var years_i = years[i];
                var def = new $.Deferred();
                defArr.push(def);

                var url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/11A381497B4A4AE4A4ED6580E1674B72/search?' +
                "query=gridpoint_id IN (" + gridList + ") AND Date >= '01.01." + years_i + "' AND Date < '01.01." + (years_i + 1) + "' &" +
                'columns=[{"Value":"gridpoint_id","Alias":"id"},{"Value":"Date"},{"Value":"AvgTemp"}]&orderby=id&api_key=BB3RFQQXTR';

                //сохраняем кеш данных всех станций по году
                $.getJSON(url, function (response) {

                    var f = response.features;

                    //заплолняем weatherGraphicsManager.weatherYearGridData
                    for (var k = 0; k < f.length; k++) {
                        var fk = f[k].properties;
                        var date = fk.Date;
                        var year = date.split("-")[0];
                        var month = date.split("-")[1];
                        var day = date.split("-")[2];
                        fk.Date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        fk.Date2000 = new Date(2000, parseInt(month) - 1, parseInt(day));
                        var id = fk.id;

                        if (!that.weatherYearGridData[id])
                            that.weatherYearGridData[id] = {};

                        var color = WeatherGraphicsManager.colorLuminance(WeatherGraphicsDialog.yearColorArray[year], 0.55);
                        if (!that.weatherYearGridData[id][year])
                            that.weatherYearGridData[id][year] = {
                                "data": [],
                                "color": color,
                                "label": "GRID",
                                "lines": {
                                    "fillColor": color,
                                    "lineWidth": 1,
                                    "show": false
                                },
                                "points": {
                                    "fill": true,
                                    "fillColor": color,
                                    "lineWidth": 1,
                                    "radius": 2,
                                    "show": false
                                },
                                //"dashes": { show: true },
                                "properties": { "id": id, "year": year, data: [] }
                            };

                        that.weatherYearGridData[id][year].properties.data.push(fk);
                        that.weatherYearGridData[id][year].data.push([fk.Date2000.getTime(), fk.AvgTemp]);
                    }
                    def.resolve();
                })
            })(url, i);
        }

        $.when.apply($, defArr).then(function () {
            for (var i in that.weatherYearGridData) {
                var gi = that.weatherYearGridData[i];
                for (var j in gi) {
                    var gij = gi[j];
                    gij.data.sort(function (a, b) {
                        return a[0] - b[0];
                    });
                    that.graphDialog.graphicsArray2.push(gij);
                }
            }
            //для каждой станции делаем запрос по ее идентификатору(имени)
            for (var j = 0; j < grids.length; j++) {
                that.graphDialog.addRadioGrid(grids[j].Id, L.latLng(grids[j].Lat, grids[j].Lon), grids[j].Dist);
            }

            console.log(that.weatherYearGridData);
        });
    });
};