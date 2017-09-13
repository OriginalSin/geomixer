# Leaflet.ExtSearch
## Leaflet Extended Search Control
### Usage:
```javascript
var searchControl = new nsGmx.SearchControl({
        addBefore: 'gmxprint',
        placeHolder: 'Поиск по кадастру, адресам, координатам',        
        position: 'topleft',
        limit: 10,
        providers: [            
            new nsGmx.OsmDataProvider({
                showOnMap: false,
                serverBase: 'http://maps.kosmosnimki.ru',
                limit: 10,
                onFetch: function (results) {                    
                }.bind(this),
            }) 
        ],
        style: {
            editable: false,
            map: true,
            pointStyle: {
                size: 8,
                weight: 1,
                opacity: 1,
                color: '#00008B'
            },
            lineStyle: {
                fill: false,
                weight: 3,
                opacity: 1,
                color: '#008B8B'
            }
        },
    });
map.addControl(searchControl);
```
- `<String> addBefore` - control reference before which to place search control
- `<String> placeHolder` - default input text
- `<String> position` - leaflet control corner
- `<Number> limit` - suggestion rows limit
- `<Object>[] providers` - suggestion providers