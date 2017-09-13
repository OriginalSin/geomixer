gmxControls
===========

GeoMixer controls for Leaflet

[Documentation](documentation.md) is available in separate file ([Russian version](documentation-rus.md)).

Demos
------
  * [All controls](http://scanex.github.io/gmxControls/examples/ScanexControls.html) - demonstrates GeoMixer controls.
  * [All SVG controls](http://scanex.github.io/gmxControls/examples/ScanexControlsSVG.html) - demonstrates GeoMixer controls.

Build
------

[NodeJS](http://nodejs.org/) is required to build the plugin.

```
npm install
```

Run the following command to build production version:
```
gulp
```

Files `gmxControls-min.js`, `gmxControls-src.js`, `css/gmxControls.css` and dir `css/img` will appear in `dist` forder. Do not commit this files to the repository!

You can use plugin without building including file `build/gmxControls-dev.js`. Note, that this script loads all the sources dynamically and should not be used for production deployment.

List of source files is maintained in file `build/deps.js`. It should be updated properly for correct builds.
