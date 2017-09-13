(function() {

    _translationsHash.addtext("rus", {
        
    });
    
    _translationsHash.addtext("eng", {
        
    });
    
    var publicInterface = {
        pluginName: 'WWF Plugin',
        afterViewer: function(params, map) {
            var layerID = params && params.layerID || 'C53699CEACAF4D8AB0ACF1A4D152D85A',
                layer = nsGmx.gmxMap.layersByID[layerID];
                
            if (!layer) {
                return;
            }
            
            var leftPanel = new nsGmx.LeftPanelItem('wwf', {
                path: ['Мониторинг нарушений']
            });
            
            var ui = $(
                '<div class="wwf-container">' +
                    '<div class="wwf-slider"></div>' +
                    '<canvas class="wwf-palette"></canvas>' +
                    '<div class="wwf-info"></div>' +
                '</div>'),
                slider = ui.find('.wwf-slider');
                
            var updateInfo = function(min, max) {
                var dateMin = new Date(Date.UTC(2015, 0, 0) + min*3600*24*1000),
                    dateMax = new Date(Date.UTC(2015, 0, 0) + max*3600*24*1000);
                    
                var s2 = function(v) {return v < 10 ? '0' + v : v},
                    date2str = function(date) {return s2(date.getUTCMonth()+1) + '.' + s2(date.getUTCDate()) + '.' + date.getUTCFullYear()};
                    
                ui.find('.wwf-info').html('Фильтр по дням: ' + date2str(dateMin) + ' - ' + date2str(dateMax));
            }
            
            var colorizer = new L._WWFAlarmColorizer();
            
            slider.slider({
                min: 1,
                max: 365,
                range: true,
                values: [1, 365],
                change: function(event, sliderUI) {
                    updateInfo(sliderUI.values[0], sliderUI.values[1]);
                    colorizer.setDateInterval(sliderUI.values[0], sliderUI.values[1]);
                    layer.redraw();
                }
            });
            
            updateInfo(1, 365);
            
            L._WWFAlarmColorizer.drawPalette(ui.find('.wwf-palette')[0]);
            var palette = L._WWFAlarmColorizer.genPalette(365);
            
            ui.appendTo(leftPanel.workCanvas);
            var parentContainer = $('#leftContentInner').length ? $('#leftContentInner') : $('#leftContent');
            parentContainer.prepend(leftPanel.panelCanvas);
            
            layer.setRasterHook(function(dstCanvas, srcImage, sx, sy, sw, sh, dx, dy, dw, dh, info) {
                
                var canvas = document.createElement('canvas');
                canvas.width = canvas.height = 256;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(srcImage, 0, 0);
                
                colorizer.colorizeTile(canvas);
                
                var dstCtx = dstCanvas.getContext('2d');
                dstCtx.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);
            });
        }
    };
    
    gmxCore.addModule('WWFPlugin', publicInterface, {
        css: 'WWFPlugin.css',
        init: function(module, path) {
            return gmxCore.loadScript(path + 'Leaflet.WWFAlarm.js');
        }
    });
})();