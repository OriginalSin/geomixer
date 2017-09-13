var nsGmx = window.nsGmx = window.nsGmx || {};

// options.iconClass
nsGmx.LabelIconWidget = nsGmx.GmxWidget.extend({
    className: 'labelIconWidget',

    options: {
        clickable: true
    },

    initialize: function(options) {
        this.options = _.extend({}, this.options, options);
        this._labelHidden = false;
        this.render();
    },

    render: function() {
        if (this.options.clickable) {
            this.$el.addClass('labelIconWidget_clickable');
        }
        this.$iconEl = $('<span>')
            .addClass('labelIconWidget-icon')
            .appendTo(this.$el);
        this.$labelEl = $('<div>')
            .addClass('labelIconWidget-label')
            .appendTo(this.$el);
        this.setLabel(null);
        this.setIconClass(this.options.iconClass);
    },

    // null, undefined or empty string removes label
    setLabel: function(label) {
        this._label = label;
        if (label === null || label === undefined || label === '') {
            this.$labelEl.empty();
            this.$labelEl.hide();
        } else {
            this.$labelEl.html(label);
            if (!this._labelHidden) {
                this.$labelEl.show();
            }
        }
    },

    showLabel: function() {
        if (this._label) {
            this.$labelEl.show();
        }
        this._labelHidden = false;
    },

    hideLabel: function() {
        this._labelHidden = true;
        this.$labelEl.hide();
    },

    setIconClass: function(iconClass) {
        if (this._prevIconClass) {
            this.$iconEl.removeClass(this._prevIconClass);
        }
        this.$iconEl.addClass(iconClass);
        this._prevIconClass = iconClass;
    }
});
