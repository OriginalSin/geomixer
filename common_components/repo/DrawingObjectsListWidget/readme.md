#DrawingObjectsListWidget

Контрол, отображающий список drawing-объектов карты.
По умолчанию отображается тип геометрии, а также её площадь, длина или координаты (в зависимости от типа).
Если в `options` drawing-объекта есть поле `name`, то оно будет отображено вместо типа геометрии.

## Зависимости

- jQuery
- Underscore

- Backbone
- Handlebars
- GMXCommonComponents/Thorax (thorax.js)
- nsGmx.Translations **(with helper)**
- GMXCommonComponents/CommonStyles

## Интерфейс вызова

Конструктор является потомком класса Thorax.View и принимает хеш со следующими ключами:

- `<GmxDrawing>drawingManager` **обязательный** - менеджер drawing-объектов
- `<String>selectMode` - режим выбора объектов, `'single'` или `'multiple'`. По умолчанию - `'multiple'`
- `<Boolean>showStyleButton` - показывать ли иконку изменения стиля. По умолчанию - `true`
- `<Boolean>showRemoveButton` - показывать ли иконку удаления геометрии. По умолчанию - `true`
- `<Boolean>markGeometries` - подсвечивать ли drawing-объекты при наведении мыши. По умолчанию - `true`
- `<Function>markingStrategy` - алгоритм подсветки геометрии. Представляет собой функцию, принимающую на вход стиль геометрии и возвращающая хеш с изменёнными свойствами. **Функция не должна изменять исходный объект стилей**

## Методы

- `<L.GmxDrawing.Feature[]>getSelectedObjects()` - Получить объекты, выбранные пользователем

## События

Подписываемся по instance.on('event', function() {})

|Событие|Аргументы|Описание
|---|---|---
|objectFocus|`<L.GmxDrawing.Feature>`drawingObject|Попытка отцентровать объект
|objectToggle|`<L.GmxDrawing.Feature>`drawingObject, `<Boolean>`selected|Попытка изменить состояние объекта
|styleButtonClick|`<L.GmxDrawing.Feature>`drawingObject|Кликнули на кнопку изменения стиля

## Пример использования

```javascript
var drawingObjectsWidget = new nsGmx.DrawingObjectsListWidget({
    drawingManager: map.gmxDrawing
});

drawingObjectsWidget.on('styleButtonClick', function(feature) {
    feature.setLinesStyle({color: '#AA0000'});
    feature.setPointsStyle({color: '#AA0000'});
});

drawingObjectsWidget.on('objectToggle', function(feature, visible) {
    if (visible) {
        map.addLayer(feature);
    } else {
        map.removeLayer(feature);
    }
});

drawingObjectsWidget.on('objectFocus', function(feature) {
    map.fitBounds(feature.getBounds());
});

drawingObjectsWidget.appendTo($('#placeholder'));
```