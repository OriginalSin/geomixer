function createSettingsParameters(panel_all){	
    var settingParam_panel = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL, 
    	{"bgColor": "#78C1B9",
        "pos": [475, 130],
        "maximize": false,
        "size": [310, 180],
        "minSize": [280, 40] 
    });
    
    settingParam_panel.append();
    
    var settingParam_checkBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.CHECK_BOX, 
		{"checked": false,
        "do": function() {
            settingParam_panel.toggleShowing({ "time": 655 });
        },
        "text": "Настройка параметризаации...",
        "pos": [480, 135],
        "size": [270, 30]
    });            
    
    //Коэф-нт ветрового дрейфа
    var wind_dreyf_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,
    	{"text": "Коэф-нт ветрового дрейфа:",
        "pos": [515, 135],
        "size": [250, 30]
    });

    wind_dreyf_label.append();

    //Коэф-нт ветрового дрейфа
    wind_dreyf_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX,
    	{"text": "0.03",
        "pos": [515, 390],
        "size": [45, 30]
    });

    wind_dreyf_textBox.append();

    //Угол поворота дрейфовых течений
    var angl_dreyf_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,
    	{"text": "Угол поворота дрейфовых течений:",
        "pos": [550, 135],
        "size": [250, 30]
    });

    angl_dreyf_label.append();

    //Угол поворота дрейфовых течений
    angl_dreyf_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX,
    	{"text": "13",
        "pos": [550, 390],
        "size": [45, 30]
    });

    angl_dreyf_textBox.append();

    //Коэф-нт турбулентного обмена:
    var turbulent_label = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL,
    	{"text": "Коэф-нт турбулентного обмена:",
        "pos": [585, 135],
        "size": [250, 30]
    });

    turbulent_label.append();

    //Коэф-нт турбулентного обмена:
    turbulent_textBox = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX,
    	{"text": "0.1",
        "pos": [585, 390],
        "size": [45, 30]
    });

    turbulent_textBox.append();

    //ok Button
    ok_click = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON,
    	{"click": function() {
            settingParam_panel.toggleShowing({ "time": 655 });
        },
        "text": "Ok",
        "pos": [620, 135],
        "size": [50, 30]
    });

    //ok Button
    ok_click.append();
    
    
    //toggle pannel
    settingParam_checkBox.append();
    
    //Коэф-нт ветрового дрейфа
    settingParam_panel.addToPanel(wind_dreyf_label);
    settingParam_panel.addToPanel(wind_dreyf_textBox);
    //Угол поворота дрейфовых течений
    settingParam_panel.addToPanel(angl_dreyf_label);
    settingParam_panel.addToPanel(angl_dreyf_textBox);
    //Коэф-нт турбулентного обмена:
    settingParam_panel.addToPanel(turbulent_label);
    settingParam_panel.addToPanel(turbulent_textBox);
    //ok Button
    settingParam_panel.addToPanel(ok_click);
    
    settingParam_panel.hide({ "time": 0 });
   
    panel_all.addToPanel(settingParam_panel);
    panel_all.addToPanel(settingParam_checkBox);
}
