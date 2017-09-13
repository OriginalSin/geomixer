var RepMenu = function () {
    this.bottomArea = null;
    this.innerCanvas = null;
    var that = this;
    this.panel = new nsGmx.LeftPanelItem("repMenuID", {
        //closeFunc: function () {
        //    that._closeFunc && that._closeFunc.call(that);
        //    RepMenu.clearContainerPanel();
        //}
        showCloseButton: false
    });

    $(this.panel).on("changeVisibility", function () {
        that.refreshPadding();
    });

    //указатель на панельку
    this.workCanvas = this.panel.workCanvas;
    this._closeFunc = null;

    var repDiv = document.createElement("div");
    repDiv.classList.add("leftPanel");
    repDiv.id = "repPanel";
    $("#leftPanelHeader").prepend(repDiv);
};

RepMenu.prototype.setOnClose = function (callback) {
    this._closeFunc = callback;
};

RepMenu.createContainerPanel = function () {
    var repPanel = document.createElement('div');
    repPanel.id = "repPanel";
    repPanel.style.overflowY = "auto";
    repPanel.style.overflowY = "hidden";
    return document.getElementById("repPanel").appendChild(repPanel);
};

RepMenu.clearContainerPanel = function () {
    document.getElementById("repPanel").innerHTML = "";
    resizeAll();
};

RepMenu.prototype.refreshPadding = function () {
    if ($("#repPanel").find(".workCanvas")[0].style.display == 'none') {
        document.getElementById("repPanel").style.paddingBottom = "0px";
    } else {
        if ($("#leftPanelFields").find(".workCanvas")) {
            document.getElementById("repPanel").style.paddingBottom = "20px";

            //подгоняем маленькие таблицы под размер контента
            var t = document.getElementById("agroReportsTableBody");
            if (t) {
                var h = (t.clientHeight + 40) + "px";
                $("#agroReportsTableParent.scrollTable").css("max-height", h);
            }
        }
    }

    resizeAll();
};

RepMenu.prototype.createPanel = function () {

    var container = document.getElementById("repPanel");
    container.innerHTML = "";
    container.appendChild(this.panel.panelCanvas);
    resizeAll();

    ////создание панели для списка полей
    var repPanel = RepMenu.createContainerPanel();

    this.innerCanvas = _div(null, [['css', 'overflow', 'hidden'], ['dir', 'className', 'attrsTableBody']]);
    this.workCanvas.appendChild(this.innerCanvas);

    this.bottomArea = _div(null, [['dir', 'id', 'repBottomArea'], ['css', 'float', 'right'], ['css', 'font-size', '12px'], ['css', 'padding-right', '7px']]);
    this.bottomArea.style["text-align"] = "right";
    this.bottomArea.style["width"] = "100%";
    this.bottomArea.style["padding-top"] = "5px !important";
    //this.bottomArea.style["border-top"] = "rgb(139, 118, 118) 1px solid";
    this.workCanvas.appendChild(this.bottomArea);

    document.getElementById("repPanel").style.top = "auto";

    this.refreshPadding();
};

RepMenu.prototype.setCaption = function (caption) {
    this.panel.setTitle([caption]);
    //$(this.panel.panelCanvas).find(".leftmenu-path-item.menuNavigateCurrent")[0].innerHTML = caption;
};