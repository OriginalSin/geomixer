L.Control.GmxZoom = L.Control.Zoom.extend({
    options: {
        position: 'topleft',
        id: 'zoom',
        zoomslider: true
    },
    _stepY: 7,  // slider step
    _minY: 9,   // slider min Y position
    _maxY: 9,   // slider max Y position

    onAdd: function (map) {
        var classPrefix = 'leaflet-gmx',
            container = L.DomUtil.create('div', classPrefix + '-zoomParent'),
            options = this.options,
			svgSprite = options.svgSprite || map.options.svgSprite;

        this._container = container;
        container._id = options.id;
        container._isZoomControl = true;
        this._map = map;
        this._zoomPlaque = L.DomUtil.create('div', classPrefix + '-zoomPlaque', container);
        var zoomIn = 'Zoom in',
            zoomOut = 'Zoom out';
        if (L.gmxLocale) {
            L.gmxLocale.addText({
                'eng': {
                    'Zoom in': 'Zoom in',
                    'Zoom out': 'Zoom out'
                },
                'rus': {
                    'Zoom in': 'Увеличить',
                    'Zoom out': 'Уменьшить'
                }
            });
            zoomIn = L.gmxLocale.getText('Zoom in');
            zoomOut = L.gmxLocale.getText('Zoom out');
        }
        var gmxIconClass = svgSprite ?
			classPrefix + '-iconSvg'
			:
			classPrefix + '-icon ' + classPrefix + '-icon-img ' + classPrefix + '-icon-sprite';

        this._zoomInButton  = this._createDiv(container,
            classPrefix + (svgSprite ? 'Svg' : '') + '-zoom-in ' + gmxIconClass, zoomIn, this._zoomIn, this);
        this._zoomOutButton = this._createDiv(container,
            classPrefix + (svgSprite ? 'Svg' : '') + '-zoom-out ' + gmxIconClass, zoomOut, this._zoomOut, this);

		if (svgSprite) {
          L.DomUtil.addClass(this._zoomInButton, 'svgIcon');
          this._zoomInButton.innerHTML = '<svg role="img" class="svgIcon"><use xlink:href="#zoom-in"></use></svg>';
          L.DomUtil.addClass(this._zoomOutButton, 'svgIcon');
          this._zoomOutButton.innerHTML = '<svg role="img" class="svgIcon"><use xlink:href="#zoom-out"></use></svg>';
        }

        map.on('zoomend zoomlevelschange', this._updateDisabled, this);
        if (options.zoomslider) {
            this._chkZoomLevelsChange(container);
        }
        map.fire('controladd', this);
        if (map.gmxControlsManager) {
            map.gmxControlsManager.add(this);
        }
        return container;
    },

    onRemove: function (map) {
        if (map.gmxControlsManager) {
            map.gmxControlsManager.remove(this);
        }
        map.fire('controlremove', this);
        L.Control.Zoom.prototype.onRemove.call(this, map);
    },

    _createDiv: function (container, className, title, fn, context) {
        var link = L.DomUtil.create('div', className, container);
        if (title) { link.title = title; }

        var stop = L.DomEvent.stopPropagation;

        L.DomEvent
            //.on(container, 'mousemove', stop)
            .on(link, 'click', stop)
            .on(link, 'mousedown', stop)
            .on(link, 'dblclick', stop)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', fn || stop, context);

        return link;
    },

    _setPosition: function () {
        if (this._zoomVal) {
            var MinZoom = this._map.getMinZoom(),
                y = this._maxY - (this._zoom - MinZoom) * this._stepY;

            this._zoomVal.innerHTML = this._zoom;
            L.DomUtil.setPosition(this._zoomPointer, L.point(4, y));
        }
    },

    _getZoomByY: function (y) {
        if (y < this._minY) { y = this._minY; }
        else if (y > this._maxY) { y = this._maxY; }
        return Math.floor((this._maxY - y) / this._stepY);
    },

    _setSliderSize: function () {
        var map = this._map,
            height = this._stepY * (map.getMaxZoom() - map.getMinZoom() + 1);
        this._maxY = height + 3;
        this._zoomSliderBG.style.height = height + 'px';
        height += 72;
        if (this._zoomSliderCont.style.display !== 'block') {
            this._zoomPlaque.style.display = 'none';
            height = 68;
        } else {
            this._zoomPlaque.style.display = 'block';
        }
        this._zoomPlaque.style.height = height + 'px';
    },

    _chkZoomLevelsChange: function (container) {
        var my = this,
            map = this._map,
            classPrefix = 'leaflet-gmx',
            MinZoom = map.getMinZoom(),
            MaxZoom = map.getMaxZoom();

        if (MinZoom !== this._MinZoom || MaxZoom !== this._MaxZoom) {
            var delta = MaxZoom - MinZoom;
            if (MaxZoom < 100 && delta >= 0) {
                if (!this._zoomSliderCont) {
                    this._zoomSliderCont  = this._createDiv(container, classPrefix + '-sliderCont');
                    this._zoomSliderBG  = this._createDiv(this._zoomSliderCont, classPrefix + '-sliderBG');
                    L.DomEvent.on(this._zoomSliderBG, 'click', function (ev) {
                        this._zoom = this._getZoomByY(ev.layerY) + map.getMinZoom();
                        this._map.setZoom(this._zoom);
                        this._zoomPointer.style.display = this._zoom === map._limitZoom(this._zoom) ? 'block' : 'none';
                    }, this);
                    this._zoomPointer  = this._createDiv(this._zoomSliderCont, classPrefix + '-zoomPointer ');
                    this._zoomVal  = this._createDiv(this._zoomPointer, classPrefix + '-zoomVal ' + classPrefix + '-icon-sprite');
                    L.DomEvent.on(container, 'mouseover', function () {
                        var zoom = map.getZoom();
                        this._zoomPointer.style.display = zoom === map._limitZoom(zoom) ? 'block' : 'none';
                        if (map.getMaxZoom() !== Infinity) {
                            this._zoomSliderCont.style.display = 'block';
                            this._setSliderSize();
                        }
                    }, this);
                    var mouseout = function () {
                        my._zoomSliderCont.style.display = 'none';
                        my._setSliderSize();
                    };
                    L.DomEvent.on(container, 'mouseout', function () {
                        if (this._draggable._moving) { return; }
                        mouseout();
                    }, this);
                    var draggable = new L.Draggable(this._zoomPointer);
                    draggable.on('dragstart', function () {
                    }, this);
                    draggable.on('drag', function (ev) {
                        var pos = ev.target._newPos;
                        this._zoom = this._getZoomByY(pos.y) + map.getMinZoom();
                        this._setPosition();
                    }, this);
                    draggable.on('dragend', function () {
                        this._map.setZoom(this._zoom);
                        mouseout();
                    }, this);
                    draggable.enable();
                    this._draggable = draggable;
                }
                this._setSliderSize();
            }
            this._MinZoom = MinZoom;
            this._MaxZoom = MaxZoom;
        }
        this._zoom = map._zoom;
        this._setPosition();
    },

    _updateDisabled: function (ev) {
        L.Control.Zoom.prototype._updateDisabled.call(this, ev);
        this._zoom = this._map._zoom;
        if (this.options.zoomslider) {
            if (ev.type === 'zoomlevelschange') {
                this._chkZoomLevelsChange(this._container);
            }
            this._setPosition();
        }
    },

    setVisible: function(isVisible) {
        if (this._container) {
            this._container.style.display = isVisible ? 'block' : 'none';
        }
    }
});

L.Control.gmxZoom = L.Control.GmxZoom;
L.control.gmxZoom = function (options) {
  return new L.Control.GmxZoom(options);
};
