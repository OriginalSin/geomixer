(function(factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(
            require('leaflet'),
            require('leaflet-geomixer'),
            require('leaflet-tilelayer-mercator')
        );
    } else {
        window.gmxBaseLayersManager.prototype.initDefaults = factory(
            window.L,
            window.L.gmx,
            window.L.tileLayer.Mercator
        );
    }
})(function(L, lGmx, tileLayerMercator) {
    /*
     * initBaseLayers manager
     */
    return function(attr) {
        var blm = this,
			protocol = L.gmxUtil ? L.gmxUtil.protocol : 'http:',
            osmTilePrefix = protocol + '//{s}tilecart.kosmosnimki.ru/',
            zIndexOffset = 2000000,
            mapID = attr && attr.mapID ? attr.mapID : '1D30C72D02914C5FB90D1D448159CAB6',
            gmxLocale = L.gmxLocale,
            lang = gmxLocale ? gmxLocale.getLanguage() : 'rus',
            _gtxt = function(key) {
                return gmxLocale ? gmxLocale.getText(key) : key;
            };

        var copyrights = {
            collinsbartholomew: '&copy; <a href="http://www.collinsbartholomew.com/">Collins Bartholomew Ltd.</a>',
            geocenter: '&copy; <a href="http://www.geocenter-consulting.ru/">' + _gtxt('ЗАО «Геоцентр-Консалтинг»', 'Geocentre-Consulting') + '</a>',
            openStreetMap: '&copy; ' + _gtxt('участники OpenStreetMap <a href="http://www.openstreetmap.org/copyright">ODbL</a>', 'OpenStreetMap contributers <a href="http://opendatacommons.org/licenses/odbl/">ODbL</a>'),
            cgiar: '&copy; <a href="http://srtm.csi.cgiar.org/">CGIAR-CSI</a>',
            '2gis': '&copy; <a href="http://help.2gis.ru/api-rules/#kart">' + _gtxt('ООО «ДубльГИС»', '2GIS') + '</a>',
            naturalearthdata: '&copy; <a href="http://www.naturalearthdata.com/">Natural Earth</a>',
            nasa: '&copy; <a href="http://www.nasa.gov">NASA</a>',
            earthstar: '&copy; <a href="http://www.es-geo.com">Earthstar Geographics</a>',
            antrix: '&copy; <a href="http://www.antrix.gov.in/">ANTRIX</a>',
            geoeye: '&copy; <a href="http://www.geoeye.com">GeoEye Inc.</a>'
        };
        var getCopyright2 = function() {
            return [{
                minZoom: 1,
                maxZoom: 7,
                attribution: copyrights.collinsbartholomew + ', ' + _gtxt('2014', '2012')
            }, {
                minZoom: 1,
                maxZoom: 7,
                attribution: copyrights.naturalearthdata + ', 2013'
            }, {
                minZoom: 8,
                maxZoom: 17,
                attribution: copyrights.openStreetMap
            }];
        };

        var getURL = function(type) {
            // return 'http://{s}.tile.osm.kosmosnimki.ru/' + type + '/{z}/{x}/{y}.png';
            return osmTilePrefix + type + '/{z}/{x}/{y}.png';
        };
        var iconPrefix = protocol + '//maps.kosmosnimki.ru/api/img/baseLayers/';

        var baseLayers = {
            empty: {
                rus: 'Пустая',
                eng: 'Empty',
                layers: []
            },
            sputnik: {
                rus: 'Спутник ру',
                eng: 'Sputnik RU',
                icon: iconPrefix + 'basemap_sputnik_ru.png',
                layers: [
                    L.tileLayer(protocol + '//tilessputnik.ru/{z}/{x}/{y}.png', {
                        maxZoom: 22,
                        maxNativeZoom: 18,
                        attribution: '<a href="http://maps.sputnik.ru">Спутник</a> © ' + (lang === 'rus' ? 'Ростелеком' : 'Rostelecom') + ' | © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    })
                ]
            },
            mapbox: {
                rus: 'Mapbox',
                eng: 'Mapbox',
                icon: iconPrefix + 'basemap_mapbox.png',
                layers: [
                    L.tileLayer(protocol + '//api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia29zbW9zbmlta2lydSIsImEiOiJjaWhxMHNlZDgwNGFldHBtMjdyejQ3YTJ3In0.3UAAWcIBabrbUhHwmp1WjA', {
                        maxZoom: 22,
                        maxNativeZoom: 22,
                        attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a>'
                    })
                ]
            },
            OSM: {
                rus: 'Карта',
                eng: 'Map',
                icon: iconPrefix + 'basemap_osm_' + (lang === 'rus' ? 'ru' : 'eng') + '.png',
                layers: [
                    L.tileLayer(osmTilePrefix + 'kosmo' + (lang === 'rus' ? '' : '-en') + '/{z}/{x}/{y}.png', {
                        //maxZoom: 25,
                        maxNativeZoom: 18,
                        gmxCopyright: getCopyright2()
                    })
                ]
            },
            outline: {
                rus: 'Контуры RuMap',
                eng: 'Outline RuMap',
                icon: iconPrefix + 'basemap_contour.png',
                layers: [
                    tileLayerMercator(getURL('mo'), {
                        // maxZoom: 25,
                        maxNativeZoom: 13,
                        gmxCopyright: [{
                            minZoom: 1,
                            maxZoom: 9,
                            attribution: copyrights.collinsbartholomew + _gtxt(', 2014', ', 2012')
                        }, {
                            minZoom: 1,
                            maxZoom: 17,
                            attribution: copyrights.geocenter + ', 2014'
                        }]
                    })
                ]
            },
            /*
        osm_spring: {rus: 'OSM Весна', eng: 'OSM Spring',
            icon: iconPrefix + 'basemap_osm_spring.png',
            layers:[
                L.tileLayer(getURL('spring'), {
                    maxZoom: 18,
                    gmxCopyright: getCopyright2()
                })
            ]
        },
        osm_summer: {rus: 'OSM Лето', eng: 'OSM Summer',
            icon: iconPrefix + 'basemap_osm_summer.png',
            layers:[
                L.tileLayer(getURL('summer'), {
                    maxZoom: 18,
                    gmxCopyright: getCopyright2()
                })
            ]
        },
        osm_autumn: {rus: 'OSM Осень', eng: 'OSM Autumn',
            icon: iconPrefix + 'basemap_osm_autumn.png',
            layers:[
                L.tileLayer(getURL('autumn'), {
                    maxZoom: 18,
                    gmxCopyright: getCopyright2()
                })
            ]
        },
        osm_winter: {rus: 'OSM Зима', eng: 'OSM Winter',
            icon: iconPrefix + 'basemap_osm_winter.png',
            layers:[
                L.tileLayer(getURL('winter'), {
                    maxZoom: 18,
                    gmxCopyright: getCopyright2()
                })
            ]
        },
*/
            osmGrey: {
                rus: 'Серая',
                eng: 'Grey Map',
                icon: iconPrefix + 'basemap_osm_grey.png',
                layers: [
                    L.tileLayer(getURL('winter' + (lang === 'rus' ? '' : '-en')), {
                        maxZoom: 18,
                        gmxCopyright: getCopyright2()
                    })
                ]
            },
            osmPrint: {
                rus: 'Карта печать',
                eng: 'Print Map',
                icon: iconPrefix + 'basemap_print.png',
                layers: [
					L.tileLayer(osmTilePrefix + 'bw' + (lang === 'rus' ? '' : '-en') + '/{z}/{x}/{y}.png', {
                    // L.tileLayer(getURL('bw' + (lang === 'rus' ? '' : '-en')), {
                        // maxZoom: 25,
                        maxNativeZoom: 18,
                        gmxCopyright: getCopyright2()
                    })
                ]
            },
            slope: {
                rus: 'Уклоны',
                eng: 'Slope',
                icon: iconPrefix + 'basemap_relief_slope.png',
                description: '<img src = "' + iconPrefix + 'basemap_relief_slope_legend' + (lang === 'rus' ? '' : '_en') + '.svg"></img>',
                minZoom: 9,
                maxZoom: 15,
                layers: [
                    tileLayerMercator(getURL('ds'), {
                        minZoom: 9,
                        maxZoom: 15,
                        maxNativeZoom: 13,
                        gmxCopyright: getCopyright2()
                    })
                ]
            },
            aspect: {
                rus: 'Экспозиция',
                eng: 'Aspect',
                icon: iconPrefix + 'basemap_aspect.png',
                description: '<img src = "' + iconPrefix + 'basemap_aspect_legend' + (lang === 'rus' ? '' : '_en') + '.svg"></img>',
                minZoom: 9,
                maxZoom: 15,
                layers: [
                    tileLayerMercator(getURL('da'), {
                        minZoom: 9,
                        maxZoom: 15,
                        maxNativeZoom: 13,
                        gmxCopyright: getCopyright2()
                    })
                ]
            }
        };

        baseLayers.OSMHybrid = {
            rus: 'Гибрид',
            eng: 'Hybrid',
            overlayColor: '#ffffff',
            icon: protocol + '//maps.kosmosnimki.ru/api/img/baseLayers/basemap_osm_hybrid.png',
            layers: [
                L.tileLayer(osmTilePrefix + 'kosmohyb' + (lang === 'rus' ? '' : '-en') + '/{z}/{x}/{y}.png', {
                    // maxZoom: 25,
                    maxNativeZoom: 18,
                    gmxCopyright: getCopyright2()
                })
            ]
        };
        baseLayers.OSMHybrid.layers[0].setZIndex(zIndexOffset);

        var layersGMX = [{
            mapID: mapID,
            layerID: 'C9458F2DCB754CEEACC54216C7D1EB0A', // satellite
            type: 'satellite',
            rus: 'Снимки',
            eng: 'Satellite',
            overlayColor: '#ffffff',
            icon: iconPrefix + 'basemap_satellite.png'
        }];

        if (lang === 'rus') {
            baseLayers.map = {
                rus: 'Карта RuMap',
                eng: 'RuMap',
                icon: iconPrefix + 'basemap_rumap.png',
                layers: [
                    L.tileLayer(protocol + '//tile.digimap.ru/rumap/{z}/{x}/{y}.png', {
                        // maxZoom: 25,
                        maxNativeZoom: 20,
                        attribution: copyrights.geocenter + ', 2014'
                    })
                    // tileLayerMercator(getURL('m'), {
                    // maxZoom: 19,
                    // maxNativeZoom: 17,
                    // gmxCopyright: [
                    // {minZoom: 1, maxZoom: 9, attribution: copyrights.collinsbartholomew + _gtxt(', 2014', ', 2012')},
                    // {minZoom: 1, maxZoom: 17, attribution: copyrights.geocenter + ', 2014', bounds: [[40, 29], [80, 180]]}
                    // ]
                    // })
                ]
            };
            baseLayers['2GIS'] = {
                icon: iconPrefix + '2gis.png',
                layers: [
                    L.tileLayer(protocol + '//tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=4', {
                        // maxZoom: 25,
                        maxNativeZoom: 18,
                        attribution: copyrights['2gis']
                    })
                ]
            };
            baseLayers.relief = {
                rus: 'Рельеф RuMap',
                eng: 'Relief',
                icon: iconPrefix + 'basemap_terrain.png',
                layers: [
                    tileLayerMercator(getURL('r'), {
                        // maxZoom: 25,
                        maxNativeZoom: 13,
                        gmxCopyright: [{
                            minZoom: 1,
                            maxZoom: 17,
                            attribution: copyrights.collinsbartholomew + _gtxt(', 2014', ', 2012')
                        }, {
                            minZoom: 1,
                            maxZoom: 17,
                            attribution: copyrights.geocenter + ', 2014'
                        }, {
                            minZoom: 1,
                            maxZoom: 17,
                            attribution: copyrights.cgiar + ', 2008'
                        }]
                    })
                ]
            };
            baseLayers.grey = {
                rus: 'Серая RuMap',
                eng: 'Grey',
                icon: iconPrefix + 'basemap_grey.png',
                layers: [
                    tileLayerMercator(getURL('mg'), {
                        // maxZoom: 25,
                        maxNativeZoom: 17,
                        gmxCopyright: [{
                            minZoom: 1,
                            maxZoom: 9,
                            attribution: copyrights.collinsbartholomew + _gtxt(', 2014', ', 2012')
                        }, {
                            minZoom: 1,
                            maxZoom: 17,
                            attribution: copyrights.geocenter + ', 2014'
                        }]
                    })
                ]
            };
            baseLayers.osmNight = {
                rus: 'Ночная', eng: 'OSM Night',
                icon: iconPrefix + 'basemap_night.png',
                layers:[
					L.tileLayer(osmTilePrefix + 'night/{z}/{x}/{y}.png', {
                    // L.tileLayer(getURL('night'), {
                        maxZoom: 18,
                        gmxCopyright: getCopyright2()
                    })
                ]
            };
        } else {
            layersGMX.push({
                mapID: mapID,
                layerID: '5269E524341E4E7DB9D447C968B20A2C',
                type: 'map',
                rus: 'Карта RuMap',
                eng: 'RuMap',
                icon: iconPrefix + 'basemap_rumap.png'
            }); // rumap
            layersGMX.push({
                mapID: mapID,
                layerID: 'BCCCE2BDC9BF417DACF27BB4D481FAD9',
                type: 'hybrid',
                rus: 'Гибрид RuMap',
                eng: 'Hybrid RuMap'
            }); // hybrid
        }
        var def = new L.gmx.Deferred();
        attr = attr || {};
        L.gmx.loadLayers(layersGMX, attr).then(function() {
            var layerByLayerID = {},
                overlay = null,
                i, len;
            for (i = 0, len = arguments.length; i < len; i++) {
                var layer = arguments[i],
                    gmx = layer._gmx,
                    mapName = gmx.mapName,
                    layerID = gmx.layerID;
                if (!(mapName in layerByLayerID)) {
                    layerByLayerID[mapName] = {};
                }
                layerByLayerID[mapName][layerID] = layer;
            }
            for (i = 0, len = layersGMX.length; i < len; i++) {
                var info = layersGMX[i],
                    type = info.type;
                if (type === 'hybrid') {
                    continue;
                }
                if (type === 'satellite') {
                    var satellite = layerByLayerID[info.mapID][info.layerID]; // satellite
                    if (lang === 'rus') {
                        overlay = tileLayerMercator(getURL('o'), { // rus Overlay
                            // maxZoom: 25,
                            maxNativeZoom: 17,
                            clickable: false
                        });
                    } else {
                        overlay = layerByLayerID[info.mapID]['BCCCE2BDC9BF417DACF27BB4D481FAD9']; // eng Overlay
                        overlay.options.clickable = false;
                    }
                    overlay.options.gmxCopyright = getCopyright2();

                    baseLayers.hybrid = {
                        rus: 'Гибрид RuMap',
                        eng: 'Hybrid RuMap',
                        overlayColor: '#ffffff',
                        icon: iconPrefix + 'basemap_hybrid.png',
                        layers: [satellite, overlay]
                    };
                    baseLayers.hybrid.layers[1].setZIndex(zIndexOffset);
                    baseLayers.OSMHybrid.layers.unshift(satellite);
                }
                baseLayers[type] = {
                    rus: info.rus,
                    eng: info.eng,
                    icon: info.icon,
                    overlayColor: info.overlayColor || '#000000',
                    layers: [layerByLayerID[info.mapID][info.layerID]]
                };
            }
        }).always(function() {
            for (var id in baseLayers) {
                var baseLayer = baseLayers[id];
                if (!baseLayer.rus) {
                    baseLayer.rus = id;
                }
                if (!baseLayer.eng) {
                    baseLayer.eng = id;
                }
                blm.add(id, baseLayer);
            }
            def.resolve();
        });

        return def;
    };
});
