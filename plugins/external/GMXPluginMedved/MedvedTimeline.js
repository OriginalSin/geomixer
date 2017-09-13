(function() {
"use strict";

var pluginName = 'Medved Timeline';
var publicInterface = {
    pluginName: pluginName,
    afterViewer: function(params) {
        var TimelineData = gmxCore.getModule('TimelineRCPlugin').TimelineData;
        nsGmx.ContextMenuController.addContextMenuElem({
            title: function() { return 'Показать на таймлайне'; },
            isVisible: function(context) {
                var groupNode = _layersTree.treeModel.findElemByGmxProperties(context.div.gmxProperties).elem;
                
                var isAnyLayer = false;
                _layersTree.treeModel.forEachLayer(function(layerContent) {
                    if (layerContent.properties.MetaProperties && layerContent.properties.MetaProperties.MedvedTimeline) {
                        isAnyLayer = true;
                    }
                }, groupNode);
                
                
                return isAnyLayer;
            },
            clickCallback: function(context) {
                var groupNode = _layersTree.treeModel.findElemByGmxProperties(context.div.gmxProperties).elem;
                
                var layers = [];
                var timelineLayerID = null;
                _layersTree.treeModel.forEachLayer(function(layerContent) {
                    var meta = layerContent.properties.MetaProperties;
                    if (meta && meta.MedvedTimeline) {
                        var layer = nsGmx.gmxMap.layersByID[layerContent.properties.name];
                        layers.push(layer);
                        nsGmx.widgets.commonCalendar.unbindLayer(layerContent.properties.name);
                        timelineLayerID = meta.MedvedTimeline.Value;
                    }
                }, groupNode);
                
                nsGmx.timelineControl.setTimelineMode('none');
                
                nsGmx.timelineControl.bindLayer(nsGmx.gmxMap.layersByID[timelineLayerID], {
                    trackVisibility: false,
                    selectFunction: function(layer, selection) {
                        if (selection) {
                            var dateInterval = selection.reduce(function(interval, item) {
                                return {
                                    min: Math.min(interval.min, item.date),
                                    max: Math.max(interval.max, item.date)
                                }
                            }, {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY});
                            
                            layers.forEach(function(layer) {
                                layer.setDateInterval(new Date(dateInterval.min), new Date(dateInterval.max + 24*3600*1000));
                            });
                        } else {
                            layers.forEach(function(layer) {
                                layer.setDateInterval();
                            });
                        }
                    },
                    filterFunction: function(layer, startDate, endDate) {
                        layers.forEach(function(layer) {
                            TimelineData._defaultFilterFunction(layer, startDate, endDate);
                        });
                    }
                });
                
                nsGmx.timelineControl.setVisibleRange(new Date(2015, 1, 1), new Date());
            }
        }, 'Group');
    }
};
gmxCore.addModule('MedvedTimeline', publicInterface);

})();