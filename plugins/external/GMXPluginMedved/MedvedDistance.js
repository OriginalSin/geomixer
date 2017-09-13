(function() {
"use strict";

//copied from http://stackoverflow.com/a/16377813/3032417
var download = function(content, fileName, mimeType) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';

    if (navigator.msSaveBlob) { // IE10
        return navigator.msSaveBlob(new Blob([content], { type: mimeType }), fileName);
    } else if ('download' in a) { //html5 A[download]
        a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        setTimeout(function() {
            a.click();
            document.body.removeChild(a);
        }, 66);
        return true;
    } else { //do iframe dataURL download (old ch+FF):
        var f = document.createElement('iframe');
        document.body.appendChild(f);
        f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);

        setTimeout(function() {
          document.body.removeChild(f);
        }, 333);
        return true;
    }
}

var MedvedDistanceWidget = function(layer) {
    var gmxProps = layer.getGmxProperties(),
        layerName = gmxProps.name,
        identityField = gmxProps.identityField,
        temporalField = gmxProps.TemporalColumnName,
        dateBegin = new Date(nsGmx.Utils.convertToServer('date', gmxProps.DateBegin) * 1000),
        dateEnd = new Date(nsGmx.Utils.convertToServer('date', gmxProps.DateEnd) * 1000);
    
    var ui = $(MedvedDistanceWidget._template());
    
    var dateInterval = new nsGmx.DateInterval();
    var calendar = new nsGmx.CalendarWidget({
        dateInterval: dateInterval,
        minimized: false,
        showSwitcher: false
    });
    
    ui.find('.medved-dist-calendar').append(calendar.el);
    
    var setProviderRequests = function(dateBegin, dateEnd) {
        var dateBeginStr = nsGmx.Utils.convertFromServer('date', dateBegin/1000);
        var dateEndStr = nsGmx.Utils.convertFromServer('date', dateEnd/1000 + 24*3600);
        var query = MedvedDistanceWidget._queryTemplate({
            dateAttribute: temporalField,
            dateBegin: dateBeginStr,
            dateEnd: dateEndStr
        });
        
        dataProvider.setRequests(
            serverBase + 'VectorLayer/Search.ashx', {layer: layerName, count: true, query: query || ''},
            serverBase + 'VectorLayer/Search.ashx', {layer: layerName, geometry: true, query: query || ''}
        );
    }
    
    dateInterval.on('change', function() {
        setProviderRequests(dateInterval.get('dateBegin'), dateInterval.get('dateEnd'));
    });
    
    var dataProvider = new nsGmx.AttrTable.ServerDataProvider({defaultSortParam: temporalField});
    
    dateInterval.set({
        dateBegin: dateBegin, 
        dateEnd: dateEnd
    });
    
    var scrollTable = new nsGmx.ScrollTable();
    scrollTable.setDataProvider(dataProvider);
    
    var getDateAndLength = function(elem) {
        var dateIndex = elem.fields[temporalField].index,
            geometryIndex = elem.fields['geomixergeojson'].index,
            dateStr = nsGmx.Utils.convertFromServer('date', elem.values[dateIndex]),
            len = L.gmxUtil.getLength(elem.values[geometryIndex].coordinates);
            
        return {
            dateStr: dateStr,
            len: (len/1000).toFixed(2)
        };
    }
    
    scrollTable.createTable({
        parent: ui.find('.medved-dist-list')[0],
        name: 'MedvedDistance',
        fields: ['Дата', 'Расстояние (км)'],
        fieldsWidths: ['100px', ''],
        drawFunc: function(elem) {
            return $(MedvedDistanceWidget._rowTemplate(getDateAndLength(elem)))[0];
        }
    });
    
    ui.find('.medved-dist-download').click(function() {
        dataProvider.getItems(0, 1000000, null, null, function(items) {
            var rows = items.map(getDateAndLength).map(function(item) {
                return item.dateStr + ';' + item.len + '\n';
            });
            
            var csvContent = 'Дата;Расстояние\n' + rows.join('');
            
            download(csvContent, 'distances.csv', 'text/csv');
        });
    })
    
    ui.dialog({title: 'Дневной ход лося'});
    
}

MedvedDistanceWidget._template = Handlebars.compile('<div>' +
    '<input autofocus style="display:none">' +
    '<div class="medved-dist-header">' +
        '<div class="medved-dist-calendar"></div>' +
        '<div class="medved-dist-download buttonLink">Скачать csv</div>' +
    '</div>' +
    '<div class="medved-dist-list"></div>' +
'</div>');

MedvedDistanceWidget._rowTemplate = Handlebars.compile(
    '<tr><td class="medved-dist-cell-date">{{dateStr}}</td><td class="medved-dist-cell-len">{{len}}</td></tr>'
);

MedvedDistanceWidget._queryTemplate = Handlebars.compile(
    "[{{dateAttribute}}] >= '{{dateBegin}}' AND [{{dateAttribute}}] < '{{dateEnd}}'"
);

var pluginName = 'Medved Distance';
var publicInterface = {
    pluginName: pluginName,
    afterViewer: function(params) {
        nsGmx.ContextMenuController.addContextMenuElem({
            title: function() { return 'Пройденные расстояния';},
            isVisible: function(context) {
                var groupNode = _layersTree.treeModel.findElemByGmxProperties(context.div.gmxProperties).elem;
                
                var isAnyLayer = false;
                _layersTree.treeModel.forEachLayer(function(layerContent) {
                    if (layerContent.properties.MetaProperties && layerContent.properties.MetaProperties.MedvedDistance) {
                        isAnyLayer = true;
                    }
                }, groupNode);
                
                
                return isAnyLayer;
            },
            clickCallback: function(context) {
                var groupNode = _layersTree.treeModel.findElemByGmxProperties(context.div.gmxProperties).elem;
                
                var layer = null;
                _layersTree.treeModel.forEachLayer(function(layerContent) {
                    var meta = layerContent.properties.MetaProperties;
                    if (meta && meta.MedvedDistance) {
                        layer = nsGmx.gmxMap.layersByID[layerContent.properties.name];
                    }
                }, groupNode);
                
                if (layer) {
                    new MedvedDistanceWidget(layer);
                }
            }
        }, 'Group');
    }
};
gmxCore.addModule('MedvedDistance', publicInterface, {css: 'MedvedDistance.css'});

})();