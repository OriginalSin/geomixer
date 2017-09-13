var nsGmx = window.nsGmx = window.nsGmx || {};

nsGmx.Auth = nsGmx.Auth || {};

nsGmx.Auth.ResourceServer = (function() {

    var extend = function(childClass, parentClass) {
        var F = function() {};
        F.prototype = parentClass.prototype;
        childClass.prototype = new F();
        childClass.superClass = parentClass.prototype;
    };

    /**
     * @class
     * @constructor
     * @param {AuthManager} authManager
     * @param {Object} options параметры сервера авторизации (TBD)
     */
    var ResourceServer = function(authManager, options) {
        this._id = options.id;
        this._root = options.root;
        this._authManager = authManager;
        authManager.$addResourceServer(this);
    };

    extend(ResourceServer, nsGmx.Auth.Server);
    
    var extendRequestMethod = function(requestFuncName) {
        return function(url, params, baseForm) {
            var self = this;
            var deferred = $.Deferred();

            var params = params || {};
            params.sync = this._authManager.$getAntiCsrfToken();
            
            ResourceServer.superClass[requestFuncName].call(this, url, params, baseForm).done(function(data) {
                data.Service = {
                    ServerId: self._id
                }
                
                if (data.Status === 'ok') {
                    deferred.resolve(data);
                } else {
                    deferred.reject(data);
                }
            }).fail(function(errors) {
                deferred.reject({
                    Status: 'error',
                    ErrorInfo: errors.ErrorInfo
                });
            });

            return deferred.promise();
        }
    }

    ResourceServer.prototype.sendGetRequest = extendRequestMethod('sendGetRequest');
    ResourceServer.prototype.sendImageRequest = extendRequestMethod('sendImageRequest');
    ResourceServer.prototype.sendPostRequest = extendRequestMethod('sendPostRequest');

    return ResourceServer;

})();