var glob = require('glob'),
    child_process = require('child_process');

var SRC_DIR = '../result_rend/',
    DST_DIR = './rgb_data/',
    EXE_DIR = './16bit2rgb/Release/',
    PYTHON_DIR = '';
    
var BUFFER_SIZE = 2/4000,
    dateBase = Date.UTC(2014, 0, 1)/1000;
    
var process = function(error, stdout, stderr) {
    if (files.length === 0) {
        return;
    }
    
    // console.log(error, stdout, stderr);
    
    var file = files.shift(),
        prefix = file.match(/([^\/]*)_rgb.tif$/)[1],
        posInfo = prefix.match(/(\d+)E_(\d+)N/),
        lat = parseInt(posInfo[2]),
        lng = parseInt(posInfo[1]);
    
    var xmin = lng - BUFFER_SIZE,
        xmax = lng + 1 + BUFFER_SIZE,
        ymin = lat - BUFFER_SIZE,
        ymax = lat + 1 + BUFFER_SIZE;
    
    console.log(lat, lng);
    child_process.execFile('g:/Users/parshin/AppData/Local/Continuum/Anaconda/python.exe', [
            PYTHON_DIR + 'process.py', 
            DST_DIR + prefix + "_rgb.tif", 
            xmin, xmax, ymin, ymax,
            dateBase,
            'res.csv'
        ], 
        process
    );
}

// var files = glob.sync(DST_DIR + '*_rgb.tif').slice(10, 12);
var files = glob.sync(DST_DIR + '*_rgb.tif');
process();