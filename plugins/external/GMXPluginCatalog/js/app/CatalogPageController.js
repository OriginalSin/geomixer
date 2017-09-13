var nsCatalog = nsCatalog || {};
nsCatalog.Controls = nsCatalog.Controls || {};

(function ($){

	var CatalogPage = function(map, mapHelper, dataSources, userInfo, path, waitingDialog) {
		this._currentScript = 0;
		this._path = path;
		this._tabsController = null;
		this._map = map;
		this._mapHelper = mapHelper;
		this._userInfo = userInfo;
		this._dataSources = dataSources;
		this._waitingDialog = waitingDialog;

		this._widgetsContainer = L.DomUtil.create('div', 'leaflet-top leaflet-bottom leaflet-left leaflet-right gmx-bottom-shift', this._map._controlContainer);
		L.DomUtil.addClass(this._widgetsContainer, L.Browser.ie ? 'gmxApplication-centerbsControlCorner-ie9' : 'gmxApplication-centerbsControlCorner');
		this._sidebarWidget = new nsGmx.IconSidebarWidget({useAnimation: true});
		this._sidebarWidget.appendTo(this._widgetsContainer);
		this._searchOptionsContainer = this._sidebarWidget.addTab('search-options','icon-cog');
		this._searchResultsContainer = this._sidebarWidget.addTab('search-results','icon-menu');
		this._selectedImagesContainer = this._sidebarWidget.addTab('search-selected','icon-bookmark');

		nsCatalog.SearchOptionsView = new nsCatalog.Controls.SearchOptionsView(
			this._searchOptionsContainer, this._path, this._userInfo, this._dataSources, $(this._widgetsContainer).find('.iconSidebarWidget').get(0));

		this.searchOptionsView = nsCatalog.SearchOptionsView;
		$(this.searchOptionsView).on('search', this._performSearch.bind(this));

		nsCatalog.SelectedImagesView = new nsCatalog.Controls.SelectedImagesView(
			this._selectedImagesContainer, this._map, this._mapHelper, this);

		this.selectedImagesView = nsCatalog.SelectedImagesView;

		nsCatalog.ResultList = new nsCatalog.Controls.SearchResultList(
			this._searchResultsContainer, this._mapHelper, this._waitingDialog, this.selectedImagesView);
		this._resultList = nsCatalog.ResultList;

		this._sidebarWidget.on('opened', function(e) {
				switch(e.id){
					case 'search-results':
						this._resultList.adjustCurrentGrid();
						this._adjustResultPanelHeight();
						this._resultList.showImages(this.getNotSelectedImages());
						break;
					case 'search-selected':
						this.selectedImagesView.adjustGrid();
						this._adjustSelectedImagesPanelHeight();
						this._resultList.hideImages(this.getNotSelectedImages());
						break;
				}
		}.bind(this));

		$(this._resultList)
		.on('images:selected',function(){
			this._sidebarWidget.open('search-selected');
		}.bind(this))
		.on('clear', function(){
			this._sidebarWidget.open('search-options');
		}.bind(this))
		.on('searchNonCovered', function(e, geometries){
			this._performSearch(geometries);
		}.bind(this));

		$(this.selectedImagesView)
		.on('items:remove', function(e, items){
			items.forEach(function(item){
				this._resultList.updateSelectImageIcon(item);
				this._resultList.hideImage(item);
			}.bind(this));
		}.bind(this))
		.on('item:click', function(e, item){
			this._resultList._itemClicked(item);
		}.bind(this))
		.on('selected:change', function(e, gs){
			this._resultList.set_Selected(gs);
		}.bind(this));

		$(_layersTree).on('activeNodeChange', function(e, node) {
			this.selectedImagesView.layerSelect(node.gmxProperties.content.properties);
		}.bind(this));

	};

	CatalogPage.prototype= {
		_adjustResultPanelHeight: function () {
			var $c = $(this._searchResultsContainer);
			if($c.css('display') === 'block'){
				this._resultList.adjustHeight($c.height());
			}
		},
		_adjustSelectedImagesPanelHeight: function () {
			var $c = $(this._selectedImagesContainer);
			if($c.css('display') === 'block'){
				this.selectedImagesView.adjustHeight($c.height());
			}
		},
		getNotSelectedImages: function () {
			var results = this._resultList.getResults();
			return Object.keys(results).reduce(function(a,k){
				return results[k]
					.filter(function(item){
						return !item.selected;
					})
					.reduce(function(b, item){
						b.push(item);
						return b;
					}, a);
			}, []);
		},

		dispose: function () {
			this.removeControls();
		},

		removeControls: function(){
			this._resultList.clearResults();
			this._widgetsContainer.remove();
			$(_layersTree).off('activeNodeChange', this._layerSelect.bind(this));
		},

		_performSearch: function(geometries) {

			this._resultList.clearResults();

			var def = new $.Deferred();

			var tasks = new nsCatalog.DelegatesChain();

			var validationErrors = [];
			var dsCount = 0;
			var searchOptions = this.searchOptionsView.getSearchOptions();
			var results = {};
			var ts = Object.keys(this._dataSources).map(function(k){
				return {key: k, dataSource: this._dataSources[k]};
			}.bind(this))
			.filter(function(item){
				return item.dataSource.checked && item.dataSource.validateSearchOptions(searchOptions, validationErrors);
			})
			.map(function(item){
				++dsCount;
				return function(){
					item.dataSource.search(searchOptions)
						.done(function(response){
							results[item.key] = response;

							if(--dsCount == 0){
								this._waitingDialog.close();
								var ok = false;
								var messages = Object.keys(results).reduce(function(a,k){
									var ds = this._dataSources[k];
									switch (results[k].status) {
										case 'exceeds':
											a.push(ds.title + ':<br/>Слишком много снимков.<br/>Пожалуйста, измените настройки поиска.');
											break;
										case 'nothing':
											a.push(ds.title + ':<br/>Ничего не найдено.<br/>Пожалуйста, измените настройки поиска.');
											break;
										default:
											ok = true;
											break;
									}
									return a;
								}.bind(this),[]);

								if(!ok && messages.length){
									$('<div>' + messages.join('<br/>') + '</div>').dialog({
										title: 'Внимание',
									  buttons: [{text: 'Закрыть', click: function() {$(this).dialog('close');}}]
									});
								}

								var rs = Object.keys(results)
									.filter(function(k){
										return results[k].status == 'ok';
									})
									.reduce(function(a,k){
										var ds = this._dataSources[k];
										a[k] = ds.getModel(results[k].data);
										return a;
									}.bind(this),{});

								this._resultList._disableGeometryOperations(false);
								this._resultList.setResults(rs);
								this._sidebarWidget.open('search-results');
								def.resolve();
							}
						}.bind(this));
				}.bind(this);
			}.bind(this));

			if(ts.length > 0){
				ts.forEach(function(t){
					tasks.add(t);
				});
				this._waitingDialog.open();
				tasks.execute();
			}
			else if(validationErrors.length > 0){
				alert(validationErrors.join('\r\n'));
				def.reject();
			}

			return def;
		},

		_onOptionsButtonClicked: function() {
			this.searchOptionsView.open();
		}

	};

	nsCatalog.Controls.CatalogPage = CatalogPage;

}(jQuery));
