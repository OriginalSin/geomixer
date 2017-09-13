(function(factory) {
    var addShiftMixin;
    if (typeof module !== 'undefined' && module.exports) {
        var L = require('leaflet');
        addShiftMixin = factory(L, require('leaflet-geomixer'));
        var Mercator = addShiftMixin(L.TileLayer);
        var mercator = function(url, options) {
            return new Mercator(url, options);
        };
        mercator.Constructor = Mercator;
        module.exports = mercator;
    } else {
        addShiftMixin = factory(window.L, window.L.gmx);
        window.L.TileLayer.Mercator = addShiftMixin(window.L.TileLayer);
        window.L.TileLayer.Canvas.Mercator = addShiftMixin(window.L.TileLayer.Canvas);
        window.L.tileLayer.Mercator = function(url, options) {
            return new window.L.TileLayer.Mercator(url, options);
        };
    }
})(function(L) {
    /*
     * L.TileLayer.Mercator is used for shift tile layer from EPSG3395 to EPSG3857.
     */
    return function(BaseClass) {
        return BaseClass.extend({
            options: {
                tilesCRS: L.CRS.EPSG3395
            },
            _update: function() {
                if (!this._map) {
                    return;
                }

                var map = this._map,
                    zoom = map.getZoom();

                if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
                    return;
                }

                var bounds = map.getPixelBounds();

                this._shiftY = this._getShiftY();
                bounds.min.y += this._shiftY;
                bounds.max.y += this._shiftY;

                var tileSize = this._getTileSize(),
                    tileBounds = L.bounds(
                        bounds.min._divideBy(tileSize)._floor(),
                        bounds.max._divideBy(tileSize)._floor()
                    );

                this._addTilesFromCenterOut(tileBounds);

                if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
                    this._removeOtherTiles(tileBounds);
                }
            },

            _addTile: function(tilePoint, container) {
                var tilePos = this._getTilePos(tilePoint),
                    tile = this._getTile();

                tile._pos = {
                    x: tilePos.x,
                    y: tilePos.y
                };
                this._setShiftPosition(tile);

                tile._tilePoint = tilePoint;
                this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

                this._loadTile(tile, tilePoint);

                if (tile.parentNode !== this._tileContainer) {
                    container.appendChild(tile);
                }
            },

            _getShiftY: function() {
                var map = this._map,
                    scale = L.CRS.scale(map.getZoom()),
                    pos = map.getCenter(),
                    shift = (map.options.crs.project(pos).y - this.options.tilesCRS.project(pos).y);

                return Math.floor(scale * shift / 40075016.685578496);
            },

            _setShiftPosition: function(tile) {
                var pos = {
                    x: tile._pos.x,
                    y: tile._pos.y - this._shiftY
                };
                L.DomUtil.setPosition(tile, pos, L.Browser.chrome);
            },

            _updateShiftY: function() {
                this._shiftY = this._getShiftY();
                for (var key in this._tiles) {
                    this._setShiftPosition(this._tiles[key]);
                }
            },

            onAdd: function(map) {
                BaseClass.prototype.onAdd.call(this, map);
                map.on('moveend', this._updateShiftY, this);
                if (this.options.clickable === false) {
                    this._container.style.pointerEvents = 'none';
                }
                
                if (L.gmxUtil) {
                    this
                        .on('tileloadstart', function(ev) {
                            ev.tile._statusUrl = ev.url;
                            L.gmxUtil.loaderStatus(ev.url);
                        }, this)
                        .on('tileload tileunload', function(ev) {
                            L.gmxUtil.loaderStatus(ev.tile._statusUrl, true);
                        }, this);
                }
            },

            onRemove: function(map) {
                map.off('moveend', this._updateShiftY, this);
                BaseClass.prototype.onRemove.call(this, map);
            }
        });
    };
});
