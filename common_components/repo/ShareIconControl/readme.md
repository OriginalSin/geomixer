# ShareIconControl

Контрол, добавляющий на карту кнопку 'Share'. Наследует от L.Control.gmxIcon.

Зависимости: `jquery`, `underscore`, `backbone`, `handlebars`, `leaflet`, `gmxControls`, `translations`, `Popover`, `GmxWidget`, `AlertWidget`

## Аргументы конструктора

- `<PermalinkManager>permalinkManager` - инстанс PermalinkManager'а
- `<String>permalinkUrlTemplate` - шаблон ссылки на карту, открывающую пермалинк
- `<String>embeddedUrlTemplate` - шаблон ссылки на карту, которая вставляется в айфрейм
- `<String>previewUrlTemplate` - шаблон ссылки на предпорсмотр айфрейма
- `<String>embedCodeTemplate` - шаблон кода айфрейма
- `<Boolean>showPermalinkCheckbox` - показывать ли чекбокс "добавить пермалинк"

## Шаблоны ссылок по умолчанию

- permalinkUrlTemplate - `'{{origin}}?permalink={{permalinkId}}'`
- embeddedUrlTemplate - `'{{origin}}embedded.html{{#if permlalinkId}}?permalink={{permlalinkId}}{{/if}}'`
- previewUrlTemplate - `'{{origin}}iframePreview.html?width={{width}}&height={{height}}&permalinkUrl={{{embeddedUrl}}}'`
- embedCodeTemplate - `'<iframe src="{{{embeddedUrl}}}" width="{{width}}" height="{{height}}"></iframe>'`

## Пример использования

```javascript 
var shareIconControl = new nsGmx.ShareIconControl({
    permalinkManager: permalinkManager
});

map.addControl(shareIconControl);
```