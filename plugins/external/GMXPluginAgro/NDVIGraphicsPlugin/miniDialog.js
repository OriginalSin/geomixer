/*
====================================================
    class MiniDialog
====================================================
*/
var MiniDialog = function (graphDialog) {
    this._currProd = "";
    this.graphDialog = graphDialog;
    //окно с опциями нового графика
    this._dialog = null;
    this.__minimenuClass = "ndviGraphOptions";
    this._createMenu();
    this.createContent();
    this._hovered = false;
    this._dontHide = false;
    this.visible = false;
};

MiniDialog.prototype._createMenu = function () {
    this.miniMenu = document.createElement("div");
    this.miniMenu.classList.add(this.__minimenuClass);
    this.miniMenu.style.display = "none";
    this.miniMenu.style.left = "100px";
    this.miniMenu.style.top = "100px";
    document.body.appendChild(this.miniMenu);

    var that = this;
    this.miniMenu.onmouseenter = function () {
        that._hovered = true;
    }

    this.miniMenu.onmouseleave = function () {
        if (!that._dontHide) {
            that.hide()
            that._hovered = false;
        }
    }
};

MiniDialog.prototype.showProductYearsList = function (prod, year) {
    if (document.getElementById("yearSel_" + prod)) {
        this._currProd = prod;
        for (var l in this.graphDialog.pluginParams.layers) {
            if (this.graphDialog.pluginParams.layers[l].ndviSource) {
                document.getElementById("yearSel_" + l).style.display = "none";
            }
        }
        document.getElementById("yearSel_" + prod).style.display = "block";
        document.getElementById("prodSel").value = prod;
    }
    if (year) {
        this.setYear(year);
    }
};

MiniDialog.prototype.setProductYear = function (prod, year) {
    if (document.getElementById("yearSel_" + prod)) {
        var years = this.graphDialog.pluginParams.layers[prod].years;
        year = parseInt(year);
        if (years.indexOf(year) != -1) {
            document.getElementById("yearSel_" + prod).value = year;
        } else {
            document.getElementById("yearSel_" + prod).value = years[years.length - 1];
        }
    }
};

MiniDialog.prototype.getProductYear = function (prod) {
    if (document.getElementById("yearSel_" + prod)) {
        return document.getElementById("yearSel_" + prod).value;
    }
};

MiniDialog.prototype.getProduct = function () {
    return this._currProd;
};

MiniDialog.prototype.getYear = function () {
    return this.getProductYear(this._currProd);
};

MiniDialog.prototype.setYear = function (year) {
    this.setProductYear(this._currProd, year);
};

MiniDialog.prototype.createContent = function () {
    var opts = "";
    var pluginParams = this.graphDialog.pluginParams;

    var defaultYears = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
    var yearSel = "";
    for (var l in pluginParams.layers) {
        if (pluginParams.layers[l].ndviSource) {
            opts += '<option value="' + l + '">' + (pluginParams.layers[l].caption || l) + '</option>';

            //готовим список годов для каждого продукта
            var yearsArray = defaultYears;
            yearsArray = pluginParams.layers[l].years || defaultYears;
            var yearsOpts = "";
            var i = yearsArray.length;
            while (i--) {
                yearsOpts += '<option value="' + yearsArray[i] + '">' + yearsArray[i] + '</option>';
            }
            yearSel += '<select id="yearSel_' + l + '">' + yearsOpts + '</select>'
        }
    }

    this.miniMenu.innerHTML =
        '<div class="ndvigraphics-leftarrowdiv"> \
          <div style="width:100%; height:100%;"> \
            <div style="width:100%; height:22px;margin-top: 5px;"> \
              <div class="ndvigraphics-comboDiv"> \
                <select id="prodSel">' + opts + '</select> \
              </div> \
              <div class="ndvigraphics-yearDiv">' + yearSel + '</div>  \
            </div> \
            <div style="width:100%;height:22px;margin-top: 5px;"> \
              <div id="ntDivBtnAdd"> \
                <button id="ntBtnAdd">OK</button> \
              </div> \
            </div> \
          </div> \
        </div>';

    var that = this;
    document.getElementById("ntBtnAdd").onclick = function () {
        //var year = parseInt(document.getElementById("yearInp").value);
        var year = that.getYear();
        var prod = that.getProduct();
        var feature = NDVIFieldsCallbackHandler.selectedFeature;
        ndviGraphicsManager.loadNDVIFeature(new NDVIFeature([feature]), prod, year);
        that.hide();
        ndviGraphicsManager._dialog.show();
    };

    var prodSel = document.getElementById("prodSel");
    prodSel.onmouseenter = function () {
        that._dontHide = true;
    };

    //prodSel.onchange = function () {
    //    that._dontHide = false;
    //};

    prodSel.onchange = function () {
        var selYear = that.getYear();
        that.showProductYearsList(this.value, selYear);
    };

    this.showProductYearsList("MODIS");
    this._currProd = "MODIS";
};

MiniDialog.prototype.show = function () {
    this.miniMenu.style.display = "block";
    this.visible = true;
};

MiniDialog.prototype.hide = function () {
    this.miniMenu.style.display = "none";
    this.visible = false;
};

MiniDialog.prototype.setPosition = function (x, y) {
    this.miniMenu.style.left = (x + 20) + "px";
    this.miniMenu.style.top = (y - 14) + "px";
};