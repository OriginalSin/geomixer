/*
=======================================================
    NDVIFieldsCallbackHandler
=======================================================
*/

var NDVIFieldsCallbackHandler = function (params) {
    this.pluginParams = params;
    this._overFeature = null;
    this.ondoubleclickCallback = null;
    this.oncontextmenuCallback = null;
    this.onoptionsmenuclickCallback = null;
    this.onoptionsmenuleaveCallback = null;
    this.ontitleCallback = null;
    this.oncloseCallback = null;
    this.onclickCallback = null;
};

NDVIFieldsCallbackHandler.prototype.getFieldLayers = function () {
    var fieldLayers = [];
    var that = this;
    var layers = NDVIGraphicsManager.layerCollection;
    $.each(layers, function (i, l) {
        var v = l.getGmxProperties();
        if (!($.isEmptyObject(v.MetaProperties)))
            if (!($.isEmptyObject(v.MetaProperties.product)))
                if ($.trim(v.MetaProperties.product.Value) == "fields" || $.trim(v.MetaProperties.product.Value) == "fields_aggregation")
                    if (!($.isEmptyObject(v.MetaProperties.project)) && ($.trim(v.MetaProperties.project.Value) == "InsuranceGeo" ||
                            $.trim(v.MetaProperties.project.Value) == "cosmosagro")) {
                        fieldLayers.push(layers[v.name]);
                        layers[v.name].on('popupclose', function () {
                            that.oncloseCallback && that.oncloseCallback(v);
                        });
                    }
    });
    return fieldLayers;
};

NDVIFieldsCallbackHandler.prototype.applyOptions = function (field) {

    var that = this;

    field.on("mouseover", function (feature) {
        if (!that._overFeature) {
            //останавливаем зуммирование по двойному клику
            //nsGmx.leafletMap.doubleClickZoomGMX.disable();
            //gmxAPI.map.addContextMenuItem('<div id="showGraphic">Показать ход NDVI</div>', function () { });
        }
        that._overFeature = feature;
    });

    field.on("mouseout", function (feature) {
        //gmxAPI.map.removeContextMenuItem('<div id="showGraphic">Показать ход NDVI</div>');
        //возобновляем зуммирование по двоййному клику
        //nsGmx.leafletMap.doubleClickZoomGMX.enable();
        that._overFeature = null;
    });

    this._applyBaloonMenu(field);
};

NDVIFieldsCallbackHandler.prototype.initialize = function () {

    var fieldLayers = this.getFieldLayers();
    for (var j = 0; j < fieldLayers.length; j++) {
        this.applyOptions(fieldLayers[j]);
    }

    var that = this;
    nsGmx.leafletMap.on("dblclick", function () {
        if (that._overFeature && that.ondoubleclickCallback)
            that.ondoubleclickCallback(that._overFeature);
    });

    nsGmx.leafletMap.on("click", function () {
        if (that._overFeature && that.onclickCallback)
            that.onclickCallback(that._overFeature);
    });

    nsGmx.leafletMap.on('contextmenu', function (e) {
        var feature = that._overFeature;
        if (document.getElementById("showGraphic")) {
            document.getElementById("showGraphic").onclick = function () {
                if (feature && that.oncontextmenuCallback)
                    that.oncontextmenuCallback(feature);
            }
        }
    });
};

NDVIFieldsCallbackHandler.prototype._applyBaloonMenu = function (filter) {
    var that = this;
    filter.addPopupHook("_ndviBalloonHook", function (obj, div, node) {
        NDVIFieldsCallbackHandler.selectedFeature = { obj: obj, attr: { layer: filter } };
        that.createOptionsContent(div);
    });
};


NDVIFieldsCallbackHandler.prototype.createOptionsContent = function (parent) {
    var opts = "";
    var pluginParams = this.pluginParams;
    var defaultProd = "LANDSAT8";
    var defaultYears = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
    var yearSel = "";
    for (var l in pluginParams.layers) {
        if (pluginParams.layers[l].grid) {
            if (!pluginParams.layers[l].admin || pluginParams.layers[l].admin && !NDVIGraphicsManager._userRole) {
                opts += '<option value="' + l + '">' + (pluginParams.layers[l].caption || l) + '</option>';

                //готовим список годов для каждого продукта
                var yearsArray = defaultYears;
                yearsArray = pluginParams.layers[l].years || defaultYears;
                var yearsOpts = "";
                var i = yearsArray.length;
                while (i--) {
                    var inpId = "inpSel_" + l + "_" + yearsArray[i];
                    yearsOpts += '<div class="ntYearInpDiv"><input ' + (i == yearsArray.length - 1 ? 'checked="checked"' : "") +
                        ' type="checkbox" name="yearSel_' + l + '" id="' + inpId + '" class="ntYearInp" value="' + yearsArray[i] +
                        '"></div><div for="' + inpId + '" class="ntYearInpLabel">' + yearsArray[i] + '</div>';
                }
                if (l == defaultProd) {
                    yearSel += '<div id="yearSel_' + l + '" class="yearSelList" style="display:block">' + yearsOpts + '</div>';
                } else {
                    yearSel += '<div id="yearSel_' + l + '" class="yearSelList" style="display:none">' + yearsOpts + '</div>';
                }
            }
        }
    }

    var optionsMenu =
        '<div class="ntGraphivsOptionsBalloon"> \
          <div> \
            <div> \
              <div id="ntGraphOptsPrevYear" style="display:none;"></div> \
              <div class="ndvigraphics-yearDiv">' + yearSel + '</div>  \
              <div id="ntGraphOptsNextYear"></div> \
            </div> \
            <div style="width:100%;padding-top: 7px;"> \
              <div class="ndvigraphics-comboDiv"> \
                <select id="prodSel">' + opts + '</select> \
              </div> \
              <div id="ntDivBtnAdd"> \
                <button id="ntBtnAdd">Построить график</button> \
              </div> \
            </div> \
          </div> \
        </div>';

    var div = document.createElement('div');
    div.style.paddingTop = "15px";
    div.style.height = "60px";
    div.innerHTML = optionsMenu;
    parent.appendChild(div);

    var that = this;

    setTimeout(function () {

        $(".ndvigraphics-yearDiv").css("width", parent.clientWidth - 8);

        document.getElementById("ntBtnAdd").onclick = function () {
            var years = that.getYears();
            var prod = that.getProduct();
            var feature = NDVIFieldsCallbackHandler.selectedFeature;
            if (years.length) {
                for (var i = 0; i < years.length; i++) {
                    ndviGraphicsManager.loadNDVIFeature(new NDVIFeature([feature]), prod, years[i]);
                }
                ndviGraphicsManager._dialog.show();
            }
        };

        document.getElementById("ntGraphOptsPrevYear").onclick = function () {
            scrollAnim(-10);
        };

        document.getElementById("ntGraphOptsNextYear").onclick = function () {
            document.getElementById("ntGraphOptsPrevYear").style.display = "block";
            scrollAnim(+10);
        };

        var timer = null;
        NDVIFieldsCallbackHandler.chkSize = 58;
        var size = NDVIFieldsCallbackHandler.chkSize * 3;
        var nextStop = 0;
        function scrollAnim(step) {
            nextStop = Math.floor($(".ndvigraphics-yearDiv")[0].scrollLeft / size) * size + (step > 0 ? size : -size);
            var yl = that.pluginParams.layers[that._currProd].years.length * NDVIFieldsCallbackHandler.chkSize - NDVIFieldsCallbackHandler.chkSize * 4;

            if (nextStop >= yl) {
                document.getElementById("ntGraphOptsNextYear").style.display = "none";
            } else {
                document.getElementById("ntGraphOptsNextYear").style.display = "block";
            }

            if (nextStop <= 0) {
                document.getElementById("ntGraphOptsPrevYear").style.display = "none";
            }

            if (nextStop >= 0 && (nextStop <= yl)) {
                clearInterval(timer);
                timer = setInterval(function () {
                    var pos = $(".ndvigraphics-yearDiv")[0].scrollLeft;
                    pos += step;
                    if (step > 0) {
                        if (pos >= nextStop) {
                            $(".ndvigraphics-yearDiv")[0].scrollLeft = nextStop;
                            clearInterval(timer);
                        } else {
                            $(".ndvigraphics-yearDiv")[0].scrollLeft = pos;
                        }
                    } else {
                        if (pos <= nextStop || nextStop < 0) {
                            $(".ndvigraphics-yearDiv")[0].scrollLeft = nextStop;
                            clearInterval(timer);
                        } else {
                            $(".ndvigraphics-yearDiv")[0].scrollLeft = pos;
                        }
                    }
                }, 10);
            }
        }

        var prodSel = document.getElementById("prodSel");

        prodSel.onchange = function () {
            var selYears = that.getYears();
            that.showProductYearsList(this.value, selYears);
        };

        that.showProductYearsList(defaultProd);
        that._currProd = defaultProd;
    }, 200);
};

NDVIFieldsCallbackHandler.prototype.showProductYearsList = function (prod, yearsArr) {
    if (document.getElementById("yearSel_" + prod)) {
        this._currProd = prod;
        for (var l in this.pluginParams.layers) {
            if (this.pluginParams.layers[l].grid) {
                document.getElementById("yearSel_" + l).style.display = "none";
            }
        }
        document.getElementById("yearSel_" + prod).style.display = "block";
        document.getElementById("prodSel").value = prod;
    }
    if (yearsArr) {
        this.setYears(yearsArr);
        var yl = this.pluginParams.layers[prod].years.length * NDVIFieldsCallbackHandler.chkSize - NDVIFieldsCallbackHandler.chkSize * 4;
        if (yl <= 0) {
            $(".ndvigraphics-yearDiv")[0].scrollLeft = 0;
        }
    }

    if (this.pluginParams.layers[prod].years.length * 53 <= $(".ndvigraphics-yearDiv")[0].clientWidth) {
        document.getElementById("ntGraphOptsNextYear").style.display = "none"
    } else {
        document.getElementById("ntGraphOptsNextYear").style.display = "block";
    }
};


NDVIFieldsCallbackHandler.prototype.setProductYears = function (prod, years) {
    var chkArr = document.getElementsByName("yearSel_" + prod);

    for (var i = 0; i < chkArr.length; i++) {
        chkArr[i].checked = false;
    }

    for (var i = 0; i < years.length; i++) {
        var chk = document.getElementById("inpSel_" + prod + "_" + years[i]);
        if (chk)
            chk.checked = true;
    }
};

NDVIFieldsCallbackHandler.prototype.getProductYears = function (prod) {
    var chkArr = document.getElementsByName("yearSel_" + prod);
    var res = []
    for (var i = 0; i < chkArr.length; i++) {
        if (chkArr[i].checked) {
            res.push(parseInt(chkArr[i].value));
        }
    }
    return res;
};

NDVIFieldsCallbackHandler.prototype.getProduct = function () {
    return this._currProd;
};

NDVIFieldsCallbackHandler.prototype.getYears = function () {
    return this.getProductYears(this._currProd);
};

NDVIFieldsCallbackHandler.prototype.setYears = function (years) {
    this.setProductYears(this._currProd, years);
};