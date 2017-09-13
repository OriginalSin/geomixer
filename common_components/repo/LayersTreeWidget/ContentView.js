nsGmx.LayersTreeWidget.ContentView = nsGmx.GmxWidget.extend({
    className: 'gmx-listNode layersTreeWidgetNode-contentView',
    render: function() {
        this.$el.html(nsGmx.Templates.LayersTreeWidget.contentView);
        this.$iconsContainer = this.$el.find('.gmx-table');
        this.$primaryIcon = this.$el.find('.layersTreeWidget-contentView-primaryIcon');
        this.$title = this.$el.find('.layersTreeWidget-contentView-title');
    },
    _addIcon: function(id, iconClass) {
        var $buttonCell = $('<div>')
            .addClass('gmx-table-cell')
            .addClass('layersTreeWidget-contentView-' + id + 'IconCell');
        var $buttonIcon = $('<i>')
            .addClass('layersTreeWidget-contentView-icon')
            .addClass('layersTreeWidget-contentView-secondaryIcon')
            .addClass('layersTreeWidget-contentView-activeArea')
            .addClass('layersTreeWidget-contentView-' + id + 'Icon')
            .addClass(iconClass)
            .appendTo($buttonCell);
        $buttonCell.appendTo(this.$iconsContainer);
        return $buttonIcon;
    },
    _showIcons: function() {
        this.$el.find('.layersTreeWidget-contentView-secondaryIcon')
            .removeClass('layersTreeWidget-contentView-icon_hidden');
    },
    _hideIcons: function() {
        this.$el.find('.layersTreeWidget-contentView-secondaryIcon')
            .addClass('layersTreeWidget-contentView-icon_hidden');
    }
});
