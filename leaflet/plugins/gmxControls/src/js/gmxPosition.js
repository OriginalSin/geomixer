L.Map.addInitHook(function () {
    var corners = this._controlCorners,
        parent = this._controlContainer,
        tb = 'leaflet-top leaflet-bottom',
        lr = 'leaflet-left leaflet-right',
        classNames = {
            bottom: 'leaflet-bottom ' + lr,
            gmxbottomleft: 'leaflet-bottom leaflet-left',
            gmxbottomcenter: 'leaflet-bottom ' + lr,
            gmxbottomright: 'leaflet-bottom leaflet-right',
            center: tb + ' ' + lr,
            right:  'leaflet-right ' + tb,
            left:   'leaflet-left ' + tb,
            top:    'leaflet-top ' + lr
        };

    for (var key in classNames) {
        if (!corners[key]) {
            corners[key] = L.DomUtil.create('div', classNames[key], parent);
        }
    }
});
