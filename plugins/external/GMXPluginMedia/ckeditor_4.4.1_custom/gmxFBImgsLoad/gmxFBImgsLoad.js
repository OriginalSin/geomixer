CKEDITOR.plugins.add('gmxFBImgsLoad',
{
    init: function (editor) 
	{
        var pluginName = 'gmxFBImgsLoad';
        editor.ui.addButton('gmxFB',
            {
                label: "Загрузить изображение через файл-браузер ГеоМиксера",
                command: 'gmx Load Images',
                icon: 'gmxFBImgsLoad/gmxFBImgsLoad_icon.gif'
            });
        var cmd = editor.addCommand('gmx Load Images', { exec: gmxLoadImg });
    }
});
	var fb = new fileBrowser(),
		imagesDir = nsGmx.AuthManager.getUserFolder() + 'images';
		
	fb._path.set(imagesDir);

    function gmxLoadImg()
	{
        var gmxImgLoadInputDialog = $('<div><div class="media-desc-img-load-title">Ссылка на медиафайл</div><input id="media-desc-gmxImgLoadInput" class="inputStyle"></input><button id="media-desc-fbload"><img src="img/choose2.png"></img></button><button id="media-desc-savegmxImg">Ok</button></div>'),
			additExts = ['7z', 'zip', 'rar', 'pdf'],
			mediaFileName;
		
		for ( var instance in CKEDITOR.instances ){
			var currentInstance = instance;
			break;
        };
		
		gmxImgLoadInputDialog.dialog(
		{
			width: 414,
			height: 90,
			modal: true,
			dialogClass: 'desc-dialog',
			close: function() {gmxImgLoadInputDialog.remove()}
		});
        
		$('#media-desc-fbload').click(function() {	
			var browseload = $('#media-desc-gmxImgLoadInput');
            sendCrossDomainJSONRequest(serverBase + 'FileBrowser/CreateFolder.ashx?WrapStyle=func&FullName=' + encodeURIComponent(imagesDir), function(response) {
				if (!parseResponse(response))
				return;
				fb.createBrowser(("Медиа-файл"), ['jpg', 'jpeg', 'png', '7z', 'rar', 'zip', 'pdf'], function(path) {
					var relativePath = path.substring(imagesDir.length);
					if (relativePath[0] == '\\') 
					relativePath = relativePath.substring(1);
					var med_end = encodeURIComponent(relativePath),
						ext = med_end.substr((med_end.lastIndexOf('.') +1));
					
					if (additExts.indexOf(ext) !== -1) {
						browseload.value = serverBase + "GetImage.ashx?usr=" + encodeURIComponent(nsGmx.AuthManager.getNickname()) +  "&asAttach=true" +  "&img=" + encodeURIComponent(relativePath);
						mediaFileName = relativePath.substring(relativePath.indexOf("\\")+1);
					}
					else {
						browseload.value = serverBase + "GetImage.ashx?usr=" + encodeURIComponent(nsGmx.AuthManager.getNickname()) + "&img=" + encodeURIComponent(relativePath);
					}				  

					$('#media-desc-gmxImgLoadInput').val(browseload.value);
					var new_fbPath = fb._path.get();
					fb._path.set(new_fbPath);
                });
                    
		    });
		});
                     
		$('#media-desc-savegmxImg').click(function() {	
			var href = $('#media-desc-gmxImgLoadInput').val(),
				prevImg = new Image(),
				finalH='',
				finalW='',
				media_end = $('#media-desc-gmxImgLoadInput').val().toLowerCase(),
				extension = media_end.substr((media_end.lastIndexOf('.') +1)),
				tempURL = $('#media-desc-gmxImgLoadInput').val();
		    
		    if (mediaFileName == null) { 
				mediaFileName = decodeURIComponent(tempURL.substr((tempURL.lastIndexOf('/') +1)));
			}			
			
			if (additExts.indexOf(extension) !== -1) {
                
				CKEDITOR.instances[currentInstance].insertHtml(' <a href="'+tempURL+'" target="_blank"> ' + mediaFileName + '</a> ');
				gmxImgLoadInputDialog.remove();
            } 		
			else {
				prevImg.onerror = function() {
					alert (_gtxt('mediaPlugin2.mediaDescImgDialogError.alert'));
				}
			
				prevImg.onload = function() { 
					var ImageListDialogHeight = 650,
						ImageListDialogWidth = 450,
						realpicHeight = prevImg.height,
						realpicWidth = prevImg.width,
						scale = Math.min(1, Math.min(ImageListDialogWidth/realpicWidth, ImageListDialogHeight/realpicHeight)),
						limgH=realpicHeight*scale,
						limgW=realpicWidth*scale,
					
					finalH=limgH;
					finalW=limgW;

					var storeData = $('#noteDialogInput').val(),
						imgHREF = $('#media-desc-gmxImgLoadInput').val(),
						imginp = '<p class="imgMedia" style="text-align:center;"><img src="'+imgHREF+'" style="width:100%; height:100%; max-width:'+finalW+'px; max-height:'+finalH+'px;"></img></p>';

					CKEDITOR.instances[currentInstance].insertHtml('<br /> ' + imginp + '<br /> ');
					gmxImgLoadInputDialog.remove();	
				}
			
				prevImg.src = href;
			}			
		});
	}