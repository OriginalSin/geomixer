var nsGmx = window.nsGmx = window.nsGmx || {};

nsGmx.Auth = nsGmx.Auth || {};

(function() {
    //TODO: использовать ли библиотеку?
    function parseUri(str)
    {
        var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
            key = ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
            m = parser.exec(str),
            uri = {},
            i   = 14;

        while (i--) uri[key[i]] = m[i] || "";
        
        // HACK
        uri.hostOnly = uri.host;
        uri.host = uri.authority;
        
        return uri;
    };
    
    var requests = {},
        lastRequestId = 0,
        uniquePrefix = 'id' + Math.random();

    var processMessage = function(e) {
        if (!(e.origin in requests)) {
            return;
        }
        
        var dataStr = decodeURIComponent(e.data.replace(/\n/g,'\n\\'));
        try {
            var dataObj = JSON.parse(dataStr);
        } catch (e) {
            return;
        }
        
        var request = requests[e.origin][dataObj.CallbackName];
        if (!request) return;    // какой-то левый message
        
        delete requests[e.origin][dataObj.CallbackName];
        
        request.iframe.parentNode.removeChild(request.iframe);
        request.callback && request.callback(dataObj);
    }
    
    //совместимость с IE8
    if (window.addEventListener) {
        window.addEventListener('message', processMessage);
    } else {
        window.attachEvent('onmessage', processMessage);
    }
    
    var addQueryVariables = function(url, variables) {
        var oldQueryString = url.split('?')[1];
        var newQueryString = '';
        for (var variable in variables) {
            if (variables.hasOwnProperty(variable)) {
                newQueryString += ('&' + variable + '=' + encodeURIComponent(variables[variable]));
            }
        }
        if (oldQueryString) {
            return url + newQueryString;
        } else {
            return url + '?' + newQueryString.slice(1);
        }
    };
    
    function createPostIframe(id)
    {
        var iframe = document.createElement("iframe");
        iframe.style.display = 'none';
        iframe.setAttribute('id', id);
        iframe.setAttribute('name', id);
        iframe.src = 'javascript:true';
        
        return iframe;
    }

    nsGmx.Auth.Server = (function() {
        /**
         * @class
         * @constructor
         */
        var Server = function(options) {
            this._root = options.root;
        };

        /** Послать GET запрос к серверу ресурсов.
         * @param  {String} url
         * @param  {Object} params
         * @return {Function} promise(data)
         */
        Server.prototype.sendGetRequest = function(url, params) {
            var deferred = $.Deferred();
            var requestUrl = this._root + '/' + url;
            requestUrl = addQueryVariables(requestUrl, params);
            $.ajax({
                url: requestUrl,
                dataType: 'jsonp',
                jsonp: 'CallbackName'
            }).done(function(data) {
                deferred.resolve(data);
            }).fail(function(errors) {
                deferred.reject({
                    Status: 'error'
                });
            });
            return deferred.promise();
        };
        
        /** Послать к серверу ресурсов запрос за картинкой.
         * @param  {String} url
         * @param  {Object} params
         * @return {Function} promise(image)
         */
        Server.prototype.sendImageRequest = function(url, params) {
            var deferred = $.Deferred();
            var requestUrl = this._root + '/' + url;
            requestUrl = addQueryVariables(requestUrl, params);
            
            var img = new Image();
            
            img.onload = function() {
                deferred.resolve({
                    Status: 'ok',
                    Result: img
                });
            }
            img.onerror = deferred.reject.bind(deferred);
            
            img.src = requestUrl;
            
            return deferred.promise();
        };

        /** Послать POST запрос к серверу ресурсов.
         * @param  {String} url
         * @param  {Object} params
         * @param  {HTMLFormElement} baseForm HTML Form, которая может быть использована как основа для посылки запроса (например, если нужно загрузить файл)
         * @return {Function} promise(data)
         */
        Server.prototype.sendPostRequest = function(url, params, baseForm) {
            var requestURL = this._root + '/' + url,
                deferred = $.Deferred(),
                processResponse = function(response) {
                    if (response.Status !== 'ok') {
                        deferred.reject(response);
                    } else {
                        deferred.resolve(response);
                    }
                },
                id = uniquePrefix + (lastRequestId++),
                iframe = createPostIframe(id),
                parsedURL = parseUri(requestURL),
                origin = (parsedURL.protocol ? (parsedURL.protocol + ':') : window.location.protocol) + '//' + (parsedURL.host || window.location.host),
                originalFormAction,
                form;
            
            requests[origin] = requests[origin] || {};
            requests[origin][id] = {callback: processResponse, iframe: iframe};
                
            if (baseForm)
            {
                form = baseForm;
                originalFormAction = form.getAttribute('action');
                form.setAttribute('action', requestURL);
                form.target = id;
                
            }
            else
            {
                form = document.createElement('form');
                form.style.display = 'none';
                form.setAttribute('enctype', 'multipart/form-data');
                form.target = id;
                form.setAttribute('method', 'POST');
                form.setAttribute('action', requestURL);
                form.id = id;
            }
            
            var hiddenParamsDiv = document.createElement("div");
            hiddenParamsDiv.style.display = 'none';
            
            var appendFormParam = function(paramName, paramValue) { 
                var input = document.createElement("input");
                
                paramValue = typeof paramValue !== 'undefined' ? paramValue : '';
                
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', paramName);
                input.setAttribute('value', paramValue);
                
                hiddenParamsDiv.appendChild(input)
            }
            
            for (var paramName in params) {
                appendFormParam(paramName, params[paramName]);
            }
            
            appendFormParam('WrapStyle', 'message');
            appendFormParam('CallbackName', id);
            
            form.appendChild(hiddenParamsDiv);
            
            if (!baseForm)
                document.body.appendChild(form);
                
            document.body.appendChild(iframe);
            
            form.submit();
            
            if (baseForm)
            {
                form.removeChild(hiddenParamsDiv);
                if (originalFormAction !== null)
                    form.setAttribute('action', originalFormAction);
                else
                    form.removeAttribute('action');
            }
            else
            {
                form.parentNode.removeChild(form);
            }
            
            return deferred.promise();
        };

        return Server;
    })();
})();