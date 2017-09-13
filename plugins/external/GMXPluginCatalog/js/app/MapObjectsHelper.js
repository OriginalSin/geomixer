var nsCatalog = nsCatalog || {};
nsCatalog.Helpers = nsCatalog.Helpers || {};

(function($){

	var MeridianIntersection = {
		NONE: 0,
		L0: 1,
		L180: 2
	};

	var MapHelper = function(map, treeHelper) {
		this._map = map;
		this._treeHelper = treeHelper;
		this._currentGeometries = {};
	};

	MapHelper.prototype = {

		_f: function (arr, acc, swap) {
			if (arr.length) {
				var r = [];
				for (var i = 0, len = arr.length; i < len; i++) {
					var a = arr[i];
					if (this._f(a, acc, swap)) {
						if (swap) {
							r.unshift(a);
						}
						else {
							r.push(a);
						}
					}
				}
				if (r.length) {
					acc.push(r);
				}
				return false;
			}
			else {
				return true;
			}
		},

		_flatten: function (arr, swap) {
			var acc = [];
			this._f(arr, acc, swap);
			return acc;
		},

		// createGroundOverlay: function(node, clickHandler) {
		//	 var data = node.data;
		//	 var a = data.anchors;
		//	 var g = L.gmxUtil.geometryToGeoJSON(data.geometry, data.crs == 'mercator');
		//	 var options = {clip: this._flatten(g.coordinates, true)};
		//	 var gOverlay = L.imageTransform(data.icon.href, this._flatten(a, true), options).addTo(this._map);
		//	 gOverlay.bringToBack();
		//	 node.data.mapObjects.overlay = gOverlay;
		// },

		drawOverlay: function(geometry, crs, anchors, icon){
			var g = L.gmxUtil.geometryToGeoJSON(geometry, crs == 'mercator');
			var options = {clip: this._flatten(g.coordinates, true)};
			var ovl = L.imageTransform(icon, this._flatten(anchors, true), options);
			this._map.addLayer(ovl);
			return ovl;
		},

		drawPolygon: function(geometry, crs, color, fillOpacity){
			var color = '#' + L.gmxUtil.dec2hex(color);
			var	polygon = L.geoJson(L.gmxUtil.geometryToGeoJSON(geometry, crs == 'mercator'), {
				style: function (feature) {
					return {color: color, weight: 1, opacity: 1, fillColor: color, fillOpacity: fillOpacity || 0};
				},
				onEachFeature: function (featureData, layer ) {
					layer.on('click', function () {

					});
				}
			});
			this._map.addLayer(polygon);
			return polygon;
		},

		drawIcon: function(anchors, tooltip){
			var rd = new jsts.io.GeoJSONReader();
			var coords = $.extend(true, [], anchors);
			coords.push(anchors[0]);
			var g = rd.read({
				type: 'Polygon',
				coordinates: [coords]
			});
			var center = g.getCentroid();
			var icon = L.marker([center.coordinate.y, center.coordinate.x], {
					icon: L.icon({
						iconUrl: window.serverBase + 'api/catalog/img/info.png',
						iconSize: [16, 16]
					})
			});
			this._map.addLayer(icon);
			icon.bindPopup(tooltip);
			return icon;
		},

		zoomToGeoJSON: function(geojson){
			var rd = new jsts.io.GeoJSONReader();
			var g = rd.read(geojson);
			this.zoomToGeometry(g);
		},

		zoomToGeometry: function(geometry){
			var coords = geometry.getEnvelope().getCoordinates();
			var sw = L.latLng(coords[0].y, coords[0].x);
			var ne = L.latLng(coords[2].y, coords[2].x);
			var bounds = L.latLngBounds(sw, ne);
			this._map.fitBounds(bounds);
			this._map.invalidateSize();
		},

		// createInfoIcon: function(node) {
		//	 var data = node.data;
		//	 var a = data.anchors;
		//	 var rd = new jsts.io.GeoJSONReader();
		//	 var g = rd.read({
		//		 type: 'Polygon',
		//		 coordinates: [[a[0],a[1],a[2],a[3],a[0]]]
		//	 });
		//	 var center = g.getCentroid();
		//	 var infoIcon = L.marker([center.coordinate.y, center.coordinate.x], {
		//			 icon: L.icon({
		//				 iconUrl: window.serverBase + 'api/catalog/img/info.png',
		//				 iconSize: [16, 16]
		//			 })
		//	 }).addTo(this._map);
		//
		//	 infoIcon.bindPopup(data.tooltip);
		//	 node.data.mapObjects.infoIcon = infoIcon;
		// },

		// createPolygon: function(node, clickHandler) {
		//	 var data = node.data;
		//	 var color = '#' + L.gmxUtil.dec2hex(data.color);
		//	 var g = data.geometry;
		//	 var	polygon = L.geoJson(L.gmxUtil.geometryToGeoJSON(g, data.crs == 'mercator'), {
		//		 style: function (feature) {
		//			 return {color: color, weight: 1, opacity: 1, fillColor: color, fillOpacity: 0};
		//		 },
		//		 onEachFeature: function (featureData, layer ) {
		//			 layer.on('click', function () { clickHandler(node); });
		//		 }
		//	 })
		//	 .addTo(this._map);
		//	 node.data.mapObjects.polygon = polygon;
		// },

		// createPolygonGeometry: function(node) {
		//	 var data = node.data;
		//	 if (typeof data.color == 'undefined') {
		//		 var satelliteInfo = this._treeHelper.getParentSatelliteInfo(node);
		//		 data.color = satelliteInfo.color;
		//	 }
		//	 var g = L.gmxUtil.geometryToGeoJSON(data.geometry, data.crs == 'mercator');
		//	 return {
		//		 'geometry': {
		//			 'type': data.geometry.type.toUpperCase(),
		//			 'coordinates': g.coordinates
		//		 }
		//	 };
		// },

		// updatePolygonProperties: function(mapObject, node, clickHandler) {
		//	 var data = node.data;
		//	 data.mapObjects.polygon = mapObject;
		//	 mapObject.setHandler("onClick", function() { clickHandler(node); });
		//	 mapObject.setStyle({outline: {color: data.color, thickness: 1, opacity: 100}, fill: {color: data.color, opacity: 0}});
		// },

		getExtent: function(coordinates) {
			var result = { minX:180, minY:180, maxX:-180, maxY:-180 };
			for (var i = 0; i < 4; ++i) {
				if (coordinates[i].longitude < result.minX) result.minX = coordinates[i].longitude;
				if (coordinates[i].longitude > result.maxX) result.maxX = coordinates[i].longitude;
				if (coordinates[i].latitude < result.minY) result.minY = coordinates[i].latitude;
				if (coordinates[i].latitude > result.maxY) result.maxY = coordinates[i].latitude;
			}
			return result;
		},

		// _toggleOverlayVisibility: function(node) {
		//	 node.isChecked = !node.isChecked;
		//	 if (!node.parent && node.data.isSelected) {
		//		 node.data.mapObjects.overlay.setVisible(node.isChecked);
		//		 node.data.mapObjects.infoIcon.setVisible(node.isChecked);
		//		 node.selectedUi.checkbox.prop("checked", node.isChecked);
		//		 node.ui.checkbox.click();
		//	 } else {
		//		 node.ui.checkbox.prop("checked", node.isChecked);
		//		 node.ui.checkbox.click();
		//	 }
		// },

		getGeometries: function(){
			return this._map.gmxDrawing.getFeatures().map(function(x) { return x.toGeoJSON().geometry; });
		},

		hasGeometries: function(){
			return this.getGeometries().length > 0;
		},

		getGeometry: function (){
			var gs = this._map.gmxDrawing.getFeatures().reduce(function(a, f){
				a.push(f.toGeoJSON().geometry);
				return a;
			}, []);
			var bounds = this._map.getBounds();
			var nw = bounds.getNorthWest(),
				ne = bounds.getNorthEast(),
				se = bounds.getSouthEast(),
				sw = bounds.getSouthWest();
			var x1 = nw.lng, y1 = nw.lat,
				x2 = ne.lng, y2 = ne.lat,
				x3 = se.lng, y3 = se.lat,
				x4 = sw.lng, y4 = sw.lat;
			return {
				type: 'GeometryCollection',
				geometries: gs.length > 0 ? gs :
					[
						{
							type: 'Polygon',
							coordinates: [[[x1,y1],[x2,y2],[x3,y3],[x4,y4],[x1,y1]]]
						}
					]
			};
		},

		intersectsMeridian: function(coordinates){
			var cs = coordinates.reduce(function(a, c){
				a.xs.push(c[0]);
				a.ys.push(c[1]);
				return a;
			}, {xs: [],ys: []});

			var xmax = Math.max.apply(null, cs.xs);
			var ymax = Math.max.apply(null, cs.ys);
			var xmin = Math.min.apply(null, cs.xs);
			var ymin = Math.min.apply(null, cs.ys);

			var sw = null, ne = null;
			if((xmin > 0 && xmax > 0) || (xmin < 0 && xmax < 0)) {
				return MeridianIntersection.NONE;
			}
			else if(Math.abs(xmin) < 180 && Math.abs(xmax) < 180 && Math.abs(xmin) > 90 && Math.abs(xmax) > 90) {
				return MeridianIntersection.L180;
			}
			else {
				return MeridianIntersection.L0;
			}
		},

		changeLon: function(coordinates, lon){
			return coordinates.map(function(ring){
				return ring.map(function(c){
					var lng = c[0];
					if((lng < 0 && lon > 0) || (lng > 0 && lon < 0)){
						lng += lon;
					}
					return [lng,c[1]];
				});
			});
		},

		moveToView: function(objects) {
			if(objects && objects.length) {
				var centerX = this._map.getCenter().lng;
				for (var i = 0, len = objects.length; i < len; i++){
					var obj = objects[i];
					var g = obj.geometry;
					switch(g.type.toUpperCase()){
						case 'POLYGON':
						case 'MULTIPOLYGON':
							switch (this.intersectsMeridian(g.coordinates[0])) {
								case MeridianIntersection.NONE:
								case MeridianIntersection.L0:
								default:
									break;
								case MeridianIntersection.L180:
									g.coordinates = this.changeLon(g.coordinates, 360);
									if(obj.x1 < 0){
										obj.x1 += 360;
									}
									if(obj.x2 < 0){
										obj.x2 += 360;
									}
									if(obj.x3 < 0){
										obj.x3 += 360;
									}
									if(obj.x4 < 0){
										obj.x4 += 360;
									}
									break;
							}
							break;
						default:
							throw 'Unsupported geometry type';
					}
				}
			}
		},

		movePolygonToView: function (coordinates, viewX){
			for(var i = 0; i < coordinates.length; i++){
				coordinates[i][0] += this.moveLonToView(coordinates[i][0], viewX);
			}
		},

		moveLonToView: function(x, viewX){
			var min = Math.abs(viewX - x);
			var diff = 0;
			var d = Math.abs(viewX - (x + 360));
			if(d < min){
				diff = 360;
				min = d;
			}
			if(Math.abs(viewX - (x - 360)) < min){
				diff = -360;
			}
			return diff;
		},

		normalizeGeom: function (geom) {
			switch (geom.type.toUpperCase()) {
				case 'MULTIPOLYGON':
					var c0 = this._findCenter(geom.coordinates[0][0]);
					for (var i = 1, len = geom.coordinates.length; i < len; i++) {
						var t = this._findCenter(geom.coordinates[i][0]);
						var d = this._getCorrection(c0.lon, t.lon);
						if (d) {
							this._fixLon(geom.coordinates[i][0], d);
						}
					}
					break;
				default:
					break;
			}
		},

		normalizeGeometries: function (objects) {
			var c0 = this._findGeometryCenter(objects[0].geometry);

			for (var i = 1, len = objects.length; i < len; i++) {
				var t = this._findGeometryCenter(objects[i].geometry);
				var d = this._getCorrection(c0.lon, t.lon);
				if (d) {
					this._fixGeometryLon(objects[i].geometry, d);
					this._fixAnchors(objects[i], d);
				}
			}
		},

		_findGeometryCenter: function (geom) {
			switch (geom.type.toUpperCase()) {
				case 'POLYGON':
					return this._findCenter(geom.coordinates[0]);
				case 'MULTIPOLYGON':
					var coords = [];
					for (var i = 0, len = geom.coordinates.length; i < len; i++) {
						var t = this._findCenter(geom.coordinates[i][0]);
						coords.push([t.lon, t.lat]);
					}
					return this._findCenter(coords);
				case 'LINESTRING':
					return this._findCenter(geom.coordinates);
				default:
					break;
			}
		},

		_fixGeometryLon: function (geom, diff) {
			switch (geom.type.toUpperCase()) {
				case 'POLYGON':
					this._fixLon(geom.coordinates[0], diff);
					break;
				case 'MULTIPOLYGON':
					for (var i = 0, len = geom.coordinates.length; i < len; i++) {
						this._fixLon(geom.coordinates[i][0], diff);
					}
					break;
				case 'LINESTRING':
					return this._findCenter(geom.coordinates);
				default:
					break;
			}
		},

		normalizeCoords: function (coords) {
			var x = coords[0][0];
			for (var i = 1, len = coords.length; i < len; i++) {
				var d = this._getCorrection(x, coords[i][0]);
				if (d) {
					this._fixLon(coords[i][0], d);
				}
			}
		},

		_fixLon: function (coords, d) {
			for (var i = 0, len = coords.length; i < len; i++) {
				coords[i][0] += d;
			}
		},

		_fixAnchors: function (object, diff) {
			object.x1 += diff;
			object.x2 += diff;
			object.x3 += diff;
			object.x4 += diff;
		},

		_getCorrection: function (lon, x) {
			var d1 = Math.abs(lon - x);
			var d2 = Math.abs(lon - (x + 360));
			if (d1 <= d2) {
				return 0;
			}
			else {
				return 360;
			}
		},

		_findCenter: function (coords) {
			var x = 0, y = 0;
			for (var i = 0, len = coords.length; i < len; i++) {
				var c = coords[i];
				x += c[0], y += c[1];
			}
			return { lon: x / len, lat: y / len };
		}

	};

	nsCatalog.Helpers.MapHelper = MapHelper;

}(jQuery));
