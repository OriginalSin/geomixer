/** Контрол для задания диапазона дат с логикой работы, взятой с сайта fires.ru.
 @description Основное отличае в логине формировании интервала на основе выбранных в календариках дат.
              Работает так же, как и обычный виджет ({@link nsGmx.CalendarWidget}) за исключением ситуации, когда dateEnd попадает в текущие UTC сутки.
              В этом случае, dateEnd устанавливается равном началу следующего часа. Далее, если длина выбранного интервала меньше 12 часов, начало интервала смещается на сутки назад.
              Кроме формирования интервала, этот виджет показывает пользователю дополнительную информацию о выбранном интервале.
 @alias nsGmx.FireCalendarWidget
 @class
 @param {nsGmx.CalendarWidget~Parameters} params Параметры календаря
*/

var nsGmx = nsGmx || {};

(function($){

'use strict';

var toMidnight = nsGmx.DateInterval.toMidnight;

nsGmx.Translations.addText("rus", { FireCalendarWidget: {
    timeTitlePrefix : 'За ',
    timeTitleLastPrefix : 'За последние ',
    timeTitlePostfix : 'ч (UTC)'
}});

nsGmx.Translations.addText("eng", { FireCalendarWidget: {
    timeTitlePrefix : 'For ',
    timeTitleLastPrefix : 'For last ',
    timeTitlePostfix : 'h (UTC)'
}});


function f(n) {
    return n < 10 ? '0' + n : n;
}

function getStr (hours, minutes) {
    return f(hours) + ":" + f(minutes); /*+ ":" + f(time.seconds)*/
};

var FireCalendarWidget = nsGmx.CalendarWidget.extend({
    initialize: function(options) {
        options = $.extend({
            dateMax: new Date()
        }, options);

        nsGmx.CalendarWidget.prototype.initialize.call(this, options);

        this._dateInterval.on('change', this._updateInfo, this);
        this.on('modechange', this._updateInfo, this);
        this.on('modechange', this._updateModel, this);
        this._updateInfo();
    },

    _updateModel: function() {
        var dateBegin = this.getDateBegin(),
            origDateEnd = this.getDateEnd(),
            now = new Date(),
            lastMidnight = toMidnight(now),
            dateEnd;

        if (lastMidnight <= origDateEnd) {
            //last day
            dateEnd = new Date((now - 1) - (now - 1) % (3600*1000) + 3600*1000); //round to the nearest hour greater then 'now'

            if (dateEnd - toMidnight(dateBegin) < 12*3600*1000 && this.getMode() === nsGmx.CalendarWidget.SIMPLE_MODE) {
                dateBegin = new Date(dateBegin - nsGmx.DateInterval.MS_IN_DAY);
            }
        } else {
            //previous days
            dateEnd = new Date(origDateEnd.valueOf() + nsGmx.DateInterval.MS_IN_DAY);
        }

        this._dateInterval.set({
            dateBegin: toMidnight(dateBegin),
            dateEnd: dateEnd
        });
    },

    _updateWidget: function() {
        var dateBegin = +this._dateInterval.get('dateBegin'),
            dateEnd = +this._dateInterval.get('dateEnd');

        if (!dateBegin || !dateEnd) {
            return;
        };

        var currentDayMode = toMidnight(new Date()) < dateEnd;

        if (currentDayMode && this.getMode() === nsGmx.CalendarWidget.SIMPLE_MODE && dateEnd - dateBegin < 2 * nsGmx.DateInterval.MS_IN_DAY) {
            this._dateBegin.datepicker("setDate", nsGmx.CalendarWidget.toUTC(new Date()));
            this._dateEnd.datepicker("setDate", nsGmx.CalendarWidget.toUTC(new Date()));
        } else {
            nsGmx.CalendarWidget.prototype._updateWidget.call(this);
        }
    },

    _updateInfo: function() {
        var isSimpleMode = this.getMode() === nsGmx.CalendarWidget.SIMPLE_MODE;

        this.$('.CalendarWidget-footer').toggle(isSimpleMode);
        this.$('.CalendarWidget-dateBeginInfo, .CalendarWidget-dateEndInfo').toggle(!isSimpleMode);

        var dateBegin = this._dateInterval.get('dateBegin'),
            dateEnd = this._dateInterval.get('dateEnd');

        if (!dateBegin || !dateEnd) {
            return;
        }

        var hours = Math.ceil((dateEnd - dateBegin)/3600000);

        if (isSimpleMode) {
            var hoursStr = hours > 24 ? "24+" + (hours-24) : hours;
            var prefix = hours === 24 ? _gtxt("FireCalendarWidget.timeTitlePrefix") : _gtxt("FireCalendarWidget.timeTitleLastPrefix");

            this.$('.CalendarWidget-footer').html(prefix + hoursStr + _gtxt("FireCalendarWidget.timeTitlePostfix"));
        } else {
            var dateEndToShow = (hours % 24) === 0 ? new Date(+dateEnd - 1) : dateEnd; //hack to show 23:59 instead of 00:00
            this.$('.CalendarWidget-dateBeginInfo').text(getStr(dateBegin.getUTCHours(), dateBegin.getUTCMinutes()) + " (UTC)").attr('title', _gtxt('CalendarWidget.UTC'));
            this.$('.CalendarWidget-dateEndInfo'  ).text(getStr(dateEndToShow.getUTCHours(), dateEndToShow.getUTCMinutes()) + " (UTC)").attr('title', _gtxt('CalendarWidget.UTC'));

        }
    }
}, {
    defaultFireDateInterval: function() {
        var now = new Date(),
            lastMidnight = toMidnight(now),
            dateEnd = new Date((now - 1) - (now - 1) % (3600*1000) + 3600*1000), //round to the nearest hour greater then 'now'
            isTooSmall = dateEnd - lastMidnight < 12*3600*1000,
            dateBegin = new Date(isTooSmall ? (lastMidnight - nsGmx.DateInterval.MS_IN_DAY) : lastMidnight.valueOf());

        return {
            dateBegin: dateBegin,
            dateEnd: dateEnd
        }
    }
});

nsGmx.FireCalendarWidget = FireCalendarWidget;

})(jQuery);
