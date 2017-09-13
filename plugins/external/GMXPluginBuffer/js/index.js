var destination = require('turf-destination');
var bearing = require('turf-bearing');
var point = require('turf-point');
var polygon = require('turf-polygon');

require('./javascript.util.min.js');
var jsts = require('./jsts.js');

function GeoBuffer(feature) {
    var geom = feature.geometry;
    
    this._rings = [];
    if (geom.type === 'Point') {
        this._rings.push([geom.coordinates]);
    } else if (geom.type === 'MultiPoint' || geom.type === 'LineString') {
        this._rings.push(geom.coordinates);
    } else if (geom.type === 'MultiLineString' || geom.type === 'Polygon') {
        this._rings = geom.coordinates;
    } else {
        for (var c = 0; c < geom.coordinates.length; c++) {
            this._rings = this._rings.concat(geom.coordinates[c]);
        }
    }
    
    this._feature = feature;
    this._numberOfPoints = this._calcNumberOfPoints();
}

GeoBuffer.prototype._calcNumberOfPoints = function(geom) {
  var numberOfPoints = 0;
  
  for (var r = 0; r < this._rings.length; r++) {
      numberOfPoints += this._rings[r].length;
  }
  
  return numberOfPoints;
}

GeoBuffer.prototype._getNextSegment = function() {
    var ring = this._rings[this._curRing],
        p = this._curPoint,
        res;
        
    if (!ring) return;
    
    if (ring.length === 1) {
        res = [ring[0]];
    } else {
        res = [ring[p], ring[p + 1]];
    }
    
    if (p >= ring.length - 2) {
        this._curPoint = 0;
        this._curRing++;
    } else {
        this._curPoint++;
    }
    
    return res;
}

GeoBuffer.prototype._nextTick = function() {
    var radius = Math.abs(this._radius),
        segment;
        
    this._startTickTime = new Date();
    
    while (new Date() - this._startTickTime < 100) {
        var segment = this._getNextSegment();
        if (!segment) {
            break;
        } else if (segment.length === 1) {
            this._buffers.push(pointBuffer(point(segment[0][0], segment[0][1]), radius, this._units, this._resolution));
        } else {
            var line = {geometry: {type: 'LineString', coordinates: segment}};
            this._buffers.push(segmentBuffer(point(segment[0][0], segment[0][1]), point(segment[1][0], segment[1][1]), radius, this._units, this._resolution));
        }
    }
    
    if (!segment) {
        setTimeout(this._finishCalculation.bind(this), 0);
    } else {
        setTimeout(this._nextTick.bind(this), 0);
    }
}

GeoBuffer.prototype._finishCalculation = function() {
    var res;
    if (this._feature.geometry.type.indexOf('Polygon') === -1) {
        res = unionPolys(this._buffers);
    } else {
        if (this._radius >= 0) {
            this._buffers.push(this._feature);
            res = unionPolys(this._buffers);
        } else {
            res = unionPolys([this._feature], this._buffers);
        }
    }
    
    this._finishCallback(res);
}

GeoBuffer.prototype.calculateBuffer = function(radius, units, resolution, finishCallback) {
    if (radius < 0 && this._feature.geometry.type.indexOf('Polygon') === -1) {
        finishCallback(null);
        return;
    }
    
    this._curRing = 0;
    this._curPoint = 0;    
    this._buffers = [];
    
    this._radius = radius;
    this._units = units;
    this._resolution = resolution;
    
    this._finishCallback = finishCallback;
    
    
    setTimeout(this._nextTick.bind(this), 0);
}

GeoBuffer.prototype.getNumberOfPoints = function() {
    return this._numberOfPoints;
}

function unionPolys (polygons, diffPolygons) {
  var reader = new jsts.io.GeoJSONReader(),
    jstsPolysToUnion = [];

  jstsPolysToUnion = polygons.map(function(poly){
    return reader.read(JSON.stringify(poly.geometry));
  });
  
  var buffer = jstsPolysToUnion.length > 1 ? jsts.operation.union.CascadedPolygonUnion.union(jstsPolysToUnion) : jstsPolysToUnion[0];
  
  if (diffPolygons) {
    var jstsPolysToDiff = diffPolygons.map(function(poly){
      return reader.read(JSON.stringify(poly.geometry));
    });
    var diff = jsts.operation.union.CascadedPolygonUnion.union(jstsPolysToDiff);
    buffer = buffer.difference(diff);
  }
  
  var parser = new jsts.io.GeoJSONParser();
  return {
    type: 'Feature',
    geometry: parser.write(buffer)
  };
}


module.exports = GeoBuffer;

function pointBuffer (pt, radius, units, resolution) {
  var ring = []
  var resMultiple = 360/resolution;
  for(var i  = 0; i < resolution; i++) {
    var spoke = destination(pt, radius, i*resMultiple, units);
    ring.push(spoke.geometry.coordinates);
  }
  if((ring[0][0] !== ring[ring.length-1][0]) && (ring[0][1] != ring[ring.length-1][1])) {
    ring.push([ring[0][0], ring[0][1]]);
  }
  
  return polygon([ring]);
}

/*create a set of boxes parallel to the segments
  
    ---------

 ((|¯¯¯¯¯¯¯¯¯|))
(((|---------|)))
 ((|_________|))

*/
function segmentBuffer(bottom, top, radius, units, resolution) {
    var direction = bearing(bottom, top);

    var bottomLeft = destination(bottom, radius, direction - 90, units);
    var bottomRight = destination(bottom, radius, direction + 90, units);
    var topLeft = destination(top, radius, direction - 90, units);
    var topRight = destination(top, radius, direction + 90, units);

    var poly = polygon([[bottomLeft.geometry.coordinates, topLeft.geometry.coordinates]]);

    // add top curve
    var spokeNum = Math.floor(resolution/2);
    var topStart = bearing(top, topLeft);
    for(var k = 1; k < spokeNum; k++) {
      var spokeDirection = topStart + (180 * (k/spokeNum))
      var spoke = destination(top, radius, spokeDirection, units);
      poly.geometry.coordinates[0].push(spoke.geometry.coordinates);
    }
    // add right edge
    poly.geometry.coordinates[0].push(topRight.geometry.coordinates)
    poly.geometry.coordinates[0].push(bottomRight.geometry.coordinates)
    //add bottom curve
    var bottomStart = bearing(bottom, bottomRight);
    for(var k = 1; k < spokeNum; k++) {
      var spokeDirection = (bottomStart + (180 * (k/spokeNum)))
      var spoke = destination(bottom, radius, spokeDirection, units);
      poly.geometry.coordinates[0].push(spoke.geometry.coordinates);
    }
    poly.geometry.coordinates[0].push(bottomLeft.geometry.coordinates);
    
    return poly;
}