var deps = [
    "js/L.Control.gmxDrawing.js", 
    "locale/L.Control.gmxDrawing.locale.ru.js",
    "locale/L.Control.gmxDrawing.locale.en.js"
];

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}

if (typeof gmxDrawingDevOnLoad === 'function') {
	gmxDrawingDevOnLoad(deps);
}