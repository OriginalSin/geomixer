# StorytellingAccordeonControl

Контрол сторителлинга, оформленый в виде виджета 'аккордеон'.

Наследует от [L.Control](http://leafletjs.com/reference.html#control)

## options

- `<String> position` - см. [Leaflet control positions](http://leafletjs.com/reference.html#control-'topleft')
- `<Number|Boolean> openBoomark` - номер закладки, которую нужно открыть по умолчанию (нумерация с 0). В случае, если передано значение `false` - ни одна закладка не бужет открыта.

## Пример использования

```javascript
var storytellingControl = new nsGmx.StorytellingAccordeonControl({
    openBoomark: false
});

storytellingControl.addTo(map);
```
