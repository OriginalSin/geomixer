nsGmx.LayersTreeWidget.NodeView = nsGmx.GmxWidget.extend({
    className: 'layersTreeWidgetNode',
    initialize: function(options) {
        this.options = _.extend(this.options || {}, options);
        this.hasChildren = !!this.model.get('childrenNodes') && (this.model.get('depth') < this.options.widgetOptions.maxDepth);
        this.render();
        this.model.on('change:expanded', function() {
            this.options.rootView.reset();
            this.render();
            this.options.rootView.trigger('resize');
        }.bind(this));
    },
    render: function() {
        this.$el.empty();
        delete this.contentView;

        this.$contentContainer = $('<div>')
            .addClass('layersTreeWidgetNode-content')
            .addClass('ui-widget-content')
            .addClass('gmx-listNode')
            .appendTo(this.$el);

        if (!this.options.widgetOptions.isMobile) {
            this.$contentContainer.on('mouseenter', function() {
                this.$contentContainer.addClass('ui-state-hover');
            }.bind(this)).on('mouseleave', function() {
                this.$contentContainer.removeClass('ui-state-hover');
            }.bind(this));
        }

        this.$childrenContainer = $('<div>')
            .addClass('layersTreeWidgetNode-children')
            .appendTo(this.$el);

        var id = this.model.get('properties').LayerID || this.model.get('properties').GroupID;
        if (this.options.widgetOptions.customViews[id]) {
            this.contentView = new this.options.widgetOptions.customViews[id]({
                model: this.model,
                rootView: this.options.rootView,
                parentView: this,
                widgetOptions: this.options.widgetOptions
            });
        } else {
            if (this.hasChildren) {
                this.contentView = new nsGmx.LayersTreeWidget.GroupView({
                    model: this.model,
                    rootView: this.options.rootView,
                    parentView: this,
                    widgetOptions: this.options.widgetOptions
                });

                if (this.model.get('expanded')) {
                    for (var i = 0; i < this.model.get('childrenNodes').length; i++) {
                        var childView = new nsGmx.LayersTreeWidget.NodeView({
                            model: this.model.get('childrenNodes').at(i),
                            rootView: this.options.rootView,
                            parentView: this,
                            widgetOptions: this.options.widgetOptions
                        });
                        childView.appendTo(this.$childrenContainer);
                    }
                }
            } else {
                this.contentView = new nsGmx.LayersTreeWidget.LayerView({
                    model: this.model,
                    rootView: this.options.rootView,
                    parentView: this,
                    widgetOptions: this.options.widgetOptions
                });
            }
        }

        this.contentView.appendTo(this.$contentContainer);
        return this;
    }
});
