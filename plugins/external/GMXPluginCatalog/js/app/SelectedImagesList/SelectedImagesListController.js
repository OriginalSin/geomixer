var nsCatalog = nsCatalog || {};
nsCatalog.Controls = nsCatalog.Controls || {};

(function($){

  // var handlebars = Handlebars.noConflict();

  var template = Handlebars.compile(
'<div class="selected-images">\
  <div>\
    <label class="selected-images-label">{{title}}</label>\
    <label class="selected-images-count">0</label>\
    <i title="{{save}}" class="results-save icon-save"></i>\
    <i title="{{clear}}" class="results-clear icon-cancel"></i>\
  </div>\
  <div class="selected-images-content"></div>\
</div>');

var saveDialogTemplate = Handlebars.compile(
'<div class="save-images-dialog">\
  <div>\
    <input id="save-images-layer-old" type="radio" name="layer_instance" value="old" checked>\
    <label for="save-images-layer-old">{{oldLayer}}</label>\
    <label class="save-images-layer-old-name"></label>\
  </div>\
  <div>\
    <input id="save-images-layer-new" type="radio" name="layer_instance" value="new">\
    <label for="save-images-layer-new">{{newLayer}}</label><input type="text" value="{{title}}">\
  </div>\
</div>');

var messageDialogTemplate = Handlebars.compile(
'<div>{{{text}}}</div>'
);

  var SelectedImagesView = function(place, map, mapHelper, catalogPage) {

    this._toggler = null;
    this._contentContainer = null;
    this._btnDownloadShapeFile = null;
    this._catalogPage = catalogPage;
    this._map = map;
    this._mapHelper = mapHelper;
    this._selectedItems = {};

    this._nodesCount = 0;
    this._nodes = {};

    this._fields = {
      'remove': {
        name: 'sceneid', type: 'string', button: function (value) {
          return 'icon-cancel';
        }
      },
      'sceneid': {
        name: 'sceneid', type: 'string'
      }
    };

    var h = template({
      title: 'Выбранные снимки',
      clear: 'Удалить все',
      save: 'Сохранить в векторный слой'
    });

    this.$container = $(h);
    this.$container.appendTo(place);

    var $panel = this.$container.find('.selected-images-content');
    $panel.tgrid({
      hasHeader: false,
      fields: this._fields,
      click: function(e, data){
        $(this).trigger('item:click', [data]);
      }.bind(this),
      buttonClick: function(e, target, item){
        if(target == 'icon-cancel'){
          var $panel = this.$container.find('.selected-images-content');
          var sceneid = item['sceneid'];
          if(this._selectedItems[sceneid]){
            var sel = this._selectedItems[sceneid];
            sel.selected = false;

            delete this._selectedItems[sceneid];

            var selectedItems = this.getSelected();
            $panel.tgrid('option','model', selectedItems);
            this.$container.find('.selected-images-count').text(selectedItems.length);
            this.adjustHeight();
            $(this).trigger('item:remove', [sel]);
          }

        }
      }.bind(this)
    });

    this.$container.find('.results-save').click(function(){
      this._$dlgSaveImages.dialog('open');
      var mode = this._$dlgSaveImages.find('input[type="radio"]:checked').val();
      this._setSaveImageLayerName(mode == 'old' && this._currentLayer ? this._currentLayer.title : '');
      this._disableSaveImage(mode == 'old' && !this._currentLayer);
    }.bind(this));

    this.$container.find('.results-clear').click(this._removeAll.bind(this));

    this._$dlgSaveImages = $(saveDialogTemplate({
      newLayer: 'новый',
      oldLayer: 'существующий',
      layerName: 'Название:',
      title: 'Новый слой'
    }));

    this._$dlgSaveImages.find('input[type="radio"]').click(function(e){
      var $n = this._$dlgSaveImages.find('input[type="text"]');
      var $t = $(e.target);
      switch ($t.val()) {
        case 'new':
          $n.css('visibility', 'visible');
          this._setSaveImageLayerName('');
          this._disableSaveImage(false);
          break;
        case 'old':
          $n.css('visibility', 'hidden');
          this._setSaveImageLayerName(this._currentLayer ? this._currentLayer.title : '');
          this._disableSaveImage(!this._currentLayer);
          break;
        default:
          break;
      };
    }.bind(this));

    this._$dlgSaveImages.dialog({
      title: 'Параметры слоя',
      autoOpen: false,
      width: 350,
      buttons:[
        {
          text: 'Сохранить',
          click: function() {
            this._$dlgSaveImages.dialog('close');
            var t = this._$dlgSaveImages.find('input[type="radio"]:checked').val();
            var n = this._$dlgSaveImages.find('input[type="text"]').val();
            this._saveImages(t,n);
          }.bind(this)
        },
        {
          text: 'Закрыть',
          click: function() {
            this._currentLayer = null;
            this._$dlgSaveImages.dialog('close');
          }.bind(this)
        }
      ]
    });

  };

  SelectedImagesView.prototype = {

    _disableSaveImage: function(disable){
      this._$dlgSaveImages.dialog('widget').find('button').eq(1).prop('disabled', disable);
    },

    _setSaveImageLayerName: function(name){
      this._$dlgSaveImages.dialog('widget').find('.save-images-layer-old-name').text(name);
    },

    _removeAll: function() {
      if (confirm('Вы уверены, что хотите очистить список выбранных изображений?')) {

        var items = this.getSelected()
        .reduce(function(a, item){
          var sceneid = item['sceneid'];
          if(this._selectedItems[sceneid]){
            var sel = this._selectedItems[sceneid];
            sel.selected = false;
            delete this._selectedItems[sceneid];
            a.push(sel);
          }
          return a;
        }.bind(this),[]);

        this.$container.find('.selected-images-content').empty();
        this.$container.find('.selected-images-count').text(0);

        $(this).trigger('items:remove', [items]);

      }
    },

    _saveImages: function(layerType, title){
      var items = this.getSelected();
      var dataTypes = this._getDataTypes(items);
      switch (layerType) {
        case 'new':
          this._createLayers(title, dataTypes)
          .done(function(layers){
            this._populateLayers(layers)
            .done(function(layerIDs){
              $(messageDialogTemplate({text: "Созданы и заполнены данными слои:<br/>" + layerIDs.join(', ')}))
              .dialog({
                title: 'Создание нового слоя',
                buttons: [
                  {
                    text: 'Закрыть',
                    click: function() {
                      $(this).dialog('close');
                      $(this).dialog('destroy');
                    }
                  }
                ]
              });
            })
            .fail(console.log.bind(console));
          }.bind(this))
          .fail(console.log.bind(console));
          break;
        case 'old':
          var layerID = this._currentLayer.LayerID;
          var layerTitle = this._currentLayer.title;
          var compatible = Object.keys(dataTypes).every(function(k){
            var t = dataTypes[k];
            return this._currentLayer.attributes.every(function(a,i){
              var c = t.columns[i];
              return a == c.Name && this._currentLayer.attrTypes[i] == c.ColumnSimpleType.toLowerCase();
            }.bind(this));
          }.bind(this));

          if(compatible){
            this._getMetadata(dataTypes)
            .done(function(data){
              var layers = Object.keys(data).reduce(function(a, k){
                if(a[layerID]){
                  a[layerID].items = a[layerID].items.concat(data[k]);
                }
                else {
                  a[layerID] = { title: layerTitle, items: data[k] };
                }
                return a;
              }.bind(this), {});
              this._populateLayers(layers)
              .done(function(layerIDs){
                $(messageDialogTemplate({text: "Заполнены данными слои:<br/>" + layerIDs.join(', ')}))
                .dialog({
                  title: 'Заполнение существующего слоя',
                  buttons: [
                    {
                      text: 'Закрыть',
                      click: function() {
                        $(this).dialog('close');
                        $(this).dialog('destroy');
                      }
                    }
                  ]
                });
              }.bind(this))
              .fail(console.log.bind(console));
            }.bind(this))
            .fail(console.log.bind(console));
          }
          else {
            $(messageDialogTemplate({text: 'Метаданные выбранных снимков не соответствуют атрибутам слоя'}))
            .dialog({
              title: 'Заполнение существующего слоя',
              buttons: [
                {
                  text: 'Закрыть',
                  click: function() {
                    $(this).dialog('close');
                    $(this).dialog('destroy');
                  }
                }
              ]
            });
          }
          break;
        default:
          break;
      }
    },

    _restrictColumns: function(item, columns){
      return Object.keys(item)
      .filter(function(k){
        return columns.some(function(x){
          return k == 'geometry' || k == x.Name;
        });
      })
      .reduce(function(a,k){
        a[k] = item[k];
        return a;
      },{});
    },

    _getMetadata: function(dataTypes){

      var def =  new $.Deferred();
      var taskCount = 0;
      var layers = {};

      var tasks = Object.keys(dataTypes).map(function(k){
        ++taskCount;
        return function(){
          var t = dataTypes[k];
          t.dataSource.getMetadata(t.itemIDs)
          .done(function(data){
            if(data){
              var values = data[Object.keys(data)[0]];
              if(Array.isArray(values) && values.length > 0){

                var items = values.map(function(item) {
                  return this._restrictColumns(item, t.columns);
                }.bind(this));

                if(layers[k]){
                  layers[k] = layers[k].concat(items);
                }
                else {
                  layers[k] = items;
                }
              }
            }
            if(--taskCount == 0){
              def.resolve(layers);
            }
          }.bind(this))
          .fail(function(){
            def.reject();
          });
        }.bind(this);
      }.bind(this),{});

      if(tasks.length > 0){
        var chain = new nsCatalog.DelegatesChain();
  			tasks.forEach(function(t){
  				chain.add(t);
  			});
  			chain.execute();
  		}
  		else {
  			def.reject();
  		}
      return def;
    },

    _populateLayers: function(layers){
      var def =  new $.Deferred();

      var taskCount = 0;
      var createdLayers = [];
      var tasks = Object.keys(layers).map(function(layerID){
        ++taskCount;
        var layer = layers[layerID];
        return function(){
          this._insertLayerObjects(layerID, layer.items)
          .done(function(response){
            if(!nsGmx.gmxMap.layersByID[layerID]){
              window._layersTree.addLayerToTree(layerID);
            }
            createdLayers.push(layer.title);
            if(--taskCount == 0){
              def.resolve(createdLayers);
            }
          })
          .fail(function(e){
            def.reject(e);
          });
        }.bind(this);

      }.bind(this));

      if(tasks.length > 0){
        var chain = new nsCatalog.DelegatesChain();
        tasks.forEach(function(t){
          chain.add(t);
        });
        chain.execute();
      }
      else {
        def.reject('Задачи вставки данных слоев не созданы');
      }

      return def;
    },

    _getDataTypes: function(items){
      return items.reduce(function(a,item){
          var s = item.info.dataSource.getSatellite (item['platform']).value;
          var columns = s.downloadFile.Columns.map(function(x){
            return {Name: x.Name, ColumnSimpleType: x.Type};
          });
          if(a[s.downloadFile.Filename]){
            a[s.downloadFile.Filename].itemIDs.push(item['sceneid']);
          }
          else {
            a[s.downloadFile.Filename] = {
              id: s.downloadFile.Filename,
              idField: s.downloadFile.IDField,
              dataSource: item.info.dataSource,
              itemIDs: [item['sceneid']],
              columns: columns
            };
          }
          return a;
        },{});
    },

    _createLayers: function(title, dataTypes){
      var def =  new $.Deferred();
      var taskCount = 0;

      var layers = {};

      var tasks = Object.keys(dataTypes).map(function(k){
        ++taskCount;
        return function(){
          var t = dataTypes[k];
          this._createVectorLayer(title + '_' + k, t.columns, t.idField)
          .done(function(response){
            if(response.Status == 'ok'){
              t.dataSource.getMetadata(t.itemIDs)
              .done(function(data){
                if(data){
                  var values = data[Object.keys(data)[0]];
                  if(Array.isArray(values) && values.length > 0){
                    var items = values.map(function(item) {
                      return this._restrictColumns(item, t.columns);
                    }.bind(this));

                    if(layers[response.Result.properties.name]){
                      layers[response.Result.properties.name].items = layers[response.Result.properties.name].items.concat(items);
                    }
                    else {
                      layers[response.Result.properties.name] = {
                        title: title + '_' + k,
                        items: items
                      };
                    }
                  }
                }

              	if(--taskCount == 0){
                  def.resolve(layers);
                }
              }.bind(this))
              .fail(function(){
    						def.reject();
    					});
            }
            else {
              def.reject();
            }
          }.bind(this))
          .fail(function(){
            def.reject();
          });
        }.bind(this);
      }.bind(this),{});

      if(tasks.length > 0){
        var chain = new nsCatalog.DelegatesChain();
  			tasks.forEach(function(t){
  				chain.add(t);
  			});
  			chain.execute();
  		}
  		else {
  			def.reject();
  		}
      return def;
    },

    _insertLayerObjects: function(layerID, items){
      var objects = items.map(function(item){
        var properties = Object.keys(item)
        .filter(function(k){
          return k != 'geometry';
        })
        .reduce(function(a,k){
          a[k] = item[k];
          return a;
        },{});
        return {
          geometry: item['geometry'],
          source: {rc: '', rcobj:''},
          properties: properties,
          action: 'insert'
        };
      });
      return _mapHelper.modifyObjectLayer(layerID, objects, 'EPSG:4326');
    },

    _createVectorLayer: function(title, columns, idField){
      return new nsGmx.LayerProperties({
          Type: 'Vector',
          Title: title,
          SourceType: 'manual',
          GeometryType: 'polygon',
          Quicklook: new nsGmx.QuicklookParams({
              template: 'http://search.kosmosnimki.ru/QuickLookImage.ashx?id=[' + idField + ']'
          }),
          Columns: columns
        }).save(false);
    },

    changeItemsSelection: function(items){
      var $panel = this.$container.find('.selected-images-content');
      items.forEach(function(item){
        var sceneid = item['sceneid'];
        if(item.selected){
          this._selectedItems[sceneid] = item;
        }
        else {
          delete this._selectedItems[sceneid];
        }
      }.bind(this));

      var selectedItems = this.getSelected();

      $panel.tgrid('option','model', selectedItems);
      this.$container.find('.selected-images-count').text(selectedItems.length);
      this.adjustHeight();
    },

    getSelected: function(){
      return Object.keys(this._selectedItems).map(function(k){
        return this._selectedItems[k];
      }.bind(this));
    },

    getSelectedHash: function(){
      return this._selectedItems;
    },

    _downloadShapeFile: function() {
      this._searchResultView._downloadShapeFile(true);
      return false;
    },

    adjustGrid: function(){
      this.$container.find('.selected-images-content')
        .each(function(i, x){
          $(x).tgrid('adjustHeader');
        }.bind(this));
    },

    adjustHeight: function(containerHeight){
      if(containerHeight) {
        this._containerHeight = containerHeight;
      }

      var $panel = this.$container.find('.selected-images-content');
      if($panel){

        var g = $panel.find('.tgrid-items');

        var ht = this.$container.find('[data-source]')
          .map(function(i,x){
            return $(x).find('.collapser-label').height();
          })
          .toArray().reduce(function(a,x){ return a + x; },0);

        var h = this._containerHeight
          - this.$container.find('.images-search-section-header').height()
          - this.$container.find('.images-search-section-toolbar .non-covered-toggle').height()
          - $panel.find('.tgrid-header').height()
          - ht - 20;

        if(h > 0) {
          g.css('max-height', h);
        }
      }
    },

    layerSelect: function(layer){
      this._currentLayer = layer;
      var mode = this._$dlgSaveImages.find('input[type="radio"]:checked').val();
      this._setSaveImageLayerName(mode == 'old' && this._currentLayer ? this._currentLayer.title : '');
      this._disableSaveImage(!this._currentLayer);
    }

  };

  nsCatalog.Controls.SelectedImagesView = SelectedImagesView;

}(jQuery));

﻿
