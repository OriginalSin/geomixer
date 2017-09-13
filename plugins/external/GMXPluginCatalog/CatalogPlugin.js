var nsCatalog = nsCatalog || {};

(function($){

	_translationsHash.addtext("rus", {
		"Поиск снимков": "Поиск снимков"
	});
	_translationsHash.addtext("eng", {
		"Поиск снимков": "Search imagery"
	});

	nsCatalog.SEARCH_LIMIT = 1000;

	var bLoaded = false;
	var oLeftMenu = new leftMenu();
	var sCadastreHost = false;
	var pluginPath = '';

	var unloadMenu = function(){	}

	var getUserInfo = function (){
		var def = new $.Deferred();
		var userInfo = {};
		sendCrossDomainPostRequest(
			window.serverBase + 'Layer/GetLayerInfo.ashx',
			{layerId: '9077D16CFE374967A8C57C78095F34EA', WrapStyle: 'message'},
			function(response){
				if (response.Status == 'ok' && response.Result && response.Result.LayerID == '9077D16CFE374967A8C57C78095F34EA') {
					userInfo.Role = 'scanex';
				}
				def.resolve(userInfo);
			});
			return def;
	};

	var scripts = [
		'js/lib/popover/popover.js',
		'js/lib/jquery/jquery.domec.min.js',
		'js/lib/jquery/jquery.maskedinput.min.js',
		'js/lib/jsts/javascript.util.js',
		'js/lib/jsts/jsts.js',
		'js/lib/tristate/tristate.js',
		'js/lib/tgrid/tgrid.js',
		'js/lib/collapser/collapser.js',
		'js/lib/slider/slider.js',
		'js/app/DelegatesChain.js',
		'js/app/DataSources/BaseDataSource.js',
		'js/app/DataSources/InternalDataSource.js',
		'js/app/DataSources/ExternalDataSource.js',
		'js/app/MapObjectsHelper.js',
		'js/app/PermalinkController.js',
		'js/app/AnimationHelpers/AnimationSequence.js',
		'js/app/AnimationHelpers/CssAnimation.js',
		'js/app/GmxWidget/GmxWidget.js',
		'js/app/IconSidebarWidget/iconSidebarWidget.js',
		'js/app/LoaderDialog/LoaderDialogController.js',
		'js/app/SearchOptionsView/SearchOptionsViewController.js',
		'js/app/SelectedImagesList/SelectedImagesListController.js',
		'js/app/SearchResultsView/SearchResultList.js',
		'js/app/RangeControl/RangeControl.js',
		'js/app/L.ImageTransform.js',
		'js/app/DivOverlay/DivOverlay.js',
		'js/app/CatalogPageController.js'
	];

	var styles = [
		'catalog.css',
		'js/lib/tgrid/tgrid.css',
		'js/lib/collapser/collapser.css',
		'js/lib/popover/popover.css',
		'js/lib/slider/slider.css',
		'js/app/IconSidebarWidget/iconSidebarWidget.css',
		'js/app/PeriodSelector/PeriodSelector.css',
		'js/app/LoaderDialog/LoaderDialog.css',
		'js/app/SearchOptionsView/SearchOptionsView.css',
		'js/app/SelectedImagesList/SelectedImagesList.css',
		'js/app/SearchResultsView/SearchResultsView.css',
		'js/app/RangeControl/RangeControl.css',
		'js/app/DivOverlay/DivOverlay.css'
	];

	getUserInfo().done(function(userInfo){

		var loadPlugin = function(params){
			var alreadyLoaded = !!nsCatalog.CatalogPage;
			if (!alreadyLoaded){

				nsCatalog.LoaderDialog = new nsCatalog.Controls.LoaderDialog();

				nsCatalog.MapHelper = new nsCatalog.Helpers.MapHelper(nsGmx.leafletMap, nsCatalog.TreeHelper);
				nsCatalog.DataSources = {};

				nsCatalog.DataSources.ExternalDataSource = new nsCatalog.ExternalDataSource(nsCatalog.MapHelper);

				if(userInfo.Role == 'scanex'){
					nsCatalog.DataSources.InternalDataSource = new nsCatalog.InternalDataSource(nsCatalog.MapHelper);
				}
				if(params && params.dataSources){
					var dataSources =
						Array.isArray(params.dataSources) ?
							params.dataSources :
							typeof params.dataSources == 'string' ?
								[params.dataSources] :
								[];

					 dataSources.forEach(function(x){
					 	eval('var ds = new nsCatalog.' + x + '(nsCatalog.MapHelper);');
						nsCatalog.DataSources[x] = ds;
					});
				}

				nsCatalog.CatalogPage = new nsCatalog.Controls.CatalogPage(
					nsGmx.leafletMap, nsCatalog.MapHelper, nsCatalog.DataSources,
					userInfo, pluginPath, nsCatalog.LoaderDialog);

				nsCatalog.Permalink = new nsCatalog.Helpers.Permalink(
					nsCatalog.CatalogPage, nsCatalog.MapHelper, nsCatalog.DataSources);
			}
			bLoaded = true;
		};

		var publicInterface = {
			pluginName: 'ScanEx catalog',
			afterViewer: function(params, map) {
				var def = new $.Deferred();
				styles.map(function(path){
					gmxCore.loadCSS(pluginPath + path);
				});
				scripts
				.map(function(path){
					return gmxCore.loadScript(pluginPath + path);
				})
				.reduce(function(prev, next){
					return prev.then(function () {
						return next;
					});
				})
				.done(function(){
					_mapHelper.customParamsManager.addProvider({
						name: 'Catalog',
						loadState: function(state) {
							if(state || state.nodes || state.searchOptions) {
								loadPlugin(params);
								nsCatalog.Permalink.fromPermalink(state);
							}
						},
						saveState: function() {
							return nsCatalog.Permalink.toPermalink();
						}
					});
					loadPlugin(params);
					def.resolve();
				})
				.fail(def.reject.bind(def));
				return def;
			},
			unload: function() {
				if(nsCatalog.CatalogPage) {
					nsCatalog.dispose();
				}
				_mapHelper.customParamsManager.removeProvider('Catalog');
			}
		};
		gmxCore.addModule("Catalog", publicInterface, {'init': function(module, path){ pluginPath = path; }});
	});

})(jQuery)
