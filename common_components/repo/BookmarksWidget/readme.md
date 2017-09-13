# BookmarksWidget

```javascript
var bookmarksWidget = new nsGmx.BookmarksWidget({
    collection: new Backbone.Collection(JSON.parse(layersTree.properties.UserData).tabs)
});

bookmarksWidget.on('opening', function() {
    // ...
});

bookmarksWidget.on('closed', function() {
    // ...
});

bookmarksWidget.on('selected', function(model) {
    permalinkManager.loadFromData(model.get('state'));
});

bookmarksWidget.appendTo(container);
```