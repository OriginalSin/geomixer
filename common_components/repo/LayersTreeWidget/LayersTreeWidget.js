var nsGmx = nsGmx || {};

// options.LayersTree
// options.maxDepth
// options.popoverOptions
// options.showDebugIcon
// options.showCenterIcon
// options.customViews
nsGmx.LayersTreeWidget = nsGmx.GmxWidget.extend({
    className: 'layersTreeWidget ui-widget',
    options: {
        maxDepth: Infinity,
        showInfoIcon: true,
        showDebugIcon: false,
        showCenterIcon: false,
        customViews: {},
        isMobile: false,
        popoversOptions: {
            container: 'body',
            animation: true,
            placement: 'left',
            html: true,
            delay: 1
        }
    },
    events: {
        'wheel': 'reset'
    },
    initialize: function(options) {
        this.options = $.extend(true, this.options, {
            isMobile: nsGmx.Utils &&
                nsGmx.Utils.isMobile &&
                nsGmx.Utils.isMobile()
        }, options);
        this.render();
    },
    render: function() {
        var ltree = this.options.layersTree || this.model;
        if (!ltree.get('childrenNodes')) {
            return;
        }
        this.$el.empty();
        for (var i = 0; i < ltree.get('childrenNodes').length; i++) {
            var childView = new nsGmx.LayersTreeWidget.NodeView({
                model: ltree.get('childrenNodes').at(i),
                rootView: this,
                parentView: this,
                widgetOptions: this.options
            });
            childView.appendTo(this.$el);
        }
    },
    reset: function() {
        if (this._activePopoverView) {
            this._activePopoverView.reset();
        }
        this._activePopoverView = null;
    },
    setActivePopoverView: function(view) {
        this.reset();
        this._activePopoverView = view;
    },
    getActivePopoverView: function() {
        return this._activePopoverView;
    }
});
