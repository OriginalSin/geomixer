nsGmx.ScrollView = nsGmx.GmxWidget.extend({
    className: 'scrollView',
    initialize: function(opts) {
        opts = opts || {};
        this._separatorView = opts.separatorView || null;
        this.$el.css('height', '100%');
        this.$el.css('overflow', 'auto');
        this.$el.jScrollPane();
        this._jsp = this.$el.data('jsp');
        this.$contentPane = this.$el.data('jsp').getContentPane();
        views = opts.views || [];
        views.map(function(view) {
            this.addView(view);
        }.bind(this));
    },
    render: function() {
        this.repaint();
        return this;
    },
    repaint: function() {
        this._jsp.reinitialise();
    },
    reset: function () {
        this.repaint();
    },
    addView: function(view) {
        view.on('resize', function() {
            this.repaint();
        }.bind(this));
        if (this._separatorView && this.$contentPane.children().length) {
            var separatorView = new this._separatorView();
            this.$contentPane.append(separatorView.el);
            thiss.trigger('addview');
        }
        this.$contentPane.append(view.el);
        this.trigger('addview');
        this.repaint();
    }
});
