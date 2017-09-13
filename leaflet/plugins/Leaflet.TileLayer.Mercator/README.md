L.TileLayer.Mercator
==========

Leaflet plugin to draw tile raster layers in Spherical Mercator projection on maps in Elliptical Mercator projection and vice versa.

The plugin defines two classes:
  * `L.TileLayer.Mercator`
  * `L.TileLayer.Canvas.Mercator`

Additional option `tilesCRS` defaults to `L.CRS.EPSG3395`.

These classes work similar to corresponding native Leaflet classes, but with tiles in `options.tilesCRS` projection.

Mainly, this plugin should be used to show raster tiled layers on map with CRS `L.CRS.EPSG3395` and vice versa, show tiles in CRS `L.CRS.EPSG3395` on classical Spherical Mercator maps.

## Demos

- [View OSM and Rumap &rarr;](http://scanex.github.io/Leaflet.TileLayer.Mercator/examples/LayerShift.html)

## Basic Usage

```js
    var rumap = L.tileLayer.Mercator('http://{s}.tile.cart.kosmosnimki.ru/m/{z}/{x}/{y}.png', {
        maxZoom: 19,
        maxNativeZoom: 17,
        attribution: 'RDC ScanEx'
    });
```

## Changelog

#### 0.0.1 &mdash; Sep 18, 2014

- Initial release.

