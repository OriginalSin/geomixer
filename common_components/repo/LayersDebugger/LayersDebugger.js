/** @namespace
 */
var nsGmx = window.nsGmx = window.nsGmx || {};

nsGmx.LayersDebugger = (function() {
    /** LayersDebugger
     * @alias nsGmx.LayersDebugger
     * @class инструмент для отладки дерева слоёв
     * @constructor
     * @param {nsGmx.LayersTree} layersTree
     */
    var LayersDebugger = function(layersTree) {
        this.defaultMask = 'name GroupID title visible';
        this.defaultSplitter = ' ';
        this.layersTree = layersTree;
    };

    /** Найти слой по свойству prop, используя регулярку reg
     * @param  {RegExp} reg
     * @param  {String} prop
     * @return {Array<Layer>}
     */
    LayersDebugger.prototype.find = function(reg, prop) {
        var found = [];
        this.layersTree.eachNode(function(model) {
            if (model.get('properties')[prop] && model.get('properties')[prop].toString().match(reg)) {
                found.push(model);
            }
        });
        return found;
    };

    /** Отобразить слои, найденые функцией find
     * @param  {Array<Layer>} layers Массив слоёв для отображения.
     *                               Можно использовать вывод функции find
     * @param  {String} mask        Отображаемые параметры, разделённые пробелом.
     *                              Например 'title LayerID'
     * @param  {String} splitter    разделитель
     */
    LayersDebugger.prototype.display = function(layers, mask, splitter) {
        mask = mask || this.defaultMask;
        splitter = splitter || this.defaultSplitter;
        var displayProps = mask.split(' ');
        for (var i = 0; i < layers.length; i++) {
            var props = layers[i].get('properties');
            var logstr = splitter;
            for (var j = 0; j < displayProps.length; j++) {
                logstr += props[displayProps[j]] + splitter;
            }
            console.log(logstr);
        }
    };

    /** Отобразить все возможные параметры, доступные для поиска
     * @param  {String} splitter    разделитель
     */
    LayersDebugger.prototype.listProps = function(splitter) {
        splitter = splitter || this.defaultSplitter;
        var propsStr = splitter;
        this.layersTree.eachNode(function(model) {
            for (prop in model.get('properties')) {
                if (model.get('properties').hasOwnProperty(prop)) {
                    if (propsStr.indexOf(prop) === -1) {
                        propsStr += prop + splitter;
                    }
                }
            }
        });
        console.log(propsStr);
    };

    /** Нарисовать в консоли дерево слоёв
     * @param  {String} mask        Отображаемые параметры, разделённые пробелом.
     *                              Например 'title LayerID'
     * @param  {String} splitter    разделитель
     */
    LayersDebugger.prototype.traceTree = function(mask, splitter) {
        mask = mask || this.defaultMask;
        splitter = splitter || this.defaultSplitter;
        var displayProps = mask.split(' ');
        var modelProps = ['visible', 'expanded', 'depth'];
        this.layersTree.eachNode(function(model) {
            var propsStr = '';
            for (var i = 0; i < displayProps.length; i++) {
                var prop = displayProps[i];
                var val = modelProps.indexOf(prop) !== -1 ? model.get(prop) : model.get('properties')[prop];
                propsStr += val + splitter;
            }
            var paddingStr = new Array(model.get('depth') + 2).join('-');
            console.log(paddingStr + splitter + propsStr);
        });
    };

    return LayersDebugger;
})();