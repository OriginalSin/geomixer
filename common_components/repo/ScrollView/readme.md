# ScrollView

Компонент, представляющий из себя обёртку в виде Thorax View над jQuery-плагином jScrollPane.

ScrollView растягивается на 100% и отслеживает события `rendered` и `resize` виджетов внутри него, по которым перерисовывает скроллбар.

Внешние события, такие как `resize` объекта `window` нужно отслеживать самостоятельно.

## API

Конструктор принимает экземпляр класса Thorax.View (виджет), либо массив виджетов.
Для правильной работы, виджет должет генерировать событие `resize` при любом изменении его размеров.

У ScrollView есть метод `repaint`, который позволяет перерисовать скроллбар при изменении размеров внешнего контейнера.

## Пример использования

```javascript
var placeholder = $('.widgetPlaceholder')
var someWidget = getWidgetSomehow();
var scrollView = new nsGmx.ScrollView(someWidget);
$(window).on('resize', function() {
    scrollView.repaint(); 
});
scrollView.appendTo(placeholder);
``` 