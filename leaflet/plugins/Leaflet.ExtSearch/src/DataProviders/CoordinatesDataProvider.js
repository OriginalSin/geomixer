
class CoordinatesDataProvider {
    constructor({onFetch, showOnMap}){
        this._onFetch = onFetch;
        this.showSuggestion = true;
        this.showOnMap = showOnMap;
        this.showOnSelect = false;
        this.showOnEnter = true;
        this.fetch = this.fetch.bind(this);
        this.find = this.find.bind(this);        

        this.rxF = new RegExp('^\\s*\\-?(\\d+(\\.\\d+)?)(\\s+(N|S))?(,\\s*|\\s+)\\-?(\\d+(\\.\\d+)?)(\\s+(E|W))?');
        this.rxD = new RegExp('^\\s*\\-?(\\d{1,2})(\\s|\\u00b0)(\\d{1,2})(\\s|\\u0027)(\\d{1,2}(\\.\\d+)?)(\\s|\\u0022)(N|S)?(,\\s*|\\s+)\\-?(\\d{1,2})(\\s|\\u00b0)(\\d{1,2})(\\s|\\u0027)(\\d{1,2}(\\.\\d+)?)(\\s|\\u0022)(E|W)?');
    }
    _parseCoordinates(value) {
        let m = this.rxD.exec(value);
        if (Array.isArray(m) && m.length === 18) {
            return this._parseDegrees ([m[1],m[3],m[5],m[10],m[12],m[14]].map(x => parseFloat(x)));
        }
        m = this.rxF.exec(value);
        if (Array.isArray (m) && m.length === 10){
            return {type: 'Point', coordinates: [
                parseFloat(m[6]),
                parseFloat(m[1])
            ]};
        }
        
        return null;               
    }
    _parseDegrees ([latDeg, latMin, latSec, lngDeg, lngMin, lngSec]) {    
        return {type: 'Point', coordinates: [
            lngDeg + lngMin / 60 + lngSec / 3600,
            latDeg + latMin / 60 + latSec / 3600
        ]};
    }
    fetch (value){
        return new Promise(resolve => resolve([]));        
    }
    find(value, limit, strong, retrieveGeometry){
        let g = this._parseCoordinates(value);        
        return new Promise(resolve => {
            let result = {feature: { type: 'Feature', geometry: g, properties: {} }, provider: this, query: value};
            if (g && typeof this._onFetch === 'function'){
                this._onFetch(result);
            }             
            resolve(g ? [result] : []);
        });
    }
}

window.nsGmx = window.nsGmx || {};
window.nsGmx.CoordinatesDataProvider = CoordinatesDataProvider;

export { CoordinatesDataProvider };