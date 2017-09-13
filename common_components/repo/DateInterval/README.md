Временной интервал. Состоит из двух дат: начальной и конечной. Наследуется от `Backbone.Model`.

По умолчанию инициализируется границами текущих суток по UTC.

## Пример использования
```
    var dateInterval = new DateInterval({
        dateBegin: new Date(2000, 10, 30),
        dateEnd:   new Date()
    });
    
    var state = dateInterval.saveState();
    dateInterval.loadState(state);
    
    state.on('change', function() {
        console.log(dateInterval.get('dateBegin'), dateInterval.get('dateEnd'));
    });
```