# StateManager

Компонент, осуществляющий сериализацию/десереализацию объектов приложения, а также конвертацию различных форматов данных пермалинков.

*Конструктор не имеет параметров.*

## Методы

- `setIdentity(<String>componentId, <Object>componentInstance)` - устанавливает соответствие `componentId` - `componentInstance`. Список возможных componentId's см. ниже.
- `loadFromData(<Object>data)` - осуществить десереализацию объектов, установленных с помощью метода `setIdentity`. Причем, если метод `setIdentity` был вызван после `loadFromData`, то объект всё равно будет десереализован.
- `<Object>serialize()` - осуществить сериализацию объектов и вернуть пермалинк в формате конструктора приложений.

#### componentId's:
- <LeafletMapDeserializer>map
- <nsGmx.DateInterval>calendar
- <nsGmx.LayersTreeNode>layersTree
- <L.GmxDrawing>drawingManager
- <L.gmxBaseLayersManager>baseLayersManager

#### CHANGELOG

- 3.1.0 - добавлен компонент `balloons`
- 3.0.0 - изменена структура. Все компоненты на верхнем уровне
- 2.0.0 - изменена структура
- 1.0.0
