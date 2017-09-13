# Виджеты для выбора диапазона дат с точностью до суток

`nsGmx.CalendarWidget` - виджет для выбора диапазона дат
`nsGmx.FireCalendarWidget` - виджет для выбора диапазона дат, реализующий логику с сайта fires.ru

## Зависимости
  * jQuery
  * jQuery UI
  * CommonStyles
  * Translations
  * Backbone
  * DateInterval
  
## Example
```
var dateInterval = new nsGmx.DateInterval();
var calendar = new nsGmx.CalendarWidget({
    name: 'uniqueInstanceName',
    container: $('#calendar-placeholder'),
    dateMin: new Date(0, 0, 0),
    dateMax: new Date(3015, 1, 1),
    dateFormat: 'dd.mm.yy',
    minimized: true,
    showSwitcher: true,
    dateBegin: new Date(),
    dateEnd: new Date(2000, 10, 10),
    buttonImage: 'img/calendar.png'
})
```

## API
TODO

## Extension points
`_updateModel()` - по состоянию элементов виджета обновить dateInterval
`_updateWidget()` - по модели обновить элементы виджета

##Notes
Все даты и времена в виджете отображаются в UTC (будьте внимательны при работы с объеками типа `Date`).
Основная цель календарика - выбор диапазона дат с точностью до суток. При этом часы/минуты/секунды задаются внутри виджета без учатия пользователя.
Если хочется, чтобы пользователь участвовал в выборе точного времени, следует использовать какой-то другой виджет.