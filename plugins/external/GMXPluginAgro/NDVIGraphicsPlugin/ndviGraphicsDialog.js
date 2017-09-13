/*
====================================================
    Контейнер - диалоговое окно
====================================================
*/
var GraphDialog = function () {
    this.maxWidth = 870;
    this.maxHeight = 371;
    this.minWidth = 605;
    this.minHeight = 371;
    this.hideWidth = 371;
    this._dialog = null;
    this.__dialogClass = "ndviGraphDialog";
    this.dialogContent = null;
    this._createDialog("Графики хода NDVI и погодных данных(тестовая версия)", this.maxWidth, this.maxHeight);
    this.collapsed = false;
    this.dialogHided = false;

    this.onresizestart = [];
    this.onresizestop = [];
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
        if (that.onresizestop.length) {
            for (var i = 0; i < that.onresizestop.length; i++) {
                that.onresizestop[i](event, ui);
            }
        }
    });

    $(this.dialog).bind("dialogresizestart", function (event, ui) {
        if (that.onresizestart.length) {
            for (var i = 0; i < that.onresizestart.length; i++) {
                that.onresizestart[i](event, ui);
            }
        }
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
==========================
    Координатная сетка
==========================
*/
var GraphGrid = function (graphDialog, name, enableGraphicType) {

    this._enableGraphicType = enableGraphicType || false;
    this.graphicType = 0;

    var cont = graphDialog.getContainer();

    this._name = name;
    this._graphDialog = graphDialog;
    this.tablo = L.DomUtil.create('div', 'ndvigraphics-tablo');
    this.tablo.id = "ndvigraphics-flot" + (name ? "-" + name : "");
    this.tablo.style.width = (cont.clientWidth - 230) + "px";
    this.tablo.style.height = this._getHeight(cont.clientHeight, 1);
    cont.appendChild(this.tablo);
    //создаем координатную плоскость
    this._plot = $.plot($(this.tablo), [{ "data": [], "label": "" }], NDVIGraphicsDialog.plotOptions[name] || NDVIGraphicsDialog.plotOptions.ndvi);

    //добавляем информационный балун
    this.createBalloonInfo();

    //переключатель накопленной суммы
    this.createGraphicTypeSelector();

    //вешаем обработчики наведения, клика на элементы графиков
    this._bindPlotListeners();

    //массив с графиками для $.plot
    this.graphicsArray = [];

    var that = this;
    graphDialog._dialogContainer.onresizestart.push(function (e) {
        that._plot.destroy();
    });

    graphDialog._dialogContainer.onresizestop.push(function (e) {
        that._applySize(e.target);
    });

    this.minValue = 0;
    this.maxValue = 0;

    this.onchangegraphictype = function (t) {
        that.setGraphicType(t);
    };
};

GraphGrid.prototype.setGraphicType = function (type) {
    if (type == this.graphicType) {
        return;
    }

    this.graphicType = type;

    if (type == 1) {
        this.maxValue = -100000000000;
        this.minValue = 1000000000000;
        for (var i = 0; i < this.graphicsArray.length; i++) {
            var d = this.graphicsArray[i].data;
            var sum = 0;
            for (var j = 0; j < d.length; j++) {
                sum += d[j][1];
                d[j][1] = sum;
                if (this.maxValue < sum) this.maxValue = sum;
                if (this.minValue > sum) this.minValue = sum;
            }
        }

    } else {
        for (var i = 0; i < this.graphicsArray.length; i++) {
            var d = this.graphicsArray[i].data;
            for (var j = d.length - 1; j > 0; j--) {
                d[j][1] -= d[j - 1][1];
            }
        };
        this.maxValue = NDVIGraphicsDialog.plotOptions[this._name].defaultMaxValue - 10;
        this.minValue = NDVIGraphicsDialog.plotOptions[this._name].defaultMinValue + 10;
    }

    NDVIGraphicsDialog.plotOptions[this._name].yaxis.max = Math.round(this.maxValue) + 10;
    NDVIGraphicsDialog.plotOptions[this._name].yaxis.min = Math.round(this.minValue) - 10;

    this._plot = $.plot(this.tablo, [{ "data": [], "label": "" }], NDVIGraphicsDialog.plotOptions[this._name] || NDVIGraphicsDialog.plotOptions.ndvi);
    this.createBalloonInfo();
    this.createGraphicTypeSelector();
    this.refresh();
};

GraphGrid.prototype.createBalloonInfo = function () {
    this.balloonDialog = L.DomUtil.create('div', 'ndvigraphics-balloon');
    this.balloonDialog.classList.add("ndvigraphics-balloon-" + this._name);
    if (this.graphicType == 1) {
        this.balloonDialog.classList.add("ndvigraphics-balloon-left");
    }
    this.tablo.appendChild(this.balloonDialog);
};

GraphGrid.prototype.createGraphicTypeSelector = function () {
    if (this._enableGraphicType) {
        var grSel = L.DomUtil.create('div', '');
        grSel.style.right = "11px";
        grSel.style.position = "absolute";
        grSel.style.top = "-10px";

        var that = this;

        var input0 = L.DomUtil.create('input', 'ntGraphicsTypeInput');
        input0.type = "radio";
        input0.name = "grType-" + this._name;
        input0.graphicType = 0;
        input0.checked = this.graphicType == 0 ? true : false;
        input0.onchange = function (e) {
            that.onchangegraphictype && that.onchangegraphictype(this.graphicType);
        };
        var label0 = L.DomUtil.create('label', 'ntGraphicsTypeLabel');
        label0.innerHTML = "Суточные";
        label0.style.paddingRight = "15px";

        grSel.appendChild(input0);
        grSel.appendChild(label0);

        var input1 = L.DomUtil.create('input', 'wGraphicsTypeInput');
        input1.type = "radio";
        input1.name = "grType-" + this._name;
        input1.graphicType = 1;
        input1.checked = this.graphicType == 1 ? true : false;
        input1.onchange = function (e) {
            that.onchangegraphictype && that.onchangegraphictype(this.graphicType);
        };
        var label1 = L.DomUtil.create('label', 'wGraphicsTypeLabel');
        label1.innerHTML = "Накопленные";

        grSel.appendChild(input1);
        grSel.appendChild(label1);

        this.tablo.appendChild(grSel);
    }
};

GraphGrid.prototype.remove = function () {

    NDVIGraphicsDialog.plotOptions[this._name].yaxis.max = NDVIGraphicsDialog.plotOptions[this._name].defaultMaxValue || 1;
    NDVIGraphicsDialog.plotOptions[this._name].yaxis.min = NDVIGraphicsDialog.plotOptions[this._name].defaultMinValue || 0;

    this._unbindPlotListeners();
    this._plot.destroy();
};

GraphGrid.prototype.refreshSize = function () {
    this._applySize(this._graphDialog.getContainer());
};

GraphGrid.prototype._applySize = function (target) {
    $(this.tablo).css("width", target.clientWidth - 230);
    $(this.tablo).css("height", this._getHeight(target.clientHeight));
    this._plot = $.plot($(this.tablo), [{ "data": [], "label": "" }], NDVIGraphicsDialog.plotOptions[this._name]);
    this.createBalloonInfo();
    this.createGraphicTypeSelector();
    this._bindPlotListeners();
    this.refresh();
};

GraphGrid.prototype._getHeight = function (clientHeight, inc) {
    var s = this._graphDialog.getGridsCount();

    if (s > 0 && inc) {
        return (clientHeight / (s + inc) - 40) + "px";
    }

    if (s == 0 || s == 1) {
        return (clientHeight / (s + (inc || 0)) - 60) + "px";
    }

    return (clientHeight / s - 40) + "px";
};

GraphGrid.prototype._unbindPlotListeners = function () {
    $(this.tablo).unbind("plothover");
    $(this.tablo).unbind("plotclick");
};

GraphGrid.prototype._bindPlotListeners = function () {

    this._unbindPlotListeners();

    var that = this;
    $(this.tablo).bind('plothover', function (event, pos, item) {

        that._graphDialog.cloneMiniDialog.hide();

        if (item) {
            if (item != that._graphDialog._overItem) {
                that._graphDialog._overItem = item;
                that._graphDialog.onPointOver && that._graphDialog.onPointOver(item);
            }
        } else {
            if (that._graphDialog._overItem) {
                that._graphDialog.onPointOut && that._graphDialog.onPointOut(null);
                that._graphDialog._overItem = null;
            }
        }
    });

    $(this.tablo).bind("plotclick", function (event, pos, item) {
        that._plot.unhighlight();
        if (item) {
            that._plot.highlight(item.series, item.dataIndex);
            that._graphDialog._selectedItem = item;
            that._graphDialog.onPointClick && that._graphDialog.onPointClick(item);
        } else {
            that._graphDialog._selectedItem = null;
            that._graphDialog.onEmptyClick && that._graphDialog.onEmptyClick();
        }
    });
};

GraphGrid.prototype.getGraphicData = function (ndviFeature) {
    for (var i = 0; i < this.graphicsArray.length; i++) {
        if (this.graphicsArray[i].properties.ndviFeature._id == ndviFeature._id) {
            return this.graphicsArray[i];
        }
    }
    return null;
};

GraphGrid.prototype.removeNDVIFeature = function (ndviFeature) {
    for (var i = 0; i < this.graphicsArray.length; i++) {
        if (this.graphicsArray[i].properties.ndviFeature._id == ndviFeature._id) {
            this.graphicsArray.splice(i, 1);
            break;
        }
    }
    this.refresh();
};

GraphGrid.prototype.refresh = function () {
    this._plot.setData(this.graphicsArray);
    this._plot.draw();
};

GraphGrid.prototype.addData = function (data) {

    if (this.graphicType == 1) {
        var maxValue = -100000000000;
        var minValue = 1000000000000;
        var d = data.data;
        var sum = 0;
        for (var j = 0; j < d.length; j++) {
            sum += d[j][1];
            d[j][1] = sum;
            if (maxValue < sum) maxValue = sum;
            if (minValue > sum) minValue = sum;
        }
        var change = false;
        if (maxValue > this.maxValue) {
            this.maxValue = maxValue;
            change = true;
        }
        if (minValue < this.minValue) {
            this.minValue = minValue;
            change = true;
        }
        if (change) {
            NDVIGraphicsDialog.plotOptions[this._name].yaxis.max = Math.round(this.maxValue) + 10;
            NDVIGraphicsDialog.plotOptions[this._name].yaxis.min = Math.round(this.minValue) - 10;

            this._plot = $.plot(this.tablo, [{ "data": [], "label": "" }], NDVIGraphicsDialog.plotOptions[this._name] || NDVIGraphicsDialog.plotOptions.ndvi);
            this.createBalloonInfo();
            this.createGraphicTypeSelector();
        }
    }

    this.graphicsArray.push(data);
    this.refresh();
};

GraphGrid.prototype.setBalloonInfoHtml = function (html) {
    this.balloonDialog.innerHTML = html;
};

GraphGrid.prototype.setBalloonInfoVisibility = function (visibility) {
    if (visibility) {
        this.balloonDialog.style.display = "block";
    } else {
        this.balloonDialog.style.display = "none";
    }
};


/*
====================================================
    class NDVIGraphicsDialog
====================================================
*/
var NDVIGraphicsDialog = function (dialogContainer, params) {

    this.pluginParams = params;

    dialogContainer.hide();

    this.bottomContainer = null;
    this.listContainer = null;

    this._dialogContainer = dialogContainer;

    var cont = dialogContainer.getContainer();
    this.getContainer = function () {
        return dialogContainer.getContainer();
    };

    /*
    ======================
      Координатные сетки  
    ======================
    */
    this.graphGrids = {};

    //колбэки
    this.onPointClick = null;
    this.onEmptyClick = null;
    this.onPointOver = null;
    this.onPointOut = null;

    //нижний контейнер
    this.bottomContainer = L.DomUtil.create('div', 'ndvigraphics-bottom');
    this._bottomWarning = L.DomUtil.create('div', 'ndvigraphics-bottom');
    this._bottomWarning.style.marginBottom = "41px";
    this._bottomWarning.innerHTML = '<div style="position:absolute; padding-left: 20px; font-size: 14px;">Выберите точку на графике</div>';
    this._bottomWarning.style.display = "block";
    this.bottomContainer.id = "ndvigraphics-bottom";
    this.bottomContainer.style.display = "none";
    cont.appendChild(this.bottomContainer);
    cont.appendChild(this._bottomWarning);

    //правый контейнер
    this.listContainer = L.DomUtil.create('div', 'ndvigraphics-right');
    this.listContainer.id = "ndvigraphics-right";
    cont.appendChild(this.listContainer);

    //кнопка очистить все
    var btnClear = L.DomUtil.create('div', 'ntBtnCleanAll');
    btnClear.id = "ntBtnCleanAll";
    cont.appendChild(btnClear);
    var that = this;
    btnClear.onclick = function () {
        that.onclear();
    };

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

    this.createBottomPanel();

    //сдвигаем подписи на осях
    $(".flot-x-axis .flot-tick-label.tickLabel").css("margin-left", "10px");
    $(".flot-y-axis .flot-tick-label.tickLabel").css("margin-left", "-15px");
};

NDVIGraphicsDialog.prototype.getGridsCount = function () {
    var count = 0;
    for (var i in this.graphGrids) {
        count++;
    }
    return count;
};

NDVIGraphicsDialog.prototype.clearAll = function () {
    for (var i in this.graphGrids) {
        this.graphGrids[i].remove();
    }
    this.graphGrids = {};
    this._dialogContainer.onresizestart = [];
    this._dialogContainer.onresizestop = [];
    $(".ndvigraphics-tablo").remove();
};

NDVIGraphicsDialog.prototype.setBottomVisibility = function (visibility) {
    if (visibility) {
        this.bottomContainer.style.display = "block";
        this._bottomWarning.style.display = "none";
    } else {
        this.bottomContainer.style.display = "none";
        this._bottomWarning.style.display = "block";
    }
};

NDVIGraphicsDialog.prototype.setMinimized = function (minimized) {
    if (!this._minimized && minimized) {
        this._minimized = true;
        this.listContainer.style.display = "none";
        this.getContainer().classList.add("ndvigraphics-control-minimilzed");
        for (var g in this._graphGrids) {
            this._graphGrids[g].balloonDialog.classList.add("ndvigraphics-balloon-minimized");
        }
    } else if (!minimized) {
        this._minimized = false;
        this.listContainer.style.display = "block";
        this.getContainer().classList.remove("ndvigraphics-control-minimilzed");
        for (var g in this._graphGrids) {
            this._graphGrids[g].balloonDialog.classList.remove("ndvigraphics-balloon-minimized");
        }
    }
};

NDVIGraphicsDialog.prototype.setBalloonInfoHtml = function (html, gridName) {
    gridName = gridName || "ndvi";
    this.graphGrids[gridName].setBalloonInfoHtml(html);
};

NDVIGraphicsDialog.prototype.setBalloonInfoVisibility = function (visibility, gridName) {
    gridName = gridName || "ndvi";
    this.graphGrids[gridName].setBalloonInfoVisibility(visibility);
};

//Добавление в список графиков
NDVIGraphicsDialog.prototype.addNDVIFeatureRight = function (ndviFeature, afterNode) {
    var graphInfo = L.DomUtil.create('div', 'ndvigraphics-graphinfo-container');
    ndviFeature.divInfo = graphInfo;
    graphInfo.ndviFeature = ndviFeature;
    var color = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-color');
    graphInfo.colorDiv = color;
    color.classList.add("ndvigraphics-graphinfo-loading");

    var year = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-year');
    ndviFeature.divInfo.divYear = year;
    year.innerHTML = '<b>' + ndviFeature._year + " г.</b>";

    var descr = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-descr');
    var str = this.pluginParams.layers[ndviFeature._product].caption || ndviFeature._product;
    descr.innerHTML = str;
    descr.onclick = function () {
        nsGmx.leafletMap.setView(ndviFeature.getCenter());
    };

    var btnClose = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-btnClose');
    var that = this;
    btnClose.onclick = function () {
        if (that._selectedItem && that._selectedItem.series.properties.ndviFeature._id == ndviFeature._id) {
            ndviFeature._graphGrid._plot.unhighlight();
        }
        ndviFeature.clear();
        GraphDialog.removeElement(graphInfo);
        that.cloneMiniDialog.hide();
    };

    var vis = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-visib');
    var chkVis = L.DomUtil.create('input');
    chkVis.type = "checkbox";
    vis.appendChild(chkVis);
    chkVis.checked = true;
    chkVis.onchange = function () {
        ndviFeature.setVisibility(this.checked);
    };

    var btnCsv = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-btnCsv');
    btnCsv.title = "Скачать данные";
    btnCsv.onclick = function () {
        ndviFeature.importCSV();
    };

    var btnClone = L.DomUtil.create('div', 'ndvigraphics-graphinfo ndvigraphics-graphinfo-btnClone');
    btnClone.onclick = function () {
        var rect = btnClone.getBoundingClientRect();
        that.cloneMiniDialog.setPosition(rect.left, rect.top);
        that.cloneMiniDialog.show();
        that.cloneMiniDialog.showProductYearsList(ndviFeature._product);
        that.cloneMiniDialog.setYear(ndviFeature._year);
        that.cloneMiniDialog.onclone = function () {
            that.cloneMiniDialog.hide();
            that.onclone && that.onclone(ndviFeature);
        }

    };

    btnClone.title = "Создать копию";
    btnClone.onmouseenter = function () {
        that.cloneMiniDialog._buttonHovered = true;
    };

    btnClone.onmouseleave = function () {
        that.cloneMiniDialog._buttonHovered = false;
        setTimeout(function () {
            if (!that.cloneMiniDialog._hovered) {
                that.cloneMiniDialog.hide();
            }
        }, 100);
    };

    graphInfo.appendChild(vis);
    graphInfo.appendChild(color);
    graphInfo.appendChild(descr);
    graphInfo.appendChild(year);
    graphInfo.appendChild(btnClose);
    graphInfo.appendChild(btnClone);
    graphInfo.appendChild(btnCsv);

    $(color).colpick({
        colorScheme: 'dark',
        layout: 'rgbhex',
        color: ndviFeature._color,
        onChange: function (hsb, hex, rgb, el) {
            ndviFeature.setColor('#' + hex);
        },
        onSubmit: function (hsb, hex, rgb, el) {
            ndviFeature.setColor('#' + hex);
            $(el).colpickHide();
        },
        onBeforeShow: function (el) {
            setTimeout(function () {
                el.style.left = (parseInt(el.style.left.substr(0, el.style.left.length - 2)) - 100) + "px";
            }, 0);
        }
    });

    if (afterNode) {
        NDVIGraphicsDialog.insertAfter(graphInfo, afterNode);
    } else {
        this.listContainer.appendChild(graphInfo);
    }

    $(".colpick").css("zIndex", 50000);
};

NDVIGraphicsDialog.insertAfter = function (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};


NDVIGraphicsDialog.addRadioButton = function (parentNode, id, groupName, value, label, checked, onchange, onlegend) {
    var div = L.DomUtil.create('div', 'ndvigraphics-radiosgroup');

    var radBtn = L.DomUtil.create('input', 'ndvigraphics-radio');
    radBtn.type = "radio";
    radBtn.value = value;
    radBtn.name = groupName;
    radBtn.checked = checked;
    id && (radBtn.id = id);
    radBtn.onchange = function () {
        onchange && onchange(this);
    };

    div.appendChild(radBtn);

    var radLbl = L.DomUtil.create('div', 'ndvigraphics-radioLabel');
    radLbl.innerHTML = label;
    radLbl.radioButton = radBtn;
    radLbl.onclick = function () {
        radBtn.checked = true;
        onchange && onchange(radBtn);
    };

    div.appendChild(radLbl);

    if (onlegend) {
        var leg = L.DomUtil.create('span', 'layerInfoButton');
        leg.innerHTML = "i";
        leg.title = "Легенда";
        leg.style.float = "left";
        leg.style.paddingTop = "2px";
        leg.onclick = function () {
            onlegend(this);
        };
        div.appendChild(leg);
    }

    parentNode.appendChild(div);
};


NDVIGraphicsDialog.prototype.createBottomPanel = function () {
    this.createMODISPanel();
    this.createLANDSATPanel();
    this.createEmptyPanel();
};

NDVIGraphicsDialog.prototype.createEmptyPanel = function () {
    var sel = L.DomUtil.create('div', 'ndvigraphics-optionsPanel');
    sel.id = "ndvigraphics-label-empty";
    sel.style.display = "none";

    var panelOne = L.DomUtil.create('div', 'ndvigraphics-prod-panel');
    var panelTwo = L.DomUtil.create('div', 'ndvigraphics-prod-panel');
    var panelThree = L.DomUtil.create('div', 'ndvigraphics-prod-panel');

    sel.appendChild(panelOne);
    sel.appendChild(panelTwo);
    sel.appendChild(panelThree);

    var that = this;
    NDVIGraphicsDialog.addRadioButton(panelOne, "ndvi_modis", "emptyGroup", "ndvi_modis", "Композит NDVI", true, function (e) { that.onmodisndvi(e) }, function () { AgroLegend.legendNdvi.changeVisibility(); });

    this.bottomContainer.appendChild(sel);
};

NDVIGraphicsDialog.prototype.createMODISPanel = function () {
    var selMODIS = L.DomUtil.create('div', 'ndvigraphics-optionsPanel');
    selMODIS.id = "ndvigraphics-label-modis";

    var panelOne = L.DomUtil.create('div', 'ndvigraphics-prod-panel');
    var panelTwo = L.DomUtil.create('div', 'ndvigraphics-prod-panel');
    var panelThree = L.DomUtil.create('div', 'ndvigraphics-prod-panel');

    selMODIS.appendChild(panelOne);
    selMODIS.appendChild(panelTwo);
    selMODIS.appendChild(panelThree);

    var that = this;
    NDVIGraphicsDialog.addRadioButton(panelOne, "ndvi_modis", "modisGroup", "ndvi_modis", "Композит NDVI", true, function (e) { that.onmodisndvi(e) }, function () { AgroLegend.legendNdvi.changeVisibility(); });
    NDVIGraphicsDialog.addRadioButton(panelOne, "quality_modis", "modisGroup", "quality_modis", "Оценка качества", false, function (e) { that.onmodisquality(e); }, function () { AgroLegend.legendQuality.changeVisibility(); });
    NDVIGraphicsDialog.addRadioButton(panelTwo, "vci_modis", "modisGroup", "vci_modis", "Условия вегетации", false, function (e) { that.onmodisvci(e); }, function () { AgroLegend.legendConditionsOfVegetation.changeVisibility(); });

    this.bottomContainer.appendChild(selMODIS);
};

NDVIGraphicsDialog.prototype.createLANDSATPanel = function () {
    var selLANDSAT = L.DomUtil.create('div', 'ndvigraphics-optionsPanel');
    selLANDSAT.id = "ndvigraphics-label-hr";
    selLANDSAT.style.display = "none";

    var panelOne = L.DomUtil.create('div', 'ndvigraphics-prod-panel');
    var panelTwo = L.DomUtil.create('div', 'ndvigraphics-prod-panel');
    var panelThree = L.DomUtil.create('div', 'ndvigraphics-prod-panel');

    selLANDSAT.appendChild(panelOne);
    selLANDSAT.appendChild(panelTwo);
    selLANDSAT.appendChild(panelThree);

    var that = this;
    NDVIGraphicsDialog.addRadioButton(panelOne, "rgb_hr", "landsatGroup", "rgb_hr", "Снимок-ИК", false, function (e) { that.onhrrgb(e); });
    NDVIGraphicsDialog.addRadioButton(panelOne, "rgb2_hr", "landsatGroup", "rgb2_hr", "Снимок", false, function (e) { that.onhrrgb2(e); });
    NDVIGraphicsDialog.addRadioButton(panelTwo, "ndvi_hr", "landsatGroup", "ndvi_hr", "NDVI", true, function (e) { that.onhrndvi(e); }, function () { AgroLegend.legendNdvi.changeVisibility(); });
    NDVIGraphicsDialog.addRadioButton(panelTwo, "class_hr", "landsatGroup", "class_hr", "Состояние полей", false, function (e) { that.onhrclass(e); }, function () { AgroLegend.legendClassification.changeVisibility(); });
    NDVIGraphicsDialog.addRadioButton(panelThree, "ndviMean_hr", "landsatGroup", "ndviMean_hr", "NDVI-среднее", false, function (e) { that.onhrndvimean(e); }, function () { AgroLegend.legendNdvi.changeVisibility(); });
    NDVIGraphicsDialog.addRadioButton(panelThree, "homogen_hr", "landsatGroup", "homogen_hr", "Однородность", false, function (e) { that.onhrhomogenuity(e); }, function () { AgroLegend.legendInhomogenuity.changeVisibility(); });

    this.bottomContainer.appendChild(selLANDSAT);
};
NDVIGraphicsDialog.plotOptions = {};

NDVIGraphicsDialog.plotOptions.precip = {
    defaultMaxValue: 100,
    defaultMinValue: 0,
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

NDVIGraphicsDialog.plotOptions.temperature = {
    defaultMaxValue: 50,
    defaultMinValue: -50,
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

NDVIGraphicsDialog.plotOptions.ndvi = {
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
        max: 1,
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

NDVIGraphicsDialog.prototype.addNDVIFeature = function (ndviFeature) {
    if (!this.graphGrids[ndviFeature._gridName]) {
        this.graphGrids[ndviFeature._gridName] = new GraphGrid(this, ndviFeature._gridName,
            this.pluginParams.layers[ndviFeature._product].weatherType);
    }
    for (var i in this.graphGrids) {
        this.graphGrids[i].refreshSize();
    }
    ndviFeature._graphGrid = this.graphGrids[ndviFeature._gridName];
    this.graphGrids[ndviFeature._gridName].addData(ndviFeature.graphData);
};