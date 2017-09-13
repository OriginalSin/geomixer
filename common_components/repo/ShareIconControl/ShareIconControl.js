var nsGmx = window.nsGmx = window.nsGmx || {};

nsGmx.ShareIconControl = L.Control.gmxIcon.extend({
    options: {
        className: 'svgIcon',
        id: 'share',
        text: null
    },
    onAdd: function (map) {
        this._container = L.Control.gmxIcon.prototype.onAdd.apply(this, arguments);
        this._shareDialogContainer = L.DomUtil.create('div', 'shareDialogContainer');

        $(this._container).popover({
            content: this._shareDialogContainer,
            container: 'body',
            placement: 'bottom',
            html: true
        });

        $(this._container).on('shown.bs.popover', function () {
            var shareDialog = new nsGmx.ShareIconControl.ShareDialog(_.pick(this.options, [
                'permalinkUrlTemplate',
                'embeddedUrlTemplate',
                'winnieUrlTemplate',
                'previewUrlTemplate',
                'embedCodeTemplate',
                'permalinkManager'
            ]));
            shareDialog.appendTo(this._shareDialogContainer);
        }.bind(this));

        $(this._container).on('hide.bs.popover', function () {
            $(this._shareDialogContainer).empty();
        }.bind(this));

        $(this._container).attr('title', "Ссылка на карту");

        return this._container;
    }
});