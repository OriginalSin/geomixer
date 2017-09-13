/*
====================================================
    Контейнер - диалоговое окно
====================================================
*/
var GraphDialog = function () {
    this.maxWidth = 795;
    this.maxHeight = 650;
    this.minWidth = 605;
    this.minHeight = 650;
    this.hideWidth = 370;
    this._dialog = null;
    this.__dialogClass = "weatherGraphDialog";
    this.dialogContent = null;
    this._createDialog("Осадки", this.maxWidth, this.maxHeight);
    this.collapsed = false;
    this.dialogHided = false;

    this.onresizestart = null;
    this.onresizestop = null;
    this.onmaximize = null;
    this.oncollapse = null;
    this.onhideshow = null;
    this.onclose = null;
    this.onclone = null;
    this.onclear = null;
};

GraphDialog.removeElement = function (element) {
    element && element.parentNode && element.parentNode.removeChild(element);
};

GraphDialog.prototype.closeDialog = function () {
    this.onclose && this.onclose();
};

GraphDialog.prototype._createDialog = function (caption, width, height) {
    if (this.dialog)
        return;

    this.dialogContent = $('<div class="ndvigraphics-control"></div>');

    $(this.dialogContent.get(0)).empty();

    var that = this;

    this.dialog = showDialog("", this.dialogContent.get(0), 0, 0, false, false, null,
        function () {
            that.closeDialog();
        });

    this.dialog.style.display = "block";

    $(this.dialog).dialog({ dialogClass: this.__dialogClass });
    $("." + this.__dialogClass + " .ui-dialog-titlebar-close").remove();
    this._createTitlebarButtons();
    $("." + this.__dialogClass + " .ui-dialog-titlebar .ui-dialog-title").append(caption);
    $("." + this.__dialogClass + " .ui-dialog").css({ "float": "none", "font-size": "12px", "font-family": "Tahoma", "background-color": "#FFFFFF", "border-color": "#e7e7e7" });
    $(this.dialog).dialog('option', 'zIndex', 20002);
    $(this.dialog).dialog('option', 'height', height || 139);
    $(this.dialog).dialog('option', 'width', width || 256);
    $(this.dialog).dialog('moveToTop');

    $(this.dialog).bind("dialogresizestop", function (event, ui) {
        that.onresizestop && that.onresizestop(event, ui);
    });

    $(this.dialog).bind("dialogresizestart", function (event, ui) {
        that.onresizestart && that.onresizestart(event, ui);
    });
};

GraphDialog.prototype.setChildNode = function (childNode) {
    this.dialogContent[0].appendChild(childNode);
};

GraphDialog.prototype.getContainer = function () {
    return this.dialogContent[0];
};

GraphDialog.prototype._createTitlebarButtons = function () {
    $titlebar = $("." + this.__dialogClass + " .ui-dialog-titlebar")

    var that = this;
    this.iconButtons = {
        "close": {
            text: "Закрыть",
            icon: "ui-icon-closethick",
            click: function (e) {
                that.onclose && that.onclose();
                that.hide();
            }
        }, "hide": {
            text: "Свернуть",
            icon: "ui-icon-hidethick",
            click: function (e) {
                that.hideShowDialog();
            }
        },
        "minimize": {
            text: "Свернуть в окно",
            icon: "ui-icon-minimizethick",
            click: function (e) {
                if (that.collapsed)
                    that.maximizeDialog();
                else
                    that.collapseDialog();
                that.dialogHided = false;
                that.iconButtons.hide.buttonElement.style.display = "block";
            }
        }
    };

    $.each(this.iconButtons, function (i, v) {

        var $button = $("<button/>").text(this.text),
            right = $titlebar.find("[role='button']:last")
                                .css("right");

        $button.button({ icons: { primary: this.icon }, text: false })
                .addClass("ui-dialog-titlebar-close")
                .css("right", (parseInt(right) + 22) + "px")
                .click(this.click)
                .appendTo($titlebar);

        this.buttonElement = $button[0];
    });

    this.iconButtons.minimize.buttonElement.style.display = "none";
};

GraphDialog.prototype.show = function () {
    $("." + this.__dialogClass).show();
    $(this.dialog).dialog();
};

GraphDialog.prototype.hide = function () {
    $("." + this.__dialogClass).hide();
};

GraphDialog.prototype.maximizeDialog = function () {
    this.dialog.style.display = "block";

    var icon = this.iconButtons.minimize.buttonElement.childNodes[0];
    icon.classList.remove("ui-icon-maximizethick");
    icon.classList.add("ui-icon-minimizethick");
    this.iconButtons.minimize.buttonElement.style.display = "block";

    $(this.dialog).dialog('option', 'position', [$(this.dialog.parentElement).position().left -
    this.maxWidth + (this.dialogHided ? this.hideWidth : this.minWidth),
    $(this.dialog.parentElement).position().top]);

    $(this.dialog).dialog('option', 'width', this.maxWidth);
    $(this.dialog).dialog('option', 'height', this.maxHeight);

    this.dialogHided = false;
    this.collapsed = false;

    this.iconButtons.minimize.buttonElement.style.display = "none";

    this.onmaximize && this.onmaximize();
};

GraphDialog.prototype.collapseDialog = function () {
    this.dialog.style.display = "block";

    var icon = this.iconButtons.minimize.buttonElement.childNodes[0];
    icon.classList.remove("ui-icon-minimizethick");
    icon.classList.add("ui-icon-maximizethick");

    $(this.dialog).dialog('option', 'position', [(this.collapsed ? this.minWidth : this.maxWidth) -
    (this.dialogHided ? this.hideWidth : this.minWidth) + $(this.dialog.parentElement).position().left,
    $(this.dialog.parentElement).position().top]);

    $(this.dialog).dialog("option", "width", this.minWidth);
    $(this.dialog).dialog("option", "height", this.minHeight);

    this.dialogHided = false;
    this.collapsed = true;

    this.oncollapse && this.oncollapse();
};

GraphDialog.prototype.hideShowDialog = function () {
    $(this.dialog).dialog("option", "width", this.hideWidth);
    this.dialog.style.display = "none";
    this.iconButtons.hide.buttonElement.style.display = "none";
    this.dialogHided = true;

    $(this.dialog).dialog('option', 'position', [(this.collapsed ? this.minWidth : this.maxWidth) -
        this.hideWidth + $(this.dialog.parentElement).position().left,
        $(this.dialog.parentElement).position().top]);

    var icon = this.iconButtons.minimize.buttonElement.childNodes[0];
    icon.classList.remove("ui-icon-maximizethick");
    icon.classList.remove("ui-icon-minimizethick");
    icon.classList.add("ui-icon-maximizethick");

    this.collapsed = true;

    this.onhideshow && this.onhideshow();

    this.iconButtons.minimize.buttonElement.style.display = "block";
    this.iconButtons.minimize.buttonElement.style.right = "38px";
};
/*
===============================================
    Правый нижний контрол лифлета
===============================================
*/
var _BottomRight = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', '');
        return container;
    }
});

/*
====================================================
    class NDVIGraphicsDialog
====================================================
*/
var WeatherGraphicsDialog = function (dialogContainer, params) {
    this.pluginParams = params;

    this.bottomContainer = null;
    this.rightContainer = null;

    var _container = dialogContainer;

    var cont = dialogContainer.getContainer();
    this.getContainer = function () {
        return dialogContainer.getContainer();
    };

    //координатная сетка
    var tablo = L.DomUtil.create('div', 'ndvigraphics-tablo');
    tablo.id = "ndvigraphics-flot";
    cont.appendChild(tablo);
    //создаем координатную плоскость
    this._plot = $.plot($("#ndvigraphics-flot"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions);

    //координатная сетка
    var tablo = L.DomUtil.create('div', 'ndvigraphics-tablo2');
    tablo.id = "ndvigraphics-flot2";
    cont.appendChild(tablo);
    //создаем координатную плоскость
    this._plot2 = $.plot($("#ndvigraphics-flot2"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions2);

    dialogContainer.hide();

    //нижний контейнер
    this.bottomContainer = L.DomUtil.create('div', 'ndvigraphics-bottom');
    this._bottomWarning = L.DomUtil.create('div', 'ndvigraphics-bottom');
    this._bottomWarning.style.marginBottom = "41px";
    //this._bottomWarning.innerHTML = '<div style="position:absolute; padding-left: 20px; font-size: 14px;">Выберите точку на графике</div>';
    this._bottomWarning.style.display = "none";
    this.bottomContainer.id = "ndvigraphics-bottom";
    this.bottomContainer.style.display = "block";
    cont.appendChild(this.bottomContainer);
    //cont.appendChild(this._bottomWarning);

    //правый контейнер
    this.rightContainer = L.DomUtil.create('div', 'ndvigraphics-right');
    this.rightContainer.id = "ndvigraphics-right";
    cont.appendChild(this.rightContainer);

    //кнопка очистить все
    //var btnClear = L.DomUtil.create('div', 'ntBtnCleanAll');
    //btnClear.id = "ntBtnCleanAll";
    //cont.appendChild(btnClear);
    //var that = this;
    //btnClear.onclick = function () {
    //    that.onclear();
    //};

    this.balloonDialog = L.DomUtil.create('div', 'ndvigraphics-balloon');
    cont.appendChild(this.balloonDialog);

    //вешаем обработчики наведения, клика на элементы графиков
    this._bindPlotListeners();

    //массив с графиками для $.plot
    this.graphicsArray = [];

    //массив с графиками для $.plot2
    this.graphicsArray2 = [];

    this.createBottomPanel();
    this.createGraphicTypeSelector();

    //колбэки
    //this.onModisSelect = null;
    //this.onLandsatSelect = null;
    this.onPointClick = null;
    this.onEmptyClick = null;
    this.onPointOver = null;
    this.onPointOut = null;

    //точка под мышкой и выбранная
    this._overItem = null;
    this._selectedItem = null;

    this.miniDialog = new MiniDialog(this);

    this.cloneMiniDialog = new CloneMiniDialog(this);

    //колбэки выбора продукта
    this.onmodisndvi = null;
    this.onmodisquality = null;
    this.onmodisvci = null;
    this.onhrndvi = null;
    this.onhrrgb = null;
    this.onhrclass = null;

    this._minimized = false;

    $(".flot-x-axis .flot-tick-label.tickLabel").css("margin-left", "22px");

    var that = this;
    dialogContainer.onresizestart = function (e) {
        that._plot.destroy();
        that._plot2.destroy();
    };
    dialogContainer.onresizestop = function (e) {
        $("#ndvigraphics-flot").css("width", e.target.clientWidth - 209);
        $("#ndvigraphics-flot").css("height", e.target.clientHeight * 0.5 - 44);
        that._plot = $.plot($("#ndvigraphics-flot"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions);

        $("#ndvigraphics-flot2").css("width", e.target.clientWidth - 209);
        $("#ndvigraphics-flot2").css("height", e.target.clientHeight * 0.5 - 44);
        that._plot2 = $.plot($("#ndvigraphics-flot2"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions2);

        that.refresh();
    };

    this.maxValue = 0;
    this.maxValue2 = 0;
    this.minValue2 = 100000000;

    //событие при включении фильтра годов
    this.onfilterchange = null;
    this.onchangegraphictype = function (t) {
        if (t == 1) {
            that.maxValue = 0;
            for (var i = 0; i < that.graphicsArray.length; i++) {
                //if (that.graphicsArray[i].properties.weatherFeature._visibility) {
                var d = that.graphicsArray[i].data;
                var sum = 0;
                for (var j = 0; j < d.length; j++) {
                    sum += d[j][1];
                    d[j][1] = sum;
                    if (that.maxValue < sum)
                        that.maxValue = sum;
                }
                //}
            }
            WeatherGraphicsDialog.plotOptions.yaxis.max = Math.round(that.maxValue) + 10;

            that.maxValue2 = -100000000000;
            that.minValue2 = 1000000000000;
            for (var i = 0; i < that.graphicsArray2.length; i++) {
                //if (that.graphicsArray[i].properties.weatherFeature._visibility) {
                var d = that.graphicsArray2[i].data;
                var sum = 0;
                for (var j = 0; j < d.length; j++) {
                    sum += d[j][1];
                    d[j][1] = sum;
                    if (that.maxValue2 < sum)
                        that.maxValue2 = sum;
                    if (that.minValue2 > sum)
                        that.minValue2 = sum;
                }
                //}
            }
            WeatherGraphicsDialog.plotOptions2.yaxis.max = Math.round(that.maxValue2) + 10;
            WeatherGraphicsDialog.plotOptions2.yaxis.min = Math.round(that.minValue2) - 10;

        } else {
            for (var i = 0; i < that.graphicsArray.length; i++) {
                var d = that.graphicsArray[i].data;
                for (var j = d.length - 1; j > 0; j--) {
                    d[j][1] -= d[j - 1][1];
                }
                //WeatherGraphicsDialog.plotOptions.yaxis.max = sum + 10;

            };
            WeatherGraphicsDialog.plotOptions.yaxis.max = 50;
            WeatherGraphicsDialog.plotOptions.yaxis.min = 0;


            for (var i = 0; i < that.graphicsArray2.length; i++) {
                var d = that.graphicsArray2[i].data;
                for (var j = d.length - 1; j > 0; j--) {
                    d[j][1] -= d[j - 1][1];
                }
                //WeatherGraphicsDialog.plotOptions2.yaxis.max = sum + 10;

            };
            WeatherGraphicsDialog.plotOptions2.yaxis.max = 50;
            WeatherGraphicsDialog.plotOptions2.yaxis.min = -50;
        }
        that._plot = $.plot($("#ndvigraphics-flot"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions);
        that._plot2 = $.plot($("#ndvigraphics-flot2"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions2);
        that.refresh();
    };

    this.onchange = null;


    //правый контейнер для гридов
    this.rightContainerGrid = L.DomUtil.create('div', 'ndvigraphics-right-grid');
    this.rightContainerGrid.id = "ndvigraphics-right-grid";
    cont.appendChild(this.rightContainerGrid);
};

//Добавление в список графиков
WeatherGraphicsDialog.prototype.addRadioGrid = function (id, latLng, distance) {
    var graphInfo = L.DomUtil.create('div', 'ndvigraphics-graphinfo-container');
    //graphInfo.style.display = (visibility ? "block" : "none");
    graphInfo.weatherFeature = { "id": id, "latLng": latLng, "distance": distance };

    var descr = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-descr');
    var str = '<div class="ntWeatherStationName" onclick="nsGmx.leafletMap.setView(L.latLng(' + latLng.lat +
        ',' + latLng.lng + '))">' + id + '</div>' + " (" + (distance / 1000).toFixed(2) + " км)";
    descr.innerHTML = str;

    var that = this;

    var vis = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-visib');
    var chkVis = L.DomUtil.create('input');
    chkVis.type = "radio";
    vis.appendChild(chkVis);
    //chkVis.checked = true;
    chkVis.name = "gridOptions";
    chkVis.onchange = function () {
        that.onchangegrid && that.onchangegrid(graphInfo.weatherFeature);
    };

    graphInfo.appendChild(vis);
    graphInfo.appendChild(descr);

    this.rightContainerGrid.appendChild(graphInfo);

    this.onchangegrid = function (f) {
        that.selectedGridId = f.id;
        that.refresh();
    };
};

WeatherGraphicsDialog.prototype.setBottomVisibility = function (visibility) {
    if (visibility) {
        this.bottomContainer.style.display = "block";
        //this._bottomWarning.style.display = "none";
    } else {
        // this.bottomContainer.style.display = "none";
        // this._bottomWarning.style.display = "block";
    }
};

WeatherGraphicsDialog.prototype.setMinimized = function (minimized) {
    if (!this._minimized && minimized) {
        this._minimized = true;
        this.rightContainer.style.display = "none";
        this.getContainer().classList.add("ndvigraphics-control-minimilzed");
        this.balloonDialog.classList.add("ndvigraphics-balloon-minimized");
    } else if (!minimized) {
        this._minimized = false;
        this.rightContainer.style.display = "block";
        this.getContainer().classList.remove("ndvigraphics-control-minimilzed");
        this.balloonDialog.classList.remove("ndvigraphics-balloon-minimized");
    }
};

WeatherGraphicsDialog.prototype.setBalloonInfoHtml = function (html) {
    this.balloonDialog.innerHTML = html;
};

WeatherGraphicsDialog.prototype.setBalloonInfoVisibility = function (visibility) {
    if (visibility) {
        this.balloonDialog.style.display = "block";
    } else {
        this.balloonDialog.style.display = "none";
    }
};

//Добавление в список графиков
WeatherGraphicsDialog.prototype.addWeatherFeatureRight = function (weatherFeature, afterNode, visibility) {
    weatherFeature._graphDialog = this;
    var graphInfo = L.DomUtil.create('div', 'ndvigraphics-graphinfo-container');
    graphInfo.style.display = (visibility ? "block" : "none");
    weatherFeature.divInfo = graphInfo;
    graphInfo.weatherFeature = weatherFeature;
    //var color = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-color');
    //graphInfo.colorDiv = color;
    //color.classList.add("ndvigraphics-graphinfo-loading");

    //var year = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-year');
    //weatherFeature.divInfo.divYear = year;
    //year.innerHTML = '<b>' + weatherFeature._year + " г.</b>";

    var descr = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-descr');
    var str = '<div class="ntWeatherStationName" onclick="nsGmx.leafletMap.setView(L.latLng(' + weatherFeature.latLng.lat +
        ',' + weatherFeature.latLng.lng + '))">' + weatherFeature.stationName + '</div>' + " (" + (weatherFeature.stationDistance / 1000).toFixed(2) + " км)";
    descr.innerHTML = str;

    //var btnClose = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-btnClose');
    var that = this;
    //btnClose.onclick = function () {
    //    if (that._selectedItem && that._selectedItem.series.properties.weatherFeature._id == weatherFeature._id) {
    //        that._plot.unhighlight();
    //    }
    //    weatherFeature.clear();
    //    //graphInfo.remove();
    //    GraphDialog.removeElement(graphInfo);
    //    that.cloneMiniDialog.hide();
    //};

    var vis = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-visib');
    var chkVis = L.DomUtil.create('input');
    chkVis.type = "radio";
    vis.appendChild(chkVis);
    //chkVis.checked = true;
    chkVis.name = "stationOptions";
    chkVis.onchange = function () {
        that.onchange && that.onchange(weatherFeature);
        //weatherFeature.setVisibility(this.checked);
    };

    //var btnCsv = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-btnCsv');
    //btnCsv.title = "Скачать данные";
    //btnCsv.onclick = function () {
    //    weatherFeature.importCSV();
    //};

    //var btnClone = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-btnClone');
    //btnClone.onclick = function () {
    //    var rect = btnClone.getBoundingClientRect();
    //    that.cloneMiniDialog.setPosition(rect.left, rect.top);
    //    that.cloneMiniDialog.show();
    //    //document.getElementById("yearInp_clone").value = ndviFeature._year;
    //    //document.getElementById("prodSel_clone").value = ndviFeature._product;
    //    that.cloneMiniDialog.showProductYearsList(weatherFeature._product);
    //    that.cloneMiniDialog.setYear(weatherFeature._year);
    //    that.cloneMiniDialog.onclone = function () {
    //        that.cloneMiniDialog.hide();
    //        that.onclone && that.onclone(weatherFeature);
    //    }

    //};

    //btnClone.title = "Создать копию";
    //btnClone.onmouseenter = function () {
    //    that.cloneMiniDialog._buttonHovered = true;
    //};

    //btnClone.onmouseleave = function () {
    //    that.cloneMiniDialog._buttonHovered = false;
    //    setTimeout(function () {
    //        if (!that.cloneMiniDialog._hovered) {
    //            that.cloneMiniDialog.hide();
    //        }
    //    }, 100);
    //};

    graphInfo.appendChild(vis);
    //graphInfo.appendChild(color);
    graphInfo.appendChild(descr);
    //graphInfo.appendChild(year);
    //graphInfo.appendChild(btnClose);
    //graphInfo.appendChild(btnClone);
    //graphInfo.appendChild(btnCsv);

    //$(color).colpick({
    //    colorScheme: 'dark',
    //    layout: 'rgbhex',
    //    color: weatherFeature._color,
    //    onChange: function (hsb, hex, rgb, el) {
    //        weatherFeature.setColor('#' + hex);
    //    },
    //    onSubmit: function (hsb, hex, rgb, el) {
    //        weatherFeature.setColor('#' + hex);
    //        $(el).colpickHide();
    //    },
    //    onBeforeShow: function (el) {
    //        setTimeout(function () {
    //            el.style.left = (parseInt(el.style.left.substr(0, el.style.left.length - 2)) - 100) + "px";
    //        }, 0);
    //    }
    //});

    if (afterNode) {
        NDVIGraphicsDialog.insertAfter(graphInfo, afterNode);
    } else {
        this.rightContainer.appendChild(graphInfo);
    }

    // $(".colpick").css("zIndex", 50000);
};

WeatherGraphicsDialog.insertAfter = function (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};


//WeatherGraphicsDialog.addRadioButton = function (parentNode, id, groupName, value, label, checked, onchange, onlegend) {
//    var div = L.DomUtil.create('div', 'ndvigraphics-radiosgroup');

//    var radBtn = L.DomUtil.create('input', 'ndvigraphics-radio');
//    radBtn.type = "radio";
//    radBtn.value = value;
//    radBtn.name = groupName;
//    radBtn.checked = checked;
//    id && (radBtn.id = id);
//    radBtn.onchange = function () {
//        onchange && onchange(this);
//    };

//    div.appendChild(radBtn);

//    var radLbl = L.DomUtil.create('div', 'ndvigraphics-radioLabel');
//    radLbl.innerHTML = label;
//    radLbl.radioButton = radBtn;
//    radLbl.onclick = function () {
//        radBtn.checked = true;
//        onchange && onchange(radBtn);
//    };

//    div.appendChild(radLbl);

//    if (onlegend) {
//        var leg = L.DomUtil.create('span', 'layerInfoButton');
//        leg.innerHTML = "i";
//        leg.title = "Легенда";
//        leg.style.float = "left";
//        leg.style.paddingTop = "2px";
//        leg.onclick = function () {
//            onlegend(this);
//        };
//        div.appendChild(leg);
//    }

//    parentNode.appendChild(div);
//};


WeatherGraphicsDialog.prototype.createGraphicTypeSelector = function () {


    var grSel = L.DomUtil.create('div', '');
    grSel.style.right = "11px";
    grSel.style.position = "absolute";

    var that = this;

    var input0 = L.DomUtil.create('input', 'wGraphicsTypeInput');
    input0.type = "radio";
    input0.name = "grType";
    input0.graphicType = 0;
    input0.checked = true;
    input0.onchange = function (e) {
        that.graphicType = this.graphicType;
        that.onchangegraphictype && that.onchangegraphictype(that.graphicType);
    };
    var label0 = L.DomUtil.create('label', 'wGraphicsTypeLabel');
    label0.innerHTML = "Суточные";
    label0.style.paddingRight = "15px";

    grSel.appendChild(input0);
    grSel.appendChild(label0);

    var input1 = L.DomUtil.create('input', 'wGraphicsTypeInput');
    input1.type = "radio";
    input1.name = "grType";
    input1.graphicType = 1;
    input1.onchange = function (e) {
        that.graphicType = this.graphicType;
        that.onchangegraphictype && that.onchangegraphictype(that.graphicType);
    };
    var label1 = L.DomUtil.create('label', 'wGraphicsTypeLabel');
    label1.innerHTML = "Накопленные";

    grSel.appendChild(input1);
    grSel.appendChild(label1);

    this.getContainer().appendChild(grSel);
};

WeatherGraphicsDialog.yearColorArray = { "2016": "#228B22", "2015": "#E25A6C", "2014": "#BE31CF", "2013": "#f3cc56", "2012": "#AA1200", "2011": "#22d0ce" };

WeatherGraphicsDialog.prototype.createBottomPanel = function () {

    //Фильтр с годами
    var years = L.DomUtil.create('div', '');
    years.style.float = "right";
    years.style.paddingBottom = "10px";
    years.style.paddingRight = "7px";


    var max = 2016,
        min = 2011;

    var that = this;


    for (var i = max; i >= min; i--) {

        var color = L.DomUtil.create('div', '');
        color.style.float = "left";
        color.style.marginTop = "2px";
        color.style.paddingRight = "3px";
        var circle = L.DomUtil.create('div', 'ndvigraphics-circle');
        circle.style.borderColor = WeatherGraphicsDialog.yearColorArray[i];
        circle.style.backgroundColor = WeatherGraphicsDialog.yearColorArray[i];
        color.appendChild(circle)

        var div = L.DomUtil.create('div', 'wYearDiv');

        var input = L.DomUtil.create('input', 'wYearInput');
        input.type = "checkbox";
        input.style.float = "left";
        input.id = "wYearInput_" + i;
        input.year = i;
        (i == 2016) && (input.checked = true);
        //if (i == 2016)
        //    input.disabled = true;
        input.onchange = function (e) {
            var res = [];
            $(".wYearInput").each(function (e, x) {
                if (x.checked)
                    res.push(x.year);
            })
            that.onfilterchange && that.onfilterchange(res);
        };
        var label = L.DomUtil.create('label', 'wYearLabel');
        label.for = "wYearInput_" + i;
        label.innerHTML = i.toString();

        div.appendChild(input);
        div.appendChild(color);
        div.appendChild(label);
        years.appendChild(div);
    }

    this.bottomContainer.appendChild(years);
};

WeatherGraphicsDialog.plotOptions = {
    legend: {
        show: false
    },
    xaxis: {
        mode: "time",
        timeformat: "%y/%m/%d",
        tickFormatter: function formatter(val, axis) {
            var monthArray = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
            return monthArray[new Date(val).getUTCMonth()];
        },
        min: 946684800000,
        max: 978220800000,
        ticks: [946684800000, 949363200000, 951868800000, 954547200000, 957139200000, 959817600000, 962409600000, 965088000000, 967766400000, 970358400000, 973036800000, 975628800000]
    },
    yaxis: {
        mode: null,
        min: 0,
        max: 50,
        autoscaleMargin: 0.25
    },
    grid: {
        clickable: true,
        hoverable: true,
        borderWidth: 1,
        mouseActiveRadius: 30
    },
    font: {
        size: 11,
        style: "italic",
        weight: "bold",
        family: "sans-serif",
        variant: "small-caps"
    }
};

WeatherGraphicsDialog.plotOptions2 = {
    legend: {
        show: false
    },
    xaxis: {
        mode: "time",
        timeformat: "%y/%m/%d",
        tickFormatter: function formatter(val, axis) {
            var monthArray = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
            return monthArray[new Date(val).getUTCMonth()];
        },
        min: 946684800000,
        max: 978220800000,
        ticks: [946684800000, 949363200000, 951868800000, 954547200000, 957139200000, 959817600000, 962409600000, 965088000000, 967766400000, 970358400000, 973036800000, 975628800000]
    },
    yaxis: {
        mode: null,
        min: -50,
        max: 50,
        autoscaleMargin: 0.25
    },
    grid: {
        clickable: true,
        hoverable: true,
        borderWidth: 1,
        mouseActiveRadius: 30
    },
    font: {
        size: 11,
        style: "italic",
        weight: "bold",
        family: "sans-serif",
        variant: "small-caps"
    }
};

WeatherGraphicsDialog.prototype._bindPlotListeners = function () {
    var that = this;
    $("#ndvigraphics-flot").bind('plothover', function (event, pos, item) {

        that.cloneMiniDialog.hide();

        if (item) {
            if (item != that._overItem) {
                that._overItem = item;
                that.onPointOver && that.onPointOver(item);
            }
        } else {
            if (that._overItem) {
                that.onPointOut && that.onPointOut(null);
                that._overItem = null;
            }
        }
    });

    $("#ndvigraphics-flot").bind("plotclick", function (event, pos, item) {
        that._plot.unhighlight();
        if (item) {
            that._plot.highlight(item.series, item.dataIndex);
            that._selectedItem = item;
            that.onPointClick && that.onPointClick(item);
        } else {
            that._selectedItem = null;
            that.onEmptyClick && that.onEmptyClick();
        }
    });
};

WeatherGraphicsDialog.prototype.addWeatherFeature = function (weatherFeature) {
    //if (!weatherFeature._visibility) {
    //    return;
    //}

    weatherFeature._graphDialog = this;
    var data = weatherFeature.graphData;
    WeatherGraphicsDialog.plotOptions.yaxis.max = 50;
    if (this.graphicType == 1) {
        var d = data.data;
        var sum = 0;
        for (var i = 0; i < d.length; i++) {
            sum += d[i][1];
            d[i][1] = sum;
            if (this.maxValue < sum)
                this.maxValue = sum;
        }
        WeatherGraphicsDialog.plotOptions.yaxis.max = Math.round(this.maxValue) + 10;
    }

    data.points.show = data.lines.show = weatherFeature._visibility;

    this.graphicsArray.push(data);
    this._plot = $.plot($("#ndvigraphics-flot"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions);


    weatherFeature._graphDialog = this;
    var data2 = weatherFeature.graphData2;
    WeatherGraphicsDialog.plotOptions2.yaxis.max = 50;
    if (this.graphicType == 1) {
        var d = data2.data;
        var sum = 0;
        for (var i = 0; i < d.length; i++) {
            sum += d[i][1];
            d[i][1] = sum;
            if (this.minValue2 > sum)
                this.minValue2 = sum;
            if (this.maxValue2 < sum)
                this.maxValue2 = sum;
        }
        WeatherGraphicsDialog.plotOptions2.yaxis.max = Math.round(this.maxValue2) + 10;
        WeatherGraphicsDialog.plotOptions2.yaxis.min = Math.round(this.minValue2) - 10;
    }

    data2.points.show = data2.lines.show = weatherFeature._visibility;

    this.graphicsArray2.push(data2);
    this._plot2 = $.plot($("#ndvigraphics-flot2"), [{ "data": [], "label": "" }], WeatherGraphicsDialog.plotOptions2);


    this.refresh();
};

WeatherGraphicsDialog.prototype.getGraphicData = function (weatherFeature) {
    for (var i = 0; i < this.graphicsArray.length; i++) {
        if (this.graphicsArray[i].properties.weatherFeature._id == weatherFeature._id) {
            return this.graphicsArray[i];
        }
    }
    return null;
};

WeatherGraphicsDialog.prototype.getGraphicData2 = function (weatherFeature) {
    for (var i = 0; i < this.graphicsArray2.length; i++) {
        if (this.graphicsArray2[i].properties.weatherFeature._id == weatherFeature._id) {
            return this.graphicsArray2[i];
        }
    }
    return null;
};

WeatherGraphicsDialog.prototype.removeWeatherFeature = function (weatherFeature) {
    for (var i = 0; i < this.graphicsArray.length; i++) {
        if (this.graphicsArray[i].properties.weatherFeature._id == weatherFeature._id) {
            this.graphicsArray.splice(i, 1);
            break;
        }
    }

    for (var i = 0; i < this.graphicsArray2.length; i++) {
        if (this.graphicsArray2[i].label != "GRID" && this.graphicsArray2[i].properties.weatherFeature._id == weatherFeature._id) {
            this.graphicsArray2.splice(i, 1);
            break;
        }
    }
    this.refresh();
};

WeatherGraphicsDialog.prototype.refresh = function () {
    this._plot.setData(this.graphicsArray);
    this._plot.draw();
    $("#ndvigraphics-flot > div > .flot-y-axis.flot-y1-axis.yAxis.y1Axis > .flot-tick-label.tickLabel").each(function (e, x) {
        x.innerHTML = parseInt(x.innerHTML) + " mm";
        x.style.left = (-x.clientWidth + 15) + "px";
    });

    var gid = this.selectedGridId;
    if (gid) {
        var years = weatherGraphicsManager._yearsFilter;
        for (var i = 0; i < this.graphicsArray2.length; i++) {
            var gi = this.graphicsArray2[i];
            if (gi.label == "GRID") {
                if (gi.properties.id == gid && (years.indexOf(parseInt(gi.properties.year)) != -1 || years.length == 0)) {
                    gi.points.show = true;
                    gi.lines.show = true;
                } else {
                    gi.points.show = false;
                    gi.lines.show = false;
                }
            }
        }
    }

    this._plot2.setData(this.graphicsArray2);
    this._plot2.draw();
    $("#ndvigraphics-flot2 > div > .flot-y-axis.flot-y1-axis.yAxis.y1Axis > .flot-tick-label.tickLabel").each(function (e, x) {
        x.innerHTML = parseInt(x.innerHTML) + " tC";
        x.style.left = (-x.clientWidth + 15) + "px";
    });

};