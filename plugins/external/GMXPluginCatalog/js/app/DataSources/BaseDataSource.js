var nsCatalog = nsCatalog || {};
nsCatalog.DataSources = nsCatalog.DataSources || {};

(function($){

	function pad(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number;
	}

	Date.prototype.toISOString = function(t, z) {
		return this.getUTCFullYear() +
			'-' + pad(this.getUTCMonth() + 1) +
			'-' + pad(this.getUTCDate()) +
			(t ? 'T' : ' ') + pad(this.getUTCHours()) +
			':' + pad(this.getUTCMinutes()) +
			':' + pad(this.getUTCSeconds()) +
			'.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
			(z ? 'Z' : '');
	};

	var BaseDataAdapter = function(mapHelper){
		this._mapHelper = mapHelper;
		this._dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
		this.anchorTransform = {
			'WV02': function(x1,y1,x2,y2,x3,y3,x4,y4){
				return [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
			},
			'WV01': function(x1,y1,x2,y2,x3,y3,x4,y4){
				var MinX = Math.min(x1, x2, x3, x4);
				var MaxX = Math.max(x1, x2, x3, x4);
				var MinY = Math.min(y1, y2, y3, y4);
				var MaxY = Math.max(y1, y2, y3, y4);

				var sw = Math.max((MaxX - MinX), (MaxY - MinY)) / 2;
				var cx = (MaxX + MinX) / 2;
				var cy = (MaxY + MinY) / 2;
				return [[cx - sw, cy + sw], [cx + sw, cy + sw], [cx + sw, cy - sw], [cx - sw, cy - sw]];
			},
			'PHR': function(x1,y1,x2,y2,x3,y3,x4,y4){
				return [[x2, y2], [x3, y3], [x4, y4], [x1, y1]];
			}
		};
		this._downloadFiles = {
			'QB_GE_WV2_WV3': {
				Filename: 'QB_GE_WV2_WV3',
				Formats: ['shape','tab'],
				IDField: 'catalogid',
				Features: [],
				Columns: [
					{ Name: 'catalogid', Type: 'String'},
					{ Name: 'acqdate', Type: 'Date'},
					{ Name: 'mnoffnadir', Type: 'Integer'},
					{ Name: 'mxoffnadir', Type: 'Integer'},
					{ Name: 'avoffnadir', Type: 'Integer'},
					{ Name: 'mnsunazim', Type: 'Float'},
					{ Name: 'mxsunazim', Type: 'Float'},
					{ Name: 'avsunazim', Type: 'Float'},
					{ Name: 'mnsunelev', Type: 'Float'},
					{ Name: 'mxsunelev', Type: 'Float'},
					{ Name: 'avsunelev', Type: 'Float'},
					{ Name: 'mntargetaz', Type: 'Float'},
					{ Name: 'mxtargetaz', Type: 'Float'},
					{ Name: 'avtargetaz', Type: 'Float'},
					{ Name: 'mnpanres', Type: 'Float'},
					{ Name: 'mxpanres', Type: 'Float'},
					{ Name: 'avpanres', Type: 'Float'},
					{ Name: 'mnmultires', Type: 'Float'},
					{ Name: 'mxmultires', Type: 'Float'},
					{ Name: 'avmultires', Type: 'Float'},
					{ Name: 'stereopair', Type: 'String'},
					{ Name: 'browseurl', Type: 'String'},
					{ Name: 'cloudcover', Type: 'Integer'},
					{ Name: 'platform', Type: 'String'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'},
					{ Name: 'imagebands', Type: 'String'}
				]
			},
			'PLEIADES': {
				Filename: 'PLEIADES',
				Formats: ['shape','tab'],
				IDField: 'datastrip',
				Features: [],
				Columns: [
					{ Name: 'datastrip', Type: 'String'},
					{ Name: 'orb', Type: 'Float'},
					{ Name: 'satel', Type: 'String'},
					{ Name: 'dataq_star', Type: 'Date'},
					{ Name: 'dataq_end', Type: 'Date'},
					{ Name: 'sensor', Type: 'String'},
					{ Name: 'cloud_per', Type: 'Float'},
					{ Name: 'snow_per', Type: 'Float'},
					{ Name: 'incid_ang', Type: 'Float'},
					{ Name: 'sun_azimut', Type: 'Float'},
					{ Name: 'sun_elevat', Type: 'Float'},
					{ Name: 'orient_ang', Type: 'Float'},
					{ Name: 'across_ang', Type: 'Float'},
					{ Name: 'along_ang', Type: 'Float'},
					{ Name: 'combin_ang', Type: 'Float'},
					{ Name: 'roll_ang', Type: 'Float'},
					{ Name: 'pitch_ang', Type: 'Float'},
					{ Name: 'sc_nb', Type: 'Float'},
					{ Name: 'url_ql', Type: 'String'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'}
				]
			},
			'KOMPSAT': {
				Filename: 'KOMPSAT',
				Formats: ['shape','tab'],
				IDField: 'productid',
				Features: [],
				Columns: [
					{ Name: 'productid', Type: 'String'},
					{ Name: 'passid', Type: 'String'},
					{ Name: 'satellite', Type: 'String'},
					{ Name: 'sensor', Type: 'String'},
					{ Name: 'imgmode', Type: 'String'},
					{ Name: 'createdate', Type: 'DateTime'},
					{ Name: 'centertime', Type: 'DateTime'},
					{ Name: 'rolltilt', Type: 'Float'},
					{ Name: 'pitchtilt', Type: 'Float'},
					{ Name: 'yawtilt', Type: 'Float'},
					{ Name: 'sunelevati', Type: 'Float'},
					{ Name: 'centerlat', Type: 'Float'},
					{ Name: 'centerlong', Type: 'Float'},
					{ Name: 'ullat', Type: 'Float'},
					{ Name: 'ullon', Type: 'Float'},
					{ Name: 'urlat', Type: 'Float'},
					{ Name: 'urlon', Type: 'Float'},
					{ Name: 'lllat', Type: 'Float'},
					{ Name: 'lllon', Type: 'Float'},
					{ Name: 'lrlat', Type: 'Float'},
					{ Name: 'lrlon', Type: 'Float'},
					{ Name: 'orbitnumbe', Type: 'Integer'},
					{ Name: 'cloudavg', Type: 'Integer'},
					{ Name: 'thumlocati', Type: 'String'},
					{ Name: 'browlocati', Type: 'String'},
					{ Name: 'gml_geomet', Type: 'String'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'}
				]
			},
			'IKONOS': {
				Filename: 'IKONOS',
				Formats: ['shape','tab'],
				IDField: 'scene_id',
				Features: [],
				Columns: [
					{ Name: 'image_id', Type: 'String'},
					{ Name: 'order_id', Type: 'String'},
					{ Name: 'source_abr', Type: 'String'},
					{ Name: 'source', Type: 'String'},
					{ Name: 'sens_mode', Type: 'String'},
					{ Name: 'strip_id', Type: 'String'},
					{ Name: 'scene_id', Type: 'String'},
					{ Name: 'coll_date', Type: 'Date'},
					{ Name: 'month', Type: 'Integer'},
					{ Name: 'year', Type: 'Integer'},
					{ Name: 'gsd', Type: 'Float'},
					{ Name: 'sqkm', Type: 'Integer'},
					{ Name: 'spatialref', Type: 'String'},
					{ Name: 'ranking', Type: 'Integer'},
					{ Name: 'elev_angle', Type: 'Float'},
					{ Name: 'azim_angle', Type: 'Float'},
					{ Name: 'clouds', Type: 'Integer'},
					{ Name: 'sun_elev', Type: 'Float'},
					{ Name: 'sun_angle', Type: 'Float'},
					{ Name: 'stereo_id', Type: 'String'},
					{ Name: 'data_owner', Type: 'String'},
					{ Name: 'ul_lat', Type: 'Float'},
					{ Name: 'ul_lon', Type: 'Float'},
					{ Name: 'ur_lat', Type: 'Float'},
					{ Name: 'ur_lon', Type: 'Float'},
					{ Name: 'll_lat', Type: 'Float'},
					{ Name: 'll_lon', Type: 'Float'},
					{ Name: 'lr_lat', Type: 'Float'},
					{ Name: 'lr_lon', Type: 'Float'},
					{ Name: 'georectify', Type: 'Integer'},
					{ Name: 'image_url', Type: 'String'},
					{ Name: 'world_url', Type: 'String'},
					{ Name: 'metadata', Type: 'String'},
					{ Name: 'product', Type: 'String'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'}
				]
			},
			'SPOT-6_7': {
				Filename: 'SPOT-6_7',
				Formats: ['shape','tab'],
				IDField: 'datastrip',
				Features: [],
				Columns: [
					{ Name: 'datastrip', Type: 'String'},
					{ Name: 'orb', Type: 'Float'},
					{ Name: 'satel', Type: 'String'},
					{ Name: 'dataq_star', Type: 'Date'},
					{ Name: 'dataq_end', Type: 'Date'},
					{ Name: 'sensor', Type: 'String'},
					{ Name: 'cloud_per', Type: 'Float'},
					{ Name: 'snow_per', Type: 'Float'},
					{ Name: 'incid_ang', Type: 'Float'},
					{ Name: 'sun_azimut', Type: 'Float'},
					{ Name: 'sun_elevat', Type: 'Float'},
					{ Name: 'orient_ang', Type: 'Float'},
					{ Name: 'across_ang', Type: 'Float'},
					{ Name: 'along_ang', Type: 'Float'},
					{ Name: 'combin_ang', Type: 'Float'},
					{ Name: 'roll_ang', Type: 'Float'},
					{ Name: 'pitch_ang', Type: 'Float'},
					{ Name: 'sc_nb', Type: 'Float'},
					{ Name: 'url_ql', Type: 'String'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'}
				]
			},
			'WV1': {
				Filename: 'WV1',
				Formats: ['shape','tab'],
				IDField: 'catalogid',
				Features: [],
				Columns: [
					{ Name: 'catalogid', Type: 'String'},
					{ Name: 'acqdate', Type: 'Date'},
					{ Name: 'mnoffnadir', Type: 'Integer'},
					{ Name: 'mxoffnadir', Type: 'Integer'},
					{ Name: 'avoffnadir', Type: 'Integer'},
					{ Name: 'mnsunazim', Type: 'Float'},
					{ Name: 'mxsunazim', Type: 'Float'},
					{ Name: 'avsunazim', Type: 'Float'},
					{ Name: 'mnsunelev', Type: 'Float'},
					{ Name: 'mxsunelev', Type: 'Float'},
					{ Name: 'avsunelev', Type: 'Float'},
					{ Name: 'mntargetaz', Type: 'Float'},
					{ Name: 'mxtargetaz', Type: 'Float'},
					{ Name: 'avtargetaz', Type: 'Float'},
					{ Name: 'mnpanres', Type: 'Float'},
					{ Name: 'mxpanres', Type: 'Float'},
					{ Name: 'avpanres', Type: 'Float'},
					{ Name: 'mnmultires', Type: 'Float'},
					{ Name: 'mxmultires', Type: 'Float'},
					{ Name: 'avmultires', Type: 'Float'},
					{ Name: 'stereopair', Type: 'String'},
					{ Name: 'browseurl', Type: 'String'},
					{ Name: 'cloudcover', Type: 'Integer'},
					{ Name: 'platform', Type: 'String'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'},
					{ Name: 'imagebands', Type: 'String'}
				]
			},
			'EROS': {
				Filename: 'EROS',
				Formats: ['shape','tab'],
				IDField: 'sceneid',
				Features: [],
				Columns: [
					{ Name: 'id', Type: 'Integer'},
					{ Name: 'path', Type: 'Integer'},
					{ Name: 'row', Type: 'Integer'},
					{ Name: 'nbound', Type: 'Float'},
					{ Name: 'sbound', Type: 'Float'},
					{ Name: 'wbound', Type: 'Float'},
					{ Name: 'ebound', Type: 'Float'},
					{ Name: 'platform', Type: 'String'},
					{ Name: 'sceneid', Type: 'String'},
					{ Name: 'acdate', Type: 'Date'},
					{ Name: 'filename', Type: 'String'},
					{ Name: 'volume', Type: 'String'},
					{ Name: 'cld', Type: 'Integer'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'}
				]
			},
			'SPOT5': {
				Filename: 'SPOT5',
				Formats: ['shape','tab'],
				IDField: 'a21',
				Features: [],
				Columns: [
					{ Name: 'a21', Type: 'String'},
					{ Name: 'sc_num', Type: 'Float'},
					{ Name: 'seg_num', Type: 'Float'},
					{ Name: 'satel', Type: 'Integer'},
					{ Name: 'ang_inc', Type: 'Float'},
					{ Name: 'ang_acq', Type: 'Float'},
					{ Name: 'date_acq', Type: 'Date'},
					{ Name: 'month_acq', Type: 'String'},
					{ Name: 'time_acq', Type: 'DateTime'},
					{ Name: 'cloud_quot', Type: 'String'},
					{ Name: 'cloud_per', Type: 'Float'},
					{ Name: 'snow_quot', Type: 'String'},
					{ Name: 'lat_cen', Type: 'Float'},
					{ Name: 'lon_cen', Type: 'Float'},
					{ Name: 'lat_up_l', Type: 'Float'},
					{ Name: 'lon_up_l', Type: 'Float'},
					{ Name: 'lat_up_r', Type: 'Float'},
					{ Name: 'lon_up_r', Type: 'Float'},
					{ Name: 'lat_lo_l', Type: 'Float'},
					{ Name: 'lon_lo_l', Type: 'Float'},
					{ Name: 'lat_lo_r', Type: 'Float'},
					{ Name: 'lon_lo_r', Type: 'Float'},
					{ Name: 'resol', Type: 'Float'},
					{ Name: 'mode', Type: 'String'},
					{ Name: 'type', Type: 'String'},
					{ Name: 'url_ql', Type: 'String'},
					{ Name: 'x1', Type: 'Float'},
					{ Name: 'y1', Type: 'Float'},
					{ Name: 'x2', Type: 'Float'},
					{ Name: 'y2', Type: 'Float'},
					{ Name: 'x3', Type: 'Float'},
					{ Name: 'y3', Type: 'Float'},
					{ Name: 'x4', Type: 'Float'},
					{ Name: 'y4', Type: 'Float'}
				]
			},
		};
		this.satellites = {
			'WV01': {platforms: ['WV01'], name: 'WorldView-1', resolution: 0.5, color: 0xff0000, checked: true, anchorTransform: this.anchorTransform['WV01'], downloadFile: this._downloadFiles['WV1']},
			'WV02': {platforms: ['WV02'], name: 'WorldView-2', resolution: 0.5, color: 0x800000, checked: true, anchorTransform: this.anchorTransform['WV02'], downloadFile: this._downloadFiles['QB_GE_WV2_WV3']},
			'WV03': {platforms: ['WV03'], name: 'WorldView-3', resolution: 0.5, color: 0x800000, checked: true, anchorTransform: this.anchorTransform['WV01'], downloadFile: this._downloadFiles['QB_GE_WV2_WV3']},
			'GE-1': {platforms: ['GE01'], name: 'GeoEye-1', resolution: 0.5, color: 0x0000ff, checked: true, anchorTransform: this.anchorTransform['WV01'], downloadFile: this._downloadFiles['QB_GE_WV2_WV3']},
			'Pleiades': {platforms: ['PHR1A','PHR1B'], name: 'Pleiades A-B', resolution: 0.5, color: 0x0000ff, checked: true, anchorTransform: this.anchorTransform['PHR'], downloadFile: this._downloadFiles['PLEIADES']},
			'QB02': {platforms: ['QB02'], name: 'QuickBird', resolution: 0.6, color: 0x808080, checked: true, anchorTransform: this.anchorTransform['WV01'], downloadFile: this._downloadFiles['QB_GE_WV2_WV3']},
			'IK-2': {platforms: ['IK-2'], name: 'IKONOS', resolution: 1, color: 0x000080, checked: true, anchorTransform: this.anchorTransform['WV02'], downloadFile: this._downloadFiles['IKONOS']},
			'SP5-J': {platforms: ['SPOT 5'], name: 'SPOT 5 (J)', product: 5, resolution: 2.5, color: 0x000080, checked: true, anchorTransform: this.anchorTransform['WV02'], downloadFile: this._downloadFiles['SPOT5']},
			'SP5-A': {platforms: ['SPOT 5'], name: 'SPOT 5 (A)', product: 4, resolution: 2.5, color: 0x808080, checked: true, anchorTransform: this.anchorTransform['WV02'], downloadFile: this._downloadFiles['SPOT5']},
			'SPOT 6': {platforms: ['SPOT 6','SPOT6','SPOT 7','SPOT7'], name: 'SPOT-6,7', color: 0x006400, checked: true, anchorTransform: this.anchorTransform['WV02'], downloadFile: this._downloadFiles['SPOT-6_7']}
		};
	};

	BaseDataAdapter.prototype = {
		getSatellite: function(platform){
			var ss = Object.keys(this.satellites).filter(function(k){
				var s = this.satellites[k];
				return s.platforms.some(function(p){
					return p == platform;
				});
			}.bind(this));

			if(ss.length) {
				return {key: ss[0], value: this.satellites[ss[0]]};
			}
			else {
				return null;
			}
		},
		dateToString: function(date) {
			var d = this.addPaddingZeros(date.getDate(), 2),
			m = this.addPaddingZeros(date.getMonth() + 1, 2),
			y = date.getFullYear();
			return [y, m, d].join('-');
		},
		parseDate: function(dateString){
			var matches = this._dateRegex.exec(dateString);
			return { year: matches[1], month: matches[2] };
		},
		addPaddingZeros: function(input, length){
			var withPadding = '00000000000000000000000000000000' + input;
			return withPadding.substring(withPadding.length - length);
		},
		_fromResult: function(result){
			var items = result.values
				.map(function(v){
					return result.fields.reduce(function(a,k,i){
						switch (k) {
							case 'acqdate':
								a['acqdate'] = new Date(v[i] * 1000);
								break;
							case 'cloudness':
								a['cloudness'] = Math.round(v[i]);
								break;
							case 'tilt':
								a['tilt'] = Math.round(v[i]);
								break;
							case 'geomixergeojson':
								a['geometry'] = L.gmxUtil.geometryToGeoJSON(v[i], true);
								break;
							default:
								a[k] = v[i];
								break;
						}
						return a;
					}.bind(this),{});
				}.bind(this));
			this._mapHelper.moveToView(items);
			// this._mapHelper.normalizeGeometries(items);
			return items.map(function(item){
				var s = this.getSatellite(item.platform).value;
				item.info = {
					// anchors: s.anchorTransform(
					//	 item.x1,item.y1,
					//	 item.x2,item.y2,
					//	 item.x3,item.y3,
					//	 item.x4,item.y4
					// ),
					anchors: [
						[item.x1,item.y1],
						[item.x2,item.y2],
						[item.x3,item.y3],
						[item.x4,item.y4]
					],
					image: this.getImageUrl(item),
					color: s.color,
					tooltip: this.getTooltip(s, item)
				};
				item.checked = false;
				return item;
			}.bind(this));
		},
		getGeometry: function(){
			return this._mapHelper.getGeometry();
		},
		getInfo: function(satellite, data){
			return ['sceneid','platform','acqdate','cloudness','tilt', 'x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4'].reduce(function(a,x){
				if(data[x]){
					switch (x) {
						case 'acqdate':
							a[x] = data[x].toLocaleString();
							break;
						case 'platform':
							a[x] = satellite.name;
							break;
						default:
							a[x] = data[x];
							break;
					}
				}
				return a;
			},{});
		},
		getTooltip: function(satellite, data){
			var info = this.getInfo(satellite, data);
			return Object.keys(info).reduce(function(a,k){
				a.push('<b>' + k + '</b>' + ': ' + info[k]);
				return a;
			},[]).join('<br/>');
		},
		getImageUrl: function(data){
			throw 'Not implemented';
		}
	};

	BaseDataAdapter.prototype.constructor = BaseDataAdapter;

	nsCatalog.BaseDataAdapter = BaseDataAdapter;

	var DataSource = function(mapHelper){
		this.id = '';
		this.title = '';
		this.checked = true;
		this._dataAdapter = new nsCatalog.BaseDataAdapter(mapHelper);
		this.satellites = this._dataAdapter.satellites;
		this._cloudCoverMap = [10, 20, 35, 50, 100];

		this.fields = this._getFields();
		this.filters = this._getFilters();
		this.sortBy = {field: 'acqdate', asc: false};
		this._downloadFiles = this._dataAdapter._downloadFiles;
	};

	DataSource.prototype = {
		_getFilters: function(){
			return {
				'platform': {
					filter: function(value){
						var s = this._dataAdapter.getSatellite(value);
						return s ? s.value.name : value;
					}.bind(this),
					values: {}
				},
				'acqdate': {
					filter: function(value){
						return value.getFullYear().toString();
					}.bind(this),
					values: {}
				}
			};
		},
		_getFields: function(){
			return {
				'checked':{
					name: 'checked', title: 'Видимость', type: 'boolean', selector: true,
					icon: 'icon-visibility', iconAsc: 'icon-visibility-asc', iconDesc: 'icon-visibility-desc'
				},
				'platform': {
					name: 'platform', title: 'Спутник', type: 'string',
					icon: 'icon-satellite', iconAsc: 'icon-satellite-asc', iconDesc: 'icon-satellite-desc',
					formatter: function(value){
						var s = this._dataAdapter.getSatellite(value);
						return s ? s.value.name : value;
					}.bind(this)
				},
				'tilt': {
					name: 'tilt', title: 'Угол съемки', type: 'integer',
					icon: 'icon-tilt', iconAsc: 'icon-tilt-asc', iconDesc: 'icon-tilt-desc',
					formatter: function(value){
						return '	 ' + value + '\u00B0';
					},
					style: 'tgrid-int-cell'
				},
				'cloudness': {
					name: 'cloudness', title: 'Облачность', type: 'integer',
					icon: 'icon-cloud', iconAsc: 'icon-cloud-asc', iconDesc: 'icon-cloud-desc',
					style: 'tgrid-int-cell',
					formatter: function(value){
						return value + '%';
					}
				},
				'acqdate': {
					name: 'acqdate', title: 'Дата', type: 'date',
					icon: 'icon-date', iconAsc: 'icon-date-asc', iconDesc: 'icon-date-desc'
				},
				'selected': {
					name: 'selected', title: '', type: 'boolean', button: function (value) {
						return value ? 'icon-minus-squared' : 'icon-plus-squared';
					}
				}
			};
		},
		getModel: function(data){
			return this._dataAdapter._fromResult(data);
		},
		getRequestOptions: function() {
			throw 'Not implemented';
		},
		getSatellite: function(platform){
			return this._dataAdapter.getSatellite(platform);
		},
		validateSearchOptions: function (options, errors){
			if (this.useDate && !options.dateStart) {
				errors.push('Начальная дата поиска задана неверно.');
			}
			if (this.useDate && !options.dateEnd) {
				errors.push('Конечная дата поиска задана неверно.');
			}
			if (!options.queryType || (this.useDate && options.dateStart > options.dateEnd)) {
				errors.push('Параметры поиска заданы неверно.');
			}
			return errors.length == 0;
		},
		search: function(options){
			var def = new $.Deferred();
			sendCrossDomainPostRequest(
				window.serverBase + 'VectorLayer/Search.ashx',
				this.getRequestOptions(options),
				function(response){
					if(response.Status == 'ok'){
						if (response.Result.Count == 0){
							def.resolve({status:'nothing'});
						}
						else if (response.Result.Count <= nsCatalog.SEARCH_LIMIT) {
							def.resolve({status: 'ok', data: response.Result});
						}
						else {
							def.resolve({status: 'exceeds'});
						}
					}
					else {
						def.resolve({status: 'error', error: response.ErrorInfo});
					}
				}.bind(this));
			return def;
		},

		getOptions: function(){
			return Object.keys(this.satellites).filter(function(x){
				return this.satellites[x].checked;
			}.bind(this));
		},

		getMetadata: function(ids){
			var def = new $.Deferred();
			sendCrossDomainPostRequest('http://search.kosmosnimki.ru/GetMetadata.ashx',{WrapStyle: 'message', ids: ids}, function(response){
				if(response.Status == 'ok'){
					def.resolve(response.Result);
				}
				else {
					def.reject();
				}
			});
			return def;
		},

		getDownloadFiles: function(items, sel){
			var def = new $.Deferred();
			var results = sel ? items.filter(function(item) { return item.checked; }) : items;
			var ids = results.reduce(function(a,x){
				var s = this._dataAdapter.getSatellite(x['platform']);
				if(s){
					if(!a[s.key]){
						a[s.key] = [];
					}
					a[s.key].push({id: x['sceneid'], geometry: x['geometry']});
				}
				return a;
			}.bind(this), {});

			var ks = Object.keys(ids);
			var dsCount = ks.length;
			var files = [];
			var selected = [];
			var get_features = function(items){
				return items.map(function(item){
					var ps = Object.keys(item).reduce(function(a,k){
						if(k != 'geojson'){
							a[k] = item[k];
						}
						return a;
					},{});
					return {
						type: 'Feature',
						geometry: item['geojson'],
						properties: ps
					};
				});
			};
			var collect_features = function(items){
				return items.reduce(function(a,x){
					if(a[x.Filename]){
						a[x.Filename].Features = a[x.Filename].Features.concat(x.Features);
					}
					else{
						a[x.Filename] = $.extend(true, {}, x);
					}
					return a;
				},{});
			};
			ks.forEach(function(k){
				var rq = ids[k].map(function(item){ return item['id']; });
				this.getMetadata(rq).done(function(r){
					var rk = Object.keys(r)[0];
					var df = $.extend(true,{},this.satellites[k].downloadFile);
					df.Features = get_features (r[rk]);
					files.push(df);
					if(--dsCount == 0){
						def.resolve(collect_features(files));
					}
				}.bind(this));
			}.bind(this));

			return def;
		}
	};

	DataSource.prototype.constructor = DataSource;

	nsCatalog.BaseDataSource = DataSource;
}(jQuery));
