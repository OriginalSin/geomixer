nsGmx.LayersTreeWidget.LayerView = nsGmx.LayersTreeWidget.ContentView.extend({
    events: {
        'mouseenter': '_onMouseEnter',
        'mouseleave': '_onMouseLeave'
    },
    initialize: function(options) {
        this.options = _.extend(this.options || {}, options);
        this.render();
        this.model.on('change', this.render.bind(this));
    },
    render: function() {
        nsGmx.LayersTreeWidget.ContentView.prototype.render.apply(this, arguments);

        this.$primaryIcon.addClass('icon-check')
            .toggleClass('layersTreeWidget-contentView-icon_hidden', !this.model.get('visible'))
            .on('click', function(je) {
                this.model.setNodeVisibility(!this.model.get('visible'));
            }.bind(this));

        this.$title.html(this._getMetaProperty('title'))
            .on('click', function(je) {
                this.model.setNodeVisibility(!this.model.get('visible'));
            }.bind(this));

        this.options.widgetOptions.showCenterIcon && this._addCenterIcon();
        this.options.widgetOptions.showInfoIcon && this._addInfoIcon();

        if (this.options.widgetOptions.isMobile) {
            this._showIcons();
        } else {
            this._hideIcons();
        }

        return this;
    },
    reset: function() {
        this.$('.layersTreeWidget-popover').popover('hide');
        if (!this._mouseOver && !this.options.widgetOptions.isMobile) {
            this._hideIcons();
        }
    },
    _onMouseEnter: function() {
        this._mouseOver = true;
        if (!this.options.widgetOptions.isMobile) {
            this._showIcons();
        }
    },
    _onMouseLeave: function() {
        this._mouseOver = false;
        if (this.options.widgetOptions.isMobile) {
            return;
        }
        if (
            (!this.options.rootView.getActivePopoverView() ||
                (this.model.get('id') !== this.options.rootView.getActivePopoverView().model.get('id'))
            )
        ) {
            this._hideIcons();
        }
    },
    _getMetaProperty: function (propName) {
        var props = this.model.get('properties');
        var metaProps = props.MetaProperties;
        var propEng = metaProps && metaProps[propName + '_eng'] && metaProps[propName + '_eng'].Value;
        var propRus = metaProps && metaProps[propName + '_rus'] && metaProps[propName + '_rus'].Value;
        var lang = (nsGmx.Translations && nsGmx.Translations.getLanguage()) || rus;
        return lang === 'eng' ? (propEng || propRus || props[propName]) : (propRus || props[propName]);
    },
    _addCenterIcon: function() {
        this._addIcon('center', 'icon-target').on('click', function() {
            this.options.rootView.trigger('centerLayer', this.model);
        }.bind(this));
    },
    _addInfoIcon: function() {
        var infoProperty = this._getMetaProperty(this.options.widgetOptions.popoversContent === 'legend' ? 'Legend' : 'description')
        if (!$ || !$.fn.popover || !infoProperty) {
            return;
        }

        var popoverOptions = _.extend({
            content: infoProperty,
            trigger: this.options.widgetOptions.isMobile ? 'click' : 'hover'
        }, this.options.widgetOptions.popoversOptions);

        var $icon = this._addIcon('info', 'icon-info')
            .addClass('layersTreeWidget-popover')
            .popover(popoverOptions);

        $icon.on('hidden.bs.popover', function() {
            setTimeout(function() {
                if (this.options.rootView.getActivePopoverView() === this) {
                    this.options.rootView.setActivePopoverView(null);
                }
            }.bind(this), 0);
        }.bind(this));

        if (popoverOptions.trigger === 'click') {
            $icon.on('click', function() {
                this.options.rootView.setActivePopoverView(this)
            }.bind(this));
        }

        return $icon;
    }
});
