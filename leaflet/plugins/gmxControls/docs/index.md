# Плагины контролов ГеоМиксера


### Плагин L.Control.gmxLayers
> Позволяет переключать/отключать базовые подложки и оверлеи. Расширяет [L.Control.Layers](http://leafletjs.com/reference.html#control-layers).

### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------:
collapsed|Boolean|false| Контрол развернут.

### Методы

Метод|Синтаксис|Возвращает|Описание
------|------|---------|---------|---------
setActiveBaseLayer|`setActiveBaseLayer(<`[String](http://leafletjs.com/reference.html#control-layers-config)`> name)`| `this` | Переключение активности базовой подложки или оверлея. Если базовая подложка активна, то она отключается.
getActiveBaseLayer|`getActiveBaseLayer()`| `<`[String](http://leafletjs.com/reference.html#control-layers-config) &#124;` null>` | Получить активную базовую подложку. При отсутствии активной базовой подложки возвращается `null`

### Плагин L.Control.gmxHide
> Позволяет переключать видимость контролов. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

### Плагин L.Control.gmxBottom
> Добавляет `bottom` контейнер контролов. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

### Плагин L.Control.gmxZoom
> Позволяет переключать zoom - при наведении показывает текущую шкалу zoom. Расширяет [L.Control.Zoom](http://leafletjs.com/reference.html#control-zoom).

### Плагин L.Control.gmxCopyright
> Позволяет отображать список копирайтов показываемых слоев. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------:
position|String|bottomleft| По умолчанию в левом нижнем углу карты.

### Плагин L.Control.gmxLocation
> Позволяет отображать текущее положение и масштаб карты. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------:
position|String|bottomright| По умолчанию в правом нижнем углу карты.

### Плагин L.Control.gmxDrawing
> Плагин переключения режимов рисования обьектов. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------:
position|String|topleft| По умолчанию в левом верхнем углу.

### Плагин L.Control.gmxIcon
> Плагин создания пользовательских контролов. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------:
id|String|``| идентификатор контрола (контейнеру контрола присваивается CSS класс leaflet-gmx-icon-идентификатор, в режиме активности добавляется -active).
position|String|topleft| По умолчанию в левом верхнем углу.
title|String|``| Подсказка на контроле.
toggle|Boolean|false| При `true` контрол с возможностью переключения режима активности.
regularImageUrl|String|``| URL отображаемой иконки контрола (по умолчанию отображение иконки контрола задается через CSS класс).
activeImageUrl|String|``| URL иконки контрола в режиме активности.
isActive|Boolean|false| Текущее состояние режима активности.

### Методы

Метод|Синтаксис|Описание
------|------|:---------:|:-----------:
setActive|`setActive(<Boolean> flag`| Переключение режима активности контрола.

