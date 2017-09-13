(function ($) {
    var w = $.widget('scanex.customSlider', {
        options: {
            range: true
        },
        _create: function () {
            var tt = $('<table></table>', { style: 'width: 100%; border-spacing: 0px' }).appendTo(this.element);
            var tr = $('<tr></tr>').appendTo(tt);

            $('<td></td>', {
                'class': 'slider-caption',
                text: this.options.title + ':',
                style: 'white-space: nowrap; width: 100%'
            }).appendTo(tr);

            var td = $('<td></td>').appendTo(tr);

            this._lo = $('<input></input>', {
                type: 'text',
                readonly: false,
                style: 'width: 2em'
            }).appendTo(td);

            this._on(this._lo, {
                blur: function () {
                    this._setOption('values', [parseInt($(this._lo).val(), 10), this.options.values[1]]);
                    this._refresh();
                },
                keydown: function (e) {
                    if (e.keyCode == 13) {
                        this._setOption('values', [parseInt($(this._lo).val(), 10), this.options.values[1]]);
                        this._refresh();
                    }
                }
            });

            $('<td></td>', { text: '-', style: 'margin-left:5px; margin-right:5px' }).appendTo(tr);

            td = $('<td></td>').appendTo(tr);
            this._hi = $('<input></input>', {
                type: 'text',
                readonly: false,
                style: 'width: 2em'
            }).appendTo(td);

            this._on(this._hi, {
                blur: function () {
                    this._setOption('values', [this.options.values[0], parseInt($(this._hi).val(), 10)]);
                    this._refresh();
                },
                keydown: function (e) {
                    if (e.keyCode == 13) {
                        this._setOption('values', [this.options.values[0], parseInt($(this._hi).val(), 10)]);
                        this._refresh();
                    }
                }
            });

            if (this.options.unit) {
                td = $('<td></td>').appendTo(tr);
                $('<div></div>', { html: this.options.unit, style: 'width: 10px' }).appendTo(td);
            }

            tr = $('<tr></tr>').appendTo(tt);
            td = $('<td></td>', { colspan: 5 }).appendTo(tr);

            var c = $('<div></div>', { 'class': 'slider-container' }).appendTo(td);

            this._control = $('<div></div>').appendTo(c);

            this._control.slider(this.options);
            this._on(this._control, {
                slide: function (e, ui) {
                    this._setOption('values', ui.values);

                    $(this._lo).val(this.options.values[0]);
                    $(this._hi).val(this.options.values[1]);
                }
            });

            this._control.find('.ui-slider-handle:first').removeClass('ui-slider-handle').addClass('ui-slider-handle-left');
            var len = this.options.names.length;
            var width = 100 / (len - 1);
            var left = 0;
            for (var index = 0; index < len; ++index) {
                var n = this.options.names[index];
                var style = 'left:' + left + '%;width:' + width + '%';
                $('<div></div>', { 'class': 'ui-slider-tick', 'style': style }).appendTo(this._control);

                var props =
					{
					    'class': n.img ? 'ui-slider-tick-text cloud-image' : 'ui-slider-tick-text',
					    'style': style
					};
                if (!isNaN(n)) {
                    props.text = n;
                }

                var d = $('<div></div>', props).appendTo(this._control);

                if (n.img) {
                    $('<img/>',
						{
						    'src': n.img,
						    'alt': n.name,
						    'title': n.name
						}
					).appendTo(d);
                }

                left += width;
            }

            this._refresh();

            return this._super();
        },
        _destroy: function () {
            this.element.empty();
            return this._super();
        },
        _refresh: function () {
            this._control.slider('values', 0, this.options.values[0]);
            this._control.slider('values', 1, this.options.values[1]);
            $(this._lo).val(this.options.values[0]);
            $(this._hi).val(this.options.values[1]);
            this._trigger('change');
        },
        _setOptions: function () {
            this._superApply(arguments);
            this._refresh();
        },

        _setOption: function (key, value) {
            if (
				(/min|max/.test(key) && (!value || isNaN(value))) ||
				(key == 'min' && value > this.options.max) ||
				(key == 'max' && value < this.options.min) ||
				(key == 'values' && (
					!value ||
					value.length != 2 ||
					isNaN(value[0]) ||
					isNaN(value[1]) ||
					value[0] > value[1] ||
					value[0] < this.options.min ||
					value[1] > this.options.max))
			) {
                return;
            }
            this._super(key, value);
        }
    });
} (jQuery));