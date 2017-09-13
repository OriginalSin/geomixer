var nsGmx = nsGmx || {};

nsGmx.IconSidebarWidget = L.Class.extend({
    includes: [L.Mixin.Events, nsGmx.GmxWidgetMixin],

    options: {
        useAnimation: true,
        mobileScreenWidthLimit: 768
    },

    initialize: function(options) {
        this._createView();
        this._createMainAnimation();
        this._terminateMouseEvents();

        L.DomUtil.addClass(this._container, 'iconSidebarWidget-right');
        L.setOptions(this, options);

        window.addEventListener('resize', this._updateMobileClass.bind(this));
        this._updateMobileClass();
    },

    addTab: function(id, iconClass, position) {
        var tabEl = this._createTab(id, iconClass);
        position = typeof position === 'number' ? position : 0;
        tabEl.setAttribute('data-position', position);
        this._tabsContainer.appendChild(tabEl);
        var paneEl = this._createPane(id);
        this._panesContainer.appendChild(paneEl);
        L.DomEvent.on(tabEl, 'click', this._onTabClick, this);
        position && this._sortTabs();
        return paneEl;
    },

    open: function(tabId) {
        var previousTabId = this._activeTabId;
        this._activeTabId = tabId;
        if (!this._hasTab(tabId)) {
            throw new Error('tab \'' + tabId + '\' not found');
        }
        this._setActiveClass(tabId);
        if (previousTabId === tabId || !this._mainAnimation.isComplete()) {
            this.fire('opening');
            this._mainAnimation.forward().then(function() {
                this._isOpened = true;
                this.fire('opened', {
                    id: this._activeTabId
                });
                if (this._isStuck) {
                    this.fire('stick', {
                        isStuck: this._isStuck,
                        id: this._activeTabId
                    });
                }
            }.bind(this), function(err) {
                // do nothing
            });
        } else {
            this.fire('opened', {
                id: this._activeTabId
            });
        }
    },

    close: function() {
        if (this._mainAnimation.isComplete()) {
            this.fire('closing');
            this._mainAnimation.rewind().then(function() {
                this._isOpened = false;
                this._setActiveClass('');
                if (this._isStuck) {
                    this.fire('stick', {
                        isStuck: false,
                        id: this._activeTabId
                    });
                }
                this.fire('closed');
            }.bind(this), function(err) {
                // do nothing
            });
        } else {
            this.fire('opened', {
                id: this._activeTabId
            });
        }
    },

    _updateMobileClass: function() {
        if (window.innerWidth < this.options.mobileScreenWidthLimit) {
            if (!L.DomUtil.hasClass(this._container, 'iconSidebarWidget-mobile')) {
                L.DomUtil.addClass(this._container, 'iconSidebarWidget-mobile');
                this._isStuck = true;
                if (this._isOpened) {
                    this.fire('stick', {
                        isStuck: this._isStuck,
                        id: this._activeTabId
                    });
                }
            }
        } else {
            if (L.DomUtil.hasClass(this._container, 'iconSidebarWidget-mobile')) {
                L.DomUtil.removeClass(this._container, 'iconSidebarWidget-mobile');
                this._isStuck = false;
                if (this._isOpened) {
                    this.fire('stick', {
                        isStuck: this._isStuck,
                        id: this._activeTabId
                    });
                }
            }
        }
    },

    _createView: function() {
        var container = this._container = L.DomUtil.create('div', 'iconSidebarWidget');
        this._tabsContainer = L.DomUtil.create('ul', 'iconSidebarWidget-tabs', container);
        this._panesContainer = L.DomUtil.create('div', 'iconSidebarWidget-content', container);
        return container;
    },

    _createMainAnimation: function() {
        this._mainAnimation = new nsGmx.AnimationSequence([
            new nsGmx.CssAnimation({
                el: this._container,
                prefix: 'iconSidebarWidget',
                property: 'bottom',
                useAnimation: false
            }),
            new nsGmx.CssAnimation({
                el: this._container,
                prefix: 'iconSidebarWidget',
                property: 'width'
            })
        ]);
    },

    _createTab: function(tabId, ico) {
        var tabEl = L.DomUtil.create('li', 'iconSidebarWidget-tab');
        tabEl.setAttribute('data-tab-id', tabId);
        if (typeof ico === 'string') {
            var iconEl = L.DomUtil.create('i', '', tabEl);
            L.DomUtil.addClass(iconEl, ico);
        } else if (typeof ico.appendTo === 'function') {
            ico.appendTo(tabEl);
        }
        return tabEl;
    },

    _createPane: function(id) {
        var paneEl = L.DomUtil.create('div', 'iconSidebarWidget-pane');
        if (id) {
            paneEl.setAttribute('data-pane-id', id);
        }
        return paneEl;
    },

    _setActiveClass: function(activeId) {
        var i, id;
        for (i = 0; i < this._tabsContainer.children.length; i++) {
            id = this._tabsContainer.children[i].getAttribute('data-tab-id');
            if (id === activeId) {
                L.DomUtil.addClass(this._tabsContainer.children[i], 'iconSidebarWidget-tab-active');
                L.DomUtil.addClass(this._panesContainer.querySelector('[data-pane-id=' + id + ']'), 'iconSidebarWidget-pane-active');
            } else {
                L.DomUtil.removeClass(this._tabsContainer.children[i], 'iconSidebarWidget-tab-active');
                L.DomUtil.removeClass(this._panesContainer.querySelector('[data-pane-id=' + id + ']'), 'iconSidebarWidget-pane-active');
            }
        }
    },

    _onTabClick: function(e) {
        var tabId = e.currentTarget.getAttribute('data-tab-id');
        if (!this._isOpened || this._activeTabId !== tabId) {
            this.open(tabId);
        } else {
            this.close();
        }
    },

    _hasTab: function(tabId) {
        return !!this._tabsContainer.querySelector('[data-tab-id=' + tabId + ']');
    },

    _sortTabs: function() {
        var container = this._tabsContainer;
        var tabs = Array.prototype.slice.call(container.children);
        var i, j, maxPosition, tabPosition, maxPositionIndex;
        for (i = 0; i < container.children.length; i++) {
            maxPositionIndex = 0;
            for (j = 0; j < tabs.length; j++) {
                tabPosition = tabs[j].getAttribute('data-position');
                maxPosition = tabs[maxPositionIndex].getAttribute('data-position');
                maxPositionIndex = tabPosition > maxPosition ? j : maxPositionIndex;
            }
            container.appendChild(tabs.splice(maxPositionIndex, 1)[0])
        }
    }
});