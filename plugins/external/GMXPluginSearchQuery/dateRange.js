(function ($) {

    $.fn.daterange = function () {
        // опции
        var opts = $.extend({
            "dateFormat": "dd.mm.yy",
            "changeMonth": false,
            "changeYear": false,
            "numberOfMonths": 2,
            "rangeSeparator": "-"
        }, arguments[0] || {}, {
            // обработчики событий datepicker
            // закрытие
            "onClose": function (dateText, inst) {
                if ($.isFunction(opts.callback)) {
                    opts.callback.apply(this, arguments);
                }
            },
            // выбор даты
            "onSelect": function (dateText, inst) {
                var textStart;
                if (!inst.rangeStart) {
                    inst.inline = true;
                    inst.rangeStart = dateText;
                } else {
                    inst.inline = false;
                    textStart = inst.rangeStart;
                    if (textStart !== dateText) {
                        $(this).val(textStart + " " + opts.rangeSeparator + " " + dateText);
                        inst.rangeStart = null;
                    }
                }
            }
        });

        return this.each(function () {
            var input = $(this);
            if (input.is("input")) {
                input.datepicker(opts);
            }
        });
    };

}(jQuery))