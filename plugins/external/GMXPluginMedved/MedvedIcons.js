(function() {
    "use strict";
    var pluginName = 'MedvedIcons';
    var publicInterface = {
        pluginName: pluginName,
        afterViewer: function(params, map) {
            var _params = $.extend({
            }, params);

            var lmap = nsGmx.leafletMap,
                layersByID = nsGmx.gmxMap.layersByID,
                iconPrefix = _params.iconPrefix,
                serverScript = 'http://maps.kosmosnimki.ru/VectorLayer/Search.ashx',
                _this = {},
                activeLayer,
                iconsGroup;

            var prepareParams = function () {
                var out = {};
                if (_params.layers) {
                    var num = 1;
                    for (var layerId in _params.layers) {
                        if (!layersByID[layerId]) continue;

                        var it = _params.layers[layerId],
                            id = it.id || (pluginName + '_icon' + num),
                            pt = {
                                layerId: layerId,
                                id: id,
                                togglable: true
                            };

                        pt.iconPrefix = it.iconPrefix || iconPrefix;
                        pt.select = it.select || _params.select;
                        if (it.icon) pt.regularImageUrl = pt.iconPrefix + it.icon;
                        if (it.iconText) pt.text = it.iconText;
                        if (it.attribute) pt.attribute = it.attribute;
                        if (it.values) pt.values = it.values;
                        if (it.style) pt.style = it.style;
                        if (it.results) pt.results = it.results;
                        if (it.attributes) {
                            pt.attributes = it.attributes;
                            pt.attributes.map(function(item) {
                                if (!pt.values && item.values) {
                                    pt.values = item.values;
                                    pt.attribute = item.name;
                                    pt.select = item.title;
                                }
                            });
                        } else {
                            pt.attributes = [
                                {
                                    title: it.select,
                                    name: it.attribute,
                                    values: it.values,
                                    result: {
                                        name: it.attribute
                                    }
                                }
                            ];
                        }
                        out[layerId] = pt;
                        num++;
                    }
                }
                return out;
            };
            var layers = prepareParams();


            var getItemsOptions = function(layer) {
                var layerId = layer.getGmxProperties().name,
                    options = [];
                if (layerId && layers[layerId]) {
                    var values = layers[layerId].values;
                    values.map(function(it) {
                        options.push('<option>' + it + '</option>');
                    });
                }
                var select = L.DomUtil.create('select', pluginName + '-selectItem selectStyle');
                select.innerHTML = options.join('\n');
                return select;
            };
            var parseServerData = function(pt, attr) {
                var select = attr.select,
                    fields = pt.fields,
                    indexes = {};
                fields.map(function(it, i) {
                    indexes[it] = i;
                });
                var node = L.DomUtil.create('select', pluginName + '-selectItem selectStyle');
                var values = pt.values,
                    name = select.name,
                    key = select.id,
                    options = values.map(function(it) {
                        var id = it[indexes[key]],
                            val = it[indexes[name]],
                            geo = it[it.length - 1],
                            opt = L.DomUtil.create('option', '', node);
                        opt.setAttribute('id', id);
                        opt.setAttribute('_geoLength', L.gmxUtil.geoLength(L.gmxUtil.convertGeometry(geo, true)));
                        opt.text = val;
                        return opt;
                        return '<option id="' + id + '">' + val + '</option>';
                    });

                if (attr.title) {
                    var opt = L.DomUtil.create('option', '', node);
                    opt.text = attr.title;
                    node.insertBefore(opt, node.firstChild);
                }
                return node;
            };
            var chkAttributes = function(attributes) {
                var def = new L.gmx.Deferred(),
                    cnt = 0;
                attributes.map(function(pt, num) {
                    if (pt.select) {
                        cnt++;
                        L.gmxUtil.sendCrossDomainPostRequest(
                            serverScript, 
                            {
                                WrapStyle: 'message',
                                geometry: true,
                                pagesize: 100,
                                orderby: 'Date',
                                layer: pt.select.layer,
                                columns: pt.select.columns
                            },
                            function(json) {
                                if (json && json.Status === 'ok' && json.Result) {
                                    pt.htmlNode = parseServerData(json.Result, pt);
                                }
                                cnt--;
                                if (cnt === 0) def.resolve();
                            }
                        );
                    }
                });
                if (cnt === 0) def.resolve();
                return def;
            }
            var chkResults = function(item) {
                var def = new L.gmx.Deferred();
                L.gmxUtil.sendCrossDomainPostRequest(
                    serverScript, 
                    {
                        WrapStyle: 'message',
                        pagesize: 100,
                        //query: item._date,
                        layer: item.results.layer,
                        orderby: item.results.orderby,
                        groupby: item.results.groupby,
                        columns: item.results.columns
                    },
                    function(json) {
                        var out = {};
                        if (json && json.Status === 'ok' && json.Result) {
                            var values = json.Result.values;
                            values.map(function(it) {
                                if (it[1] === item._date) out[it[0]] = it[2];
                            });
                        }
                        def.resolve(out);
                    }
                );
            
                return def;
            }

            var start = function() {
                var select = $('<select/>');
                var firstIcon = null,
                    mapListenerId = null;
                if (_params.iconText) {
                    firstIcon = L.control.gmxIcon({
                        id: pluginName + 'Open',
                        text: _params.iconText
                    });
                }
                var statechange = function(ev) {
                    if (firstIcon) {
                        iconsGroup.removeIcon(firstIcon);
                        firstIcon = null;
                    }
                    var target = ev.target,
                        options = target.options;

                    activeLayer = options.layerId;
                    var item = layers[activeLayer],
                        attribute = item.attribute,
                        layer = layersByID[activeLayer];
                    if (!layer) {
                        console.log('Warning in ' + pluginName + ': Layer ' + activeLayer + ' not found');
                        return;
                    }
                    var type = layer.getGmxProperties().GeometryType.toUpperCase();
                    var geojson = L.gmxUtil.geometryToGeoJSON({
                        type: type
                    });
                    if (options.isActive) {
                        var addDone = function (ev) {
                            lmap.gmxDrawing.off('add', addDone);
                            iconsGroup.setActiveIcon();
                            var editControl = new nsGmx.EditObjectControl(activeLayer, null, {
                                drawingObject: ev.object,
                                fields:[
                                    {
                                        name: attribute,
                                        hide: true
                                    },
                                    {
                                        title: item.select,
                                        view: {
                                            getUI: function(editDialog) {
                                                var layer = editDialog.getLayer(),
                                                    select = getItemsOptions(layer);
                            
                                                setTimeout(function() {editDialog.set(attribute, select.options[0].text);}, 0);
                                                select.onchange = function(ev) {
                                                    var str = select.options[select.options.selectedIndex].text;
                                                    editDialog.set(attribute, str);
                                                };
                                                return select;
                                            }
                                        }
                                    }
                                ]
                            });
                        };
                        lmap.gmxDrawing.on('add', addDone);
                        lmap.gmxDrawing.create(geojson.type);
                    } else {
                        lmap.gmxDrawing.create();
                    }
                };

                var items = [];
                for (var layerId in layers) {
                    items.push(L.control.gmxIcon(layers[layerId]).on('statechange', statechange));
                }
                if (items.length) {
                    if (items.length > 1) items.unshift(firstIcon);
                    iconsGroup = L.control.gmxIconGroup({
                        id: pluginName + 'Control',
                        addBefore: 'drawingZoom', //'boxzoom',
                        width: _params.width || 'auto',
                        isSortable: true,
                        singleSelection: true,
                        items: items
                    });
                    lmap.addControl(iconsGroup);
                }
            };

            var sql = '';
            nsGmx.addAttributesTableHook(function(params, layerId) {
                if (layers[layerId]) {
                    var item = layers[layerId],
                        keysArr = [],
                        itemSelected = {},
                        resFunc = null,
                        attributes = item.attributes;

                    params.searchParamsManager = {
                        render: function(container, attrTable) {
                            var _this = this,
                                cont = $(container)[0],
                                div = L.DomUtil.create('div', 'searchMedved');

                            chkAttributes(item.attributes).then(function() {
                                attributes.map(function(pt, num) {
                                    keysArr[num] = '';
                                    if (pt.values) {
                                        var updateSQL = function(setFlag) {
                                            var arr = [],
                                                nodes = div.childNodes;

                                            itemSelected = {};
                                            for (var i = 0, len = nodes.length; i < len; i++) {
                                                var node = nodes[i].childNodes[0];
                                                if (setFlag === 'set') node.checked = true;
                                                else if (setFlag === 'unset') node.checked = false;
                                                if (node.checked) {
                                                    arr.push('['+pt.name+'] = \'' + node.id + '\'');
                                                    itemSelected[node.id] = true;
                                                }
                                            }
                                            sql = arr.length ? arr.join(' OR ') : '['+pt.name+'] = \'false\'';
                                            keysArr[num] = sql;
                                            $(_this).trigger('queryChange');
                                        };
                                        pt.values.map(function(name) {
                                            var label = L.DomUtil.create('label', 'medved-attrs-table-row', div),
                                                input = L.DomUtil.create('input', 'medved-attrs-table-active-checkbox', label),
                                                span = L.DomUtil.create('span', 'medved-attrs-table-active-span', label);
                                            span.innerHTML = name;
                                            label.title = input.id = name;
                                            input.type = "checkbox";
                                            input.checked = true;
                                            L.DomEvent.on(input, 'click', updateSQL);
                                        });
                                        cont.appendChild(div);
                                        updateSQL();
                                        pt.updateSQL = updateSQL
                                    } else if (pt.htmlNode) {
                                        var node = pt.htmlNode;
                                        if (node.tagName === 'SELECT') {
                                            cont.appendChild(node);
                                            var updateSQL = function(setFlag) {
                                                if (setFlag === 'set') node.selectedIndex = 0;
                                                var opt = node.options[node.selectedIndex],
                                                    sql = null,
                                                    date = null;
                                                if (opt.id > 0) {
                                                    date = new Date(1000 * opt.id).toJSON();
                                                    sql = ['['+pt.select.id+'] = \'' + date + '\''];
                                                }
                                                item._date = Number(opt.id);
                                                item._dateSQL = date;
                                                keysArr[num] = sql;
                                                $(_this).trigger('queryChange');
                                                item._geoLength = Number(opt.getAttribute('_geoLength'));
                                            };
                                            updateSQL('set');
                                            pt.updateSQL = updateSQL
                                            
                                            L.DomEvent.on(node, 'change', updateSQL);
                                        }
                                    }
                                });

                                var buttonsDiv = L.DomUtil.create('div', 'buttonsMedved');
                                var setAll = L.DomUtil.create('span', 'medved-buttonLink buttonLink', buttonsDiv);
                                setAll.innerHTML = _params.setAll;
                                L.DomEvent.on(setAll, 'click', function() {
                                    attributes.map(function(pt, num) {
                                        pt.updateSQL('set');
                                    });
                                });
                                var unsetAll = L.DomUtil.create('span', 'medved-buttonLink buttonLink', buttonsDiv);
                                unsetAll.innerHTML = _params.unSetAll;
                                L.DomEvent.on(unsetAll, 'click', function() {
                                    attributes.map(function(pt, num) {
                                        pt.updateSQL('unset');
                                    });
                                });
                                cont.appendChild(buttonsDiv);
                                L.DomUtil.create('br', '', cont);

                                if (item.results) {
                                    var result = L.DomUtil.create('div', 'medved-result', cont);
                                    result.style.display = 'none';
                                    resFunc = function() {
                                        chkResults(item).then(function(pt) {
                                            var conf = item.results.conf,
                                                geoLength = item._geoLength / 1000,
                                                str = 'Протяженность маршрута: <b>'+L.Util.formatNum(geoLength, 3)+' км.</b><br>';
                                            str += '<b>Плотность населения зверей:</b><br>';
                                            str += '<ul>';
                                            for (var key in pt) {
                                                if (itemSelected[key]) {
                                                    var zn = pt[key] * conf[key] * 10 / geoLength;
                                                    str += '<li>'+key+' - <b>'+L.Util.formatNum(zn, 2)+'</b></li>';
                                                }
                                            }
                                            str += '</ul>';
                                            result.innerHTML = str;
                                            result.style.display = key ? 'block': 'none';
                                        });
                                    }
                                }
                            });
                        },
                        getQuery: function() {
                            if (resFunc) resFunc();
                            var res = [];
                            keysArr.map(function(pt) {
                                if (pt) {
                                    res.push(pt);
                                }
                            });
                            var sql = res.join(' AND ');
                            return sql;
                        }
                    }
                }
            });

            start();
        }
    };
    gmxCore.addModule(pluginName, publicInterface, {
        css: 'MedvedIcons.css'
    });
})();