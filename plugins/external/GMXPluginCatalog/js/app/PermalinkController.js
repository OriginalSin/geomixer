var nsCatalog = nsCatalog || {};
nsCatalog.Helpers = nsCatalog.Helpers || {};

(function($){

  var Permalink = function(pageController, mapHelper, dataSources) {
    this._pageController = pageController;
    this._searchOptionsView = this._pageController.searchOptionsView;
    this._selectedImagesView = this._pageController.selectedImagesView;
    this._resultList = this._pageController._resultList;
    this._mapHelper = mapHelper;
    this._dataSources = dataSources;
  };

  Permalink.prototype.toPermalink = function() {
    var selectedNodes = this._selectedImagesView.getSelected();
    var searchCriteria = this._searchOptionsView.getSearchOptions();
    var dataSources = Object.keys(this._dataSources)
      .map(function(k) { return {k: k, v: nsCatalog.DataSources[k] }; })
      .filter(function(x) { return x.v.checked; })
      .reduce(function(a, x) {
        a[x.k] = x.v.getOptions();
        return a;
      }, {});

    var results = this._resultList.getResults();
    var items = Object.keys(results).reduce(function(a,k){
      var ds = this._dataSources[k];
      a[k] = this._resultList.toSerializable(results[k],ds.fields);
      return a;
    }.bind(this),{});

    return {
      selectedNodes: Object.keys(selectedNodes),
      searchCriteria: {
        queryType: searchCriteria.queryType,
        dateStart: searchCriteria.dateStart ? searchCriteria.dateStart.toISOString() : null,
        dateEnd: searchCriteria.dateEnd.toISOString(),
        isYearly: searchCriteria.isYearly,
        cloudCover: searchCriteria.cloudCover
      },
      dataSources: dataSources,
      geometries: this._mapHelper.getGeometries(),
      items: items
    };
  };

  Permalink.prototype.fromPermalink = function(persistedData) {
    this._searchOptionsView.setSearchOptions(persistedData);
    var results = persistedData.items;
    var items = Object.keys(results).reduce(function(a,k){
      var ds = this._dataSources[k];
      a[k] = this._resultList.fromSerializable(results[k],ds.fields);
      return a;
    }.bind(this),{});
    // this._resultList.show();
    this._resultList.setResults(items);

  };

  Permalink.prototype.attach = function() {
    // see CatalogPlugin
  };

  Permalink.prototype.detach = function() {
    // sorry, detaching is not supported by the viewer :(
  };

  nsCatalog.Helpers.Permalink = Permalink;

}(jQuery));
