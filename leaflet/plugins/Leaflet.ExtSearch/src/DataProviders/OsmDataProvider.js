
class OsmDataProvider {
    constructor({serverBase, limit, onFetch, showOnMap}){
        this._serverBase = serverBase;
        this._onFetch = onFetch;        
        this.showSuggestion = true;
        this.showOnMap = showOnMap;
        this.showOnSelect = true;
        this.showOnEnter = true;
        this.find = this.find.bind(this);
        this.fetch = this.fetch.bind(this);
        this._convertGeometry = this._convertGeometry.bind(this);

        this._key = window.KOSMOSNIMKI_SESSION_KEY == null || window.KOSMOSNIMKI_SESSION_KEY == 'INVALID' ? '' : `&key=${window.KOSMOSNIMKI_SESSION_KEY}`;
    }
    _convertGeometry(geometry) {        
        switch (geometry.type.toUpperCase()) {
            case 'POINT':
                geometry.type = 'Point';
                break;
            case 'POLYGON':
                geometry.type = 'Polygon';
                break;
            case 'MULTIPOLYGON':
                geometry.type = 'MultiPolygon';
                break;
            case 'LINESTRING':
            case 'POLYLINE':
                geometry.type = 'LineString';
                break;
            case 'MULTILINESTRING':
                geometry.type = 'MultiLineString';
                break;
            default:
                throw 'Unknown WKT type';
        }
        return geometry;
    }
    fetch (obj) {
        const query = `RequestType=ID&ID=${obj.ObjCode}&TypeCode=${obj.TypeCode}&UseOSM=1`;        
        let req = new Request(`${this._serverBase}/SearchObject/SearchAddress.ashx?${query}${this._key}`);
        let headers = new Headers();
        headers.append('Content-Type','application/json');        
        let init = {
            method: 'GET',            
            mode: 'cors',
            credentials: 'include',        
            cache: 'default',
        };
        return new Promise((resolve, reject) => {
            fetch (req, init)
            .then(response => response.text())
            .then(response => {                
                const json = JSON.parse (response.slice(1, response.length - 1));
                if(json.Status === 'ok'){
                    const rs = json.Result
                    .reduce((a,x) => a.concat(x.SearchResult), [])
                    .map(x => {
                        let g = this._convertGeometry (x.Geometry);
                        let props = Object.keys(x)
                        .filter(k => k !== 'Geometry')
                        .reduce((a,k) => {
                            a[k] = x[k];
                            return a;
                        }, {});
                        return {
                            feature: {
                                type: 'Feature',
                                geometry: g,
                                properties: props,                            
                            },
                            provider: this,
                            query: obj,
                        };
                    });
                    if (typeof this._onFetch === 'function'){
                        this._onFetch(rs);
                    }                
                    resolve(rs);
                }
                else {
                    reject(json);
                }                
            });
        });
    }
    find(value, limit, strong, retrieveGeometry){
        const _strong = Boolean(strong) ? 1 : 0;
        const _withoutGeometry = Boolean(retrieveGeometry) ? 0 : 1; 
        const query = `RequestType=SearchObject&IsStrongSearch=${_strong}&WithoutGeometry=${_withoutGeometry}&UseOSM=1&Limit=${limit}&SearchString=${encodeURIComponent(value)}`;        
        let req = new Request(`${this._serverBase}/SearchObject/SearchAddress.ashx?${query}${this._key}`);
        let headers = new Headers();
        headers.append('Content-Type','application/json');        
        let init = {
            method: 'GET',
            mode: 'cors', 
            credentials: 'include',
            cache: 'default',
        };
        return new Promise((resolve, reject) => {
            fetch (req, init)
            .then(response => response.text())
            .then(response => {
                const json = JSON.parse (response.slice(1, response.length - 1));
                if(json.Status === 'ok'){                    
                    const rs = json.Result
                    .reduce((a,x) => a.concat(x.SearchResult), [])
                    .map(x => {
                        if (retrieveGeometry) {
                            let g = this._convertGeometry (x.Geometry);
                            let props = Object.keys(x)
                            .filter(k => k !== 'Geometry')
                            .reduce((a,k) => {
                                a[k] = x[k];
                                return a;
                            }, {});
                            return {
                                name: x.ObjNameShort,
                                feature: {
                                    type: 'Feature',
                                    geometry: g,
                                    properties: props,                            
                                },
                                properties: props,
                                provider: this,
                                query: value,
                            };
                        }
                        else {
                            return {
                                name: x.ObjNameShort,
                                properties: x,
                                provider: this,
                                query: value,
                            };
                        }                        
                    });
                    if (limit === 1 && strong && retrieveGeometry && typeof this._onFetch === 'function'){
                        this._onFetch(rs);
                    }
                    resolve(rs);                    
                }
                else {
                    reject(json);
                }                
            });
        });
    }
}

window.nsGmx = window.nsGmx || {};
window.nsGmx.OsmDataProvider = OsmDataProvider;

export { OsmDataProvider };