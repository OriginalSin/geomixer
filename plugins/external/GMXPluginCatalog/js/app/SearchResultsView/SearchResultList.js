var nsCatalog = nsCatalog || {};
nsCatalog.Controls = nsCatalog.Controls || {};

(function($, _){

	// var handlebars = Handlebars.noConflict();
	var handlebars = Handlebars;

	var toolbarTemplate = Handlebars.compile(
	'<div>\
		<i title="{{showInfo}}" class="icon-info"></i>\
		<i title="{{addToCart}}" class="icon-cart {{cartIcon}}"></i>\
		<i title="{{close}}" class="icon-cancel"></i>\
	</div>');

	var downloadOptionsTemplate = Handlebars.compile(
	'<div>\
		<div>\
			<ul>\
				{{#each items}}\
					<li>\
						<input id="download_{{@key}}" type="checkbox" value="{{@key}}"{{#if checked}} checked{{/if}} {{#if disabled}}disabled{{/if}}/>\
						<label for="download_{{@key}}">{{label}}</label>\
					</li>\
				{{/each}}\
			</ul>\
		</div>\
		<div>\
			<span>{{file}}</span>\
			<input type="text" value="shapes"/>\
		</div>\
	</div>');

	var filterTemplate = Handlebars.compile(
	'<div>\
		{{#each this}}\
		<div data-field-key="{{@key}}">\
			<div>\
				<span></span>\
				<label>{{title}}</label>\
			</div>\
			<div>\
				<input id="{{uuid}}_{{@key}}_total" type="checkbox" value="all">\
				<label for="{{uuid}}_{{@key}}_total">{{all}}</label>\
				<ul>\
					{{#each items}}\
					<li>\
						<input id="{{uuid}}_{{@key}}_{{key}}" type="checkbox" value="{{key}}"/>\
						<label for="{{uuid}}_{{@key}}_{{key}}">{{name}}</label>\
						<label for="{{uuid}}_{{@key}}_{{key}}"><span class="search-results-count item-count">{{count}}</span></label>\
					</li>\
					{{/each}}\
				</ul>\
			</div>\
		</div>\
		{{/each}}\
	</div>');

	var template = Handlebars.compile(
	'<div class="search-results-section">\
		<div class="images-search-section-toolbar">\
			<!--span class="non-covered-toggle" title="{{noncovered}}">\
				<input id="non-covered-toggler" type="checkbox"/>\
				<label for="non-covered-toggler">{{noncovered}}</label>\
				<span class="non-covered-area">0 кв. км</span>\
				<i title="{{refresh}}" class="non-covered-refresh icon-refresh"></i>\
				<i title="{{convert}}" class="non-covered-convert icon-magic"></i>\
			</span-->\
			<i title="{{addAll}}" class="results-add-all icon-link-ext"></i>\
			<i title="{{addVisible}}" class="results-add-visible icon-link-ext-alt"></i>\
			<i title="{{download}}" class="results-download icon-save" disabled></i>\
			<i title="{{clear}}" class="results-clear icon-cancel"></i>\
		</div>\
		<div class="search-results-content"></div>\
	</div>');

	var itemsTemplate = Handlebars.compile(
	'{{#each this}}\
		<div data-source="{{@key}}">\
			<div>\
				<div class="collapser-button">\
					<span class="collapser-pointer"></span>\
					<label class="collapser-label">{{title}}</label>\
					<label class="search-results-count search-results-total-count"></label>\
				</div>\
				<span class="search-results-filter tgrid-icon tgrid-filter-empty"></span>\
			</div>\
			<div class="collapser-panel grid-place"></div>\
		</div>\
	{{/each}}');

	var SearchResultList = function(place, mapHelper, waitingDialog, selectedImagesView){
		this._mapHelper = mapHelper;
		this._map = this._mapHelper._map;
		this._waitingDialog = waitingDialog;
		this._nonCoveredDrawing = null;
		this._popovers = [];
		this._selectedItemsCount = 0;
		this._layerObjects = {};
		this._selectedImagesView = selectedImagesView;

		var h = template({
			addAll: 'Добавить найденные в корзину',
			addVisible: 'Добавить видимые в корзину',
			title: 'Результаты поиска',
			download: 'Скачать',
			downloadIcon: 'img/download_icon.png',
			clear: 'Очистить',
			optionsIcon: gmxCore.getModulePath('Catalog') + 'img/preferences.png',
			clearIcon: gmxCore.getModulePath('Catalog') + 'img/close.png',
			noncovered: 'Непокрытая площадь',
			refresh: 'Обновить',
			refreshIcon: gmxCore.getModulePath('Catalog') + 'img/refresh.png',
			convert: 'Поиск',
			convertIcon: gmxCore.getModulePath('Catalog') + 'img/polygon_tool_a.png'
		});

		this.$container = $(h);
		this.$container.on('mousewheel', function(e) { e.stopPropagation(); });
		// this.$container.on('click', function(e){
		// 	this._hideOtherPopovers(-1);
		// }.bind(this));
		this.$container.find('.results-download').click(this._downloadShapeFile.bind(this));
		this.$container.find('.results-clear').click(this.clearResults.bind(this));
		this.$nonCoveredHandle = this.$container.find('.non-covered-toggle input[type="checkbox"]').click(this._refreshNonCovered.bind(this));
		this.$container.find('.non-covered-refresh').click(this._refreshNonCovered.bind(this));
		this.$container.find('.non-covered-convert').click(this._searchNonCovered.bind(this));
		this.$container.find('.results-add-all').click(this._addToCart.bind(this, false));
		this.$container.find('.results-add-visible').click(this._addToCart.bind(this, true));

		this._downloadOptions = {
			'selected': {label: 'Выбранные снимки', checked: false},
			'noncovered': {label: 'Непокрытая площадь', checked: false}
		};

		this.$container.appendTo(place);

	};

	SearchResultList.prototype = {

		_addToCart: function(visible){
			this.$container.find('.tgrid-container').each(function(i, x){

				var $panel = $(x);
				var items = $panel.tgrid('option', 'model');
				var selected = visible ?
					items.filter(function(item) { return item.checked; }) :
					items;

				selected.forEach(function(item){
					item.selected = true;
				});

				$panel.tgrid('refresh');

				this._selectedImagesView.changeItemsSelection(selected);
			}.bind(this));

			if(this._selectedImagesView.getSelected().length){
				$(this).trigger('images:selected');
			}
		},

		_initDownloadPopover: function(e){
			e.stopPropagation();
			$(e.target).parent().find('.popover-content input[type="checkbox"]')
				.each(function(i, x){
					var $chk = $(x);
					var k = $chk.val();
					var disable = false;
					$chk.prop('checked', this._downloadOptions[k].checked);
					switch (k) {
						case 'noncovered':
							disable = !this._mapHelper.hasGeometries();
							$chk.attr('disabled', disable);
							if(disable) {
								$chk.prop('checked', false);
							}
							break;
						case 'selected':
							disable = !(this._selectedItems && this._selectedItems.length > 0);
							$chk.attr('disabled', disable);
							if(disable) {
								$chk.prop('checked', false);
							}
							break;
						default:
							break;
					}
				}.bind(this))
				.off()
				.click(function(e){
					var $chk = $(e.target);
					this._downloadOptions[$chk.val()].checked = $chk.prop('checked');
				}.bind(this));
		},

		_disableGeometryOperations: function(disabled){
			this.$container.find('.results-download-execute').attr('disabled', disabled);
			this.$container.find('.non-covered-toggle').attr('disabled', disabled);
			this.$container.find('.non-covered-refresh').attr('disabled', disabled);
			this.$container.find('.non-covered-convert').attr('disabled', disabled);
		},

		clearResults: function() {
			this._clearGeometries();

			this.$container.find('.search-results-content').empty();

			while (this._popovers.length) {
				this._popovers.shift().popover('destroy');
			}

			if(this._nonCoveredDrawing) {
				this._map.removeLayer(this._nonCoveredDrawing);
				this._nonCoveredDrawing = null;
			}

			this._disableGeometryOperations(true);

			$(this).trigger('clear');
		},

		updateSelectImageIcon: function(item){
			this._updateGridsImageIcons(item);
			this._updateSelectImageToolbarIcon(item);
		},

		_updateGridsImageIcons: function(item){
			this.$container
			.find('.search-results-content')
			.children()
			.each(function(i,x){
				$(x).find('.grid-place').tgrid('refresh');
			});
		},

		_updateSelectImageToolbarIcon: function(item){
			if(item.info.toolbar) {
				var $el = $(item.info.toolbar.element).find('.icon-cart');
				if(item.selected){
					$el.removeClass('icon-plus-squared').addClass('icon-minus-squared');
				}
				else {
					$el.removeClass('icon-minus-squared').addClass('icon-plus-squared');
				}
			}
		},

		hideImages: function(items){
			items.forEach(this.hideImage.bind(this));
		},

		showImages: function(items){
			items.forEach(this.showImage.bind(this));
		},

		hideImage: function(item){
			if(item.info.overlay) {
				this._map.removeLayer(item.info.overlay);
			}
			if(item.info.polygon) {
				this._map.removeLayer(item.info.polygon);
			}
			if(item.info.toolbar) {
				this._map.removeLayer(item.info.toolbar);
			}
		},

		showImage: function(item){
			this._map.removeLayer(item.info.polygon);
			if(item.checked){
				if(item.info.overlay){
					this._map.addLayer(item.info.overlay);
				}
				else {
					item.info.overlay = this._mapHelper.drawOverlay(item.geometry, item.crs, item.info.anchors, item.info.image);
				}
				item.info.overlay.bringToFront();
			}
			if(item.info.polygon) {
				this._map.addLayer(item.info.polygon);
			}
		},

		updateOverlayVisibility: function(item){
			if(item.checked){
				this._map.removeLayer(item.info.polygon);
				if(item.info.overlay){
					this._map.addLayer(item.info.overlay);
				}
				else {
					item.info.overlay = this._mapHelper.drawOverlay(item.geometry, item.crs, item.info.anchors, item.info.image);
				}
				item.info.overlay.bringToFront();
				this._map.addLayer(item.info.polygon);
				item.info.polygon.bringToFront();

				// if(item.info.icon){
				// 	this._map.addLayer(item.info.icon);
				// }
				// else{
				// 	item.info.icon = this._mapHelper.drawIcon(item.info.anchors, item.info.tooltip);
				// }

			}
			else {
				if(item.info.overlay) {
					this._map.removeLayer(item.info.overlay);
				}
				if(item.info.icon) {
					this._map.removeLayer(item.info.icon);
				}
				item.info.polygon.bringToBack();

				if(item.info.toolbar) {
					this._map.removeLayer(item.info.toolbar);
					item.info.toolbar = null;
				}
			}
		},

		_itemChecked: function (item, $panel) {
			if(item.checked){
				++this._selectedItemsCount;
			}
			else {
				--this._selectedItemsCount;
			}
			$panel.tgrid('refresh');
			this.updateOverlayVisibility(item);
		},

		_itemClicked: function (item) {
			this._mapHelper.zoomToGeoJSON(item.geometry);
		},

		_drawItems: function ($tab, $panel, items) {
			if(items && items.length){
				var rd = new jsts.io.GeoJSONReader();
				var selectedItems = this._selectedImagesView.getSelected();
				return items.reduce(function(gs, item){
					if (item.checked) {
						item.info.overlay = this._mapHelper.drawOverlay(item.geometry, item.crs, item.info.anchors, item.info.image);
						item.info.overlay.bringToFront();
					}
					var sceneid = item['sceneid'];
					item.selected = !!selectedItems[sceneid];
					item.info.polygon = this._mapHelper.drawPolygon(item.geometry, item.crs, item.info.color);
					item.info.polygon.bringToFront();
					item.info.polygon
						.on('click', function(e){
							// e.originalEvent.stopPropagation();
							item.checked = !item.checked;
							this._itemChecked(item, $panel);
							if($panel.css('display') == 'none'){
								$tab.find('.collapser-button').click();
							}
							if(item.checked && item.info.polygon) {
								// var $row = this._layerObjects[L.stamp (item.info.polygon)];
								// $panel.tgrid('scrollTo', $row);
							}
						}.bind(this))
						.on('contextmenu', function(e){
							e.originalEvent.stopPropagation();
							if(!item.info.toolbar){
								item.info.toolbar = this._createToolbar(item, e.latlng, $panel);
								this._map.addLayer(item.info.toolbar);
								if(typeof this._clearToolbar == 'function'){
									this._clearToolbar();
								}
								this._clearToolbar = function() {
									this._map.removeLayer(item.info.toolbar);
									item.info.toolbar = null;
								};
							}
						}.bind(this));
					var geojson = $.extend(true, {}, item.geometry);
					gs.push(rd.read(geojson));
					return gs;
				}.bind(this),[]);
			}
			else {
				return [];
			}
		},

		_createToolbar: function(item, anchor, $panel){
			var h = toolbarTemplate({
				close: 'Закрыть',
				showInfo: 'Метаданные',
				addToCart: 'Добавить в корзину',
				cartIcon: item.selected ?  'icon-minus-squared' : 'icon-plus-squared'
			});

			var $div = $(h).addClass('image-toolbar');

			// var corner = this._getCorner(item.info.polygon, 'right top');
			// var anchor = this._getPointNearestTo(item.geometry, corner);

			var toolbar = L.divOverlay($div.get(0), anchor);


			$div.find('.icon-cart').click(function(e){
				e.stopPropagation();
				var $t = $(e.target);
				if($t.hasClass('icon-plus-squared')){
					item.selected = true;
					$t.removeClass('icon-plus-squared').addClass('icon-minus-squared');
					$t.attr('title','Удалить из корзины');
				}
				else {
					item.selected = false;
					$t.removeClass('icon-minus-squared').addClass('icon-plus-squared');
					$t.attr('title','Добавить в корзину');
				}
				$panel.tgrid('refresh');
				this._selectedImagesView.changeItemsSelection([item]);
			}.bind(this));

			$div.find('.icon-info').click(function(e){
				e.stopPropagation();
				L.popup({closeOnClick: false, maxWidth: 450})
				.setLatLng(toolbar.anchor)
				.setContent(item.info.tooltip).openOn(this._map);
			}.bind(this));

			$div.find('.icon-cancel').click(function(e){
				e.stopPropagation();
				this._map.removeLayer(toolbar);
				item.info.toolbar = null;
				this._clearToolbar = null;
			}.bind(this));

			return toolbar;
		},

		_clearGeometries: function(){
			this.$container.find('.tgrid-container').each(function(i, x){
				$el = $(x);
				this._removeMapObjects($el.tgrid('option','model'));
			}.bind(this));
			this.$container.find('.search-results-content').empty();
		},

		_removeMapObjects: function(model) {
			if(model && model.length) {
				model
				.filter(function(item){
					return !item.selected;
				})
				.forEach(function(item){
					if (item.info.polygon) {
						this._map.removeLayer(item.info.polygon);
					}
					if (item.info.overlay) {
						this._map.removeLayer(item.info.overlay);
					}
					if (item.info.icon) {
						this._map.removeLayer(item.info.icon);
					}
					if (item.info.infoBalloon) {
						this._map.removeLayer(item.info.infoBalloon);
					}
					if (item.info.toolbar) {
						this._map.removeLayer(item.info.toolbar);
					}
				}.bind(this));
			}
		},

		_searchNonCovered: function(){
			if(!this.$nonCoveredHandle.attr('disabled')){
				if(this._nonCoveredDrawing){
					var gs = this._nonCoveredDrawing
						.toGeoJSON()
						.features.map(function(x){
							return x.geometry;
						});
					$(this).trigger('searchNonCovered', gs);
				}
			}
		},

		toSerializable: function(items, fields){
			return items.map(function(x){
				return Object.keys(x).reduce(function(a,k){
					var f = fields[k];
					if(f && f.type === 'date'){
						a[k] = x[k].toISOString();
					}
					else if(k == 'info') {
						delete x[k].polygon;
						delete x[k].overlay;
						delete x[k].icon;
						delete x[k].dataSource;
						a[k] = x[k];
					}
					else{
						a[k] = x[k];
					}
					return a;
				},{});
			});
		},

		fromSerializable: function(items, fields){
			return items.map(function(x){
				return Object.keys(x).reduce(function(a,k){
					var f = fields[k];
					if(f && f.type === 'date'){
						a[k] = new Date(x[k]);
					}
					else {
						a[k] = x[k];
					}
					return a;
				},{});
			});
		},

		_refreshNonCovered: function(){
			if(!this.$nonCoveredHandle.attr('disabled')){
				if(this._nonCoveredDrawing){
					this._map.removeLayer(this._nonCoveredDrawing);
					this._nonCoveredDrawing = null;
				}

				var results = this.getResults();

				var gs =  Object.keys(results).reduce(function(a,k){
					var xs = results[k].map(function(item){ return item.geometry; });
					return a.concat(xs);
				}.bind(this),[]);

				this.getGeometryDiff(this._mapHelper.getGeometries(), gs).done(function(g){
						this._updateNonCoveredArea((L.gmxUtil.geoArea(g, false) / 1.0E+6).toFixed(3));
						if(!!this.$nonCoveredHandle.prop('checked')){
							var polygon = this._mapHelper.drawPolygon(g, null, '#ff7f50', 0.5);
							this._nonCoveredDrawing = polygon;
						}
				}.bind(this));

			}
		},

		_updateNonCoveredArea: function(text){
			this.$container.find('.non-covered-area').text(text + ' кв. км');
		},

		_showDownloadOptions: function(){
			var def = new $.Deferred();
			var _this = this;
			this._downloadOptions['selected'].disabled = this._selectedItemsCount == 0;
			this._downloadOptions['noncovered'].disabled = !this._nonCoveredDrawing;
			var dlg = downloadOptionsTemplate({items: this._downloadOptions, file: 'Имя файла'});
			$(dlg).dialog({
				title: 'Параметры',
				buttons: [{
					text: 'Да',
					click: function() {
						$(this).find('input[type="checkbox"]').each(function(i, x){
							var $x = $(x);
							this._downloadOptions[$x.val()].checked = $x.prop('checked');
						}.bind(_this));
						$(this).dialog('close');
						var nc = _this._downloadOptions['noncovered'].checked,
						sel = _this._downloadOptions['selected'].checked;
						var file = $(this).find('input[type="text"]').val();
						_this._getDownloadParams(nc, sel)
							.done(function(shapes){
								var files = Object.keys(shapes).map(function(k) {
									return shapes[k];
								});
								def.resolve(files, file, sel);
							})
							.fail(function(){});
					}
				},
				{
					text: 'Отмена',
					click: function() {
						$(this).dialog('close');
						def.reject();
					}
				}]
			});
			return def;
		},

		_downloadShapeFile: function() {
			if(this._hasResults()){
				this._showDownloadOptions().done(function(files, filename, includeImages){
					var translitName = nsGmx.Utils.translit (filename);
					var rq = JSON.stringify({ArchiveName: translitName, Files:  files, Images: includeImages});
					sendCrossDomainPostRequest(window.serverBase + 'VectorFileMaker',
						{WrapStyle: 'message', Request: rq},
						function(data){
							if (data.Status == 'ok'){
								sendCrossDomainPostRequest(window.serverBase + 'DownloadFile?id=' + data.Result, {WrapStyle: 'message'});
							}
							else {
								console.log(data.ErrorInfo);
							}
						});
				}.bind(this));
			}
			return false;
		},

		_fixGeometry: function(geometry, crs){
			return L.gmxUtil.geometryToGeoJSON(geometry, crs == 'mercator');
		},

		getGeometryDiff: function(fst, snd){
			var def =  new $.Deferred();
			var rd = new jsts.io.GeoJSONReader();
			var wr = new jsts.io.GeoJSONWriter();
			var ss = fst.map(function(g){ return rd.read(g); })
			var rs = snd.map(function(g){ return rd.read(g); })
			var searchGeometries = "MakeValid(GeometryFromGeoJson('" + JSON.stringify(wr.write(new jsts.geom.GeometryCollection(ss))) + "', 4326))";
			var resultGeometries = "MakeValid(GeometryFromGeoJson('" + JSON.stringify(wr.write(new jsts.geom.GeometryCollection(rs))) + "', 4326))";
			sendCrossDomainPostRequest(
				window.serverBase + 'Calculator',
				{WrapStyle: 'message', query: "(" + searchGeometries + ") - (" + resultGeometries + ")"},
				function(data){
					if (data.Status == 'ok' && data.Result) {
						def.resolve(L.gmxUtil.geometryToGeoJSON(data.Result));
					}
					else {
						def.reject();
					}
				});
			return def;
		},

		_getDownloadParams: function(dif, sel){
			var def =  new $.Deferred();
			var results = this.getResults();
			var dsCount = 0;
			var shapes = {};
			Object.keys(results).forEach(function (k) {
				++dsCount;
				nsCatalog.DataSources[k].getDownloadFiles(results[k], sel)
					.done(function(files){
						shapes = Object.keys(files).reduce(function(a,k){
							if(a[k]){
								a[k].Features = a[k].Features.concat(files[k].Features);
							}
							else {
								a[k] = $.extend(true, {}, files[k]);
							}
							return a;
						}, shapes);
						if(--dsCount == 0){
							if(dif){
								shapes['diff'] = {
									Filename: 'diff',
					        Formats: ['shape'],
					        Features: this._nonCoveredDrawing.toGeoJSON().features
								};
							}
							def.resolve(shapes);
						}
					}.bind(this))
					.fail(function(){
						if(--dsCount == 0){
							def.resolve(shapes);
						}
					});
			}.bind(this));

			return def;
		},

		set_Selected: function(items){
			this._selectedItems = items;
		},

		_hasResults: function(){
			var res = this.getResults();
			var rks = Object.keys(res);
			return rks.length > 0 && rks.some(function(k){ return res[k].length > 0; });
		},

		getResults: function(){
			return this.$container.find('[data-source]').map(function(i,x){
				var $tab = $(x);
				var k = $tab.attr('data-source');
				var $panel = $tab.find('.grid-place');
				var items = $panel.tgrid('option', 'model');
				return {key: k, items: items};
			})
			.toArray()
			.reduce(function(a,x){
				a[x.key] = x.items;
				return a;
			},{});
		},

		setResults: function(results) {
			var rks = Object.keys(results);
			if(rks.length > 0){
				var dss = rks
					.reduce(function(a,k) {
						a[k] = nsCatalog.DataSources[k];
						return a;
					},{});

				var $root = this.$container.find('.search-results-content');
				$root.empty();
				$root.html(itemsTemplate(dss));
				var gs = [];
				var rd = new jsts.io.GeoJSONReader();
				$root.children().each(function(i,x){
					var $tab = $(x);
					var $panel = $tab.find('.grid-place');
					var dsk = $tab.attr('data-source');
					var ds = nsCatalog.DataSources[dsk];
					$panel.tgrid({
						sortBy: ds.sortBy,
						fields: ds.fields,
						filters: ds.filters,
						select: function(e, data){
							this._itemChecked(data, $panel);
							$(this).trigger('item:select', data);
						}.bind(this),
						click: function(e, data){
							this._itemClicked(data);
							$(this).trigger('item:click', data);
						}.bind(this),
						buttonClick: function(e, iconClass, item){
							if(iconClass == 'icon-plus-squared'){
								item.selected = true;
							}
							else if(iconClass == 'icon-minus-squared') {
								item.selected = false;
							}
							$panel.tgrid('refresh');
							this._selectedImagesView.changeItemsSelection([item]);
						}.bind(this)

					});
					var items = results[dsk].map(function(item) {
						item.info.dataSource = ds;
						return item;
					});
					$panel.tgrid('option','model', items);
					gs = gs.concat(this._drawItems($tab, $panel, items));
					$panel.tgrid('getRows').reduce(function(a, $row){
						var item = $row.data();
						if(item.info.polygon) {
							this._layerObjects[L.stamp(item.info.polygon)] = $row;
						}
					}.bind(this));
					$tab.find('.search-results-total-count').text($panel.tgrid('getFilteredCount'));
					var $btnFilter = $tab.find('.search-results-filter');
					var filters = $.extend(true, {}, $panel.tgrid('option','filters'));
					var fields = $.extend(true, {}, $panel.tgrid('option','fields'));
					var h = Object.keys(filters).reduce(function(m, k){
						var flt = filters[k];
						var fld = fields[k];
						var filterItems = Object.keys(flt.values).reduce(function(a,k){
							a.push({name: k, key: k, col: i, checked: flt.values[k], count: 0, uuid: dsk});
							return a;
						}.bind(this),[]);
						m[k] = {title: fld.title, all: 'Все', col: k, items: filterItems, count: 0, uuid: dsk};
						return m;
					}.bind(this),{});
					$btnFilter.popover({
						content: filterTemplate(h),
						html: true,
						placement: 'bottom'
					});
					$btnFilter.on('shown.bs.popover',function(e){
						this._hideOtherPopovers(i);
						var $parent = $(e.target).parent();
						var $container = $parent.find('.popover-content');
						var updateStats = function(key, statistics){
							$container.find('[data-field-key="' + key + '"] ul li').each(function(k,p){
								var $p = $(p);
								var v = $p.find('input[type="checkbox"]').val();
								var s = parseInt(statistics[v] ? statistics[v] : 0, 10);
								$p.find('.item-count').text(s.toString());
								});
							};
							var stats = $panel.tgrid('getStats');
							$container.find('[data-field-key]')
								.each(function(_k, x){
									var $field = $(x);
									var k = $field.attr('data-field-key');
									var s = stats[k];
									var flt = filters[k];

									$field.find('ul input[type="checkbox"]').each(function(n,u){
										var $u = $(u);
										$u.prop('checked', flt.values[$u.val()]);
										$u.off()
										.click(this._filterOptionClick.bind(this, $u, filters, flt, $btnFilter, $panel, $tab));
									}.bind(this));
									updateStats(k, s || {});
									$field.find('input[value="all"]')
										.tristate({items: $field.find('ul input[type="checkbox"]')})
										.on('selectall',function(e,checked){
											Object.keys(flt.values).forEach(function(v){ flt.values[v] = checked; });
											this._updateFilterIcon($btnFilter, filters);
											this._applyFilters($panel, $tab, filters);
										}.bind(this));
								}.bind(this));
					}.bind(this));
					this._popovers.push($btnFilter);
				}.bind(this));

				var gc = new jsts.geom.GeometryCollection();
				gc.geometries = gs;
				this._mapHelper.zoomToGeometry(gc);

				this._collapser = $root.collapser({iconOpen: 'leftmenu-toggle-icon leftmenu-down-icon', iconClosed: 'leftmenu-toggle-icon leftmenu-right-icon'})
				.on('shown', function(e, p){
					p.tgrid('adjustHeader');
					this.adjustHeight();
				}.bind(this));
			}
		},

		_updateFilterIcon: function($btnFilter, filters){
			var isEmpty = Object.keys(filters).every(function(k){
				var flt = filters[k];
				return Object.keys(flt.values).every(function(k){
					return flt.values[k];
				});
			});
			if(isEmpty){
				$btnFilter.removeClass('tgrid-filter-set');
				$btnFilter.addClass('tgrid-filter-empty');
			}
			else {
				$btnFilter.removeClass('tgrid-filter-empty');
				$btnFilter.addClass('tgrid-filter-set');
			}
		},

		_applyFilters: function($panel, $tab, filters){
			var f = $panel.tgrid('filter', filters);
			$tab.find('.search-results-total-count').text($panel.tgrid('getFilteredCount'));
			this._removeMapObjects(f.items);
			if(this._nonCoveredDrawing) {
				this._map.removeLayer(this._nonCoveredDrawing);
				this._nonCoveredDrawing = null;
			}
			this._drawItems($tab, $panel, f.filtered);
		},

		_filterOptionClick: function($val, filters, flt, $btnFilter, $panel, $tab){
			var v = $val.val();
			var checked = $val.prop('checked');
			flt.values[v] = checked;
			this._updateFilterIcon($btnFilter, filters);
			this._applyFilters($panel, $tab, filters);
		},

		_hideOtherPopovers: function(index){
			for(var i in this._popovers){
				if(i != index){
					this._popovers[i].popover('hide');
				}
			}
		},

		adjustCurrentGrid: function(){
			this.$container.find('.search-results-content .grid-place')
				.filter(function(i, x){
					return $(x).css('display') == 'block';
				})
				.each(function(i, x){
					$(x).tgrid('adjustHeader');
				});
		},

		adjustHeight: function(containerHeight){
			if(containerHeight) {
				this._containerHeight = containerHeight;
			}

			var p = this.$container.find('.grid-place:visible').first();
			if(p){

				var g = p.find('.tgrid-items');

				var ht = this.$container.find('[data-source]')
					.map(function(i,x){
						return $(x).find('.collapser-label').height();
					})
					.toArray().reduce(function(a,x){ return a + x; },0);

				var h = this._containerHeight
					- this.$container.find('.images-search-section-header').height()
					- this.$container.find('.images-search-section-toolbar .non-covered-toggle').height()
					- p.find('.tgrid-header').height()
					- ht - 50;

				if(h > 0) {
					g.css('max-height', h);
				}
			}
		}

	};

	nsCatalog.Controls.SearchResultList = SearchResultList;

	}(jQuery));
