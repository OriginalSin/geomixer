var RepTable = function (menuObj) {
    this.fieldsMenu = menuObj;
    this._loadingSpinner = _div([_img(null, [['attr', 'src', 'img/progress.gif'], ['css', 'marginRight', '10px']]), _t(_gtxt('загрузка...'))], [['css', 'margin', '3px 0px 3px 20px']]);

    //событие на конец загрузки странички НЕ РАБОТАЕТ
    var that = this;
    $(this._scrollTable).on("redraw", function () {
        //...
    });

    this.data = null;
};

RepTable.prototype.showTable = function () {

    var that = this;

    this.fieldsMenu.createPanel();
    this.fieldsMenu.setCaption("Сводная статистика");
    this.fieldsMenu.setOnClose(function () {
        //...
    });


    this.createRepTable();

    resizeAll();

    //if (nsGmx.GeomixerFrameworkVersion && $("#agroReportsTableParent").mCustomScrollbar) {
    //    $("#agroReportsTableParent").mCustomScrollbar();
    //}

};

RepTable.prototype.endTheTable = function () {
    //$("#agroReportsTableHeader table tr td")
    $("#agroReportsTableParent .tableBody").mCustomScrollbar();
    $("#agroReportsTableParent .tableBody table").css("table-layout", "fixed");
    $("#agroReportsTableHeader table").css("table-layout", "fixed");
    //$("#agroReportsTableHeader tr td:last").css("width", "6px");

    if (20 * $("#agroReportsTableBody tr").length > $("#agroReportsTableParent .tableBody").height()) {
        $("#agroReportsTableHeader tr td:last").css("width", "6px");
    } else {
        $("#agroReportsTableHeader tr td:last").css("width", "0px");
    }


    $("#agroReportsTableHeader table tr td:first").css("border-left", "none");

    //заголовки белым
    //$(".tableHeader th").css("background", "white");
    //$("#agroReportsTableHeader td").css("background", "white");
    $("#repPanel .leftTitle").css("background", "white");

    $("#agroReportsTableParent").find(".tableBody").css("overflow-y", "hidden");

    //сдвинем таблицу, чтобы убрать серый сдвиг справа
    $("#agroReportsTableParent").find(".mCSB_container")[0].style.left = "1px";
    $("#agroReportsTableParent").parent().css("background-color", "white");
    $("#agroReportsTableParent.scrollTable").css("max-height", "");

    //баг для последняя строчка таблицы, которая не видна
    $("#agroReportsTableParent div.tableBody").css("height", parseInt($("#agroReportsTableParent div.tableBody").css("height")) - 15);

    resizeAll();
};

RepTable.getCsv = function (csvStr) {
    var a = document.createElement('a');
    a.href = 'data:attachment/csv,' + csvStr;
    a.target = '_blank';
    a.download = 'сводная статистика.csv';
    document.body.appendChild(a);
    a.click();
};

RepTable.prototype.createRepTable = function () {

    var _this = this;

    $.getJSON("http://maps.kosmosnimki.ru/user/GetUserInfo.ashx?WrapStyle=None",
        function (response) {

            var url = "http://sender.kosmosnimki.ru/cosmosagro/GetCropStats.ashx?map=" + nsGmx.gmxMap.properties.name;// + "&token=z" + /*response.Result.Token*/;

            $.getJSON(url,
                function (response) {

                    //var response = JSON.parse('{"summary":{"fields_count":1972,"total_area":176429.07000000004},"crops":[{"crop":null,"fields_count":14,"total_area":143.98},{"crop":"кукуруза/силос","fields_count":71,"total_area":5776.2499999999991},{"crop":"озимые з/к","fields_count":1,"total_area":77.83},{"crop":"кукуруза/зерно","fields_count":155,"total_area":12311.490000000002},{"crop":"однол.травы з/к","fields_count":8,"total_area":183.32},{"crop":"аренда","fields_count":3,"total_area":333.84000000000003},{"crop":"овес","fields_count":2,"total_area":23.32},{"crop":"озимый ячмень","fields_count":107,"total_area":7434.54},{"crop":"овес/зерно","fields_count":4,"total_area":221.64},{"crop":"озимая пшеница+озимая вика з/к","fields_count":2,"total_area":64.42},{"crop":"мн.злаковые травы пр.лет","fields_count":12,"total_area":725.85000000000014},{"crop":"озимая пшеница з/к","fields_count":1,"total_area":22.29},{"crop":"мн.травы тек.года","fields_count":36,"total_area":3059.59},{"crop":"сахарная свекла","fields_count":164,"total_area":16394.100000000006},{"crop":"соя","fields_count":306,"total_area":29783.300000000003},{"crop":"мн.травы пр.лет","fields_count":56,"total_area":3625.2799999999993},{"crop":"озимый рапс+озимая рожь з/к","fields_count":1,"total_area":24.48},{"crop":"кукуруза","fields_count":18,"total_area":2088.7799999999997},{"crop":"мн.злаковые травы тек.года","fields_count":4,"total_area":134.48000000000002},{"crop":"подсолнечник СПК","fields_count":32,"total_area":2953.4799999999996},{"crop":"подсолнечник","fields_count":144,"total_area":14619.489999999996},{"crop":"озимая пшеница","fields_count":777,"total_area":72762.980000000025},{"crop":"кукуруза/зерно, кукуруза/силос","fields_count":28,"total_area":1261.1399999999999},{"crop":"кукуруза гибридная","fields_count":26,"total_area":2403.2}]}');

                    _this.data = response;

                    var items = [];

                    for (var i = 0; i < response.crops.length; i++) {
                        items[i] = response.crops[i];
                    };

                    //создаем аблицу
                    _this._titleToField = {
                        "Культура": "crop",
                        "Кол-во полей": "fields_count",
                        "Площадь (га)": "total_area"
                    };

                    _this._attrNames = [
                        "Культура",
                        "Кол-во полей",
                        "Площадь (га)"];

                    _this._sortedAliaces = {
                        "Культура": true,
                        "Кол-во полей": true,
                        "Площадь (га)": true
                    };

                    var sortFuncs =
                    {
                        "Культура": [
                            function (_a, _b) { var a = String(_a.crop).toLowerCase(), b = String(_b.crop).toLowerCase(); if (a > b) return 1; else if (a < b) return -1; else return 0 },
                            function (_a, _b) { var a = String(_a.crop).toLowerCase(), b = String(_b.crop).toLowerCase(); if (a < b) return 1; else if (a > b) return -1; else return 0 }
                        ],
                        "Кол-во полей": function (_a, _b) {
                            return (_a.fields_count || 0) - (_b.fields_count || 0);
                        },
                        "Площадь (га)": function (_a, _b) {
                            return (_a.total_area || 0) - (_b.total_area || 0);
                        }
                    }


                    _this._staticDataProvider = new nsGmx.ScrollTable.StaticDataProvider();
                    _this._staticDataProvider.setOriginalItems(items);
                    _this._staticDataProvider.setSortFunctions(sortFuncs);

                    _this._scrollTable = new scrollTable({ showFooter: false, pagesCount: 1, limit: 2000 });
                    _this._scrollTable.setDataProvider(_this._staticDataProvider);

                    var that = _this;
                    _this._scrollTable.createTable({
                        "parent": _this.fieldsMenu.innerCanvas,
                        "name": 'agroReports',
                        "fieldsWidths": ["50%", "25%", "25%"],
                        "fields": _this._attrNames,
                        "drawFunc": function (elem, curIndex, activeHeaders) {
                            return that._createTableRow.apply(that, [elem, curIndex, activeHeaders]);
                        },
                        "sortableFields": _this._sortedAliaces,
                        isWidthScroll: false
                    });

                    //_(this.fieldsMenu.workCanvas, [this._loadingSpinner]);
                    //document.getElementById("agroReportsTableParent").hidden = true;
                    //this.fieldsMenu.bottomArea.style.display = "none";

                    //идентификатор суммы площадей
                    _this.sum = _div(null, [['dir', 'id', 'repSum'], ['css', 'float', 'left']]);
                    _this.fieldsMenu.bottomArea.appendChild(_this.sum);
                    _this.sum.innerHTML = '<div style="padding-left:6px"><b>Всего полей: </b>' + response.summary.fields_count + "    <b>Общая площадь: </b>" + response.summary.total_area.toFixed(2) + "</div>";

                    //Добавляем кнопки для скачивания
                    var downloadCsv = _this.createDownloadButton("csv", "csv");
                    //var downloadXls = this.createDownloadButton("еxcel", "excel");

                    _this.fieldsMenu.bottomArea.appendChild(downloadCsv/*, downloadXls*/);

                    //sendCrossDomainJSONRequest("http://127.0.0.1/api2/plugins/agroReport/test.txt",
                    //    function (response) {
                    //        console.log(response);
                    //    });

                    _this.fieldsMenu.panel.hide();

                    _this.endTheTable();
                });
        });
};

RepTable.prototype.getCsvData = function () {
    var str = "";
    var c = this.data.crops;

    this._titleToField = {
        "Культура": "crop",
        "Кол-во полей": "fields_count",
        "Площадь (га)": "total_area"
    };

    this._attrNames = [
        "Культура",
        "Кол-во полей",
        "Площадь (га)"];

    for (var j = 0; j < this._attrNames.length; j++) {
        str += this._attrNames[j] + (j < this._attrNames.length - 1 ? ";" : "");
    }

    str += "%0A";

    for (var i = 0; i < c.length; i++) {
        for (var j = 0; j < this._attrNames.length; j++) {
            var a = this._attrNames[j];
            var n = this._titleToField[a];
            var v = c[i][n];
            if (n == "crop" && !v) {
                v = "не указано";
            } else if (n == "total_area") {
                v = v.toFixed(2);
            }
            str += v + (j < this._attrNames.length - 1 ? ";" : "")
        }
        str += "%0A";
    }

    RepTable.getCsv(str);

};

RepTable.prototype.createDownloadButton = function (text, format) {
    var div = _div(null, [['dir', 'id', 'download_' + format], ['css', 'float', 'right'], ['css', 'padding-left', '5px']]);
    var btn = _span(null);
    btn.classList.add("buttonLink");
    btn.innerHTML = text;
    btn.style.fontSize = "12px";

    var that = this;
    btn.onclick = function () {
        that.getCsvData();
    };
    div.appendChild(btn);

    return div;
};

//содает td'шки для tr элкемента таблицы(используется в _createTableRow)
RepTable.prototype._createTableTd = function (elem, activeHeaders) {

    var tds = [];

    for (var j = 0; j < activeHeaders.length; ++j) {
        var td = _td();
        var n = this._titleToField[activeHeaders[j]];

        var v = elem[n];

        td.style.width = "25%";
        td.style.overflowX = "hidden";
        td.style.textOverflow = "eclipsis";

        if (n == "crop") {
            td.style.width = "50%";
        }

        if (n == "crop" && !v) {
            v = "не указано";
        } else if (n == "total_area") {
            v = v ? v.toFixed(2) : "не указано";
        }

        var innerTd = v;

        td.appendChild(_t(innerTd));

        tds.push(td);
    }

    return tds;
};

RepTable.prototype.writeAreaSum = function (value, type) {
    this.areaSum.innerHTML = (!type ? '<b style="font-size:12px;">Площадь:</b> ' : '<b style="font-size:12px;">Площадь:</b> ') + (!isNaN(value) ? value.toFixed(2) : "-");
};

//рисует строку scrollTable
RepTable.prototype._createTableRow = function (elem, curIndex, activeHeaders) {

    var tr = _tr(this._createTableTd(elem, activeHeaders));

    if (curIndex % 2 != 0)
        tr.className = 'myOddGrey';
    else
        tr.className = 'myOddWhite';

    //убираем системное выделение
    tr.classList.add("disable-select");

    return tr;
};