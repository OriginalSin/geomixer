(function($){
	$.widget('scanex.tristate',{
		options: {},
		_create: function(){
			this.element.on('click', this._click.bind(this));
			this.options.items.on('click',this._update.bind(this));
			this._update();
		},
		_destroy: function(){
			this.element.off('click', this._click.bind(this));
			this.options.items.off('click',this._update.bind(this));
		},
		_click: function(){
			var state = this.element.prop('checked');
				this.options.items.each(function(i, item){
					$(item).prop('checked', state);
				});
			this.element.trigger('selectall',[state]);
		},
		_setOption: function(key, value){			
			switch (key) {
				case 'items':
					this.options.items.off('click',this._update.bind(this));					
					this._super(key, value);
					this.options.items.on('click',this._update.bind(this));
					this._update();
					break;
				default:
					break;
			}
		},
		_update: function(){			
			var items = this.options.items.toArray();
			if(items.length){				
				var state0 = this.element.prop('indeterminate');
				var checked = $(items[0]).prop('checked');
				var state = false;
				for (var i = 1; i < items.length; i++){
					if($(items[i]).prop('checked') != checked){
						state = true;
						break;
					}
				}
				if(state != state0) {
					this.element.prop('indeterminate', state);
				}
				this.element.prop('checked', checked);
			}
		}
	});
}(jQuery));





