**SwitchingCollectionWidget** - это абстрактный виджет, представляющий коллекцию элементов, среди которых может быть один активный. 

Для работы виджета требуется два параметра: `<Backbone.Collection> collection` и `<Backbone.View> itemView`.

SwitchingCollectionWidget подписывается на следующие события itemView:
- `expanding` - SwitchingCollectionWidget вызовет метод `collapse` у текущего открытого itemView

Перед рендерингом itemView должен сгенерировать либо событие `expanding`, либо `collapsing`.
После рендеринга желательно `expanded` и `collapsed` соответственно.

По умолчанию SwitchingCollectionWidget генерирует событие `selected`, в обработчик которого передаёт модель выбранного элемента, однако можно передать параметр `reEmitEvents` и указать в нём события элемента коллекции, которые нужно продублировать.

Упрощённый пример с виджетом закладок:

```javascript
// это элемент коллекции
var BookmarkView = nsGmx.View.extend({
    events: {
        'click .title': function() {
            this.trigger('bookmarkTitleClick');
        }
    },
    expand: function () {
        this.trigger('expanding');
        // ...
        this.trigger('expanded');
    },
    collapse: function () {
        this.trigger('collapsing');
        // ...
        this.trigger('collapsed');
    }
});

// виджет закладок
var BookmarksWidget = nsGmx.SwitchingCollectionWidget.extend({
    className: 'bookmarksWidget',
    itemView: BookmarkView,
    reEmitEvents: ['bookmarkTitleClick']
})

var bookmarksWidget = new BookmarksWidget({
    collection: bookmarksCollection
});

bookmarksWidget.on('selected', function(model) {
    // была выбрана закладка, можем обработать её данные
});

bookmarksWidget.on('bookmarkTitleClick', function() {
    // нажали на title какой-то закладки
});

bookmarksWidget.appendTo('.bookmarksWidgetContainer');
```