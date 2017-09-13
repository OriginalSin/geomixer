var nsCatalog = nsCatalog || {};

(function($){

  var DataAdapter = function(mapHelper){
    nsCatalog.BaseDataAdapter.call(this, mapHelper);
    this.satellites['EROS-A'] = {
      platforms: ['EROS-A1'], name: 'EROS-A', resolution: 0.7,
      color: 0x008080, checked: true, anchorTransform: this.anchorTransform['WV02'],
      downloadFile: $.extend(true,{},this._downloadFiles['EROS'])
    };
    this.satellites['EROS-B'] = {
      platforms: ['EROS-B'], name: 'EROS-B', resolution: 0.7,
      color: 0x008080, checked: true, anchorTransform: this.anchorTransform['WV02'],
      downloadFile: $.extend(true,{},this._downloadFiles['EROS'])
    };
    this.satellites['GE-1'] = {
      platforms: ['GE01'], name: 'GeoEye-1', resolution: 0.5,
      color: 0x0000ff, checked: true, anchorTransform: this.anchorTransform['WV02'],
      downloadFile: $.extend(true,{},this._downloadFiles['QB_GE_WV2_WV3'])
    };
    this.satellites['WV03'] = {
      platforms: ['WV03'], name: 'WorldView-3', resolution: 0.5,
      color: 0x800000, checked: true, anchorTransform: this.anchorTransform['WV02'],
      downloadFile: $.extend(true,{},this._downloadFiles['QB_GE_WV2_WV3'])
    };
    this.satellites['SPOT 6'] = {
      platforms: ['SPOT 6','SPOT6','SPOT 7','SPOT7'], name: 'SPOT-6,7', color: 0x006400, checked: true, anchorTransform: this.anchorTransform['WV02'],
      downloadFile: $.extend(true,{},this._downloadFiles['EROS'])
    };
  };

  DataAdapter.prototype = Object.create(nsCatalog.BaseDataAdapter.prototype);
  DataAdapter.prototype.constructor = DataAdapter;

  DataAdapter.prototype.getImageUrl = function(data) {
    return 'http://wikimixer.kosmosnimki.ru/QuickLookImage.ashx?id=' + data.sceneid;
  };

  nsCatalog.InternalDataAdapter = DataAdapter;

  var DataSource = function(mapHelper){
    nsCatalog.BaseDataSource.call(this, mapHelper);
    this.id = 'internal';
    this.title = 'СКАНЭКС';
    this._dataAdapter = new DataAdapter(mapHelper);
    this.satellites = this._dataAdapter.satellites;
    this.fields = this._getFields();
  };

  DataSource.prototype = Object.create(nsCatalog.BaseDataSource.prototype);
  DataSource.prototype.constructor = DataSource;

  DataSource.prototype.getCriteria = function(options) {
    var cr = [];
    cr.push('(cloudness IS NULL OR cloudness < 0 OR (cloudness >= '+ options.cloudCover[0] + ' AND cloudness <= ' + options.cloudCover[1] + '))');

    cr.push('(tilt IS NULL OR tilt < 0 OR (tilt >= ' + options.tilt[0] + ' AND tilt <= ' + options.tilt[1] + '))');

    if (options.isYearly) {
      if (options.dateStart && options.dateEnd) {
        var dcr = [];
        var startMonth = options.dateStart.getMonth();
        var startDay = options.dateStart.getDate();
        var endMonth = options.dateEnd.getMonth();
        var endDay = options.dateEnd.getDate();
        for (var year = options.dateStart.getFullYear(); year <= options.dateEnd.getFullYear(); year++) {
          var start = new Date(year, startMonth, startDay);
          var end = new Date(year, endMonth, endDay);
          dcr.push("(acqdate >= '" + this._dataAdapter.dateToString(start) + "' AND acqdate <= '" + this._dataAdapter.dateToString(end) + "')");
        }
        cr.push('(' + dcr.join(' OR ') + ')');
      }
    }
    else {
      if (options.dateStart) {
        cr.push("acqdate >= '" +  this._dataAdapter.dateToString(options.dateStart) + "'");
      }
      if (options.dateEnd) {
        cr.push("acqdate <= '" + this._dataAdapter.dateToString(options.dateEnd) + "'");
      }
    }

    var sat = [];
    for (var sat_id in this.satellites) {
      var s = this.satellites[sat_id];
      if(s.checked){
        switch (sat_id) {
          case 'SP5-A':
            sat.push("platform = 'SPOT 5' AND sensor = 'A' AND spot5_b_exists = TRUE");
            break;
          case 'SP5-J':
            sat.push("platform = 'SPOT 5' AND sensor = 'J' AND spot5_a_exists = TRUE AND spot5_b_exists = TRUE");
            break;
          default:
            sat.push("platform IN ('" + s.platforms.join("','") + "')")
            break;
        }
      }
    }

    cr.push("(" + sat.join(' OR ') + ")");

    var gj = this._dataAdapter.getGeometry();
    if (gj) {
      cr.push("Intersects([geomixergeojson], buffer(GeometryFromGeoJson('" + JSON.stringify(gj) + "', 4326), 0.001))");
    }

    cr.push('islocal = TRUE');

    return cr.join(' AND ');
  };

  DataSource.prototype.getRequestOptions = function(options) {
    return {
      WrapStyle: 'message',
      layer: 'AFB4D363768E4C5FAC71C9B0C6F7B2F4',
      orderby: 'acqdate',
      orderdirection: 'desc',
      geometry: true,
      pagesize: nsCatalog.SEARCH_LIMIT + 1,
      count: 'add',
      query: this.getCriteria(options)
    };
  };

  nsCatalog.InternalDataSource = DataSource;
}(jQuery));
