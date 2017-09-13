(function(){

var translateTable={
	"sProcessing":"Подождите...",
	"sLengthMenu":"Показать _MENU_ записей",
	"sZeroRecords":"Записи отсутствуют.",
	"sInfo":"Записи с _START_ до _END_ из _TOTAL_ записей",
	"sInfoEmpty":"Записи с 0 до 0 из 0 записей",
	"sInfoFiltered":"(отфильтровано из _MAX_ записей)",
	"sInfoPostFix":"",
	"sSearch":"Поиск:",
	"sUrl":"",
	"oPaginate":{
		"sFirst":"Первая",
		"sPrevious":"Предыдущая",
		"sNext":"Следующая",
		"sLast":"Последняя"
	},
	"oAria":{
		"sSortAscending":": активировать для сортировки столбца по возрастанию",
		"sSortDescending":": активировать для сортировки столбцов по убыванию"
	}
};

String.prototype.pad = function(_char, len, to) {
	if (!this || !_char || this.length >= len) {
		return this;
	}
	to = to || 0;
	var ret = this;
	var max = (len - this.length)/_char.length + 1;
	while (--max) {
		ret = (to) ? ret + _char : _char + ret;
	}

	return ret;
};

var url="/VectorLayer/Search.ashx?WrapStyle=func";
var sql="";
var searchLayerName = ['8103DD8809C54022902596E782C20F28','08396D11C8B445A5B6303F41FD094141'];
var valueFiels={1:"Пашни",3:"Зарастание",4:"Застройка",5:"Карьеры и свалки",6:"Новое поле"};
var selectFeature=null;
var checkVisible=null;
var editControl=null;
var scrollHeight="203px";
var plugin_path = gmxCore.getModulePath("querySearch");

var table=null;
var schema;
var schemaRegionNumber=[
	{ "sTitle": "Дата завершения экспертизы","mRender": function ( data, type, row ) {
		var result = "";
		if(data){
			result = new Date(data).toLocaleDateString();
		}
		return result;
	}}
	,{ "sTitle": "Номер экспертизы/протокола"}
	,{ "sTitle": "Норм. док., на соответствие которому проводится проверка"}
	,{ "sTitle": "Наименование образца"}
	,{ "sTitle": "Перечень проведенных исследований"}
	,{ "sTitle": "Масса пробы"}
	,{ "sTitle": "Норм. док., согласно которому проводился отбор"}
];

var schemaRegionNumber2=[
	{ "sTitle": "Кадастровый номер", "mRender": function ( data, type, row ) {
		var result = "";
		if(data){
			result = "<a href=# id='regionNumber'>" + data + "</a>";
		}
		return result;
	}}
	,{ "sTitle": "Количество проб"}
	,{ "sTitle": "Дата послед. пробы","mRender": function ( data, type, row ) {
		var result = "";
		if(data){
			result = new Date(data).toLocaleDateString();
		}
		return result;
	}}
];

var regionArray=[{region:'Калужская', area:['Бабынинский','Барятинский','Боровский','Дзержинский','Думиничский','Жуковский','Износовский','Калуга','Кировский','Козельский','Куйбышевский','Людиновский','Малоярославецкий','Медынский','Мещовский','Мосальский','Перемышльский','Спас-Деменский','Сухиничский','Тарусский','Ульяновский','Ферзиковский','Хвастовичский','Юхновский']},{region:'Ленинградская', area:['Бокситогорский','Волосовский','Гатчинский','Кингисеппский','Кировский','Ломоносовский','Санкт-Петербург','Тихвинский','Тосненский']},{region:'Московская', area:['Балашихинский район','Видновский район','Волоколамский район','Воскрессенский район','г.Москва (за кольцевой автодорогой)','Дмитровский район','Домодедовский район','Егорьевский район','Зарайский район','Истринский район','Каширский район','Клинский район','Коломенский район','Красногорский район','Лотошинский район','Луховицкий район','Люберецкий район','Можайский район','Мытищинский район','Наро-Фоминский район','Ногинский район','Одинцовский район','Озёрский район','Орехово-Зуевский район','Павлово-Посадский район','Подольский район','Пушкинский район','Раменский район','Рузский район','Сергиев-Посадский район','Серебряно-Прудский район','Серпуховской район','Солнечногорский район','Ступинский район','Талдомский район','Химкинский район','Чеховский район','Шатурский район','Шаховской район','Щёлковский район']},{region:'Рязанская',area:['Ермишинский','Захаровский','Касимовский','Клепиковский','Кораблинский','Милославский','Михайловский','Новодеревенский','Пронский','Путятинский','Рыбновский','Ряжский','Рязанский','Сапожковский','Сараевский','Скопинский','Спасский','Старожиловский','Ухоловский','Шацкий','Шиловский']},{region:'Тульская',area:['Алексинский','Арсеньевский','Богородицкий','Веневский','Воловский','Дубенский','Ефремовский','Каменский','Куркинский','Ленинский','Новомосковский','Плавский','Суворовский','Узловский','Чернский']}];

function calcHeight(){
	var height = $(".dataTables_scroll").height() + $("#tableInfo_paginate").height() + 110;
	// $("#queryDialog").dialog('option', 'height', height );
}

var publicInterface = {
	pluginName: 'querySearch',
	afterViewer: function(params){
		var div = $('<div id="queryDialog" title="" style="background:white;"></div>');
		var filteringLayer=gmxAPI.map.layers[searchLayerName[0]];
		var filters = [].concat(filteringLayer.filters);
        
        //способ полноценно инстанциировать слой, чтобы можно было бы менять фильтры
        if (!filteringLayer.getVisibility()) {
            filteringLayer.setVisible(true);
            filteringLayer.setVisible(false);
        }

		var fnRefreshStyle = function(){
			var filteringYear, filteringSql, filterArray=[1,3,4,5,6];
			if($("#radio3")[0].checked){
				filteringYear = $("#radio3")[0].value;
				for(var i=0;i<filters.length; i++)
					filteringLayer.filters[i].setFilter("\"N"+filteringYear+"\" = "+filterArray[i]);
				$("label[for='radio3'] > div").removeClass("dt-icon-2011");
				$("label[for='radio3'] > div").addClass("dt-icon-2011-acton");
				$("label[for='radio2'] > div").removeClass("dt-icon-2008-acton");
				$("label[for='radio2'] > div").addClass("dt-icon-2008");
				$("label[for='radio1'] > div").removeClass("dt-icon-1985-acton");
				$("label[for='radio1'] > div").addClass("dt-icon-1985");
			}
			if($("#radio2")[0].checked){
				filteringYear = $("#radio2")[0].value;
				for(var i=0;i<filters.length; i++)
					filteringLayer.filters[i].setFilter("\"N"+filteringYear+"\" = "+filterArray[i]);
				$("label[for='radio3'] > div").removeClass("dt-icon-2011-acton");
				$("label[for='radio3'] > div").addClass("dt-icon-2011");
				$("label[for='radio2'] > div").removeClass("dt-icon-2008");
				$("label[for='radio2'] > div").addClass("dt-icon-2008-acton");
				$("label[for='radio1'] > div").removeClass("dt-icon-1985-acton");
				$("label[for='radio1'] > div").addClass("dt-icon-1985");
			}
			if($("#radio1")[0].checked){
				filteringYear = $("#radio1")[0].value;
				for(var i=0;i<filters.length; i++)
					filteringLayer.filters[i].setFilter("\"N"+filteringYear+"\" = 1");
				$("label[for='radio3'] > div").removeClass("dt-icon-2011-acton");
				$("label[for='radio3'] > div").addClass("dt-icon-2011");
				$("label[for='radio2'] > div").removeClass("dt-icon-2008-acton");
				$("label[for='radio2'] > div").addClass("dt-icon-2008");
				$("label[for='radio1'] > div").removeClass("dt-icon-1985");
				$("label[for='radio1'] > div").addClass("dt-icon-1985-acton");
			}
		}

		var layerId = gmxAPI.map.layers[searchLayerName[0]].properties.LayerID;
		var panel = $("[LayerID='" + layerId + "']").find("span.layerDescription");
		panel.css({"margin":"0"}).append('<input type="radio" id="radio1" value="1985" name="radio" class="dt-input-hidden" /><label for="radio1"><div class="dt-icon"></div></label><input type="radio" value="2008" name="radio" id="radio2" class="dt-input-hidden" /><label for="radio2"><div class="dt-icon"></div></label><input type="radio" checked="checked" id="radio3" value="2011" name="radio" class="dt-input-hidden" /><label for="radio3"><div class="dt-icon"></div></label>');
		$("#radio1")[0].onclick = fnRefreshStyle;
		$("#radio2")[0].onclick = fnRefreshStyle;
		$("#radio3")[0].onclick = fnRefreshStyle;
		fnRefreshStyle();

		var queryDialog;
		function onClickQuery(){
			if(queryDialog) return;
			queryDialog=div.dialog({
                minimize: true, 
                resizable: true, 
                minHeight: 400, 
                close: function(){
                    queryDialog.dialog( "destroy" );
                    gmxAPI._tools.standart.selectTool('move');
                    if (selectFeature){
                        selectFeature.remove();
                        selectFeature=null;
                    }
                    table=null;
                    queryDialog=null;
				},
				resizeStop: function( event, ui ) {
					var dialogHeight = queryDialog.dialog().height();
					var deltaHeight = $(".dataTables_scrollHead").height() + $("#tableInfo_paginate").height() + $("#dload").height() + 40;
					if(table){
						//var newHeight = (parseInt(table.fnSettings().oScroll.sY)+(ui.size.height-ui.originalSize.height)-5);
						var newHeight = dialogHeight - deltaHeight;//145
						scrollHeight = table.fnSettings().oScroll.sY = newHeight + "px";
					}else{
						scrollHeight = dialogHeight - deltaHeight + "px";
					}
					$(".dataTables_scrollBody").css({height:scrollHeight});
                    $('#accordion').accordion('refresh');
				}
			});
			queryDialog.dialog('option','zIndex',20000);
			queryDialog.dialog('option','width',727);
			queryDialog.dialog('option','dialogClass','dialog-style');
			queryDialog.dialog('option', "title", " ");
			queryDialog.dialog('moveToTop');

			$(".dialog-style").removeClass("ui-min");
			$(".dialog-style").removeClass("ui-resizable");
			$(".dialog-style").removeClass("ui-resizable-disabled");

			div.empty();
			div.append('<div id="accordion" style="margin-left: 12px;"></div>');
			$("#accordion").append('<span>Параметры поиска</span><div id="searchDiv"></div>');
			$("#searchDiv").append('<div id="tabs"><ul><li><a href="#tabs-1">По с\х угодьям</a></li><li><a href="#tabs-2">По проверкам</a></li><li><a href="#tabs-3">По базе Веста</a></li></ul><div id="tabs-1" style="padding-top:14px;"></div><div id="tabs-2" style="padding-top:14px;"></div><div id="tabs-3" style="padding-top:14px;"></div></div>');

			$("#tabs-1").append('<div id="table" style="margin-bottom: 17px;"><div class="table"><div class="table-row"><div class="table-cell"><div id="inCad"></div><div id="sArea"></div><div class="table"><div id="slRegion" style="padding-right: 3px;" class="table-cell"></div><div id="slArea" style="padding-left: 3px;" class="table-cell"></div></div><div id="union" style="margin-top:5px;"></div><div id="buttonDiv" style="margin-top:10px;"></div></div><div class="table-cell" style="padding-left:34px;"><div class="table"><div style="display: table-cell;"><div id="sl2008"></div></div><div style="display: table-cell;"><div id="sl2011"></div></div></div></div></div></div></div>');			
			$("#inCad").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;">Введите кадастровый номер</label><br><input placeholder="71:22:000000:0234" id="inCad" type="text" size="22" style="margin-top: 5px; margin-bottom:10px; width:100%; height: 22px;line-height: 22px;">');
			$("#sl2008").append('<span>2008</span><br><input type="checkbox" name="sl2008" id="sl2008-1" value="1"><label for="sl2008-1">Пашни</label></br><input type="checkbox" name="sl2008" value="3" id="sl2008-3"><label for="sl2008-3">Зарастание</label></br><input type="checkbox" name="sl2008" value="4" id="sl2008-4"><label for="sl2008-4">Застройка</label></br><input type="checkbox" name="sl2008" value="5" id="sl2008-5"><label for="sl2008-5">Карьеры и свалки</label></br><input type="checkbox" name="sl2008" value="6" id="sl2008-6"><label for="sl2008-6">Новое поле</label>');
			$("#sl2011").append('<span>2011</span><br><input type="checkbox" name="sl2011" id="sl2011-1" value="1"><label for="sl2011-1">Пашни</label></br><input type="checkbox" name="sl2011" value="3" id="sl2011-3"><label for="sl2011-3">Зарастание</label></br><input type="checkbox" name="sl2011" value="4" id="sl2011-4"><label for="sl2011-4">Застройка</label></br><input type="checkbox" name="sl2011" value="5" id="sl2011-5"><label for="sl2011-5">Карьеры и свалки</label></br><input type="checkbox" name="sl2011" value="6" id="sl2011-6"><label for="sl2011-6">Новое поле</label>');
			$("#sArea").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;margin-bottom:10px;">Площадь(от-до или точное значение)</label><br><input placeholder="0-200" id="sArea" type="text" size="22" style="margin-top: 5px; margin-bottom:10px; width:100%; height: 22px;line-height: 22px;">');

			$("#slRegion").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;">Укажите регион</label><br><select id="comboboxRegion" style="width:100%; border:solid 1px #BEBEBE; margin-right:4px; height: 22px;line-height: 22px;color:black;font-size:11px;font-family:Verdana,sans-serif;margin-top:5px;margin-bottom: 10px;"><option value="">укажите регион</option></select>');
			$.each(regionArray,function(i,value){
				$("#comboboxRegion").append('<option value="'+value.region.toString()+'">'+value.region.toString()+'</option>');
			});
			$("#slArea").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;">Укажите район</label><br><select disabled id="comboboxArea" style="width:100%;border:solid 1px #BEBEBE;margin-right:4px;height:22px;line-height:22px;color:black;font-size: 11px;font-family:Verdana,sans-serif;margin-top:5px;margin-bottom: 10px;"><option value="">укажите район</option></select>');
			$("#comboboxRegion").change(function(){
				var val = $(this).val();
				$('#comboboxArea').empty();
				$('#comboboxArea').append('<option value="">укажите район</option>');
				for (var i = 0; i<regionArray.length; i++) {
					if(regionArray[i].region==val){
						$.each(regionArray[i].area,function(i,value){
							$("#comboboxArea").append('<option value="'+value.toString()+'">'+value.toString()+'</option>');
						});
						$('#comboboxArea').removeAttr('disabled');
					}else if(val.length==0){
						$('#comboboxArea').attr('disabled', 'disabled');
						$('#comboboxArea').val('укажите район');
					}
				}
			});

			$("#union").append('<input type="checkbox" name="union" value="union" id="unionIn"><label for="unionIn">Объединить с проверками</label>');
			$("#buttonDiv").append('<input style="margin-right: 8px;" type="image" value="Поиск" name="search" id="button" src="'+plugin_path+'images/search.png" onMouseOver="this.src='+"'"+plugin_path+'images/searh-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/search.png\'">');
			$("#buttonDiv").append('<input type="image" value="Очистить" name="search" id="clButton" src="'+plugin_path+'images/clean.png" onMouseOver="this.src='+"'"+plugin_path+'images/clean-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/clean.png\'">');

			$("#clButton").click(function(){
				$('input[id="inCad"]').val('')
					.removeAttr('checked')
					.removeAttr('selected');

				$('input[name="sl2008"]').removeAttr('checked')
					.removeAttr('selected');

				$('input[name="sl2011"]').removeAttr('checked')
					.removeAttr('selected');

				$('input[id="sArea"]').val('')
					.removeAttr('checked')
					.removeAttr('selected');

				$("#comboboxRegion").val('Укажите регион');
				$("#comboboxArea").val('укажите район')
					.attr('disabled','disabled');

				$("#unionIn").removeAttr('checked')
					.removeAttr('selected');
			});
			$("#accordion").append('<span id="result" class="result-header">Результат поиска</span><div id="resultDiv"></div>');
			$('#resultDiv').append('<table cellpadding="0" cellspacing="0" border="0" style="width:100%;" id="tableInfo"></table>' );
			$("#tabs-2").append('<div id="table" style="margin-bottom: 17px;"><div class="table"><div class="table-row"><div class="table-cell"><div id="chCad"></div><div id="chDataReg"></div><div class="table"><div class="table-row"><div id="chRegion" class="table-cell"style="margin-bottom: 10px; padding-right:9px"></div><div id="chArea" class="table-cell"></div></div></div><div id="chButtonDiv" style="margin-top:10px;"></div></div><div class="table-cell" style="padding-left:34px;"></div></div></div></div>');
			$("#chCad").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;">Введите кадастровый номер</label><br><input placeholder="71:22:000000:0234" id="chCad" type="text" size="20" style="margin-top: 5px; margin-bottom:10px; width:100%; height: 22px;line-height: 22px;">');
			$("#chDataReg").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;">Дата дела об админ.нарушении</label><br><input placeholder="'+new Date().toLocaleDateString()+'" id="dataReg" type="text" size="20" style="margin-top: 5px; margin-bottom:10px; width:100%; height: 22px;line-height: 22px;">');
			$("#dataReg").datepicker();
			$("#chRegion").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;margin-bottom:10px;">Укажите регион</label><br><select id="chComboboxRegion" style="width:100%; border:solid 1px #BEBEBE; margin-right:4px; height: 22px;line-height: 22px;color:black;font-size:11px;font-family:Verdana,sans-serif;margin-top:5px;"><option value="">укажите регион</option></select>');
			$.each(regionArray,function(i,value){
				$("#chComboboxRegion").append('<option value="'+value.region.toString()+'">'+value.region.toString()+'</option>');
			});
			$("#chArea").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;margin-bottom:10px;">Укажите район</label><br><select disabled id="chComboboxArea" style="width:100%; border:solid 1px #BEBEBE; margin-right:4px; height: 22px;line-height: 22px;color:black;font-size:11px;font-family:Verdana,sans-serif;margin-top:5px;"><option value="">укажите район</option></select>');
			$("#chComboboxRegion").change(function(){
				var val = $(this).val();
				$('#chComboboxArea').empty();
				$('#chComboboxArea').append('<option value="">укажите район</option>');
				for (var i = 0; i<regionArray.length; i++) {
					if(regionArray[i].region==val){
						$.each(regionArray[i].area,function(i,value){
							$("#chComboboxArea").append('<option value="'+value.toString()+'">'+value.toString()+'</option>');
						});
						$('#chComboboxArea').removeAttr('disabled');
					}else if(val.length==0){
						$('#chComboboxArea').attr('disabled', 'disabled');
						$('#chComboboxArea').val('укажите район');
					}
				}
			});

			$("#chButtonDiv").append('<input type="image" value="Поиск" name="chSearch" id="chButton" style="margin-right: 8px;" src="'+plugin_path+'images/search.png" onMouseOver="this.src='+"'"+plugin_path+'images/searh-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/search.png\'">');
			$("#chButtonDiv").append('<input type="image" value="Очистить" name="chSearch" id="clChButton" src="'+plugin_path+'images/clean.png" onMouseOver="this.src='+"'"+plugin_path+'images/clean-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/clean.png\'">');
			$("#clChButton").click(function(){
				$('input[id="chCad"]').val('')
					.removeAttr('checked')
					.removeAttr('selected');

				$('input[id="dataReg"]').val('')
					.removeAttr('checked')
					.removeAttr('selected');

				$('input[id="dataEnd"]').val('')
					.removeAttr('checked')
					.removeAttr('selected');

				$("#chRegion select").val('Укажите регион');
				$("#chArea select").val('Укажите район')
				  	.attr('disabled','disabled');
			});
			$("#tabs-3").append('<div id="table" style="margin-bottom: 17px;"><div class="table"><div class="table-row"><div class="table-cell"><div id="cad"></div></div><div class="table-cell"></div></div></div><div id="btDiv"></div></div>');			
			$("#cad").append('<label style="color:black;font-size:11px;font-family:Verdana,sans-serif;">Введите кадастровый номер</label><br><input placeholder="71:22:000000:0234" id="cadNum" type="text" size="22" style="margin-top: 5px; margin-bottom:10px; width:100%; height: 22px;line-height: 22px;">');
			$("#btDiv").append('<input type="image" value="Поиск" name="chSearch" id="btSearch" style="margin-right: 8px;" src="'+plugin_path+'images/search.png" onMouseOver="this.src='+"'"+plugin_path+'images/searh-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/search.png\'">');
			
			function searchDb(){
				var cadNum = $('input[id="cadNum"]').val().trim();
				
				if( /^\d+$/.test( cadNum ) || /^\d+:\d+$/.test( cadNum ) || /^\d+:\d+:\d+$/.test( cadNum ) ) {
					url=params.url[1]+"?query="+cadNum;
					schema=schemaRegionNumber2;
				}else if (/^\d+:\d+:\d+:\d+$/.test( cadNum ) ) {
					url=params.url[0]+"?regionNumber="+cadNum;
					schema=schemaRegionNumber;
				}else if(cadNum.length == 0){
					url=params.url[0]+"?regionNumber=71:22:000000:0234";
					schema=schemaRegionNumber;
				}

				initTable(null,null,schema,null,url);
				$("#accordion").accordion('option', 'active' , 1);
				calcHeight();
			}

			$('input[id="cadNum"]').on('keydown', function(e){
                if (e.keyCode === 13) {
					searchDb();
					return false;
				}
			})

			$("#btSearch").click(function(){
				searchDb();
			});

			function zoomTopoint(ogc_fid,layerName){
				var url="/VectorLayer/Search.ashx?WrapStyle=func&layer="+ layerName +"&geometry=true&query=gmx_id="+ogc_fid;
					sendCrossDomainJSONRequest(url,function(response){
					if(response["Status"]=="ok"){
						var key=null;
						var val=response["Result"].values[0];
						for(var i=0;i<=val.length;i++){
							if(typeof(val[i]) == "object") key=i;
						}
						var merc_geometry=val[key];
						var geometry=gmxAPI.from_merc_geometry( merc_geometry );
						if (selectFeature) selectFeature.remove();
						selectFeature = gmxAPI.map.addObject();
						selectFeature.setStyle({outline:{color:0x0000ff,thickness:4,opacity:100}});
						selectFeature.setGeometry(geometry);
						var centerPoint = gmxAPI.map.getCenter( geometry );
						gmxAPI.map.slideTo(centerPoint[0],centerPoint[1],gmxAPI.map.getZ());
					}
				});
			}

			function actionCell(layerName){
				$("img[id='zoom']").click(function(){
					var aPos = table.fnGetPosition( $(this).parent('td').parent('tr')[0] );
					var aData = table.fnGetData();
					var ogc_fid=aData[ aPos ][1];
					zoomTopoint(ogc_fid,layerName);
				});

				$("img[id='edit']").click(function(){
					var aPos = table.fnGetPosition( $(this).parent('td').parent('tr')[0] );
					var aData = table.fnGetData();
					var ogc_fid=aData[ aPos ][1];
					//var editLayer=gmxAPI.map.layers[searchLayerName[0]];
					var editLayer=gmxAPI.map.layers[layerName];
					zoomTopoint(ogc_fid,layerName);
					if (editLayer.properties.Access == 'edit'){
						if(ogc_fid) new nsGmx.EditObjectControl(/*editLayer.properties.name*/layerName,ogc_fid);
					}
				});
			}
			
			function initTable (sql,searchLayer,schema,union,url){
				if(table){
					$("#tableInfo").dataTable().fnDestroy();
					$('#resultDiv').empty().append('<table cellpadding="0" cellspacing="0" border="0" class="display" id="tableInfo"></table>');
				}
				table = $( '#tableInfo' ).dataTable({
					"bRetrieve": true,
					"iDisplayLength": 500,
					"bFilter": false,
					"bInfo": true,
					"bLengthChange": false,
					"oLanguage": translateTable,
					"bServerSide": true,
					"bSort": false,
					"aoColumns": schema,
					"bAutoWidth":true,
					"sScrollY": scrollHeight,
					"scrollX": true,
					"bScrollCollapse": true,
					"sAjaxSource": url || "/VectorLayer/Search.ashx?",
					"fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
						var queryPage;
						var pageStart;
						$.each(aoData,function(i,value){
							if(value.name=="iDisplayStart")
								queryPage = { "name": "page", "value": parseInt(value.value/500) };
						});
						aoData=[queryPage];
						aoData.push({ "name": "layer", "value": searchLayer});
						aoData.push({ "name": "query", "value": sql});
						aoData.push({ "name": "WrapStyle", "value": "window"});
						aoData.push({ "name": "geometry", "value": false});
						aoData.push({ "name": "count", "value": "add"});
						aoData.push({ "name": "pagesize", "value": 500});
						if(union && union.length>0){
							aoData.push({ "name": "tables", "value": union[0]});
							aoData.push({ "name": "columns", "value": union[1]});
						}
						
						if(url){
							aoData=[];
							oSettings.jqXHR = $.ajax({
								"type": "GET",
								"url": sSource,
								"data": aoData,
								"success": function(data){
									var count=0, feature=[], features=[];
									if(url.split("?")[0] == params.url[0] && data.samples){
										$.each(data.samples,function(index,value){
											if(value.expertiseDate && value.expertiseDate.toString().length>0) feature.push(value.expertiseDate);
											else feature.push("");

											if(value.expertiseNumber && value.expertiseNumber.toString().length>0) feature.push(value.expertiseNumber);
											else feature.push("");

											if(value.goalRD && value.goalRD.toString().length>0) feature.push(value.goalRD);
											else feature.push("");

											if(value.material && value.material.toString().length>0) feature.push(value.material);
											else feature.push("");

											if(value.researches && value.researches.toString().length>0) feature.push(value.researches.length);
											else feature.push("");

											if(value.sampleWeight && value.sampleWeight.toString().length>0) feature.push(value.sampleWeight);
											else feature.push("");

											if(value.samplingRD && value.samplingRD.toString().length>0) feature.push(value.samplingRD);
											else feature.push("");
											features.push(feature);
											count++;
										});
									}else if(url.split("?")[0] == params.url[1]){
										$.each(data,function(index,value){
											feature=[value.regionNumber,value.sampleCount,value.lastCreateDate];
											features.push(feature);
											count++;
										});
									}
									out={
										"iTotalRecords": count,
										"iTotalDisplayRecords": count,
										"aaData": features
									};
									fnCallback(out);

									(function(){
										$("a[id='regionNumber']").click(function(){
										 	var aPos = table.fnGetPosition( $(this).parent('td').parent('tr')[0] );
										 	var aData = table.fnGetData();
										 	var regionNumber = aData[ aPos ][0];
										 	schema=schemaRegionNumber;
										 	initTable(null,null,schema,null,params.url[0]+"?regionNumber=" + regionNumber);
										});
									})();
									var tempdata = $("#result").text();
									var replacedata = tempdata.replace(tempdata, "Результат поиска ");
									if(count>0){
										replacedata = tempdata.replace(tempdata,"Результат поиска " + count);
									}
									$("#result").html(replacedata);
								},
								"error":function(){
									alert("Ошибка получения данных");
								}
							});
						}else{
							var param={};
							for(var i=0;i<aoData.length;i++){
								param[aoData[i].name]=aoData[i].value;
							}
							
							var isFloat = function (n){
								return   n===Number(n)  && n%1!==0
							}

							var callback = function(data){
									var count=0;
									var features=[];
									if(data.Status=="ok" && data.Result.values.length>0){
										count=data.Result.Count;
										$.each(data.Result.values,function(index,value){
											var feature=[];
											feature.unshift("");
											var v = value;
											var f = data.Result.fields;
											if(param.layer == "8103DD8809C54022902596E782C20F28"){
												if(union.length){
													feature = [ "", 
																v[f.indexOf("gmx_id")], 
																v[f.indexOf("N")], 
																v[f.indexOf("N1985")],
																v[f.indexOf("N2008")], 
																v[f.indexOf("N2011")], 
																v[f.indexOf("AREA")], 
																v[f.indexOf("KN")], 
																"", 
																v[f.indexOf("REGION")], 
																v[f.indexOf("DISTRICT")],
																v[f.indexOf("reason")],
																v[f.indexOf("violation")],
																v[f.indexOf("date_init")],
																v[f.indexOf("case_num")],
																v[f.indexOf("inspector")]] ;
												}else{
													feature = [ "", 
																v[f.indexOf("gmx_id")], 
																v[f.indexOf("N")], 
																v[f.indexOf("N1985")],
																v[f.indexOf("N2008")], 
																v[f.indexOf("N2011")], 
																v[f.indexOf("AREA")], 
																v[f.indexOf("KN")], 
																"", 
																v[f.indexOf("REGION")], 
																v[f.indexOf("DISTRICT")]] ;
												}
											}else if(param.layer == "08396D11C8B445A5B6303F41FD094141"){
												for(var i=0; i<value.length; i++){
													feature.push(value[i]);
												}
											}
											features.push(feature);
										});
										
										
										var tempdata = $("#result").text();
										var replacedata = tempdata.replace(tempdata, "Результат поиска ");
										if(data.Result.Count>0){
											replacedata = tempdata.replace(tempdata,"Результат поиска " + data.Result.Count);
										}
										$("#result").html(replacedata);
									}
									out={
										"iTotalRecords": count,
										"iTotalDisplayRecords": count,
										"aaData": features
									};
									fnCallback(out);
									actionCell(searchLayer);
								}
							oSettings.jqXHR = sendCrossDomainPostRequest(sSource,param,callback);
						}
					},
                    fnInitComplete: function() {
                        this.fnAdjustColumnSizing(false);
                    }
                });
				return table;
			}

			$("#button").click(function(){
				sql="";
				url+="&layer="+searchLayerName[0]+"&geometry=false";			
				var inCad=$('input[id="inCad"]').val();
				if(inCad){
					inCad="(KN=\'"+inCad+"\')";
				}
				var sl2008="";
				$('input[name="sl2008"]').each(function(index,value){
					if(this.checked && sl2008.length!=0)
						sl2008+="or(N2008=\'"+this.value+"\')";
					else if(this.checked && sl2008.length==0)
						sl2008+="(N2008=\'"+this.value+"\')";
				});

				var sl2011="";
				$('input[name="sl2011"]').each(function(index,value){
					if(this.checked && sl2011.length!=0)
						sl2011+="or(N2011=\'"+this.value+"\')";
					else if(this.checked && sl2011.length==0)
						sl2011+="(N2011=\'"+this.value+"\')";
				});
				var sArea=$('input[id="sArea"]').val();
				if(sArea){
					if(sArea.indexOf("-")>0){
						sArea="(AREA>="+sArea.split("-")[0]+" AND AREA<="+sArea.split("-")[1]+")";
					} 
					else
						sArea="(AREA="+sArea+")";
				}
				var comboboxRegion=$("#comboboxRegion option:selected").val();
				if(comboboxRegion)
					comboboxRegion="(REGION=\'"+comboboxRegion+"\')";

				var comboboxArea=$("#comboboxArea option:selected").val();
				if(comboboxArea)
					comboboxArea="(DISTRICT=\'"+comboboxArea+"\')";

				if(inCad.length && sql.length==0)
					sql+=inCad;
				else if(inCad.length && sql.length!=0)
					sql+="and"+inCad;

				if(sl2008.length && sql.length==0)
					sql+=sl2008;
				else if(sl2008.length && sql.length!=0)
					sql+="and"+sl2008;

				if(sl2011.length && sql.length==0)
					sql+=sl2011;
				else if(sl2011.length && sql.length!=0)
					sql+="and"+sl2011;

				if(comboboxRegion && sql.length==0)
					sql+=comboboxRegion;
				else if(comboboxRegion && sql.length!=0)
					sql+="and"+comboboxRegion;

				if(comboboxArea && sql.length==0)
					sql+=comboboxArea;
				else if(comboboxArea && sql.length!=0)
					sql+="and"+comboboxArea;

				if(sArea.length && sql.length==0)
					sql+=sArea;
				else if(sArea.length && sql.length!=0)
					sql+="and"+sArea;
				
				url+="&pagesize=500";
				url+="&query="+sql;
				var union="";
				schema=[
					{
						"bSortable": false, "sWidth":"50px", "mData": null, "sTitle": "Действия", "bSearchable": false, "mRender": function () {
							return '<img src="img/choose.png" id="zoom" title="Показать" style="cursor: pointer; border: none;"><img src="img/edit.png" id="edit" title="Редактировать" style="cursor: pointer; border: none; margin-left: 5px; width: 12px;">';
						}
					}
					,{ "bVisible": false }
					,{ "bVisible": false }
					,{ "sTitle": "категория с\х участка, 1985", "mRender": function ( data, type, row ) {
						if(valueFiels[data])
							return valueFiels[data];
						else
							return "";
					}}
					,{ "sTitle": "категория с\х участка, 2008", "mRender": function ( data, type, row ) {return valueFiels[data];}}
					,{ "sTitle": "категория с\х участка, 2011", "mRender": function ( data, type, row ) {return valueFiels[data];}}
					,{ "sTitle": "Площадь, га"}
					,{ "sTitle": "Кадастровый номер"}
					,{ "bVisible": false }
					,{ "sTitle": "Регион"}
					,{ "sTitle": "Район"}
				];

				if($("#unionIn")[0].checked){
					//union = ['[{"LayerName":"'+searchLayerName[0]+'","Alias":"a"},{"LayerName":"'+searchLayerName[1]+'","Alias":"b","Join":"Inner","On":"[a].[KN]=[b].[KN]"}]','[{"Value":"[a].[ogc_fid]"},{"Value":"[a].[N]"},{"Value":"[a].[N1985]"},{"Value":"[a].[N2008]"},{"Value":"[a].[N2011]"},{"Value":"[a].[AREA]"},{"Value":"[a].[KN]"},{"Value":"[a].[CATEGORY]"},{"Value":"[a].[REGION]"},{"Value":"[a].[DISTRICT]"},{"Value":"[b].[reason]"},{"Value":"[b].[violation]"},{"Value":"[b].[date_init]"},{"Value":"[b].[case_num]"},{"Value":"[b].[inspector]"}]'];
					union = ['[{"LayerName":"'+searchLayerName[0]+'","Alias":"a"},{"LayerName":"'+searchLayerName[1]+'","Alias":"b","Join":"Inner","On":"[a].[KN]=[b].[KN]"}]','[{"Value":"[a].[gmx_id]"},{"Value":"[a].[N]"},{"Value":"[a].[N1985]"},{"Value":"[a].[N2008]"},{"Value":"[a].[N2011]"},{"Value":"[a].[AREA]"},{"Value":"[a].[KN]"},{"Value":"[a].[CATEGORY]"},{"Value":"[a].[REGION]"},{"Value":"[a].[DISTRICT]"},{"Value":"[b].[reason]"},{"Value":"[b].[violation]"},{"Value":"[b].[date_init]"},{"Value":"[b].[case_num]"},{"Value":"[b].[inspector]"}]'];
					schema.push(
						{ "sTitle": "Основание для проведения проверки/обследования"}
						,{ "sTitle": "Выявленное нарушение"}
						,{ "sTitle": "Дата дела об админ.нарушении","mRender": function ( data, type, row ) {
							var result = "";
							if(data){
								result = new Date(data*1000).toLocaleDateString();
							}
							return result;
						}}
						,{ "sTitle": "№ дела об админ. нарушении"}
						,{ "sTitle": "Ф.И.О. инспектора проводившего проверку"}
					);
				}
					
				initTable(sql,searchLayerName[0],schema,union);

				$('#dload').remove();
				$('#resultDiv').append('<div id="dload"><input id="shpLoad" type="image" src="'+plugin_path+'images/SaveShp.png" onMouseOver="this.src='+"'"+plugin_path+'images/SaveShp-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/SaveShp.png\'"><input id="csvLoad" style="margin-left:8px;" type="image" src="'+plugin_path+'images/SaveCsv.png" onMouseOver="this.src='+"'"+plugin_path+'images/SaveCsv-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/SaveCsv.png\'"></div>');
				$("#accordion").accordion('option', 'active' , 1);
				calcHeight();
				
				$('#shpLoad').click(function(){
					var name = searchLayerName[0];
					var mapHostName = gmxAPI.getAPIHost();
					var format = "Shape";
					var query = sql;
					if(nsGmx.AuthManager.isLogin())
						_layersTree.downloadVectorLayer(name, mapHostName, format, query);
					else
						alert("Для скачивания необходимо авторизоваться");
				});
				$('#csvLoad').click(function(){
					var name = searchLayerName[0];
					var mapHostName = gmxAPI.getAPIHost();
					var format = "csv";
					var query = sql;
					if(nsGmx.AuthManager.isLogin())
						_layersTree.downloadVectorLayer(name, mapHostName, format, query);
					else
						alert("Для скачивания необходимо авторизоваться");
				});
				if(union.length>0)
					$('#dload').remove();
			});

			$("#chButton").click(function(){
				schema=[
					{
						"bSortable": false, "mData": null, "sWidth": "50px", "sTitle": "Действия", "bSearchable": false, "mRender": function () {
							return '<img src="img/choose.png" id="zoom" title="Показать" style="cursor: pointer; border: none;"><img src="img/edit.png" id="edit" title="Редактировать" style="cursor: pointer; border: none; margin-left: 5px; width: 12px;">';
						}
					}
					,{ "sTitle": "Номер проверки"}
					,{ "bVisible": false }
					,{ "sTitle": "Кадастровый номер"}
					,{ "sTitle": "Муниципальный район"}
					,{ "sTitle": "Проконтролировано (га)"}
					,{ "sTitle": "Основание для проведения проверки/обследования"}
					,{ "sTitle": "Дата и № распоряжения проведение на проверки/обследования"}
					,{ "sTitle": "Сроки проведения проверки/обследования по распоряжению"}
					,{ "sTitle": "Дата и № акта проверки/обследовательских мероприятий"}
					,{ "sTitle": "Выявленное нарушение"}
					,{ "sTitle": "Квалификация по ст. КоАП РФ"}
					,{ "sTitle": "Направлены по подведомственности (в орган)"}
					,{ "sTitle": "Дата дела об админ.нарушении","mRender": function ( data, type, row ) {
						var result = "";
						if(data){
							result = new Date(data*1000).toLocaleDateString();
						}
						return result;
					}}
					,{ "sTitle": "№ дела об админ. нарушении"}
					,{ "sTitle": "Квалификация по ст. КоАП РФ"}
					,{ "sTitle": "Сведения о юридическом или физическом лице, в отношении которого проводилась проверка"}
					,{ "sTitle": "ИНН"}
					,{ "sTitle": "Дата и № вынесения постановления"}
					,{ "sTitle": "Квалификация по ст. КоАП РФ"}
					,{ "sTitle": "Сумма штрафа (тыс.руб.) - НАЛОЖЕНО"}
					,{ "sTitle": "Сумма штрафа (тыс.руб.) - ВЗЫСКАНО"}
					,{ "sTitle": "Ф.И.О. инспектора проводившего проверку"}
					,{ "sTitle": "Дата и № протокола испытания по отбору проб"}
					,{ "sTitle": "Лаборатория, проводившая испытания"}
					,{ "sTitle": "Примечание (обжалование, ликвидация организации и т.д.)"}
					,{ "sTitle": "Фотоматериалы"}
					,{ "sTitle": "Регион"}
				];

				sql="";
				url+="&layer="+searchLayerName[1]+"&geometry=false";
				
				var chCad=$('input[id="chCad"]').val();
				if(chCad){
					chCad="(KN=\'"+chCad+"\')";
				}

				var dataReg=$('input[id="dataReg"]').val();
				if(dataReg){
					dataReg="(date_init=\'"+dataReg+"\')";
				}

				var chComboboxRegion=$("#chRegion option:selected").val();
				if(chComboboxRegion)
					chComboboxRegion="(region=\'"+chComboboxRegion+"\')";

				var chArea=$("#chArea option:selected").val();
				if(chArea)
					chArea="(loc_region=\'"+chArea+"\')";

				if(chCad.length && sql.length==0)
					sql+=chCad;
				else if(chCad.length && sql.length!=0)
					sql+="and"+chCad;

				if(dataReg.length && sql.length==0)
					sql+=dataReg;
				else if(dataReg.length && sql.length!=0)
					sql+="and"+dataReg;

				if(chComboboxRegion.length && sql.length==0)
					sql+=chComboboxRegion;
				else if(chComboboxRegion.length && sql.length!=0)
					sql+="and"+chComboboxRegion;

				if(chArea.length && sql.length==0)
					sql+=chArea;
				else if(chArea.length && sql.length!=0)
					sql+="and"+chArea;
				
				url+="&pagesize=500";
				url+="&query="+sql;
				initTable(sql,searchLayerName[1],schema);

				$("#accordion").accordion('option', 'active' , 1);
				calcHeight()
				$('#dload').remove();
				$('#resultDiv').append('<div id="dload"><input id="shpLoad" type="image" src="'+plugin_path+'images/SaveShp.png" onMouseOver="this.src='+"'"+plugin_path+'images/SaveShp-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/SaveShp.png\'"><input id="csvLoad" style="margin-left:8px;" type="image" src="'+plugin_path+'images/SaveCsv.png" onMouseOver="this.src='+"'"+plugin_path+'images/SaveCsv-active.png\'" onMouseOut="this.src='+"'"+plugin_path+'images/SaveCsv.png\'"></div>');
				
				$('#shpLoad').click(function(){
					var name = searchLayerName[1];
					var mapHostName = gmxAPI.getAPIHost();
					var format = "Shape";
					var query = sql;
					if(nsGmx.AuthManager.isLogin())
						_layersTree.downloadVectorLayer(name, mapHostName, format, query);
					else
						alert("Для скачивания необходимо авторизоваться");
				});
				$('#csvLoad').click(function(){
					var name = searchLayerName[1];
					var mapHostName = gmxAPI.getAPIHost;
					var format = "csv";
					var query = sql;
					if(nsGmx.AuthManager.isLogin())
						_layersTree.downloadVectorLayer(name, mapHostName, format, query);
					else
						alert("Для скачивания необходимо авторизоваться");
				});
			});
			
			$( "#tabs" ).tabs();
			$("#accordion").accordion({
				heightStyle: "fill",
				// autoHeight:false,
				icons: { "header": "arrow2", "activeHeader": "arrow1" }
			});
            // $( "#accordion" ).accordion( "refresh" );
		}
				
		function onCancelQuery(){
			gmxAPI._tools.standart.selectTool('move');
		}
		
		function converting(x,y){
			var lat=61,lon=56;
			if ((Math.abs(x) > 20037508.3427892) || (Math.abs(y) > 20037508.3427892))
				return;

			lat = ((x / 6378137.0) * 57.295779513082323) - (Math.floor((((x / 6378137.0) * 57.295779513082323) + 180.0) / 360.0) * 360.0);
			lon = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0))))* 57.295779513082323;

			gmxAPI.map.slideTo(lat,lon,gmxAPI.map.getZ());

			return {type: "POINT", coordinates: [lat,lon]};
		}

		function getGeocode(geometry,control){
			sendCrossDomainJSONRequest("http://geocode.kosmosnimki.ru/SearchObject/SearchAddress.ashx?"+
				"WithoutGeometry=1&"+
				"RequestType=SearchObject&"+
				"GeometryJSON=" + JSON.stringify(geometry), function(response){
				if(response && response.Status == "ok" && response.Result.length > 0)
					control.set("region", "");
					control.set("loc_region", "");
					$.each(response.Result[0].SearchResult,function(i,value){
						if( value.TypeName == "область" ){
							control.set("region",value.ObjName);
						}
						if( value.TypeName == "муниципальный район" ){
							control.set("loc_region",value.ObjName);
						}
					});
			});
		}

		function onClickCheck(){
			if(!nsGmx.AuthManager.isLogin()){
				alert("Для создания проверок необходимо авторизоваться");
				return;
			}

			if(checkVisible) return;
			checkVisible=true;
			var kadNum=null;

			if(!editControl){
				editControl = new nsGmx.EditObjectControl(searchLayerName[1], null, {
					allowDuplicates:false,
					fields: [
						{name: 'ID', title: 'ID'}
						,{name: 'KN', title: 'Кадастровый номер', index: 10, isRequired: true, validate: function(value) {return value.length > 2;}}
						,{name: 'region', title: 'Регион', index: 8}
						,{name: 'loc_region',title: 'Муниципальный район', index: 7}
						,{name: 'inspec_ha',title: 'Проконтролировано (га)'}
						,{name: 'reason',title: 'Основание для проведения проверки/обследования'}
						,{name: 'order_',title: 'Дата и № распоряжения проведение на проверки/обследования'}
						,{name: 'inspec_terms',title: 'Сроки проведения проверки/обследования по распоряжению'}
						,{name: 'act',title: 'Дата и № акта проверки/обследовательских мероприятий'}
						,{name: 'violation',title: 'Выявленное нарушение'}
						,{name: 'qual1',title: 'Квалификация по ст. КоАП РФ'}
						,{name: 'redirect',title: 'Направлены по подведомственности (в орган)'}
						,{name: 'date_init',title: 'Дата дела об админ.нарушении', index: 9, isRequired: true, validate: function(value) {return value.length > 2;}}
						,{name: 'case_num',title: '№ дела об админ. нарушении'}
						,{name: 'qual2',title: 'Квалификация по ст. КоАП РФ '}
						,{name: 'violator_i',title: 'Сведения о юридическом или физическом лице, в отношении которого проводилась проверка'}
						,{name: 'INN',title: 'ИНН'}
						,{name: 'decree',title: 'Дата и № вынесения постановления'}
						,{name: 'qual3',title: 'Квалификация по ст. КоАП РФ'}
						,{name: 'fine1',title: 'Сумма штрафа (тыс.руб.) - НАЛОЖЕНО'}
						,{name: 'fine2',title: 'Сумма штрафа (тыс.руб.) - ВЗЫСКАНО'}
						,{name: 'inspector',title: 'Ф.И.О. инспектора проводившего проверку'}
						,{name: 'sample',title: 'Дата и № протокола испытания по отбору проб '}
						,{name: 'laboratory',title: 'Лаборатория, проводившая испытания'}
						,{name: 'note',title: 'Примечание (обжалование, ликвидация организации и т.д.)'}
						,{name: 'photo',title: 'Фотоматериалы'}
					],
					geometryUI: $('<span><div style="float:left;"><a id="getMap" class="button button_blue button_point" title="Получить геометрию с карты"></a><a id="getRosreestr" class="button button_blue button_rosreestr" title="Получить геометрию из росреестра"></a></div><div id="mapLoader"></div></span>')[0]

				});
				editControl.close = function(){
					editControl = null;
					onCancelCheck();
				}
				$("#getMap").click(function(){
					var mapListener,geom;
					nsGmx.Controls.chooseDrawingBorderDialog("getPointFromMap",
						function(obj){
							geom = obj.getGeometry();
							editControl.setGeometry(obj);
							getGeocode(geom,editControl);
						},{
							title: "Выбор проверки",
							geomType: "POINT",
							errorTitle: "Ошибка",
							errorMessage: "Нет подходящих объектов на карте",
							width:"300px"
						});
				});
				$("#getRosreestr").click(function(){
					var kn=editControl.get('KN').trim();
					var x,y,geometry;
					if(/^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,7}:[0-9]{1,4}$/.test( kn ) ){
						$("#mapLoader").show();
						$.ajax({
							url: 'http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/exts/GKNServiceExtension/online/parcel/find',							
							type: "GET",
							dataType: 'jsonp',
							async: true,
							data: ({
								cadNum: kn,
								onlyAttributes: false,
								returnGeometry: true,
								f: 'json'
							}),
							beforeSend: function(){},
							error:  function(){
								alert("Геометрия объекта не получена от росреестра.");
							},
							success: function(data) {
								$("#mapLoader").hide();
								if(data.features.length>0 && typeof(data.features[0].attributes)=="object" && data.features[0].attributes.YC && data.features[0].attributes.YC){
									x=data.features[0].attributes.XC;
									y=data.features[0].attributes.YC;
									geometry = converting(x,y);

									editControl.setGeometry(new gmxAPI.map.drawing.addObject(geometry));
									getGeocode(geometry,editControl);
								}
							}
						});
					}
					else{
						alert('Кадастровый номер имеет не правильный формат!')
					}
				});
			}
		}

		function onCancelCheck(){
			checkVisible=false;
			gmxAPI._tools.standart.selectTool('move');
		}

		var queryTool = {
			'key': "query_tool",
			'activeStyle': {},
			'regularStyle': {'paddingLeft': '2px'},
			'regularImageUrl': plugin_path + "table.png",
			'activeImageUrl': plugin_path + "table_refresh.png",
			'onClick': onClickQuery,
			'onCancel': onCancelQuery,
			'hint': gmxAPI.KOSMOSNIMKI_LOCALIZED("Поиск по запросу", "query search")
		};

		var creatCheck = {
			'key': "check_tool",
			'activeStyle': {},
			'regularStyle': {'paddingLeft': '2px'},
			'regularImageUrl': plugin_path + "check.png",
			'activeImageUrl': plugin_path + "check_active.png",
			'onClick': onClickCheck,
			'onCancel': onCancelCheck,
			'hint': gmxAPI.KOSMOSNIMKI_LOCALIZED("Создать проверку", "create check")
		};

		gmxAPI._tools.standart.addTool( 'queryTool', queryTool);
		gmxAPI._tools.standart.addTool( 'creatCheck', creatCheck);
	}
};

window.gmxCore && window.gmxCore.addModule('querySearch', publicInterface,{
		init: function(module, path){
			return $.when(
				gmxCore.loadScript(path+'jquery.dataTables.min.js')
				,gmxCore.loadScript(path+'dateRange.js')
				,gmxCore.loadScript(path+'jquery.dialog.minimize.js')
				,gmxCore.loadScript(path+'html5placeholder.jquery.js')
			);
		},
		css: 'querySearch.css'
	});
})();