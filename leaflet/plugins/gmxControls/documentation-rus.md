# Плагины контролов ГеоМиксера

### Менеджер контролов ГеоМиксера
К конкретным контролам после их добавления к карте можно получить доступ через объект `map.gmxControlsManager` (`map` - карта, к которой были добавлены контролы) со следующими методами

Метод|Синтаксис|Описание
------|------|:---------
get|`get(ID)`| Получить контрол по её идентификатору
getAll|`getAll()`| Получить все добавленные контролы ГеоМиксера
init|`init(<initOptions> options?)`| Инициализация контролов ГеоМиксера.

При отсутствии [initOptions](#initoptions) устанавливаются контролы по умолчанию.
В [initOptions](#initoptions) для каждого контрола можно указывать опции либо `null` для отмены установки контрола.

#### initOptions

Свойство|По умолчанию|Описание
------|:---------:|:-----------
gmxHide|`{}`| Контрол [L.control.gmxHide](#Плагин-lcontrolgmxhide)
gmxLoaderStatus|`{}`| Контрол [L.control.gmxLoaderStatus](#Плагин-lcontrolgmxloaderstatus)
gmxZoom|`{}`| Контрол [L.control.gmxZoom](#Плагин-lcontrolgmxzoom)
gmxDrawing|`{}`| Контрол [L.control.gmxDrawing](#Плагин-lcontrolgmxdrawing)
gmxBottom|`{}`| Контрол [L.control.gmxBottom](#Плагин-lcontrolgmxbottom)
gmxLocation|`{}`| Контрол [L.control.gmxLocation](#Плагин-lcontrolgmxlocation)
gmxCopyright|`{}`| Контрол [L.control.gmxCopyright](#Плагин-lcontrolgmxcopyright)
gmxLogo|`{}`| Контрол [L.control.gmxLogo](#Плагин-lcontrolgmxlogo)
gmxCenter|`{}`| Контрол [L.control.gmxCenter](#Плагин-lcontrolgmxcenter)

Все контролы создаются при помощи фабричных методов.

### Плагин L.control.gmxLayers
Позволяет переключать/отключать базовые подложки и оверлеи. Расширяет [L.Control.Layers](http://leafletjs.com/reference.html#control-layers).

Для добавления базовых подложек пользуйтесь командой добавления  базовых подложек `gmxBaseLayersManager.add` [Leaflet.gmxBaseLayersManager](https://github.com/OriginalSin/Leaflet.gmxBaseLayersManager/blob/master/documentation-rus.md). 

#### Creation

Factory|Описание
------|:-----------
L.control.gmxLayers(<[Leaflet.gmxBaseLayersManager](https://github.com/OriginalSin/Leaflet.gmxBaseLayersManager/blob/master/documentation-rus.md)>, <Options> options? ) | Создание контрола  базовых подложек и оверлеев.

#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|layers| Идентификатор контрола.
collapsed|Boolean|false| Контрол развернут.
hideBaseLayers|Boolean|false| При true скрыть список базовых подложек.

#### Методы

Метод|Синтаксис|Возвращает|Описание
------|---------------------|:------|:-------
addOverlay|`addOverlay(<`[ILayer](http://leafletjs.com/reference.html#control-layers)`> layer, <String> name)`|this| Добавление оверлея.
removeLayer|`removeLayer(<`[ILayer](http://leafletjs.com/reference.html#control-layers)`> layer)`|this| Удаление оверлея.
getActiveBaseLayer|`getActiveBaseLayer()`| <[String](http://leafletjs.com/reference.html#control-layers-config)&nbsp;&#124;null>|Получить активную базовую подложку. При отсутствии активной базовой подложки возвращается `null`
setActiveBaseLayer|`setActiveBaseLayer(<`[String](http://leafletjs.com/reference.html#control-layers-config)`> name)`| `this` |Включение активности базовой подложки или оверлея.
unSetActiveBaseLayer|`unSetActiveBaseLayer(<`[String](http://leafletjs.com/reference.html#control-layers-config)`> name)`| `this` |Отключение активности базовой подложки или оверлея.

### Плагин L.control.gmxZoom
Позволяет переключать zoom - при наведении показывает текущую шкалу zoom. Расширяет [L.Control.Zoom](http://leafletjs.com/reference.html#control-zoom).
#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|zoom| Идентификатор контрола.
zoomslider|`<Boolean>`|`true`| Показывать слайдер.

### Плагин L.control.gmxBottom
Добавляет `bottom` контейнер контролов. Расширяет [L.Control](http://leafletjs.com/reference.html#control).
### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|bottom| Идентификатор контрола.
notHide|`<Boolean>`|true| Не скрывать контрол при переключении видимости контролов.

### Плагин L.control.gmxCenter
Добавляет контрол центр карты. Расширяет [L.Control](http://leafletjs.com/reference.html#control).
### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|center| Идентификатор контрола.
color|`<String>`|`#216b9c`| Цвет контрола.

#### Методы

Метод|Синтаксис|Возвращает|Описание
------|------|---------|:---------
setColor|`setColor(<`String`>`|this| Изменить цвет контрола.

### Плагин L.control.gmxLogo
Добавляет логотип `Сканекс`. Расширяет [L.Control](http://leafletjs.com/reference.html#control).
### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|center| Идентификатор контрола.
type|`<String>`|`""`| Тип логотипа (для включения цветного логотипа `color`).
notHide|`<Boolean>`|true| Не скрывать контрол при переключении видимости контролов.

### Плагин L.control.gmxCopyright
Позволяет отображать список копирайтов показываемых слоев. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|copyright| Идентификатор контрола.
position|`<String>`|`bottomleft`| По умолчанию в левом нижнем углу карты.
cursorPosition|`<Boolean>`|false| Показывать позицию курсора.
type|`<String>`|`window`| Тип отображения `line` - в одной строке, `window` - в виде всплывающего списка.
scanexCopyright|`<String>`|`<a target="_blank" href="http://maps.kosmosnimki.ru/Apikey/License.html">&copy; 2007-2015 RDC ScanEx</a> - Terms of Service`| Копирайт Scanex.
leafletCopyright|`<String>`|`<a target="_blank" href="http://leafletjs.com">&copy; Leaflet</a>`| Копирайт Leaflet.
mapCopyright|`<String>`|`""`| Копирайт карты.
notHide|`<Boolean>`|true| Не скрывать контрол при переключении видимости контролов.

#### Методы

Метод|Синтаксис|Описание
------|------|:---------
setFormat|`setFormat(<String>)`| Установить тип отображения (`line` или `window`).
setMapCopyright|`setMapCopyright(<String>)`| Установить копирайт карты.

### Плагин L.control.gmxLocation
Позволяет отображать текущее положение и масштаб карты. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------|:-----------
id|`<String>`|location| Идентификатор контрола.
position|`<String>`|bottomright| По умолчанию в правом нижнем углу карты.
scaleFormat|`<String>`|bar| Формат отображения масштаба. Возможны значения `bar`, `text`.
coordinatesFormat|`<Number>`|0| Формат отображения координат. Возможны значения (0 - `51.289405 N, 77.167968 E`, 1 - `51°17'21.86" N, 77°10'04.69" E`, 2 - `8590299, 6639284 (EPSG:3395)`, 3 - `8590299, 6672647 (EPSG:3857)`).
notHide|`<Boolean>`|true| Не скрывать контрол при переключении видимости контролов.
onCoordinatesClick|`<Func>`|null| Функция вызываемая при `click` на текущих координатах центра карты.

#### Events

| Type | Property | Description
| --- | --- |:---
| coordinatesformatchange | `<Event>` | Изменение режима формата отображения координат (в событие передается `coordinatesFormat` <Number> - текущий формат).

### Плагин L.control.gmxLoaderStatus
Отображает режим загрузки растровых или векторных данных Geomixer слоев.
#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------|:-----------
id|`<String>`|loaderStatus| Идентификатор контрола.
type|`<String>`|gif| Тип иконки - возможные значения `font`, `gif`.

#### Методы

Метод|Синтаксис|Возвращает|Описание
------|------|:---------:|:-----------
addItem|`addItem(<String>id, type<String>)`|`<String>` - уникальный идентификатор загружаемого ресурса| Принимает id - уникальный идентификатор загружаемого ресурса (например URL, при отсутствии будет создан), type - тип загружаемого ресурса(`vector`, `raster` или `` - по умолчанию '').
removeItem|`removeItem(<String>id)`|| Удаление уникального идентификатора загружаемого ресурса (применяется при окончании или отмене загрузки).

### Плагин L.control.gmxHide
Позволяет переключать видимость контролов (игнорирует контролы имеющие опцию `notHide` = true). Расширяет [L.Control.GmxIcon](#Плагин-lcontrolgmxicon).
#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|hide| Идентификатор контрола.

### Плагин L.control.gmxDrawing
Плагин переключения режимов рисования обьектов. Расширяет [L.control.gmxIconGroup](#Плагин-lcontrolgmxicongroup).

#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|drawing| Идентификатор контрола.
position|`<String>`|topleft| По умолчанию в левом верхнем углу.
items|`<L.control.gmxIcon | String>[]`|`['Point', 'Polygon', 'Polyline', 'Rectangle']`| Массив контролов drawing режимов. Вместо контрола можно указывать строковые идентификаторы встроенных контролов.
drawOptions|<[Feature Options](https://github.com/ScanEx/gmxDrawing/blob/master/documentation-rus.md#feature-options)>|`{}`| Опции создаваемых обьектов.

### Плагин L.control.gmxIcon
Плагин создания пользовательских контролов-иконок. Расширяет [L.Control](http://leafletjs.com/reference.html#control).

#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|'defaultIcon'| идентификатор контрола (контейнеру контрола присваивается CSS класс leaflet-gmx-icon-идентификатор, в режиме активности добавляется -active).
className|`<String>`|''| Добавить CSS класс в контейнер контрола (через пробел в строке можно указывать несколько классов).
position|`<String>`|topleft| По умолчанию в левом верхнем углу.
title|`<String>`|''| Подсказка на контроле.
togglable|`<Boolean>`|false| При `true` контрол с возможностью переключения режима активности.
regularImageUrl|`<String>`|''| URL отображаемой иконки контрола (по умолчанию отображение иконки контрола задается через CSS класс).
activeImageUrl|`<String>`|''| URL иконки контрола в режиме активности.
text|`<String>`|''| Текст отображаемый рядом с иконкой контрола (по умолчанию без текста).
isActive|`<Boolean>`|false| Текущее состояние режима активности.
addBefore|`<String>`|''| Добавлять перед контролом с заданным id, если заданный контрол найден.

#### Методы

Метод|Синтаксис|Описание
------|------|:---------
setActive|`setActive(<Boolean>)`| Переключение режима активности контрола.
addBefore|`addBefore(<String>)`| Добавить перед контролом с заданным id, если заданный контрол найден.

#### Events

| Type | Property | Description
| --- | --- |:---
| click | `<Event>` | Click на иконке контрола.
| statechange | `<Event>` | Изменение режима активности. Событие происходит только для иконок с `togglable = true`
| controladd | `<Event>` | Контрол добавлен на карту.
| controlremove | `<Event>` | Контрол удален с карты.

### Плагин L.control.gmxIconGroup
Плагин группы пользовательских контролов. Расширяет [L.control.gmxIcon](http://leafletjs.com/reference.html#control).

#### Options

Свойство|Тип|По умолчанию|Описание
------|------|:---------:|:-----------
id|`<String>`|'defaultIconGroup'| идентификатор группы (контейнеру группы присваивается CSS класс leaflet-gmx-icon-group-идентификатор).
position|`<String>`|topleft| По умолчанию в левом верхнем углу.
isVertical|`<Boolean>`|`true`| Признак вертикального размещения контролов в группе.
isCollapsible|`<Boolean>`|`true`| Признак развертывания группы по наведению мыши(при `false` группа развернута всегда).
isSortable|`<Boolean>`|`false`| Признак перемещения текущего контрола вверх группы.
singleSelection|`<Boolean>`|`false`| При значении `true` активный контрол в группе только один.
items|`<L.control.gmxIcon>[]`|`[]`| Массив контролов-иконок.
addBefore|`<String>`|''| Добавлять перед контролом с заданным id, если заданный контрол найден в контейнере группы.

#### Методы

Метод|Синтаксис|Описание
------|------|:---------
addIcon|`addIcon(<L.control.gmxIcon>)`| Добавить контрол в группу.
removeIcon|`removeIcon(<L.control.gmxIcon>)`| Удалить контрол из группы.
setActiveIcon|`setActiveIcon(<L.control.gmxIcon>)`| Установить активный контрол в группе.

#### Events

| Type | Property | Description
| --- | --- |:---
| activechange | `<Event>` | Изменение активного контрола в группе.
| collapse | `<Event>` | Группа развернута. Событие происходит только для контролов с `isCollapsible = true`.
| expand | `<Event>` | Группа свернута. Событие происходит только для контролов с `isCollapsible = true`.
