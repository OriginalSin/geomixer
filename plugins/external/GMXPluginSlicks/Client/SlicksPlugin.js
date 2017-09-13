(function($){		
		var DRAW_CIRCLE_OPT = {
			        "penColor": 0x0000ff,
			        "penThickness": 5,
			        "penOpacity": 100
			    }
				
		var DRAW_LINE_OPT = {
				"penColor" : 0xff0000,
				"penThickness" : 2,
				"penOpacity" : 100
		}
		
		var DRAW_LINE_OPT_2 = {
				"penColor" : 0x0000ff,
				"penThickness" : 1,
				"penOpacity" : 100
		}
	    
	    function drawCircle(p_center, radius) {
	        //var p0 = MercatorToLatLng(p_center[0], p_center[1]);
				
			var opt = DRAW_CIRCLE_OPT;
				
	        var o = _map.addObject();
	        o.setCircle(p_center[0], p_center[1], radius);

	        o.setStyle({
	            outline: {
	                color: opt["penColor"],
	                thickness: opt["penThickness"],
	                opacity: opt["penOpacity"]
	            }
	        });
	
	        return o;
	    }
	    
	    function drawLine(opt, p0, p1) {			
			var o = _map.addObject();
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
		
		
	var publicInterface = {
	    pluginName: 'SlicksPlugin', 
	    afterViewer: function(params, map){	 	    
	        MyControlsFactory.MyControls.setParent("flash");		
			
			MyControlsFactory.MyControls.createStealManager({
			name: "My styles",	
			"styles_for_all":	[	
					[StyleManager.STYLE_NAMES.COLOR,            "#387EAA"],	
					[StyleManager.STYLE_NAMES.COLOR_MODAL,      "#CCCCCC"],	
					[StyleManager.STYLE_NAMES.COLOR_OVER_START, "#3F84EC"],
					[StyleManager.STYLE_NAMES.COLOR_OVER_END,   "#004AA8"],			
					[StyleManager.STYLE_NAMES.OPACITY,          0.65],
					[StyleManager.STYLE_NAMES.OPACITY_OVER,     0.85],	
					[StyleManager.STYLE_NAMES.OPACITY_MODAL,    0.90],	
					[StyleManager.STYLE_NAMES.COLOR_SHADOW,     "#666"],			
					[StyleManager.STYLE_NAMES.SHADOW_SHIFTS,    [2,2,2]]
			],
			"styles":
				//Стили для PANEL 
				[[StyleManager.STYLE.PANEL, [
					[StyleManager.STYLE_NAMES.COLOR,            "#387EAA"],							
					[StyleManager.STYLE_NAMES.OPACITY_DRAG,     0.25]]
				],
				//Стили для BUTTON
				[StyleManager.STYLE.BUTTON, [						
					//			
				]],
				//Стили для LABEL
				[StyleManager.STYLE.LABEL, [				
					[StyleManager.STYLE_NAMES.COLOR_OVER,       "#3F84EC"]]
				],
				//Стили для TEXTBOX
				[StyleManager.STYLE.TEXTBOX, [				
					//
				]],
				//Стили для CHECKBOX
				[StyleManager.STYLE.CHECKBOX, [				
					//
				]],
				//Стили для SCROLL_PANEL
				[StyleManager.STYLE.SCROLL_PANEL, [				
					[StyleManager.STYLE_NAMES.COLOR_SCROLL,     "#FF0000"],
					[StyleManager.STYLE_NAMES.COLOR_BAR,        "#00FF00"],
					[StyleManager.STYLE_NAMES.SHADOW_SHIFTS,    [1,1,1]],
					[StyleManager.STYLE_NAMES.COLOR_OVER_START, "#216AC4"],
					[StyleManager.STYLE_NAMES.COLOR_OVER_END,   "#0D2B51"],
					[StyleManager.STYLE_NAMES.COLOR_BAR_START,  "#1F7022"],
					[StyleManager.STYLE_NAMES.COLOR_BAR_END,    "#00FF00"]
				]],
				//Стили для PROGRESS_BAR
				[StyleManager.STYLE.PROGRESS_BAR, [				
					[StyleManager.STYLE_NAMES.COLOR,            "#90B7CF"],
					[StyleManager.STYLE_NAMES.COLOR_BAR,        "#00FF00"],
					[StyleManager.STYLE_NAMES.OPACITY,          0.66],
					[StyleManager.STYLE_NAMES.COLOR_OVER_START, "#00FF00"],
					[StyleManager.STYLE_NAMES.COLOR_OVER_END,   "#1F7022"]
				]],
				//Стили для COMBOBOX
				[StyleManager.STYLE.COMBOBOX, [				
					//
				]]]
			});	
			
	        var panel_all = null;
	        
	        function setOnClickSlicks(){
	        	   		        																					
						var regions_list = null;
			
					    panel_all = CreateGeneralParametersView(map);	
						
						CreateRegionView(panel_all);			
						createSettingsParameters(panel_all);																																	   																																																							
			}
			
			function onCancelKorridor(){	
				map.unfreeze();
				map.setHandlers({ onMouseDown: null, onMouseMove: null, onMouseUp: null });		
				gmxAPI._tools.standart.selectTool('move');
				
				if (panel_all !=null){
					panel_all.remove();				
				}								
			}	
		
			var buff_path = gmxCore.getModulePath("SlicksPlugin");
		
			MyControlsFactory.BUFFER_PATH = buff_path;
		
	        var SlicksTool = {
				'key':             "buffer_tool",
				'activeStyle':     {},
				'regularStyle':    {'paddingLeft': '2px'},
				'regularImageUrl': buff_path + "img/modeling_tool.png",
				'activeImageUrl':  buff_path + "img/modeling_tool_a.png",
				'onClick':         setOnClickSlicks,
				'onCancel': 	   onCancelKorridor,
				'hint': 		   gmxAPI.KOSMOSNIMKI_LOCALIZED("Слики", "Slicks")
			};
		
			gmxAPI._tools.standart.addTool( 'slicksTool', SlicksTool);
	    }
	}	   
	
	gmxCore.addModule('SlicksPlugin', publicInterface,
	{
		css: "css/SlicksPlugin.css",
		init: function(module, path){					
			
			return gmxCore.loadScriptWithCheck([
                {	//MyControlsFactory
                    check: function(){ return false/*(window.MyControlsFactory != undefined)*/; },
                    script: path + "js/MyControlsFactory.js?" + Math.random()
                },
                {   //StyleManager
                    check: function(){ return false/*(window.StyleManager != undefined)*/; },
                    script: path + "js/StyleManager.js?" + Math.random()
                },
                /*{   //CreateSettingsPanelView.js
                    check: function(){ return false; },
                    script: path + "js/CreateSettingsPanelView.js?" + Math.random()
                },*/
                {   //CreateGeneralParametersView.js
                    check: function(){ return false; },
                    script: path + "js/CreateGeneralParametersView.js?" + Math.random()
                },
                {   //CreateRegionView.js
                    check: function(){ return false; },
                    script: path + "js/CreateRegionView.js?" + Math.random()
                },                
                {   //CreateSettingsParameters.js
                    check: function(){ return false },
                    script: path + "js/CreateSettingsParameters.js?" + Math.random()
                }
            ]);
		}
	});
	
})(jQuery);