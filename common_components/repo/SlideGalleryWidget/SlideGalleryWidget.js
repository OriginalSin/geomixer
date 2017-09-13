var nsGmx = window.nsGmx = window.nsGmx || {};

nsGmx.SlideGalleryWidget = Thorax.View.extend({
    template: Handlebars.compile(nsGmx.Templates.SlideGalleryWidget.slideGalleryWidget),
    initialize: function(options) {
        this.language = options.language || 'rus';
        this._currentImageIndex = 0;
        if (this.collection.length > 1) {
            this._showNextButton = true;
            this._showPrevButton = true;
        }
        this._currentImageUrl = '';
        this._loadImage(this._currentImageIndex);
    },
    _loadImage: function(index) {
        this.$el.find('.slideGalleryWidget-progress').show();
        $('<img>').on('load', function() {
            this.$el.find('.slideGalleryWidget-progress').hide();
            this.$el.find('.slideGalleryWidget-canvas').attr('src', this.collection.at(index).get('url'));
            this.trigger('resize');
        }.bind(this)).attr('src', this.collection.at(index).get('url'));
    },
    context: function() {
        return {
            progressLabel: this.language === 'eng' ? 'Loading..' : 'Загрузка..'
        };
    },
    events: {
        'mouseover .slideGalleryWidget-prevButton': function() {
            if (this.collection.length > 1) {
                $('.slideGalleryWidget-prevButtonLabel').show();
            }
        },
        'mouseout .slideGalleryWidget-prevButton': function() {
            if (this.collection.length > 1) {
                $('.slideGalleryWidget-prevButtonLabel').hide();
            }
        },
        'mouseover .slideGalleryWidget-nextButton': function() {
            if (this.collection.length > 1) {
                $('.slideGalleryWidget-nextButtonLabel').show();
            }
        },
        'mouseout .slideGalleryWidget-nextButton': function() {
            if (this.collection.length > 1) {
                $('.slideGalleryWidget-nextButtonLabel').hide();
            }
        },
        'click .slideGalleryWidget-prevButton': function() {
            if (this.collection.length > 1) {
                this._currentImageIndex--;
                if (this._currentImageIndex < 0) {
                    this._currentImageIndex = (this.collection.length - 1);
                }
                this._loadImage(this._currentImageIndex);
            }
        },
        'click .slideGalleryWidget-nextButton': function() {
            if (this.collection.length > 1) {
                this._currentImageIndex++;
                if (this._currentImageIndex >= this.collection.length) {
                    this._currentImageIndex = 0;
                }
                this._loadImage(this._currentImageIndex);
            }
        }
    },
    getCanvasWidth: function() {
        return this.$el.find('.slideGalleryWidget-canvas').width()
    }
});