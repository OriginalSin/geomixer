# IconSidebarWidget

Сайдбар с табами в виде иконок. Добавляется в DOM-дерево по `appendTo()`.

## Параметры

- `<Boolean> useAnimation` - использовать ли анимацию
- `<Number> mobileScreenWidthLimit` - ширини окна, меньше которой включается мобильная версия

## События

- `opening` `{ id: <String> }` - сайдбар открывается
- `closing` `{ id: <String> }` - сайдбар закрывается
- `stick` `{ isStuck: <Boolean> }` - сайдбар прилепился/отлепился от противоположного конца экрана (включилась мобильная версия)

## Методы

- `addTab(<String> tabId, <String> iconClass)` - добавить вкладку с идентификатором `id`. Иконке вкладки будет назначен класс `iconClass`

## Пример использования

```javascript
var sidebarWidget = new nsGmx.IconSidebarWidget({
    useAnimation: true // by default
});

sidebarWidget.appendTo(widgetsContainer);

sidebarWidget.on('opening', function() {
    // sidebar opening
});

sidebarWidget.on('closing', function() {
    // sidebar closing
});

sidebarWidget.on('stick', function(e) {
    if (e.isStuck) {
        // hide some controls
    }
});
```