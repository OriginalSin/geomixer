//var createRegion_panel;
//var createRegion_checkBox;

function CreateRegionView(panel_all){
	var server = "http://images.kosmosnimki.ru/slicks/";
	
	var createRegion_panel = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL,
    	{"bgColor": "#78C1B9",
    	"opacity": "0.85",
    	"pos": [80, 125],
        "maximize": false,
        "size": [455, 320],
        "minSize": [160, 40]        
    });

    createRegion_panel.append();
    
	var createRegion_checkBox = new MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
		{"checked": false,
        "do": function() {
            createRegion_panel.toggleShowing({ "time": 655 });
        },
        "text": "Создать регион...",
        "pos": [85, 130],
        "size": [150, 30]
    });
        
    var setRegionName_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "Rgion name:",
        "pos": [120, 130],
        "size": [120, 30]
    });

    setRegionName_label.append();

    var regionName_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
        "pos": [120, 280],
        "size": [155, 30]
    });

    regionName_textBox.append();

    //Долгота мин
    var LongitudeMin_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "Долгота мин:",
        "pos": [155, 130],
        "size": [120, 30]
    });

    LongitudeMin_label.append();

    var LongitudeMin_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
        "pos": [155, 280],
        "size": [45, 30]
    });

    LongitudeMin_textBox.append();

    //Долгота макс
    var LongitudeMax_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "макс:",
        "pos": [155, 335],
        "size": [40, 30]
    });

    LongitudeMax_label.append();

    var LongitudeMax_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
        "pos": [155, 385],
        "size": [45, 30]
    });

    LongitudeMax_textBox.append();

    //Широта мин
    var LatitudeMin_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "Широта мин:",
        "pos": [190, 130],
        "size": [120, 30]
    });

    LatitudeMin_label.append();

    var LatitudeMin_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
        "pos": [190, 280],
        "size": [45, 30]
    });

    LatitudeMin_textBox.append();

    //Долгота макс
    var LatitudeMax_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "макс:",
        "pos": [190, 335],
        "size": [40, 30]
    });

    LatitudeMax_label.append();

    var LatitudeMax_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
        "pos": [190, 385],
        "size": [45, 30]
    });

    LatitudeMax_textBox.append();

    //Altimetry   
    var altimetry_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "Regional altimetry:",
        "pos": [260, 130],
        "size": [120, 30]
    });

    altimetry_label.append();

    var coastLine_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "default",
        "pos": [330, 280],
        "size": [120, 30]
    });

    coastLine_textBox.append();
    
    var select_opt = "0";
    var altimetry_comboBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.COMBO_BOX, 
    	{"options": {
            "0": "Global",
            "mfstep": "Mediterranean Sea",
            "blacksea": "Black Sea"
        },
        "selected": function(selected) {
            select_opt = selected.key;
        },
        "pos": [260, 280],
        "size": [180, 30]
    });

    altimetry_comboBox.append();
    
    //MDT    
    var MDT_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "MDT:",
        "pos": [225, 130],
        "size": [45, 30]
    });

    MDT_label.append();    
    
    var MDT_comboBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.COMBO_BOX, 
    	{"options": {
            "none": "None",
            "rio": "MDT-CNES-CLS09",
            "": "Other data"
        },
        "selected": function(selected) {
            MDT_textBox.setValue(selected.key);
        },
        "pos": [225, 280],
        "size": [180, 30]
    });

    MDT_comboBox.append();

    var MDT_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
    	{"text": "",
        "pos": [225, 470],
        "size": [100, 30]
    });

    MDT_textBox.append();    

    var isIce_checkBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
    	{"checked": false,
        "do": function() {
            //createRegion_panel.toggleShowing({ "time": 655 });
        },
        "text": "Учитывать лёд",
        "pos": [295, 130],
        "size": [150, 30]
    });

    isIce_checkBox.append();

    var coastLine_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,      
    	{"text": "Coastline:",
        "pos": [330, 130],
        "size": [70, 30]
    });

    coastLine_label.append();

    saveRegion_button = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
    	{"click": function() {           
            var data = "";
            
            data += "Region name" + "~";
            data += regionName_textBox.value() + "~";
            data += "Longitude" + "~";
            data += LongitudeMin_textBox.value() + " " + LongitudeMax_textBox.value() + "~";
            data += "Latitude" + "~";
            data += LatitudeMin_textBox.value() + " " + LatitudeMax_textBox.value() + "~";
            data += "mdte" + "~";
            data += MDT_textBox.value() + "~";
            data += "regdata" + "~";
            data += select_opt + "~";
            data += "ice" + "~";
            data += (isIce_checkBox.getChecked() == true ? "1" : "0") + "~";
            data += "coast" + "~";
            data += (coastLine_textBox.value() == "default" ? "0" : coastLine_textBox.value()) + "~";            
            
			            console.log(regionName_textBox.value());
			            console.log(data);
            
            			panel_all.setWaitingLoadingState(true);	
                    	                    	
                        $.getJSON(server + 'saveRegion.ashx?callback=?',  
                        {"name": regionName_textBox.value(),
                         "data": data}).
                         done(function(json) { 
                         	console.log("done");
                         	
							var status = json;
							
							console.log(status);
							
							panel_all.setWaitingLoadingState(false, null);
						}).
						fail(function( jqxhr, textStatus, error ) {
						  	var err = textStatus + ', ' + error;
						  	console.log( "Request Failed: " + err);
						  	console.log( jqxhr);
						});						
        },
        "text": "Сохранить...",
        "pos": [365, 130],
        "size": [120, 30]
    });

    saveRegion_button.append();



    //toggle pannel
    createRegion_checkBox.append();
    
    
    
    createRegion_panel.addToPanel(setRegionName_label);
    createRegion_panel.addToPanel(regionName_textBox);
    //Долгота
    createRegion_panel.addToPanel(LongitudeMin_label);
    createRegion_panel.addToPanel(LongitudeMin_textBox);
    createRegion_panel.addToPanel(LongitudeMax_label);
    createRegion_panel.addToPanel(LongitudeMax_textBox);
    //Широта
    createRegion_panel.addToPanel(LatitudeMin_label);
    createRegion_panel.addToPanel(LatitudeMin_textBox);
    createRegion_panel.addToPanel(LatitudeMax_label);
    createRegion_panel.addToPanel(LatitudeMax_textBox);
    //MDT
    createRegion_panel.addToPanel(MDT_label);
    createRegion_panel.addToPanel(MDT_comboBox);
    createRegion_panel.addToPanel(MDT_textBox);
    //Altimetry
    createRegion_panel.addToPanel(altimetry_label);
    createRegion_panel.addToPanel(altimetry_comboBox);
    //isIce
    createRegion_panel.addToPanel(isIce_checkBox);
    //Coast line
    createRegion_panel.addToPanel(coastLine_label);
    createRegion_panel.addToPanel(coastLine_textBox);
    //saveRegion
    createRegion_panel.addToPanel(saveRegion_button);

    createRegion_panel.hide({ "time": 0 });
    
    panel_all.addToPanel(createRegion_checkBox);
    panel_all.addToPanel(createRegion_panel);
}
