(function() {
    var module = 'L.Control.gmxDrawing';

	function getScriptPath() {
		var scripts = document.getElementsByTagName('script'),
            reg = new RegExp('^(.*)' + module + '-dev\.js');
		for (var i = 0; i < scripts.length; i++) {
			var src = scripts[i].src;
			if (src) {
				var res = src.match(reg);
				if (res) {
					return res[1];
				}
			}
		}
	}

	var basePath = getScriptPath();
    
    window.gmxDrawingDevOnLoad = function(deps) {
        var srcPath = basePath + '../src/';
        for (var i = 0; i < deps.length; i++) {
            document.writeln("<script src='" + srcPath + deps[i] + "'></script>");
        }
    }
    
    document.writeln("<script src='" + basePath + module + '-deps.js' + "'></script>");
})();