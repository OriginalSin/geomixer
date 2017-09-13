nsGmx.LayersTreeWidget.GroupView = nsGmx.LayersTreeWidget.ContentView.extend({
    initialize: function(options) {
        this.options = _.extend(this.options || {}, options);
        this.render();
        this.model.on('change', this.render.bind(this));
        if (!this.options.widgetOptions.isMobile) {
            this.$el.on('mouseenter', this._showIcons.bind(this));
            this.$el.on('mouseleave', this._hideIcons.bind(this));
        }
    },
    render: function() {
        nsGmx.LayersTreeWidget.ContentView.prototype.render.apply(this, arguments);

        this.$title.html(this.model.get('properties').title)
            .on('click', function(je) {
                this.model.set('expanded', !this.model.get('expanded'));
            }.bind(this));
        this.$primaryIcon
            .toggleClass('icon-right-dir', !this.model.get('expanded'))
            .toggleClass('icon-down-dir', this.model.get('expanded'))
            .on('click', function(je) {
                this.model.set('expanded', !this.model.get('expanded'));
            }.bind(this));

        this.options.widgetOptions.showCenterIcon && this._addCenterIcon();

        if (this.options.widgetOptions.isMobile) {
            this.model.get('expanded') ?
                this._showIcons() :
                this._hideIcons();
        } else {
            this._hideIcons();
        }

        return this;
    },
    _addCenterIcon: function() {
        this._addIcon('center', 'icon-target').on('click', function() {
            this.options.rootView.trigger('centerLayer', this.model);
        }.bind(this));
    }
});
