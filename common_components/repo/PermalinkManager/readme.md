# Форматы пермалинков Fires

## Формат 3.0.0

```javascript
{
    version: '3.0.0', /*Версия формата пермалинка*/
    timestamp: <Number>,
    date: <String>, /*Дата из timestamp*/
    components: {
        map: <Object>, /*Данные карты (пользовательская десериализация)*/
        calendar: <Object>, /*Данные календаря (nsGmx.Calendar)*/
        layersTree: <Object>, /*Данные дерева слоёв (nsGmx.LayersTree)*/
        drawingManager: <Object>, /*Данные менеджера drawing-объектов (gmxDrawing)*/
        baseLayersManager: <Object> /*Данные менеджера подложек (baseLayersManager)*/
    }
}
```

## Формат Fires (2.0.0)

```javascript
{
    FireCalendar: <Object>, /*Данные FireCalendar*/
    FireControl: <Object>, /*Данные FireControl*/
    LayersController: <Object>, /*Данные LayersTree*/
    MapController: {
        baseLayer: <String>, /*ID текущей подложки*/
        drawingObjects: <Array[Object]>, /*Список drawing-объектов. Координаты в LatLong. Остальное как в 1.0.0*/
        position: {x,y,z} /*Координаты центра карты в LatLong*/
    },
    SidebarController: {
        activeId: <String> /*ID текущей открытой вкладки в сайдбаре*/
    },
    SubscriptionsController: <Object> /*Данные SubscriptionsController*/
}
```

## Формат Fires Old (1.0.0)

```javascript
{
    condition: <Object>, /*Данные LayersTree*/
    customParams: <Object>, /*???*/
    customParamsCollection: {
        Catalog: <Object>, /*???*/
        commonCalendar: <Object>, /*Данные FireCalendar*/
        firesWidget2: <Object> /*Данные FireMapplet*/
    },
    drawnObjects: <Array[Object]>, /*Список drawing-объектов. Геометрии в Mercator*/
    isFullScreen: <String>,
    language: <String>,
    mapName: <String>, /*ID карты*/
    mapStyles: <Object>, /*???*/ 
    mode: <String>, /*ID текущей подложки*/
    position: {x,y,z} /*Координаты центра карты в Mercator*/
}
```
**Элемент массива drawnObjects:**

```javascript
{
    geometry: {
        type: <String>, /*Тип геометрии (uppercase)*/
        coordinates: <Object> /*Координаты в Mercator*/
    },
    properties: {
        editable: <Boolean>, /*???*/
        mode: <String>, /*???*/
        type: <String> /*Тип геометрии (lowercase с большой буквы)*/
    },
    color: <String>, /*Цвет в hex*/
    thickness: <Number>, /*Толщина линии*/
    opacity: <Number>
}
```