var AgroLegend = function (options) {
    options = options || {};
    this._legendHash = options.legend ? AgroLegend._compile[options.legendType](options.legend) : {};
    this._continuousTable = options.continuousTable;
    this.dialog = null;
    this.dialogContent = null;
    this._sort = options.sort;
    this._horizontal = options.horizontal;
    this.description = options.description || null;
    this.descriptionWidth = options.descriptionWidth || 640;
    this.descriptionHeight = options.descriptionHeight || 480;
    //это не тот description что выше, совсем другой.
    this._descriptionCallback = options.descriptionCallback;
    this.__dialogClass = "dlgLegend_" + AgroLegend.__dialogCounter++;
    this._createDialog(options.caption, options.width, options.height);
    this._sortField = options.sortField;
    if (!$.isEmptyObject(this._legendHash)) {
        this._createTable();
    }
    this.bottomHtml = options.bottomHtml || "";
};

AgroLegend.__dialogCounter = 0

AgroLegend.RGBToString = function (r, g, b) {
    var d = r + 256 * g + 65536 * b;
    return d.toString(16);
};

AgroLegend.toHex = function (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

AgroLegend.RGBToHex = function (r, g, b) {
    return "#" + AgroLegend.toHex(r) + AgroLegend.toHex(g) + AgroLegend.toHex(b);
};

AgroLegend.prototype.loadLegend = function (url, legendType) {
    var that = this;
    shared.loadPaletteSync(url).then(function (pal) {
        that.applyLegend(pal, legendType);
    });
    //var that = this;
    //$.ajax({
    //    url: url,
    //    type: 'GET',
    //    dataType: AgroLegend._dataType[legendType]
    //}).done(function (legend) {
    //    that.applyLegend(legend, legendType)
    //});
};

AgroLegend.prototype.applyLegend = function (palette, legendType) {
    this.clear();
    this._legendHash = AgroLegend._compile[legendType](palette, this._descriptionCallback);
    this._createTable();
};

AgroLegend.prototype.clear = function () {
    this._legendHash = {};
    $(this.dialogContent.get(0)).empty();
};

AgroLegend.compileClassificationLegend = function (legend, callback) {
    var res = {};

    var i = legend.length;
    while (i--) {
        var li = legend[i];
        if (callback)
            li.description = callback(li.description);
        res[AgroLegend.RGBToString(li.r, li.g, li.b)] = li;
    }

    return res;
};

AgroLegend.compileNDVILegend = function (pal, callback) {
    var res = {};

    var r, g, b, code, counter = 0;
    for (var i = 0; i < pal.length; i++) {
        var pi = pal[i];
        if (pi) {
            r = pi.partRed;
            g = pi.partGreen;
            b = pi.partBlue;
            code = i - 97;
            res[AgroLegend.RGBToString(r, g, b)] = { "class": counter++, "r": r, "g": g, "b": b, "description": (callback ? callback(code) : code) };
        }
    }

    return res;
};

AgroLegend.NDVI = 0;
AgroLegend.AGRO = 1;

AgroLegend._compile = [];
AgroLegend._compile[AgroLegend.NDVI] = AgroLegend.compileNDVILegend;
AgroLegend._compile[AgroLegend.AGRO] = AgroLegend.compileClassificationLegend;

AgroLegend._dataType = [];
AgroLegend._dataType[AgroLegend.NDVI] = "xml";
AgroLegend._dataType[AgroLegend.AGRO] = "json";

AgroLegend.prototype.getLegendByRGB = function (r, g, b) {
    return this._legendHash[AgroLegend.RGBToString(r, g, b)];
};

AgroLegend.prototype.setVisibility = function (visibility) {
    if (visibility)
        this.show();
    else
        this.hide();
};

AgroLegend.prototype.getVisibility = function () {
    return $("." + this.__dialogClass)[0].style.display != "none";
}

AgroLegend.prototype.show = function () {
    $("." + this.__dialogClass).show();
    $(this.dialog).dialog();
};

AgroLegend.prototype.hide = function () {
    $("." + this.__dialogClass).hide();
};

AgroLegend.prototype.changeVisibility = function () {
    if (this.getVisibility()) {
        this.hide();
    } else {
        this.show();
    }
};

AgroLegend.prototype.setPosition = function (x, y) {
    $(this.dialog).dialog('option', 'position', [x, y]);
};

AgroLegend.prototype.getLeft = function () {
    return $(this.dialog.parentElement).position().left;
};

AgroLegend.prototype.getTop = function () {
    return $(this.dialog.parentElement).position().top;
};

AgroLegend.prototype.setPositionRight = function (x, y) {
    $(this.dialog).dialog('option', 'position', [screen.width - x, y]);
};

AgroLegend.prototype.showDescription = function () {
    alert("description");
};

AgroLegend.prototype._createTitlebarButtons = function () {
    $titlebar = $("." + this.__dialogClass + " .ui-dialog-titlebar")

    var that = this;
    this.iconButtons = {
        "close": {
            text: "Закрыть",
            icon: "ui-icon-closethick",
            click: function (e) {
                that.hide();
            }
        }
    };

    if (this.description) {
        this.iconButtons["_description"] = {
            text: "Описание",
            icon: "ui-icon-helpthick",
            click: function (e) {
                that.showDescriptionDialog(that.description, that.descriptionWidth, that.descriptionHeight);
            }
        }
    }

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
};

AgroLegend.prototype.setCaption = function (str) {
    $("." + this.__dialogClass + " .ui-dialog-titlebar .ui-dialog-title").text(str);
};

AgroLegend.prototype.showDescriptionDialog = function (description, width, height) {

    var descriptionContent = $("<div>" + description + "</div>");

    var that = this;

    var dialog = showDialog("", descriptionContent.get(0), 0, 0, false, false, null);

    dialog.style.display = "block";

    $(dialog).dialog({ dialogClass: this.__dialogClass + "_description" });
    $("." + this.__dialogClass + "_description" + " .ui-dialog-titlebar .ui-dialog-title").append("Описание");
    $("." + this.__dialogClass + "_description" + " .ui-dialog").css({ "float": "none", "font-size": "12px", "font-family": "Tahoma", "background-color": "#FFFFFF", "border-color": "#e7e7e7" });
    $(dialog).dialog('option', 'zIndex', 20002);
    $(dialog).dialog('option', 'height', height || 480);
    $(dialog).dialog('option', 'width', width || 640);
    $(dialog).dialog('moveToTop');
};


AgroLegend.prototype._createDialog = function (caption, width, height) {
    if (this.dialog)
        return;

    this.dialogContent = $("<div></div>");

    $(this.dialogContent.get(0)).empty();

    var that = this;

    this.dialog = showDialog("", this.dialogContent.get(0), 0, 0, false, false, null,
        function () {
            that.closeDialog();
        });

    this.dialog.style.display = "block";

    $(this.dialog).dialog({ dialogClass: this.__dialogClass });
    this.hide();
    $("." + this.__dialogClass + " .ui-dialog-titlebar-close").remove();
    this._createTitlebarButtons();
    $("." + this.__dialogClass + " .ui-dialog-titlebar .ui-dialog-title").append(caption);
    $("." + this.__dialogClass + " .ui-dialog").css({ "float": "none", "font-size": "12px", "font-family": "Tahoma", "background-color": "#FFFFFF", "border-color": "#e7e7e7" });
    $(this.dialog).dialog('option', 'zIndex', 20001);
    $(this.dialog).dialog('option', 'height', height || 139);
    $(this.dialog).dialog('option', 'width', width || 256);
    $(this.dialog).dialog('moveToTop');
};

AgroLegend.prototype._createTable = function () {

    var rows = "";
    var lblRows = "";

    if (this._horizontal) {
        function _td(p, style, i) {
            if (i == 0) {
                return '<td></td><td>0</td>';
            } else {
                var d = "";
                if (((i + 1) % 10) == 0) {
                    d = (Math.round(10 * i / 101) / 10).toString();
                }
                return '<td ' /*+ (((i + 5) % 10) ? "" : "colspan=10")*/ + '><div class="legendLabelh">' + d/*(((i + 5) % 10) ? "" : p)*/ + '</div></td>';
            }
        };
        function _tdc(p, style, i) {
            if (i == 0) {
                return '<td><div class="legendColorh" style="background-color:' + p + style + '"></div></td>' +
                        '<td><div class="legendColorh" style="background-color:' + p + style + '"></div></td>';
            } else {
                return '<td><div class="legendColorh" style="background-color:' + p + style + '"></div></td>';
            }
        };
        var st = this._continuousTable ? "; margin-left: 0; margin-right: 0" : "";

        if (!this._sort) {
            //
            // TODO
            //
        } else {
            var sortable = [];
            for (var i in this._legendHash) {
                sortable.push(this._legendHash[i]);
            }
            var sortField = this._sortField;
            sortable.sort(function (a, b) { return a[sortField] - b[sortField]; });
            //description line
            for (var i = 0; i < sortable.length; i++) {
                var li = sortable[i];
                var r = _td(li.description, st, i);
                rows += r;
            }
            var row1 = '<tr>' + rows + '</tr>';

            rows = "";
            //color line
            for (var i = 0; i < sortable.length; i++) {
                var li = sortable[i];
                var r = _tdc(AgroLegend.RGBToHex(li.r, li.g, li.b), st, i);
                rows += r;
            }
            var row2 = '<tr>' + rows + '</tr>';
        }
        rows = row2;
        lblRows = row1;
    } else {

        function _tr(p1, p2, style) {
            return '<tr><td><div class="legendColor" style="background-color:' + p1 + style + '"></div></td><td>' + p2 + '</td></tr>';
        };
        var st = this._continuousTable ? "; margin-top: 0; margin-bottom: 0" : "";
        rows = "";
        if (!this._sort) {
            for (var i in this._legendHash) {
                var li = this._legendHash[i];
                var r = _tr(AgroLegend.RGBToHex(li.r, li.g, li.b), li.description, st);
                rows += r;
            }
        } else {
            var sortable = [];
            for (var i in this._legendHash) {
                sortable.push(this._legendHash[i]);
            }
            var sortField = this._sortField;
            sortable.sort(function (a, b) { return a[sortField] - b[sortField]; });
            for (var i = 0; i < sortable.length; i++) {
                var li = sortable[i];
                var r = _tr(AgroLegend.RGBToHex(li.r, li.g, li.b), li.description, st);
                rows += r;
            }
        }
    }

    var lblTable = '<table class="legendTable">' +
           '<tbody>' +
           lblRows +
           '</tbody>' +
           '</table>'

    var html = lblTable + '<table class="legendTable">' +
           '<tbody>' +
           rows +
           '</tbody>' +
           '</table>';

    $(this.dialogContent.get(0)).empty();
    $(this.dialogContent.get(0)).append(html + this.bottomHtml);
};