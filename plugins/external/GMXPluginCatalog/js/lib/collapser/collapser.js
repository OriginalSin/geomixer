(function($){
	$.fn.collapser = function(options){
    var opts = $.extend(true, {}, options);
		var tabs = [];
		this.children().each(function(i, x){
			var $el = $(x);
      $el.css('clear','both');
      $el.addClass('collapser-tab');
			var $btn = $el.find('.collapser-button');
      $btn.children().css('float','left');
			var $pointer = $btn.find('.collapser-pointer');
			$pointer.addClass('ui-icon');
			var $panel = $el.find('.collapser-panel');
      $panel.css('clear','both');
			if(i == 0){
				$pointer.addClass(opts.iconOpen || 'ui-icon-triangle-1-s');
				this.currentPanel = $panel;
			}
			else{
				$pointer.addClass(opts.iconClosed || 'ui-icon-triangle-1-e');
				$panel.hide();
			}
			tabs.push({pointer: $pointer, panel: $panel});
			$btn.click(function(e){
				tabs.forEach(function(t, k){
					if(k == i){
						if(t.pointer.hasClass(opts.iconOpen || 'ui-icon-triangle-1-s')){
							t.pointer.removeClass(opts.iconOpen || 'ui-icon-triangle-1-s');
							t.pointer.addClass(opts.iconClosed || 'ui-icon-triangle-1-e');
							t.panel.hide();
							this.currentPanel = null;
							$(this).trigger('hidden');
						}
						else{
							t.pointer.removeClass(opts.iconClosed || 'ui-icon-triangle-1-e');
							t.pointer.addClass(opts.iconOpen || 'ui-icon-triangle-1-s');
							t.panel.show();
							this.currentPanel = t.panel;
							$(this).trigger('shown', [t.panel]);
						}
					}
					else {
						t.pointer.removeClass(opts.iconOpen || 'ui-icon-triangle-1-s');
						t.pointer.addClass(opts.iconClosed || 'ui-icon-triangle-1-e');
						t.panel.hide();
					}
				}.bind(this));
			}.bind(this));
		});
		return this;
	};
}(jQuery));
