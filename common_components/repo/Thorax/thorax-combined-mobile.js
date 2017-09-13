/* Zepto v1.1.3 - zepto event ajax form ie - zeptojs.com/license */


var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = (text === undefined) ? '' : ''+text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)

/*!

 handlebars v2.0.0

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
/* exported Handlebars */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Handlebars = root.Handlebars || factory();
  }
}(this, function () {
// handlebars/safe-string.js
var __module3__ = (function() {
  "use strict";
  var __exports__;
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = function() {
    return "" + this.string;
  };

  __exports__ = SafeString;
  return __exports__;
})();

// handlebars/utils.js
var __module2__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  /*jshint -W004 */
  var SafeString = __dependency1__;

  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr];
  }

  function extend(obj /* , ...source */) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          obj[key] = arguments[i][key];
        }
      }
    }

    return obj;
  }

  __exports__.extend = extend;var toString = Object.prototype.toString;
  __exports__.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isFunction = function(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  /* istanbul ignore next */
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  __exports__.isFunction = isFunction;
  /* istanbul ignore next */
  var isArray = Array.isArray || function(value) {
    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
  };
  __exports__.isArray = isArray;

  function escapeExpression(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof SafeString) {
      return string.toString();
    } else if (string == null) {
      return "";
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = "" + string;

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __exports__.isEmpty = isEmpty;function appendContextPath(contextPath, id) {
    return (contextPath ? contextPath + '.' : '') + id;
  }

  __exports__.appendContextPath = appendContextPath;
  return __exports__;
})(__module3__);

// handlebars/exception.js
var __module4__ = (function() {
  "use strict";
  var __exports__;

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(message, node) {
    var line;
    if (node && node.firstLine) {
      line = node.firstLine;

      message += ' - ' + line + ':' + node.firstColumn;
    }

    var tmp = Error.prototype.constructor.call(this, message);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }

    if (line) {
      this.lineNumber = line;
      this.column = node.firstColumn;
    }
  }

  Exception.prototype = new Error();

  __exports__ = Exception;
  return __exports__;
})();

// handlebars/base.js
var __module1__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;

  var VERSION = "2.0.0";
  __exports__.VERSION = VERSION;var COMPILER_REVISION = 6;
  __exports__.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '== 1.x.x',
    5: '== 2.0.0-alpha.x',
    6: '>= 2.0.0-beta.1'
  };
  __exports__.REVISION_CHANGES = REVISION_CHANGES;
  var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials) {
    this.helpers = helpers || {};
    this.partials = partials || {};

    registerDefaultHelpers(this);
  }

  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: logger,
    log: log,

    registerHelper: function(name, fn) {
      if (toString.call(name) === objectType) {
        if (fn) { throw new Exception('Arg not supported with multiple helpers'); }
        Utils.extend(this.helpers, name);
      } else {
        this.helpers[name] = fn;
      }
    },
    unregisterHelper: function(name) {
      delete this.helpers[name];
    },

    registerPartial: function(name, partial) {
      if (toString.call(name) === objectType) {
        Utils.extend(this.partials,  name);
      } else {
        this.partials[name] = partial;
      }
    },
    unregisterPartial: function(name) {
      delete this.partials[name];
    }
  };

  function registerDefaultHelpers(instance) {
    instance.registerHelper('helperMissing', function(/* [args, ]options */) {
      if(arguments.length === 1) {
        // A missing field in a {{foo}} constuct.
        return undefined;
      } else {
        // Someone is actually trying to call something, blow up.
        throw new Exception("Missing helper: '" + arguments[arguments.length-1].name + "'");
      }
    });

    instance.registerHelper('blockHelperMissing', function(context, options) {
      var inverse = options.inverse,
          fn = options.fn;

      if(context === true) {
        return fn(this);
      } else if(context === false || context == null) {
        return inverse(this);
      } else if (isArray(context)) {
        if(context.length > 0) {
          if (options.ids) {
            options.ids = [options.name];
          }

          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        if (options.data && options.ids) {
          var data = createFrame(options.data);
          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
          options = {data: data};
        }

        return fn(context, options);
      }
    });

    instance.registerHelper('each', function(context, options) {
      if (!options) {
        throw new Exception('Must pass iterator to #each');
      }

      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      var contextPath;
      if (options.data && options.ids) {
        contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
      }

      if (isFunction(context)) { context = context.call(this); }

      if (options.data) {
        data = createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if (isArray(context)) {
          for(var j = context.length; i<j; i++) {
            if (data) {
              data.index = i;
              data.first = (i === 0);
              data.last  = (i === (context.length-1));

              if (contextPath) {
                data.contextPath = contextPath + i;
              }
            }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) {
                data.key = key;
                data.index = i;
                data.first = (i === 0);

                if (contextPath) {
                  data.contextPath = contextPath + key;
                }
              }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });

    instance.registerHelper('if', function(conditional, options) {
      if (isFunction(conditional)) { conditional = conditional.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function(conditional, options) {
      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
    });

    instance.registerHelper('with', function(context, options) {
      if (isFunction(context)) { context = context.call(this); }

      var fn = options.fn;

      if (!Utils.isEmpty(context)) {
        if (options.data && options.ids) {
          var data = createFrame(options.data);
          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
          options = {data:data};
        }

        return fn(context, options);
      } else {
        return options.inverse(this);
      }
    });

    instance.registerHelper('log', function(message, options) {
      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
      instance.log(level, message);
    });

    instance.registerHelper('lookup', function(obj, field) {
      return obj && obj[field];
    });
  }

  var logger = {
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // State enum
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    level: 3,

    // can be overridden in the host environment
    log: function(level, message) {
      if (logger.level <= level) {
        var method = logger.methodMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, message);
        }
      }
    }
  };
  __exports__.logger = logger;
  var log = logger.log;
  __exports__.log = log;
  var createFrame = function(object) {
    var frame = Utils.extend({}, object);
    frame._parent = object;
    return frame;
  };
  __exports__.createFrame = createFrame;
  return __exports__;
})(__module2__, __module4__);

// handlebars/runtime.js
var __module5__ = (function(__dependency1__, __dependency2__, __dependency3__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;
  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
  var createFrame = __dependency3__.createFrame;

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
      }
    }
  }

  __exports__.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

  function template(templateSpec, env) {
    /* istanbul ignore next */
    if (!env) {
      throw new Exception("No environment passed to template");
    }
    if (!templateSpec || !templateSpec.main) {
      throw new Exception('Unknown template object: ' + typeof templateSpec);
    }

    // Note: Using env.VM references rather than local var references throughout this section to allow
    // for external users to override these as psuedo-supported APIs.
    env.VM.checkRevision(templateSpec.compiler);

    var invokePartialWrapper = function(partial, indent, name, context, hash, helpers, partials, data, depths) {
      if (hash) {
        context = Utils.extend({}, context, hash);
      }

      var result = env.VM.invokePartial.call(this, partial, name, context, helpers, partials, data, depths);

      if (result == null && env.compile) {
        var options = { helpers: helpers, partials: partials, data: data, depths: depths };
        partials[name] = env.compile(partial, { data: data !== undefined, compat: templateSpec.compat }, env);
        result = partials[name](context, options);
      }
      if (result != null) {
        if (indent) {
          var lines = result.split('\n');
          for (var i = 0, l = lines.length; i < l; i++) {
            if (!lines[i] && i + 1 === l) {
              break;
            }

            lines[i] = indent + lines[i];
          }
          result = lines.join('\n');
        }
        return result;
      } else {
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      }
    };

    // Just add water
    var container = {
      lookup: function(depths, name) {
        var len = depths.length;
        for (var i = 0; i < len; i++) {
          if (depths[i] && depths[i][name] != null) {
            return depths[i][name];
          }
        }
      },
      lambda: function(current, context) {
        return typeof current === 'function' ? current.call(context) : current;
      },

      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,

      fn: function(i) {
        return templateSpec[i];
      },

      programs: [],
      program: function(i, data, depths) {
        var programWrapper = this.programs[i],
            fn = this.fn(i);
        if (data || depths) {
          programWrapper = program(this, i, fn, data, depths);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = program(this, i, fn);
        }
        return programWrapper;
      },

      data: function(data, depth) {
        while (data && depth--) {
          data = data._parent;
        }
        return data;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common && (param !== common)) {
          ret = Utils.extend({}, common, param);
        }

        return ret;
      },

      noop: env.VM.noop,
      compilerInfo: templateSpec.compiler
    };

    var ret = function(context, options) {
      options = options || {};
      var data = options.data;

      ret._setup(options);
      if (!options.partial && templateSpec.useData) {
        data = initData(context, data);
      }
      var depths;
      if (templateSpec.useDepths) {
        depths = options.depths ? [context].concat(options.depths) : [context];
      }

      return templateSpec.main.call(container, context, container.helpers, container.partials, data, depths);
    };
    ret.isTop = true;

    ret._setup = function(options) {
      if (!options.partial) {
        container.helpers = container.merge(options.helpers, env.helpers);

        if (templateSpec.usePartial) {
          container.partials = container.merge(options.partials, env.partials);
        }
      } else {
        container.helpers = options.helpers;
        container.partials = options.partials;
      }
    };

    ret._child = function(i, data, depths) {
      if (templateSpec.useDepths && !depths) {
        throw new Exception('must pass parent depths');
      }

      return program(container, i, templateSpec[i], data, depths);
    };
    return ret;
  }

  __exports__.template = template;function program(container, i, fn, data, depths) {
    var prog = function(context, options) {
      options = options || {};

      return fn.call(container, context, container.helpers, container.partials, options.data || data, depths && [context].concat(depths));
    };
    prog.program = i;
    prog.depth = depths ? depths.length : 0;
    return prog;
  }

  __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data, depths) {
    var options = { partial: true, helpers: helpers, partials: partials, data: data, depths: depths };

    if(partial === undefined) {
      throw new Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    }
  }

  __exports__.invokePartial = invokePartial;function noop() { return ""; }

  __exports__.noop = noop;function initData(context, data) {
    if (!data || !('root' in data)) {
      data = data ? createFrame(data) : {};
      data.root = context;
    }
    return data;
  }
  return __exports__;
})(__module2__, __module4__, __module1__);

// handlebars.runtime.js
var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var base = __dependency1__;

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)
  var SafeString = __dependency2__;
  var Exception = __dependency3__;
  var Utils = __dependency4__;
  var runtime = __dependency5__;

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  var create = function() {
    var hb = new base.HandlebarsEnvironment();

    Utils.extend(hb, base);
    hb.SafeString = SafeString;
    hb.Exception = Exception;
    hb.Utils = Utils;
    hb.escapeExpression = Utils.escapeExpression;

    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };

    return hb;
  };

  var Handlebars = create();
  Handlebars.create = create;

  Handlebars['default'] = Handlebars;

  __exports__ = Handlebars;
  return __exports__;
})(__module1__, __module3__, __module4__, __module2__, __module5__);

  return __module0__;
}));

//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

//     Backbone.js 1.1.0

//     (c) 2010-2011 Jeremy Ashkenas, DocumentCloud Inc.
//     (c) 2011-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.0';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i];
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
        if (order) order.push(existing || model);
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }
      
      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch = typeof window !== 'undefined' && !!window.ActiveXObject && !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash and query.
  var pathStripper = /[?#].*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !atRoot) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + this.location.search + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && atRoot && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the fragment of the query and hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

}).call(this);

/*
Copyright (c) 2011-2013 @WalmartLabs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

;;
(function() {

/*global $serverSide, FruitLoops */

// Override uniqueId to ensure uniqueness across both the server and client
// rendering cycles
var _idCounter = window._idCounter || 0,
    _reqId = '';
window._resetIdCounter = function(reqId) {
  _idCounter = 0;
  _reqId = reqId || '';
};

_.uniqueId = function(prefix) {
  var id = _reqId + (++_idCounter);
  return prefix ? prefix + id : id;
};

if (window.$serverSide) {
  FruitLoops.onEmit(function() {
    $('body').append('<script>window._idCounter = ' + _idCounter + ';</script>');
  });
}

;;
/*global
    Thorax:true,
    $serverSide,
    assignTemplate, createError, createInheritVars, createRegistryWrapper, getValue,
    inheritVars, resetInheritVars,
    Deferrable, ServerMarshal
*/

// Provide default behavior for client-failover
if (typeof $serverSide === 'undefined') {
  window.$serverSide = false;
}

var isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
var isIE = isIE11 || (/msie [\w.]+/).exec(navigator.userAgent.toLowerCase());

//support zepto.forEach on jQuery
if (!$.fn.forEach) {
  $.fn.forEach = function(iterator, context) {
    $.fn.each.call(this, function(index) {
      iterator.call(context || this, this, index);
    });
  };
}

var setImmediate = window.setImmediate || function(callback) {
  setTimeout(callback, 0);
};

var viewNameAttributeName = 'data-view-name',
    viewCidAttributeName = 'data-view-cid',
    viewHelperAttributeName = 'data-view-helper',

    // Used to identify views that can be restored vs. rerendered on the client side.
    // Values are:
    //  - true - Can be restored
    //  - false - Must be rerendered
    //  - Omitted - Normal HTML element without associated view
    viewRestoreAttribute = 'data-view-restore';

//view instances
var viewsIndexedByCid = {};

if (!Handlebars.templates) {
  Handlebars.templates = {};
}

var Thorax = this.Thorax = {
  templatePathPrefix: '',
  //view classes
  Views: {},

  // Allows tagging of sections of code with a name for debugging purposes.
  // This or onException should be overriden to allow for reporting exceptions to analytics servers
  // or integration with libraries such as Costanza.
  bindSection: function(name, info, callback) {
    if (!callback) {
      callback = info;
      info = undefined;
    }
    if (Thorax.onException) {
      return function() {
        try {
          return callback.apply(this, arguments);
        } catch (err) {
          Thorax.onException(name, err, info);
        }
      };
    }
    else {
      return callback;
    }
  },
  runSection: function(name, info, callback) {
    return Thorax.bindSection(name, info, callback)();
  },

  onException: null,

  //deprecated, here to ensure existing projects aren't mucked with
  templates: Handlebars.templates
};

Thorax.View = Backbone.View.extend({
  constructor: function ThoraxView(options) {
    // store first argument for configureView()
    this._constructorArg = options;
    var response = Backbone.View.call(this, options);
    this._constructorArg = undefined;

    _.each(inheritVars, function(obj) {
      if (obj.ctor) {
        obj.ctor(this, response);
      }
    }, this);
    return response;
  },

  toString: function() {
    return '[object View.' + this.name + ']';
  },

  // View configuration, _configure was removed
  // in Backbone 1.1, define _configure as a noop
  // for Backwards compatibility with 1.0 and earlier
  _configure: function() {},
  _ensureElement: function () {
    configureView(this);

    if (!$serverSide && this.el) {
      var $el = $(_.result(this, 'el'));
      if ($el.length && ($el.attr('data-view-restore') === 'true')) {
        return this.restore($el);
      }
    }

    return Backbone.View.prototype._ensureElement.call(this);
  },


  setElement : function(element, delegate) {
    var $element = $(element),
        existingCid = $element.attr('data-view-cid');
    if (existingCid) {
      this._assignCid(existingCid);
    }
    var response = Backbone.View.prototype.setElement.call(this, $element, delegate);

    // Use a hash here to avoid multiple DOM operations
    var attr = {'data-view-cid': this.cid};
    if (this.name) {
      attr[viewNameAttributeName] = this.name;
    }
    this.$el.attr(attr);

    if (element.parentNode) {
      // This is a view that is attaching to an existing node and is unlikely to be added as
      // a children of any views. Assume that anyone doing this will manage the lifecycle
      // appropriately and destroy so we don't leak due to the `$.view` lookup that we are
      // registering here.
      this.retain();
    }

    return response;
  },
  _assignCid: function(cid) {
    if (this.cid && viewsIndexedByCid[this.cid]) {
      delete viewsIndexedByCid[this.cid];
      viewsIndexedByCid[cid] = this;
    }

    if (this.parent) {
      delete this.parent.children[this.cid];
      this.parent.children[cid] = this;
    }

    this.cid = cid;
  },

  _addChild: function(view) {
    if (this.children[view.cid]) {
      return view;
    }

    view.retain();
    this.children[view.cid] = view;
    // _helperOptions is used to detect if is HelperView
    // we do not want to remove child in this case as
    // we are adding the HelperView to the declaring view
    // (whatever view used the view helper in it's template)
    // but it's parent will not equal the declaring view
    // in the case of a nested helper, which will cause an error.
    // In either case it's not necessary to ever call
    // _removeChild on a HelperView as _addChild should only
    // be called when a HelperView is created.
    if (view.parent && view.parent !== this && !view._helperOptions) {
      view.parent._removeChild(view);
    }
    view.parent = this;
    this.trigger('child', view);
    return view;
  },

  _removeChild: function(view) {
    delete this.children[view.cid];
    view.parent = null;
    view.release();
    return view;
  },

  _destroy: function() {
    this.trigger('destroyed');
    delete viewsIndexedByCid[this.cid];

    this.stopListening();
    this.off();

    _.each(this.children, function(child) {
      child.parent = null;
      child.release();
    });

    if (this.el) {
      this.undelegateEvents();
      this.$el.remove();

      ServerMarshal.destroy(this.$el);
    }

    // Absolute worst case scenario, kill off some known fields to minimize the impact
    // of being retained.
    this.el = this.$el =
      this.parent = this.children =
      this.model = this.collection = this._collection =
      this._boundDataObjectsByCid = this._objectOptionsByCid =
      this._helperOptions = undefined;
  },

  restore: function(element, forceRerender) {
    // Extract from $ objects if passed
    element = element[0] || element;

    if (this._renderCount) {
      // Ensure that we are registered to the right cid (this could have been reset previously)
      var oldCid = this.$el.attr('data-view-cid');
      if (this.cid !== oldCid) {
        this._assignCid(oldCid);
      }

      $(element).replaceWith(this.$el);

      this.trigger('restore:fail', {
        type: 'previously-rendered',
        view: this,
        element: element
      });
      return;
    }

    this.setElement(element);

    var restoreable = this.$el.attr('data-view-restore') === 'true';
    this.$el.removeAttr('data-view-restore');

    if (!$serverSide && restoreable) {
      // Ensure that our associated template is wired up so that helpers who need to
      // resolve template children are able to do so.
      assignTemplate(this, 'template', {
        required: false
      });

      this._renderCount = 1;
      this.trigger('restore', forceRerender);

      if (forceRerender) {
        // We have an explicit rerender that we wanted to defer until the end of the restore process
        this.render();
      } else {
        // Check to see if we are in a partial restore situation
        var remainingViews = this.$('[data-view-restore]'),
            rerender = _.filter(remainingViews, function(el) {
              // Ignore views that are deeply nested or views that are under a layout element
              // when checking to see if we need to rerender.
              var parent = $(el).parent();
              return !parent.attr('data-layout-cid') && (parent.view({el: true, helper: true})[0] === element);
            });
        if (rerender.length) {
          this.trigger('restore:fail', {
            type: 'remaining',
            view: this,
            element: element,
            rerendered: rerender
          });

          this.render();
        }
      }

      this.trigger('after-restore', forceRerender);

      return true;
    } else {
      this.trigger('restore:fail', {
        type: 'not-restorable',
        view: this,
        element: element
      });

      this.render();
    }
  },

  render: function(output, callback) {
    var self = this;
    // NOP for destroyed views
    if (!self.el) {
      return self;
    }

    Thorax.runSection('thorax-render', {name: self.name}, function render() {
      if (self._rendering) {
        // Nested rendering of the same view instances can lead to some very nasty issues with
        // the root render process overwriting any updated data that may have been output in the child
        // execution. If in a situation where you need to rerender in response to an event that is
        // triggered sync in the rendering lifecycle it's recommended to defer the subsequent render
        // or refactor so that all preconditions are known prior to exec.
        throw createError('nested-render');
      }

      self._rendering = true;

      var deferrable = new Deferrable(callback),
          children = {},
          previous = [];

      _.each(self.children, function(child, key) {
        if (!child._helperOptions) {
          children[key] = child;
        } else {
          child._cull = true;
          previous.push(child);
        }
      });
      self.children = children;
      self._previousHelpers = previous;

      // Emulating triggerDeferrable here, without creating a separate deferrable context
      self.trigger('before:rendered', deferrable);
      deferrable.exec(function() {
        if (_.isUndefined(output) || (!_.isElement(output) && !Thorax.Util.is$(output) && !(output && output.el) && !_.isString(output) && !_.isFunction(output))) {
          // try one more time to assign the template, if we don't
          // yet have one we must raise
          assignTemplate(self, 'template', {
            required: true
          });
          output = self.renderTemplate(self.template);
        } else if (_.isFunction(output)) {
          output = self.renderTemplate(output);
        }
      });

      deferrable.exec(function() {
        // Destroy any helpers that may be lingering
        _.each(previous, function(child) {
          if (child._cull) {
            self._removeChild(child);
          }
        });
        self._previousHelpers = undefined;

        if ($serverSide) {
          if (self.$el.attr(viewRestoreAttribute) !== 'false') {
            self.$el.attr(viewRestoreAttribute, $serverSide);
          }
        } else {
          self.$el.removeAttr(viewRestoreAttribute);
        }
      });

      deferrable.chain(function(next) {
        //accept a view, string, Handlebars.SafeString or DOM element
        self.html((output && output.el) || (output && output.string) || output, next);
      });

      deferrable.exec(function() {
        ++self._renderCount;

        self.trigger('rendered');
        self._rendering = false;
      });
      deferrable.run();
    });

    return self;
  },

  context: function() {
    return this.model && this.model.attributes;
  },

  _getContext: function() {
    var context = Object.create ? Object.create(this) : _.clone(this);
    return _.extend(context, this.context.call ? this.context() : this.context);
  },

  // Private variables in handlebars / options.data in template helpers
  _getData: function(data) {
    return {
      view: this,
      root: data,
      cid: _.uniqueId('t'),
      yield: function() {
        // fn is seeded by template helper passing context to data
        return data.fn && data.fn(data);
      }
    };
  },

  renderTemplate: function(file, context, ignoreErrors) {
    var template;
    if (_.isFunction(file)) {
      template = file;
    } else {
      template = Thorax.Util.getTemplate(file, ignoreErrors);
    }
    if (!template || template === Handlebars.VM.noop) {
      return '';
    } else {
      context = context || this._getContext();

      return template(context, {
        helpers: this.helpers,
        data: this._getData(context)
      });
    }
  },

  ensureRendered: function(callback) {
    if (!this._renderCount) {
      this.render(undefined, callback);
    } else if (callback) {
      setImmediate(callback);
    }
  },
  shouldRender: function(flag) {
    // Render if flag is truthy or if we have already rendered and flag is undefined/null
    return flag || (flag == null && this._renderCount);
  },
  conditionalRender: function(flag) {
    if (this.shouldRender(flag)) {
      this.render();
    }
  },

  appendTo: function(el) {
    this.ensureRendered();
    $(el).append(this.el);
    this.trigger('ready', {target: this});
  },

  html: function(html, callback) {
    if (_.isUndefined(html)) {
      return this.$el.html();
    } else {
      this.trigger('before:append');
      var element = this._replaceHTML(html);
      this.triggerDeferrable('append', undefined, undefined, callback);
      return element;
    }
  },

  release: function() {
    --this._referenceCount;
    if (this._referenceCount <= 0) {
      this._destroy();
    }
  },

  retain: function(owner) {
    if (!viewsIndexedByCid[this.cid]) {
      // Register with the `$.view` helper.
      viewsIndexedByCid[this.cid] = this;
    }

    ++this._referenceCount;
    if (owner) {
      // Not using listenTo helper as we want to run once the owner is destroyed
      this.listenTo(owner, 'destroyed', owner.release);
    }
  },

  _replaceHTML: function(html) {
    // We want to pull our elements out of the tree if we are under jQuery
    // or IE as both have the tendancy to mangle the elements we want to reuse
    // on cleanup. This could leak event binds if users are performing custom binds
    // but this generally not recommended.
    if (this._renderCount && (isIE || $.fn.jquery)) {
      while (this.el.hasChildNodes()) {
        this.el.removeChild(this.el.childNodes[0]);
      }
    }

    this.$el.empty();
    return this.$el.append(html);
  },

  _anchorClick: function(event) {
    var target = $(event.currentTarget),
        href = target.attr('href');

    // Don't push if meta or shift key are clicked
    if (event.metaKey || event.shiftKey) {
      return true;
    }

    // Route anything that starts with # or / (excluding //domain urls)
    if (href && (href[0] === '#' || (href[0] === '/' && href[1] !== '/'))) {
      Backbone.history.navigate(href, {
        trigger: true
      });
      return false;
    }
    return true;
  }
});

Thorax.View.extend = function() {
  createInheritVars(this);

  var child = Backbone.View.extend.apply(this, arguments);
  child.__parent__ = this;

  resetInheritVars(child);

  return child;
};

createRegistryWrapper(Thorax.View, Thorax.Views);

function configureView(view) {
  var options = view._constructorArg;

  view._referenceCount = 0;

  view._objectOptionsByCid = {};
  view._boundDataObjectsByCid = {};

  // Setup object event tracking
  _.each(inheritVars, function(obj) {
    view[obj.name] = [];
  });

  view.children = {};
  view._renderCount = 0;

  //this.options is removed in Thorax.View, we merge passed
  //properties directly with the view and template context
  if (options) {
    _.extend(view, options);
  }

  // Setup helpers
  bindHelpers(view);

  _.each(inheritVars, function(obj) {
    if (obj.configure) {
      obj.configure(view);
    }
  });

  view.trigger('configure');
}

function bindHelpers(view) {
  if (view.helpers) {
    _.each(view.helpers, function(helper, name) {
      view.helpers[name] = function() {
        var args = _.toArray(arguments),
            options = _.last(args);
        options.context = this;
        return helper.apply(view, args);
      };
    });
  }
}

//$(selector).view() helper
$.fn.view = function(options) {
  options = _.defaults(options || {}, {
    helper: true
  });
  var selector = '[' + viewCidAttributeName + ']';
  if (!options.helper) {
    selector += ':not([' + viewHelperAttributeName + '])';
  }
  var el = $(this).closest(selector);
  if (el) {
    if (options.el) {
      return el;
    } else {
      var cid = el.attr(viewCidAttributeName),
          view = viewsIndexedByCid[cid];
      if (!view) {
        throw createError('fn-view-unregistered');
      }
      return view;
    }
  } else {
    return false;
  }
};

;;
/*global createRegistryWrapper:true, getEventCallback */

function createErrorMessage(code) {
  return 'Error "' + code + '". For more information visit http://thoraxjs.org/error-codes.html' + '#' + code;
}
function createError(code, info) {
  var error = new Error(createErrorMessage(code));
  error.name = code;
  error.info = info;
  return error;
}

function createRegistryWrapper(klass, hash) {
  var $super = klass.extend;
  klass.extend = function() {
    var child = $super.apply(this, arguments);
    if (child.prototype.name) {
      hash[child.prototype.name] = child;
    }
    return child;
  };
}

function registryGet(object, type, name, ignoreErrors) {
  var target = object[type],
      value;
  if (_.indexOf(name, '.') >= 0) {
    var bits = name.split(/\./);
    name = bits.pop();
    _.each(bits, function(key) {
      target = target[key];
    });
  }
  target && (value = target[name]);
  if (!value && !ignoreErrors) {
    throw new Error(type + ': ' + name + ' does not exist.');
  } else {
    return value;
  }
}


function assignView(view, attributeName, options) {
  var ViewClass;
  // if attribute is the name of view to fetch
  if (_.isString(view[attributeName])) {
    ViewClass = Thorax.Util.getViewClass(view[attributeName], true);
  // else try and fetch the view based on the name
  } else if (view.name && !_.isFunction(view[attributeName])) {
    ViewClass = Thorax.Util.getViewClass(view.name + (options.extension || ''), true);
  }
  // if we found something, assign it
  if (ViewClass && !_.isFunction(view[attributeName])) {
    view[attributeName] = ViewClass;
  }
  // if nothing was found and it's required, throw
  if (options.required && !_.isFunction(view[attributeName])) {
    throw new Error('View ' + (view.name || view.cid) + ' requires: ' + attributeName);
  }
}

function assignTemplate(view, attributeName, options) {
  var template;
  // if attribute is the name of template to fetch
  if (_.isString(view[attributeName])) {
    template = Thorax.Util.getTemplate(view[attributeName], true);
  // else try and fetch the template based on the name
  } else if (view.name && !_.isFunction(view[attributeName])) {
    template = Thorax.Util.getTemplate(view.name + (options.extension || ''), true);
  }
  // CollectionView and LayoutView have a defaultTemplate that may be used if none
  // was found, regular views must have a template if render() is called
  if (!template && attributeName === 'template' && view._defaultTemplate) {
    template = view._defaultTemplate;
  }
  // if we found something, assign it
  if (template && !_.isFunction(view[attributeName])) {
    view[attributeName] = template;
  }
  // if nothing was found and it's required, throw
  if (options.required && !_.isFunction(view[attributeName])) {
    var err = new Error('view-requires: ' + attributeName);
    err.info = {
      name: view.name || view.cid,
      parent: view.parent && (view.parent.name || view.parent.cid),
      helperName: view._helperName
    };
    throw err;
  }
}

// getValue is used instead of _.result because we
// need an extra scope parameter, and will minify
// better than _.result
function getValue(object, prop, scope) {
  prop = object && object[prop];
  return prop && prop.call ? prop.call(scope || object) : prop;
}

var inheritVars = {};
function createInheritVars(self) {
  // Ensure that we have our static event objects
  _.each(inheritVars, function(obj) {
    if (!self[obj.name]) {
      self[obj.name] = [];
    }
  });
}
function resetInheritVars(self) {
  // Ensure that we have our static event objects
  _.each(inheritVars, function(obj) {
    self[obj.name] = [];
  });
}
function walkInheritTree(source, fieldName, isStatic, callback) {
  /*jshint boss:true */
  var tree = [];
  if (_.has(source, fieldName)) {
    tree.push(source);
  }
  var iterate = source;
  if (isStatic) {
    while (iterate = iterate.__parent__) {
      if (_.has(iterate, fieldName)) {
        tree.push(iterate);
      }
    }
  } else {
    iterate = iterate.constructor;

    // Iterate over all prototypes exclusive of the backbone view prototype
    while (iterate && iterate.__super__) {
      if (iterate.prototype && _.has(iterate.prototype, fieldName)) {
        tree.push(iterate.prototype);
      }
      iterate = iterate.__super__ && iterate.__super__.constructor;
    }
  }

  var i = tree.length;
  while (i--) {
    _.each(getValue(tree[i], fieldName, source), callback);
  }
}

function objectEvents(target, eventName, callback, context) {
  if (_.isObject(callback)) {
    var spec = inheritVars[eventName];
    if (spec && spec.event) {
      if (target && target.listenTo && target[eventName] && target[eventName].cid) {
        addEvents(target, callback, context, eventName);
      } else {
        addEvents(target['_' + eventName + 'Events'], callback, context);
      }
      return true;
    }
  }
}
// internal listenTo function will error on destroyed
// race condition
function listenTo(object, target, eventName, callback, context) {
  // getEventCallback will resolve if it is a string or a method
  // and return a method
  var callbackMethod = getEventCallback(callback, object),
      destroyedCount = 0;

  function eventHandler() {
    if (object.el) {
      callbackMethod.apply(context, arguments);
    } else {
      // If our event handler is removed by destroy while another event is processing then we
      // we might see one latent event percolate through due to caching in the event loop. If we
      // see multiple events this is a concern and a sign that something was not cleaned properly.
      if (destroyedCount) {
        throw new Error('destroyed-event:' + object.name + ':' + eventName);
      }
      destroyedCount++;
    }
  }
  eventHandler._callback = callbackMethod._callback || callbackMethod;
  eventHandler._thoraxBind = true;
  object.listenTo(target, eventName, eventHandler);
}

function addEvents(target, source, context, listenToObject) {
  function addEvent(callback, eventName) {
    if (listenToObject) {
      listenTo(target, target[listenToObject], eventName, callback, context || target);
    } else {
      target.push([eventName, callback, context]);
    }
  }

  _.each(source, function(callback, eventName) {
    if (_.isArray(callback)) {
      _.each(callback, function(cb) {
        addEvent(cb, eventName);
      });
    } else {
      addEvent(callback, eventName);
    }
  });
}

// In helpers "tagName" or "tag" may be specified, as well
// as "class" or "className". Normalize to "tagName" and
// "className" to match the property names used by Backbone
// jQuery, etc. Special case for "className" in
// Thorax.Util.tag: will be rewritten as "class" in
// generated HTML.
function normalizeHTMLAttributeOptions(options) {
  if (options.tag) {
    options.tagName = options.tag;
    delete options.tag;
  }
  if (options['class']) {
    options.className = options['class'];
    delete options['class'];
  }
}

var voidTags;
function isVoidTag(tag) {
  if (!voidTags) {
    // http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
    var tags = 'area,base,br,col,embed,hr,img,input,keygen,link,menuitem,meta,param,source,track,wbr';

    voidTags = {};
    _.each(tags.split(','), function(tag) {
      voidTags[tag] = true;
    });
  }

  return voidTags[tag];
}

function filterAncestors(parent, callback) {
  return function() {
    if ($(this).parent().view({el: true, helper: true})[0] === parent.el) {
      return callback.call(this);
    }
  };
}

Thorax.Util = {
  getViewInstance: function(name, attributes) {
    var ViewClass = Thorax.Util.getViewClass(name, true);
    return ViewClass ? new ViewClass(attributes || {}) : name;
  },

  getViewClass: function(name, ignoreErrors) {
    if (_.isString(name)) {
      return registryGet(Thorax, 'Views', name, ignoreErrors);
    } else if (_.isFunction(name)) {
      return name;
    } else {
      return false;
    }
  },

  getTemplate: function(file, ignoreErrors) {
    if (_.isFunction(file)) {
      return file;
    }

    //append the template path prefix if it is missing
    var pathPrefix = Thorax.templatePathPrefix,
        template;
    if (pathPrefix && file.substr(0, pathPrefix.length) !== pathPrefix) {
      file = pathPrefix + file;
    }

    // Without extension
    file = file.replace(/\.handlebars$/, '');
    template = Handlebars.templates[file];
    if (!template) {
      // With extension
      file = file + '.handlebars';
      template = Handlebars.templates[file];
    }

    if (!template && !ignoreErrors) {
      throw new Error('templates: ' + file + ' does not exist.');
    }
    return template;
  },

  //'selector' is not present in $('<p></p>')
  //TODO: investigage a better detection method
  is$: function(obj) {
    return _.isObject(obj) && ('length' in obj);
  },
  expandToken: function(input, scope, encode) {
    /*jshint boss:true */

    if (input && input.indexOf && input.indexOf('{{') >= 0) {
      var re = /(?:\{?[^{]+)|(?:\{\{([^}]+)\}\})/g,
          match,
          ret = [];
      function deref(token, scope) {
        if (token.match(/^("|')/) && token.match(/("|')$/)) {
          return token.replace(/(^("|')|('|")$)/g, '');
        }
        var segments = token.split('.'),
            len = segments.length;
        for (var i = 0; scope && i < len; i++) {
          if (segments[i] !== 'this') {
            scope = scope[segments[i]];
          }
        }
        if (encode && _.isString(scope)) {
          return encodeURIComponent(scope);
        } else {
          return scope;
        }
      }
      while (match = re.exec(input)) {
        if (match[1]) {
          var params = match[1].split(/\s+/);
          if (params.length > 1) {
            var helper = params.shift();
            params = _.map(params, function(param) { return deref(param, scope); });
            if (Handlebars.helpers[helper]) {
              ret.push(Handlebars.helpers[helper].apply(scope, params));
            } else {
              // If the helper is not defined do nothing
              ret.push(match[0]);
            }
          } else {
            ret.push(deref(params[0], scope));
          }
        } else {
          ret.push(match[0]);
        }
      }
      input = ret.join('');
    }
    return input;
  },
  tag: function(attributes, content, scope) {
    var tag = attributes.tagName || 'div',
        noClose = isVoidTag(tag);

    if (noClose && content) {
      throw new Error(createErrorMessage('void-tag-content'));
    }

    var openingTag = '<' + tag + ' ' + _.map(attributes, function(value, key) {
      if (value == null || key === 'expand-tokens' || key === 'tagName') {
        return '';
      }
      var formattedValue = value;
      if (scope) {
        formattedValue = Thorax.Util.expandToken(value, scope);
      }
      return (key === 'className' ? 'class' : key) + '="' + Handlebars.Utils.escapeExpression(formattedValue) + '"';
    }).join(' ') + '>';

    if (noClose) {
      return openingTag;
    } else {
      return openingTag + (content == null ? '' : content) + '</' + tag + '>';
    }
  }
};

;;
/*global setImmediate */

// Provides a sync/async task runner that allows for operations to run in the
// best mode for their current environment. This is primarily intended for use
// in server side (async) vs. client side (sync) operations but code utilizing
// this should not make assumptions about one state or another.
//
// When `complete` is is a callback passed, all of the tasks will be executed
// asynchronously. If this parameter is omitted, then all tasks will be executed
// synchronously.
//
// All callbacks to `exec`/`chain` are guaranteed to execute in the order that they
// were received. All operations will be run when the `run` call is made, meaning
// the normal code interleaved with deferrable tasks will run before the deferrable
// task. Generally it's not recommended to mix and match the two code styles
// outside of initialization logic.
function Deferrable(complete) {
  var queue = [];

  function next() {
    if (complete) {
      setImmediate(function() {
        // Run the task
        var callback = queue.shift();
        if (callback) {
          callback();
        } else {
          // If this is the last task then complete the overall operation
          complete();
        }
      });
    } else {
      /*jshint boss:true */
      var callback;
      while (callback = queue.shift()) {
        callback();
      }
    }
  }

  return {
    // Registers a task that will always be complete after it returns.
    // Execution of subsequent tasks is automatic.
    exec: function(callback) {
      queue.push(function() {
        callback();

        if (complete) {
          next();
        }
      });
    },

    // Registers a task that may optionally defer to another deferrable stack.
    // When in async mode the task will recieve a callback to execute further
    // tasks after this one is completed.
    // 
    // Note that this is not intended for allowing a true async behavior and
    // should only be used to execute additional deferrable chains.
    chain: function(callback) {
      queue.push(function() {
        if (complete) {
          callback(next);
        } else {
          callback();
        }
      });
    },

    // Signal that all potential tasks have been registered and execution should
    // commence.
    run: function() {
      // Check if there were no asyncable calls made and complete immediately
      if (complete && !queue.length) {
        setImmediate(complete);
      } else {
        // Otherwise fire off the async processes
        next();
      }
    }
  };
}
Thorax.Util.Deferrable = Deferrable;

// Executes an event loop chain with an attached deferrable as the final argument.
// This method expects a final argument to be the callback for the deferrable or
// explicitly undefined. If in a situation where it's known ahead of time that
// there will be no callback value then `trigger` should be used directly.
Thorax.View.prototype.triggerDeferrable = function() {
  var args = [],
      len = arguments.length - 1,
      callback = arguments[len];
  for (var i = 0; i < len; i++) {
    args.push(arguments[i]);
  }

  var controller = new Deferrable(callback);
  args.push(controller);

  this.trigger.apply(this, args);
  controller.run();
};

;;
/*global $serverSide, createError, FruitLoops */
var _thoraxServerData = window._thoraxServerData || [];

/*
 * Allows for complex data to be communicated between the server and client
 * contexts for an arbitrary element.
 *
 * This is primarily intended for resolving template associated data on the client
 * but any data can be expressed via simple paths from a known root object, such
 * as a view instance or it's rendering context, may be marshaled.
 */
var ServerMarshal = Thorax.ServerMarshal = {
  store: function($el, name, data, dataIds, options) {
    if (!$serverSide) {
      return;
    }

    dataIds = dataIds || {};

    options = (options && options.data) || options || {};

    // Find or create the lookup table element
    var elementCacheId = $el._serverData || parseInt($el.attr('data-server-data'), 10);
    if (isNaN(elementCacheId)) {
      elementCacheId = _thoraxServerData.length;
      _thoraxServerData[elementCacheId] = {};

      $el._serverData = elementCacheId;
      $el.attr('data-server-data', elementCacheId);
    }

    var cache = _thoraxServerData[elementCacheId];
    cache[name] = undefined;

    // Store whatever data that we have
    if (_.isArray(data) && !_.isString(dataIds) && !data.toJSON) {
      if (data.length) {
        cache[name] = _.map(data, function(value, key) {
          return lookupValue(value, dataIds[key], options);
        });
      }
    } else if (_.isObject(data) && !_.isString(dataIds) && !data.toJSON) {
      var stored = {},
          valueSet;
      _.each(data, function(value, key) {
        stored[key] = lookupValue(value, dataIds[key], options);
        valueSet = true;
      });
      if (valueSet) {
        cache[name] = stored;
      }
    } else {
      // We were passed a singular value (attributeId is a simple id value)
      cache[name] = lookupValue(data, dataIds, options);
    }
  },
  load: function(el, name, parentView, context) {
    var elementCacheId = parseInt(el.getAttribute('data-server-data'), 0),
        cache = _thoraxServerData[elementCacheId];
    if (!cache) {
      return;
    }

    function resolve(value) {
      return (value && value.$lut != null) ? lookupField(parentView, context, value.$lut) : value;
    }

    cache = cache[name];
    if (_.isArray(cache)) {
      return _.map(cache, resolve);
    } else if (!_.isFunction(cache) && _.isObject(cache) && cache.$lut == null) {
      var ret = {};
      _.each(cache, function(value, key) {
        ret[key] = resolve(value);
      });
      return ret;
    } else {
      return resolve(cache);
    }
  },

  serialize: function() {
    if ($serverSide) {
      return JSON.stringify(_thoraxServerData);
    }
  },

  destroy: function($el) {
    /*jshint -W035 */
    var elementCacheId = parseInt($el.attr('data-server-data'), 10);
    if (!isNaN(elementCacheId)) {
      _thoraxServerData[elementCacheId] = undefined;

      // Reclaim whatever slots that we can. This ensures a smaller output structure while avoiding
      // conflicts that may occur when operating in a shared environment.
      var len = _thoraxServerData.length;
      while (len-- && !_thoraxServerData[len]) { /* NOP */ }
      if (len < _thoraxServerData.length - 1) {
        _thoraxServerData.length = len + 1;
      }
    }
  },

  _reset: function() {
    // Intended for tests only
    _thoraxServerData = [];
  }
};

// Register a callback to output our content from the server implementation.
if ($serverSide) {
  FruitLoops.onEmit(function() {
    $('body').append('<script>var _thoraxServerData = ' + ServerMarshal.serialize() + ';</script>');
  });
}

/*
 * Walks a given parent or context scope, attempting to resolve a dot
 * separated path.
 *
 * The parent context is given priority.
 */
function lookupField(parent, context, fieldName) {
  function lookup(context) {
    for (var i = 0; context && i < components.length; i++) {
      if (components[i] !== '' && components[i] !== '.' && components[i] !== 'this') {
        context = context[components[i]];
      }
    }
    return context;
  }

  var components = fieldName.split('.');
  return lookup(context) || lookup(parent);
}

/*
 * Determines the value to be saved in the lookup table to be restored on the client.
 */
function lookupValue(value, lutKey, data) {
  if (_.isString(value) || _.isNumber(value) || _.isNull(value) || _.isBoolean(value)) {
    return value;
  } else if (lutKey != null && lutKey !== true && !/^\.\.\//.test(lutKey)) {
    // This is an object what has a path associated with it so we should hopefully
    // be able to resolve it on the client.
    var contextPath = Handlebars.Utils.appendContextPath(data.contextPath, lutKey);
    if (lookupField(data.view, data.root, contextPath) === value) {
      return {
        $lut: contextPath
      };
    }
  }

  // This is some sort of unsuppored object type or a depthed reference (../foo)
  // which is not supported.
  throw createError('server-marshall-object');
}

;;
Thorax.Mixins = {};

_.extend(Thorax.View, {
  mixin: function(name) {
    Thorax.Mixins[name](this);
  },
  registerMixin: function(name, callback, methods) {
    Thorax.Mixins[name] = function(obj) {
      var isInstance = !!obj.cid;
      if (methods) {
        _.extend(isInstance ? obj : obj.prototype, methods);
      }
      if (isInstance) {
        callback.call(obj);
      } else {
        obj.on('configure', callback);
      }
    };
  }
});

Thorax.View.prototype.mixin = function(name) {
  Thorax.Mixins[name](this);
};

;;
/*global $serverSide, createInheritVars, inheritVars, listenTo, objectEvents, walkInheritTree */
// Save a copy of the _on method to call as a $super method
var _on = Thorax.View.prototype.on;

var eventSplitter = /^(nested\s+)?(\S+)(?:\s+(.+))?/;

var domEvents = {},
    eventParamsCache = {};

(function(events) {
  _.each(events, function(event) { domEvents[event] = true; });
})([
  'touchstart', 'touchmove', 'touchend', 'touchcancel',
  'mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
  'keydown', 'keyup', 'keypress',
  'contextmenu',
  'click', 'dblclick',
  'focusin', 'focusout', 'focus', 'blur',
  'submit', 'input', 'change',
  'dragstart', 'drag', 'dragenter', 'dragleave', 'dragover', 'drop', 'dragend',

  'singleTap', 'doubleTap', 'longTap',
  'swipe',
  'swipeUp', 'swipeDown',
  'swipeLeft', 'swipeRight'
]);

inheritVars.event = {
  name: '_events',

  configure: function(self) {
    walkInheritTree(self.constructor, '_events', true, function(event) {
      self.on.call(self, event[0], event[1]);
    });
    walkInheritTree(self, 'events', false, function(handler, eventName) {
      self.on(eventName, handler, self);
    });
  }
};

_.extend(Thorax.View, {
  on: function(eventName, callback) {
    createInheritVars(this);

    if (objectEvents(this, eventName, callback)) {
      return this;
    }

    //accept on({"rendered": handler})
    if (_.isObject(eventName)) {
      _.each(eventName, function(value, key) {
        this.on(key, value);
      }, this);
    } else {
      eventName = eventNameParams(eventName);

      //accept on({"rendered": [handler, handler]})
      if (_.isArray(callback)) {
        _.each(callback, function(cb) {
          this._events.push([eventName, cb]);
        }, this);
      //accept on("rendered", handler)
      } else {
        this._events.push([eventName, callback]);
      }
    }
    return this;
  }
});

_.extend(Thorax.View.prototype, {
  on: function(eventName, callback, context) {
    var self = this;

    if (objectEvents(self, eventName, callback, context)) {
      return self;
    }

    if (_.isObject(eventName) && !eventName.type && arguments.length < 3) {
      //accept on({"rendered": callback})
      _.each(eventName, function(value, key) {
        self.on(key, value, callback || self);    // callback is context in this form of the call
      });
    } else {
      //accept on("rendered", callback, context)
      //accept on("click a", callback, context)
      function handleEvent(callback) {
        var params = eventParamsForInstance(eventName, self, callback, context || self);

        if (params.event.type === 'DOM') {
          // Avoid overhead of handling DOM events on the server
          if ($serverSide) {
            return;
          }

          //will call _addEvent during delegateEvents()
          if (!self._eventsToDelegate) {
            self._eventsToDelegate = [];
          }
          self._eventsToDelegate.push(params);
        }

        if (params.event.type !== 'DOM' || self._eventsDelegated) {
          self._addEvent(params);
        }
      }
      if (_.isArray(callback)) {
        _.each(callback, handleEvent);
      } else {
        handleEvent(callback);
      }
    }
    return self;
  },

  delegateEvents: function(events) {
    this.undelegateEvents();
    if (events) {
      if (_.isFunction(events)) {
        events = events.call(this);
      }
      this._eventsToDelegate = [];
      this.on(events);
    }
    _.each(this._eventsToDelegate, this._addEvent, this);
    this._eventsDelegated = true;
  },
  //params may contain:
  //- name
  //- originalName
  //- selector
  //- type "view" || "DOM"
  //- handler
  _addEvent: function(params) {
    // If this is recursvie due to listenTo delegate below then pass through to super class
    if (params.handler._thoraxBind) {
      return _on.call(this, params.event.name, params.handler, params.context || this);
    }

    // Shortcircuit DOM events on the server
    if ($serverSide && params.event.type !== 'view') {
      return;
    }

    var boundHandler = bindEventHandler(this, params.event.type + '-event:', params);

    if (params.event.type === 'view') {
      // If we have our context set to an outside view then listen rather than directly bind so
      // we can cleanup properly.
      if (params.context && params.context !== this && params.context instanceof Thorax.View) {
        listenTo(params.context, this, params.event.name, boundHandler, params.context);
      } else {
        _on.call(this, params.event.name, boundHandler, params.context || this);
      }
    } else {
      // DOM Events
      if (!params.event.nested) {
        boundHandler = containHandlerToCurentView(boundHandler, this);
      }

      var name = params.event.name + '.delegateEvents' + this.cid;
      if (params.event.selector) {
        this.$el.on(name, params.event.selector, boundHandler);
      } else {
        this.$el.on(name, boundHandler);
      }
    }
  }
});

Thorax.View.prototype.bind = Thorax.View.prototype.on;

// When view is ready trigger ready event on all
// children that are present, then register an
// event that will trigger ready on new children
// when they are added
Thorax.View.on('ready', function(options) {
  if (!this._isReady) {
    this._isReady = true;
    function triggerReadyOnChild(child) {
      child._isReady || child.trigger('ready', options);
    }
    _.each(this.children, triggerReadyOnChild);
    this.on('child', triggerReadyOnChild);
  }
});

function containHandlerToCurentView(handler, current) {
  // Passing the current view rather than just a cid to allow for updates to the view's cid
  // caused by the restore process.
  return function(event) {
    var view = $(event.target).view({el: true, helper: false});
    if (view[0] === current.el) {
      event.originalContext = this;
      return handler(event);
    }
  };
}

function bindEventHandler(view, eventName, params) {
  eventName += params.event.originalName;

  var callback = params.handler,
      method = typeof callback == 'string' ? view[callback] : callback;
  if (!method) {
    throw new Error('Event "' + callback + '" does not exist ' + (view.name || view.cid) + ':' + eventName);
  }

  var context = params.context || view,
      ret = Thorax.bindSection(
        'thorax-event',
        {view: context.name || context.cid, eventName: eventName},
        function() { return method.apply(context, arguments); });

  // Backbone will delegate to _callback in off calls so we should still be able to support
  // calling off on specific handlers.
  ret._callback = method;
  ret._thoraxBind = true;
  return ret;
}

function eventNameParams(name) {
  if (name.type) {
    return name;
  }

  var params = eventParamsCache[name];
  if (params) {
    return params;
  }

  params = eventNameParams[name] = {
    type: 'view',
    name: name,
    originalName: name,

    nested: false,
    selector: undefined
  };

  var match = name.match(eventSplitter);
  if (match && domEvents[match[2]]) {
    params.type = 'DOM';
    params.name = match[2];
    params.nested = !!match[1];
    params.selector = match[3];
  }
  return params;
}
function eventParamsForInstance(eventName, view, handler, context) {
  return {
    event: eventNameParams(eventName),
    context: context,
    handler: typeof handler == 'string' ? view[handler] : handler
  };
}

;;
/*global
    ServerMarshal,
    $serverSide, createError, filterAncestors,
    normalizeHTMLAttributeOptions, viewHelperAttributeName
*/
var viewPlaceholderAttributeName = 'data-view-tmp',
    viewTemplateOverrides = {};

// Will be shared by HelperView and CollectionHelperView
var helperViewPrototype = {
  _ensureElement: function() {
    Thorax.View.prototype._ensureElement.call(this);
    this.$el.attr(viewHelperAttributeName, this._helperName);
  },
  _getContext: function() {
    return this.parent._getContext();
  }
};

Thorax.HelperView = Thorax.View.extend(helperViewPrototype);

// Ensure nested inline helpers will always have this.parent
// set to the view containing the template
function getParent(parent) {
  // The `view` helper is a special case as it embeds
  // a view instead of creating a new one
  while (parent._helperName && parent._helperName !== 'view') {
    parent = parent.parent;
  }
  return parent;
}

function expandHash(context, hash) {
  if (hash['expand-tokens']) {
    delete hash['expand-tokens'];
    _.each(hash, function(value, key) {
      hash[key] = Thorax.Util.expandToken(value, context);
    });
    return true;
  }
}

Handlebars.registerViewHelper = function(name, ViewClass, callback) {
  if (arguments.length === 2) {
    if (ViewClass.factory) {
      callback = ViewClass.callback;
    } else {
      callback = ViewClass;
      ViewClass = Thorax.HelperView;
    }
  }

  var viewOptionWhiteList = ViewClass.attributeWhiteList;

  Handlebars.registerHelper(name, function() {
    var args = [],
        options = arguments[arguments.length-1],
        declaringView = options.data.view;
    for (var i = 0, len = arguments.length-1; i < len; i++) {
      args.push(arguments[i]);
    }
 
    // Evaluate any nested parameters that we may have to content with
    var expandTokens = expandHash(this, options.hash);

    var viewOptions = createViewOptions(name, args, options, declaringView);
    setHelperTemplate(viewOptions, options, ViewClass);

    normalizeHTMLAttributeOptions(options.hash);
    var htmlAttributes = _.clone(options.hash);

    // Remap any view options per the whitelist and remove the source form the HTML
    _.each(viewOptionWhiteList, function(dest, source) {
      delete htmlAttributes[source];
      if (!_.isUndefined(options.hash[source])) {
        viewOptions[dest] = options.hash[source];
      }
    });
    if(htmlAttributes.tagName) {
      viewOptions.tagName = htmlAttributes.tagName;
    }

    viewOptions.attributes = function() {
      var attrs = (ViewClass.prototype && ViewClass.prototype.attributes) || {};
      if (_.isFunction(attrs)) {
        attrs = attrs.call(this);
      }
      _.extend(attrs, _.omit(htmlAttributes, ['tagName']));
      // backbone wants "class"
      if (attrs.className) {
        attrs['class'] = attrs.className;
        delete attrs.className;
      }
      return attrs;
    };


    // Check to see if we have an existing instance that we can reuse
    var instance = _.find(declaringView._previousHelpers, function(child) {
      return child._cull && compareHelperOptions(viewOptions, child);
    });

    // Create the instance if we don't already have one
    if (!instance) {
      instance = getHelperInstance(args, viewOptions, ViewClass);
      if (!instance) {
        return '';
      }

      instance.$el.attr('data-view-helper-restore', name);

      if ($serverSide && instance.$el.attr('data-view-restore') !== 'false') {
        saveServerState(instance, args, options);
      }

      helperInit(args, instance, callback, viewOptions);
    } else {
      if (!instance.el) {
        throw new Error('insert-destroyed');
      }

      declaringView.children[instance.cid] = instance;
    }

    // Remove any possible entry in previous helpers in case this is a cached value returned from
    // slightly different data that does not qualify for the previous helpers direct reuse.
    // (i.e. when using an array that is modified between renders)
    instance._cull = false;

    // Register the append helper if not already done
    if (!declaringView._pendingAppend) {
      declaringView._pendingAppend = true;
      declaringView.once('append', helperAppend);
    }

    htmlAttributes[viewPlaceholderAttributeName] = instance.cid;
    if (ViewClass.modifyHTMLAttributes) {
      ViewClass.modifyHTMLAttributes(htmlAttributes, instance);
    }
    return new Handlebars.SafeString(Thorax.Util.tag(htmlAttributes, '', expandTokens ? this : null));
  });

  var helper = Handlebars.helpers[name];

  function saveServerState(instance, args, options) {
    try {
      ServerMarshal.store(instance.$el, 'args', args, options.ids, options);
      ServerMarshal.store(instance.$el, 'attrs', options.hash, options.hashIds, options);
      if (options.fn && options.fn !== Handlebars.VM.noop) {
        if (options.fn.depth) {
          // Depthed block helpers are not supoprted.
          throw new Error();
        }
        ServerMarshal.store(instance.$el, 'fn', options.fn.program);
      }
      if (options.inverse && options.inverse !== Handlebars.VM.noop) {
        if (options.inverse.depth) {
          // Depthed block helpers are not supoprted.
          throw new Error();
        }
        ServerMarshal.store(instance.$el, 'inverse', options.inverse.program);
      }
    } catch (err) {
      instance.$el.attr('data-view-restore', 'false');

      instance.trigger('restore:fail', {
        type: 'serialize',
        view: instance,
        err: err
      });
    }
  }
  helper.restore = function(declaringView, el, forceRerender) {
    var context = declaringView.context(),
        args = ServerMarshal.load(el, 'args', declaringView, context) || [],
        attrs = ServerMarshal.load(el, 'attrs', declaringView, context) || {};

    var options = {
      hash: attrs,
      fn: ServerMarshal.load(el, 'fn'),
      inverse: ServerMarshal.load(el, 'inverse')
    };

    declaringView.template._setup({helpers: this.helpers});

    if (options.fn) {
      options.fn = declaringView.template._child(options.fn);
    }
    if (options.inverse) {
      options.inverse = declaringView.template._child(options.inverse);
    }

    var viewOptions = createViewOptions(name, args, options, declaringView);
    setHelperTemplate(viewOptions, options, ViewClass);

    if (viewOptionWhiteList) {
      _.each(viewOptionWhiteList, function(dest, source) {
        if (!_.isUndefined(attrs[source])) {
          viewOptions[dest] = attrs[source];
        }
      });
    }

    var instance = getHelperInstance(args, viewOptions, ViewClass);
    if (!instance) {
      // We can't do anything more, leave the element in
      return;
    }

    instance._assignCid(el.getAttribute('data-view-cid'));
    helperInit(args, instance, callback, viewOptions);

    instance.restore(el, forceRerender);

    return instance;
  };

  return helper;
};

Thorax.View.on('restore', function(forceRerender) {
  var parent = this,
      context;

  parent.$('[data-view-helper-restore][data-view-restore=true]').each(filterAncestors(parent, function() {
    var helper = Handlebars.helpers[this.getAttribute('data-view-helper-restore')],
        child = helper.restore(parent, this, forceRerender);
    if (child) {
      parent._addChild(child);
    }
  }));
});

function createViewOptions(name, args, options, declaringView) {
  return {
    inverse: options.inverse,
    options: options.hash,
    declaringView: declaringView,
    parent: getParent(declaringView),
    _helperName: name,
    _helperOptions: {
      options: cloneHelperOptions(options),
      args: _.clone(args)
    }
  };
}

function setHelperTemplate(viewOptions, options, ViewClass) {
  if (options.fn) {
    // Only assign if present, allow helper view class to
    // declare template
    viewOptions.template = options.fn;
  } else if (ViewClass && ViewClass.prototype && !ViewClass.prototype.template) {
    // ViewClass may also be an instance or object with factory method
    // so need to do this check
    viewOptions.template = Handlebars.VM.noop;
  }
}

function getHelperInstance(args, viewOptions, ViewClass) {
  var instance;

  if (ViewClass.factory) {
    instance = ViewClass.factory(args, viewOptions);
    if (!instance) {
      return;
    }

    instance._helperName = viewOptions._helperName;
    instance._helperOptions = viewOptions._helperOptions;
  } else {
    instance = new ViewClass(viewOptions);
  }

  if (!instance.el) {
    // ViewClass.factory may return existing objects which may have been destroyed
    throw createError('insert-destroyed-factory');
  }
  return instance;
}
function helperInit(args, instance, callback, viewOptions) {
  var declaringView = viewOptions.declaringView,
      name = viewOptions._helperName;

  args.push(instance);
  declaringView._addChild(instance);
  declaringView.trigger.apply(declaringView, ['helper', name].concat(args));

  callback && callback.apply(this, args);
}

function helperAppend(scope, callback, deferrable) {
  this._pendingAppend = undefined;

  var self = this;
  (scope || this.$el).find('[' + viewPlaceholderAttributeName + ']').forEach(function(el) {
    var $el = $(el),
        placeholderId = $el.attr(viewPlaceholderAttributeName),
        view = self.children[placeholderId];

    if (view) {
      deferrable.chain(function(next) {
        //see if the view helper declared an override for the view
        //if not, ensure the view has been rendered at least once
        if (viewTemplateOverrides[placeholderId]) {
          view.render(viewTemplateOverrides[placeholderId], next);
          delete viewTemplateOverrides[placeholderId];
        } else {
          view.ensureRendered(next);
        }
        $el.replaceWith(view.el);
      });
    }
    if (view && callback) {
      deferrable.exec(function() {
        callback(view.$el);
      });
    }
  });
}

/**
 * Clones the helper options, dropping items that are known to change
 * between rendering cycles as appropriate.
 */
function cloneHelperOptions(options) {
  var ret = _.pick(options, 'fn', 'inverse', 'hash', 'data');
  ret.data = _.omit(options.data, 'cid', 'view', 'yield', 'root', '_parent');

  // This is necessary to prevent failures when mixing restored and rendered data
  // as it forces the keys object to be complete.
  ret.fn = ret.fn || undefined;
  ret.inverse = ret.inverse || undefined;

  return ret;
}

/**
 * Checks for basic equality between two sets of parameters for a helper view.
 *
 * Checked fields include:
 *  - _helperName
 *  - All args
 *  - Hash
 *  - Data
 *  - Function and Invert (id based if possible)
 *
 * This method allows us to determine if the inputs to a given view are the same. If they
 * are then we make the assumption that the rendering will be the same (or the child view will
 * otherwise rerendering it by monitoring it's parameters as necessary) and reuse the view on
 * rerender of the parent view.
 */
function compareHelperOptions(a, b) {
  function compareValues(a, b) {
    return _.every(a, function(value, key) {
      return b[key] === value;
    });
  }

  if (a._helperName !== b._helperName) {
    return false;
  }

  a = a._helperOptions;
  b = b._helperOptions;

  // Implements a first level depth comparison
  return a.args.length === b.args.length
      && compareValues(a.args, b.args)
      && _.isEqual(_.keys(a.options).sort(), _.keys(b.options).sort())
      && _.every(a.options, function(value, key) {
          if (key === 'data' || key === 'hash') {
            return compareValues(a.options[key], b.options[key]);
          } else if (key === 'fn' || key === 'inverse') {
            if (b.options[key] === value) {
              return true;
            }

            var other = b.options[key] || {};
            return value && _.has(value, 'program') && !value.depth && other.program === value.program;
          }
          return b.options[key] === value;
        });
}

;;
/*global $serverSide, getValue, inheritVars, listenTo, walkInheritTree */

function dataObject(type, spec) {
  spec = inheritVars[type] = _.defaults({
    name: '_' + type + 'Events',
    event: true
  }, spec);

  // Add a callback in the view constructor
  spec.ctor = function(view) {
    if (view[type]) {
      // Need to null this.model/collection so setModel/Collection will
      // not treat it as the old model/collection and immediately return
      var object = view[type];
      view[type] = null;
      view[spec.set](object);
    }
  };

  function setObject(dataObject, options) {
    var old = this[type],
        $el = getValue(this, spec.$el);

    if (dataObject === old) {
      return this;
    }
    if (old) {
      this.unbindDataObject(old);
    }

    if (dataObject) {
      this[type] = dataObject;

      if (spec.loading) {
        spec.loading(this);
      }

      this.bindDataObject(type, dataObject, _.extend({}, this.options, options));
      if ($el) {
        var attr = {};
        if ($serverSide && spec.idAttrName) {
          attr[spec.idAttrName] = dataObject.id;
        }
        attr[spec.cidAttrName] = dataObject.cid;
        $el.attr(attr);
      }
      dataObject.trigger('set', dataObject, old);
    } else {
      this[type] = false;
      if (spec.change) {
        spec.change(this, false);
      }
      $el && $el.removeAttr(spec.cidAttrName);
    }
    this.trigger('change:data-object', type, dataObject, old);
    return this;
  }

  Thorax.View.prototype[spec.set] = setObject;
}

_.extend(Thorax.View.prototype, {
  getObjectOptions: function(dataObject) {
    return dataObject && this._objectOptionsByCid[dataObject.cid];
  },

  bindDataObject: function(type, dataObject, options) {
    if (this._boundDataObjectsByCid[dataObject.cid]) {
      return;
    }
    this._boundDataObjectsByCid[dataObject.cid] = dataObject;

    var options = this._modifyDataObjectOptions(dataObject, _.extend({}, inheritVars[type].defaultOptions, options));
    this._objectOptionsByCid[dataObject.cid] = options;

    bindEvents(this, type, dataObject, this.constructor);
    bindEvents(this, type, dataObject, this);

    var spec = inheritVars[type];
    spec.bindCallback && spec.bindCallback(this, dataObject, options);

    if (dataObject.shouldFetch && dataObject.shouldFetch(options)) {
      loadObject(dataObject, options);
    } else if (inheritVars[type].change) {
      // want to trigger built in rendering without triggering event on model
      inheritVars[type].change(this, dataObject, options);
    }
  },

  unbindDataObject: function (dataObject) {
    this.stopListening(dataObject);
    delete this._boundDataObjectsByCid[dataObject.cid];
    delete this._objectOptionsByCid[dataObject.cid];
  },

  _modifyDataObjectOptions: function(dataObject, options) {
    return options;
  }
});

function bindEvents(context, type, target, source) {
  walkInheritTree(source, '_' + type + 'Events', true, function(event) {
    listenTo(context, target, event[0], event[1], event[2] || context);
  });
}

function loadObject(dataObject, options) {
  if (dataObject.load) {
    dataObject.load(function() {
      options && options.success && options.success(dataObject);
    }, options);
  } else {
    dataObject.fetch(options);
  }
}

function getEventCallback(callback, context) {
  if (_.isFunction(callback)) {
    return callback;
  } else {
    return context[callback];
  }
}

;;
/*global createRegistryWrapper, dataObject, getValue, inheritVars */
var modelCidAttributeName = 'data-model-cid',
    modelIdAttributeName = 'data-model-id';

Thorax.Model = Backbone.Model.extend({
  isEmpty: function() {
    return !this.isPopulated();
  },
  isPopulated: function() {
    /*jshint -W089 */

    // We are populated if we have attributes set
    var attributes = _.clone(this.attributes),
        defaults = getValue(this, 'defaults') || {};
    for (var default_key in defaults) {
      if (attributes[default_key] != defaults[default_key]) {
        return true;
      }
      delete attributes[default_key];
    }
    var keys = _.keys(attributes);
    return keys.length > 1 || (keys.length === 1 && keys[0] !== this.idAttribute);
  },
  shouldFetch: function(options) {
    // url() will throw if model has no `urlRoot` and no `collection`
    // or has `collection` and `collection` has no `url`
    var url;
    try {
      url = getValue(this, 'url');
    } catch(e) {
      url = false;
    }
    return options.fetch && !!url && !this.isPopulated();
  }
});

Thorax.Models = {};
createRegistryWrapper(Thorax.Model, Thorax.Models);

dataObject('model', {
  set: 'setModel',
  defaultOptions: {
    render: undefined,    // Default to deferred rendering
    fetch: true,
    success: false,
    invalid: true
  },
  change: onModelChange,
  $el: '$el',
  idAttrName: modelIdAttributeName,
  cidAttrName: modelCidAttributeName
});

function onModelChange(view, model, options) {
  if (options && options.serializing) {
    return;
  }

  var modelOptions = view.getObjectOptions(model) || {};
  // !modelOptions will be true when setModel(false) is called
  view.conditionalRender(modelOptions.render);
}

Thorax.View.on({
  model: {
    invalid: function(model, errors) {
      if (this.getObjectOptions(model).invalid) {
        this.trigger('invalid', errors, model);
      }
    },
    error: function(model, resp /*, options */) {
      this.trigger('error', resp, model);
    },
    change: function(model, options) {
      // Indirect refernece to allow for overrides
      inheritVars.model.change(this, model, options);
    }
  }
});

$.fn.model = function(view) {
  var $this = $(this),
      modelElement = $this.closest('[' + modelCidAttributeName + ']'),
      modelCid = modelElement && modelElement.attr(modelCidAttributeName);
  if (modelCid) {
    var view = view || $this.view();
    if (view && view.model && view.model.cid === modelCid) {
      return view.model || false;
    }
    var collection = $this.collection(view);
    if (collection) {
      return collection.get(modelCid);
    }
  }
  return false;
};

;;
/*global
    $serverSide,
    assignView, assignTemplate, createRegistryWrapper, dataObject, filterAncestors, getValue,
    modelCidAttributeName, modelIdAttributeName, viewCidAttributeName,
    Deferrable
*/
var _fetch = Backbone.Collection.prototype.fetch,
    _set = Backbone.Collection.prototype.set,
    _replaceHTML = Thorax.View.prototype._replaceHTML,
    collectionCidAttributeName = 'data-collection-cid',
    collectionEmptyAttributeName = 'data-collection-empty',
    collectionElementAttributeName = 'data-collection-element',
    ELEMENT_NODE_TYPE = 1;

Thorax.Collection = Backbone.Collection.extend({
  model: Thorax.Model || Backbone.Model,
  initialize: function(models, options) {
    this.cid = _.uniqueId('collection');
    return Backbone.Collection.prototype.initialize.call(this, models, options);
  },
  isEmpty: function() {
    if (this.length > 0) {
      return false;
    } else {
      return this.length === 0 && this.isPopulated();
    }
  },
  isPopulated: function() {
    return this._fetched || this.length > 0 || (!this.length && !getValue(this, 'url'));
  },
  shouldFetch: function(options) {
    return options.fetch && !!getValue(this, 'url') && !this.isPopulated();
  },
  fetch: function(options) {
    options = options || {};
    var success = options.success;
    options.success = function(collection, response, options) {
      collection._fetched = true;
      success && success(collection, response, options);
    };
    return _fetch.call(this, options);
  },
  set: function(models, options) {
    this._fetched = !!models;
    return _set.call(this, models, options);
  }
});

_.extend(Thorax.View.prototype, {
  getCollectionViews: function(collection) {
    return _.filter(this.children, function(child) {
      if (!(child instanceof Thorax.CollectionView)) {
        return false;
      }

      return !collection || (child.collection === collection);
    });
  },
  updateFilter: function(collection) {
    _.invoke(this.getCollectionViews(collection), 'updateFilter');
  }
});

Thorax.Collections = {};
createRegistryWrapper(Thorax.Collection, Thorax.Collections);

dataObject('collection', {
  set: 'setCollection',
  bindCallback: onSetCollection,
  defaultOptions: {
    render: undefined,    // Default to deferred rendering
    fetch: true,
    success: false,
    invalid: true,
    change: true          // Wether or not to re-render on model:change
  },
  change: onCollectionReset,
  $el: 'getCollectionElement',
  cidAttrName: collectionCidAttributeName
});

Thorax.CollectionView = Thorax.View.extend({
  _defaultTemplate: Handlebars.VM.noop,
  _collectionSelector: '[' + collectionElementAttributeName + ']',

  // preserve collection element if it was not created with {{collection}} helper
  _replaceHTML: function(html) {
    if (this.collection && this.getObjectOptions(this.collection) && this._renderCount) {
      var element;
      var oldCollectionElement = this._collectionElement;
      element = _replaceHTML.call(this, html);

      this._lookupCollectionElement();

      if (!oldCollectionElement.attr('data-view-cid')) {
        this._collectionElement.replaceWith(oldCollectionElement);
      }
    } else {
      var ret = _replaceHTML.call(this, html);
      this._lookupCollectionElement();

      return ret;
    }
  },

  render: function(output, callback) {
    if (!this.shouldRender()) {
      var self = this;
      this.once('append', function(scope, _callback, deferrable) {
        deferrable.chain(function(next) {
          self.renderCollection(next);
        });
      });
    }

    return Thorax.View.prototype.render.call(this, output, callback);
  },

  restore: function(el, forceRerender) {
    this._forceRerender = forceRerender;
    Thorax.View.prototype.restore.call(this, el);
  },
  restoreCollection: function() {
    // This is called as an event so we don't force render our content when there are nested
    // child views.
    var self = this,
        children = this.$el.children(),
        toRemove = [],
        restored = 0;

    this._lookupCollectionElement();

    // Find any items annotated with server info and restore. Else rerender
    this.$('[' + modelIdAttributeName + ']').each(filterAncestors(self, function() {
      var id = this.getAttribute(modelIdAttributeName),
          model = self.collection.get(id);

      if (!model) {
        toRemove.push(this);
      } else {
        self.restoreItem(model, children.index(this), this, self._forceRerender);
        restored++;
      }
    }));

    var removeEmpty;
    this.$('[data-view-empty]').each(filterAncestors(self, function() {
      if (!self.collection.length) {
        self.restoreEmpty(this, self._forceRerender);
      } else {
        removeEmpty = true;
      }
    }));

    var needsRender = (restored !== this.collection.length) || toRemove.length || removeEmpty;
    if (needsRender && this.collection.isPopulated()) {
      // Kill off any now invalid nodes
      _.each(toRemove, function(el) {
        el.parentNode.removeChild(el);

        self.trigger('restore:fail', {
          type: 'collection-remove',
          element: el
        });
      });

      if (removeEmpty || !this.collection.length) {
        // Complete mismatch on expectations for empty state, etc. Rerender the entierty of the
        // content to be safe.
        this.renderCollection();

        self.trigger('restore:fail', {
          type: removeEmpty ? 'collection-empty-found' : 'collection-empty-missing'
        });
      } else {
        // Render anything that we might have locally but was missed
        var $el = this._collectionElement;
        this.collection.each(function(model) {
          if (!$el.find('[' + modelCidAttributeName + '="' + model.cid + '"]').length) {
            self.appendItem(model);

            self.trigger('restore:fail', {
              type: 'collection-missing',
              model: model
            });
          }
        });
      }
    } else if (needsRender) {
      this._pendingRestore = true;
      return;
    }

    this.trigger('restore:collection', this, this.el);
  },

  //appendItem(model [,index])
  //appendItem(html_string, index)
  //appendItem(view, index)
  appendItem: function(model, index, options, append, callback) {
    //empty item
    if (!model) {
      return;
    }
    var itemView,
        $el = this._collectionElement,
        collection = this.collection,

        filter = !options || options.filter == null || options.filter;

    //if index argument is a view
    if (index && index.el) {
      index = $el.children().indexOf(index.el) + 1;
    }

    //if argument is a view, or html string
    if (model.el || _.isString(model)) {
      itemView = model;
      model = false;
    } else {
      index = index != null ? index : (collection.indexOf(model) || 0);

      // Using call here to avoid v8 prototype inline optimization bug that helper views
      // expose under Android 4.3 (at minimum)
      // https://twitter.com/kpdecker/status/422149634929082370
      itemView = this.renderItem.call(this, model, index);
    }

    if (itemView) {
      if (itemView.cid) {
        this._addChild(itemView);
        itemView.ensureRendered();
      }

      //if the renderer's output wasn't contained in a tag, wrap it in a div
      //plain text, or a mixture of top level text nodes and element nodes
      //will get wrapped
      if (_.isString(itemView) && !/^\s*</m.test(itemView)) {
        itemView = '<div>' + itemView + '</div>';
      }
      var itemElement = itemView.$el || $($.trim(itemView)).filter(function() {
        // Only output nodes. DOM || Fruit Loops
        return this.nodeType === ELEMENT_NODE_TYPE || this.type === 'tag';
      });

      if (model) {
        itemElement.attr({
          'data-model-id': model.id,
          'data-model-cid': model.cid
        });
      }

      if (append) {
        $el.append(itemElement);
      } else {
        var previousModel = index > 0 ? collection.at(index - 1) : false;
        if (!previousModel) {
          $el.prepend(itemElement);
        } else {
          //use last() as appendItem can accept multiple nodes from a template
          var last = $el.children('[' + modelCidAttributeName + '="' + previousModel.cid + '"]').last();
          last.after(itemElement);
        }
      }

      this.triggerDeferrable('append', null, function($el) {
        $el.attr({
          'data-model-cid': model.cid,
          'data-model-id': model.id,
        });
      },
      callback);

      if (!options || !options.silent) {
        this.trigger('rendered:item', this, collection, model, itemElement, index);
      }
      if (filter) {
        applyItemVisiblityFilter(this, model);
      }
    }
    return itemView;
  },

  // updateItem only useful if there is no item view, otherwise
  // itemView.render() provides the same functionality
  updateItem: function(model) {
    var $el = this._collectionElement,
        viewEl = $el.find('[' + modelCidAttributeName + '="' + model.cid + '"]');

    // NOP For views
    if (viewEl.attr(viewCidAttributeName)) {
      return;
    }

    this.removeItem(viewEl);
    this.appendItem(model);
  },

  removeItem: function(model) {
    var self = this,
        $viewEl = model;

    if (model.cid) {
      var $el = this._collectionElement;
      $viewEl = $el.find('[' + modelCidAttributeName + '="' + model.cid + '"]');
    }
    if (!$viewEl.length) {
      return false;
    }

    function cleanCid($viewEl) {
      var cid = $viewEl.attr(viewCidAttributeName),
          child = self.children[cid];
      if (child) {
        self._removeChild(child);
      }
    }

    $viewEl.find('[' + viewCidAttributeName + ']').each(function(i, el) {
      cleanCid($(el));
    });
    cleanCid($viewEl);

    $viewEl.detach();

    return true;
  },

  renderCollection: function(callback) {
    var deferrable = new Deferrable(callback),
        self = this;

    if (self.collection) {
      if (self.collection.isEmpty()) {
        deferrable.exec(function() {
          handleChangeFromNotEmptyToEmpty(self);
        });
      } else if (self._pendingRestore) {
        // If we had to delay the initial restore due to the local data set being loaded, then
        // we want to resume that operation where it left off.
        self._pendingRestore = false;
        self.restoreCollection(self._forceRerender);
      } else {
        deferrable.exec(function() {
          handleChangeFromEmptyToNotEmpty(self);
        });

        _.each(self.collection.models, function(item, i) {
          deferrable.chain(function(next) {
            self.appendItem(item, i, undefined, true, next);
          });
        });
      }
      deferrable.exec(function() {
        self.trigger('rendered:collection', self, self.collection);
      });
    } else {
      deferrable.exec(function() {
        handleChangeFromNotEmptyToEmpty(self);
      });
    }

    deferrable.run();
  },
  emptyClass: 'empty',
  renderEmpty: function() {
    if (!this.emptyView) {
      assignView(this, 'emptyView', {
        extension: '-empty'
      });
    }
    if (!this.emptyTemplate && !this.emptyView) {
      assignTemplate(this, 'emptyTemplate', {
        extension: '-empty',
        required: false
      });
    }
    if (this.emptyView) {
      var viewOptions = {};
      if (this.emptyTemplate) {
        viewOptions.template = this.emptyTemplate;
      }
      return Thorax.Util.getViewInstance(this.emptyView, viewOptions);
    } else {
      return this.emptyTemplate && this.renderTemplate(this.emptyTemplate);
    }
  },
  restoreEmpty: function(el, forceRerender) {
    var child = this.renderEmpty();

    child.restore(el, forceRerender);
    this._addChild(child);

    this.trigger('restore:empty', this, el);

    return child;
  },

  renderItem: function(model, i) {
    if (!this.itemView) {
      assignView(this, 'itemView', {
        extension: '-item',
        required: false
      });
    }
    if (!this.itemTemplate && !this.itemView) {
      assignTemplate(this, 'itemTemplate', {
        extension: '-item',
        // only require an itemTemplate if an itemView
        // is not present
        required: !this.itemView
      });
    }
    if (this.itemView) {
      var viewOptions = {
        model: model
      };
      if (this.itemTemplate) {
        viewOptions.template = this.itemTemplate;
      }
      return Thorax.Util.getViewInstance(this.itemView, viewOptions);
    } else {
      // Using call here to avoid v8 prototype inline optimization bug that helper views
      // expose under Android 4.3 (at minimum)
      // https://twitter.com/kpdecker/status/422149634929082370
      return this.renderTemplate(this.itemTemplate, this.itemContext.call(this, model, i));
    }
  },
  restoreItem: function(model, i, el, forceRerender) {
    // Associate the element with the proper model.
    el.setAttribute(modelCidAttributeName, model.cid);

    // If we are dealing with something other than a template then reinstantiate the view.
    if (this.itemView || this.renderItem !== Thorax.CollectionView.prototype.renderItem) {
      var child = this.renderItem(model, i);

      // If we are passed a string assume that the upstream implementation has a consistent
      // rendering.
      if (!_.isString(child)) {
        child.restore(el, forceRerender);
        this._addChild(child);
      }
    }

    this.trigger('restore:item', this, el);
  },
  itemContext: function(model /*, i */) {
    return model.attributes;
  },
  appendEmpty: function() {
    var $el = this._collectionElement;
    $el.empty();

    // Using call here to avoid v8 prototype inline optimization bug that helper views
    // expose under Android 4.3 (at minimum)
    // https://twitter.com/kpdecker/status/422149634929082370
    var emptyContent = this.renderEmpty.call(this);
    if (emptyContent && emptyContent.$el) {
      emptyContent.$el.attr('data-view-empty', 'true');
    }
    emptyContent && this.appendItem(emptyContent, 0, {
      silent: true,
      filter: false
    });
    this.trigger('rendered:empty', this, this.collection);
  },
  getCollectionElement: function() {
    return this._collectionElement;
  },
  _lookupCollectionElement: function() {
    var $collectionElement = this.$(this._collectionSelector).filter(filterAncestors(this, function() { return true; }));
    this._collectionElement = $collectionElement.length ? $collectionElement : this.$el;
  },

  updateFilter: function() {
    var view = this;
    if (view.itemFilter) {
      _.each(view.collection.models, function(model) {
        applyItemVisiblityFilter(view, model);
      });
    }
  }
});

Thorax.CollectionView.on({
  restore: 'restoreCollection',

  collection: {
    'reset': function(collection) {
      onCollectionReset(this, collection);
    },
    'sort': function(collection) {
      onCollectionReset(this, collection);
    },
    change: function(model) {
      var options = this.getObjectOptions(this.collection);
      if (options && options.change) {
        this.updateItem(model);
      }
      applyItemVisiblityFilter(this, model);
    },
    add: function(model) {
      var $el = this._collectionElement;
      if ($el.length) {
        if (this.collection.length === 1) {
          handleChangeFromEmptyToNotEmpty(this);
        }

        var index = this.collection.indexOf(model);
        this.appendItem(model, index);
      }
    },
    remove: function(model) {
      var $el = this._collectionElement;
      this.removeItem(model);

      if (this.collection.length === 0 && $el.length) {
        handleChangeFromNotEmptyToEmpty(this);
      }
    }
  }
});

Thorax.View.on({
  collection: {
    invalid: function(collection, message) {
      if (this.getObjectOptions(collection).invalid) {
        this.trigger('invalid', message, collection);
      }
    },
    error: function(collection, resp /*, options */) {
      this.trigger('error', resp, collection);
    }
  }
});

function onCollectionReset(view, collection) {
  // Undefined to force conditional render
  var options = view.getObjectOptions(collection) || undefined;
  if (view.shouldRender(options && options.render)) {
    view.renderCollection && view.renderCollection();
  }
}

// Even if the view is not a CollectionView
// ensureRendered() to provide similar behavior
// to a model
function onSetCollection(view, collection) {
  // Undefined to force conditional render
  var options = view.getObjectOptions(collection) || undefined;
  if (view.shouldRender(options && options.render)) {
    // Ensure that something is there if we are going to render the collection.
    view.ensureRendered();
  }
}

function applyItemVisiblityFilter(view, model) {
  var $el = view._collectionElement;
  view.itemFilter && $el.find('[' + modelCidAttributeName + '="' + model.cid + '"]')[itemShouldBeVisible(view, model) ? 'show' : 'hide']();
}

function itemShouldBeVisible(view, model) {
  // Using call here to avoid v8 prototype inline optimization bug that helper views
  // expose under Android 4.3 (at minimum)
  // https://twitter.com/kpdecker/status/422149634929082370
  return view.itemFilter.call(view, model, view.collection.indexOf(model));
}

function handleChangeFromEmptyToNotEmpty(view) {
  var $el = view._collectionElement;
  view.emptyClass && $el.removeClass(view.emptyClass);
  $el.removeAttr(collectionEmptyAttributeName);
  $el.empty();
}

function handleChangeFromNotEmptyToEmpty(view) {
  var $el = view._collectionElement;
  view.emptyClass && $el.addClass(view.emptyClass);
  $el.attr(collectionEmptyAttributeName, true);
  view.appendEmpty();
}

//$(selector).collection() helper
$.fn.collection = function(view) {
  if (view && view.collection) {
    return view.collection;
  }
  var $this = $(this),
      collectionElement = $this.closest('[' + collectionCidAttributeName + ']'),
      collectionCid = collectionElement && collectionElement.attr(collectionCidAttributeName);
  if (collectionCid) {
    view = $this.view();
    if (view) {
      return view.collection;
    }
  }
  return false;
};

;;
/*global
    $serverSide, FruitLoops,
    createErrorMessage, getLayoutViewsTargetElement,
    normalizeHTMLAttributeOptions, setImmediate, viewNameAttributeName
*/
var layoutCidAttributeName = 'data-layout-cid';

Thorax.LayoutView = Thorax.View.extend({
  _defaultTemplate: Handlebars.VM.noop,
  render: function(output) {
    var response = Thorax.View.prototype.render.call(this, output);
    if (this.template === Handlebars.VM.noop) {
      // if there is no template setView will append to this.$el
      ensureLayoutCid(this);
    } else {
      // if a template was specified is must declare a layout-element
      ensureLayoutViewsTargetElement(this);
    }
    return response;
  },
  restore: function(element, forceRerender) {
    // Layout views don't have a traditional forced rerender cycle so we want to manage this
    // ourselves.
    this._forceRerender = forceRerender;
    Thorax.View.prototype.restore.call(this, element);
  },
  setView: function(view, options) {
    options = _.extend({
      scroll: true
    }, options);

    if (_.isString(view)) {
      view = new (Thorax.Util.registryGet(Thorax, 'Views', view, false))();
    }

    if (!$serverSide && !this.hasBeenSet) {
      var existing = this.$('[' + viewNameAttributeName + '="' + view.name + '"]')[0];
      if (existing) {
        view.restore(existing, this._forceRerender);
      } else {
        $(this._layoutViewEl).empty();
      }
    }
    this.ensureRendered();

    var oldView = this._view,
        self = this,
        serverRender = view && $serverSide && (options.serverRender || view.serverRender),
        attemptAsync = options.async !== false ? options.async || serverRender : false;
    if (view === oldView) {
      return false;
    }

    if (attemptAsync && view && !view._renderCount) {
      setImmediate(function() {
        view.ensureRendered(function() {
          self.setView(view, options);
        });
      });
      return;
    }

    this.trigger('change:view:start', view, oldView, options);

    function remove() {
      if (oldView) {
        oldView.$el && oldView.$el.detach();
        triggerLifecycleEvent(oldView, 'deactivated', options);
        self._removeChild(oldView);
      }
    }

    function append() {
      if (!view) {
        self._view = undefined;
      } else if ($serverSide && !serverRender) {
        // Emit only data for non-server rendered views
        // But we do want to put ourselves into the queue for cleanup on future exec
        self._view = view;
        self._addChild(view);

        FruitLoops.emit();
      } else {
        view.ensureRendered();
        options.activating = view;

        triggerLifecycleEvent(self, 'activated', options);
        view.trigger('activated', options);
        self._view = view;
        var targetElement = self._layoutViewEl;
        self._view.appendTo(targetElement);
        self._addChild(view);
      }
    }

    function complete() {
      self.hasBeenSet = true;
      self.trigger('change:view:end', view, oldView, options);
    }

    if (!options.transition) {
      remove();
      append();
      complete();
    } else {
      options.transition(view, oldView, append, remove, complete);
    }

    return view;
  },

  getView: function() {
    return this._view;
  }
});

Thorax.LayoutView.on('after-restore', function() {
  ensureLayoutViewsTargetElement(this);
});

Handlebars.registerHelper('layout-element', function(options) {
  var view = options.data.view;
  // duck type check for LayoutView
  if (!view.getView) {
    throw new Error(createErrorMessage('layout-element-helper'));
  }
  options.hash[layoutCidAttributeName] = view.cid;
  normalizeHTMLAttributeOptions(options.hash);
  return new Handlebars.SafeString(Thorax.Util.tag.call(this, options.hash, '', this));
});

function triggerLifecycleEvent(view, eventName, options) {
  options = options || {};
  options.target = view;
  view.trigger(eventName, options);
  _.each(view.children, function(child) {
    child.trigger(eventName, options);
  });
}

function ensureLayoutCid(view) {
  //set the layoutCidAttributeName on this.$el if there was no template
  view.$el.attr(layoutCidAttributeName, view.cid);
  view._layoutViewEl = view.el;
}

function ensureLayoutViewsTargetElement(view) {
  var el = view.$('[' + layoutCidAttributeName + '="' + view.cid + '"]')[0];
  if (!el && view.$el.attr(layoutCidAttributeName)) {
    el = view.el;
  }
  if (!el) {
    throw new Error('No layout element found in ' + (view.name || view.cid));
  }
  view._layoutViewEl = el;
}

;;
/* global
    $serverSide,
    collectionElementAttributeName, createErrorMessage, getParent,
    helperViewPrototype, normalizeHTMLAttributeOptions,
    viewRestoreAttribute
*/

Thorax.CollectionHelperView = Thorax.CollectionView.extend({
  // Forward render events to the parent
  events: {
    'rendered:collection': forwardRenderEvent('rendered:collection'),
    'rendered:item': function(view, collection, model, itemEl, index) {
      this.parent.trigger('rendered:item', view, collection, model, itemEl, index);
    },
    'rendered:empty': forwardRenderEvent('rendered:empty'),
    'restore:collection': forwardRenderEvent('restore:collection'),
    'restore:item': forwardRenderEvent('restore:item'),
    'restore:empty': forwardRenderEvent('restore:empty')
  },

  // Thorax.CollectionView allows a collectionSelector
  // to be specified, disallow in a collection helper
  // as it will cause problems when neseted
  getCollectionElement: function() {
    return this.$el;
  },

  constructor: function(options) {
    var restorable = true;

    // need to fetch templates if template name was passed
    if (options.options['item-template']) {
      options.itemTemplate = Thorax.Util.getTemplate(options.options['item-template']);
    }
    if (options.options['empty-template']) {
      options.emptyTemplate = Thorax.Util.getTemplate(options.options['empty-template']);
    }

    // Handlebars.VM.noop is passed in the handlebars options object as
    // a default for fn and inverse, if a block was present. Need to
    // check to ensure we don't pick the empty / null block up.
    if (!options.itemTemplate && options.template && options.template !== Handlebars.VM.noop) {
      options.itemTemplate = options.template;
      options.template = Handlebars.VM.noop;

      // We can not restore if the item has a depthed reference, ../foo, so we need to
      // force a rerender on the client-side
      if (options.itemTemplate.depth) {
        restorable = false;
      }
    }
    if (!options.emptyTemplate && options.inverse && options.inverse !== Handlebars.VM.noop) {
      options.emptyTemplate = options.inverse;
      options.inverse = Handlebars.VM.noop;

      if (options.emptyTemplate.depth) {
        restorable = false;
      }
    }

    var shouldBindItemContext = _.isFunction(options.itemContext),
        shouldBindItemFilter = _.isFunction(options.itemFilter);

    var response = Thorax.HelperView.call(this, options);
    
    if (shouldBindItemContext) {
      this.itemContext = _.bind(this.itemContext, this.parent);
    } else if (_.isString(this.itemContext)) {
      this.itemContext = _.bind(this.parent[this.itemContext], this.parent);
    }

    if (shouldBindItemFilter) {
      this.itemFilter = _.bind(this.itemFilter, this.parent);
    } else if (_.isString(this.itemFilter)) {
      this.itemFilter = _.bind(this.parent[this.itemFilter], this.parent);
    }

    if (this.parent.name) {
      if (!this.emptyView && !this.parent.renderEmpty) {
        this.emptyView = Thorax.Util.getViewClass(this.parent.name + '-empty', true);
      }
      if (!this.emptyTemplate && !this.parent.renderEmpty) {
        this.emptyTemplate = Thorax.Util.getTemplate(this.parent.name + '-empty', true);
      }
      if (!this.itemView && !this.parent.renderItem) {
        this.itemView = Thorax.Util.getViewClass(this.parent.name + '-item', true);
      }
      if (!this.itemTemplate && !this.parent.renderItem) {
        // item template must be present if an itemView is not
        this.itemTemplate = Thorax.Util.getTemplate(this.parent.name + '-item', !!this.itemView);
      }
    }

    if ($serverSide && !restorable) {
      this.$el.attr(viewRestoreAttribute, 'false');

      this.trigger('restore:fail', {
        type: 'serialize',
        view: this,
        err: 'collection-depthed-query'
      });
    }

    return response;
  },
  setAsPrimaryCollectionHelper: function() {
    var self = this,
        parent = self.parent;
    _.each(forwardableProperties, function(propertyName) {
      forwardMissingProperty(self, propertyName);
    });

    _.each(['itemFilter', 'itemContext', 'renderItem', 'renderEmpty'], function(propertyName) {
      if (parent[propertyName]) {
        self[propertyName] = function(thing1, thing2) {
          return parent[propertyName](thing1, thing2);
        };
      }
    });
  }
});

_.extend(Thorax.CollectionHelperView.prototype, helperViewPrototype);


Thorax.CollectionHelperView.attributeWhiteList = {
  'item-context': 'itemContext',
  'item-filter': 'itemFilter',
  'item-template': 'itemTemplate',
  'empty-template': 'emptyTemplate',
  'item-view': 'itemView',
  'empty-view': 'emptyView',
  'empty-class': 'emptyClass'
};

function forwardRenderEvent(eventName) {
  return function(thing1, thing2) {
    this.parent.trigger(eventName, thing1, thing2);
  };
}

var forwardableProperties = [
  'itemTemplate',
  'itemView',
  'emptyTemplate',
  'emptyView'
];

function forwardMissingProperty(view, propertyName) {
  var parent = getParent(view);
  if (!view[propertyName]) {
    var prop = parent[propertyName];
    if (prop){
      view[propertyName] = prop;
    }
  }
}

Handlebars.registerViewHelper('collection', Thorax.CollectionHelperView, function(collection, view) {
  if (arguments.length === 1) {
    view = collection;
    collection = view.parent.collection;

    if (collection) {
      view.setAsPrimaryCollectionHelper();
    }
    view.$el.attr(collectionElementAttributeName, 'true');
    // propagate future changes to the parent's collection object
    // to the helper view
    view.listenTo(view.parent, 'change:data-object', function(type, dataObject) {
      if (type === 'collection') {
        view.setAsPrimaryCollectionHelper();
        view.setCollection(dataObject);
      }
    });
  }
  if (collection) {
    view.setCollection(collection);
  }
});

Handlebars.registerHelper('collection-element', function(options) {
  if (!options.data.view.renderCollection) {
    throw new Error(createErrorMessage('collection-element-helper'));
  }
  var hash = options.hash;
  normalizeHTMLAttributeOptions(hash);
  hash.tagName = hash.tagName || 'div';
  hash[collectionElementAttributeName] = true;
  return new Handlebars.SafeString(Thorax.Util.tag.call(this, hash, '', this));
});

;;
Handlebars.registerHelper('empty', function(dataObject, options) {
  if (arguments.length === 1) {
    options = dataObject;
  }
  var view = options.data.view;
  if (arguments.length === 1) {
    dataObject = view.model;
  }
  // listeners for the empty helper rather than listeners
  // that are themselves empty
  if (!view._emptyListeners) {
    view._emptyListeners = {};
  }
  // duck type check for collection
  if (dataObject && !view._emptyListeners[dataObject.cid] && dataObject.models && ('length' in dataObject)) {
    view._emptyListeners[dataObject.cid] = true;
    view.listenTo(dataObject, 'remove', function() {
      if (dataObject.length === 0) {
        view.render();
      }
    });
    view.listenTo(dataObject, 'add', function() {
      if (dataObject.length === 1) {
        view.render();
      }
    });
    view.listenTo(dataObject, 'reset', function() {
      view.render();
    });
  }
  return !dataObject || dataObject.isEmpty() ? options.fn(this) : options.inverse(this);
});

;;
Handlebars.registerHelper('template', function(name, options) {
  /*jshint -W089 */
  var hasHash = false;
  for (var _name in options.hash) {
    // Not doing hasOwnProperty check here as this is going to be a handlebars
    // generated object literal in most cases and under the rare situation that
    // the Object prototype has manipulated, the extend path will continue to do
    // the correct thing.
    hasHash = true;
    break;
  }

  var context = this;
  if (options.fn || hasHash) {
    context = Object.create ? Object.create(this) : _.clone(this);
    _.extend(context, {fn: options.fn}, options.hash);
  }

  var output = options.data.view.renderTemplate(name, context);
  return new Handlebars.SafeString(output);
});

Handlebars.registerHelper('yield', function(options) {
  return options.data.yield();
});

;;
Handlebars.registerHelper('url', function(_url, options) {
  var url = _url || '';

  var fragment = '';
  if (arguments.length > 2) {
    for (var i = 0, len = arguments.length - 1; i < len; i++) {
      fragment += (i ? '/' : '') + encodeURIComponent(arguments[i]);
    }
  } else {
    var hash = (options && options.hash) || options;
    if (hash && hash['expand-tokens']) {
      fragment = Thorax.Util.expandToken(url, this, true);
    } else {
      fragment = url;
    }
  }
  if (Backbone.history._hasPushState) {
    var root = Backbone.history.options.root;
    if (root === '/' && fragment.substr(0, 1) === '/') {
      return fragment;
    } else {
      return root + fragment;
    }
  } else {
    return '#' + fragment;
  }
});

;;
/*global viewTemplateOverrides, createErrorMessage */
Handlebars.registerViewHelper('view', {
  factory: function(args, options) {
    var View = args.length >= 1 ? args[0] : Thorax.View;
    return Thorax.Util.getViewInstance(View, options.options);
  },
  // ensure generated placeholder tag in template
  // will match tag of view instance
  modifyHTMLAttributes: function(htmlAttributes, instance) {
    // Handle fruitloops tag name lookup via the .name case.
    htmlAttributes.tagName = (instance.el.tagName || instance.el.name || '').toLowerCase();
  },
  callback: function(view) {
    var instance = arguments[arguments.length-1],
        options = instance._helperOptions.options,
        placeholderId = instance.cid;
    // view will be the argument passed to the helper, if it was
    // a string, a new instance was created on the fly, ok to pass
    // hash arguments, otherwise need to throw as templates should
    // not introduce side effects to existing view instances
    if (!_.isString(view) && options.hash && _.keys(options.hash).length > 0) {
      throw new Error(createErrorMessage('view-helper-hash-args'));
    }
    if (options.fn) {
      viewTemplateOverrides[placeholderId] = options.fn;
    }
  }
});

;;
/*global $serverSide, inheritVars */

inheritVars.model.defaultOptions.populate = true;

var oldModelChange = inheritVars.model.change;
inheritVars.model.change = function(view, model, options) {
  view._isChanging = true;
  oldModelChange.apply(view, arguments);
  view._isChanging = false;

  if (options && options.serializing) {
    return;
  }

  var populate = populateOptions(view);
  if (view._renderCount && populate) {
    view.populate(!populate.context && view.model.attributes, populate);
  }
};

_.extend(Thorax.View.prototype, {
  //serializes a form present in the view, returning the serialized data
  //as an object
  //pass {set:false} to not update this.model if present
  //can pass options, callback or event in any order
  serialize: function() {
    var callback, options, event;
    //ignore undefined arguments in case event was null
    for (var i = 0; i < arguments.length; ++i) {
      if (_.isFunction(arguments[i])) {
        callback = arguments[i];
      } else if (_.isObject(arguments[i])) {
        if ('stopPropagation' in arguments[i] && 'preventDefault' in arguments[i]) {
          event = arguments[i];
        } else {
          options = arguments[i];
        }
      }
    }

    if (event && !this._preventDuplicateSubmission(event)) {
      return;
    }

    options = _.extend({
      set: true,
      validate: true,
      children: true
    }, options || {});

    var attributes = options.attributes || {};

    //callback has context of element
    var view = this;
    var errors = [];
    eachNamedInput(this, options, function($element, i, name, type) {
      var value = view._getInputValue($element, type);
      if (!_.isUndefined(value)) {
        objectAndKeyFromAttributesAndName(attributes, name, {mode: 'serialize'}, function(object, key) {
          if (!object[key]) {
            object[key] = value;
          } else if (_.isArray(object[key])) {
            object[key].push(value);
          } else {
            object[key] = [object[key], value];
          }
        });
      }
    });

    if (!options._silent) {
      this.trigger('serialize', attributes, options);
    }

    if (options.validate) {
      var validateInputErrors = this.validateInput(attributes);
      if (validateInputErrors && validateInputErrors.length) {
        errors = errors.concat(validateInputErrors);
      }
      this.trigger('validate', attributes, errors, options);
      if (errors.length) {
        this.trigger('invalid', errors);
        return;
      }
    }

    if (options.set && this.model) {
      if (!this.model.set(attributes, {silent: options.silent, serializing: true})) {
        return false;
      }
    }

    var self = this;
    callback && callback.call(this, attributes, function() {
      resetSubmitState(self);
    });
    return attributes;
  },

  _preventDuplicateSubmission: function(event, callback) {
    event.preventDefault();

    var form = $(event.target);
    if ((event.target.tagName || '').toLowerCase() !== 'form') {
      // Handle non-submit events by gating on the form
      form = $(event.target).closest('form');
    }

    if (!form.attr('data-submit-wait')) {
      form.attr('data-submit-wait', 'true');
      if (callback) {
        callback.call(this, event);
      }
      return true;
    } else {
      return false;
    }
  },

  //populate a form from the passed attributes or this.model if present
  populate: function(attributes, options) {
    options = _.extend({
      children: true
    }, options || {});

    var value,
        attributes = attributes || this._getContext();

    //callback has context of element
    eachNamedInput(this, options, function($element, i, name, type) {
      objectAndKeyFromAttributesAndName(attributes, name, {mode: 'populate'}, function(object, key) {
        value = object && object[key];

        if (!_.isUndefined(value)) {
          //will only execute if we have a name that matches the structure in attributes
          var isBinary = type === 'checkbox' || type === 'radio';
          if (isBinary) {
            value = _.isBoolean(value) ? value : value === $element.val();
            $element[value ? 'attr' : 'removeAttr']('checked', 'checked');
          } else {
            $element.val(value);
          }
        }
      });
    });

    ++this._populateCount;
    if (!options._silent) {
      this.trigger('populate', attributes);
    }
  },

  //perform form validation, implemented by child class
  validateInput: function(/* attributes, options, errors */) {},

  _getInputValue: function($input, type) {
    if (type === 'checkbox' || type === 'radio') {
      // `prop` doesn't exist in fruit-loops, but it updates after user input.
      // whereas attr does not.
      var checked = $input[$input.prop ? 'prop' : 'attr']('checked');
      if (checked || checked === '') {
        // Under older versions of IE we see 'on' when no value is set so we want to cast this
        // to true.
        var value = $input.attr('value');
        return (value === 'on') || value || true;
      }
    } else {
      return $input.val() || '';
    }
  },

  _populateCount: 0
});

// Keeping state in the views
Thorax.View.on({
  'before:rendered': function() {
    // Do not store previous options if we have not rendered or if we have changed the associated
    // model since the last render
    if (!this._renderCount || (this.model && this.model.cid) !== this._formModelCid) {
      return;
    }

    var modelOptions = this.getObjectOptions(this.model);
    // When we have previously populated and rendered the view, reuse the user data
    this.previousFormData = filterObject(
      this.serialize(_.extend({ set: false, validate: false, _silent: true }, modelOptions)),
      function(value) { return value !== '' && value != null; }
    );
  },
  rendered: function() {
    var populate = populateOptions(this);

    if (populate && !this._isChanging && !this._populateCount) {
      this.populate(!populate.context && this.model.attributes, populate);
    }
    if (this.previousFormData) {
      this.populate(this.previousFormData, _.extend({_silent: true}, populate));
    }

    this._formModelCid = this.model && this.model.cid;
    this.previousFormData = null;
  }
});

function filterObject(object, callback) {
  _.each(object, function (value, key) {
    if (_.isObject(value)) {
      return filterObject(value, callback);
    }
    if (callback(value, key, object) === false) {
      delete object[key];
    }
  });
  return object;
}

if (!$serverSide) {
  Thorax.View.on({
    invalid: onErrorOrInvalidData,
    error: onErrorOrInvalidData,
    deactivated: function() {
      if (this.$el) {
        resetSubmitState(this);
      }
    }
  });
}

function onErrorOrInvalidData () {
  resetSubmitState(this);

  // If we errored with a model we want to reset the content but leave the UI
  // intact. If the user updates the data and serializes any overwritten data
  // will be restored.
  if (this.model && this.model.previousAttributes) {
    this.model.set(this.model.previousAttributes(), {
      silent: true
    });
  }
}

function eachNamedInput(view, options, iterator) {
  var i = 0;

  $('select,input,textarea', options.root || view.el).each(function() {
    var $el = $(this);

    if (!options.children) {
      if (view.el !== $el.view({el: true, helper: false})[0]) {
        return;
      }
    }

    var type = $el.attr('type'),
        name = $el.attr('name');
    if (type !== 'button' && type !== 'cancel' && type !== 'submit' && name) {
      iterator($el, i, name, type);
      ++i;
    }
  });
}

//calls a callback with the correct object fragment and key from a compound name
function objectAndKeyFromAttributesAndName(attributes, name, options, callback) {
  var key,
      object = attributes,
      keys = name.split('['),
      mode = options.mode;

  for (var i = 0; i < keys.length - 1; ++i) {
    key = keys[i].replace(']', '');
    if (!object[key]) {
      if (mode === 'serialize') {
        object[key] = {};
      } else {
        return callback(undefined, key);
      }
    }
    object = object[key];
  }
  key = keys[keys.length - 1].replace(']', '');
  callback(object, key);
}

function resetSubmitState(view) {
  view.$('form').removeAttr('data-submit-wait');
  view.$el.removeAttr('data-submit-wait');
}

function populateOptions(view) {
  var modelOptions = view.getObjectOptions(view.model) || {};
  return modelOptions.populate === true ? {} : modelOptions.populate;
}

;;
/* global createErrorMessage, normalizeHTMLAttributeOptions */

var callMethodAttributeName = 'data-call-method',
    triggerEventAttributeName = 'data-trigger-event';

Handlebars.registerHelper('button', function(method, options) {
  if (arguments.length === 1) {
    options = method;
    method = options.hash.method;
  }
  var hash = options.hash,
      expandTokens = hash['expand-tokens'];
  delete hash['expand-tokens'];
  if (!method && !options.hash.trigger) {
    throw new Error(createErrorMessage('button-trigger'));
  }
  normalizeHTMLAttributeOptions(hash);
  hash.tagName = hash.tagName || 'button';
  hash.trigger && (hash[triggerEventAttributeName] = hash.trigger);
  delete hash.trigger;
  method && (hash[callMethodAttributeName] = method);
  return new Handlebars.SafeString(Thorax.Util.tag(hash, options.fn ? options.fn(this) : '', expandTokens ? this : null));
});

Handlebars.registerHelper('link', function() {
  var args = _.toArray(arguments),
      options = args.pop(),
      hash = options.hash,
      // url is an array that will be passed to the url helper
      url = args.length === 0 ? [hash.href] : args,
      expandTokens = hash['expand-tokens'];
  delete hash['expand-tokens'];
  if (!url[0] && url[0] !== '') {
    throw new Error(createErrorMessage('link-href'));
  }
  normalizeHTMLAttributeOptions(hash);
  url.push(options);
  hash.href = Handlebars.helpers.url.apply(this, url);
  hash.tagName = hash.tagName || 'a';
  hash.trigger && (hash[triggerEventAttributeName] = options.hash.trigger);
  delete hash.trigger;
  hash[callMethodAttributeName] = '_anchorClick';
  return new Handlebars.SafeString(Thorax.Util.tag(hash, options.fn ? options.fn(this) : '', expandTokens ? this : null));
});

var clickSelector = '[' + callMethodAttributeName + '], [' + triggerEventAttributeName + ']';

function handleClick(event) {
  var $this = $(this),
      view = $this.view({helper: false}),
      methodName = $this.attr(callMethodAttributeName),
      eventName = $this.attr(triggerEventAttributeName),
      methodResponse = false;
  methodName && (methodResponse = view[methodName](event));
  eventName && view.trigger(eventName, event);
  this.tagName === 'A' && methodResponse === false && event.preventDefault();
}

var lastClickHandlerEventName;

function registerClickHandler() {
  unregisterClickHandler();
  lastClickHandlerEventName = Thorax._fastClickEventName || 'click';
  $(document).on(lastClickHandlerEventName, clickSelector, handleClick);
}

function unregisterClickHandler() {
  lastClickHandlerEventName && $(document).off(lastClickHandlerEventName, clickSelector, handleClick);
}

$(document).ready(function() {
  if (!Thorax._fastClickEventName) {
    registerClickHandler();
  }
});

;;
/*global normalizeHTMLAttributeOptions */
var elementPlaceholderAttributeName = 'data-element-tmp';

Handlebars.registerHelper('element', function(element, options) {
  normalizeHTMLAttributeOptions(options.hash);
  var cid = _.uniqueId('element'),
      declaringView = options.data.view;
  options.hash[elementPlaceholderAttributeName] = cid;
  declaringView._elementsByCid || (declaringView._elementsByCid = {});
  declaringView._elementsByCid[cid] = element;

  // Register the append helper if not already done
  if (!declaringView._pendingElement) {
    declaringView._pendingElement = true;
    declaringView.once('append', elementAppend);
  }

  return new Handlebars.SafeString(Thorax.Util.tag(options.hash));
});

function elementAppend(scope, callback) {
  this._pendingElement = undefined;

  var self = this;
  (scope || this.$el).find('[' + elementPlaceholderAttributeName + ']').forEach(function(el) {
    var $el = $(el),
        cid = $el.attr(elementPlaceholderAttributeName),
        element = self._elementsByCid[cid];
    // A callback function may be specified as the value
    if (_.isFunction(element)) {
      element = element.call(self);
    }
    $el.replaceWith(element);
    callback && callback($(element));
  });
}

;;
/* global createErrorMessage */

Handlebars.registerHelper('super', function(options) {
  var declaringView = options.data.view,
      parent = declaringView.constructor && declaringView.constructor.__super__;
  if (parent) {
    var template = parent.template;
    if (!template) {
      if (!parent.name) {
        throw new Error(createErrorMessage('super-parent'));
      }
      template = parent.name;
    }
    if (_.isString(template)) {
      template = Thorax.Util.getTemplate(template, false);
    }
    return new Handlebars.SafeString(template(this, options));
  } else {
    return '';
  }
});

;;
/*global $serverSide, createErrorMessage, inheritVars */

var loadStart = 'load:start',
    loadEnd = 'load:end',
    rootObject;

Thorax.setRootObject = function(obj) {
  rootObject = obj;
};

Thorax.loadHandler = function(start, end, context) {
  var loadCounter = _.uniqueId('load');
  return function(message, background, object) {
    if ($serverSide) {
      return;
    }

    var self = context || this;
    self._loadInfo = self._loadInfo || {};
    var loadInfo = self._loadInfo[loadCounter];

    function startLoadTimeout() {

      // If the timeout has been set already but has not triggered yet do nothing
      // Otherwise set a new timeout (either initial or for going from background to
      // non-background loading)
      if (loadInfo.timeout && !loadInfo.run) {
        return;
      }

      var loadingTimeout = self._loadingTimeoutDuration !== undefined ?
        self._loadingTimeoutDuration : Thorax.View.prototype._loadingTimeoutDuration;
      loadInfo.timeout = setTimeout(
          Thorax.bindSection('load-start', function() {
            // We have a slight race condtion in here where the end event may have occurred
            // but the end timeout has not executed. Rather than killing a cumulative timeout
            // immediately we'll protect from that case here
            if (loadInfo.events.length) {
              loadInfo.run = true;
              start.call(self, loadInfo.message, loadInfo.background, loadInfo);
            }
          }),
        loadingTimeout * 1000);
    }

    if (!loadInfo) {
      loadInfo = self._loadInfo[loadCounter] = _.extend({
        isLoading: function() {
          return loadInfo.events.length;
        },

        cid: loadCounter,
        events: [],
        timeout: 0,
        message: message,
        background: !!background
      }, Backbone.Events);
      startLoadTimeout();
    } else {
      clearTimeout(loadInfo.endTimeout);

      loadInfo.message = message;
      if (!background && loadInfo.background) {
        loadInfo.background = false;
        startLoadTimeout();
      }
    }

    // Prevent binds to the same object multiple times as this can cause very bad things
    // to happen for the load;load;end;end execution flow.
    if (_.indexOf(loadInfo.events, object) >= 0) {
      return;
    }

    loadInfo.events.push(object);

    // Must be defined as a variable rather than a named function as a parameter as oldIE
    // isn't able to properly remove the callback when using that syntax
    var endCallback = function() {
      var loadingEndTimeout = self._loadingTimeoutEndDuration;
      if (loadingEndTimeout === void 0) {
        // If we are running on a non-view object pull the default timeout
        loadingEndTimeout = Thorax.View.prototype._loadingTimeoutEndDuration;
      }

      var events = loadInfo.events,
          index = _.indexOf(events, object);
      if (index >= 0 && !object.isLoading()) {
        events.splice(index, 1);

        if (_.indexOf(events, object) < 0) {
          // Last callback for this particlar object, remove the bind
          object.off(loadEnd, endCallback);
        }
      }

      if (!events.length) {
        clearTimeout(loadInfo.endTimeout);
        loadInfo.endTimeout = setTimeout(
          Thorax.bindSection('load-end', function() {
            if (!events.length) {
              if (loadInfo.run) {
                // Emit the end behavior, but only if there is a paired start
                end && end.call(self, loadInfo.background, loadInfo);
                loadInfo.trigger(loadEnd, loadInfo);
              }

              // If stopping make sure we don't run a start
              clearTimeout(loadInfo.timeout);
              loadInfo = self._loadInfo[loadCounter] = undefined;
            }
          }),
        loadingEndTimeout * 1000);
      }
    };
    object.on(loadEnd, endCallback);
  };
};

/**
 * Helper method for propagating load:start events to other objects.
 *
 * Forwards load:start events that occur on `source` to `dest`.
 */
Thorax.forwardLoadEvents = function(source, dest, once) {
  function load(message, backgound, object) {
    if (once) {
      source.off(loadStart, load);
    }
    dest.trigger(loadStart, message, backgound, object);
  }
  source.on(loadStart, load);
  return {
    off: function() {
      source.off(loadStart, load);
    }
  };
};

//
// Data load event generation
//

/**
 * Mixing for generating load:start and load:end events.
 */
Thorax.mixinLoadable = function(target, useParent) {
  _.extend(target, {
    //loading config
    _loadingClassName: 'loading',
    _loadingTimeoutDuration: 0.33,
    _loadingTimeoutEndDuration: 0.10,

    // Propagates loading view parameters to the AJAX layer
    onLoadStart: function(message, background, object) {
      var that = useParent ? this.parent : this;

      // Protect against race conditions
      if (!that || !that.el) {
        return;
      }

      if (!that.nonBlockingLoad && !background && rootObject && rootObject !== this) {
        rootObject.trigger(loadStart, message, background, object);
      }
      that._isLoading = true;
      that.$el.addClass(that._loadingClassName);
      // used by loading helpers
      that.trigger('change:load-state', 'start', background);
    },
    onLoadEnd: function(/* background, object */) {
      var that = useParent ? this.parent : this;

      // Protect against race conditions
      if (!that || !that.el) {
        return;
      }

      that._isLoading = false;
      that.$el.removeClass(that._loadingClassName);
      // used by loading helper
      that.trigger('change:load-state', 'end');
    }
  });
};

Thorax.mixinLoadableEvents = function(target, useParent) {
  _.extend(target, {
    _loadCount: 0,

    isLoading: function() {
      return this._loadCount > 0;
    },

    loadStart: function(message, background) {
      this._loadCount++;

      var that = useParent ? this.parent : this;
      that.trigger(loadStart, message, background, that);
    },
    loadEnd: function() {
      this._loadCount--;

      var that = useParent ? this.parent : this;
      that.trigger(loadEnd, that);
    }
  });
};

Thorax.mixinLoadable(Thorax.View.prototype);
Thorax.mixinLoadableEvents(Thorax.View.prototype);


if (Thorax.HelperView) {
  Thorax.mixinLoadable(Thorax.HelperView.prototype, true);
  Thorax.mixinLoadableEvents(Thorax.HelperView.prototype, true);
}

if (Thorax.CollectionHelperView) {
  Thorax.mixinLoadable(Thorax.CollectionHelperView.prototype, true);
  Thorax.mixinLoadableEvents(Thorax.CollectionHelperView.prototype, true);
}

Thorax.sync = function(method, dataObj, options) {
  var self = this,
      complete = options.complete;

  options.complete = function() {
    self._request = undefined;
    self._aborted = false;

    complete && complete.apply(this, arguments);
  };
  this._request = Backbone.sync.apply(this, arguments);

  return this._request;
};

// Tracks the last route that has been emitted.
// This allows bindToRoute to differentiate between route events that are
// associated with the current handler's execution (as the route event triggers after)
// and with subsequent operations.
//
// This allows for bindToRoute to safely cleanup pending operations for the edge case
// where callers are calling `loadUrl` directly on the same fragment repeatidly.
var triggeredRoute,
    $loadUrl = Backbone.History.prototype.loadUrl;

Backbone.History.prototype.loadUrl = function() {
  Backbone.history.once('route', function() {
    triggeredRoute = Backbone.history.getFragment();
  });
  triggeredRoute = false;
  return $loadUrl.apply(this, arguments);
};

function bindToRoute(callback, failback) {
  var started = Backbone.History.started,
      fragment = started && Backbone.history.getFragment(),
      pendingRoute = triggeredRoute !== fragment;   // Has the `route` event triggered for this particular event?

  function routeHandler() {
    if (!started) {
      // If we were not started when this was initiated, reset ourselves to use the current route
      // as we can not trust the route that was given prior to the history object being configured
      fragment = Backbone.history.getFragment();
      pendingRoute = started = true;
    }
    if (pendingRoute && fragment === Backbone.history.getFragment()) {
      // The bind to route occured in the handler and the route event
      // was not yet triggered so we do not want to terminate the bind
      pendingRoute = false;
      return;
    }

    // Otherwise the fragment has changed or the router was executed again on the same
    // fragment, which we consider to be a distinct operation for these purposes.
    callback = undefined;
    res.cancel();
    failback && failback();
  }

  Backbone.history.on('route', routeHandler);

  function finalizer() {
    Backbone.history.off('route', routeHandler);
    if (callback) {
      callback.apply(this, arguments);
    }
  }

  var res = _.bind(finalizer, this);
  res.cancel = function() {
    Backbone.history.off('route', routeHandler);
  };

  return res;
}

function loadData(dataObj, callback, failback, options) {
  if (dataObj.isPopulated()) {
    // Defer here to maintain async callback behavior for all loading cases
    return _.defer(callback, dataObj);
  }

  if (arguments.length === 2 && !_.isFunction(failback) && _.isObject(failback)) {
    options = failback;
    failback = false;
  }

  var self = dataObj,
      routeChanged = false,
      successCallback = bindToRoute(_.bind(callback, self), function() {
        routeChanged = true;

        // Manually abort this particular load cycle (and only this one)
        queueEntry && queueEntry.aborted();

        // Kill off the request if there isn't anyone remaining who may want to interact
        // with it.
        if (self._request && (!self.fetchQueue || !self.fetchQueue.length)) {
          self._aborted = true;
          self._request.abort();
        }

        failback && failback.call(self, false);
      }),
      queueEntry;

  dataObj.fetch(_.defaults({
    success: successCallback,
    error: function() {
      successCallback.cancel();
      if (!routeChanged && failback) {
        failback.apply(self, [true].concat(_.toArray(arguments)));
      }
    }
  }, options));

  queueEntry = _.last(dataObj.fetchQueue);
}

function fetchQueue(dataObj, options, $super) {
  if (options.resetQueue) {
    // WARN: Should ensure that loaders are protected from out of band data
    //    when using this option
    dataObj.fetchQueue = undefined;
  } else if (dataObj.fetchQueue) {
    // concurrent set/reset fetch events are not advised
    var reset = (dataObj.fetchQueue[0].options || {}).reset;
    if (reset !== options.reset) {
      // fetch with concurrent set & reset not allowed
      throw new Error(createErrorMessage('mixed-fetch'));
    }
  }

  if (!dataObj.fetchQueue) {
    // Kick off the request
    dataObj.fetchQueue = [];
    var requestOptions = _.defaults({
      success: flushQueue(dataObj, dataObj.fetchQueue, 'success'),
      error: flushQueue(dataObj, dataObj.fetchQueue, 'error'),
      complete: flushQueue(dataObj, dataObj.fetchQueue, 'complete')
    }, options);

    // Handle callers that do not pass in a super class and wish to implement their own
    // fetch behavior
    if ($super) {
      var promise = $super.call(dataObj, requestOptions);
      if (dataObj.fetchQueue) {
        // ensure the fetchQueue has not been cleared out - https://github.com/walmartlabs/thorax/issues/304
        // This can occur in some environments if the request fails sync to this call, causing the 
        // error handler to clear out the fetchQueue before we get to this point.
        dataObj.fetchQueue._promise = promise;
      } else {
        return;
      }
    } else {
      return requestOptions;
    }
  }

  // Create a proxy promise for this specific load call. This allows us to abort specific
  // callbacks when bindToRoute needs to kill off specific callback instances.
  var deferred;
  if ($.Deferred && dataObj.fetchQueue._promise && dataObj.fetchQueue._promise.then) {
    deferred = $.Deferred();
    dataObj.fetchQueue._promise.then(
        _.bind(deferred.resolve, deferred),
        _.bind(deferred.reject, deferred));
  }

  var fetchQueue = dataObj.fetchQueue;
  dataObj.fetchQueue.push({
    // Individual requests can only fail individually. Success willl always occur via the
    // normal xhr path
    aborted: function() {
      var index = _.indexOf(fetchQueue, this);
      if (index >= 0) {
        fetchQueue.splice(index, 1);

        // If we are the last of the fetchQueue entries, invalidate the queue.
        if (!fetchQueue.length && fetchQueue === dataObj.fetchQueue) {
          dataObj.fetchQueue = undefined;
        }
      }

      var args = [fetchQueue._promise, 'abort'];
      deferred && deferred.rejectWith(options.context, args);
      options.error && options.error.apply(options.context, args);
      options.complete && options.complete.apply(options.context, args);
    },
    options: options
  });

  return deferred ? deferred.promise() : dataObj.fetchQueue._promise;
}

function flushQueue(self, fetchQueue, handler) {
  return function() {
    var args = arguments;

    // Flush the queue. Executes any callback handlers that
    // may have been passed in the fetch options.
    _.each(fetchQueue, function(queue) {
      var options = queue.options;

      if (options[handler]) {
        options[handler].apply(this, args);
      }
    }, this);

    // Reset the queue if we are still the active request
    if (self.fetchQueue === fetchQueue) {
      self.fetchQueue = undefined;
    }
  };
}

var klasses = [];
Thorax.Model && klasses.push(Thorax.Model);
Thorax.Collection && klasses.push(Thorax.Collection);

_.each(klasses, function(DataClass) {
  var $fetch = DataClass.prototype.fetch;
  Thorax.mixinLoadableEvents(DataClass.prototype, false);
  _.extend(DataClass.prototype, {
    sync: Thorax.sync,

    fetch: function(options) {
      options = options || {};
      if (DataClass === Thorax.Collection) {
        if (!_.find(['reset', 'remove', 'add', 'update'], function(key) { return !_.isUndefined(options[key]); })) {
          // use backbone < 1.0 behavior to allow triggering of reset events
          options.reset = true;
        }
      }

      if (!options.loadTriggered) {
        var self = this;

        function endWrapper(method) {
          var $super = options[method];
          options[method] = function() {
            self.loadEnd();
            $super && $super.apply(this, arguments);
          };
        }

        endWrapper('success');
        endWrapper('error');
        self.loadStart(undefined, options.background);
      }

      return fetchQueue(this, options || {}, $fetch);
    },

    load: function(callback, failback, options) {
      if (arguments.length === 2 && !_.isFunction(failback)) {
        options = failback;
        failback = false;
      }

      options = options || {};
      if (!options.background && !this.isPopulated() && rootObject) {
        // Make sure that the global scope sees the proper load events here
        // if we are loading in standalone mode
        if (this.isLoading()) {
          // trigger directly because load:start has already been triggered
          rootObject.trigger(loadStart, options.message, options.background, this);
        } else {
          Thorax.forwardLoadEvents(this, rootObject, true);
        }
      }

      loadData(this, callback, failback, options);
    }
  });
});

Thorax.Util.bindToRoute = bindToRoute;

// Propagates loading view parameters to the AJAX layer
Thorax.View.prototype._modifyDataObjectOptions = function(dataObject, options) {
  options.ignoreErrors = this.ignoreFetchError;
  options.background = this.nonBlockingLoad;
  return options;
};

// Thorax.CollectionHelperView inherits from CollectionView
// not HelperView so need to set it manually
Thorax.HelperView.prototype._modifyDataObjectOptions = Thorax.CollectionHelperView.prototype._modifyDataObjectOptions = function(dataObject, options) {
  options.ignoreErrors = this.parent.ignoreFetchError;
  options.background = this.parent.nonBlockingLoad;
  return options;
};

inheritVars.collection.loading = function(view) {
  var loadingView = view.loadingView,
      loadingTemplate = view.loadingTemplate,
      loadingPlacement = view.loadingPlacement;
  //add "loading-view" and "loading-template" options to collection helper
  if (loadingView || loadingTemplate) {
    var callback = Thorax.loadHandler(function() {
      var item;
      if (view.collection.length === 0) {
        view.$el.empty();
      }
      if (loadingView) {
        var instance = Thorax.Util.getViewInstance(loadingView);
        view._addChild(instance);
        if (loadingTemplate) {
          instance.render(loadingTemplate);
        } else {
          instance.render();
        }
        item = instance;
      } else {
        item = view.renderTemplate(loadingTemplate);
      }
      var index = loadingPlacement
        ? loadingPlacement.call(view)
        : view.collection.length
      ;
      view.appendItem(item, index);
      view.$el.children().eq(index).attr('data-loading-element', view.collection.cid);
    }, function() {
      view.$el.find('[data-loading-element="' + view.collection.cid + '"]').remove();
    },
    view.collection);

    view.listenTo(view.collection, 'load:start', callback);
  }
};

if (Thorax.CollectionHelperView) {
  _.extend(Thorax.CollectionHelperView.attributeWhiteList, {
    'loading-template': 'loadingTemplate',
    'loading-view': 'loadingView',
    'loading-placement': 'loadingPlacement'
  });
}

Thorax.View.on({
  'load:start': Thorax.loadHandler(
      function(message, background, object) {
        this.onLoadStart(message, background, object);
      },
      function(background, object) {
        this.onLoadEnd(object);
      }),

  collection: {
    'load:start': function(message, background, object) {
      this.trigger(loadStart, message, background, object);
    }
  },
  model: {
    'load:start': function(message, background, object) {
      this.trigger(loadStart, message, background, object);
    }
  }
});

;;
Handlebars.registerHelper('loading', function(options) {
  var view = options.data.view;
  view.off('change:load-state', onLoadStateChange, view);
  view.on('change:load-state', onLoadStateChange, view);
  return view._isLoading ? options.fn(this) : options.inverse(this);
});

function onLoadStateChange() {
  this.render();
}

;;
/*global pushDomEvents */
var isiOS = navigator.userAgent.match(/(iPhone|iPod|iPad)/i),
    isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1 ? 1 : 0,
    minimumScrollYOffset = isAndroid ? 1 : 0;

Thorax.Util.scrollTo = function(x, y) {
  y = y || minimumScrollYOffset;
  function _scrollTo() {
    window.scrollTo(x, y);
  }
  if (isiOS) {
    // a defer is required for ios
    _.defer(_scrollTo);
  } else {
    _scrollTo();
  }
  return [x, y];
};

Thorax.LayoutView.on('change:view:end', function(newView, oldView, options) {
  options && options.scroll && Thorax.Util.scrollTo(0, 0);
});

Thorax.Util.scrollToTop = function() {
  // android will use height of 1 because of minimumScrollYOffset in scrollTo()
  return this.scrollTo(0, 0);
};

//built in dom events
Thorax.View.on({
  'submit form': function(/* event */) {
    // Hide any virtual keyboards that may be lingering around
    var focused = $(':focus')[0];
    focused && focused.blur();
  }
});

;;
/*global isAndroid */

// This doesn't work on HTC devices with Android 4.0.
// Not much can be done about it as it seems to be a browser bug
// (it doesn't update visual styling while you hold your finger on the screen)
$.fn.tapHoldAndEnd = function(selector, callbackStart, callbackEnd) {
  return this.each(function() {
    var tapHoldStart,
        timer,
        target;

    function clearTapTimer() {
      clearTimeout(timer);

      if (tapHoldStart && target) {
        callbackEnd(target);
      }

      target = undefined;
      tapHoldStart = false;
    }

    $(this).on('touchstart', selector, function(event) {
        if ($(event.currentTarget).attr('data-no-tap-highlight')) {
          return;
        }

        clearTapTimer();

        target = event.currentTarget;
        timer = setTimeout(function() {
          tapHoldStart = true;
          callbackStart(target);
        }, 50);
      })
      .on('touchmove touchend', clearTapTimer);

    $(document).on('touchcancel', clearTapTimer);
  });
};

//only enable on android
var useNativeHighlight = !isAndroid;
Thorax.configureTapHighlight = function(useNative, highlightClass) {
  useNativeHighlight = useNative;
  highlightClass = highlightClass || 'tap-highlight';

  if (!useNative) {
    function _tapHighlightStart(target) {
      var tagName = target && target.tagName.toLowerCase();

      // User input controls may be visually part of a larger group. For these cases
      // we want to give priority to any parent that may provide a focus operation.
      if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
        target = $(target).closest('[data-tappable=true]')[0] || target;
      }

      if (target) {
        $(target).addClass(highlightClass);
        return false;
      }
    }
    function _tapHighlightEnd() {
      $('.' + highlightClass).removeClass(highlightClass);
    }
    $(document.body).tapHoldAndEnd(
          '[data-tappable=true], a, input, button, select, textarea',
          _tapHighlightStart,
          _tapHighlightEnd);
  }
};

var NATIVE_TAPPABLE = {
  'A': true,
  'INPUT': true,
  'BUTTON': true,
  'SELECT': true,
  'TEXTAREA': true
};

// Out here so we do not retain a scope
function NOP(){}

function fixupTapHighlight() {
  _.each(this._domEvents || [], function(bind) {
    var components = bind.split(' '),
        selector = components.slice(1).join(' ') || undefined;  // Needed to make zepto happy

    if (components[0] === 'click') {
      // !selector case is for root click handlers on the view, i.e. 'click'
      $(selector || this.el, selector && this.el).forEach(function(el) {
        var $el = $(el).attr('data-tappable', true);

        if (useNativeHighlight && !NATIVE_TAPPABLE[el.tagName]) {
          // Add an explicit NOP bind to allow tap-highlight support
          $el.on('click', NOP);
        }
      });
    }
  }, this);
}

Thorax.View.on({
  'rendered': fixupTapHighlight,
  'rendered:collection': fixupTapHighlight,
  'rendered:item': fixupTapHighlight,
  'rendered:empty': fixupTapHighlight
});

var _addEvent = Thorax.View.prototype._addEvent;
Thorax.View.prototype._addEvent = function(params) {
  this._domEvents = this._domEvents || [];
  if (params.type === "DOM") {
    this._domEvents.push(params.originalName);
  }
  return _addEvent.call(this, params);
};

;;


})();

//@ sourceMappingURL=thorax-mobile.js.map

