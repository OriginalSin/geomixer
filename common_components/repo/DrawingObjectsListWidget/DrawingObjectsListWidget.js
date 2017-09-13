/**
 * @namespace
 */
var nsGmx = window.nsGmx = window.nsGmx || {};

/** Попытка изменить состояние объекта
 * @event objectToggle
 * @param {L.GmxDrawing.Feature} drawingObject
 * @param {Boolean} selected
 */

/** Попытка отцентровать объект
 * @event objectFocus
 * @param {L.GmxDrawing.Feature} drawingObject
 */

/** Кликнули на кнопку изменения стиля
 * @event styleButtonClick
 * @param {L.GmxDrawing.Feature} drawingObject
 */

nsGmx.DrawingObjectsListWidget = (function() {
    'use strict';

    // Преобразователь стилей, используемый по умолчанию
    // @param  {Leaflet Options} styles исходные стили
    // @return {Leaflet Options} преобразованные стили
    var _defaultMarkingStrategy = function(styles) {
        // функция, изменяющая яркость цвета, заданного в шестнадцатеричном формате
        // @param {String} hexColor
        // @param {Number} amount во сколько раз увеличить яркость
        var adjustHexColor = function(rawColorHexStr, factor) {
            var transformComponent = function(hexColor, factor) {
                var newHexColor = ~~(hexColor * factor);
                if (newHexColor > 255) {
                    return 255;
                } else {
                    return newHexColor;
                }
            };

            var stringifyComponent = function(hexColor) {
                if (hexColor < 16) {
                    return '0' + hexColor.toString(16);
                } else if (hexColor > 255) {
                    return 'ff';
                } else {
                    return hexColor.toString(16);
                }
            };

            var colorHexStr = rawColorHexStr.charAt(0) === '#' ? rawColorHexStr.slice(1) : rawColorHexStr;
            var useHash = rawColorHexStr.charAt(0) === '#' ? true : false;

            var colorHex = parseInt(colorHexStr, 16);
            var rHex = (colorHex & 0xff0000) >> 16;
            var gHex = (colorHex & 0x00ff00) >> 8;
            var bHex = (colorHex & 0x0000ff);

            rHex = transformComponent(rHex, factor);
            gHex = transformComponent(gHex, factor);
            bHex = transformComponent(bHex, factor);

            var sc = stringifyComponent;

            return (useHash ? '#' : '') + sc(rHex) + sc(gHex) + sc(bHex);
        };

        return {
            // увеличить яркость цвета в 2 раза если объект не является точкой
            color: styles.color && adjustHexColor(styles.color, 2)
        };
    };

    // TODO: возможно, стоит выделить логику работы со стилями в отдельную сущность
    var DrawingObjectModel = Backbone.Model.extend({
        _featureHasArea: function(feature) {
            return (
                // объект имеет тип, у которого может быть площадь
                !(feature.options.type.toLowerCase() === 'point') &&
                !(feature.options.type.toLowerCase() === 'polyline')
            ) && (
                L.gmxUtil.geoJSONGetArea(feature.toGeoJSON()) > 0
            );
        },

        _featureHasLength: function(feature) {
            return (
                // объект является линией
                feature.options.type.toLowerCase() === 'polyline'
            ) && (
                // объект имеет длину (количество вершин >= 2)
                L.gmxUtil.geoJSONGetLength(feature.toGeoJSON()) > 0
            );
        },

        _featureHasLatLng: function(feature) {
            return feature.options.type.toLowerCase() === 'point';
        },

        _updateProperties: function(feature) {
            if (this._featureHasArea(feature)) {
                if (this.type === 'multipolygon') {

                }
            }
            this.set({
                geoArea: this._featureHasArea(feature) ? L.gmxUtil.geoJSONGetArea(feature.toGeoJSON()) : undefined
            });
            // длину считаем только для линии
            this.set({
                geoLength: this._featureHasLength(feature) ? L.gmxUtil.geoJSONGetLength(feature.toGeoJSON()) : undefined
            });
            // для точки зададим координаты
            this.set({
                geoLatLng: this._featureHasLatLng(feature) ? L.gmxUtil.geoJSONGetLatLng(feature.toGeoJSON()) : undefined
            });
        },

        // Сохранить первоначальные свойства, которые могут быть изменены преобразователем свойств
        _retainProperties: function(feature, markingStrategy) {
            // получаем изменённый стиль геометрии
            var normalStyle = feature.options.lineStyle || {
                color: '#0000ff'
            };
            var modifiedStyle = markingStrategy(normalStyle);
            for (var prop in modifiedStyle) {
                if (modifiedStyle.hasOwnProperty(prop)) {
                    // могли применить другой преобразователь
                    if (!this._retainedProperties.hasOwnProperty(prop)) {
                        this._retainedProperties[prop] = normalStyle[prop];
                    }
                }
            }
        },

        // Преобразователь свойств, восстанавливающий первоначальные значения
        _restoringStrategy: function(featureStyles) {
            return this._retainedProperties;
        },

        /**
         * @param {Feature} feature
         * @param {Function} markingStrategy
         */
        constructor: function(feature, markingStrategy) {
            this._marked = false;
            this._retainedProperties = {};
            this._markingStrategy = markingStrategy || function() {
                return {}
            };

            var props = {};
            props.feature = feature;
            props.type = feature.options.type.toLowerCase();
            props.id = L.stamp(feature);
            props.selected = true;
            Backbone.Model.apply(this, [props]);
        },

        initialize: function() {
            var self = this;
            this._updateProperties(this.get('feature'));
            this.get('feature').on('edit', function(drawingEvent) {
                self._updateProperties(drawingEvent.object);
            });
        },

        hasArea: function() {
            return this._featureHasArea(this.get('feature'));
        },

        hasLength: function() {
            return this._featureHasLength(this.get('feature'));
        },

        hasLatLng: function() {
            return this._featureHasLatLng(this.get('feature'));
        },

        // Выделить геометрию. Вызывается один раз после unmarkGeometry.
        markGeometry: function() {
            if (!this._marked) {
                this._retainProperties(this.get('feature'), this._markingStrategy);
                var newStyle = this._markingStrategy(this.get('feature').options.lineStyle || {
                    color: '#0000ff'
                });
                this.get('feature').setOptions({
                    lineStyle: newStyle,
                    pointStyle: newStyle
                });
                this._marked = true;
            }
        },

        // Снять выделение. Вызывается один раз после markGeometry.
        unmarkGeometry: function() {
            if (this._marked) {
                this.get('feature').setOptions({
                    lineStyle: this._retainedProperties,
                    pointStyle: this._retainedProperties
                });
                this._retainedProperties = {};
                this._marked = false;
            }
        }
    });

    var DrawingObjectsCollection = Backbone.Collection.extend({

    });

    var DrawingObjectView = Thorax.View.extend({
        template: Handlebars.compile(nsGmx.Templates.DrawingObjectsListWidget.nodeTemplate),
        initialize: function() {
            this.on('rendered', function() {
                this.$el.find('.drawingObjectsListNode-icon_hidable').hide();
            });
        },
        events: {
            'click .drawingObjectsListNode-checkIcon': function() {
                if (this.parent.parent.selectMode === 'single') {
                    this.parent.parent.uncheckGeometries();
                }
                this.model.set({
                    selected: !this.model.get('selected')
                });
            },
            'click .drawingObjectsListNode-info': function() {
                this.parent.parent.trigger('objectFocus', this.model.get('feature'));
            },
            'click .drawingObjectsListNode-removeIcon': function() {
                // модель поймает событие удаления геометрии и удалится автоматически
                this.model.get('feature').remove();
            },
            'click .drawingObjectsListNode-styleIcon': function() {
                this.model.unmarkGeometry();
                this.parent.parent.trigger('styleButtonClick', this.model.get('feature'));
            },
            'mouseenter': function() {
                this.$el.find('.drawingObjectsListNode').addClass('ui-state-hover');
                this.$el.find('.drawingObjectsListNode-icon_hidable').show();
            },
            'mouseleave': function() {
                this.$el.find('.drawingObjectsListNode').removeClass('ui-state-hover');
                this.$el.find('.drawingObjectsListNode-icon_hidable').hide();
            }
        },
        context: function() {
            var prettifyLatLng = function(latLng) {
                var trunc = function(x) {
                    return ("" + (Math.round(10000000 * x) / 10000000 + 0.00000001)).substring(0, 9);
                };

                var formatCoordinates = function(x, y) {
                    return trunc(Math.abs(y)) + (y > 0 ? " N, " : " S, ") +
                        trunc(Math.abs(x)) + (x > 0 ? " E" : " W");
                };

                return formatCoordinates(latLng.lng, latLng.lat);
            };

            var translateGeometryType = function(type) {
                return nsGmx.Translations.getText('drawingObjectsListWidget.' + type);
            };

            var area = this.model.hasArea() ? L.gmxUtil.prettifyArea(this.model.get('geoArea')) : '';
            var length = this.model.hasLength() ? L.gmxUtil.prettifyDistance(this.model.get('geoLength')) : '';
            var latLng = this.model.hasLatLng() ? prettifyLatLng(this.model.get('geoLatLng')) : '';

            return {
                name: this.model.get('feature').options.name ? this.model.get('feature').options.name : translateGeometryType(this.model.get('type')),
                info: area || length || latLng,
                selected: this.model.get('selected'),
                // при первом вызове context parent = undefined, по-этому делаем проверку
                // this.parent это view хелпера collection, по-этому получаем доступ к
                // CollectionView путём this.parent.parent
                showStyleButton: this.parent && this.parent.parent ? this.parent.parent._options.showStyleButton : false,
                showRemoveButton: this.parent && this.parent.parent ? this.parent.parent._options.showRemoveButton : false,
                isLast: (this.model.collection.indexOf(this.model) === (this.model.collection.length - 1)),
                isRadio: this.parent && this.parent.parent && this.parent.parent._options.selectMode === 'single'
            }
        }
    });

    /**
     * @class DrawingObjectsListView
     * @param {Object} options
     * @param {GMXDrawing} drawingManager
     * @param {String} [options.selectMode] 'single' или 'multiple'
     * @param {Boolean} [options.showCheckbox] true
     * @param {Boolean} [options.showStyleButton] true показывать ли кнопку изменения стиля
     * @param {Boolean} [options.showRemoveButton] true показывать ли кнопку удаления
     * @param {Boolean} [options.markGeometries] true подсвечивать ли геометрии по наведении курсора
     * @param {Function} [options.markingStrategy] Функция, преобразующая стиль подсвеченной геометрии.
     *                                             Не должна изменять исходный стиль.
     *                                             Может возвращать только изменённые свойства
     */
    var DrawingObjectsListView = Thorax.View.extend({
        _fixOptions: function(options) {
            return {
                drawingManager: options.drawingManager,
                selectMode: options.selectMode === 'single' ? 'single' : 'multiple',
                showCheckbox: typeof options.showCheckbox === 'boolean' ? options.showCheckbox : true,
                showStyleButton: typeof options.showStyleButton === 'boolean' ? options.showStyleButton : true,
                showRemoveButton: typeof options.showRemoveButton === 'boolean' ? options.showRemoveButton : true,
                markGeometries: typeof options.markGeometries === 'boolean' ? options.markGeometries : true,
                markingStrategy: options.markingStrategy || _defaultMarkingStrategy
            }
        },
        _createCollection: function(options) {
            var self = this;
            var drawingManager = options.drawingManager;

            var collection = new DrawingObjectsCollection([], {
                model: DrawingObjectModel
            });

            var addModel = function(feature) {
                var drawingObjectModel = new DrawingObjectModel(feature, options.markingStrategy);
                drawingObjectModel.on('change:selected', function(model) {
                    self.trigger('objectToggle', model.get('feature'), model.get('selected'));
                });
                if (options.selectMode === 'single') {
                    collection.each(function(e) {
                        e.set('selected', false);
                    });
                }
                collection.add(drawingObjectModel);
            };

            drawingManager.getFeatures().map(function(feature) {
                addModel(feature);
            });

            drawingManager.on('add', function(drawingEvent) {
                addModel(drawingEvent.object);
                collection.map(function(model) {
                    model.trigger('change', model);
                });
            });

            drawingManager.on('remove', function(drawingEvent) {
                var id = L.stamp(drawingEvent.object);
                collection.remove(collection.get(id));
                collection.map(function(model) {
                    model.trigger('change', model);
                });
            });

            drawingManager.on('layerremove', function(drawingEvent) {});

            return collection;
        },
        initialize: function(options) {
            this._options = this._fixOptions(options);
            this.collection = this._createCollection(this._options);
            this.on('ready', function() {
                this.getCollectionViews()[0].on('rendered:item', function() {
                    this.trigger('resize');
                }.bind(this));
            }.bind(this));
        },
        template: Handlebars.compile(nsGmx.Templates.DrawingObjectsListWidget.listTemplate),
        emptyTemplate: Handlebars.compile(nsGmx.Templates.DrawingObjectsListWidget.emptyTemplate),
        itemView: DrawingObjectView,
        events: {},
        uncheckGeometries: function() {
            _(this.getCollectionViews()[0].children).forEach(function(collectionView) {
                collectionView.model.set('selected', false);
            });
        },
        /**
         * Получить список выбранных объектов
         * @return {Array<L.GmxDrawing.Feature>}
         */
        getSelectedObjects: function() {
            return this.collection.filter(function(model) {
                return model.get('selected') === true;
            }).map(function(model) {
                return model.get('feature');
            })
        },
        /**
         * Снять выделение со всех объектов
         */
        clearSelection: function() {
            this.collection.each(function(model) {
                model.set('selected', false);
            });
        }
    });

    return DrawingObjectsListView;
})();