var basePath = CKEDITOR.basePath;
basePath = basePath.substr(0, basePath.indexOf("ckeditor/"));   

//load external plugin
(function() {
   CKEDITOR.plugins.addExternal('gmxFBImgsLoad',basePath+'gmxFBImgsLoad/', 'gmxFBImgsLoad.js');
})();

// config for toolbar, extraPlugins,...
CKEDITOR.editorConfig = function( config )
{
   config.extraPlugins = 'gmxFBImgsLoad';

};