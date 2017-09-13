
//Стили контролов
StyleManager.BASE_STYLE_PREFIX = "_STYLE_";

StyleManager.STANDART_CORNER_RADIUS = 10;
StyleManager.MAX_COUNT_ELEMENTS    = 8;
StyleManager.ANIMATION_TIME    = 650;
StyleManager.ANIMATION_TIME_IE = 0.0;
StyleManager.TRANSPARENT_OPACITY    = 0.00;

StyleManager.MAP_TYPE = {
	"BALTIC_SEA": "BALTIC_SEA"
}

StyleManager.MAP_BOUND = {
	"BALTIC_SEA": [[26.7187513956875, 40.351788198796385], 
				   [42.25342001190878, 40.351788198796385], 
				   [42.25342001190878, 47.589929803469296], 
				   [26.7187513956875, 47.589929803469296], 
				   [26.7187513956875, 40.351788198796385]]
}

StyleManager.LINE_OPT = {
		"penColor" : 0xff0000,
		"penThickness" : 1,
		"penOpacity" : 100
	}

StyleManager.DRAW_CIRCLE_OPT = {
		"penColor" : 0x0000ff,
		"penThickness" : 3,
		"penOpacity" : 100
}
	
StyleManager.STYLE = {
	PANEL    : "MYPANEL_STYLE_",
	SCROLL_PANEL    : "SCROLL_PANEL_",
	MAP_BROWSER    : "MAP_BROWSER_",
	PROGRESS_BAR    : "PROGRESS_BAR_STYLE_",
	BUTTON   : "BUTTON_STYLE_",
	LABEL    : "LABEL_STYLE_",
	TEXTBOX  : "TEXTBOX_STYLE_",
	TEXTAREA : "TEXTAREA_STYLE_",
	CHECKBOX : "CHECKBOX_STYLE_",
	COMBOBOX : "COMBOBOX_STYLE_"   
}

//Поля стилей
StyleManager.STYLE_NAMES = {
	COLOR             : "COLOR_NORMAL",
	COLOR_TEXT        : "COLOR_TEXT",
	COLOR_SCROLL      : "COLOR_SCROLL",
	COLOR_MODAL       : "COLOR_MODAL",
	COLOR_BAR         : "COLOR_BAR",
	COLOR_SHADOW      : "COLOR_SHADOW",
	COLOR_OVER        : "COLOR_OVER",
	COLOR_OVER_START  : "COLOR_OVER_START",
	COLOR_BAR_START   : "COLOR_BAR_START",
	COLOR_BAR_END     : "COLOR_BAR_END",
	COLOR_OVER_END    : "COLOR_OVER_END",
	COLOR_CLICK_START : "COLOR_CLICK_START",
	COLOR_CLICK_END   : "COLOR_CLICK_END",
	COLOR_DRAG_START  : "COLOR_DRAG_START",
	COLOR_DRAG_END    : "COLOR_DRAG_END",
	OPACITY           : "OPACITY_NORMAL",
	OPACITY_OVER      : "OPACITY_OVER",
	OPACITY_MODAL     : "OPACITY_MODAL",
	OPACITY_DRAG      : "OPACITY_DRAG",
	SHADOW_SHIFTS     : "SHADOW_SHIFTS"
}

//Значение полей по умолчаниюй
StyleManager.STYLE_INIT_VALUES = {
	"COLOR_NORMAL"      : "#111111",
	"COLOR_SCROLL"      : "#CCCCCC",
	"COLOR_MODAL"       : "#CCCCCC",
	"COLOR_TEXT"        : "INIT_VALUE",
	"COLOR_OVER_START"  : "#111111",
	"COLOR_BAR_START"   : "#111111",
	"COLOR_BAR_END"     : "#111111",
	"COLOR_OVER_END"    : "#111111",
	"COLOR_CLICK_START" : "#111111",
	"COLOR_CLICK_END"   : "#111111",
	"COLOR_DRAG_START"  : "#111111",
	"COLOR_DRAG_END"    : "#111111",
	"OPACITY_NORMAL"    : 99.00,
	"OPACITY_OVER"      : 99.00,
	"OPACITY_MODAL"     : 99.00,
	"OPACITY_DRAG"      : 99.00
}

function StyleManager(opt){
	this._name = opt.name;
		
	this._styles_collection = [];
	
	//this._current_elem_pos = 0;
	this._save_object = [];
	
	this._cur_style = {};	
	this._styles_collection_for_all = {};
	
	this.setStyles(opt.styles);	
	this.setStylesForAll(opt.styles_for_all);	
}

//Сохранить параметры
StyleManager.prototype.saveState = function(state){		
	this._save_object.push(state);
	
	//console.log( this._save_object );	
}

//Получить параметры
StyleManager.prototype.getState = function(){	
	if(this._save_object.length == 0){
		return null;
	}
	
	//console.log( this._save_object );
	
	return this._save_object.shift();
}


//Остановить стили
StyleManager.prototype.setStylesForAll = function(styles_for_all){
	var opts = null;
	
	for(var i = 0; i < styles_for_all.length; i++){
		var cur_style = styles_for_all[i];
	
		this._styles_collection_for_all[cur_style[0]] = cur_style[1];
	}	
}

//Вернуть время анимации
StyleManager.getAnimationTime = function(style){
	if (navigator.appVersion.indexOf("MSIE") !== -1){
		return StyleManager.ANIMATION_TIME_IE;
	}
	
	return StyleManager.ANIMATION_TIME;
}

StyleManager.colorToRGB = function(color_16){
	var c_0 = parseInt(color_16.substr(1, 2), 16);
	var c_1 = parseInt(color_16.substr(3, 2), 16);
	var c_2 = parseInt(color_16.substr(5, 2), 16);
	
	return([c_0, c_1, c_2]);
}

//Остановить стили
StyleManager.prototype.setStyles = function(style){
	var opts = null;
	
	for(var i = 0; i < style.length; i++){
		var cur_opt = style[i];
		var control_name = cur_opt[0];
		
		if (control_name != undefined){
			var opts = cur_opt[1];
			
			for(var j = 0; j < opts.length; j++){
				var option = opts[j];
				
				//console.log(option);
				
				var option_name = option[0];
				var option_value = option[1];
				
				if (option_name != undefined){					
					this._cur_style[control_name + option_name] = option_value;
				}									
			}
		}				
	}	
}

StyleManager.prototype.getCurStyle = function(){
	return this._cur_style;
}

//Вернуть значение поля стиля
StyleManager.prototype.getStealValue = function(control_name, style_name){
	var style_for_all_value = this._styles_collection_for_all[style_name];
	var style_value         = this._cur_style[control_name + style_name];
	
	if(style_value == undefined){
		return style_for_all_value;
	}else{
		return style_value;
	}
	
	//return ( style_for_all_value || style_value );
}

//Установка тени
StyleManager.setShadow = function(el, color, shift){	
	
	if (navigator.appVersion.indexOf("MSIE") !== -1){
 		el.css("-webkit-box-shadow", color + " " + shift[0] + "px " + shift[1] + "px " + shift[2] + "px");
		el.css("-moz-box-shadow",    color + " " + shift[0] + "px " + shift[1] + "px " + shift[2] + "px");
		el.css("box-shadow",         color + " " + shift[0] + "px " + shift[1] + "px " + shift[2] + "px");
	}else{
		//var eel = document.getElementById(el.attr("id"));
		//alert(eel);
		//eel.style.filter += "progid:DXImageTransform.Microsoft.MotionBlur(strength=13, direction=310)";
	}
}

//Установка градиента
StyleManager.setGradient = function(el, color_start, color_end, op){	
	if (navigator.appVersion.indexOf("MSIE") !== -1){
		var rgb_s = StyleManager.colorToRGB(color_start);
		var rgb_e = StyleManager.colorToRGB(color_end);
		
		var _color_start = "rgba(" + rgb_s[0]+ ", " + rgb_s[1] + ", " + rgb_s[2] + ", " + op + ")";
		var _color_end   = "rgba(" + rgb_e[0]+ ", " + rgb_e[1] + ", " + rgb_e[2] + ", " + op + ")";
			
		el.css("background",	  "-webkit-gradient(linear, 0 0, 0 bottom, from(" + _color_start + "), to(" + _color_end + "))");
		el.css("background", 	  "-webkit-linear-gradient("                      + _color_start + ", "     + _color_end + ")");
		el.css("background", 	  "-moz-linear-gradient("                         + _color_start + ", "     + _color_end + ")");
		el.css("background", 	  "-ms-linear-gradient("                          + _color_start + ", "     + _color_end + ")");
		el.css("background", 	  "-o-linear-gradient("                           + _color_start + ", "     + _color_end + ")");
		el.css("background",      "linear-gradient("                              + _color_start + ", "     + _color_end + ")");
		el.css("-pie-background", "linear-gradient("                              + _color_start + ", "     + _color_end + ")");	
	}else{
		StyleManager.setBGOpacity(el, color_start, op);	
		/*	
		var eel = document.getElementById(el.attr("id"));
		
		var op_16 = (255 * op / 100).toString(16);
		
		var new_color_start = color_start.replace(/#/g,"");
		var new_color_end   = color_end.replace(/#/g,"");
		
		if (eel.style != null){						
			if(eel.style.filter == ""){
				eel.style.filter += "progid:DXImageTransform.Microsoft.gradient(startColorstr=" + "#" + op_16 + new_color_start + ", endColorstr=" + "#" + op_16 + "00ff00" + ")";
				//eel.style.filter += "progid:DXImageTransform.Microsoft.Shadow(color='#ffoooo', Direction=145, Strength=3)";
				//eel.style.filter += "progid:DXImageTransform.Microsoft.MotionBlur(strength=13, direction=310)";
			}else{
				eel.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr=" +  "#" + op_16 + new_color_end   + ", endColorstr=" + op_16 + new_color_end + ")";
			}
		}	
		*/			
	}
}

//Установить радиус
StyleManager.setRadius = function(el, r){	
	el.css("-webkit-border-radius", r + "px");
	el.css("-moz-border-radius",    r + "px");
	el.css("border-radius",         r + "px");
}

//Установить прозрачность
StyleManager.setBGOpacity = function(el, colors, op){
	var rgb = StyleManager.colorToRGB(colors);
	
	el.css("background",      "rgba(" + rgb[0]+ ", " + rgb[1] + ", " + rgb[2] + ", " + op + ")");
	el.css("-pie-background", "rgba(" + rgb[0]+ ", " + rgb[1] + ", " + rgb[2] + ", " + op + ")");
}
