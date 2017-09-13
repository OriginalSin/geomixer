# IconSidebarControl

Сайдбар с табами в виде иконок. Реализует `IControl`.

## Параметры

- `<Boolean> useAnimation` - использовать ли анимацию

## События

- `opening` `{ id: <String> }` - сайдбар начал разворачиваться
- `closing` `{ id: <String> }` - сайдбар начал сворачиваться
- `opened` `{ id: <String> }` - сайдбар развернулся
- `closed` `{ id: <String> }` - сайдбар свернулся
- `stick` `{ isStuck: <Boolean> }` - сайдбар прилепился/отлепился от противоположного конца экрана (в мобильной версии)

## Методы

- `addTab(<String> tabId, <String> iconClass)` - добавить вкладку с идентификатором `id`. Иконке вкладки будет назначен класс `iconClass`
- `<String> getActiveTabId()` - получить id текущей открытой вкладки

## Пример использования

```javascript
var sidebarControl = new nsGmx.IconSidebarControl({
    useAnimation: true // by default
});

sidebarControl.addTo(map);

sidebarControl.on('opening', function() {
    // sidebar opening
});

sidebarControl.on('closing', function() {
    // sidebar closing
});

sidebarControl.on('opened', function(e) {
    console.log(e.id === sidebarControl.getActiveTabId()); // true
});

sidebarControl.on('stick', function(e) {
    if (e.isStuck) {
        // hide some controls
    }
});
```