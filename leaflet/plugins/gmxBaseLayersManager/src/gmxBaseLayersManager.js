(function(factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(
            require('leaflet'),
            require('./initBaseLayerManager')
        );
    } else {
        window.gmxBaseLayersManager = factory(window.L, undefined);
        window.L.gmxBaseLayersManager = window.gmxBaseLayersManager;
        window.L.Map.addInitHook(function() {
            // Check to see if BaseLayersManager has already been initialized.
            if (!this.gmxBaseLayersManager) {
                this.gmxBaseLayersManager = new window.L.gmxBaseLayersManager(this);
            }
        });
    }
})(function(L, initDefaults) {
    /*
     * gmxBaseLayersManager - BaseLayers manager
     */
    return L.Class.extend({
		includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
        options: {
            stateVersion: '1.0.0'
        },
        /**
         * BaseLayer class (extend `L.LayerGroup`).
         * @typedef {Object} BaseLayer
         * @property {String} id BaseLayer identifier.
         * @property {Object} options BaseLayer attributes.
         */

        initialize: function(map) {
            this._map = map;
            this._baseLayers = {};
            this._aliases = {};
            this._currentID = null;
            this._activeIDs = [];
            this._zIndexOffset = -1000000;

            var _this = this;
            this._baseLayer = L.LayerGroup.extend({
                getLayerId: function(layer) {
                    return '_' + L.stamp(layer);
                },

                setOptions: function(opt, clear) {
                    if (clear) {
                        this.options = {};
                    }
                    L.setOptions(this, opt);
                    _this.fire('baselayeroptionschange', {
                        baseLayer: this
                    });
                },

                // TODO: On switch to new baseLayer need to check layers from old baseLayer before remove them
                // onRemove: function (map) {
                // this.eachLayer(map.removeLayer, map, skipLayers);
                // this._map = null;
                // },

                // eachLayer: function (method, context, skipLayers) {
                // for (var i in this._layers) {
                // method.call(context, this._layers[i]);
                // }
                // return this;
                // },

                addLayer: function(layer) {
                    L.LayerGroup.prototype.addLayer.call(this, layer);
                    var options = layer.options;
                    if (options && !options._zIndexOffset && layer.setZIndex) {
                        options._zIndexOffset = _this._zIndexOffset;
                        layer.setZIndex(options._zIndexOffset + (options.zIndex || 0));
                    }
                    _this.fire('baselayerlayerschange', {
                        baseLayer: this
                    });
                    return true;
                },

                removeLayer: function(layer) {
                    L.LayerGroup.prototype.removeLayer.call(this, layer);
                    var options = layer.options;
                    if (options && options._zIndexOffset && layer.setZIndex) {
                        layer.setZIndex(layer.options.zIndex - options._zIndexOffset);
                        options._zIndexOffset = 0;
                    }
                    _this.fire('baselayerlayerschange', {
                        baseLayer: this
                    });
                }
            });
        },

        /** Add baseLayer
         * @memberOf gmxBaseLayersManager#
         * @param {String} id BaseLayer identifier.
         * @param {object} options BaseLayer attributes.
         * @param {String} options.rus - russian title(default = id).
         * @param {String} options.eng - english title(default = id).
         * @param {Layer[]} options.layers - layers array(default []).
         * @returns {BaseLayer|null} return BaseLayer or null if BaseLayer with this id exists.
         */
        add: function(id, options) {
            if (!id || this._baseLayers[id]) {
                return null;
            }
            options = options || {};
            var baseLayer = new this._baseLayer(options.layers || []);
            delete options.layers;

            baseLayer.id = id || 'default';
            baseLayer.options = options;
            this._baseLayers[id] = baseLayer;

            this._aliases[id] = id;
            if (options.rus) {
                this._aliases[options.rus] = id;
            }
            if (options.eng) {
                this._aliases[options.eng] = id;
            }

            this.fire('baselayeradd', {
                baseLayer: baseLayer
            });
            if (this._currentID === id) {
                this._map.addLayer(baseLayer);
            }
            return baseLayer;
        },
        /** Remove BaseLayer
         * @memberOf gmxBaseLayersManager#
         * @param {String} id BaseLayer identifier.
         * @returns {BaseLayer|null} deleted BaseLayer or null.
         */
        remove: function(id) {
            var baseLayer = this._baseLayers[id] || null;
            if (id === this._currentID) {
                this._currentID = null;
            }
            if (baseLayer) {
                this._map.removeLayer(baseLayer);
                delete this._baseLayers[id];

                delete this._aliases[id];
                if (baseLayer.options.rus) {
                    delete this._aliases[baseLayer.options.rus];
                }
                if (baseLayer.options.eng) {
                    delete this._aliases[baseLayer.options.eng];
                }

                this.fire('baselayerremove', {
                    baseLayer: baseLayer
                });
            }
            return baseLayer;
        },
        /** Get BaseLayer
         * @memberOf gmxBaseLayersManager#
         * @param {String} id BaseLayer identifier.
         * @returns {BaseLayer|null} return BaseLayer or null.
         */
        get: function(id) {
            return this._baseLayers[id] || null;
        },
        /** Get all BaseLayers
         * @memberOf gmxBaseLayersManager#
         * @returns {BaseLayer{}} return hash all BaseLayers.
         */
        getAll: function() {
            var res = [];
            for (var id in this._baseLayers) {
                res.push(this._baseLayers[id]);
            }
            return res;
        },
        /** Get active BaseLayer keys array
         * @memberOf gmxBaseLayersManager#
         * @returns {String[]} return active BaseLayer keys array.
         */
        getActiveIDs: function() {
            return this._activeIDs;
        },
        /** Set active BaseLayer keys array
         * @memberOf gmxBaseLayersManager#
         * @param {String[]} active BaseLayer keys array.
         */
        setActiveIDs: function(arr) {
            this._activeIDs = arr || [];
            this.fire('baselayeractiveids', {
                activeIDs: this._activeIDs
            });
            var baseLayer = this._baseLayers[this._currentID];
            if (baseLayer) {
                if (this.isActiveID(this._currentID)) {
                    if (!this._map.hasLayer(baseLayer)) { this._map.addLayer(baseLayer); }
                } else if (this._map.hasLayer(baseLayer)) {
                    this._map.removeLayer(baseLayer);
                }
            }
            return this;
        },
        /** Add active BaseLayer key
         * @memberOf gmxBaseLayersManager#
         * @param {String} id BaseLayer identifier.
         * @param {number} index on active BaseLayer keys array.
         */
        addActiveID: function(id, index) {
            if (!id) {
                return null;
            }
            var len = this._activeIDs.length;
            for (var i = 0; i < len; i++) {
                if (id === this._activeIDs[i]) {
                    this._activeIDs.splice(i, 1);
                    break;
                }
            }
            len = this._activeIDs.length;
            if (index === undefined || index > len - 1) {
                index = len;
                this._activeIDs.push(id);
            } else {
                this._activeIDs.splice(index, 0, id);
            }
            this.fire('baselayeractiveids', {
                activeIDs: this._activeIDs
            });
            return index;
        },
        /** Check BaseLayer active status
         * @memberOf gmxBaseLayersManager#
         * @param {String} id BaseLayer identifier.
         * @returns {boolean} true if BaseLayer active or false
         */
        isActiveID: function(id) {
            for (var i = 0, len = this._activeIDs.length; i < len; i++) {
                if (id === this._activeIDs[i]) {
                    return true;
                }
            }
            return false;
        },
        /** Set current BaseLayer
         * @memberOf gmxBaseLayersManager#
         * @param {String=} id BaseLayer identifier if BaseLayer not found unset current BaseLayer.
         * @returns {BaseLayer|null} return current BaseLayer or null.
         */
        setCurrentID: function(id) {
            var baseLayer = this._baseLayers[this._currentID] || null;
            if (baseLayer && this._map.hasLayer(baseLayer) && this.isActiveID(this._currentID)) {
                this._map.removeLayer(baseLayer);
            }

            this._currentID = id;
            baseLayer = this._baseLayers[id] || null;
            if (baseLayer && !this._map.hasLayer(baseLayer) && this.isActiveID(id)) {
                this._map.addLayer(baseLayer);
            }
            this.fire('baselayerchange', {
                baseLayer: baseLayer
            });
            return baseLayer;
        },
        /** Get current BaseLayer identifier
         * @memberOf gmxBaseLayersManager#
         * @returns {String|null} Current BaseLayer identifier or null.
         */
        getCurrentID: function() {
            return this._currentID;
        },

        /** Get base layer ID by its title in any language. Mainly used for back-compatibility.
         * @memberOf gmxBaseLayersManager#
         * @param {String} alias Base layer title in any language or ID itself
         * @returns {String|null} ID of baselayer or null if baselayer is not found
         */
        getIDByAlias: function(alias) {
            return this._aliases[alias];
        },

        loadState: function(json) {
            json = json || {};
            if (json.activeIDs) {
                this.setActiveIDs(json.activeIDs);
            }
            this.setCurrentID(json.currentID);
            return this;
        },

        saveState: function() {
            return {
                version: this.options.stateVersion,
                currentID: this._currentID || '',
                activeIDs: this._activeIDs || []
            };
        },
        initDefaults: initDefaults
    });
});
