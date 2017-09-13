var AjQueue = function () {
    this._requests = [];
    this._callback = null;
    this._sender = null;

    this.pendingsQueue = [];
    this._loading_images = [];
    this.counter = 0;

    //This is rule for integral indexes building
    this.MAX_LOADING_REQUESTS = 1;

    this._id = AjQueue.ID++;

    this._tiles_deffereds = [];
    this._defIndexByName = {};
};

AjQueue.ID = 0;

AjQueue.prototype.initialize = function (requests, sender, callback, defferedCallback) {
    this.clear();
    this._requests = requests.slice(0);
    this._callback = callback;
    this._sender = sender;

    for (var i = 0; i < this._requests.length; i++) {
        var def = new $.Deferred();
        this._defIndexByName[this._requests[i].layerName] = i;
        this._tiles_deffereds.push(def);
    }

    $.when.apply($, this._tiles_deffereds).then(function () {
        defferedCallback.call(sender, this);
    });
};

AjQueue.prototype.clear = function () {
    this._requests.length = 0;
    this.counter = 0;
    this.pendingsQueue.length = 0;
    this._callback = null;

    $.each(this._tiles_deffereds, function (index, value) {
        value.reject();
    });
    this._tiles_deffereds.length = 0;

    for (var i = 0; i < this._loading_images.length; i++) {
        this._loading_images[i].src = "";
        this._loading_images[i] = null;
    }

    this._loading_images.length = 0;
};

AjQueue.prototype.start = function () {
    for (var i = 0; i < this._requests.length; i++) {
        this.sendRequest(this._requests[i]);
    }
    this._loading_images.length = 0;
};

AjQueue.prototype.sendRequest = function (request) {
    if (this.counter >= this.MAX_LOADING_REQUESTS) {
        this.pendingsQueue.push(request);
    } else {
        this.loadRequestData(request);
    }
};

AjQueue.replaceTemplate = function (template, params) {
    return template.replace(/{[^{}]+}/g, function (key) {
        return params[key.replace(/[{}]+/g, "")] || "";
    });
};

//Tile server path url template
AjQueue.urlTemplate = '{tileSenderPrefix}&x={x}&y={y}&z={z}&LayerName={layerName}&canvas=true';

AjQueue.prototype.loadRequestData = function (request) {
    this.counter++;
    var img = new Image();
    var that = this;

    img.crossOrigin = '';

    img.onload = function (obj) {

        if (that._callback)
            that._callback.call(that._sender || that._callback, this);

        that.dequeueRequest();

        that._tiles_deffereds[that._defIndexByName[request.layerName]].resolve();
    };

    img.onerror = function () {

        if (that._callback)
            that._callback.call(that._sender || that._callback, null);

        that.dequeueRequest();

        if (that._tiles_deffereds[that._defIndexByName[request.layerName]])
            that._tiles_deffereds[that._defIndexByName[request.layerName]].resolve();
    };

    img.src = AjQueue.replaceTemplate(AjQueue.urlTemplate, {
        "tileSenderPrefix": request.tileSenderPrefix,
        "x": request.x,
        "y": request.y,
        "z": request.z,
        "layerName": request.layerName
    });

    this._loading_images.push(img);
};

AjQueue.prototype.dequeueRequest = function () {
    this.counter--;
    if (this.pendingsQueue.length) {
        if (this.counter < this.MAX_LOADING_REQUESTS) {
            var req;
            if (req = this.whilePendings())
                this.loadRequestData.call(this, req);
        }
    }
};

AjQueue.prototype.whilePendings = function () {
    while (this.pendingsQueue.length) {
        var req = this.pendingsQueue.pop();
        if (req) {
            return req;
        }
    }
    return null;
};