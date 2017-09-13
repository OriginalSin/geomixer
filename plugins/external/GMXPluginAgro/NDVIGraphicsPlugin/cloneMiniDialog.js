/*
====================================================
    class CloneMiniDialog
====================================================
*/
var CloneMiniDialog = function (graphDialog) {
    this.graphDialog = graphDialog;
    this._currProd = "";
    //окно с опциями нового графика
    this._dialog = null;
    this.__minimenuClass = "ndviGraphOptions";
    this._createMenu();
    this.createContent();
    this._hovered = false;
    this.onclone = null;
    this.visible = false;
};

CloneMiniDialog.prototype._createMenu = function () {
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
        setTimeout(function () {
            if (!that._dontHide && !that._hovered) {
                that.hide()
            }
        }, 100);
        that._hovered = false;
    }
};

CloneMiniDialog.prototype.showProductYearsList = function (prod, year) {
    if (document.getElementById("yearSelClone_" + prod)) {
        this._currProd = prod;
        for (var l in this.graphDialog.pluginParams.layers) {
            if (this.graphDialog.pluginParams.layers[l].grid) {
                var el = document.getElementById("yearSelClone_" + l);
                if (el)
                    document.getElementById("yearSelClone_" + l).style.display = "none";
            }
        }
        document.getElementById("yearSelClone_" + prod).style.display = "block";
        document.getElementById("prodSel_clone").value = prod;
    }
    if (year) {
        this.setYear(year);
    }
};

CloneMiniDialog.prototype.setProductYear = function (prod, year) {
    if (document.getElementById("yearSelClone_" + prod)) {
        var years = this.graphDialog.pluginParams.layers[prod].years;
        year = parseInt(year);
        if (years.indexOf(year) != -1) {
            document.getElementById("yearSelClone_" + prod).value = year;
        } else {
            document.getElementById("yearSelClone_" + prod).value = years[years.length - 1];
        }
    }
};

CloneMiniDialog.prototype.getProductYear = function (prod) {
    if (document.getElementById("yearSelClone_" + prod)) {
        return document.getElementById("yearSelClone_" + prod).value;
    }
};

CloneMiniDialog.prototype.getYear = function () {
    return this.getProductYear(this._currProd);
};

CloneMiniDialog.prototype.setYear = function (year) {
    this.setProductYear(this._currProd, year);
};

CloneMiniDialog.prototype.getProduct = function () {
    return this._currProd;
};

CloneMiniDialog.prototype.createContent = function () {
    var opts = "";
    var pluginParams = this.graphDialog.pluginParams;

    var defaultYears = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
    var yearSel = "";

    for (var l in pluginParams.layers) {
        if (!pluginParams.layers[l].admin || pluginParams.layers[l].admin && !NDVIGraphicsManager._userRole) {
            if (pluginParams.layers[l].grid) {
                opts += '<option value="' + l + '">' + (pluginParams.layers[l].caption || l) + '</option>';

                //готовим список годов для каждого продукта
                var yearsArray = defaultYears;
                yearsArray = pluginParams.layers[l].years || defaultYears;
                var yearsOpts = "";
                var i = yearsArray.length;
                while (i--) {
                    yearsOpts += '<option value="' + yearsArray[i] + '">' + yearsArray[i] + '</option>';
                }
                yearSel += '<select id="yearSelClone_' + l + '">' + yearsOpts + '</select>'
            }
        }
    }

    this.miniMenu.innerHTML =
        '<div class="ndvigraphics-toparrowdiv"> \
          <div style="width:100%; height:100%;"> \
            <div style="width:100%; height:22px;margin-top: 5px;"> \
              <div class="ndvigraphics-comboDiv"> \
                <select id="prodSel_clone">' + opts + '</select> \
              </div> \
              <div class="ndvigraphics-yearDivSelect" id="yearSel_cloneId">' + yearSel + '</div>  \
            </div> \
            <div style="width:100%;height:22px;margin-top: 5px;"> \
              <div id="ntDivBtnAdd"> \
                <button id="ntBtnAdd_clone">OK</button> \
              </div> \
            </div> \
          </div> \
        </div>';

    var that = this;
    document.getElementById("ntBtnAdd_clone").onclick = function () {
        that.onclone && that.onclone();
    };

    var prodSel = document.getElementById("prodSel_clone");
    prodSel.onmouseenter = function () {
        that._dontHide = true;
    };
    prodSel.onchange = function () {
        var selYear = that.getYear();
        that.showProductYearsList(this.value, selYear);
    };

    var yearSel = document.getElementById("yearSel_cloneId");
    yearSel.onmouseenter = function () {
        that._dontHide = true;
    };
    yearSel.onchange = function () {
        that._dontHide = true;
    };

    this.showProductYearsList("MODIS");
};

CloneMiniDialog.prototype.show = function () {
    this.miniMenu.style.display = "block";
    this.visible = true;
};

CloneMiniDialog.prototype.hide = function () {
    this.miniMenu.style.display = "none";
    this.visible = false;
};

CloneMiniDialog.prototype.setPosition = function (x, y) {
    this.miniMenu.style.left = (x - 125) + "px";
    this.miniMenu.style.top = (y + 27) + "px";
};