var depsJS = [
    "src/js/gmxPosition.js",
    "src/js/gmxControlsManager.js",
    "src/js/L.Control.gmxIcon.js",
    "src/js/L.Control.gmxIconGroup.js",
    "src/js/L.Control.gmxDrawing.js", 
    "src/locale/L.Control.gmxDrawing.locale.ru.js",
    "src/locale/L.Control.gmxDrawing.locale.en.js",
    "src/js/L.Control.gmxCenter.js",
    "src/js/L.Control.gmxHide.js",
    "src/js/L.Control.gmxLayers.js",
    "src/js/L.Control.gmxLocation.js",
    "src/js/L.Control.gmxPopup.js",
    "src/js/L.Control.gmxCopyright.js",
    "src/js/L.Control.gmxZoom.js",
    "src/js/L.Control.gmxBottom.js",
    "src/js/L.Control.gmxLogo.js",
    "src/js/L.Control.gmxSidebar.js",
    "src/js/L.Control.gmxLoaderStatus.js"
];
var depsCSS = [
    "src/css/L.Control.gmxIcon.css",
    "src/css/L.Control.gmxIconGroup.css",
    "src/css/L.Control.gmxDrawing.css",
    "src/css/L.Control.gmxCenter.css",
    "src/css/L.Control.gmxHide.css",
    "src/css/L.Control.gmxLayers.css",
    "src/css/L.Control.gmxLocation.css",
    "src/css/L.Control.gmxPopup.css",
    "src/css/L.Control.gmxCopyright.css",
    "src/css/L.Control.gmxZoom.css",
    "src/css/L.Control.gmxBottom.css",
    "src/css/L.Control.gmxLogo.css",
    "src/css/L.Control.gmxSidebar.css",
    "src/css/L.Control.gmxLoaderStatus.css"
];

if (typeof exports !== 'undefined') {
	exports.depsJS = depsJS;
	exports.depsCSS = depsCSS;
}

if (typeof gmxControlsDevOnLoad === 'function') {
	gmxControlsDevOnLoad(depsJS, depsCSS);
} else if (typeof gmxAPI !== 'undefined' && typeof gmxAPI.gmxControlsDevLoader === 'function') {
	gmxAPI.gmxControlsDevLoader(depsJS, depsCSS);
}