
MyControlsFactory._styleManager = null;

MyControlsFactory.USERS_DATA = [];
MyControlsFactory.OPENED_BALOONS = [];
MyControlsFactory.USERS_DATA_ARRAY = {};

MyControlsFactory.CONTROLS = {
	"PANEL":       "PANEL",
	"SCROLL_PANEL": "SCROLL_PANEL",
	"MAP_BROWSER": "MAP_BROWSER",
	"PROGRESS_BAR":       "PROGRESS_BAR",
	"BUTTON":      "BUTTON",
	"LABEL":       "LABEL",
	"TEXT_BOX":    "TEXT_BOX",
	"TEXT_AREA":    "TEXT_AREA",
	"DATE_PICKER": "DATE_PICKER",
	"CHECK_BOX":   "CHECK_BOX",
	"COMBO_BOX":   "COMBO_BOX"
}

MyControlsFactory.FACTORY = {
	"PANEL":              function(opts){return new MyControlsFactory.MyPanel(opts);},
	"SCROLL_PANEL":       function(opts){return new MyControlsFactory.ScrollPanel(opts);},
	"MAP_BROWSER":        function(opts){return new MyControlsFactory.MapBrowser(opts);},
	"DATE_PICKER":        function(opts){return new MyControlsFactory.DatePicker(opts);},
	"PROGRESS_BAR":       function(opts){return new MyControlsFactory.ProgressBar(opts);},
	"LABEL":              function(opts){return new MyControlsFactory.Label(opts);},
	"TEXT_BOX":           function(opts){return new MyControlsFactory.TextBox(opts);},
	"TEXT_AREA":          function(opts){return new MyControlsFactory.TextArea(opts);},
	"BUTTON":             function(opts){return new MyControlsFactory.Button(opts);},
	"CHECK_BOX":          function(opts){return new MyControlsFactory.CheckBox(opts);},
	"COMBO_BOX":          function(opts){return new MyControlsFactory.ComboBox(opts);}
}

function MyControlsFactory(){	
}

//Создать экземпляр конттрола
MyControlsFactory.createInstance = function(control_name, opt) {	
	return MyControlsFactory.FACTORY[control_name](opt);
}

//Классы контролов
//*****************************************************************************************************************************************************************
//************************************************************************************************************************************************
MyControlsFactory.DIVS_TYPES = {	
	"FIRST_CONT": "_FIRST_CONT",
	"CONTENT":    "_CONTENT",
	"LAST_CONT":  "_LAST_CONT",
	"PANEL":  "PANEL"
}

//Базовый объект
MyControlsFactory.MyControls = function(opt){
	var _this = this;
	
	this._opt = opt;
	
	this._style_prefix = this.getName();
		
	( opt.parent != undefined ) ? this._parent = $("#" + opt.parent) : this._parent = null;
		
	//this._styleManager = null;
	this._curStyle = null;
	
	this._bgColor = this.getCurStyle()[ this._style_prefix + StyleManager.STYLE_NAMES.COLOR ];		
	
	this._bgColor_opt = opt.bgColor;
	this._opacity     = opt.opacity;
	
	//Вызывается перед удалением элемента
	this._befor_deleting = opt.befor_deleting;
	
	//Сохранить параметры во время сессии
	this._save     = opt.save;
	
	this._JQUERY_DOM = [];
	this._DOM = [];
	
	if (opt.pos == undefined){
		opt.pos = [0,0];
	}
	
	this._pos  = opt.pos;
	this.old_pos = this._pos;
	
	this._size = opt.size;
	
	this._loc_offsets = [];
	
	this._top  = opt.pos[0];
	this._left = opt.pos[1];
	this._width  = opt.size[0];
	this._height = opt.size[1];		
	
	this._boud = [_this._top, _this._left, _this._width, _this._height];
		
	var JQUERY_elements = this.create();		
	
	for (var i in JQUERY_elements){
		var cur_el = JQUERY_elements[i];
				
		this._JQUERY_DOM.push(cur_el);			
		this._loc_offsets.push([0, 0]);							
	}		
		
	var DOM_elements = this.getDOM();

	for (var i in DOM_elements){
		var cur_el = DOM_elements[i];
		
		this._DOM.push(cur_el);	
	}
	
	this._isShowing = true;			
}

//Вернуть размер элемента
MyControlsFactory.MyControls.prototype.getSize = function() {
	return this._size;
}

//Вернуть ачальную позицию элемента
MyControlsFactory.MyControls.prototype.getInitPos = function() {
	return this._pos;
}

//Вернуть JQUERY оболочку DOM-элемент
MyControlsFactory.MyControls.prototype.getJQUERYDOM = function(){		
	return this._JQUERY_DOM;		
}

//Вернуть DOM-элемент
MyControlsFactory.MyControls.prototype.getDOM = function(){
	var dom = this.getJQUERYDOM();
	
	var ret_dom = [];
		
	for(var i in dom){		
		ret_dom.push(dom[i]);
	}	
		
	return ret_dom;		
}

//Вернуть Bound
MyControlsFactory.MyControls.prototype.getBound = function() {
	return([
		this.getCurPos()[0],
		this.getCurPos()[1],
		this.getSize()[0],
		this.getSize()[1]
	]);
}

//Элемент в Bound?
MyControlsFactory.MyControls.prototype.inBound = function(panel) {
	var el_bound = this.getBound();
	
	var koeff_0 = this.getCurPos()[0] > panel.getCurPos()[0];
	var koeff_1 = (this.getCurPos()[0] + this.getSize()[1]) < (panel.getCurPos()[0] + panel.getSize()[1]);
			   
    return koeff_0 && koeff_1;
}
	
//Вернуть текущую позицию элемента
MyControlsFactory.MyControls.prototype.getCurPos = function() {
	var el = this.getJQUERYDOM()[0];
	
	return [parseInt(el.css("top"), 10), 
	        parseInt(el.css("left"),10)];
}

//Установить текущую позицию элемента
MyControlsFactory.MyControls.prototype.setCurPos = function(pos) {
	var _this = this;
	
	var elements = this.getJQUERYDOM();
	
	for (var i in elements){
		var cur_el = elements[i];
		
		cur_el.css("top",  pos[0]  + _this._loc_offsets[i][0]);
		cur_el.css("left",  pos[1] + _this._loc_offsets[i][1]);
	}	
}

//Запустить анимацию: убрать с формы
MyControlsFactory.MyControls.prototype.doAnimateHide = function(opt, time){
	
	var _this = this;
	var dom = this.getJQUERYDOM();
	
	for(var i in dom){
		var cur_el = dom[i];
		
		cur_el.animate(
			opt,
			time,
			function(){																					
				_this.hide();					
			}
		);
	}
}

//Запустить анимацию: показать на форме
MyControlsFactory.MyControls.prototype.doAnimateShow = function(opt, time){
	var _this = this;
	var dom = this.getJQUERYDOM();
	
	for(var i in dom){
		var cur_el = dom[i];			
		cur_el.show();
	}
		
	for(var i in dom){
		var cur_el = dom[i];
		
		opt.top  += this._loc_offsets[i][0];
		opt.left += this._loc_offsets[i][1];
		
		cur_el.animate(
			opt,
			time,
			function(){																					
				//_this.show();					
			}
		);
	}
}	

//Скрыть элемент
MyControlsFactory.MyControls.prototype.hide = function(){			
	var dom = this.getJQUERYDOM();
		
	for(var i in dom){
		var cur_el = dom[i];
		
		cur_el.hide();
	}	
	
	this._isShowing = false;		
}

//Отобразить элемент
MyControlsFactory.MyControls.prototype.show = function(){		
	var dom = this.getJQUERYDOM();
		
	for(var i in dom){
		var cur_el = dom[i];
		
		cur_el.show();
	}	
	
	this._isShowing = true;		
}

//Отобразить элемент а форме
MyControlsFactory.MyControls.prototype.append = function() {		
	var parent = null; 
	
	(this._parent == null) ? parent = MyControlsFactory.MyControls._parent : parent = this._parent;
	
	var dom = this.getJQUERYDOM();
	
	for(var i in dom){	
		parent.append(dom[i]);		
	}	
	
	return this;			
}

//Удалить
MyControlsFactory.MyControls.prototype.remove = function(opt) {
	var dom = this.getJQUERYDOM();

	if (typeof this._befor_deleting == "function"){
		this._befor_deleting();		
	}
														
	for(var i in dom){
		dom[i].remove();		
	}	
}

//Задать parent
MyControlsFactory.MyControls.setParent = function(parent){
	MyControlsFactory.MyControls._parent_name = parent;
	MyControlsFactory.MyControls._parent      = $("#" + parent);	
}

//Создание StealManager'a
MyControlsFactory.MyControls.createStealManager = function(opt){
	MyControlsFactory._styleManager = new StyleManager(opt);		
}

//Вернуть _curStyle
MyControlsFactory.MyControls.prototype.getCurStyle = function(){
	return( MyControlsFactory._styleManager.getCurStyle() );			
}

//Вернуть начение стиля
MyControlsFactory.MyControls.prototype.getStealValue = function(style_name){	
	return MyControlsFactory._styleManager.getStealValue( this._style_prefix, style_name);				
}

MyControlsFactory.MyControls.GUID = function()
{
    var S4 = function ()
    {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
}

MyControlsFactory.MyControls.extend = function(Child, Parent) {
    var F = function() { 
    }
    
    F.prototype = Parent.prototype;
    
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}
//*************************************************************************************************************************************************************
MyControlsFactory.Label = function(opt){	
	this._text = opt.text;	
	
	MyControlsFactory.Label.superclass.constructor.apply(this, arguments);
}

MyControlsFactory.MyControls.extend(MyControlsFactory.Label, MyControlsFactory.MyControls);

//Вернуть имя контрола(убрать впоследствии)
MyControlsFactory.Label.prototype.getName = function() {		
	return StyleManager.STYLE.LABEL;
}

//Создать Метку
MyControlsFactory.Label.prototype.create = function() {		
	var _this = this;
		
	var id = MyControlsFactory.MyControls.GUID();
	
	//Контейнер с контентом
	var content = $("<div></div>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.CONTENT ).						
	        attr("class", "textConteiner").	
	        text(this._text).     	       
	        css("top", this._top).
			css("left", this._left).
			css("width", this._width - 10).
			css("height", this._height - 10);	
		
	//"Прозрачный" контейнер	
	var cont_first = $("<div></div>").	
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT).						
			attr("class", "container pie").			
			css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);	
	
	StyleManager.setBGOpacity(cont_first, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(cont_first, StyleManager.STANDART_CORNER_RADIUS);			
			
	//"Невидимый" контейнер с событиями
	var cont_last = $("<div></div>").
		attr("id", id + MyControlsFactory.DIVS_TYPES.LAST_CONT).		
		attr("class", "container pie").
		css("top", this._top).
		css("left", this._left).
		css("width", this._width).
		css("height", this._height).			
		hover(function(){
			_this.mouseEnter();
		},function(){
			_this.mouseOut();
		});
	
	StyleManager.setBGOpacity(cont_last, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 StyleManager.TRANSPARENT_OPACITY);					      
	StyleManager.setRadius(cont_last, StyleManager.STANDART_CORNER_RADIUS);	
		
	return [cont_first, content, cont_last];
}

//Событие при наведении мыши
MyControlsFactory.Label.prototype.mouseEnter = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));	
}

//Событие при уходе мыши
MyControlsFactory.Label.prototype.mouseOut = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));		
}
//************************************************************************************************************************************************
MyControlsFactory.MyPanel = function(opt){	
	this._isMaximize = opt.maximize;	
	this._isDraggable = opt.draggable;
	
	this._modal_state = false;
	this._loadingWaiting_state = false;
	this._waiting_message = null;
	this._waiting_button = null;
	
	this._childs = [];
	
	this._old_z_index = 0;
	
	this._childs_shifts = [];	
	this._offset = [0, 0];
	
	this._minWidth  = opt.minSize[0];
	this._minHeight = opt.minSize[1];
	
	MyControlsFactory.MyPanel.superclass.constructor.apply(this, arguments);				
}

MyControlsFactory.MyControls.extend(MyControlsFactory.MyPanel, MyControlsFactory.MyControls);

//ернуть имя контрола(убрать впоследствии)
MyControlsFactory.MyPanel.prototype.getName = function() {		
	return StyleManager.STYLE.PANEL;
}

//Вернуть Z-index
MyControlsFactory.MyPanel.prototype.getZIndex = function() {
	return this.getJQUERYDOM()[0].css("z-index");	
}

//setModalState
MyControlsFactory.MyPanel.prototype.setWaitingLoadingState = function(isWaiting, opt) {
	var _this = this;
	
	var el = this.getJQUERYDOM()[0];
	
	var img_w = 100;
	var img_h = 100;
		
	var cur_pos  = this.getCurPos();
	var cur_size = this.getSize();
	
	var message_width = this.getSize()[0] - 10;
		
	var img_top  = (cur_size[1] - img_h)/2 + 15;
	var img_left = (cur_size[0] - img_w)/2;
	
	var z_index = 1000000;
	
	if (isWaiting == true){
		if (this._loadingWaiting_state == false){		
			this._old_z_index = el.css("z-index");
			
			el.css("z-index", z_index);	
			
			StyleManager.setBGOpacity(el, 
						 this.getStealValue(StyleManager.STYLE_NAMES.COLOR_MODAL), 
						 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_MODAL));
			
			
			var img = $("<img></img>").
				attr("src", MyControlsFactory.BUFFER_PATH + "img/" +"ajax-loader.gif" + "?" + (Math.random()*100).toString()).
				attr("class", "container").
			    css("top", img_top).
				css("left", img_left).
				css("width", 100).
				css("height", 100);
					
			el.append(img);
			
			if (opt != undefined){				
				this._waiting_message = $("<div></div>").				
					attr("class", "textConteinerWaitingAlert").
					text(opt.message).
				    css("top", img_top - 30).
					css("left", 5).
					css("width", message_width).
					css("height", 30);
					
				el.append(this._waiting_message);
			
				this._waiting_button = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
													{"enabled": true,
												    "enterOutFun": [function(){}, function(){}
												    ],
												    "click": function(){	
												    	
												    	if (( opt.stop_fun!= null) && ( (typeof opt.stop_fun) == "function")){
															opt.stop_fun();
														}
														
												    	_this.setWaitingLoadingState(false, null);													    												    								    	
												    },
												    "text": "Остановить",
												    "pos": [cur_pos[0] + img_top + 100, cur_pos[1] + img_left],
												    "size": [110, 30]});
															    
				this._waiting_button.append();
				
				this.addToPanel(this._waiting_button);
				
				var button_elements = this._waiting_button.getJQUERYDOM();
				
				for(var ii in button_elements){
					button_elements[ii].css("z-index", z_index);	
				}
			}
			/*
			_.each(button_elements, function(value){	
				value.css("z-index", z_index);					
			});	
			*/
											    
			this._loadingWaiting_state = true;
		}		 		
	}else{	
		if (this._loadingWaiting_state == true){
			
			el.find("img").remove();
			
			if (this._waiting_message != null){	
				this._waiting_message.remove();			
			}
				
			if (this._waiting_button != null){	
				this._waiting_button.remove();			
			}
							
			el.css("z-index", this._old_z_index);
			
			var bg_color = this._bgColor_opt;
		
			if (bg_color == undefined){
				bg_color = this.getStealValue( StyleManager.STYLE_NAMES.COLOR );
			}
			
			StyleManager.setBGOpacity(el, 
						 bg_color, 
						 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));	
						 
			this._loadingWaiting_state = false;									
		}				
	}
}

//setModalState
MyControlsFactory.MyPanel.prototype.setModalState = function(isModal) {
	var el = this.getJQUERYDOM()[0];
	
	if (isModal == true){
		this._modal_state = true;
			
		this._old_z_index = el.css("z-index");
		
		var z_index = 1000000;
		
		el.css("z-index", z_index);	
		
		StyleManager.setBGOpacity(el, 
					 this.getStealValue(StyleManager.STYLE_NAMES.COLOR_MODAL), 
					 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_MODAL));
	}else{
		this._modal_state = false;
		
		el.css("z-index", this._old_z_index);
		
		var bg_color = this._bgColor_opt;
	
		if (bg_color == undefined){
			bg_color = this.getStealValue( StyleManager.STYLE_NAMES.COLOR );
		}
		
		StyleManager.setBGOpacity(el, 
					 bg_color, 
					 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));		
	}
}

//Установить Z-index
MyControlsFactory.MyPanel.prototype.setZIndex = function(z) {
	this._JQUERY_DOM.css("z-index", z);	
	
	for(var i in this._childs){
		var cur_child = this._childs[i];
		
		var parts = cur_child.getJQUERYDOM();
		
		for(var j in parts){
			var cur_el = parts[j];
			
			cur_el.css("z-index", z + 10);	
		}
	}
}

//Установить текущую позицию элемента
MyControlsFactory.MyPanel.prototype.setCurPos = function(pos) {	
	MyControlsFactory.MyPanel.superclass.setCurPos.apply(this, arguments);
	
	var childs_shifts = this._childs_shifts;		
		
	for(var i in this._childs){
		var cur_child = this._childs[i];
		
		if(this._isMaximize == true){				
			cur_child.setCurPos([
				pos[0] + childs_shifts[i][0] + this._loc_offsets[0][0],
				pos[1] + childs_shifts[i][1] + this._loc_offsets[0][1]
			]);			
		}else{
			cur_child.setCurPos([
				pos[0] + this._loc_offsets[0][0],
				pos[1] + this._loc_offsets[0][1]
			]);	
		}
	}
}

//Создать панель
MyControlsFactory.MyPanel.prototype.create = function(opt) {	
	var _this = this;
		
	var id = MyControlsFactory.MyControls.GUID();
	
	var panel = $("<div></div>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT ).									     
	        attr("class", "panel pie").	     	       
	        css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height).
			toggle(function() {
				//_this.hide({"time": 665});
			}, function() {
			  	//_this.show({"time": 655});
			});						
	
	var bg_color = this._bgColor_opt;
	
	if (bg_color == undefined){
		bg_color = this.getStealValue( StyleManager.STYLE_NAMES.COLOR );
	}
	
	var opacity = this.getStealValue(StyleManager.STYLE_NAMES.OPACITY);
	
	if (this._opacity != undefined){
		opacity = this._opacity;
	}
	
	StyleManager.setBGOpacity(panel, 
				 bg_color, 
				 opacity);	
				 				      
	StyleManager.setRadius(panel, StyleManager.STANDART_CORNER_RADIUS);	
	
	if(bg_color.toString() != "transparent"){
		StyleManager.setShadow( panel, 
			   this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			   this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));
	}
	
	return [panel];		
}

//Отобразить панель с объектами на ней
MyControlsFactory.MyPanel.prototype.show = function(opt) {	
	
	var _this = this;
	
	var childs_shifts = this._childs_shifts;
	
	this.getJQUERYDOM()[0].animate({"width":  this._width,
							  "height": this._height},
							  opt.time,
							  function(){								  						  
								  	if(opt.doAfterShow != undefined){
								  		opt.doAfterShow();	
								  	}							  	
							  });	
						 
	for(var i in this._childs){
		var cur_child = this._childs[i];
		var curpos = cur_child.getCurPos()
		
		var pos = this.getCurPos();
				
		cur_child.doAnimateShow({"top":  pos[0] + childs_shifts[i][0],
						     	"left": pos[1]  + childs_shifts[i][1],
						     	"width": cur_child.getSize()[0]},
					   	     	opt.time);					   	     		
	}	
	
	this._isMaximize = true;					  	
}

//Скрыть панель с объектами на ней
MyControlsFactory.MyPanel.prototype.hide = function(opt) {
	
	var _this = this;
				
	var parent_pos = this.getCurPos();	
	
	this.getJQUERYDOM()[0].animate({"width":  this._minWidth,
							  "height": this._minHeight},
							  opt.time,							 
							  function(){								  						  
								  	if(opt.doAfterHide != undefined){
										opt.doAfterHide();	
									}															  	
							  });
	
	for(var i in this._childs){
		var cur_child = this._childs[i];		
		
		cur_child.doAnimateHide({"top":  parent_pos[0],
						     	"left":  parent_pos[1],
						     	"width": _this._minWidth},
					   	     	opt.time);					   	     		
	}
	
	this._isMaximize = false;
}

//Изменить отображение
MyControlsFactory.MyPanel.prototype.toggleShowing = function(opt) {		
			
	if (this._isMaximize == true){		
		this.hide(opt);
	} else{		
		this.show(opt);
	}	
}

//Удалить
MyControlsFactory.MyPanel.prototype.remove = function(opt) {	
	MyControlsFactory.MyPanel.superclass.remove.apply(this, arguments);
	
	for(var i in this._childs){
		var cur_child = this._childs[i];		
		
		cur_child.remove();					   	     		
	}
}

//Добавить элементы на панель
MyControlsFactory.MyPanel.prototype.addToPanel = function(child) {	
	var _this = this;
						
	this._childs.push(child);	
	
	var this_cur_pos = this.getCurPos();
	var child_cur_pos = child.getCurPos();	
	
	this._childs_shifts.push([
		child_cur_pos[0] - this_cur_pos[0],
		child_cur_pos[1] - this_cur_pos[1]
	]);		
	
	var modal_z_index = this.getZIndex();
	
	if ((this._modal_state == true) || (this._loadingWaiting_state == true)){
		for(var i in child.getJQUERYDOM()){
			var cur_el = child.getJQUERYDOM()[i];
			
			cur_el.css("z-index", modal_z_index - 10);
		}	
	}else{
		for(var i in child.getJQUERYDOM()){
			var cur_el = child.getJQUERYDOM()[i];
			
			//cur_el.css("z-index", modal_z_index + 10);
		}
	}	
}

//Отобразить элемент а форме
MyControlsFactory.MyPanel.prototype.append = function() {	
	MyControlsFactory.MyPanel.superclass.append.apply(this, arguments);
	
	var _this = this;
	
	var dom = this.getJQUERYDOM();
	
	if (this._isMaximize == false){	
		this.hide({"time": 0});		
	}	
	
	if (this._isDraggable == true){		
		dom[0].draggable({
			cursor: "move",
			"start": function(event, ui){		
				if ((this._modal_state == false) || (this._loadingWaiting_state == false)){						
					StyleManager.setBGOpacity( _this.getDOM()[0], 
										       _this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
										       _this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_DRAG ));	
				}					
			},
			"stop": function(event, ui){	
				if ((this._modal_state == false) || (this._loadingWaiting_state == false)){							
					StyleManager.setBGOpacity( _this.getDOM()[0], 
								  			   _this.getStealValue(StyleManager.STYLE_NAMES.COLOR),  
								  			   _this.getStealValue(StyleManager.STYLE_NAMES.OPACITY ));
				}
				
				var cur_pos  = _this.getCurPos();
						
				for(var i in _this._childs){
					var cur_child       = _this._childs[i];
					var cur_child_shift = _this._childs_shifts[i];
								
					cur_child.setCurPos([
						cur_pos[0] + cur_child_shift[0],
						cur_pos[1] + cur_child_shift[1]
					]);
				}	
			},
			"drag": function(event, ui){					
				var cur_pos  = _this.getCurPos();
									
				for(var i in _this._childs){
					var cur_child       = _this._childs[i];
					var cur_child_shift = _this._childs_shifts[i];
													
					cur_child.setCurPos([
						cur_pos[0] + cur_child_shift[0],
						cur_pos[1] + cur_child_shift[1]
					]);
				}									
			}
		});
	}		
}
//************************************************************************************************************************************************
MyControlsFactory.TextBox = function(opt){	
	this._text = opt.text;			
		
	MyControlsFactory.TextBox.superclass.constructor.apply(this, arguments);		
}

MyControlsFactory.MyControls.extend(MyControlsFactory.TextBox, MyControlsFactory.MyControls);

//ернуть имя контрола(убрать впоследствии)
MyControlsFactory.TextBox.prototype.getName = function() {		
	return StyleManager.STYLE.TEXTBOX;
}

//Создать TextBox
MyControlsFactory.TextBox.prototype.create = function() {	
	var _this = this;
		
	var id = MyControlsFactory.MyControls.GUID();

	var value = this._text;

	if (this._save == true){
		value = MyControlsFactory._styleManager.getState();		
	}

	//Контейнер с контентом
	var content = $("<input></input>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.CONTENT ).			
			attr("name", id + MyControlsFactory.DIVS_TYPES.CONTENT ).	
			attr("type", "text").
			attr("value", value).
	        attr("class", "inputConteiner").		           	      
	        css("top", this._top).
			css("left", this._left + 5).
			css("width", this._width - 10).
			css("height", this._height - 10).
			hover(function(){
				_this.mouseEnter();
			},function(){
				_this.mouseOut();
			});
	
	this._loc_offsets = [[0,0], [0, 5]];	
		
	//"Прозрачный" контейнер	
	var cont_first = $("<div></div>").	
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT).						
			attr("class", "container pie").			
			css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);
			
	StyleManager.setBGOpacity(cont_first, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(cont_first, StyleManager.STANDART_CORNER_RADIUS);			
	StyleManager.setShadow(cont_first, 
			  this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			  this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));	
	
	return [cont_first, content];
}

//Удалить
MyControlsFactory.TextBox.prototype.remove = function() {	
	
	if (this._save == true){
		MyControlsFactory._styleManager.saveState(this.value());				
	}
	
	MyControlsFactory.TextBox.superclass.remove.apply(this, arguments);	
}

//Событие при наведении мыши
MyControlsFactory.TextBox.prototype.mouseEnter = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].removeClass("inputConteiner");	
	dom[1].addClass("inputConteiner_over");	
	
	StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));			
}

//Событие при уходе мыши
MyControlsFactory.TextBox.prototype.mouseOut = function(opt, time){
	var dom = this.getJQUERYDOM();
		
	dom[1].addClass("inputConteiner");	
	dom[1].removeClass("inputConteiner_over");	
	
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));		
}

//Вернуть значение
MyControlsFactory.TextBox.prototype.value = function(){			
	return this._JQUERY_DOM[1].attr("value");		
}

//Установить значение
MyControlsFactory.TextBox.prototype.setValue = function(val){			
	return this._JQUERY_DOM[1].attr("value", val);		
}
//************************************************************************************************************************************************
MyControlsFactory.Button = function(opt){	
	this._text = opt.text;	
	this._click = opt.click;	
	this._isClicked = false;	
	this._img = opt.img;
	this._isToggle = opt.isToggle;
	this._enterOutFun = opt.enterOutFun;
	this._enabled = opt.enabled;
	
	if (this._enabled == undefined){
		this._enabled = true;
	}
	
	MyControlsFactory.Button.superclass.constructor.apply(this, arguments);
	
	if(this._img == undefined){
		this._loc_offsets = [[0,0], [0, 0], [0,0]];	
	}else{
		this._loc_offsets = [[0,0], [0, 20], [0,0]];	
	}
}

MyControlsFactory.MyControls.extend(MyControlsFactory.Button, MyControlsFactory.MyControls);

//ернуть имя контрола(убрать впоследствии)
MyControlsFactory.Button.prototype.getName = function() {		
	return StyleManager.STYLE.Button;
}

//Создать Метку
MyControlsFactory.Button.prototype.create= function() {		
	var _this = this;
		
	var id = MyControlsFactory.MyControls.GUID();
	
	var image_shift = 0;
	
	if(this._img != undefined){	
		image_shift = 20;
	}
	
	var class_name = ( this._enabled == true ?  "textConteiner" : "textConteiner_no_enabled");
	
	var img_width = 10;
	
	if(this._img != undefined){	
		img_width = 45;
	}
	
	//Контейнер с контентом
	var content = $("<div></div>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.CONTENT ).						
	        attr("class", class_name).	
	        text(this._text).     	       
	        css("top", this._top).
			css("left", this._left + image_shift).
			css("width", this._width - img_width).
			css("height", this._height - 10);	
				
	//"Прозрачный" контейнер	
	var cont_first = $("<div></div>").	
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT).														
			attr("class", "container pie").			
			css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);			
	
	if(this._img != undefined){	
		var img = $("<img></img>").
				attr("src", "img/" + this._img + "?" + (Math.random()*100).toString()).
				attr("class", "container").
			    css("top", 6).
				css("left", 4);
			
		cont_first.append(img);		
	}	
	
	StyleManager.setBGOpacity(cont_first, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(cont_first, StyleManager.STANDART_CORNER_RADIUS);		
	StyleManager.setShadow(cont_first, 
			  this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			  this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));		
				
	//"Невидимый" контейнер с событиями
	var cont_last = $("<div></div>").
		attr("id", id + MyControlsFactory.DIVS_TYPES.LAST_CONT).	
		css("background-color", this._bgColor).		
		attr("class", "container pointer pie").
		css("top", this._top).
		css("left", this._left).
		css("width", this._width).
		css("height", this._height).			
		hover(function(){
			if (_this._enabled == true){
				_this.mouseEnterUnderline();
				
				if(!_this._isClicked){
					if (_this._isToggle != true){
						_this.mouseEnterText();
					}
					
					_this.mouseEnterBcGround();
				}	
				
				if (( _this._enterOutFun!= null) && ( (typeof _this._enterOutFun[0]) == "function")){
					_this._enterOutFun[0]();
				}				
			}		
		},function(){	
			if (_this._enabled == true){		
				_this.mouseOutUnderline();	
				
				if(!_this._isClicked){	
					if (_this._isToggle != true){
						_this.mouseOutText();
					}	
					
					_this.mouseOutBcGround();
				}	
				
				if (( _this._enterOutFun != null) && ( (typeof _this._enterOutFun[1]) == "function")){
					_this._enterOutFun[1]();
				}							
			}						
		}).
		mousedown(function(){	
			if (_this._enabled == true){										
				_this.mouseClick();		
				
				_this._click();				
			}
		}).
		mouseup(function(){		
			if (_this._enabled == true){		
				if (_this._isToggle != true){				
					_this.mouseClick();	
				}						
			}						
		});
	
	StyleManager.setBGOpacity(cont_last, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 StyleManager.TRANSPARENT_OPACITY);					      
	StyleManager.setRadius(cont_last, StyleManager.STANDART_CORNER_RADIUS);	
	
	return [cont_first, content, cont_last];
}

//Событие при клике мыши
MyControlsFactory.Button.prototype.mouseClick = function(opt, time){
	var dom = this.getJQUERYDOM();	
	
	if(this._isClicked == false){	
		
		StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));
				
		if (this._isToggle == true){
			this.mouseEnterText();
		}
	}else{				
		StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));	
			
		if (this._isToggle == true){
			this.mouseOutText();	
		}
	}	
	
	this._isClicked = !this._isClicked;	
}

//isClicked
MyControlsFactory.Button.prototype.isClicked = function(){
	return this._isClicked;
}
//Событие при наведении мыши
MyControlsFactory.Button.prototype.mouseEnterUnderline = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].addClass("textUnderLine");	
}

//Событие при наведении мыши
MyControlsFactory.Button.prototype.mouseEnterText = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].removeClass("textConteiner");	
	dom[1].addClass("textConteiner_over");		
}

//Событие при наведении мыши
MyControlsFactory.Button.prototype.mouseEnterBcGround = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));			
}

//Событие при уходе мыши
MyControlsFactory.Button.prototype.mouseOutUnderline = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].removeClass("textUnderLine");		
}

//Событие при уходе мыши
MyControlsFactory.Button.prototype.mouseOutText = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].addClass("textConteiner");	
	dom[1].removeClass("textConteiner_over");		
}

//Событие при уходе мыши
MyControlsFactory.Button.prototype.mouseOutBcGround = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));	
}
//************************************************************************************************************************************************
MyControlsFactory.CheckBox = function(opt){		
	this._checked = opt.checked;
	this._enterOutFun = opt.enterOutFun;			
	this._text = opt.text;	
	
	this._do = opt["do"];	
	
	this._isShowing = true;		
	
	MyControlsFactory.CheckBox.superclass.constructor.apply(this, arguments);	
	
	
		
	var value = opt.checked;
		
	if (this._save == true){
		var value = MyControlsFactory._styleManager.getState();	
		
		if (value == null){
			value = this._checked;
		}
	}
	
	this._checked = value;
	
	
		
	this.setChecked(this._checked);
	
	var dom = this.getJQUERYDOM();					 	
}

MyControlsFactory.MyControls.extend(MyControlsFactory.CheckBox, MyControlsFactory.MyControls);

//Удалить
MyControlsFactory.CheckBox.prototype.remove = function() {	
	
	if (this._save == true){
	
		MyControlsFactory._styleManager.saveState(this.getChecked());				
	}
	
	MyControlsFactory.CheckBox.superclass.remove.apply(this, arguments);	
}

//Вернуть имя контрола(убрать впоследствии)
MyControlsFactory.CheckBox.prototype.getName = function() {		
	return StyleManager.STYLE.CHECKBOX;
}

//Создать CheckBox
MyControlsFactory.CheckBox.prototype.create = function() {		
	var _this = this;
	
	var id = MyControlsFactory.MyControls.GUID();
	
	//Контейнер с контентом
	var check_box_cont = $("<div></div>").
		attr("id", id + MyControlsFactory.DIVS_TYPES.CONTENT).
		attr("class", "inputConteiner").
		css("top", this._top).
		css("left", this._left).
		css("width", this._width  - 10).
		css("height", this._height - 10);	
	
	this._loc_offsets = [[0,0], [0,0], [0,0]]
		
	var check_box = $("<input></input>").		
		attr("class", "container").
		attr("type", "checkbox").		
		css("top",  8).
		css("left", 5);
	
	var check_box_text = $("<div></div>").					
	        attr("class", "checkBoxText  inputConteiner container").
	        text(this._text).
	        css("top", 0).
			css("left", 25).
			css("width", this._width - 30).
			css("height", this._height - 10);
	
	check_box_cont.append(check_box);
	check_box_cont.append(check_box_text);
				   				   				   				   	
	//"Прозрачный" контейнер	
	var cont_first = $("<div></div>").	
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT).						
			attr("class", "container  pie").			
			css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);	
	
	StyleManager.setBGOpacity(cont_first, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(cont_first, StyleManager.STANDART_CORNER_RADIUS);		
	StyleManager.setShadow(cont_first, 
			  this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			  this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));
			
	//"Невидимый" контейнер с событиями
	var cont_last = $("<div></div>").
		attr("id", id + MyControlsFactory.DIVS_TYPES.LAST_CONT).		
		attr("class", "container pointer pie").
		css("top", this._top).
		css("left", this._left).
		css("width", this._width).
		css("height", this._height).			
		hover(function(){			
			if (!_this._checked){				
				_this.mouseEnterText();			
			}					
			
			_this.mouseEnter();						
						
			if (( _this._enterOutFun!= null) && ( (typeof _this._enterOutFun[0]) == "function")){
					_this._enterOutFun[0]();
				}	
		},function(){	
			if (!_this._checked){						
				_this.mouseOutText();							
			}							
			
			_this.mouseOut();
			
			if (( _this._enterOutFun!= null) && ( (typeof _this._enterOutFun[1]) == "function")){
					_this._enterOutFun[1]();
				}					
		}).
		mousedown(function(){						
			_this.mouseClick();	
					
			_this._do();				
		});
	
	StyleManager.setBGOpacity(cont_last, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 StyleManager.TRANSPARENT_OPACITY);					      
	StyleManager.setRadius(cont_last, StyleManager.STANDART_CORNER_RADIUS);	
	
	return [cont_first, check_box_cont, cont_last];
}

//Установить значение
MyControlsFactory.CheckBox.prototype.setValue = function(value){
	var dom = this.getJQUERYDOM();
	
	dom[1].find(".checkBoxText").text(value);
}

//Получить значение
MyControlsFactory.CheckBox.prototype.getValue = function(){
	var dom = this.getJQUERYDOM();
	
	return dom[1].find(".checkBoxText").text();
}

//Установить статус CheckBox
MyControlsFactory.CheckBox.prototype.setChecked = function(isChecked){
	var dom = this.getJQUERYDOM();
		
	var check_box = dom[1].find("input");
	
	if (isChecked == false){
		check_box.removeAttr("checked");
		
		StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));
	}else{
		check_box.attr("checked", isChecked);
		
		dom[1].removeClass("inputConteiner");	
		dom[1].addClass("inputConteiner_over");
		
		dom[1].find(".checkBoxText").removeClass("inputConteiner");	
		dom[1].find(".checkBoxText").addClass("inputConteiner_over");
		
		StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));	
	}	
}

//Вернуть статус CheckBox
MyControlsFactory.CheckBox.prototype.getChecked = function(isChecked){	
	return this._checked;
}
	
//Событие при клике мыши
MyControlsFactory.CheckBox.prototype.mouseClick = function(){	
	this._checked = !this._checked;	
	
	this.setChecked(this._checked);
}

//Событие при наведении мыши
MyControlsFactory.CheckBox.prototype.mouseEnter = function(opt, time){
	var dom = this.getJQUERYDOM();
		
	dom[1].find(".checkBoxText").addClass("textUnderLine");	
}

//Событие при наведении мыши
MyControlsFactory.CheckBox.prototype.mouseEnterText = function(){
	var dom = this.getJQUERYDOM();
	//checkBoxText
	dom[1].removeClass("inputConteiner");	
	dom[1].addClass("inputConteiner_over");
	
	dom[1].find(".checkBoxText").removeClass("inputConteiner");	
	dom[1].find(".checkBoxText").addClass("inputConteiner_over");	
}

//Событие при уходе мыши
MyControlsFactory.CheckBox.prototype.mouseOut = function(){
	var dom = this.getJQUERYDOM();
	
	dom[1].find(".checkBoxText").removeClass("textUnderLine");	
}

//Событие при уходе мыши
MyControlsFactory.CheckBox.prototype.mouseOutText = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].addClass("inputConteiner");	
	dom[1].removeClass("inputConteiner_over");
	
	dom[1].find(".checkBoxText").removeClass("inputConteiner_over");	
	dom[1].find(".checkBoxText").addClass("inputConteiner");	
}
//************************************************************************************************************************************************
MyControlsFactory.ComboBox = function(opt){
	this._parent_name = opt.parent;
	
	this._columns = opt.columns;
	
	if (this._columns == "undefined"){
		this._columns = 1;
	}
		
	this._options = opt.options;
		
	this._selected = opt.selected;	
	this._keys = [];
	
	if (opt.options == "undefined"){
		this._options = {"key_0": "..."};
	}
	
	var child_count = 0;
	
	for(var i in opt.options){
		child_count++;
	}
	
	if (child_count < this._columns){
		this._columns = child_count;
	}	
	

	for(var i in this._options)
	{
		if (opt.setkey)
		{
			i = opt.setkey;
		}
		if (this._options.hasOwnProperty(i)) {
			this._keys.push(i);
		}
	}

		
	this._childs = [];
	this._childs_panel = null;	
	
	this._isExpand = false;
	this._isShowing = true;
	
	MyControlsFactory.ComboBox.superclass.constructor.apply(this, arguments);			
}

MyControlsFactory.MyControls.extend(MyControlsFactory.ComboBox, MyControlsFactory.MyControls);

//Вернуть имя контрола(убрать впоследствии)
MyControlsFactory.ComboBox.prototype.getName = function() {		
	return StyleManager.STYLE.COMBOBOX;
}

//Создать ComboBox
MyControlsFactory.ComboBox.prototype.create= function() {		
	var _this = this;
		
	var id =MyControlsFactory. MyControls.GUID();
		
	//Контейнер с контентом
	var content = $("<span></span>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.CONTENT ).						
	        attr("class", "textConteiner").	
	        text(this._options[this._keys[0]]).     	       
	        css("top", this._top).
			css("left", this._left).
			css("width", this._width - 10).
			css("height", this._height - 10);	
					
	//"Прозрачный" контейнер	
	var cont_first = $("<div></div>").	
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT).						
			attr("class", "container  pie").
			css("background-color", this._bgColor).	
			css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);	
	
	
	var img = $("<img></img>").
			attr("src", MyControlsFactory.BUFFER_PATH + "img/combobox1_0.png?" + (Math.random()*100).toString()).
			attr("class", "container").
		    css("top", 6).
			css("right", 4);
		
	cont_first.append(img);
	
	StyleManager.setBGOpacity(cont_first, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(cont_first, StyleManager.STANDART_CORNER_RADIUS);		
	StyleManager.setShadow(cont_first, 
			  this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			  this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));
			
	//"Невидимый" контейнер с событиями
	var cont_last = $("<div></div>").
		attr("id", id + MyControlsFactory.DIVS_TYPES.LAST_CONT).		
		attr("class", "container pointer pie").
		css("top", this._top).
		css("left", this._left).
		css("width", this._width).
		css("height", this._height).			
		hover(function(){
			var dom = _this.getJQUERYDOM();
									
			_this.mouseEnter();
			
			if(!_this._isExpand){
				_this.mouseEnterText();
			}				
		},function(){			
			_this.mouseOut();	
			
			if(!_this._isExpand){		
				_this.mouseOutText();
			}														
		}).
		mousedown(function(){						
			_this.mouseClick();								
		}).
		mouseup(function(){									
			//_this.mouseClick();			
		});
	
	StyleManager.setBGOpacity(cont_last, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 StyleManager.TRANSPARENT_OPACITY);					      
	StyleManager.setRadius(cont_last, StyleManager.STANDART_CORNER_RADIUS);	
		
	var options_length = 0;//_.size(this._options);
	
	for(var ii in this._options){
		options_length++;
	}
	
	var this_shift = 2;
	
	var panel_height = options_length * (30 + this_shift) + 7;
		
	var pos_y = this._top + 35;		
		
	var shift_max_index = Math.ceil(options_length / this._columns);
	
	this._childs_panel = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL, 
											       {"parent": this._parent_name,
												   "bgColor": "#AAAAAA",
												   "maximize": false,
												   "pos": [this._top + 30, this._left],
												   "size": [(this._width + 0) * this._columns, shift_max_index * (30 + this_shift) + 7],
												   "minSize": [this._width, 0]});
													 	
	this._childs_panel._loc_offsets = [[30, 0]];		
	
	this._childs_panel.append();
		
	var shift_index = 0;
	var index_loc = 0;	
	var index = 0;
	
	for(var key in this._options){
		var value = this._options[key];
		
		var elem = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
								{"checked": false,
							    "do": function(){							    	
							    		_this.setAllOptionsChecked(this, false);
							    		
							    		var value = this.getValue();
							    		
							    		_this.close();								    									    																			    							    
										_this.setValue(value);	
										
										var key = _this.getKeyByValue(value);
										
										_this._selected({
											"key": key,
											"value": value
										});														    								    																	    								    								    
							    },
							    "enterOutFun": [
							    	function(){},function(){}],
							    "text": value,
							    "pos": [pos_y + index_loc*(30 + this_shift), this._left + 5 + shift_index * (this._width - 5)],
							    "size": [this._width - 10, 30]});
							    
	    this._childs.push(elem);
	    
	    this._childs_panel.addToPanel(elem);	    	   	    	    
	    
	    index++;
	    index_loc++;
	    
	    if (index == shift_max_index){
	    	shift_max_index += shift_max_index;	    	
	    	
	    	shift_index++;	    	
	    	index_loc = 0;
	    }	
	}
		
	return [cont_first, content, cont_last];
}

//Установить опции
MyControlsFactory.ComboBox.prototype.setOptions = function(opt, columns){	
	var _this  = this;
	
	this._columns = columns;
	
	this._options = opt;
	
	this._childs = [];	
	this._keys = [];//_.keys(opt);	
	
	for (var ii in opt){
		
		this._keys.push(ii);
	}
	
	var options_length = 0;//_.size(opt);
	
	for (var key in opt){
		options_length++;
	}
	
	var this_shift = 2;
	
	var panel_height = options_length * (30 + this_shift) + 7;
			
	var shift_max_index = Math.ceil(options_length / this._columns);
	
	if(this._childs_panel == null){
		this._childs_panel.remove();
	}
	
	var pos = this.getCurPos();
	
	var pos_y = pos[0] + 35;		
	
	this._childs_panel = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL, 
							  {"bgColor": "#AAAAAA",
							   "maximize": false,
							   "pos": [pos[0] + 30, pos[1]],
							   "size": [(this._width + 0) * this._columns, shift_max_index * (30 + this_shift) + 7],
							   "minSize": [this._width, 0]});	
	
	this._childs_panel._loc_offsets = [[30, 0]];
			
	var shift_index = 0;
	var index_loc = 0;	
	var index = 0;
	
	for(var key in this._options){
		var value = this._options[key];
		
		var elem = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
								{"parent": this._parent_name,							    
							    "checked": false,
							    "do": function(){							    	
							    		_this.setAllOptionsChecked(this, false);
							    		
							    		var value = this.getValue();
							    		
							    		_this.close();								    									    																			    							    
										_this.setValue(value);	
										
										var key = _this.getKeyByValue(value);
										
										_this._selected({
											"key": key,
											"value": value
										});														    								    																	    								    								    
							    },
							    "enterOutFun": [
							    	function(){},function(){}],
							    "text": value,
							    "pos": [pos_y + index_loc*(30 + this_shift), pos[1] + 5 + shift_index * (this._width - 5)],
							    "size": [this._width - 10, 30]});
							    
	    this._childs.push(elem);
	    
	    this._childs_panel.addToPanel(elem);	    	   	    	    
	    
	    index++;
	    index_loc++;
	    
	    if (index == shift_max_index){
	    	shift_max_index += shift_max_index;	    	
	    	
	    	shift_index++;	    	
	    	index_loc = 0;
	    }
	}
	
	//Добавить панель чайлдов	
	//this.getChildsPanel().append();
	this._childs_panel.append();
	
	for(var ii in this._childs){
		this._childs[ii].append();
	}
	//this._childs_panel.append();
	
	this.getJQUERYDOM()[1].text(this._options[this._keys[0]]);
	
	if(this._isExpand == true){
		var dom = this.getJQUERYDOM();	
		
		dom[0].removeClass("gradient_click");	
		dom[0].removeClass("gradient_over");	
		
		dom[0].find("img").attr("src", MyControlsFactory.BUFFER_PATH + "img/combobox1_0.png?" + (Math.random()*100).toString());	
	
		dom[1].addClass("textConteiner");	
		dom[1].removeClass("textConteiner_over");
		
		this._isExpand = false;
	}	
}

//Вернуть панель чайлдов
MyControlsFactory.ComboBox.prototype.getChildsPanel = function() {
	return this._childs_panel;
}

//Установить текущую позицию элемента
MyControlsFactory.ComboBox.prototype.setCurPos = function(pos) {
	MyControlsFactory.ComboBox.superclass.setCurPos.apply(this, arguments);	
	
	var panel_cont = this.getChildsPanel();
	
	panel_cont.setCurPos(pos);	
}

//Получить ключ
MyControlsFactory.ComboBox.prototype.getKeyByValue = function(val){
	for (var i in this._keys){
		var cur_key = this._keys[i];
		
		if (this._options[cur_key] == val){
			return cur_key;
		}
	}
}

//Закрыть
MyControlsFactory.ComboBox.prototype.close = function(){	
	if (this._isExpand == true){
		var dom = this.getJQUERYDOM();
					    	
		StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));
				 
		dom[0].find("img").attr("src", MyControlsFactory.BUFFER_PATH + "img/combobox1_0.png?" + (Math.random()*100).toString());
								    	
		dom[1].removeClass("textConteiner_over");
		dom[1].addClass("textConteiner");	
				
		this._childs_panel.hide({"time": StyleManager.getAnimationTime()});
										
		this._isExpand = false;	
	}				
}

//Выделить/убрать выделение у полей
MyControlsFactory.ComboBox.prototype.setAllOptionsChecked = function(this_opt, isChecked){
	for(var i in this._childs){
		var cur_opt = this._childs[i];
		
		if (this_opt != cur_opt){								
			cur_opt.setChecked(isChecked);			
		}		
	}
}

//Установить значение
MyControlsFactory.ComboBox.prototype.setValue = function(value){
	var dom = this.getJQUERYDOM();
	
	dom[1].text(value);
}

//Получить значение
MyControlsFactory.ComboBox.prototype.getValue = function(){
	var dom = this.getJQUERYDOM();
	
	return dom[1].text();
}
	
//Событие при клике мыши
MyControlsFactory.ComboBox.prototype.mouseClick = function(opt, time){
	var dom = this.getJQUERYDOM();	
	
	if(this._isExpand == false){		
		StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));
		
		dom[0].find("img").attr("src", MyControlsFactory.BUFFER_PATH + "img/combobox1_1.png?" + (Math.random()*100).toString());
	}else{		
		StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));	
		
		dom[0].find("img").attr("src", MyControlsFactory.BUFFER_PATH + "img/combobox1_0.png?" + (Math.random()*100).toString());	
	}	
	
	if (this._keys.length > 0){
		//Показать/убрать панель с чайлдами
		this.getChildsPanel().toggleShowing({"time": StyleManager.getAnimationTime()});
	}		
	
	this._isExpand = !this._isExpand;	
}

//Событие при наведении мыши
MyControlsFactory.ComboBox.prototype.mouseEnter = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].addClass("textUnderLine");	
}

//Событие при наведении мыши
MyControlsFactory.ComboBox.prototype.mouseEnterText = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].removeClass("textConteiner");	
	dom[1].addClass("textConteiner_over");
	
	StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));	
}

//Событие при уходе мыши
MyControlsFactory.ComboBox.prototype.mouseOut = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].removeClass("textUnderLine");		
}

//Событие при уходе мыши
MyControlsFactory.ComboBox.prototype.mouseOutText = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].addClass("textConteiner");	
	dom[1].removeClass("textConteiner_over");
		
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));
}



//Отобразить ComboBox
MyControlsFactory.ComboBox.prototype.append = function() {						
	MyControlsFactory.ComboBox.superclass.append.apply(this, arguments);
	
	//Добавить панель чайлдов	
	this.getChildsPanel().append();
	
	//Добавить чайлдов
	for(var i in this._childs){
		this._childs[i].append();
	}
}

//Запустить анимацию: убрать с формы
MyControlsFactory.ComboBox.prototype.doAnimateHide = function(opt, time){		
	var _this = this;
	var dom = this.getJQUERYDOM();

	this.getChildsPanel().hide({"time": 0});
		
	for(var i in dom){
		var cur_el = dom[i];
		
		cur_el.animate(
			opt,
			time,
			function(){																					
				_this.hide();					
			}
		);
	}
}

//Запустить анимацию: показать на форме
MyControlsFactory.ComboBox.prototype.doAnimateShow = function(opt, time){
	
	var _this = this;
	var dom = this.getJQUERYDOM();
	
	if (this._isExpand == true){
		this.getChildsPanel().show({"time": 0});
	}
	
	for(var i in dom){
		var cur_el = dom[i];			
		cur_el.show();
	}
		
	for(var i in dom){
		var cur_el = dom[i];
		
		cur_el.animate(
			opt,
			time,
			function(){																					
				_this.show();					
			}
		);
	}
}	

//*********************************************************************************************************************************************************

MyControlsFactory.ProgressBar = function(opt){	
	var _this = this;
	
	this._isMaximize = opt.maximize;		
	this._progress = opt.progress;
	this._call_back = opt.callBack;
	
	this._timer_id = null;		
	
	this._offset = [0, 0];
	
	this._bar      = null;
	this._bar_text = null;
	
	MyControlsFactory.ProgressBar.superclass.constructor.apply(this, arguments);				
}

MyControlsFactory.MyControls.extend(MyControlsFactory.ProgressBar, MyControlsFactory.MyControls);

//Вернуть имя контрола(убрать впоследствии)
MyControlsFactory.ProgressBar.prototype.getName = function() {		
	return StyleManager.STYLE.PROGRESS_BAR;
}

//Создать панель
MyControlsFactory.ProgressBar.prototype.create = function(opt) {	
	var _this = this;
		
	var id = MyControlsFactory.MyControls.GUID();
	
	var panel = $("<div></div>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT ).									     
	        attr("class", "panel pie").	     	       
	        css("background-color", this._bgColor).		
	        css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height).
			toggle(function() {
				//_this.hide({"time": 665});
			}, function() {
			  	//_this.show({"time": 655});
			});						
		
	StyleManager.setBGOpacity(panel, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      
	StyleManager.setRadius(panel, StyleManager.STANDART_CORNER_RADIUS);	
	StyleManager.setShadow( panel, 
			   this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			   this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));
	
	this._bar_text = $("<div></div>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT ).									     
	        attr("class", "bar_text pie").	     	       
	        css("background-color", "transparent").			       
			css("width", "auto").
			css("height", "auto").
			toggle(function() {
				//_this.hide({"time": 665});
			}, function() {
			  	//_this.show({"time": 655});
			}).text(this._progress + "%");	
			
	//var bar_color = this.getStealValue(StyleManager.STYLE_NAMES.COLOR_BAR);
	
	var bar = $("<div></div>").											     
	        attr("class", "bar pie").	
	        //css("background-color", bar_color).		     	       
	        css("top", 2).
			css("left", 1).
			css("width", this._progress * ( (this._width - 2) / 100)).
			css("height", this._height - 4).
			toggle(function() {
				//_this.hide({"time": 665});
			}, function() {
			  	//_this.show({"time": 655});
			});	
	
	this._bar = bar;
	
	StyleManager.setRadius( bar, StyleManager.STANDART_CORNER_RADIUS);	
	StyleManager.setShadow( bar, 
			   this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			   this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));
	StyleManager.setGradient(bar, 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));	
						   
	panel.append(bar);
	panel.append(this._bar_text);
	
	return [panel];		
}

//Добавить прогресс к текущему
MyControlsFactory.ProgressBar.prototype.addToProgress = function(opt) {
	var shag_progress = opt.progress;
	
	var cur_progress = this._progress + shag_progress;

	if (cur_progress < 0){cur_progress = 0;}
	if (cur_progress > 100){cur_progress = 100;}
	
	opt.progress = cur_progress;
	
	this.changeProgress(opt);
}

//Обнулить прогресс
MyControlsFactory.ProgressBar.prototype.clear = function(opt) {
	this.changeProgress({"progress": 0});
}

//Изменить прогресс
MyControlsFactory.ProgressBar.prototype.changeProgress = function(opt) {
	var _this = this;
	
	var cur_progress = opt.progress;
	
	/*var change_progress_period = 50;	
	var change_progress_count = ~~(opt.time / change_progress_period);
	
	var shift_progress = cur_progress - _this._progress;
	
	var d_shift_progress = (shift_progress / change_progress_count);
			
	var new_width = cur_progress * ( (this._width - 2) / 100);
	*/
	
	var new_width = cur_progress * ( (this._width - 2) / 100);
	
	_this._bar_text.text( ~~cur_progress + "%");
	this._bar.css("width", new_width);
	
	_this._progress = cur_progress;
							
	_this._call_back(_this._progress);
}
//*********************************************************************************************************************************************************************************
MyControlsFactory.ScrollPanel = function(opt){	
	this._isMaximize = opt.maximize;	
	this._isDraggable = opt.draggable;
	
	this._progress = 0;
	this._old_progress = 0;
	
	this._scroll_panel = null;
	
	//this._modal_state = false;
	//this._loadingWaiting_state = false;
	
	this._scroll_koeff = 1;
	
	this._childs = [];
	this._childs_pos = [];
	this._childs_shift = null;
	
	this._old_z_index = 0;
	
	this._height_shift  = 3;
	this._width_shift  = 5;
		
	this._child_cur_pos = [this._width_shift, 
						   this._height_shift];	
		
	this._childs_shifts = [];	
	this._offset = [0, 0];
	
	this._minWidth  = opt.minSize[0];
	this._minHeight = opt.minSize[1];
	
	MyControlsFactory.ScrollPanel.superclass.constructor.apply(this, arguments);				
}

MyControlsFactory.MyControls.extend(MyControlsFactory.ScrollPanel, MyControlsFactory.MyControls);

//ернуть имя контрола(убрать впоследствии)
MyControlsFactory.ScrollPanel.prototype.getName = function() {		
	return StyleManager.STYLE.SCROLL_PANEL;
}

//Вернуть Z-index
MyControlsFactory.ScrollPanel.prototype.getZIndex = function() {
	return this.getJQUERYDOM()[0].css("z-index");	
}

//Установить Z-index
MyControlsFactory.ScrollPanel.prototype.setZIndex = function(z) {
	this._JQUERY_DOM.css("z-index", z);	
	
	for(var i in this._childs){
		var cur_child = this._childs[i];
		
		var parts = cur_child.getJQUERYDOM();
		
		for(var j in parts){
			var cur_el = parts[j];
			
			cur_el.css("z-index", z + 10);	
		}
	}
}

//Установить текущую позицию элемента
MyControlsFactory.ScrollPanel.prototype.setCurPos = function(pos) {	
	MyControlsFactory.ScrollPanel.superclass.setCurPos.apply(this, arguments);
	
	this._scroll_panel.setCurPos(pos);
		          
	for (var i in this._childs_pos){
		var cur_pos = this._childs_pos[this._childs_pos.length - i - 1];
		
		var cur_child_size = this._childs[i].getSize();
				
		cur_pos[0] = -(parseInt(i,10) + 1)*(cur_child_size[1] + this._height_shift) + pos[0]  + this._child_cur_pos[1];
		cur_pos[1] = pos[1]  + this._child_cur_pos[0];
	}
}

//Создать панель
MyControlsFactory.ScrollPanel.prototype.create = function(opt) {	
	var _this = this;
	
	var id = MyControlsFactory.MyControls.GUID();
	
	var panel = $("<div></div>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT ).									     
	        attr("class", "scroll_panel pie").	     	       
	        css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);						
				
	StyleManager.setBGOpacity(panel, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      
	StyleManager.setRadius(panel, StyleManager.STANDART_CORNER_RADIUS);	
	StyleManager.setShadow( panel, 
			   this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			   this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));
	
	var scroll_bufer_color = this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SCROLL);
	
	var scroll_bufer = $("<div></div>").											     
	        attr("class", "scroll_bufer pie").	
	        //css("background-color", scroll_bufer_color).     	       
	        css("top", 2).
			css("right", 2).
			css("width", 15).
			css("height", this._height - 4);	
	
	StyleManager.setRadius(scroll_bufer, StyleManager.STANDART_CORNER_RADIUS);	
	StyleManager.setGradient(scroll_bufer, 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));	
				 
	var bar_color = this.getStealValue(StyleManager.STYLE_NAMES.COLOR_BAR);
	
	var bar = $("<div></div>").											     
	        attr("class", "scroll_bar pie").	
	        //css("background-color", bar_color).     	       
	        css("top", 0).
			css("left", 0).
			css("width", 15).
			css("height", 25);	
	
	StyleManager.setBGOpacity(bar, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR_BAR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));	
				
	bar.draggable({
		cursor: "move",
	    containment:'parent',
		"start": function(event, ui){
			//console.log("start");
		},
		"stop": function(event, ui){
			//console.log("stop");
		},
		"drag": function(event, ui){
			var el = _this.getJQUERYDOM()[0];
			
			var scroll_buffer = el.find(".scroll_bufer");
			var scroll_bar    = el.find(".scroll_bar");
			
			var panel_pos = _this._scroll_panel.getCurPos();
			var panel_size = _this._scroll_panel.getSize();
			
			//_this._progress = (100 / (scroll_buffer.height() - scroll_bar.height())) * (ui.offset.top - scroll_buffer.offset().top)
			_this._progress = ui.offset.top - scroll_buffer.offset().top;
			
			var parent_offset = scroll_buffer.parent().offset();
			
			//console.clear();	
			
			var progress_shift = _this._progress - _this._old_progress;						
			
			var boud = [panel_pos[0], panel_pos[1], panel_size[0], panel_size[1]];
				
			//console.log("boud = " + boud);
								
			for(i in _this._childs){
				var cur_child = _this._childs[i];
				
				var pos = cur_child.getCurPos();
				
				pos[0] = _this._childs_pos[i][0] - _this._scroll_koeff * _this._progress; 
				
				cur_child.setCurPos(pos)
				
				_this._scroll_panel._childs_shifts[i][0] = pos[0] - panel_pos[0];
				
				var in_bound = cur_child.inBound(_this._scroll_panel/*boud*/);
				
				if (in_bound == false){
					cur_child.hide();					
				}else{
					cur_child.show();
				}								
			}
			
			_this._old_progress = _this._progress;			
		}
	});
	
	StyleManager.setRadius(bar, StyleManager.STANDART_CORNER_RADIUS);
	StyleManager.setShadow( bar, 
			   this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			   this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));		
	
	this._scroll_panel = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL, 
											       {"draggable": false,	
											       	"bgColor": "transparent",						  
													 "pos": [this._top + 2, this._left + 2],
													 "maximize": true,
													 "size": [this._width    - 4 - 2 - 15, this._height - 4],
													 "minSize": [this._width - 4 - 2 - 15, this._height - 4]});
	
	this._loc_offsets.push([-2, -2]);	
	
	this._scroll_panel.append();
	
	scroll_bufer.append(bar);
	//panel.append(this._scroll_panel.getJQUERYDOM()[0]);		   		
	panel.append(scroll_bufer);
		
	return [panel];		
}

//Отобразить панель с объектами на ней
MyControlsFactory.ScrollPanel.prototype.show = function(opt) {	
	var _this = this;
	
	var childs_shifts = this._childs_shifts;
	
	this.getJQUERYDOM()[0].animate({"width":  this._width,
							  "height": this._height},
							  opt.time,
							  function(){								  						  
								  	if(opt.doAfterShow != undefined){
								  		opt.doAfterShow();	
								  	}							  	
							  });	
						 
	for(var i in this._childs){
		var cur_child = this._childs[i];
		var curpos = cur_child.getCurPos()
		
		var pos = this.getCurPos();
				
		cur_child.doAnimateShow({"top":  pos[0] + childs_shifts[i][0],
						     	"left": pos[1]  + childs_shifts[i][1],
						     	"width": cur_child.getSize()[0]},
					   	     	opt.time);					   	     		
	}	
	
	this._isMaximize = true;					  	
}

//Скрыть панель с объектами на ней
MyControlsFactory.ScrollPanel.prototype.hide = function(opt) {
	
	var _this = this;
				
	var parent_pos = this.getCurPos();	
	
	this.getJQUERYDOM()[0].animate({"width":  this._minWidth,
							  "height": this._minHeight},
							  opt.time,							 
							  function(){								  						  
								  	if(opt.doAfterHide != undefined){
										opt.doAfterHide();	
									}															  	
							  });
	
	for(var i in this._childs){
		var cur_child = this._childs[i];		
		
		cur_child.doAnimateHide({"top":  parent_pos[0],
						     	"left": parent_pos[1],
						     	"width": _this._minWidth},
					   	     	opt.time);					   	     		
	}
	
	this._isMaximize = false;
}

//Изменить отображение
MyControlsFactory.ScrollPanel.prototype.toggleShowing = function(opt) {					
	if (this._isMaximize == true){		
		this.hide(opt);
	} else{		
		this.show(opt);
	}	
}

//Удалить
MyControlsFactory.ScrollPanel.prototype.remove = function(opt) {	
	MyControlsFactory.ScrollPanel.superclass.remove.apply(this, arguments);
	
	this._scroll_panel.remove();
	/*
	for(var i in this._childs){
		var cur_child = this._childs[i];		
		
		cur_child.remove();					   	     		
	}*/
}

//Добавить элементы на панель
MyControlsFactory.ScrollPanel.prototype.addToPanel = function(child) {	
	var _this = this;
	
	this._childs.push(child);
					
	child.setCurPos( [this._top  + this._child_cur_pos[1] + this._height_shift, 
				      this._left + this._child_cur_pos[0]] );
	
	this._childs_pos.push([this._top  + this._child_cur_pos[1] + this._height_shift, 
				           this._left + this._child_cur_pos[0]]);
	
	this._scroll_panel.addToPanel(child);
			           
	var boud = this.getBound();
		
	var in_bound = child.inBound(_this._scroll_panel);
				
	if (in_bound == false){
		child.hide();					
	}else{
		child.show();
	}		
	
	this._child_cur_pos[1] += child.getSize()[1] + this._height_shift;
	
	var childs_len = 0;
		
	for (var i in this._childs){		
		var cur_child = this._childs[i];
		
		childs_len += cur_child.getSize()[1] + this._height_shift;		
	}
	
	childs_len += this._height_shift;
	
	var el = _this.getJQUERYDOM()[0];		
		
	var scroll_buffer = el.find(".scroll_bufer");
	var scroll_bar    = el.find(".scroll_bar");
	
	var panrl_size = this._scroll_panel.getSize();
	
	var scroll_buffer = el.find(".scroll_bufer");
	var scroll_bar    = el.find(".scroll_bar");
		
	var scroll_width = 15;
			
	if (childs_len > this._scroll_panel.getSize()[1]){	
		el.css("width", (this._width + 2) + "px");
		
		scroll_buffer.show();
		scroll_bar.show();	
				
		scroll_bar.height(panrl_size[1] * panrl_size[1] / childs_len);
		
		var left_shift  = childs_len - panrl_size[1];
		var right_shift = panrl_size[1] - scroll_bar.height();
		
		this._scroll_koeff = left_shift/right_shift;
	}else{
		scroll_buffer.hide();
		scroll_bar.hide();
		
		el.css("width", (this._width - 15 - 2) + "px");
	}
	
	//console.log(childs_len);
	//console.log(this._scroll_panel.getSize()[1]);
	
	//console.log(this._child_cur_pos);
	//console.log(this._scroll_panel.getSize());
		
	/*
	var this_cur_pos = this.getCurPos();
	var child_cur_pos = child.getCurPos();	
	
	this._childs_shifts.push([
		child_cur_pos[0] - this_cur_pos[0],
		child_cur_pos[1] - this_cur_pos[1]
	]);		
	
	var modal_z_index = this.getZIndex();
	
	if (this._modal_state == true){
		for(var i in child.getJQUERYDOM()){
			var cur_el = child.getJQUERYDOM()[i];
			
			cur_el.css("z-index", modal_z_index + 100);
		}	
	}*/	
}

//Отобразить элемент а форме
MyControlsFactory.ScrollPanel.prototype.append = function() {	
	MyControlsFactory.ScrollPanel.superclass.append.apply(this, arguments);
	
	var _this = this;
	
	var dom = this.getJQUERYDOM();
	
	/*
	if (this._isMaximize == false){	
		this.hide({"time": 0});		
	}	
	
	if (this._isDraggable == true){		
		dom[0].draggable({
			cursor: "move",
			"start": function(event, ui){		
				if (_this._modal_state == false){						
					StyleManager.setBGOpacity( _this.getDOM()[0], 
										       _this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
										       _this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_DRAG ));	
				}					
			},
			"stop": function(event, ui){	
				if (_this._modal_state == false){							
					StyleManager.setBGOpacity( _this.getDOM()[0], 
								  			   _this.getStealValue(StyleManager.STYLE_NAMES.COLOR),  
								  			   _this.getStealValue(StyleManager.STYLE_NAMES.OPACITY ));
				}
				
				var cur_pos  = _this.getCurPos();
						
				for(var i in _this._childs){
					var cur_child       = _this._childs[i];
					var cur_child_shift = _this._childs_shifts[i];
								
					cur_child.setCurPos([
						cur_pos[0] + cur_child_shift[0],
						cur_pos[1] + cur_child_shift[1]
					]);
				}	
			},
			"drag": function(event, ui){					
				var cur_pos  = _this.getCurPos();
									
				for(var i in _this._childs){
					var cur_child       = _this._childs[i];
					var cur_child_shift = _this._childs_shifts[i];
													
					cur_child.setCurPos([
						cur_pos[0] + cur_child_shift[0],
						cur_pos[1] + cur_child_shift[1]
					]);
				}									
			}
		});
	}	*/	
}
//*************************************************************************************************************************************************************
MyControlsFactory.DatePicker = function(opt){	
	MyControlsFactory.DatePicker.superclass.constructor.apply(this, arguments);
}

MyControlsFactory.MyControls.extend(MyControlsFactory.DatePicker, MyControlsFactory.MyControls);

//Вернуть имя контрола(убрать впоследствии)
MyControlsFactory.DatePicker.prototype.getName = function() {		
	return StyleManager.STYLE.DatePicker;
}

//Создать Метку
MyControlsFactory.DatePicker.prototype.create = function() {		
	var _this = this;
		
	var id = MyControlsFactory.MyControls.GUID();
	
	//Контейнер с контентом
	var content = $("<input></input>").
			attr("id", id + MyControlsFactory.DIVS_TYPES.CONTENT ).	
			attr("name", id + MyControlsFactory.DIVS_TYPES.CONTENT ).	
			attr("type", "text").					
	        attr("class", "inputConteiner").	
	        text(this._text).     	       
	        css("top", this._top - 2).
			css("left", this._left).
			css("width", this._width - 10).
			css("height", this._height - 10);	
	
	if (this._save == true){
		var data = MyControlsFactory._styleManager.getState();	
		
		if (data != null){
			content.attr("value", data);
		}	
	}	
	
	this._loc_offsets = [[0, 0], [-2, 0]];
	
	content.datetimepicker();
		
	//"Прозрачный" контейнер	
	var cont_first = $("<div></div>").	
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT).						
			attr("class", "container pie").			
			css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);	
	
	StyleManager.setBGOpacity(cont_first, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(cont_first, StyleManager.STANDART_CORNER_RADIUS);			
			
	return [cont_first, content];
}

//Удалить
MyControlsFactory.DatePicker.prototype.remove = function() {	
	
	if (this._save == true){
		MyControlsFactory._styleManager.saveState(this.value());				
	}
	
	MyControlsFactory.DatePicker.superclass.remove.apply(this, arguments);	
}

//Вернуть значение
MyControlsFactory.DatePicker.prototype.value = function(){			
	return this._JQUERY_DOM[1].attr("value");		
}

//Установить значение
MyControlsFactory.DatePicker.prototype.setValue = function(value){			
	this._JQUERY_DOM[1].attr("value", value);		
}

//Time
MyControlsFactory.DatePicker.prototype.getTime = function(mode){	
	var all_date = this._JQUERY_DOM[1][0].value;
	
	var time = {
			"hour": "00",
			"min": "00"
		}
	
	if (all_date != ""){
		if(mode == 1){
			//
		}else{
			var all_time = all_date.split(" ")[1];
		
			time = all_time.split(":");
			
			time = {
				"hour": time[0],
				"min": time[1]
			}			
		}
	}
				
	return time;		
}

//Date
MyControlsFactory.DatePicker.prototype.getDate = function(mode){		
	var all_date =this._JQUERY_DOM[1][0].value;
	
	var date = {
			"month": "01",
			"day": "01",
			"year": "2013"
		}
	if (all_date != ""){	
		if(mode == 1){
			all_date = all_date.split(" ")[0];
			
			date = all_date.split(".");
			
			date = {
				"month": date[1],
				"day": date[0],
				"year": date[2]
			}
		}else{			
			all_date = all_date.split(" ")[0];
				
			date = all_date.split("/");
				
			date = {
				"month": date[0],
				"day": date[1],
				"year": date[2]
			}						
		}
	}	
	return date;		
}

//Событие при наведении мыши
MyControlsFactory.DatePicker.prototype.mouseEnter = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));	
}

//Событие при уходе мыши
MyControlsFactory.DatePicker.prototype.mouseOut = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));		
}
//***********************************************************************************************************************************
MyControlsFactory.MapBrowser = function(opt){	
		
	this._start_point  = opt.startPoint; 	
	this._zoom       = opt.zoom;
			
	this._click_points = [];
	this._click_points_obj = [];
	
	this._mouse_x = null;
	this._mouse_y = null;
	
	this._offset = [5, 5];
	
	this._map_id = MyControlsFactory.MyControls.GUID();
		
	MyControlsFactory.MapBrowser.superclass.constructor.apply(this, arguments);				
}

MyControlsFactory.MyControls.extend(MyControlsFactory.MapBrowser, MyControlsFactory.MyControls);

//ернуть имя контрола(убрать впоследствии)
MyControlsFactory.MapBrowser.prototype.getName = function() {		
	return StyleManager.STYLE.MAP_BROWSER;
}

//Создать панель
MyControlsFactory.MapBrowser.prototype.create = function(opt) {	
	var _this = this;
	
	var browser = $("<div></div>").
			attr("id", this._map_id ).									     
	        attr("class", "container").	     	       
	        css("top", this._top - 5).
			css("left", this._left - 5).
			css("width", this._width + 10).
			css("height", this._height + 10);						
	
	StyleManager.setBGOpacity(browser, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(browser, StyleManager.STANDART_CORNER_RADIUS);
	
	return [browser];		
}

MyControlsFactory.MapBrowser.prototype.setMap = function() {	
	
	var _this = this;
	
	createFlashMap(document.getElementById(this._map_id), function(map){																												
														map.miniMap.setVisible(false);
														map.allControls.setVisible(false);
														map.miniMap.setOpen(false)
														 
														map.moveTo(32.998306, 43.378731, 6);		
														
														var cross_size_x = 0.07;
														var cross_size_y = 0.05;
														
														map.setHandler("onClick", function(){															
															_this._mouse_x = map.getMouseX();
															_this._mouse_y = map.getMouseY();
															
															_this._click_points.push([_this._mouse_x, _this._mouse_y]);
															
															
															var p_0 = [_this._mouse_x - cross_size_x, _this._mouse_y];
															var p_1 = [_this._mouse_x + cross_size_x, _this._mouse_y];
															
															var p_2 = [_this._mouse_x, _this._mouse_y - cross_size_y];
															var p_3 = [_this._mouse_x, _this._mouse_y + cross_size_y];
															
															
															var obj_0 = _this.drawLine(map, StyleManager.LINE_OPT, p_0, p_1);
															var obj_1 = _this.drawLine(map, StyleManager.LINE_OPT, p_2, p_3);
															
															_this._click_points_obj.push(obj_0);
															_this._click_points_obj.push(obj_1);															
														});			
												});		
}

MyControlsFactory.MapBrowser.prototype.getPoints = function() {	
	return this._click_points;	
}

MyControlsFactory.MapBrowser.prototype.clear = function() {
	for(i in this._click_points_obj){
		this._click_points_obj[i].remove();
	}	
}

MyControlsFactory.MapBrowser.prototype.drawLine = function(map, opt, p0, p1) {		
		var o = map.addObject();
		o.setGeometry({
			"type" : "LINESTRING",
			"coordinates" : [[p0[0], p0[1]], [p1[0], p1[1]]]
		});
		o.setStyle({
			outline : {
				color : opt["penColor"],
				thickness : opt["penThickness"],
				opacity : opt["penOpacity"]
			}
		});
		
		return o;
}

//Нарисовать окружность
MyControlsFactory.MapBrowser.prototype.drawCircle = function(map, opt, p_center, radius) {
	var o = map.addObject();

	o.setCircle(p_center[0], p_center[1], radius);

	o.setStyle({
		outline : {
			color : opt["penColor"],
			thickness : opt["penThickness"],
			opacity : opt["penOpacity"]
		}
	});
	
	return o;
}
//********************************************************************************************************************************************************
//************************************************************************************************************************************************
MyControlsFactory.TextArea = function(opt){	
	this._opt = opt;
	
	this._text = opt.text;			
		
	MyControlsFactory.TextArea.superclass.constructor.apply(this, arguments);		
}

MyControlsFactory.MyControls.extend(MyControlsFactory.TextArea, MyControlsFactory.MyControls);

//ернуть имя контрола(убрать впоследствии)
MyControlsFactory.TextArea.prototype.getName = function() {		
	return StyleManager.STYLE.TEXTAREA;
}

//Создать TextArea
MyControlsFactory.TextArea.prototype.create = function() {	
	var _this = this;
		
	var id = MyControlsFactory.MyControls.GUID();

	//Контейнер с контентом
	var content = $("<textarea ></textarea >").
			attr("id", id + MyControlsFactory.DIVS_TYPES.CONTENT ).			
			attr("name", id + MyControlsFactory.DIVS_TYPES.CONTENT ).	
			//attr("rows", this._opt.rows).	
			//attr("cols", this._opt.cols).			
			attr("value", this._text).
	        attr("class", "text_area").		           	      
	        css("top", this._top).
			css("left", this._left + 5).
			css("width", this._width - 10).
			css("height", this._height - 10).
			hover(function(){
				_this.mouseEnter();
			},function(){
				_this.mouseOut();
			});
	
	this._loc_offsets = [[0,0], [0, 5]];	
		
	//"Прозрачный" контейнер	
	var cont_first = $("<div></div>").	
			attr("id", id + MyControlsFactory.DIVS_TYPES.FIRST_CONT).						
			attr("class", "container pie").			
			css("top", this._top).
			css("left", this._left).
			css("width", this._width).
			css("height", this._height);
			
	StyleManager.setBGOpacity(cont_first, 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));					      	
	StyleManager.setRadius(cont_first, StyleManager.STANDART_CORNER_RADIUS);			
	StyleManager.setShadow(cont_first, 
			  this.getStealValue(StyleManager.STYLE_NAMES.COLOR_SHADOW), 
			  this.getStealValue(StyleManager.STYLE_NAMES.SHADOW_SHIFTS));	
	
	return [cont_first, content];
}

//Событие при наведении мыши
MyControlsFactory.TextArea.prototype.mouseEnter = function(opt, time){
	var dom = this.getJQUERYDOM();
	
	dom[1].removeClass("text_area");	
	dom[1].addClass("text_area_over");	
	
	StyleManager.setGradient(dom[0], 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_START), 
				this.getStealValue(StyleManager.STYLE_NAMES.COLOR_OVER_END), 
				this.getStealValue(StyleManager.STYLE_NAMES.OPACITY_OVER));			
}

//Событие при уходе мыши
MyControlsFactory.TextArea.prototype.mouseOut = function(opt, time){
	var dom = this.getJQUERYDOM();
		
	dom[1].addClass("text_area");	
	dom[1].removeClass("text_area_over");	
	
	StyleManager.setBGOpacity(dom[0], 
				 this.getStealValue(StyleManager.STYLE_NAMES.COLOR), 
				 this.getStealValue(StyleManager.STYLE_NAMES.OPACITY));		
}

//Вернуть значение
MyControlsFactory.TextArea.prototype.value = function(){			
	return this._JQUERY_DOM[1].attr("value");		
}

//Установить значение
MyControlsFactory.TextArea.prototype.setValue = function(val){			
	return this._JQUERY_DOM[1].attr("value", val);		
}