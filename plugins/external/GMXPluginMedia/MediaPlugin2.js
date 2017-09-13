(function($){

"use strict";

var gmxMediaDescription = function(descField, descData, storeDescFieldName, mode, mediaLayerName, mediaObjId, mediaLayer, dialogSettings) {

	//Основные переменные

	var editor,
		mediaDescDialog = jQuery('<div class="mediaDesc-Div"><img src="'+pluginPath+'addit/media_img_load.gif"></img></div>'),
		mediaDescDialogTitle,
		mediaDescTextArea = jQuery('<textarea name="mediaDescInput" id="mediaDescInput"></textarea>'),
		exp1 = /(?:^|[^"'])(\b((https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]))/gim ,
		exp2 = /(?:^|[^"'https?:\/\/])(\b((www.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]))/gim;

		//descData = descData.replace(exp1, '<a href="$1" target="_blank">$1</a>'); //Проверяем текст на наличие ссылок вида http/ftp и превращаем в URL.
		//descData = descData.replace(exp2, '<a href="http://$1" target="_blank">$1</a>'); //Проверяем текст на наличие ссылок вида www и превращаем в URL.

	//Основные функции диалога

		//Исправление бага с окном добавления ссылок через CKEditor в модальном режиме диалога описания
	$.widget( "ui.dialog", $.ui.dialog, {
			 //  jQuery UI - v1.10.2 - 2013-12-12
			 //  http://bugs.jqueryui.com/ticket/9087#comment:27 - bugfix
			 //  http://bugs.jqueryui.com/ticket/4727#comment:23 - bugfix
			 //  allowInteraction fix to accommodate windowed editors

		_allowInteraction: function( event ) {
			if ( this._super( event ) ) {
				return true;
			}

					// address interaction issues with general iframes with the dialog
			if ( event.target.ownerDocument != this.document[ 0 ] ) {
				return true;
			}

                    // address interaction issues with dialog window
			if ( $( event.target ).closest( ".cke_dialog" ).length ) {
				return true;
			}

                    // address interaction issues with iframe based drop downs in IE
			if ( $( event.target ).closest( ".cke" ).length ) {
				return true;
			}
		},

					// jQuery UI - v1.10.2 - 2013-10-28
					//  http://dev.ckeditor.com/ticket/10269 - bugfix
					//  moveToTop fix to accommodate windowed editors

		_moveToTop: function ( event, silent ) {
			if ( !event || !this.options.modal ) {
				this._super( event, silent );
			}
		}
	});

		//Функция сохранения описание из Режима Чтения (данные записываются сразу в слой)
	var saveDescfromReadMode = function() {
		var newData = mediaDescTextArea.val();
		var descriptionLength = newData.length;
		var edata = editor.getData();
		
		newData = edata.replace(/>/gim, '> ');	
		newData = newData.replace(exp1, ' <a href="$1" target="_blank">$1</a> '+' ');
		newData = newData.replace(exp2, ' <a href="http://$1" target="_blank">$1</a> '+' ');
		
		if (descriptionLength > 5000) {
			var descriptionLengthDIFF = descriptionLength - 5000 ;
			alert (_gtxt('mediaPlugin2.mediaDescDialogLimit.alert')+descriptionLengthDIFF+_gtxt('mediaPlugin2.mediaDescDialogSymbols.alert'))
		}
		else {
			_mapHelper.modifyObjectLayer(mediaLayerName, [{id:mediaObjId, properties: {'_mediadescript_':newData}, action: 'update'}]).done(function() {
				mediaDescDialog.dialog('close').remove();
				new gmxMediaDescription( null, newData, null, 'read', mediaLayerName, mediaObjId, mediaLayer, dialogSettings ); //После сохранения закрываем старое окно и открываем новое с описанием.
			});
		}
	};

		//Функция сохранения описание из Режима Чтения (Пользователь решает сохранять данные или нет)
	var saveDescfromEditMode = function() {
		var newdescData = mediaDescTextArea.val();
		var descriptLength = newdescData.length;
		var eddata = editor.getData();
		
		newdescData = eddata.replace(/>/gim, '> ');
		newdescData = newdescData.replace(exp1, ' <a href="$1" target="_blank">$1</a> '+' ');
		newdescData = newdescData.replace(exp2, ' <a href="http://$1" target="_blank">$1</a> '+' ');

		if (descriptLength > 5000) {
			var descriptLengthDIFF = descriptLength - 5000 ;
			alert (_gtxt('mediaPlugin2.mediaDescDialogLimit.alert')+descriptLengthDIFF+_gtxt('mediaPlugin2.mediaDescDialogSymbols.alert'))
		}

		else {
			descField.set(storeDescFieldName, newdescData);
			mediaDescDialog.dialog('close').remove();
		}
	};

		//Функция переключения в режим "HTML"
	var editortoHTML = function(prevmode) {
		for ( var editorHTMLInstance in CKEDITOR.instances )
		{
			var curHTMLInstance = editorHTMLInstance;
			break;
		};
		$('#'+editor.id+'_top').hide();
		editor.resize( '100%', mediaDescDialog.height() - 5, true );
		CKEDITOR.instances[curHTMLInstance].setMode( 'source' );

		if (prevmode=='fromedit') {
			mediaDescDialog.dialog({buttons:[{id:'WYSIWYGMode', text:_gtxt("mediaPlugin2.descDialogWYSIWYGButton.label"), click:function() {editortoWYSIWYG('fromedit')}}, {id:'saveDescData', text:_gtxt('mediaPlugin2.descDialogEditSaveButton.label'), click:saveDescfromEditMode}]});
		}

		else if (prevmode=='fromread') {
			mediaDescDialog.dialog({buttons:[{id:'WYSIWYGMode', text:_gtxt("mediaPlugin2.descDialogWYSIWYGButton.label"), click:function() {editortoWYSIWYG('fromread')}}, {id:'saveDescData', text:_gtxt("mediaPlugin2.descDialogSaveButton.label"), click:saveDescfromReadMode}]});
		}
	};

		//Функция переключения в режим "WYSIWYG"
	var editortoWYSIWYG = function(prevmode) {
		for ( var editorWYSIWYGInstance in CKEDITOR.instances ) {
			var curWYSIWYGInstance = editorWYSIWYGInstance;
			break;
		};

		$('#'+editor.id+'_top').show();
		editor.resize( '100%', mediaDescDialog.height() - 50, true )
		CKEDITOR.instances[curWYSIWYGInstance].setMode( 'wysiwyg' );

		if (prevmode=='fromedit') {
			mediaDescDialog.dialog({buttons:[{id:'htmlMode', text:'HTML', click:function() {editortoHTML('fromedit')}}, {id:'saveDescData', text:_gtxt('mediaPlugin2.descDialogEditSaveButton.label'), click:saveDescfromEditMode}]});
		}

		else if (prevmode=='fromread') {
			mediaDescDialog.dialog({buttons:[{id:'htmlMode', text:'HTML', click:function() {editortoHTML('fromread')}}, {id:'saveDescData', text:_gtxt("mediaPlugin2.descDialogSaveButton.label"), click:saveDescfromReadMode}]});
		}
	};

		//Функция переключения из режима "Чтение" в режим "Редактирование"
	var changeDescDialogMode = function() {
		mediaDescDialog.dialog('close');
		descEditMode();
		mediaDescDialog.dialog({buttons:[{id:'htmlMode', text:'HTML', click:function() {editortoHTML('fromread')}}, {id:'saveDescData', text:_gtxt("mediaPlugin2.descDialogSaveButton.label"), click:saveDescfromReadMode}]});
		mediaDescDialog.dialog('open');
	};

		//Режим "Чтение"
	var descReadMode = function() {
		var isEditableLayer = function(layer) {
            var layerProps = layer.getGmxProperties();
            var layerRights = _queryMapLayers.layerRights(layerProps.name);
			return layerProps.type === 'Vector' &&
                'tilesVers' in layerProps &&
                (layerRights == 'edit' || layerRights == 'editrows');
		};

		$(mediaDescDialog).on('click', '.imgMedia', function(e) {
			var newwindowHref = $(this).find('img').attr('src');
            
            if (newwindowHref) {
                e.preventDefault();
                window.open(newwindowHref, 'new' + e.screenX);
            }
		});
		
		mediaDescDialog.dialog({
			title: mediaDescDialogTitle,
			width: 510,
			height: dialogSettings.dialogDescHeight,
			minHeight: dialogSettings.dialogDescHeight,
			maxWidth: 510,
			minWidth: 510,
			modal: false,
			autoOpen: false,
			dialogClass:'media-DescDialog',
			close: function() {mediaDescDialog.dialog('close').remove();}
		});
        
		mediaDescDialog.html('<div class="media-descDiv">'+descData+'</div>');

		mediaDescDialog.dialog('open');

			if (isEditableLayer(mediaLayer)) {
				mediaDescDialog.dialog({buttons:[{id:'changeDescMode', text:_gtxt("mediaPlugin2.descDialogEditButton.label"), click:changeDescDialogMode}]});
			}
	};

		//Режим "Редактирование"
	var descEditMode = function() {

		gmxCore.loadScript( pluginPath + 'ckeditor_4.4.1_custom/ckeditor/ckeditor.js');
		gmxCore.loadScript( pluginPath + 'ckeditor_4.4.1_custom/ckeditor/adapters/jquery.js').done(function() {

			var CKEDITOR_BASEPATH = gmxCore.getModulePath('ckeditor');
			//CKEDITOR.config.enterMode = '2';
			mediaDescTextArea.val(descData);
			mediaDescTextArea.ckeditor();

			CKEDITOR.on( 'instanceReady', function( ev ) {
				editor = ev.editor;
				$('#'+editor.id+'_top').show();
				editor.resize( '100%', mediaDescDialog.height()- 65, true );

				editor.on( 'doubleclick', function( evt ) {
					var element = evt.data.element;
					if ( element.is( 'img' ) && !element.data( 'cke-realelement' ) && !element.isReadOnly() ){					
						var targetSrc = element.getAttribute('src');		
						window.open(targetSrc, 'new' + e.screenX);				
					}	
				});
				
				$('iframe').contents().click(function(e) {

					if(typeof e.target.href != 'undefined' && e.ctrlKey == true) {

						window.open(e.target.href, 'new' + e.screenX);

					}
				});

			});

			CKEDITOR.on('dialogDefinition', function(ev) {

				var dialogName = ev.data.name;
				var dialogDefinition = ev.data.definition;

				if(dialogName == 'link') {
					var informationTab = dialogDefinition.getContents('target');
					var targetField = informationTab.get('linkTargetType');
					targetField['default'] = '_blank';

				}

			});
		mediaDescDialog.html(mediaDescTextArea);	
		});

		mediaDescDialog.dialog({
			//title: mediaDescDialogTitle,
			width: 510,
			height: dialogSettings.dialogDescHeight,
			minHeight: dialogSettings.dialogDescHeight,
			maxWidth: 510,
			minWidth: 510,
			modal: true,
			resize: function() {editor.resize( '100%', mediaDescDialog.height()- 65 , true );},
			resizeStop:function() { editor.resize( '100%', mediaDescDialog.height()- 65 , true );},
			drag: function() { editor.resize( '100%', mediaDescDialog.height()- 65 , true );},
			dragStop: function() { editor.resize( '100%', mediaDescDialog.height()- 65 , true );},
			autoOpen: false,
			buttons:[{id:'htmlMode', text:'HTML', click:function() {editortoHTML('fromedit')}}, {id:'saveDescData', text:_gtxt('mediaPlugin2.descDialogEditSaveButton.label'), click:saveDescfromEditMode}],
			dialogClass:'media-DescDialog',
			close: function() {mediaDescDialog.dialog('close').remove();}
		});

		mediaDescDialog.dialog('open');
	};

		//Дополнительные условия

	if (mode =='read') {
		//mediaDescDialogTitle = _gtxt('mediaPlugin2.mediaDescDialogTitleRead.label'); 
		descReadMode()
	}
	else if (mode =='edit') {
		//mediaDescDialogTitle = _gtxt('mediaPlugin2.mediaDescDialogTitleEdit.label'); 
		descEditMode()
	}
	else if (mode =='baloon') {
		/*mediaDescDialogTitle = _gtxt('mediaPlugin2.mediaDescDialogTitleEdit.label');*/ 
		descReadMode(); changeDescDialogMode();
	}
};

_translationsHash.addtext("rus", { mediaPlugin2: {
    "layerPropertiesTitle": 'Добавить описание',
    "balloonDefaultTitle": 'Медиа Описание',
    "descButton.label": 'Редактировать',
	"descButton.help": 'Редактировать медиа описание',
	"descSpan.label": 'Описание',
	"descSpan.help": 'Медиа описание',
    "descDialogEditButton.label": 'Редактировать',
    "descDialogWYSIWYGButton.label": 'Визуально',
    "descDialogSaveButton.label": 'Сохранить',
    "descDialogEditSaveButton.label": 'Готово',
	"descBalloonButton.label": 'Описание',
	"descInBalloonButton.label": 'Редактировать описание',
    "descDialogTitle.label": 'Просмотр Медиа-Описания',
    "mediaDescDialogTitleEdit.label": 'Редактировать описание',
    "mediaDescDialogTitleRead.label": 'Чтение описания',
	"mediaDescDialogLimit.alert":'Количество символов в описании больше 5000.\nУкоротите описание на ',
	"mediaDescDialogSymbols.alert": ' символов',
	"mediaDescImgDialogError.alert": 'Не удалось загрузить изображение.\n Проверьте правильность ссылки',
    "WarningText": 'Для хранения описаний требуется добавление нового поля к слою'
}});

_translationsHash.addtext("eng", { mediaPlugin2: {
    "layerPropertiesTitle": 'Add media description',
    "balloonDefaultTitle": 'Media description',
    "descButton.label": 'Edit',
	"descButton.help": 'Edit media description',
	"descSpan.label": 'Description',
	"descSpan.help": 'Media Description',
    "descDialogEditButton.label": 'Edit',
    "descDialogWYSIWYGButton.label": 'WYSIWYG',
    "descDialogSaveButton.label": 'Save',
    "descDialogEditSaveButton.label": 'OK',
    "descBalloonButton.label": 'Description',
	"descInBalloonButton.label": 'Edit Description',
    "descDialogTitle.label": 'Media-Description Viewer',
    "mediaDescDialogTitleEdit.label": 'Edit Description',
    "mediaDescDialogTitleRead.label": 'View Description',
	"mediaDescDialogLimit.alert":'Description length more then 5000 symbols.\nDelete ',
	"mediaDescDialogSymbols.alert": ' symbols',
	"mediaDescImgDialogError.alert": 'Image load failure.\n Check URL on error',
    "WarningText": 'New attribute will be added to this layer to store descriptions'
}});

//Модифицирует описание слоя, добавляя или удаляя свойства, необходимые для хранения описания объектов.
//Метатег удаляется и добавляется, а необходимый атриут только добавляется (никогда не удаляется)
var modifyLayerProperties = function(layerProperties, isAddDescription) {
    var metaProps = layerProperties.get('MetaProperties'),
        tagId = metaProps.getTagIdByName(DESC_METATAG);
        

    if (isAddDescription) {
        tagId || metaProps.addNewTag(DESC_METATAG, DESC_DEFAULT_FIELD, 'String');
        var columns = layerProperties.get('Columns').slice();

        if (!_.findWhere(columns, {Name: DESC_DEFAULT_FIELD})) {
            columns.push({Name: DESC_DEFAULT_FIELD, ColumnSimpleType: 'String'});
        }

        layerProperties.set('Columns', columns);
    } else {
        metaProps.deleteTag(tagId);
    }

    layerProperties.set('MetaProperties', metaProps);
}

var DESC_METATAG = 'mediaDescField',
    DESC_DEFAULT_FIELD = '_mediadescript_',
    DESC_INLINE_HOOK = 'mediainline';

var pluginPath = gmxCore.getModulePath('MediaPlugin2');

var publicInterface = {
    pluginName: 'Media Plugin',
	afterViewer: function(mediaDescDialogSettings, map)
    {
		mediaDescDialogSettings = $.extend({dialogDescHeight:450, inBaloonDesc:false}, mediaDescDialogSettings);
		
        var showDescription = function(container, description, width)
		{	
		    container.width(width);
		    container.append(description);
		};

        gmxCore.loadModule('LayerEditor').done(function() {
            nsGmx.LayerEditor.addInitHook(function(layerEditor, layerProperties, parametres){
                var metaProps = layerProperties.get('MetaProperties'),
                    isMedia = metaProps.getTagByName(DESC_METATAG);

                if (layerProperties.get('Type') !== 'Vector') {
                    return;
                }

                var uiTemplate = Handlebars.compile(
                    '<label class = "media-props">' +
                        '<input type="checkbox" id="media-props-checkbox" {{#isMedia}}checked{{/isMedia}}>' +
                        '{{i "mediaPlugin2.layerPropertiesTitle"}}' +
                    '</label>');

                $(layerEditor).on('premodify', function() {
                    modifyLayerProperties(layerProperties, $('#media-props-checkbox', ui).prop("checked"));
                })

                var ui = $(uiTemplate({isMedia: isMedia}));

                parametres.additionalUI = parametres.additionalUI || {};
                parametres.additionalUI.advanced = parametres.additionalUI.advanced || [];
                parametres.additionalUI.advanced.push(ui[0]);
            })
        });

		var balloonHook = function(layer, props, div, node, hooksCount)
        {
            //Если есть описание в балуне, отдельной ссылки на описание не нужно
            if (hooksCount[DESC_INLINE_HOOK]) {
                return;
            }
            
            // var layer = o.layer,
            var layerProps = layer.getGmxProperties(),
                layerName = layerProps.name,
                metaTag = layerProps.MetaProperties && layerProps.MetaProperties[DESC_METATAG];
            
            if (!metaTag) {
                $(node).empty().append(props[DESC_DEFAULT_FIELD]);
            } else if (props[metaTag.Value].length) {

                var descBaloonButtonLabel = '<b><a href="">{{i "mediaPlugin2.descBalloonButton.label"}}</a></b>',
                    mediaDescDialogMode = 'read';
				
                var ui = $(Handlebars.compile(descBaloonButtonLabel)()).click(function(e) {
                        e.preventDefault();
						var mediaObjectId = props[layerProps.identityField];
						var descripText = props[metaTag.Value];
	                    new gmxMediaDescription('', descripText, '', mediaDescDialogMode, layerName, mediaObjectId, layer, mediaDescDialogSettings);
                    });
                if (node) {
                    $(node).empty().append(ui);
                } else {
                    $(div).append($('<br/>'), ui);
                }
            }
        };

        var attachBalloonHook = function(layer) {
            if (!layer.addPopupHook) { //например, виртуальные слои могут не поддерживать popup hooks
                return;
            }
            
            var props = layer.getGmxProperties();
            var metaTag = props.MetaProperties && props.MetaProperties[DESC_METATAG];
            layer.addPopupHook(metaTag ? metaTag.Value : DESC_DEFAULT_FIELD, function (properties, div, node, hooksCount) {
                balloonHook(layer, properties, div, node, hooksCount);
            });

            //добавляем просмотр описания внутри балуна
            layer.addPopupHook(DESC_INLINE_HOOK, function(properties, div, node) {
                var metaTag = props.MetaProperties && props.MetaProperties[DESC_METATAG];
                if (!node || !metaTag) {return;}
            
                    var html = properties[metaTag.Value];
                    $(node).html('<div class="media-inlineDescr media-descDiv">' + html + '</div>');
        
                    $(node).on('click', '.imgMedia',function(e) {
                        e.preventDefault();
                        var contwindowHref = $(this).find('img').attr('src');
                        window.open(contwindowHref, 'new' + e.screenX);
                    });
            });
        }

        nsGmx.gmxMap.layers.forEach(attachBalloonHook);

        var paramHook = function(layerName, id, parametres)
        {
            var layer = nsGmx.gmxMap.layersByID[layerName],
                props = layer.getGmxProperties(),
                fieldName = props.MetaProperties && props.MetaProperties[DESC_METATAG] && props.MetaProperties[DESC_METATAG].Value;

            //layer.bringToTopItem(id);

            parametres = parametres || {};
            parametres.fields = parametres.fields || [];

            if (fieldName) {
                var fieldDescription = _.findWhere(parametres.fields, {name: fieldName});
                if (fieldDescription) {
                    fieldDescription.hide = true;
                } else {
                    parametres.fields.push({name: fieldName, hide: true});
                }
            }

            parametres.afterPropertiesControl = function(EOCInteraction) {
				var mediaGUI = $('<div class="media-Desc-GUI"><span id="media-Desc-EditLabel" title="'+_gtxt("mediaPlugin2.descSpan.help")+'">'+_gtxt("mediaPlugin2.descSpan.label")+'</span><span id ="mediaDesc-EditButton" class="buttonLink" title="'+_gtxt("mediaPlugin2.descButton.help")+'">'+_gtxt("mediaPlugin2.descButton.label")+'</span></div>');

			    $('#mediaDesc-EditButton', mediaGUI).click(function()
			    {
                    if (!fieldName) {
                        var ui = $(Handlebars.compile('<div>{{i "mediaPlugin2.WarningText"}}</div>')());
                        ui.dialog({buttons:[
                            {
                                id: 'warning-ok', 
                                text: 'OK',
                                click: function() {
                                    $( this ).dialog("close");
                                    gmxCore.loadModule('LayerProperties').then(function() {
                                        var layerProperties = new nsGmx.LayerProperties();
                                        layerProperties.initFromServer(layerName).then(function() {
                                            modifyLayerProperties(layerProperties, true);
                                            layerProperties.save().then(function() {
                                                L.gmx.layersVersion.chkVersion(layer, function() {
                                                    fieldName = layer.getGmxProperties().MetaProperties[DESC_METATAG].Value;
                                                    
                                                    var fields = EOCInteraction.getAll();
                                                    if (!fields[fieldName]) {
                                                        EOCInteraction.add({
                                                            name: fieldName, 
                                                            view: {
                                                                _value: '',
                                                                setValue: function(value) {this._value = value;},
                                                                getValue: function() {return this._value;},
                                                                checkValue: function() {return true;}
                                                            }
                                                        })
                                                    }
                                                    
                                                    var getdescData = EOCInteraction.get(fieldName) || '';
                                                    new gmxMediaDescription(EOCInteraction, getdescData, fieldName, 'edit', null, null, null, mediaDescDialogSettings);
                                                    
                                                })
                                            });
                                        })
                                    })
                                }
                            }, {
                                id:'warning-cancel', 
                                text: 'Cancel', 
                                click: function() {
                                    $( this ).dialog("close");
                                }
                            }
                        ]});
                    } else {
                        var getdescData = EOCInteraction.get(fieldName);
						new gmxMediaDescription(EOCInteraction, getdescData, fieldName, 'edit', null, null, null, mediaDescDialogSettings);
                    }
                });
				return mediaGUI[0];
            }

			return parametres;
        };

		nsGmx.EditObjectControl.addParamsHook(paramHook);
    }
}

gmxCore.addModule("MediaPlugin2", publicInterface, {
    css: 'MediaPlugin2.css'
});

})(jQuery)
