(function($){

_translationsHash.addtext('rus', {BufferPlugin: {
    panelTitle: 'Буферные зоны',
    sizeLabel : 'Размер буфера (м)',
    precisionLabel : 'Точность',
    precisionHint: 'Количество точек на полуокружности',
    calcButtonTitle: 'Рассчитать',
    exportButtonTitle: 'Экспорт в shp',
    removeButtonTitle: 'Удалить'
}});

_translationsHash.addtext('eng', {BufferPlugin: {
    panelTitle: 'Buffer Areas',
    sizeLabel : 'Buffer size (m)',
    precisionLabel : 'Precision',
    precisionHint: 'Number of points at semicircle',
    calcButtonTitle: 'Calculate',
    exportButtonTitle: 'Export to shp',
    removeButtonTitle: 'Remove'
}});

var DrawingFeaturesCollection = function(map) {
    this.features = map.gmxDrawing.getFeatures().map(function(feature) {
        return {
            feature: feature,
            bufferGeom: null,
            selected: false
        }
    });
    
    map.gmxDrawing.on('add', function(event) {
        this.features.push({
            feature: event.object,
            bufferGeom: null,
            selected: false
        });
        $(this).change();
    }, this);
    
    map.gmxDrawing.on('remove', function(event) {
        var index = _.findIndex(this.features, function(f) {return f.feature === event.object;});
        if (index >= 0) {
            var f = this.features.splice(index, 1);
            f[0].bufferGeom && map.removeLayer(f[0].bufferGeom);
            $(this).change();
        }
    }, this);
}

DrawingFeaturesCollection.prototype.isAny = function() {
    return _.chain(this.features).pluck('selected').any().value();
}

DrawingFeaturesCollection.prototype.getSelected = function() {
    return _.chain(this.features).where({selected: true});
}

var drawingFeaturesCollection;

var listTemplate = Handlebars.compile(
    '<table class="geobuff-geom-container"><tbody>{{#rows}}' +
        '<tr>' +
            '<td><input type="checkbox" data-index="{{@index}}"{{#if selected}} checked{{/if}} class="geobuff-feature-checkbox"></td>' +
            '<td data-index="{{@index}}" class="geobuff-feature-placeholder"></td>' +
        '</tr>' +
    '{{/rows}}</tbody></table>'
);


var mainTemplate = Handlebars.compile('<div class="geobuff-container">' +
    '<table class="geobuff-params-container">' +
        '<tr>' +
            '<td>{{i "BufferPlugin.sizeLabel"}}</td>' +
            '<td><input class="inputStyle geobuff-size" value="{{bufferSize}}"></td>' +
        '</tr>' +
        '<tr>' +
            '<td><span class="geobuff-precision-label">{{i "BufferPlugin.precisionLabel"}}</span></td>' +
            '<td><input class="inputStyle geobuff-precision" value="{{precision}}"></td>' +
        '</tr>' +
    '</table>' +
    
    '<div class="geobuff-list-placeholder"></div>' +
    
    '<div class="geobuff-actions">' +
        '<span class="buttonLink geobuff-calculate">{{i "BufferPlugin.calcButtonTitle"}}</span>' +
        '<span class="buttonLink geobuff-export-shp">{{i "BufferPlugin.exportButtonTitle"}}</span>' +
        '<span class="buttonLink geobuff-remove">{{i "BufferPlugin.removeButtonTitle"}}</span>' +
    '</div>' +
    '<div class="geobuff-progress-container" style="display:none">' +
        '<div class="geobuff-progressbar"></div>' +
    '</div>' +
'</div>');

var loadingScriptPromise,
    precision = 36,
    bufferSize = 3000;

var publicInterface = {
    pluginName: 'BufferPlugin', 
    afterViewer: function(params, map){
        var path = gmxCore.getModulePath('BufferPlugin'),
            lmap = nsGmx.leafletMap;
            
        drawingFeaturesCollection = drawingFeaturesCollection || new DrawingFeaturesCollection(lmap);
            
        var bufferIcon = L.control.gmxIcon({
            id: 'buffer-zone',
            // regularImageUrl: path + 'img/buffer_tool.png',
            // activeImageUrl: path + 'img/buffer_tool_a.png',
            togglable: true
        });
        
        var bufferPanel = new leftMenu();
        
        bufferIcon.on('statechange', function() {
            if (bufferIcon.options.isActive) {

                var deleteBufferGeometries = function() {
                    drawingFeaturesCollection.getSelected().each(function(f) {
                        if (f.bufferGeom) {
                            lmap.removeLayer(f.bufferGeom);
                            f.bufferGeom = null;
                        }
                    });
                }
                
                bufferPanel.createWorkCanvas('geobuffer', {
                    path: [_gtxt('BufferPlugin.panelTitle')],
                    closeFunc: function() {
                        deleteBufferGeometries();
                        bufferIcon.setActive(false);
                        drawingRows.forEach(function(row) {
                            row.RemoveRow();
                        });
                    }
                });
                
                $(bufferPanel.workCanvas).empty();
                
                var DrawingObjectInfoRow = gmxCore.getModule('DrawingObjects').DrawingObjectInfoRow;

                var ui = $(mainTemplate({
                    bufferSize: bufferSize,
                    precision: precision
                }));
                
                var drawingRows = [];
                
                var renderList = function() {
                    drawingRows.forEach(function(row) {
                        row.RemoveRow();
                    });
                    drawingRows = [];
                    
                    var featureInfos = drawingFeaturesCollection.features;
                    var listUI = $(listTemplate({
                        rows: featureInfos
                    }));
                    
                    listUI.find('.geobuff-feature-placeholder').each(function() {
                        drawingRows.push(new DrawingObjectInfoRow(lmap, this, featureInfos[$(this).data('index')].feature, {
                            allowDelete: false,
                            editStyle: false
                        }));
                    });
                    
                    listUI.find('.geobuff-feature-checkbox').change(function() {
                        var index = $(this).data('index'),
                            bufferGeom = featureInfos[index].bufferGeom;
                            
                        featureInfos[index].selected = this.checked;
                            
                        if (bufferGeom) {
                            lmap[this.checked ? 'addLayer' : 'removeLayer'](bufferGeom);
                        }
                    });
                    
                    ui.find('.geobuff-list-placeholder').empty().append(listUI);
                };
                
                $(drawingFeaturesCollection).off('change');
                $(drawingFeaturesCollection).change(renderList);
                renderList();
                
                ui.find('.geobuff-size').change(function() {
                    bufferSize = this.value;
                });
                
                ui.find('.geobuff-precision').change(function() {
                    precision = this.value;
                });
                
                ui.appendTo(bufferPanel.workCanvas);
                
                ui.find('.geobuff-calculate').click(function() {
                    if (drawingFeaturesCollection.isAny()) {
                        loadingScriptPromise = loadingScriptPromise ||gmxCore.loadScriptWithCheck([{
                            check: function() {return window.GeoBuffer;},
                            script: path + 'js/dist/turf-geobuffer.js'
                        }]);
                        
                        loadingScriptPromise.then(function() {
                            ui.find('.geobuff-progress-container').toggle();
                            ui.find('.geobuff-actions').toggle();
                            
                            ui.find('.geobuff-progressbar').progressbar({
                                max: 1.0,
                                value: 0.0
                            });
                            
                            var size = +ui.find('.geobuff-size').val(),
                                precision = +ui.find('.geobuff-precision').val();
                            
                            var geoBuffers = drawingFeaturesCollection.getSelected().map(function(f) {
                                var geoJSON = f.feature.toGeoJSON();
                                
                                if (f.bufferGeom) {
                                    lmap.removeLayer(f.bufferGeom);
                                };
                                
                                var geoBuff = new GeoBuffer(geoJSON);
                                
                                return {
                                    geoBuffer: geoBuff,
                                    feature: f
                                }
                            }).value();
                            
                            var totalPoints = geoBuffers.reduce(function(sum, item) {return sum + item.geoBuffer.getNumberOfPoints();}, 0),
                                calculatedPoints = 0;
                            
                            var nextBuffer = function() {
                                if (geoBuffers.length === 0) {
                                    ui.find('.geobuff-progress-container').toggle();
                                    ui.find('.geobuff-actions').toggle();
                                    return;
                                }
                                
                                var curBuffer = geoBuffers.pop();
                                curBuffer.geoBuffer.calculateBuffer(size/1000, 'kilometers', precision, function(buffer) {
                                    curBuffer.feature.bufferGeom = L.geoJson(buffer, {color: 'green', fillOpacity: 0.2, opacity: 1}).addTo(map);
                                    calculatedPoints += curBuffer.geoBuffer.getNumberOfPoints();
                                    
                                    ui.find('.geobuff-progressbar').progressbar('value', calculatedPoints/totalPoints);
                                    
                                    nextBuffer();
                                })
                            }
                            
                            nextBuffer();
                        })
                    }
                });
                
                ui.find('.geobuff-export-shp').click(function() {
                    var features = drawingFeaturesCollection.getSelected().map(function(f) {
                        return f.bufferGeom ? f.bufferGeom.toGeoJSON().features : [];
                    }).flatten().value();
                    
                    nsGmx.Utils.downloadGeometry(features);
                });
                
                ui.find('.geobuff-remove').click(deleteBufferGeometries);
                
                ui.find('.geobuff-precision-label').popover({
                    content: _gtxt('BufferPlugin.precisionHint'), 
                    trigger: 'hover',
                    placement: 'top'
                });
                
            } else {
                bufferPanel.leftPanelItem.close();
            }
        })
        
        lmap.addControl(bufferIcon);
    }
}       

gmxCore.addModule('BufferPlugin', publicInterface, {
    css: "BufferPlugin.css"
});

})(jQuery);