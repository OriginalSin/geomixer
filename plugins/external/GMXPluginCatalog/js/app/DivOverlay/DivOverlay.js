L.DivOverlay = L.Class.extend({

  initialize: function (element /*HTMLElement*/, anchor /*latLng*/, position /*string*/) {
    this.element = element;
    this._position = position || 'left bottom';
    this._latLng = anchor;
  },

  onAdd: function (map) {
    this._map = map;
    L.DomUtil.addClass(this.element, 'div-overlay');
    L.DomUtil.addClass(this.element, 'leaflet-zoom-hide');
    map.getPanes().overlayPane.appendChild(this.element);
    map.on('viewreset', this._reset, this);
    this._reset();
  },

  onRemove: function (map) {
    L.DomUtil.removeClass(this.element, 'div-overlay');
    L.DomUtil.removeClass(this.element, 'leaflet-zoom-hide');
    map.getPanes().overlayPane.removeChild(this.element);
    map.off('viewreset', this._reset, this);
  },

  _reset: function () {
    var pos = this._map.latLngToLayerPoint(this._latLng);
    var h = $(this.element).height();
    var w = $(this.element).width();
    var point = this.moveConnectionPoint (pos, w, h, this._position);
    this.anchor = this._map.layerPointToLatLng(point);
    L.DomUtil.setPosition(this.element, point);
  },

  _clone: function(obj){
    var properties = Object.getOwnPropertyNames(obj).reduce(function(a,k){
      a[k] = {value: obj[k], writable: true, configurable: true};
      return a;
    }, {});
    return Object.create(Object.getPrototypeOf(obj),properties)
  },

  moveConnectionPoint: function(point, width, height, position){
    var p = this._clone(point);
    switch (position) {
      case 'left bottom':
        p.y -= height;
        break;
      case 'right top':
        p.x -= width;
        break;
      case 'right bottom':
        p.x -= width;
        p.y -= height;
        break;
      case 'left top':
      default:
        break;
    }

    return p;
  }

});

L.divOverlay = function(element, target, position){
  return new L.DivOverlay(element, target, position);
};
