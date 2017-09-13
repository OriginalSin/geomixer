window.gmxCore && window.gmxCore.addModule('AgroLegendModule', {
    pluginName: 'AgroLegendPlugin',
    afterViewer: function (params) {
    },
    initLegends: function () {

        //Легенда для NDVI_HR
        if (!AgroLegend.legendNdvi) {
            AgroLegend.legendNdvi = new AgroLegend({
                "caption": "NDVI", "width": 429, "height": 131, "continuousTable": true,
                "descriptionCallback": function (d) {
                    return parseFloat(((parseInt(d) - 1) / 100).toFixed(2));
                },
                "sort": true,
                "horizontal": true,
                "sortField": "description",
                "bottomHtml": '<div style="margin-top:10px;"><div style="margin-right: 5px;background-color:rgb(0,179,255);float:left; width:15px;height:25px"></div><div style="float:left;margin-top: 5px;"> - облака и тени</div></div>'
            });
            AgroLegend.legendNdvi.loadLegend('http://maps.kosmosnimki.ru/api/plugins/palettes/NDVI_interp_legend.icxleg.xml', AgroLegend.NDVI);
            AgroLegend.legendNdvi.setPosition(screen.width * 0.5 - 90, 110);
        }

        //Легенда для QUALITY
        if (!AgroLegend.legendQuality) {
            AgroLegend.legendQuality = new AgroLegend({
                "caption": "Оценка качества композита NDVI", "width": 281, "height": 156,
                "sortField": "class",
                "sort": true
            });

            var qualityLegend = [
                { "class": 5, "r": 0, g: 255, b: 255, "description": 'облака' },
                { "class": 4, "r": 128, g: 0, b: 255, "description": 'снег/лед' },
                { "class": 3, "r": 255, g: 128, b: 0, "description": 'данные удовлетворительного качества' },
                { "class": 2, "r": 255, g: 255, b: 179, "description": 'данные хорошего качества' },
                { "class": 1, "r": 255, g: 0, b: 0, "description": 'данные отсутствуют' }
            ];
            AgroLegend.legendQuality.applyLegend(qualityLegend, AgroLegend.AGRO);
            AgroLegend.legendQuality.setPosition(screen.width * 0.5 + 50, 110);
        }

        //Легенда для классификации
        if (!AgroLegend.legendClassification) {
            AgroLegend.legendClassification = new AgroLegend({
                "caption": "Состояние полей", "sortField": "class", " width": 276, "height": 192,
                "sort": true
            });

            var classificationLegend = [
                { "class": 1, "r": 0, g: 128, b: 0, "description": 'высокая активность фотосинтеза' },
                { "class": 2, "r": 0, g: 255, b: 0, "description": 'средняя активность фотосинтеза' },
                { "class": 3, "r": 128, g: 255, b: 128, "description": 'низкая активность фотосинтеза' },
                { "class": 4, "r": 255, g: 255, b: 128, "description": 'нераспаханная почва / нет фотосинтеза' },
                { "class": 5, "r": 128, g: 0, b: 0, "description": 'распаханная почва / нет фотосинтеза' },
                { "class": 5, "r": 0, g: 179, b: 255, "description": 'облака и тени' }
            ];
            AgroLegend.legendClassification.applyLegend(classificationLegend, AgroLegend.AGRO);
            AgroLegend.legendClassification.setPosition(screen.width * 0.5 + 50, 110);
        }

        //Легенда для интегрального индекса условия вегетации
        if (!AgroLegend.legendConditionsOfVegetation) {
            AgroLegend.legendConditionsOfVegetation = new AgroLegend({
                "caption": "Индекс условий вегетации", "width": 303, "height": 173,
                "sortField": "class",
                "sort": true
            });

            var conditionsOfVegetationLegend = [

                { "class": 100, "r": 0, g: 0, b: 0, "description": 'нет данных' },
                { "class": 90, "r": 255, g: 0, b: 0, "description": 'существенно хуже среднего многолетнего' },
                { "class": 80, "r": 255, g: 128, b: 128, "description": 'хуже среднего многолетнего' },
                { "class": 60, "r": 255, g: 255, b: 0, "description": 'близко к среднему многолетнему' },
                { "class": 60, "r": 0, g: 255, b: 0, "description": 'лучше среднего многолетнего' },
                { "class": 50, "r": 0, g: 128, b: 0, "description": 'существенно лучше среднего многолетнего' }
            ];
            AgroLegend.legendConditionsOfVegetation.applyLegend(conditionsOfVegetationLegend, AgroLegend.AGRO);
            AgroLegend.legendConditionsOfVegetation.setPosition(screen.width * 0.5 + 20, 110);
        }

        //Легенда для неоднородности
        if (!AgroLegend.legendInhomogenuity) {
            AgroLegend.legendInhomogenuity = new AgroLegend({
                "caption": "Однородность", "width": 156, "height": 256,
                "sortField": "class",
                "sort": false,
                "description": "Однородность"
            });

            var inhomogenuityLegend = [
                { "class": 1, "r": 0, g: 179, b: 255, "description": 'облака и тени' },
                { "class": 3, r: 245, g: 12, b: 50, "description": "30%" },
                { "class": 4, r: 227, g: 145, b: 57, "description": "40%" },
                { "class": 5, r: 230, g: 200, b: 78, "description": "50%" },
                { "class": 6, r: 240, g: 240, b: 24, "description": "60%" },
                { "class": 7, r: 223, g: 237, b: 92, "description": "70%" },
                { "class": 8, r: 179, g: 214, b: 109, "description": "80%" },
                { "class": 9, r: 125, g: 235, b: 21, "description": "90%" },
                { "class": 10, r: 30, g: 163, b: 18, "description": "100%" }
            ];

            AgroLegend.legendInhomogenuity.applyLegend(inhomogenuityLegend, AgroLegend.AGRO);
            AgroLegend.legendInhomogenuity.setPosition(screen.width * 0.5 + 20, 110);
        }

        AgroLegend.toggleLegend = function (legend) {
            var vis = legend.getVisibility();
            AgroLegend.legendNdvi.hide();
            AgroLegend.legendClassification.hide();
            AgroLegend.legendQuality.hide();
            AgroLegend.legendInhomogenuity.hide();
            legend.setVisibility(!vis);
        }
    }
}, {
    init: function (module, path) {
        return $.when(
            gmxCore.loadScript(path + "agroLegend.js")
        );
    },
    css: 'agroLegend.css'
});