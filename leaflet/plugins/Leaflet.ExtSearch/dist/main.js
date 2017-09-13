(function(){    

    var map = L.map('map', {
        center: new L.LatLng(55.634508, 37.433167),
        minZoom: 3,
        maxZoom: 17,
        zoom: 3,
        boxZoom: false,
        attributionControl: false,
        zoomControl: false,
        squareUnit: 'km2',
        distanceUnit: 'km'
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

	var cnInterface = window.nsGmx ? window.nsGmx.cadastre : null;
	var cadastreLayerGroup = cnInterface ? cnInterface.afterViewer({notHideDrawing:true}, map) : null;

    map.on('popupclose', function (ev) {
        if (ev.popup === cnInterface.getPopup()) {
            map.removeLayer(cadastreLayerGroup);
        }
    });

    var searchControl = new nsGmx.SearchControl(   
    {
        placeHolder: 'Поиск по кадастру, адресам, координатам',
        showFirst: true,
        position:'topright',
        limit: 10,
        providers: [
            new nsGmx.CadastreDataProvider({
                serverBase: 'http://pkk5.rosreestr.ru/api',
                limit: 10,
                tolerance: 2048,
                onFetch: function (response) {
					if (response && response.features) {
						// console.log(response);
						var feature = response.features[0];
						if (cadastreLayerGroup) {
							if (!map.hasLayer(cadastreLayerGroup)) {
								cadastreLayerGroup.addTo(map);
							}
							cnInterface.searchHook(feature.attrs.cn);
						} else {
							var R = 6378137,
								crs = L.Projection.SphericalMercator,
								bounds = map.getPixelBounds(),
								ne = map.options.crs.project(map.unproject(bounds.getTopRight())),
								sw = map.options.crs.project(map.unproject(bounds.getBottomLeft())),
								latLngBounds = L.latLngBounds(
									crs.unproject(L.point(feature.extent.xmin, feature.extent.ymin).divideBy(R)),
									crs.unproject(L.point(feature.extent.xmax, feature.extent.ymax).divideBy(R))
								);
							map.fitBounds(latLngBounds, {reset: true});
						}
					}
                },
            }),            
            new nsGmx.CoordinatesDataProvider({
                showOnMap: false,
                onFetch: function (response) {

                },
            }),                   
            new nsGmx.OsmDataProvider({
                showOnMap: true,
                serverBase: 'http://maps.kosmosnimki.ru',
                limit: 10,
                onFetch: function (response) {
                    console.log(response);
                },
            }),
        ],
        style: {
            editable: false,
            map: true,
            pointStyle: {
                size: 8,
                weight: 1,
                opacity: 1,
                color: '#00008B'
            },
            lineStyle: {
                fill: false,
                weight: 3,
                opacity: 1,
                color: '#008B8B'
            }
        },
    });

    map.addControl(searchControl);

}());