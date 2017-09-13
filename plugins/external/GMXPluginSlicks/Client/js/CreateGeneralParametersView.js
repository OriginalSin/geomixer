function CreateGeneralParametersView(_map){
	
	var server = "http://images.kosmosnimki.ru/slicks/";
	
	var exps_comboBox = null;
	
	var pid = null;
	
	var timer = null;

	var GEOMETRY_TYPES = {
			"LINE": "LINESTRING",
			"POLYGON": "POLYGON",
			"DOT": "POINT"
		}
		
	var _DRAW_CIRCLE_OPT = {
				"penColor" : 0xff0000,
				"penThickness" : 6,
				"penOpacity" : 70
		}

		var _DRAW_LINE_OPT = {
				"penColor" : 0xff0000,
				"penThickness" : 12,
				"penOpacity" : 70
		}
		
		var _geometry_objects_on_svreen = [];
		var _geometry_buffer_objects    = [];
		//Массив объектов-геометрий. Ключ id	
		var _geometry_objects = {};
	
		function getDotRadius(z){
			var radius = 0;
			
			if (z == 1){radius = 1000000;}
		    if (z == 2){radius = 400000;}
		    if (z == 3){radius = 160000;}
		    if (z == 4){radius = 80000;}
		    if (z == 5){radius = 40000;}
		    if (z == 6){radius = 20000;}
		    if (z == 7){radius = 16000;}
		    if (z == 8){radius = 8000;}
		    if (z == 9){radius = 4000;}
		    if (z == 10){radius = 2000;}
		    if (z == 11){radius = 1200;}
		    if (z == 12){radius = 800;}
		    if (z == 13){radius = 500;}
		    if (z == 14){radius = 400;}
		    if (z == 15){radius = 200;}
		    if (z == 16){radius = 100;}
		    if (z == 17){radius = 50;}
			
			return radius;
		}

		function _drawLine(opt, points) {	
			var o = _map.addObject();
			o.setGeometry({
				"type" : "LINESTRING",
				"coordinates" : points
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

		function _drawCircle(opt, point, radius) {
			var o = _map.addObject();
			o.setCircle(point[0][0], point[0][1], radius);
		
			o.setStyle({
				outline : {
					color : opt["penColor"],
					thickness : opt["penThickness"],
					opacity : opt["penOpacity"]
				}
			});
			
			return o;
		}
		
	//Отобразить геометрию
		function drawGeometryObject(obj){
			var points = getPoints(obj);			
			var type = obj["geometry"]["type"];
			var coords = obj["geometry"]["coordinates"];
		
			var obj = null;
		
			if (type == GEOMETRY_TYPES.LINE){		
				obj = _drawLine( _DRAW_LINE_OPT, points);
			} else if (type == GEOMETRY_TYPES.POLYGON){
				obj = _drawLine( _DRAW_LINE_OPT, points);
			}else if (type == GEOMETRY_TYPES.DOT){				
				var radius = getDotRadius(_map.getZ());
				
				obj = _drawCircle( _DRAW_CIRCLE_OPT, points, radius);				
			} 
			
			return obj;
		}
		
	function getGeometryName(o){
			var ret_name = "";
			var size = "";
			
			var name = o["geometry"]["type"].toString();
			
			if (name == "POLYGON"){
				ret_name = "многоугольник";
				size = getSquare(o.getArea());
			}else if (name == "LINESTRING"){
				ret_name = "линия";
				size = getLength(o.getLength());		
			}else if (name == "POINT"){
				ret_name = "точка";
				size = getPointHMS(o.getCenter());		
			}
			
			return ret_name + size;
		}

		function getPointHMS(coords){
			function gradToHMS(grad){	
				var first = ~~grad;
				var last  = (grad - first);
				
				var pre_minutes = last * 60;	
				var minutes = ~~pre_minutes;
			
				var other_part = pre_minutes - minutes;
				
				var pre_second = other_part * 60;	
				var second = pre_second.toFixed(1);
				
				return first + "°" + minutes + "'" + second + "''";
			}
			
			return " (" + gradToHMS(coords[0]) + " N, " + gradToHMS(coords[1]) + " E" + ")";	
		}

		function getLength(len){	
			var ret_len = "";
			
			if (len >= 1000){
				ret_len = (len / 1000).toFixed(3).toString() + " км.";
			}else{
				ret_len = len.toFixed(3).toString() + " м.";
			}
			
			return " (" + ret_len + ")";
		}

		function getSquare(square){		
			var ret_square = "";
				
			if (square >= 100000){
				ret_square = (square / 1000000).toFixed(2).toString() + " кв. км.";
			}else{
				ret_square = square.toFixed(0).toString() + " кв. м.";
			}
			
			return " (" + ret_square + ")";
		}
		
		//Получить координаты геометрии
		function getPoints(obj){
			
			var points = null;
			
			var type = obj["geometry"]["type"];
			var coords = obj["geometry"]["coordinates"];
			
			if (type == GEOMETRY_TYPES.LINE){
				points = coords;
			} else if (type == GEOMETRY_TYPES.POLYGON){
				points = coords[0];
			}else if (type == GEOMETRY_TYPES.DOT){
				points = [coords];
			} 
			
			return points;
		}

		function getBounds(points){
			var bounds  = [-1, -1, -1, -1];
			
			if (points.length > 0){
				bounds = [ points[0][0], points[0][1], points[0][0], points[0][1] ];
			
				for (i in points){
					var cur_point = points[i];
					
					if (cur_point[0] <= bounds[0]){
						bounds[0]  = cur_point[0];				
					}
					
					if (cur_point[1] >= bounds[1]){
						bounds[1]  = cur_point[1];				
					}
					
					if (cur_point[0] > bounds[2]){
						bounds[2]  = cur_point[0];				
					}
				
					if (cur_point[1] < bounds[3]){
						bounds[3]  = cur_point[1];				
					}
				} 
			}
		
			return bounds;
		}
		
		//Прямоугольник, ограничивающий геометрию
		function getGeometryBounds(obj) {
			
			var points = getPoints(obj);
				
			var bound = getBounds(points);					
				
			return bound;		
		}
		
		
	
	
	
	
	
	
	
	
	
	
	
	var panel_all = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL, 
											       {"draggable": true,							  
													"pos": [40, 120],
								                    "maximize": true,
								                    "size": [460, 520],
								                    "minSize": [0, 0]});																				
			
	panel_all.append();	
	
	var changeRegion_name = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,                    
                    {"text": "Выбрать регион:",
                    "pos": [45, 125],
                    "size": [145, 30]});

    changeRegion_name.append();
    
    
    
    var opts = {"key_0": "нет данных..."};
    
    if (MyControlsFactory.USERS_DATA_ARRAY["regions"] != undefined){
    	opts = MyControlsFactory.USERS_DATA_ARRAY["regions"];
    }
     
    regions_list = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.COMBO_BOX, 
   					{"columns": 3,   					
   					"options": opts,
   					"selected": function(selected){
   						MyControlsFactory.USERS_DATA_ARRAY["regions_current"] = selected.value;
   					},
                    "pos": [45, 300],
                    "size": [170, 30]
                });
    
     if (MyControlsFactory.USERS_DATA_ARRAY["regions"] != undefined){
     	regions_list.setValue(
     		MyControlsFactory.USERS_DATA_ARRAY["regions_current"]
     	);
     }
     	
     	
     	           
    name_click = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
                    {"click": function() {
                    	                    	
                    	panel_all.setWaitingLoadingState(true);	
                    	
                        $.getJSON(server + 'getRegions.ashx?callback=?', function(json) { 
							var files = json.files;
							
							var options = {};
							
							var regions = {};
							
							for(var i in files){
								options['"' + i + '"'] = files[i].name;
								
								regions[files[i].name] = files[i].data;
							}
							
							regions_list.setOptions(options, 3);
							
							MyControlsFactory.USERS_DATA_ARRAY["regions"]        = options; 
							MyControlsFactory.USERS_DATA_ARRAY["regions_coords"] = regions
							
							panel_all.setWaitingLoadingState(false, null);
						});						
                    },
                    "text": "Загрузить",
                    "pos": [45, 475],
                    "size": [100, 30]});

   name_click.append();
   
   

   
   
   
   
   
   
   
   
   
   
   
   
   
   	
	exps_comboBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.COMBO_BOX, 
				   					{"columns": 2,   					
				   					"options": {
				                        "key_0": "нет данных...1"
				                    },
				   					"selected": function(selected){},
				                    "pos": [90, 300],
				                    "size": [185, 30]
				                });
	exps_comboBox.append();
            
    panel_all.addToPanel(exps_comboBox);
            				
	//Загрузить готовыек  результаты
    var load_result_button = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON,
    	{"click": function() {
    		
    		var cur_pos = exps_comboBox.getCurPos();
    		
    		panel_all.setWaitingLoadingState(true);
			
			if (regions_list.getValue() != ""){
				$.getJSON(server + 'getExperiments.ashx?callback=?',  
                        {"name": regions_list.getValue()}).
                         done(function(json) { 
                         	
							var status = json;
							
							var options = {};
							
							for(var i in status){
								options[i] = status[i].name;
							}
							
							exps_comboBox.remove();
							
							exps_comboBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.COMBO_BOX, 
				   					{"columns": 2,   					
				   					"options": options,
				   					"selected": function(selected){					   							   						
				   						timer = setTimeout(function() {
							                isCoordsExist(regions_list.getValue(), selected.value, panel_all);							                
							            }, 1000);							            
				   					},
				                    "pos": [cur_pos[0], cur_pos[1]],
				                    "size": [185, 30]
				                });
				            exps_comboBox.append();
            
            				panel_all.addToPanel(exps_comboBox);
   
							panel_all.setWaitingLoadingState(false, null);
						}).
						fail(function( jqxhr, textStatus, error ) {
						  	var err = textStatus + ', ' + error;
						  	
						  	alert( "Request Failed: " + err);
						  	alert( jqxhr);
						});	
			}			      
        },
        "text": "Загрузить",
        //"isToggle": true,       
        "pos": [90, 490],
        "size": [85, 30]
    });
    load_result_button.append();
    
    
    
    
    
    
    
	 //Значения долготы
	 var startLongitude_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
	 	{"text": "Нач. долгота расчета:",
        "pos": [125, 130],
        "size": [155, 30]
    });
    startLongitude_label.append();
    
    //Значения долготы
    var startLongitude_01_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [125, 290],
        "size": [65, 30]
    });

    startLongitude_01_textBox.append();
    
    var startLongitude_02_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [125, 360],
        "size": [65, 30]
    });

    startLongitude_02_textBox.append();
    
    var startLongitude_03_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [125, 430],
        "size": [65, 30]
    });

    startLongitude_03_textBox.append();
    
    var startLongitude_04_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [125, 500],
        "size": [65, 30]
    });

	startLongitude_04_textBox.append();
	
	var longitudesObj = [
		startLongitude_01_textBox,
		startLongitude_02_textBox,
		startLongitude_03_textBox,
		startLongitude_04_textBox
	];
	
	
	
	
	var startLatitude_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
		{"text": "Нач. широта расчета:",
        "pos": [160, 130],
        "size": [155, 30]
    });
    
    startLatitude_label.append();
    
  	//Значения долготы
    var startLatitude_01_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [160, 290],
        "size": [65, 30]
    });

    startLatitude_01_textBox.append();
    
    var startLatitude_02_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [160, 360],
        "size": [65, 30]
    });

    startLatitude_02_textBox.append();
    
    var startLatitude_03_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [160, 430],
        "size": [65, 30]
    });

    startLatitude_03_textBox.append();
    
    var startLatitude_04_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
    	"save": true,
        "pos": [160, 500],
        "size": [65, 30]
    });

	startLatitude_04_textBox.append();
	
	var latitudesObj = [
		startLatitude_01_textBox,
		startLatitude_02_textBox,
		startLatitude_03_textBox,
		startLatitude_04_textBox
	]
	
	
	 //Нач. дата расчета
    var startDate_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
    	{"text": "Нач. дата расчета:",
        "pos": [195, 130],
        "size": [155, 30]
    });
    
    startDate_label.append();

    var startDate_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.DATE_PICKER, 
    	{"save": true,
    	"pos": [195, 290],
        "size": [120, 30]
    });

    startDate_textBox.append();
    
    var map_brawser = null;
    
    var polygon_opt = {
		"penColor" : 0xff0000,
		"penThickness" : 1,
		"penOpacity" : 88,
		"fillColor" : 0x0000ff,
		"fillOpacity" : 11
	};

	var polygon_opt_2 = {
		"penColor" : 0x0000ff,
		"penThickness" : 1,
		"penOpacity" : 88,
		"fillColor" : 0xff0000,
		"fillOpacity" : 88
	};
	
	function drawCircle(opt, center, radius){
		var circle = _map.addObject(); 
		
		circle.setCircle(center[0], center[1], radius); 
		
		circle.setStyle({outline: { color: opt.penColor, 
									thickness: opt.penThickness, 
									opacity: opt.penOpacity},
                        fill:    {color: opt.fillColor, 
                        	      opacity: opt.fillOpacity}});
                        	      
        return circle;
	}
	
    function drawPolygon(opt, points) {	
		var o = _map.addObject();
		
		o.setGeometry({
			"type" : "POLYGON",
			"coordinates" : points
		});
		o.setStyle({
			outline : {
				color : opt["penColor"],
				thickness : opt["penThickness"],
				opacity : opt["penOpacity"]
			},
			fill : {
				color   : opt["fillColor"],
				opacity : opt["fillOpacity"]
			}
		});
		
		return o;
	}
	
	function inBound(tl, br, p){
		if ( ((p[0] >= tl[0]) && (p[0] <= br[0])) && 
			 ((p[1] <= tl[1]) && (p[1] >= br[1]))){
				return true;
			}
			
		return false;
	}
	
	var current_point = 0;
	
	var pp = null;
	
	var mr_points = [];
	
	var _panel = null;
	var _slideSpisok = null;
	
	   	           
    var set_coords_mode_btn = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
                    {"click": function() {
                    	                    	
                    	console.log("!!!!");
                    	console.log("Выбрать геометрию");
				   								
				   								longitudesObj[0].setValue(""); longitudesObj[1].setValue("");											    	
											    longitudesObj[2].setValue(""); longitudesObj[3].setValue("");
											    												    	
											    latitudesObj[0].setValue(""); latitudesObj[1].setValue("");											    	
											    latitudesObj[2].setValue(""); latitudesObj[3].setValue("");
											    	
				   								var _this = this;
	
												var shag = 35;			
												var i = 0;
												
												var pos = panel_all.getCurPos();
												var size = panel_all.getSize();
												
												var max_obj_count = 8;
												
				   								var geometry_count = 0;
																								
												if( _panel != null){
													_panel.remove();
												}													
												
												_map.drawing.forEachObject(function(o){
													geometry_count++;
												});
												
												if (geometry_count > 0){
														var all_height = (geometry_count + 0)* shag + 5;
		
														if (geometry_count > max_obj_count){
															var all_height = (max_obj_count + 0)* shag + 5;
														}
														
														_panel = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL, 
																				  {"draggable": false,
																				   "maximize": true,
																				   "pos": [pos[0], pos[1] + size[0] + 5],
																				   "size": [340, all_height],
																				   "minSize": [135, 40]});							   
														_panel.append();												
														
														panel_all.addToPanel(_panel);
														
														
														
														var panel_scroll = null;		
			
														if (geometry_count > max_obj_count){
															panel_scroll = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.SCROLL_PANEL, 
																								       {"draggable": false,		
																								        "maximize": true,					  
																										 "pos": [5 + pos[0], pos[1] + size[0] + 5 + 5],
																										 "size": [340 - 10, 
																										 		  max_obj_count*(30 + 4) + 3],
																										 "minSize": [135, 40]});				   		
															panel_scroll.append();
														}
														
														_map.drawing.forEachObject(function(o){		
															var is_obj_added = false;
															
															var obj_id = o["objectId"];
															
															for (index in _geometry_objects_on_svreen){
																var cur_id = _geometry_objects_on_svreen[index];
																
																if (cur_id == obj_id){
																	is_obj_added = true;
																	
																	break;
																}
															}
																	
															if (true){	
																console.log("выводим на экран");
																_geometry_objects_on_svreen.push( obj_id );
																
																var geo_obj = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
																					{"isToggle": true,
																				    "enterOutFun": [
																				    	function(){																					    			
																				    		var obj = o;					    		
																							var obj_id = o.objectId;
																																														
																							var bound   = null;
																							var center  = null;
																							var geo_fon = null;
																							
																							bound   =  getGeometryBounds(obj);
																												    				  
																							center  =  obj.getCenter();	
																																	
																							geo_fon =  drawGeometryObject( obj );
																								
																							_geometry_objects[obj_id] = [ obj, [bound, center, geo_fon ] ];
																							
																							//_this._map.zoomToExtent(bound[0], bound[1], bound[2], bound[3]);
																							_map.slideTo(center[0], center[1], _map.getZ());
																				    	},function(){							    		
																							var obj_id = o.objectId;
																							
																							data = _geometry_objects[obj_id][1];
																												
																							data[2].setVisible(false);							    	
																				    }],
																				    "click": function(){																				    	
																				    	var obj = o;
																				    	
																				    	if (obj["geometry"]["type"] == GEOMETRY_TYPES.DOT){
																				    		bound = getGeometryBounds(obj);
																				    	
																					    	var coords = obj["geometry"]["coordinates"];
												    																					    	
																					    	for(var i = 0; i < 1; i++){
																					    		var cur_lng = longitudesObj[i];
																					    		var cur_lat = latitudesObj[i];
																					    		
																					    		cur_lng.setValue(coords[0]);
																					    		cur_lat.setValue(coords[1]);
																					    	}
																				    	}else{
																				    		bound = getGeometryBounds(obj);
																				    	
																					    	var coords = [
																					    		[bound[0], bound[1]],
																					    		[bound[2], bound[1]],
																					    		[bound[2], bound[3]],
																					    		[bound[0], bound[3]]
																					    	];
												    																					    	
																					    	for(var i = 0; i < 4; i++){
																					    		var cur_lng = longitudesObj[i];
																					    		var cur_lat = latitudesObj[i];
																					    		
																					    		cur_lng.setValue(coords[i][0]);
																					    		cur_lat.setValue(coords[i][1]);
																					    	}
																				    	}																				    																					    
																			    		if( _panel != null){
																			    			var obj_id = o.objectId;
																							dataPoint = _geometry_objects[obj_id][1];
																							dataPoint[2].setVisible(false);			

																							_panel.remove();
																						}	
																						
																					
																				    },
																				    "text": getGeometryName(o),
																				    "pos": [5 + pos[0] + i*shag, 
																				    	    pos[1] + size[0] + 5 + 5],
																				    "size": [295, 30]});
																
																geo_obj.append();
																
																if (panel_scroll == null){							
																	//panel_all.addToPanel(geo_obj);	
																	_panel.addToPanel(geo_obj);	
																}else{
																	//panel_scroll.addToPanel(geo_obj);
																	panel_scroll.addToPanel(geo_obj);
																}							    											
															}	
															
															i++;			
													});	
													
													if (panel_scroll != null){
														panel_all.addToPanel(panel_scroll);
														
														i = max_obj_count;
													}
												}
                    },
                    "text": "Выбрать геометрию",
                    "pos": [195, 415],
					"size": [160, 30]});

    set_coords_mode_btn.append();
   
 	           	
    //Кон. дата расчета
    var endDate_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
    	{"text": "Кон. дата расчета:",
        "pos": [230, 130],
        "size": [155, 30]
    });

    endDate_label.append();

    var endDate_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.DATE_PICKER, 
    	{"save": true,
    	"pos": [230, 290],
        "size": [120, 30]
    });
    endDate_textBox.append();
    
    
    
    //Шаг расчета
    var shift_calc_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
    	{"text": "Шаг расчета(м.):",
        "pos": [265, 130],
        "size": [155, 30]
    });

    shift_calc_label.append();

    //Шаг расчета
    var shift_calc_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "1.0",
        "pos": [265, 290],
        "size": [45, 30]
    });

    shift_calc_textBox.append();
    
    
    
    //Название эксперимента
    var exp_name_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
    	{"text": "Наз-ие эксперимента:",
        "pos": [300, 130],
        "size": [155, 30]
    });
    exp_name_label.append();

    //Название эксперимента
    var exp_name_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "12345",
        "pos": [300, 290],
        "size": [145, 30]
    });
    exp_name_textBox.append();
    
    
    var exper_name_val = null;
    
    //Описание эксперимента
    var about_button = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON,
    	{"click": function() {
    		var cur_pos = this.getCurPos();
    		
    		var dom = this.getJQUERYDOM();	
    		
			if (exper_name_val == null){
				
				dom[1].text("Стереть");
				
				exper_name_val = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_AREA, 
													{"text": "",
													 "rows": 3,
													 "cols": 5,
											    	 "pos": [cur_pos[0] + 35, cur_pos[1] - 40],
        											 "size": [170, 135]});
	        	exper_name_val.append();
	        	
	        	panel_all.addToPanel(exper_name_val);
			}else{
				dom[1].text("Задать описание");
				
				exper_name_val.remove();
				
				exper_name_val = null;
			}            
        },
        "text": "Задать описание",
        "isToggle": true,
        "pos": [300, 445],
        "size": [120, 30]
    });
    about_button.append();
    
    //Обр-ый расчет
    var isBack_calc_checkBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
    	{"checked": false,
    	"save": true,
        "do": function() {
            //createRegion_panel.toggleShowing({ "time": 655 });
        },
        "text": "Обр-ый расчет (V - да)",
        "pos": [335, 130],
        "size": [250, 30]
    });

    isBack_calc_checkBox.append();

    //Учит-ть дрейфовые течения
    var isDreyf_checkBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
    	{"checked": true,
    	"save": true,
        "do": function() {
            //createRegion_panel.toggleShowing({ "time": 655 });
        },
        "text": "Учит-ть дрейфовые течения",
        "pos": [370, 130],
        "size": [250, 30]
    });

    isDreyf_checkBox.append();
    
    
    
    //Учит-ть дрейфовые течения
    var isGeostrof_checkBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
    	{"checked": true,
    	"save": true,
        "do": function() {
            //createRegion_panel.toggleShowing({ "time": 655 });
        },
        "text": "Учит-ть геострофические течения",
        "pos": [405, 130],
        "size": [270, 30]
    });

    isGeostrof_checkBox.append();

    //Постоянный источник
    var isConst_source_checkBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
    	{"checked": false,
    	"save": true,
        "do": function() {
            //createRegion_panel.toggleShowing({ "time": 655 });
        },
        "text": "Постоянный источник",
        "pos": [440, 130],
        "size": [270, 30]
    });
    
    isConst_source_checkBox.append();
    
    
    
    //ok Button
    start_click = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
    	{"click": function() {
    		
    		if ( _panel != null){
    			_panel.remove();
    		}
    		
    		if (pp != null){
    			pp.remove();
    			
    			pp = null;
    			
    			for(i in mr_points){
					mr_points[i].remove();
				}
				
				mr_points = [];
				
				//_map.unfreeze();
				_map.setHandlers({ onClick: null, onMouseMove: null});			
    		}
    		
            var startDate = startDate_textBox.getDate(1);
            var startTime = startDate_textBox.getTime();

            var endDate = endDate_textBox.getDate(1);
            var endTime = endDate_textBox.getTime();

            var start_long = "";

            if (startLongitude_01_textBox.value() != "") {
                start_long += startLongitude_01_textBox.value() + " ";
            }
            if (startLongitude_02_textBox.value() != "") {
                start_long += startLongitude_02_textBox.value() + " ";
            }
            if (startLongitude_03_textBox.value() != "") {
                start_long += startLongitude_03_textBox.value() + " ";
            }
            if (startLongitude_04_textBox.value() != "") {
                start_long += startLongitude_04_textBox.value() + " ";
            }

            var start_lat = "";

            if (startLatitude_01_textBox.value() != "") {
                start_lat += startLatitude_01_textBox.value() + " ";
            }
            if (startLatitude_02_textBox.value() != "") {
                start_lat += startLatitude_02_textBox.value() + " ";
            }
            if (startLatitude_03_textBox.value() != "") {
                start_lat += startLatitude_03_textBox.value() + " ";
            }
            if (startLatitude_04_textBox.value() != "") {
                start_lat += startLatitude_04_textBox.value() + " ";
            }

			var date_now = Date.now();

			var name         = exp_name_textBox.value() + "_" + date_now;
			var name_serch   = exp_name_textBox.value().substr(1, exp_name_textBox.value().length) + "_" + date_now;
           
            var postfix = (isBack_calc_checkBox.getChecked() == true ? "_b" : "");
           
            //name += postfix;
            name_serch += postfix;
           
            var data = "";
			
            data += "Район" + "~";
            data += regions_list.getValue() + "~";
            data += "Н" + "~";
            data += "x0 " + start_long + "~";
            
            data += "На" + "~";
            data += "y0 " + start_lat + "~";	
            		
            data += "Наа" + "~";
            data += "d0 " + startDate.year + " " +
                                 startDate.month + " " +
                                 startDate.day + " " +
                                 startTime.hour + " " +
                                 startTime.min + " " +
                                 "00" + "~";
						
            data += "Кон" + "~";
            data += "de " + endDate.year + " " +
                                 endDate.month + " " +
                                 endDate.day + " " +
                                 endTime.hour + " " +
                                 endTime.min + " " +
                                 "00" + "~";
			
            data += "Шаг" + "~";
            data += "dd " + shift_calc_textBox.value() + "~";

            data += "Коэ" + "~";
            data += "KD " + wind_dreyf_textBox.value() + "~";

            data += "Уий" + "~";
            data += "dt " + angl_dreyf_textBox.value() + "~";

            data += "Коа" + "~";
            data += "ll " + turbulent_textBox.value() + "~";

            data += "Наз" + "~";
            data += "NE " + name + "~";
			
            data += "На" + "~";
            data += "zz " + (isBack_calc_checkBox.getChecked() == true ? "-1" : "1") + "~";
		
            data += "Уч" + "~";
            data += (isDreyf_checkBox.getChecked() == true ? "1" : "0") + "~";

            data += "Уй" + "~";
            data += (isGeostrof_checkBox.getChecked() == true ? "1" : "0") + "~";

            data += "Пик" + "~";
            data += (isConst_source_checkBox.getChecked() == true ? "1" : "0") + "~";

            data += "Сти" + "~";
            data += "0" + "~";

            data += "Выи" + "~";
            data += "0" + "~";
						
			panel_all.setWaitingLoadingState(true, {"message": "Подождите - идет загрузка...",
											    	"stop_fun": function(){											    			
											    			console.log("**********_pid = " + pid); 
											    			
											    			if (pid != null){
											    				$.getJSON(server + 'StopPrognose.ashx?callback=?',  
										                        {"pid": pid}).
										                         done(function(json) { 
										                         	console.log("done");
										                         	
																	console.log(json);
																	
																	clearTimeout(timer);
																}).
																fail(function( jqxhr, textStatus, error ) {
																  	var err = textStatus + ', ' + error;
																  	alert( "Request Failed: " + err);
																  	alert( jqxhr);
																});	
											    			}											    												    		
											    		}
											    	});
											    	
			//console.log("data = " + data + ", data len = " + data.length);
			
			//console.log("name = " + name);
			
			/*
			timer = setTimeout(function() {
						                //isCoordsExist(regions_list.getValue(), name, panel_all);
						                isCoordsExist("BlackSea", "2345_1367229812834", panel_all);
						                //isCoordsExist("BlackSea", "2345_1367228944391", panel_all);
						            }, 1000);
			*/			            
			  			
			//console.log('server + saveParams.ashx?callback=?');
			
			var description = "";
			 
			if (exper_name_val != null){
				description = exper_name_val.value();				
			} 
			  
			//console.log("description = " + description);
			  	    	
			$.getJSON(server + 'saveParams.ashx?callback=?',  
                        {"data": data}).
                         done(function(json){
                         	                    	                        	                         	                        
							if (json.message == ""){
								$.getJSON(server + 'startPrognose.ashx?callback=?', {
									"name": name_serch,
									"description": description
								}).  
		                        done(function(json){ 			                        	
		                        	
		                        	pid = json.data;
		                        			                        			                        	
		                         	if (json.error == ""){
		                         		timer = setTimeout(function() {
							                isCoordsExist(regions_list.getValue(), name_serch, panel_all);
							            }, 5000); 
		                         	}else{
		                         		alert(json.error);
		                         	}	                         	          
								});								
							}												
						}).fail(function( jqxhr, textStatus, error ) {
						  	var err = textStatus + ', ' + error;
						  	
						  	alert( "Request Failed: " + err);
						  	alert( jqxhr);
						});			
        },
        "text": "Старт прогноза",
        "pos": [520, 135],
        "size": [125, 30]
    });    
    start_click.append();
    
    var save_sgape_results = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
                    {"click": function() {
                    	               				        
					        var objectsByType = {};
							var markerIdx = 1;	        	
					        var type = "POINT";
					        
					        objectsByType[type] = [];
				        			        	
                   			for(var i in MyControlsFactory.USERS_DATA){                   			
								var ret = MyControlsFactory.USERS_DATA[i];
                                
                                var data = ret.properties.data;
                                var dateStr = $.datepicker.formatDate('yy.mm.dd', new Date(data.years, data.months-1, data.days)) + ' ' + data.hours + ":00:00";
								
								objectsByType[type].push({ 
									"geometry": {
										"type":"POINT",
										"coordinates":ret.properties.data.coords
									}, 
									"properties": {
                                        date: dateStr,
                                        elpsDays: data._days,
                                        elpsHours: data._hours
                                    }
								});
							}
				        	
				        	sendCrossDomainPostRequest(serverBase + "Shapefile.ashx", {
					            points: JSON.stringify(objectsByType[type])
					        });
                    },
                    "text": "Сохранить Shape-файл",
                    "pos": [520, 270],
        			"size": [150, 30]
	});
   	save_sgape_results.append();
   	
    var delete_results = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
                    {"click": function() {
                   		for(var i in MyControlsFactory.USERS_DATA){
                   			//obj.properties.balloon
                   			var cur_obj = MyControlsFactory.USERS_DATA[i];
                   			
                   			if (cur_obj.properties.balloon != undefined){
                   				cur_obj.properties.balloon.remove();
                   			}
                   			
                   			cur_obj.remove();
                   		}
                        MyControlsFactory.USERS_DATA = [];
                    },
                    "text": "Удалить результаты",
                    "pos": [520, 430],
        			"size": [140, 30]
	});
   	delete_results.append();
    
    
    
    
    
    regions_list.append();
              
    panel_all.addToPanel(load_result_button);
    //Longitude
    panel_all.addToPanel(startLongitude_label);
    panel_all.addToPanel(startLongitude_01_textBox);
    panel_all.addToPanel(startLongitude_02_textBox);
    panel_all.addToPanel(startLongitude_03_textBox);
    panel_all.addToPanel(startLongitude_04_textBox);

    //Latitude
    panel_all.addToPanel(startLatitude_label);
    panel_all.addToPanel(startLatitude_01_textBox);
    panel_all.addToPanel(startLatitude_02_textBox);
    panel_all.addToPanel(startLatitude_03_textBox);
    panel_all.addToPanel(startLatitude_04_textBox);
    
    //Date
    panel_all.addToPanel(startDate_label);
    panel_all.addToPanel(startDate_textBox);
    panel_all.addToPanel(endDate_label);
    panel_all.addToPanel(endDate_textBox);
    
    //set_coords_mode
    // panel_all.addToPanel(set_coords_mode);
    panel_all.addToPanel(set_coords_mode_btn);
    
    //shift_calc
    panel_all.addToPanel(shift_calc_label);
    panel_all.addToPanel(shift_calc_textBox);

    //exp_name
    panel_all.addToPanel(exp_name_label);
    panel_all.addToPanel(exp_name_textBox);

	//exp about
	panel_all.addToPanel(about_button);
    //checkBox
    panel_all.addToPanel(isBack_calc_checkBox);
    panel_all.addToPanel(isDreyf_checkBox);
    panel_all.addToPanel(isGeostrof_checkBox);
    panel_all.addToPanel(isConst_source_checkBox);

    //Button
    panel_all.addToPanel(start_click);
        
    panel_all.addToPanel(changeRegion_name);
    panel_all.addToPanel(regions_list);
    
    panel_all.addToPanel(name_click);
   
   	panel_all.addToPanel(save_sgape_results);
   	
    panel_all.addToPanel(delete_results);
    function isCoordsExist(folder, name, panel_all){
	    	var DRAW_LINE_OPT = {
					"penColor" : 0xff0000,
					"penThickness" : 4,
					"penOpacity" : 77
			}
		
			//Нарисовать линию
			function drawLongLine(opt, points) {				
				var o = _map.addObject();
				o.setGeometry({
					"type" : "LINESTRING",
					"coordinates" : points
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

			var server = "http://images.kosmosnimki.ru/slicks/";
			
			console.log("isCoordsExist folder = " + folder + ", name = " + name);
			
			$.getJSON(server + 'isCalculateEnd.ashx?callback=?',  
                        {"folder": folder,
                         "name"  : name}).
                         done(function(json) {                          	
                         	if(json.message == "True"){
                         		clearTimeout(timer);
                         		
                         		//console.log('getCoords.ashx?callback=?');
                         		
                         		$.getJSON(server + 'getCoords.ashx?callback=?',  
		                        {"name": name,
		                         "folder": folder}).
		                         done(function(json) { 		                         	
		                         	//console.log('coordinates a loaded!!!');
		                         	
									panel_all.setWaitingLoadingState(false, null);
									
									var coords = [];																		
									
									var lines = json.coords.split("~");
									
								    for (var i in lines) {
								        var cur_line = lines[i];
								
								        var params = cur_line.split("#");
								
								        coords.push([parseFloat(params[3], 10), 
								        			 parseFloat(params[4], 10), 
								        			 parseFloat(params[5], 10), 
								        			 parseFloat(params[6], 10), 
								        			 parseFloat(params[7], 10),
								        			 parseFloat(params[2], 10),
								        			 parseFloat(params[1], 10),
								        			 parseFloat(params[0], 10)]);
								    }
																	
									var new_coords = {};
									var keys = [];
									
									var line_len = 0;
									
									for (var i = 0; i < coords.length; i++) {
																					
										var key = coords[i][5] + "_" + coords[i][0];
																																														
										if(!new_coords.hasOwnProperty(key)){											
											new_coords[key] = [];
											
											new_coords[key].push( [coords[i][2], coords[i][3]] );
											
											line_len = 1;	
																																									
										}else{
											new_coords[key].push( [coords[i][2], coords[i][3]] );
											
											line_len++;											
										}																			
									}									
									
									var o = null;
									
									for (var i = 0; i < coords.length; i++) {
                                        
                                        var props = {
                                            data: {
                                                coords: [coords[i][2], coords[i][3]],
                                                hours:  coords[i][0],
                                                days:   coords[i][5],
                                                months: coords[i][6],
                                                years:  coords[i][7],
                                                _hours: coords[i][0] - coords[0][0],
                                                _days:  coords[i][5] - coords[0][5],
                                            },
                                            visible: false,
                                            balloon: null
                                        };
                                        
								    	o = _map.addObject(
                                            {type: "POINT", coordinates: [coords[i][2], coords[i][3]]},
                                            props
                                        );
										//o.setPoint(coords[i][2], coords[i][3]);
										
										if (i < line_len){
											o.setStyle({
												marker: { size: 3 },
												outline: { color: 0xff0000, thickness: 2 },
												label: { size: 12, color: 0xff00ff, haloColor: 0xffffff }
											});
											
											//o.setLabel("Старт");
										}else{
											o.setStyle({
												marker: { size: 3 },
												outline: { color: 0x0000ff, thickness: 2 },
												label: { size: 12, color: 0xff00ff, haloColor: 0xffffff }
											});
										}
																				
										o.setHandler("onClick", function(obj){

											if  (MyControlsFactory.OPENED_BALOONS) {
												for (var i = MyControlsFactory.OPENED_BALOONS.length - 1; i >= 0; i--) {
													MyControlsFactory.OPENED_BALOONS[i].properties.balloon.remove();
												};
												MyControlsFactory.OPENED_BALOONS = [];
											}
											else
											{
												MyControlsFactory.OPENED_BALOONS = [];
											}
											if ((obj.properties.visible == false) || (!obj.properties.balloon.isVisible)){
												var coords = obj.getGeometry().coordinates;
                                                
                                                var data = obj.properties.data;
                                                var dateStr = $.datepicker.formatDate('yy.mm.dd', new Date(data.years, data.months-1, data.days)) + ' ' + data.hours + ":00:00";
												obj.properties.balloon = _map.addBalloon();
												obj.properties.balloon.setPoint(coords[0], coords[1]);
												obj.properties.balloon.div.innerHTML = 
													"<pre style='color: blue'>Время моделирования: </pre>" + dateStr + "<br>" + 
													// "<span>Час: </span><span>"   + obj.properties.data.hours + "</span><br>" + 
													// "<span>День: </span><span>"  + obj.properties.data.days + "</span><br>" + 
													// "<span>Месяц: </span><span>" + obj.properties.data.months + "</span><br>" + 
													// "<span>Год: </span><span>"   + obj.properties.data.years + "</span><br><br>" + 
													"<pre style='color: blue'>Прошло с начала моделирования:</pre>" + 
													"<span>Часов: </span><span>"       + obj.properties.data._hours + "</span><br>" + 
													"<span>Дней: </span><span>"        + obj.properties.data._days + "</span><br>";
													
												obj.properties.balloon.resize();
												
												obj.properties.visible = true;
												MyControlsFactory.OPENED_BALOONS.push(obj);	
											}
											else{
												
												obj.properties.balloon.remove();
                                                obj.properties.balloon = null;
												obj.properties.visible = false;
											}
										});
										MyControlsFactory.USERS_DATA.push(o);										
									}
														    
								    _map.slideTo(coords[0][2], coords[0][3], _map.getZ());
								    
								    panel_all.remove();
								    
								    gmxAPI._tools.standart.selectTool('move');
								});	                         		
                         	}							
						 }).
						 fail(function(jqxhr, textStatus, error){
						 	var err = textStatus + ', ' + error;
  							
  							alert( "Request Failed: " + err);
						 });	
						
			timer = setTimeout(function() {				
				isCoordsExist(folder, name, panel_all);
			}, 5000);
	}
	
	return panel_all;
}


		
