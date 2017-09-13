var nsGmx = window.nsGmx = window.nsGmx || {};

// Коллекция, содержащия данные маркеров векторного слоя Геомиксера.
// В качестве аттрибутов модели добавляются все свойства маркеров
// + координаты маркера mercX и mercY

// options.manualDateIntervalUpdate
// options.dropDuplicatesBy

nsGmx.LayerMarkersCollection = Backbone.Collection.extend({
    options: {
        manualDateIntervalUpdate: false
    },

    constructor: function(layer, options) {
        this.options = _.extend(this.options, options)
        this.layer = layer;
        Backbone.Collection.call(this, [], this.options);
    },

    initialize: function(items, options) {
        this.options = options;
        if (!this.options.manualDateIntervalUpdate) {
            this.observer = this.layer.addObserver({
                type: 'resend',
                filters: ['styleFilter'],
                callback: this._parseLayerMarkers.bind(this)
            });

            var di = this.layer.getDateInterval();
            this.observer.setDateInterval(di.beginDate, di.endDate);

            this.layer.on('dateIntervalChanged', function() {
                var di = this.layer.getDateInterval();
                this.observer.setDateInterval(di.beginDate, di.endDate);
            }.bind(this));
        }
    },

    // for manual update only
    setDateInterval: function(dateBegin, dateEnd) {
        if (this.options.manualDateIntervalUpdate) {
            this._addObserver();
            this.observer.setDateInterval(dateBegin, dateEnd);
        }
    },

    // for manual update only
    _addObserver: function() {
        this._removeObserver();
        this.observer = this.layer.addObserver({
            type: 'resend',
            filters: ['styleFilter'],
            callback: function(data) {
                this._parseLayerMarkers(data);
                this._removeObserver();
            }.bind(this)
        });
    },

    // for manual update only
    _removeObserver: function() {
        if (!this.observer) {
            return;
        }
        this.observer.deactivate();
        this.layer.removeObserver(this.observer);
        this.observer = null;
    },

    _parseLayerMarkers: function(data) {
        var arr = [];
        var duplicates = [];
        for (var i = 0; i < data.added.length; i++) {
            var rawProperties = data.added[i].properties;
            var layerProperties = this.layer.getItemProperties(rawProperties);
            if (!this.options.dropDuplicatesBy || (duplicates.indexOf(layerProperties[this.options.dropDuplicatesBy]) === -1)) {
                duplicates.push(layerProperties[this.options.dropDuplicatesBy]);
                arr.push(_.extend(layerProperties, {
                    id: rawProperties[0],
                    mercX: rawProperties[rawProperties.length - 1].coordinates[0],
                    mercY: rawProperties[rawProperties.length - 1].coordinates[1],
                    styles: this.layer.getStylesByProperties(rawProperties).map(function(styleNumber) {
                        return this.layer.getStyle(styleNumber);
                    }.bind(this))
                }));
            }
        }
        this.reset(arr);
        this.trigger('update', this);
    }
});