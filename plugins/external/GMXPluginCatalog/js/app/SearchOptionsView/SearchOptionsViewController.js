var nsCatalog = nsCatalog || {};
nsCatalog.Controls = nsCatalog.Controls || {};

(function($){

  var template = Handlebars.compile(
    '<div class="search-options">\
      <div class="search-options-content">\
        <div class="search-options-block">\
          <h3>{{period}}</h3>\
          <div class="period-box">\
            <table cellpadding="0" cellspacing="0">\
              <tr>\
                <td class="la">{{from}}</td>\
                <td class="date-box invalid-value"><input type="text" id="searchStartDate" class="date" maxlength="10" /></td>\
                <td class="ca">{{to}}</td>\
                <td class="date-box"><input type="text" id="searchEndDate" class="date" maxlength="10" /></td>\
              </tr>\
              <tr>\
                <td class="la">&nbsp;</td>\
                <td class="annually" colspan="3">\
                  <input id="checkboxYearly" type="checkbox" />\
                  <label for="checkboxYearly">{{annually}}</label>\
                </td>\
              </tr>\
            </table>\
          </div>\
        </div>\
        <div class="search-options-block">\
          <div class="slider-container">\
            <div id="sliderCloudCover"></div>\
          </div>\
        </div>\
        <div class="search-options-block">\
          <div class="slider-container">\
            <div id="sliderTilt"></div>\
          </div>\
        </div>\
        <div class="search-options-block-short">\
          <h3>{{sources}}</h3>\
          <div id="satellitesList"></div>\
          <div class="clear"></div>\
        </div>\
        <input type="button" id="btnSearch" value="Поиск"/>\
        <div class="clear"></div>\
    </div>\
  </div>');
  var SearchOptionsView = function(view, path, userInfo, dataSources, widgetsContainer) {
    this._view = $(view);
    this._path = path;
    this._userInfo = userInfo;
    this._dataSources = dataSources;
    this._currentSearchCriteria = null;

    this._currentRegional = $.datepicker.regional['ru'];
    this._dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    this._startDate = null;
    this._endDate = null;
    this._yearly = null;
    this._cloudCover = null;

    this._cloudCoverNames = [
        { name: 'Безоблачно' + ', 0%', img: path + 'img/clouds/cld1.png' },
        { name: 'Малооблачно' + ', 25%', img: path + 'img/clouds/cld2.png' },
        { name: 'Средняя облачность' + ', 50%', img: path + 'img/clouds/cld3.png' },
        { name: 'Сильная облачность' + ', 75%', img: path + 'img/clouds/cld4.png' },
        { name: 'Сплошная облачность' + ', 100%', img: path + 'img/clouds/cld5.png' }
    ];

    this._angleValues = [0, 10, 20, 30, 40, 50, 60];

    this._btnSearch = null;
    this._onSearchClick = null;

    this._toggler = null;
    this._contentContainer = null;
    this._widgetsContainer = widgetsContainer;

    this._popovers = {};

    this._initialize();
  };

  SearchOptionsView.prototype = {
    _initialize: function() {

      this._view.append(template({
        period: 'Период',
        from: 'с ',
        to: 'по ',
        annually: 'ежегодно',
        clouds: 'Допустимая облачность',
        sources: 'Каталоги'
      }));

      this._toggler = this._view.find('#searchOptionsToggler').click(this._toggleCollapsed.bind(this));
      this._contentContainer = this._view.find('.search-options-content');

      var today = new Date();

      this._startDate = this._view.find('#searchStartDate');
      this._startDate.val('01.01.' + today.getFullYear());
      this._initializeDatePicker(this._startDate);

      this._endDate = this._view.find('#searchEndDate');
      this._endDate.val(this._addLeadingZero(today.getDate()) + '.' + this._addLeadingZero(today.getMonth()+1) + '.' + today.getFullYear());
      this._initializeDatePicker(this._endDate);

      this._yearly = this._view.find('#checkboxYearly');

      this._cloudCover = this._view.find('#sliderCloudCover');
      this._createCloudSlider(this._cloudCover);

      this._tilt = this._view.find('#sliderTilt');
      this._createTiltSlider(this._tilt);

      this._satellitesList = this._view.find('#satellitesList');
      this._createSatellitesList(this._satellitesList);

      // // Update resolution and satellites state
      // this._handleResolutionsSliderMove(this._resolutions.slider('option', 'values'), true);

      this._btnSearch = this._view.find('#btnSearch').click(this._searchClick.bind(this));

      // $(window).resize(this._adjustHeight.bind(this));
      // this._adjustHeight();

    },

    // _adjustHeight: function(){
    //   var h = $(this._widgetsContainer).height() - 20;
    //   this._contentContainer.height(h);
    // },

    _addLeadingZero: function(value) {
      var withPadding = '0' + value;
      return withPadding.substring(withPadding.length-2);
    },

    _toggleCollapsed: function() {
      if (this._toggler.hasClass('collapsed')) {
        this._toggler.toggleClass('collapsed', false);
        this._toggler.toggleClass('expanded', true);
        this._contentContainer.show();
      } else {
        this._toggler.toggleClass('collapsed', true);
        this._toggler.toggleClass('expanded', false);
        this._contentContainer.hide();
      }
    },

    _searchClick: function() {
      $(this).trigger('search');
    },

    _initializeDatePicker: function(target) {
      target = $(target);
      target.datepicker({
        changeMonth: true,
        changeYear: true,
				maxDate: "+1y",
				yearRange: 'c-20:c+20',
				showOn: 'button',      
        buttonImage: this._path + 'img/cal.png',
        buttonImageOnly: true,
        onSelect: function() { target.parent().removeClass('invalid-value'); },
        beforeShow: function(input, datepicker) { setTimeout(function() { $(datepicker.dpDiv).css('zIndex', 100); }, 10); }
      })
      .mask('99.99.9999', { placeholder: '_' })
      .focus(function() { target.parent().removeClass('invalid-value'); })
      .blur(function() { if (!this._tryParseDate(target.val())) target.parent().addClass('invalid-value'); }.bind(this));
    },

    updateDataSources: function (){
      var ds = Object.keys(this._dataSources).reduce(function(a, k) {
        var d = this._dataSources[k];
        a[d.id] = d;
        return a;
      }.bind(this), {});
      this._view.find('.satellites-column input[type="checkbox"]').each(function(i, x){
        var $x = $(x);
        $x.prop('checked', ds[$x.val()].checked);
      });
    },

    _createSatellitesList: function(target) {
      var createColumn = function() {
        return $.create('div', { 'class':'satellites-column' }).appendTo(target);
      };
      var currentColumn = createColumn();
      for (var id in this._dataSources) {
        var dataSource = this._dataSources[id];
        this._createSatelliteItem(dataSource, currentColumn);
      }
    },

    _hideOtherPopovers: function(index){
      for (var id in this._popovers){
        var p = this._popovers[id];
        if(id != index){
          p.popover('hide');
        }
      }
    },

    _createSatelliteItem: function(dataSource, column) {

  		var div = $.create('div');
  		column.append (div);
  		var that = this;
  		var box = $.create('input', {
  			'type':'checkbox',
  			'value': dataSource.id,
  			'id': 'chkSatellite' + '_' + dataSource.id
  		});

  		div.append(box);

  		box.prop('checked', dataSource.checked);
  		box.on('click', function(e) { dataSource.checked = $(e.target).prop('checked'); });

  		var label = $.create('label', { 'for':'chkSatellite' + '_' + dataSource.id }, dataSource.title);
  		box[0].label = label;
  		div.append(label);
  		var btn = $.create('img', {src: gmxCore.getModulePath('Catalog') + 'img/preferences.png'});
  		div.append(btn);
  		btn.css({marginLeft: 5, cursor: 'pointer', width: 12, height: 12});

      if(dataSource.satellites) {
        var opts = [];
        for (var id in dataSource.satellites){
          var opt = dataSource.satellites[id];
          opts.push('<li style="margin:2px"><input id="platform_' + id + '" type="checkbox" value="' + id + '"><label for="platform_' + id + '" style="margin-left:2px">' + opt.name + '</label></li>');
        }
        var tsid = 'search-options-satellites_' + dataSource.id;
        var html = '<div><input id="' + tsid + '" type="checkbox" /><label for="' + tsid + '">Все спутники</label><ul>' + opts.join('') + '</ul></div>';
        btn.popover({
          content: html,
          html: true
        });

	      btn.on('shown.bs.popover',function(e){

          that._hideOtherPopovers(dataSource.id);
          var parent = $(e.target).parent();
          var container = parent.find('.popover-content');
          var $items = container.find('ul input[type="checkbox"]');
          $items.each(function(){
            var target = $(this);
            target.prop('checked', dataSource.satellites[target.val()].checked);
          })
          .off()
          .click(function(){
            var target = $(this);
            dataSource.satellites[target.val()].checked = target.prop('checked');
          });

          container.find('#' + tsid)
          .tristate({items: $items})
          .on('selectall', function(e, checked){
            $items.each(function(){ dataSource.satellites[$(this).val()].checked = checked; })
          }.bind(this));
        });

      }
      else if (dataSource.range && dataSource.initial){
        var values = [];
        var year = new Date().getFullYear();
        var cols = Math.floor(Math.sqrt(year - dataSource.initial + 1));
        values.push('<div>');
        for (var i = dataSource.initial, col = 1; i <= year; i++){
          values.push('<span class="scanex-range-value">' + i + '</span>');
          if(col++ % cols == 0){
            values.push('</div><div>');
          }
        }
        values.push('</div>');
        var html = '<div>' + values.join('') + '</div>';
        var update = function(root){
          if(dataSource.range && dataSource.range.length){
            var min = Math.min.apply(null, dataSource.range),
            max = Math.max.apply(null, dataSource.range);
            root.find('.scanex-range-value').each(function(){
              var t = $(this);
              var v = parseInt(t.text(), 10);
              if(min <= v && v <= max){
                t.addClass('scanex-range-value-selected');
              }
              else{
                t.removeClass('scanex-range-value-selected');
              }
            });
          }
          else{
            root.find('.scanex-range-value').each(function(){
              var t = $(this);
              t.removeClass('scanex-range-value-selected');
            });
          }
        };
        btn.popover({
          content: html,
          html: true
        });
	      btn.on('shown.bs.popover',function(e){
          that._hideOtherPopovers(dataSource.id);
          var root = $(e.target).parent().find('.popover-content');
          update(root);
          root.find('.scanex-range-value')
          .off()
          .click(function(){
            var t = $(this);
            var v = parseInt(t.text(), 10);
            switch(dataSource.range.length){
              case 0:
                dataSource.range = [v];
                update(root);
                break;
              case 1:
                dataSource.range = dataSource.range.concat(v);
                update(root);
                break;
              case 2:
                dataSource.range = [];
                update(root);
                break;
              default:
                break;
            }
          });
        });
      }
      this._popovers[dataSource.id] = btn;
    },

    _createCloudSlider: function(target) {

      $(target).customSlider({
				title: 'Допустимая облачность',
				min: 0,
				max: 100,
				values: [0, 100],
				names: this._cloudCoverNames,
				unit: '&#37;',
        start: function(e){
          this._widgetsContainer.removeEventListener('mousemove', L.DomEvent.stopPropagation);
        }.bind(this),
        stop: function(e){
          this._widgetsContainer.addEventListener('mousemove', L.DomEvent.stopPropagation);
        }.bind(this)
			});

    },

    _createTiltSlider: function(target) {

      $(target).customSlider({
				title: 'Угол съемки',
        min: this._angleValues[0],
				max: this._angleValues[this._angleValues.length - 1],
				values: [this._angleValues[0], this._angleValues[this._angleValues.length - 1]],
				names: this._angleValues,
				unit: '&deg;',
        start: function(e){
          this._widgetsContainer.removeEventListener('mousemove', L.DomEvent.stopPropagation);
        }.bind(this),
        stop: function(e){
          this._widgetsContainer.addEventListener('mousemove', L.DomEvent.stopPropagation);
        }.bind(this)
			});

    },

    getSearchOptions: function() {
      return {
        queryType: 'box',
        dateStart: this._tryParseDate(this._startDate.val()),
        dateEnd: this._tryParseDate(this._endDate.val()),
        isYearly: this._yearly[0].checked,
        cloudCover: this._cloudCover.customSlider('option', 'values'),
        tilt: this._tilt.customSlider('option', 'values')
      };
    },

    setSearchOptions: function(data){
      var searchCriteria = data.searchCriteria;
      if(searchCriteria.dateStart) {
        $(this._startDate).datepicker('setDate', new Date(searchCriteria.dateStart));
      }
      if(searchCriteria.dateEnd) {
        $(this._endDate).datepicker('setDate', new Date(searchCriteria.dateEnd));
      }
      this._yearly.prop('checked', searchCriteria.isYearly);
      $(this._cloudCover).customSlider('option', 'values', searchCriteria.cloudCover);
      $(this._tilt).customSlider('option', 'values', searchCriteria.tilt);

      var source = null;
      var sources = $('.satellites-column input[type="checkbox"]');

      var ds = data.dataSources;
      Object.keys(this._dataSources).forEach(function(s){
        var d = this._dataSources[s];
        d.checked = ds.hasOwnProperty(s);
        if(d.checked){
          Object.keys(d.satellites).forEach(function(k){
            d.satellites[k].checked = ds[s].indexOf(k) >= 0;
          });
        }
      }.bind(this));

      this.updateDataSources();
    },

    _tryParseDate: function(value) {
      if (!this._dateRegex.test(value)) return null;
      try {
        return $.datepicker.parseDate(this._currentRegional.dateFormat, value);
      } catch (exception) {
        return null;
      }
    }
  };

  nsCatalog.Controls.SearchOptionsView = SearchOptionsView;

  }(jQuery));
