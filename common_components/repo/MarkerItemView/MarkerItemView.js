nsGmx.MarkerItemView = nsGmx.GmxWidget.extend({
    className: 'gmx-listNode markerItemView ui-widget-content',
    events: {
        'click': function() {
            this._expanded ? this.collapse() : this.expand();
        }
    },
    initialize: function() {
        this.collapse();
    },
    render: function() {
        var style = this.model.get('styles') && this.model.get('styles')[0];
        var iconUrl = style && style.RenderStyle.iconUrl;
        if (this._expanded) {
            this.$el.html(
                _.template(nsGmx.Templates.MarkerItemView.expanded)({
                    title: this.model.get('title'),
                    description: this.model.get('description'),
                    date: this.model.get('date'),
                    url: this.model.get('url'),
                    iconUrl: iconUrl
                })
            );
            this.$el.find('.markerItemViewExpanded-locationIcon').on('click', function(je) {
                je.stopPropagation();
                this.trigger('marker', this.model);
            }.bind(this));
        } else {
            this.$el.html(
                _.template(nsGmx.Templates.MarkerItemView.collapsed)({
                    title: this.model.get('title'),
                    date: this.model.get('date'),
                    iconUrl: iconUrl
                })
            );
        }
        return this;
    },
    expand: function() {
        this.trigger('expanding');
        this.$el.addClass('markerItemViewExpanded');
        this.$el.removeClass('markerItemViewCollapsed');
        this._expanded = true;
        this.render();
        this.trigger('expanded');
        this.trigger('resize');
    },
    collapse: function() {
        this.trigger('collapsing');
        this.$el.removeClass('markerItemViewExpanded');
        this.$el.addClass('markerItemViewCollapsed');
        this._expanded = false;
        this.render();
        this.trigger('collapsed');
        this.trigger('resize');
    }
});
