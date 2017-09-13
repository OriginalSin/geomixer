var nsGmx = window.nsGmx = window.nsGmx || {};

// Components:
//  - map
//  - calendar
//  - layersTree
//  - drawingManager
//  - baseLayersManager

nsGmx.PermalinkManager = (function() {
    var PermalinkManager = function(options) {
        nsGmx.StateManager.apply(this, arguments);
        options = options || {};
        this._provider = options.provider;
    };

    PermalinkManager.prototype = Object.create(nsGmx.StateManager.prototype);

    PermalinkManager.prototype.loadFromId = function(permalinkId) {
        var self = this;
        var def = $.Deferred();
        this._provider.sendGetRequest('TinyReference/Get.ashx', {
            id: permalinkId
        }).then(function(response) {
            if (response.Result) {
                try {
                    var data = JSON.parse(response.Result);
                    if (self.loadFromData(data)) {
                        def.resolve(data);
                    } else {
                        def.reject();
                    }
                } catch (e) {
                    def.reject();
                }
            } else {
                def.reject();
            }
        }).fail(function(response) {
            def.reject();
        });
        return def.promise();
    };

    //returns promise, resolved with id
    PermalinkManager.prototype.save = function() {
        var def = $.Deferred();
        this._provider.sendPostRequest('TinyReference/Create.ashx', {
            content: JSON.stringify(this.serialize())
        }).then(function(response) {
            def.resolve(response.Result);
        }).fail(function() {
            def.reject();
        });
        return def.promise();
    };

    return PermalinkManager;
})();
