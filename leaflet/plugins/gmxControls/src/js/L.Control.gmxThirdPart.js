L.Control.GmxThirdPart = L.Control.extend({
    options: {
        position: 'center',
        id: 'thirdpart',
        notHide: true,
        color: '#ff0000'
    },

    onRemove: function (map) {
        if (map.gmxControlsManager) {
            map.gmxControlsManager.remove(this);
        }
        map.fire('controlremove', this);
    },

    _updateThirdPart: function () {
    },

    onAdd: function (map) {
        var id = this.options.id,
			className = 'leaflet-gmx-' + id,
            container = L.DomUtil.create('div', className),
            svg = L.Path.prototype._createElement('svg'),
            g = document.createElementNS(L.Path.SVG_NS, 'g'),
            path = document.createElementNS(L.Path.SVG_NS, 'path');

        this._container = container;
        container._id = id;

        path.setAttribute('stroke', this.options.color);
		path.setAttribute('stroke-width', 1);
		path.setAttribute('stroke-opacity', 1);
		path.setAttribute('fill-opacity', 0);
		path.setAttribute('d', 'M0 0L0 256L256 256L256 0L0 0');
        this._path = path;
		g.appendChild(path);
		svg.appendChild(g);
        svg.setAttribute('width', 256);
        svg.setAttribute('height', 256);
        container.appendChild(svg);

        // this.setColor(this.options.color);
        map.fire('controladd', this);
        if (map.gmxControlsManager) {
            map.gmxControlsManager.add(this);
        }
        return container;
    },

    setColor: function (color) {
        this.options.color = color;
        if (this._map) { this._path.setAttribute('stroke', color); }
        return this;
    }
});

L.control.gmxThirdPart = function (options) {
  return new L.Control.GmxThirdPart(options);
};
