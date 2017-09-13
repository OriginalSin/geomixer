var glob = require('glob'),
    child_process = require('child_process');

var SRC_DIR = './original_data/',
    DST_DIR = './rgb_data/',
    EXE_DIR = './16bit2rgb/Release/',
    PYTHON_DIR = '';
    
var process = function(error, stdout, stderr) {
    if (files.length === 0) {
        return;
    }
    
    var file = files.shift();
    var prefix = file.match(/([^\/]*)r_date_c.tif$/)[1];
    console.log(error, stdout, stderr);
    
    child_process.execFile(EXE_DIR + "16bit2rgb.exe", [SRC_DIR + prefix, DST_DIR + prefix + "r_rgb.tif"], process);
}

var files = glob.sync(SRC_DIR + '*_date_c.tif');
process();