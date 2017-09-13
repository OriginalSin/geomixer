var nsGmx = nsGmx || {};

(function($){

'use strict';

var _gtxt = nsGmx.Translations.getText.bind(nsGmx.Translations),
    toMidnight = nsGmx.DateInterval.toMidnight;

/** Параметры календаря
 * @typedef nsGmx.CalendarWidget~Parameters
 * @property {nsGmx.DateInterval} dateInterval Временной интервал, который нужно менять
 * @property {Date} [dateMin] минимальная граничная дата для календарей, null - без ограничений
 * @property {Date} [dateMax] максимальная граничная дата для календарей, null - без ограничений
 * @property {String} [dateFormat='dd.mm.yy'] формат даты
 * @property {bool} [minimized=true] показывать ли минимизированный или развёрнутый виджет в начале
 * @property {bool} [showSwitcher=true] показывать ли иконку для разворачивания/сворачивания периода
 * @property {Date} [dateBegin=<текущая дата>] начальная дата интервала
 * @property {Date} [dateEnd=<текущая дата>] конечная дата интервала
 * @property {String|DOMNode} [container] куда добавлять календарик
 * @property {String} [buttonImage] URL иконки для активации календариков
 */

/** Контрол для задания диапазона дат. Даты календарика всегда в UTC, а не в текущем поясе.
 @description Виджет для выбора интервала дат. Пользователь при помощи datepicker'ов выбирает два дня (год, месяц, число),
              затем выбранные значения при помощи ф-ции `_updateModel()` переводятся в интервал дат ({@link nsGmx.DateInterval}).
              Так же виджет реагирует на изменения модели (с использованием ф-ции `_updateWidget()`)
 @alias nsGmx.CalendarWidget
 @extends nsGmx.GmxWidget
 @class
 @param {nsGmx.CalendarWidget~Parameters} options Параметры календаря
*/
var Calendar = nsGmx.GmxWidget.extend({
    tagName: 'div',
    className: 'CalendarWidget ui-widget',
    template: Handlebars.compile(nsGmx.Templates.CalendarWidget.CalendarWidget),

    events: {
        'click .CalendarWidget-iconMore': 'toggleMode',
        'click .CalendarWidget-iconScrollLeft': function() {
            this._shiftDates(-1);
        },
        'click .CalendarWidget-iconScrollRight': function() {
            this._shiftDates(1);
        }
    },

    initialize: function(options) {
        options = $.extend({
            minimized: true,
            showSwitcher: true,
            dateMax: null,
            dateMin: null,
            dateFormat: 'dd.mm.yy',
            name: null
        }, options);

        this._dateMin = options.dateMin;
        this._dateMax = options.dateMax;

        this._dateInterval = options.dateInterval;

        this.$el.html(this.template({
            moreIconClass: options.minimized ? 'icon-calendar' : 'icon-calendar-empty',
            moreIconTitle: options.minimized ? _gtxt('CalendarWidget.ExtendedViewTitle') : _gtxt('CalendarWidget.MinimalViewTitle')
        }));

        this._moreIcon = this.$('.CalendarWidget-iconMore')
            .toggle(!!options.showSwitcher);

        this._dateBegin = this.$('.CalendarWidget-dateBegin');
        this._dateEnd = this.$('.CalendarWidget-dateEnd');
        this._dateInputs = this._dateBegin.add(this._dateEnd);

        this._dateInputs.datepicker({
            onSelect: function(dateText, inst){
                this._selectFunc(inst.input);
                this._updateModel();
            }.bind(this),
            showAnim: 'fadeIn',
            changeMonth: true,
            changeYear: true,
            minDate: this._dateMin ? Calendar.toUTC(this._dateMin) : null,
            maxDate: this._dateMax ? Calendar.toUTC(this._dateMax) : null,
            dateFormat: options.dateFormat,
            defaultDate: Calendar.toUTC(this._dateMax || new Date()),
            showOn: options.buttonImage ? 'both' : 'focus',
            buttonImageOnly: true
        });

        //устанавливаем опцию после того, как добавили календарик в canvas
        if (options.buttonImage) {
            this._dateInputs.datepicker('option', 'buttonImage', options.buttonImage);
        }

        this.$('.CalendarWidget-onlyMaxVersion').toggle(!options.minimized);

        options.dateBegin && this._dateBegin.datepicker('setDate', Calendar.toUTC(options.dateBegin));
        options.dateEnd && this._dateEnd.datepicker('setDate', Calendar.toUTC(options.dateEnd));

        if (options.container) {
            if (typeof options.container === 'string')
                $('#' + options.container).append(this.$el);
            else
                $(options.container).append(this.$el);
        }

        this.setMode(options.minimized ? Calendar.SIMPLE_MODE : Calendar.ADVANCED_MODE);

        this._updateWidget();

        this._dateInterval.on('change', this._updateWidget, this);

        //for backward compatibility
        this.canvas = this.$el;
    },

    _shiftDates: function(delta) {
        var dateBegin = this.getDateBegin(),
            dateEnd = this.getDateEnd();

        if (!dateBegin || !dateEnd) {
            return;
        }

        var shift = (dateEnd - dateBegin + nsGmx.DateInterval.MS_IN_DAY) * delta,
            newDateBegin = new Date(dateBegin.valueOf() + shift),
            newDateEnd = new Date(dateEnd.valueOf() + shift);

        if ((!this._dateMin || toMidnight(this._dateMin) <= toMidnight(newDateBegin)) &&
            (!this._dateMax || toMidnight(this._dateMax) >= toMidnight(newDateEnd)))
        {
            this._dateBegin.datepicker('setDate', Calendar.toUTC(newDateBegin));
            this._dateEnd.datepicker('setDate', Calendar.toUTC(newDateEnd));

            this._updateModel();
        }
    },

    _selectFunc: function(activeInput) {
        var begin = this._dateBegin.datepicker('getDate');
        var end   = this._dateEnd.datepicker('getDate');

        if (end && begin && begin > end) {
            var dateToFix = activeInput[0] == this._dateEnd[0] ? this._dateBegin : this._dateEnd;
            dateToFix.datepicker('setDate', $(activeInput[0]).datepicker('getDate'));
        } else if (this._curMode === Calendar.SIMPLE_MODE) {
            //либо установлена только одна дата, либо две, но отличающиеся
            if (!begin != !end || begin && begin.valueOf() !== end.valueOf()) {
                this._dateEnd.datepicker('setDate', this._dateBegin.datepicker('getDate'));
            }
        }
    },

    _updateModel: function() {
        var dateBegin = this.getDateBegin(),
            dateEnd = this.getDateEnd();

        this._dateInterval.set({
            dateBegin: dateBegin ? toMidnight(dateBegin) : null,
            dateEnd: dateEnd ? toMidnight(dateEnd.valueOf() + nsGmx.DateInterval.MS_IN_DAY) : null
        });
    },

    _updateWidget: function() {
        var dateBegin = this._dateInterval.get('dateBegin'),
            dateEnd = this._dateInterval.get('dateEnd'),
            dayms = nsGmx.DateInterval.MS_IN_DAY;

        if (!dateBegin || !dateEnd) {
            return;
        };

        var isValid = !(dateBegin % dayms) && !(dateEnd % dayms);

        var newDateBegin = Calendar.toUTC(dateBegin),
            newDateEnd;
        if (isValid) {
            newDateEnd = Calendar.toUTC(new Date(dateEnd - dayms));
            if (dateEnd - dateBegin > dayms) {
                this.setMode(Calendar.ADVANCED_MODE);
            }
        } else {
            newDateEnd = Calendar.toUTC(dateEnd);
            this.setMode(Calendar.ADVANCED_MODE);
        }

        //если мы сюда пришли после выбора интервала в самом виджете, вызов setDate сохраняет фокус на input-поле
        //возможно, это какая-то проблема jQueryUI.datepicker'ов.
        //чтобы этого избежать, явно проверяем, нужно ли изменять дату
        var prevDateBegin = this._dateBegin.datepicker('getDate'),
            prevDateEnd = this._dateEnd.datepicker('getDate');

        if (!prevDateBegin || prevDateBegin.valueOf() !== newDateBegin.valueOf()) {
            this._dateBegin.datepicker('setDate', newDateBegin);
        }

        if (!prevDateEnd || prevDateEnd.valueOf() !== newDateEnd.valueOf()) {
            this._dateEnd.datepicker('setDate', newDateEnd);
        }
    },

    //public interface

    /** Закрыть все открытые datepicker'ы.
     * @return {nsGmx.CalendarWidget} this
     */
    reset: function() {
        this._dateInputs.datepicker('hide');
        return this;
    },

    /** Сериализация состояния виджета
     * @return {Object} Сериализованное состояние
     */
    saveState: function() {
        return {
            version: '1.1.0',
            vismode: this.getMode()
        }
    },

    /** Восстановить состояние виджета по сериализованным данным
     * @param {Object} data Сериализованное состояние календарика
     */
    loadState: function( data ) {
        this.setMode(data.vismode);
    },

    /** Получить начальную дату
     * @return {Date} начальная дата
     */
    getDateBegin: function() {
        return Calendar.fromUTC(this._dateBegin.datepicker('getDate'));
    },

    /** Получить конечную дату
     * @return {Date} конечная дата
     */
    getDateEnd: function() {
        return Calendar.fromUTC(this._dateEnd.datepicker('getDate'));
    },

    /** Получить верхнюю границу возможных дат периода
     * @return {Date} верхняя граница возможных периодов
     */
    getDateMax: function() {
        return this._dateMax;
    },

    /** Получить нижнуюю границу возможных дат периода
     * @return {Date} нижняя граница возможных периодов
     */
    getDateMin: function() {
        return this._dateMin;
    },

    /** Установить нижнуюю границу возможных дат периода
     * @param {Date} dateMin нижняя граница возможных периодов
     */
    setDateMin: function(dateMin) {
        this._dateMin = dateMin;
        this._dateInputs.datepicker('option', 'minDate', dateMin ? Calendar.toUTC(dateMin) : null);
    },

    /** Установить верхнюю границу возможных дат периода
     * @param {Date} dateMax верхняя граница возможных периодов
     */
    setDateMax: function(dateMax) {
        this._dateMax = dateMax;
        if (dateMax) {
            var utcDate = Calendar.toUTC(dateMax);
            this._dateInputs.datepicker('option', 'maxDate', utcDate);
        } else {
            this._dateInputs.datepicker('option', 'maxDate', null);
        }
    },

    setSwitcherVisibility: function(isVisible) {
        this._moreIcon && this._moreIcon.toggle(isVisible);
    },

    getDateInterval: function() {
        return this._dateInterval;
    },

    getMode: function() {
        return this._curMode;
    },

    setMode: function(mode) {
        if (this._curMode === mode) {
            return this;
        }

        this.reset();

        this._curMode = mode;
        var isSimple = mode === Calendar.SIMPLE_MODE;

        this.$('.CalendarWidget-onlyMaxVersion').toggle(!isSimple);

        this._moreIcon
            .toggleClass('icon-calendar', isSimple)
            .toggleClass('icon-calendar-empty', !isSimple)
            .attr('title', isSimple ? _gtxt('CalendarWidget.ExtendedViewTitle') : _gtxt('CalendarWidget.MinimalViewTitle'));


        var dateBegin = this._dateBegin.datepicker('getDate'),
            dateEnd = this._dateEnd.datepicker('getDate');

        if (isSimple && dateBegin && dateEnd && dateBegin.valueOf() !== dateEnd.valueOf()) {
            this._selectFunc(this._dateEnd);
            this._updateModel();
        }

        this.trigger('modechange');

        return this;
    },

    toggleMode: function() {
        this.setMode(this._curMode === Calendar.SIMPLE_MODE ? Calendar.ADVANCED_MODE : Calendar.SIMPLE_MODE );
    }
}, {
    /* static methods */
    fromUTC: function(date) {
        if (!date) return null;
        var timeOffset = date.getTimezoneOffset()*60*1000;
        return new Date(date.valueOf() - timeOffset);
    },
    toUTC: function(date) {
        if (!date) return null;
        var timeOffset = date.getTimezoneOffset()*60*1000;
        return new Date(date.valueOf() + timeOffset);
    },
    SIMPLE_MODE: 1,
    ADVANCED_MODE: 2
});

nsGmx.CalendarWidget = Calendar;

})(jQuery);