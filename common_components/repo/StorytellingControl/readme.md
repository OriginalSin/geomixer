# StorytellingControl

Контрол сторителлинга, распологающийся сверху по центру. Позволяет листать закладки с помощью стрелок, расположенных по бокам.

Наследует от [L.Control](http://leafletjs.com/reference.html#control)

## options

- `<String> position` - *не поддерживается*
- `<Number|Boolean> openBoomark` - номер закладки, которую нужно открыть по умолчанию (нумерация с 0). В случае, если передано значение `false` - ни одна закладка не бужет открыта.

## Пример использования

```javascript
var storytellingControl = new nsGmx.StorytellingControl({
    openBoomark: false
});

storytellingControl.addTo(map);
```
