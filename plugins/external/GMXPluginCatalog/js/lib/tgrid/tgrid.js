(function($){

	// var handlebars = Handlebars.noConflict();

	// Handlebars.registerHelper('buttonClass', function(context){
	// 	return context.selected ? 'icon-minus-squared' : 'icon-plus-squared';
	// });

	var template = '<div class="tgrid-header"></div><div class="tgrid-items"></div>';

	var itemsTemplate = Handlebars.compile(
	'<table>\
		{{#each this}}\
			<tr>\
				{{#each this}}\
					<td{{#if style}} class="{{style}}"{{/if}}>\
						{{#if selector}}\
							<input type="checkbox" {{#if value}} checked{{/if}}/>\
						{{else}}\
							{{#if button}}\
								<i class="{{button}}"/>\
							{{else}}\
								{{#if value}}\
									{{value}}\
								{{else}}\
									&nbsp;\
								{{/if}}\
							{{/if}}\
						{{/if}}\
					</td>\
				{{/each}}\
			</tr>\
		{{/each}}\
	</table>');

	var headerTemplate = Handlebars.compile(
	'<table>\
		<tr>\
			{{#each this}}\
				<td title="{{title}}">\
					<div{{#if icon}} class="tgrid-icon {{icon}}{{#if iconAsc}} tgrid-sort{{/if}}"{{/if}}></div>\
					{{#if filtered}}\
						<div class="tgrid-icon tgrid-filter tgrid-filter-empty"></div>\
					{{/if}}\
				</td>\
			{{/each}}\
		</tr>\
	</table>');

	var filterTemplate = Handlebars.compile(
	'<div>\
		<input id="col_{{uuid}}_{{col}}" type="checkbox" value="all">\
		<label for="col_{{uuid}}_{{col}}">{{all}}</label>\
		<label for="col_{{uuid}}_{{col}}"><span class="tgrid-count total-count">{{count}}</span></label>\
		<ul>\
			{{#each items}}\
			<li>\
				<input id="col_{{uuid}}_{{col}}_{{@index}}" type="checkbox" value="{{key}}"/>\
				<label for="col_{{uuid}}_{{col}}_{{@index}}">{{name}}</label>\
				<label for="col_{{uuid}}_{{col}}_{{@index}}"><span class="tgrid-count item-count">{{count}}</span></label>\
			</li>\
			{{/each}}\
		</ul>\
	</div>');

	$.widget('scanex.tgrid',{
		options: {
			hasHeader: true,
			sortBy: {},
			filters: {},
			fields: {},
			model: [],
			formatters: {
				'date': function(value){
					return new Date(value).toLocaleDateString();
				}
			}
		},
		_create: function(){
			this._popovers = [];
			this._stats = {};
			this._filtered = [];
			this._filteredCount = 0;
			this.element.addClass('tgrid-container');
			this.element.addClass('noselect');
		},
		_destroy: function(){
			this.element.removeClass('tgrid-container');
			this.element.removeClass('noselect');
			this.element.empty();
		},
		_setOption: function(key, value){
			this._super(key, value);
			switch (key) {
				case 'model':
					if(this.options.model) {
						this._stats = this._getStats(this.options.model);
						this.options.filters = this._resetFilters(this.options.filters, this._stats);
						this._filteredCount = this.options.model.length;
						this._render(this.options.model);
						this._updateSortIcons(this.options.sortBy && this.options.sortBy.field, this.options.sortBy && this.options.sortBy.asc);
					}
					break;
				default:
					break;
			}
		},
		_renderHeader: function(){
			var fields = Object.keys(this.options.fields)
				.map(function(k) {
					var f = $.extend(true,{},this.options.fields[k]);
					return f;
				}.bind(this));
			this.element.find('.tgrid-header').html(headerTemplate(fields));
			this._attachHeaderEvents();
		},
		refresh: function(){
			this._renderItems(this._filtered);
		},
		_renderItems: function(model){
			var fields = this.options.fields;
			var items = this._format(model).map(function(item){
				return Object.keys(item).map(function(k){
					var f = fields[k];
					var v = item[k];
					return {
						value: v,
						selector: f.selector,
						button: typeof f.button == 'function' ? f.button(v) : null,
						style: f.hidden ? 'tgrid-hidden' : f.style
					};
				});
			});
			var $container = this.element.find('.tgrid-items');
			$container.html(itemsTemplate(items));
			$container.find('tr').each(function(i, x){
				var $row = $(x);
				$row.data(model[i]);
			});
			this._attachItemsEvents();
			if(this._currentScroll){
				this.element.find('.tgrid-items').scrollTop(this._currentScroll);
			}
		},
		_initPopovers: function(){
			for (var i in this._popovers){
				this._popovers[i].popover('destroy');
				delete this._popovers[i];
			}
			this._popovers = {};
		},
		_render: function(model){
			this._initPopovers();
			this.element.html(template);
			if(this.options.hasHeader){
				this._renderHeader();
			}
			this._filtered = this._sort(this._filter(this.options.model).items, this.options.sortBy && this.options.sortBy.field, this.options.sortBy && this.options.sortBy.asc);
			this._renderItems(this._filtered);
			if(this.options.hasHeader){
				this.adjustHeader();
			}
		},
		_sort: function(model, field, asc){
			if (field) {
				return model
				.map(function(e,i){
					return {i: i, v: e};
				})
				.sort(function(a, b){

					var left = a.v[field], right = b.v[field];

					if(left == null && right != null){
						return asc ? -1 : 1;
					}

					if(left != null && right == null){
						return asc ? 1 : -1;
					}

					if(typeof left == 'string') {
						left = left.toLowerCase();
					}

					if(typeof right == 'string') {
						right = right.toLowerCase();
					}

					if(left < right){
						return asc ? -1 : 1;
					}
					else if(left > right){
						return asc ? 1 : -1;
					}
					else if(left == right){
						var i = a.index, k = b.index;
						if(i < k){
							return asc ? -1 : 1;
						}
						else if(i > k){
							return asc ? 1 : -1;
						}
						else {
							return 0;
						}
					}
				})
				.map(function(e){
					return e.v;
				});
			}
			else {
				return model;
			}
		},
		_filter: function(model){
			var filters = this.options.filters;
			var removed = [];
			var items = model.filter(function(item){
				var test = Object.keys(filters)
					.every(function(k){
						var f = filters[k];
						return f.values[typeof f.filter == 'function' ? f.filter(item[k]) : item[k]];
					}.bind(this));
				if(!test) {
					removed.push(item);
				}
				return test;
			}.bind(this));
			this._filteredCount = items.length;
			return {items: items, removed: removed};
		},
		filter: function(){
			this._filtered = this._sort(this._filter(this.options.model).items, this.options.sortBy.field, this.options.sortBy.asc);
			this._renderItems(this._filtered);
			if(this.options.hasHeader){
				this.adjustHeader();
			}
			return {filtered: this._filtered, items: this.options.model};
		},
		getFilteredCount: function(){
			return this._filteredCount;
		},
		getFiltered: function(){
			return this._filtered;
		},
		_format: function(model){
			var formatters = this.options.formatters;
			var fields = this.options.fields;
			return model.map(function(item){
				return Object.keys(fields).reduce(function(a, k){
					var f = fields[k];
					var v = item[k];
					if(typeof f.formatter == 'function'){
						a[k] = f.formatter(v);
					}
					else if (typeof formatters[f.type] == 'function'){
						a[k] = formatters[f.type](v);
					}
					else {
						a[k] = v;
					}
					return a;
				}, {});
			});
		},
		adjustHeader: function(){
			var ws = this.element.find('.tgrid-items tr:first > td').map(function(i, x) {
				return $(x).width();
			}).toArray();
			this.element.find('.tgrid-header td').each(function (i, x) {
				$(x).width(ws[i]);
			});
		},
		_updateSortIcons: function(key, asc){
			var fks = Object.keys(this.options.fields);
			var index = fks.indexOf(key);
			var fields = fks
				.map(function(k){
					return this.options.fields[k];
				}.bind(this));
			this.element.find('.tgrid-header td').each(function(i, x){
				var f = fields[i];
				var $target = $(x).find('.tgrid-sort');
				if(f.icon) {
					if(index == i){
						if(asc) {
							$target.removeClass(f.icon);
							$target.removeClass(f.iconDesc);
							$target.addClass(f.iconAsc);
						}
						else {
							$target.removeClass(f.icon);
							$target.removeClass(f.iconAsc);
							$target.addClass(f.iconDesc);
						}
					}
					else {
						$target.removeClass(f.iconDesc);
						$target.removeClass(f.iconAsc);
						$target.addClass(f.icon);
					}
				}
			});
		},
		_getStats: function(model){
			var fields = this.options.fields;
			var filters = this.options.filters;
			return Object.keys(filters).length > 0 ? model.reduce(function(s, item, i){
				Object.keys(fields).forEach(function(k){
					var flt = filters[k];
					if(flt){
						var v = typeof flt.filter == 'function' ? flt.filter(item[k]) : item[k];
						s[k] = s[k] || {};
						s[k][v] = s[k][v] || 0;
						s[k][v] += 1;
					}
				});
				return s;
			}, {}) : {};			
		},
		getStats: function(){
			return this._stats;
		},
		scrollTo: function($row){
			var h = $row.parent().length > 0 ? $row.parent().offset().top : 0;
			this.element.find('.tgrid-items').scrollTop($row.offset().top - h);
		},
		_resetFilters: function(filters, stats){
			return Object.keys(stats).reduce(function(a,i){
				var f = filters[i] && filters[i].values;
				a[i].values = Object.keys(stats[i])
					.reduce(function(a,k){
						a[k] = f && f.hasOwnProperty(k) ? f[k] : true;
						return a;
					},{});
				return a;
			}.bind(this), $.extend(true, {}, filters));
		},
		_attachHeaderEvents: function(){
			if(this.options.model.length > 0){
				this._stats = this._getStats(this.options.model);
				var fks = Object.keys(this.options.fields);
				var fields = fks
					.map(function(k){
						return this.options.fields[k];
					}.bind(this));

				this.element.find('.tgrid-header td').each(function(i, x){

					// sort
					$(x).find('.tgrid-icon').on('click', function(e){
						$target = $(e.target);
						if($target.hasClass('tgrid-sort')) {
							this.options.sortBy.asc = fks.indexOf(this.options.sortBy.field) == i ? !this.options.sortBy.asc : true;
							this.options.sortBy.field = fks[i];
							this._updateSortIcons(this.options.sortBy.field, this.options.sortBy.asc);
							this._filtered = this._sort(this._filter(this.options.model).items, this.options.sortBy.field, this.options.sortBy.asc);
							this._renderItems(this._filtered);
						}
					}.bind(this));

					// filter
					var field = fields[i];
					var fk = fks[i];
					var flt = this.options.filters[fk];
					var st = this._stats[fk];
					if(flt) {
						var filterItems = Object.keys(flt.values).reduce(function(a,k){
							a.push({name: k, key: k, col: i, checked: flt.values[k], count: 0, uuid: this.uuid});
							return a;
						}.bind(this),[]);
						var $btnFilter = $(x).find('.tgrid-filter');
						var html = filterTemplate({all: 'Все', col: i, items: filterItems, count: 0, uuid: this.uuid});
						$btnFilter.popover({
							content: html,
							html: true
						});
						$btnFilter.on('shown.bs.popover',function(e){
							this._hideOtherPopovers(i);
							var parent = $(e.target).parent();
							var container = parent.find('.popover-content');
							var getTotalCount = function(){
								return container.find('ul input[type="checkbox"]')
									.filter(function(k,x){
										return $(x).prop('checked');
									})
									.map(function(k,x){
										return parseInt($(x).parent().find('.item-count').text(),10);
									})
									.toArray()
									.reduce(function(a,x){
										a += x;
										return a;
									},0);
							};
							var updateStats = function(statistics){
								container.find('ul li').each(function(k,p){
									var $p = $(p);
									var v = $p.find('input[type="checkbox"]').val();
									$p.find('.item-count').text(statistics[v] ? statistics[v] : 0);
								});
								container.find('.total-count').text(getTotalCount());
							};

							container.find('ul input[type="checkbox"]')
								.each(function(k, x){
								  var target = $(x);
								  target.prop('checked', flt.values[target.val()]);
									target.off()
									.click(this._filterOptionClick.bind(this, target, $btnFilter, filters, flt));
								}.bind(this));

							container.find('div > input[type="checkbox"]')
								.tristate({items: container.find('ul input[type="checkbox"]')})
								.on('selectall',function(e, checked){
									Object.keys(flt.values).forEach(function(v){ flt.values[v] = checked; });
									this._updateFilterIcon($btnFilter, this.options.filters);
									this._filtered = this._sort(this._filter(this.options.model).items, this.options.sortBy.field, this.options.sortBy.asc);
									this._renderItems(this._filtered);
									if(this.options.hasHeader){
										this.adjustHeader();
									}
								}.bind(this));

							updateStats(st || {});
						}.bind(this));
						// btnFilter.on('hidden.bs.popover', function(e){
						// 	var parent = $(e.target).parent();
						// 	var container = parent.find('.popover-content');
						// 	var flt = this.options.filters[fk];
						//
						// }.bind(this));
						this._popovers[i] = $btnFilter;
					}
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
		_filterOptionClick: function($val, $btnFilter, filters, flt){
			var v = $val.val();
			var checked = $val.prop('checked');
			flt.values[v] = checked;
			var items = this._filter(this.options.model).items;
			// var s = this._getStats(items);
			// updateStats(s[fk] || {});
			this._updateFilterIcon($btnFilter, filters);
			this._filtered = this._sort(items, this.options.sortBy.field, this.options.sortBy.asc);
			this._renderItems(this._filtered);
			if(this.options.hasHeader){
				this.adjustHeader();
			}
		},
		_attachContainerEvents: function(){
			this.element.find('.tgrid-items').scroll(function(e){
				this._currentScroll = $(e.target).scrollTop();
			}.bind(this));
		},
		_attachItemsEvents: function(){
			this._attachContainerEvents();
			var fks = Object.keys(this.options.fields);
			var fields = fks
				.map(function(k){
					return this.options.fields[k];
				}.bind(this));
			this.element.find('.tgrid-items tr').each(function(i,row){
				var $row = $(row);
				var item = this._filtered[i];
				var $sel = $row.find('input[type="checkbox"]');
				$sel.click(function(e){
					var $t = $(e.target);
					e.stopPropagation();
					item.checked = $t.prop('checked');
					this._trigger('select', e, item);
				}.bind(this));
				$row.click(function(e){
					e.stopPropagation();
					this._trigger('click', e, item);
				}.bind(this));
				$row.find('i').click(function(e){
					e.stopPropagation();
					var $t = $(e.target);
					this._trigger('buttonClick', e, [$t.attr('class'), item]);
				}.bind(this));
			}.bind(this));
		},
		_hideOtherPopovers: function(index){
			for(var i in this._popovers){
				if(i != index){
					this._popovers[i].popover('hide');
				}
			}
		},
		getRows: function(){
			return this.element.find('.tgrid-items tr').map(function(i,row){
				return $(row);
			}).toArray();
		}
	});
}(jQuery));
