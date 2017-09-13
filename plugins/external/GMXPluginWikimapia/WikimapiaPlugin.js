(function () {
    _translationsHash.addtext('rus', {WikimapiaPlugin: {
        button: 'Викимапия',
        country: 'Страна',
        state: 'Область',
        place: 'Место',
        street: 'Улица',
        description: 'Описание'
    }});
    _translationsHash.addtext('eng', {WikimapiaPlugin: {
        button : 'Wikimapia',
        country: 'Country',
        state: 'State',
        place: 'Place',
        street: 'Street',
        description: 'Description'
    }});

    var wikimapiaLayer;

    var addWikimapiaLayer = function (KEY, proxyUrl) {
        var lmap = nsGmx.leafletMap,
            gmxLayers = lmap.gmxControlsManager.get('layers'),
            loadData;

        var info = {
            properties: {
                type: 'Vector',
                GeometryType: 'polygon',
                attributes: ['name', 'url'],
                Copyright: '<a href="http://www.wikimapia.org" target="_blank">© Wikimapia</a>'
            }
        };
        wikimapiaLayer = L.gmx.createLayer(info)
            .on('add', function () {
                loadData();
                lmap.on('moveend', loadData, this);
            })
            .on('remove', function () {
                lmap.off('moveend', loadData, this);
            })
            .setZIndex(3000000)
            .setStyles([{
                MinZoom:1, MaxZoom:21,
                DisableBalloonOnMouseMove: true,
                RenderStyle: {
                    color: 0xFF9B18,
                    weight: 1,
                    fillColor: 0xeabe24,
                    fillOpacity: 0.5
                },
                HoverStyle: {
                    color: 0xFF9B18,
                    weight: 3,
                    fillColor: 0xeabe24,
                    fillOpacity: 0.5
                }
            }])
            .bindPopup('',
                {
                    maxWidth: 560,
                    popupopen: function(ev) {
                        L.gmxUtil.request({
                            url: proxyUrl + 'http://api.wikimapia.org/?&function=object&key=' + KEY + '&id=' + ev.gmx.id + '&language=ru&pack=gzip&format=json',
                            async: true,
                            callback: function(response) {
                                var data = JSON.parse(response);
                                var loc = data.location || {};
                                var str = '<div style="width:400px; height:200px; overflow:auto; white-space:normal !important">';
                                str += '<table id="tableInfo" width="100%" border="0">';
                                str += '<caption><h4>' + data.title + '</h4></caption>';
                                str += '<tr class="odd"><th>' + _gtxt('WikimapiaPlugin.country') + ' : </th><td>' + loc.country + '</td></tr>';
                                str += '<tr><th>' + _gtxt('WikimapiaPlugin.state') + ' : </th><td>' + loc.state + '</td></tr>';
                                str += '<tr class="odd"><th>' + _gtxt('WikimapiaPlugin.place') + ' :</th><td>' + loc.place + '</td></tr>';
                                str += '<tr><th>' + _gtxt('WikimapiaPlugin.street') + ' :</th><td>' + loc.street + '</td></tr>';
                                str += '<tr class="odd"><th>' + _gtxt('WikimapiaPlugin.description') + ' :</th><td>' + data.description + '</td></tr>';
                                str += '<tr><th>Ссылка :</th><td><a href="http://wikimapia.org/' + data.id + '/ru/' + data.titleForUrl + '" target="_blank">wikimapia.org</a></td></tr></table>';
                                str += '</div>';
                                ev.popup.setContent(str);
                            }
                        });
                    }
                }
            );

        gmxLayers.addOverlay(wikimapiaLayer, _gtxt('WikimapiaPlugin.button'));

        var getBbox = function (x, y, zoom, tileSize) {
            var tilePoint = new L.Point(x, y),
                nwPoint = tilePoint.multiplyBy(tileSize),
                sePoint = nwPoint.add([tileSize, tileSize]),
                nw = lmap.unproject(nwPoint, zoom),
                se = lmap.unproject(sePoint, zoom);
            return [nw.lng, se.lat, se.lng, nw.lat].join(',');
        };
        var getTileList = function (zoom) {
            var bounds = lmap.getPixelBounds(),
                tileSize = wikimapiaLayer._getTileSize(),
                tileBounds = L.bounds(
                    bounds.min.divideBy(tileSize)._floor(),
                    bounds.max.divideBy(tileSize)._floor());

            var j, i,
                out = {};
            for (j = tileBounds.min.y; j <= tileBounds.max.y; j++) {
                for (i = tileBounds.min.x; i <= tileBounds.max.x; i++) {
                    var id = zoom + '_' + i + '_' + j;
                    out[id] = {
                        z: zoom,
                        objects: [],
                        bbox: getBbox(i, j, zoom, tileSize)
                    };
                }
            }
            return out;
        };

        var tileList = {};
        loadData = function () {
            var zoom = lmap.getZoom(),
                curentTileList = getTileList(zoom),
                removeData = [],
                addData = [];

            for (var tid in tileList) {
                var it = tileList[tid];
                if (!curentTileList[tid]) {
                    if (it.onMap) {
                        for (var i = 0, len = it.objects.length; i < len; i++) {
                            removeData.push(it.objects[i][0]);
                        }
                    }
                    it.onMap = false;
                } else if (!it.onMap && it.z === zoom) {
                    addData = addData.concat(it.objects);
                    it.onMap = true;
                }
                delete curentTileList[tid];
            }

            if (removeData.length) { wikimapiaLayer.removeData(removeData); }
            if (addData.length) { wikimapiaLayer.addData(addData); }

            Object.keys(curentTileList).map(function (tid) {
                var value = curentTileList[tid];
                L.gmxUtil.request({
                    url: proxyUrl + 'http://api.wikimapia.org/?function=box&bbox=' + value.bbox + '&key=' + KEY + '&disable=location&count=20&language=ru&page=1&pack=gzip&format=json',
                    async: true,
                    callback: function(response) {
                        var data = JSON.parse(response);
                        if (data.folder) {
                            var dataMap = [];
                            data.folder.map(function (item) {
                                var coords = [];
                                item.polygon.map(function (points) {
                                    var merc = L.Projection.Mercator.project({lat: points.y, lng: points.x});
                                    coords.push([merc.x, merc.y]);
                                });
                                coords.push(coords[0]);

                                dataMap.push([
                                    Number(item.id),
                                    item.name,
                                    item.url,
                                    {
                                        type: 'POLYGON',
                                        coordinates: [coords]
                                    }
                                ]);
                            });
                            value.objects = dataMap;
                            tileList[tid] = value;
                            if (value.z === zoom) {
                                wikimapiaLayer.addData(dataMap);
                                value.onMap = true;
                            }
                            dataMap = [];
                        }
                    }
                });
            });
        };
    };

    var publicInterface = {
        pluginName: 'Wikimapia',
        afterViewer: function (params) {
            addWikimapiaLayer(params.key, params.proxyUrl);
        },
        unload: function() {
            var lmap = nsGmx.leafletMap,
                gmxLayers = lmap.gmxControlsManager.get('layers');
            gmxLayers.removeLayer(wikimapiaLayer);
            lmap.removeLayer(wikimapiaLayer);
        }
    };

    window.gmxCore && window.gmxCore.addModule('WikimapiaPlugin', publicInterface, {
        css: 'WikimapiaPlugin.css'
    });
})();
