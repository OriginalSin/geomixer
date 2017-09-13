# LayersDebugger

Консольный инструмент для удобного поиска слоёв по названию и id.

```
var layersDebugger = new LayersDebugger(layersTree);
window.ld = layersDebugger;

ld.display(ld.find(/^пожар/ig, 'title'), 'LayerID title', '|')
>|user-firesGlobal|Пожары FIRMS| 
>|user-fires|Пожары СКАНЭКС| 

ld.display(ld.find('9F542C78948F46ED8CC0BB123A88AA28', 'LayerID'))
> 9F542C78948F46ED8CC0BB123A88AA28 Заповедники 
```