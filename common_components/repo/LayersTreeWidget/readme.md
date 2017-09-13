# LayersTreeWidget

Контрол, отображающий дерево слоёв

## Зависимости

- jQuery
- Underscore
- Backbone
- GMXCommonComponents/GmxWidget
- GMXCommonComponents/CommonStyles
- GMXCommonComponents/Popover

## Интерфейс

Конструктор принимает хеш со следующими ключами:

- `<LayersTreeNode>layersTree` или `<LayersTreeNode>model` **обязательный** - дерево слоёв (экземпляр класса GMXCommonComponents/LayersTree)
- `<Number>maxDepth` - до какой глубины отображать дерево слоёв (по умолчанию 0 - не ограничено)
- `<Boolean>showInfoIcon` - показывать ли иконку описания слоя
- `<Boolean>showCenterIcon` - показывать ли иконку перецентровки слоя
- `<Object>customViews` - хеш с кастомными вьюхами. В качестве ключа указывается id группы или слоя, на место которого помещается вьюха. Если указана группа, то она не будет иметь потомков.
- `<Object>popoversContent` - что будет отображаться во всплывающих подсказках (`description` или `legend`)
- `<Object>popoversOptions` - хеш с настройками popover'a

Настройки popover'a (`popoversOptions`): (подробнее см. [bootstrap popovers](http://getbootstrap.com/javascript/#popovers))
- `<String>trigger` - действие, вызывающее показ подсказки (`hover` или `click`)
- `<String>container` - селектор DOM-элемента, в который будут добавляться popover'ы (можно указать также и jQuery-объект)

Виджет генерирует событие `centerLayer` по клику на кнопке перецентровки. В качестве параметра передаётся модель слоя.

## События

- `centerLayer (<LayersTreeNode>)` - кликнули по кнопке перецентровки

## Пример использования

```javascript
var layersTreeWidget = new nsGmx.LayersTreeWidget({
    layersTree: layersTree,
    maxDepth: 2,
    showCenterIcon: true,
    customViews: {
        "4Sr9QKzPdAdwu2q4": nsGmx.Fires.ToggleSwitchView
    },
    popoversContent: 'legend',
    popoversOptions: {
        trigger: 'click'
    }
});

layersTreeWidget.appendTo($('.layersTreeContainer'));
```
