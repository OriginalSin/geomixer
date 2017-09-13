var nsGmx = window.nsGmx = window.nsGmx || {};

nsGmx.Auth = nsGmx.Auth || {};

nsGmx.Auth.AuthManager = (function() {
    /**
     * @class
     * @constructor
     * @param {Object} options параметры сервера авторизации (TBD)
     */
    var AuthManager = function(options) {
        // поддерживаем как минимум два события для
        // серверов ресурсов: login и logout
        this._authorizationEndpoint = options.authorizationEndpoint;
        this._userInfoEndpoint = options.userInfoEndpoint;
        this._redirectEndpointHtml = options.redirectEndpointHtml;
        this._redirectEndpointAshx = options.redirectEndpointAshx;
        this._redirectEndpointAshx2 = options.redirectEndpointAshx + '/?return_url=' + location.href;
        this._credentialLoginEndpoint = options.credentialLoginEndpoint;
        this._resourceServers = [];
        this._clientId = options.clientId || 1;
    };

    AuthManager.prototype = _.extend({}, Backbone.Events);

    // $ - это типа метод для friendly-классов. Как бы приватный, но классы серверов ресурсов его использовать могут.

    AuthManager.prototype.$getAntiCsrfToken = function() {
        var cookieName = "sync";
        var re = new RegExp('.*' + cookieName + '=([^;]+).*', 'i');
        var cookieValue = document.cookie.replace(re, '$1');
        return cookieValue;
    };

    /** Добавляет сервер ресурсов
     * Должна вызываться только из класса ResourceServer.
     * @param {ResourceServer} resourceServer
     */
    AuthManager.prototype.$addResourceServer = function(resourceServer) {
        this._resourceServers.push(resourceServer);
    };

    AuthManager.prototype._authorizeResourceServers = function() {
        var promises = [];
        for (var i = 0; i < this._resourceServers.length; i++) {
            var resourceServer = this._resourceServers[i];
            var promise = resourceServer.sendGetRequest('oAuth2/LoginDialog.ashx');
            promises.push(promise);
        }
        return $.when.apply(null, promises);
    };

    // посредством серверного скрипта на клиенте меняем code
    // на информацию о пользователе и куку sync
    AuthManager.prototype._processAuthorization = function(search) {
        var deferred = $.Deferred();

        var parseQueryString = function(search) {
            var a = search.slice(1).split('&');
            var o = {};
            for (var i = 0; i < a.length; i++) {
                var s = a[i].split('=');
                o[s[0]] = s[1];
            }
            return o;
        };

        // превращаем строку с параметрами в хеш
        var params = parseQueryString(search);

        if (params.error) {
            deferred.reject({
                Status: 'auth',
                Result: null,
                Error: {
                    message: params.error
                }
            });
        } else {
            $.ajax({
                url: this._redirectEndpointAshx + search,
                dataType: 'jsonp',
                jsonp: 'CallbackName'
            }).done(function(resp) {
                if (resp.Status === 'ok') {
                    deferred.resolve({
                        Status: 'ok',
                        Result: resp.Result
                    });
                } else {
                    deferred.reject({
                        Status: resp.Status,
                        Result: null
                    });
                }
            }).fail(function() {
                deferred.reject({
                    Status: 'network',
                    Result: null,
                    Error: {
                        message: arguments[2]
                    }
                });
            });
        }

        return deferred.promise();
    };


    /** Получение информации о пользователе от AuthServer
     * @return {Function} promise(userInfo)
     */
    AuthManager.prototype.getUserInfo = function() {
        if (this._getUserInfoDeferred) {
            return this._getUserInfoDeferred.promise();
        }
        var deferred = this._getUserInfoDeferred = $.Deferred();

        function authorizationGrant(search) {
            // удаляем айфрейм и глобальную переменную
            setTimeout(function() {
                delete window.authorizationGrant;
                $('.authorizationIframe').remove();
            }, 0);

            this._processAuthorization(search).then(function(resp) {
                deferred.resolve(resp);
            }, function(err) {
                deferred.reject(err);
            })
        }

        // посылаем запросы на все сервера ресурсов
        // когда они все ответят ..
        this._authorizeResourceServers().done(function() {
            // .. формируем параметры state и scope
            var scope = '';
            var state = '';
            for (var i = 0; i < arguments.length; i++) {
                var response = arguments[i];
                scope += response.Service.ServerId + ',';
                state += response.Result.State + ',';
            }
            scope = scope.slice(0, -1);
            state = state.slice(0, -1);

            // .. и посылаем запрос на сервер авторизации
            window.authorizationGrant = authorizationGrant.bind(this);
            $('<iframe/>', {
                'src': this._userInfoEndpoint + '/?client_id=1&redirect_uri=' + this._redirectEndpointHtml + '&scope=' + scope + '&state=' + state,
                'style': 'display: block !important; position: absolute; left: -99999px;'
            }).addClass('authorizationIframe').prependTo('body');
        }.bind(this)).fail(function() {
            deferred.reject({
                Status: 'error'
            });
        });
        return deferred.promise();
    };


    /** Принудительное перелогинивание пользователя.
     * Пользователь должен увидеть поля для ввода
     * логина/пароля (возможно, на сервере авторизации).
     * При успешной авторизации библиотека должна
     * произвести авторизацию пользователя на всех
     * подключенных серверах ресурсов
     * и только после этого resolve promise
     * @return {Function} promise(userInfo)
     */
    AuthManager.prototype.login = function(arg) {
        var foreignServer;
        var iframeContainer;
        if (typeof arg === 'string') {
            // обратная совместимость
            foreignServer = arg;
        } else if (typeof arg === 'object') {
            foreignServer = arg.foreignServer;
            iframeContainer = arg.iframeContainer;
        }

        var self = this;
        this._authorizeResourceServers().done(function() {
            // .. формируем параметры state и scope
            var scope = '';
            var state = '';
            for (var i = 0; i < arguments.length; i++) {
                var response = arguments[i];
                scope += response.Service.ServerId + ',';
                state += response.Result.State + ',';
            }
            scope = scope.slice(0, -1);
            state = state.slice(0, -1);

            var authUrl = self._authorizationEndpoint + '/?client_id=1' +
                '&redirect_uri=' + self._redirectEndpointAshx2 +
                '&scope=' + scope +
                '&state=' + state;

            if (foreignServer) {
                authUrl += '&authserver=' + foreignServer;
            }

            if (!iframeContainer) {
                window.open(authUrl, '_self');
            } else {
                window.authorizationGrant = authorizationGrant;

                $('.authorizationIframe').remove();

                $('<iframe>', {
                    'src': self._authorizationEndpoint +
                        '/?client_id=1' +
                        '&redirect_uri=' + self._redirectEndpointHtml +
                        '&redirect_uri_alt=' + self._redirectEndpointAshx2 +
                        '&scope=' + scope +
                        '&state=' + state
                }).addClass('authorizationIframe').prependTo(iframeContainer);

                function authorizationGrant() {
                    window.location.reload();
                }
            }
        });
    };

    /** Залогиниться, используя логин и пароль
     * @param  {String} login
     * @param  {String} password
     * @return {Promise}
     */
    AuthManager.prototype.loginWithCredentials = function(login, password) {
        // отправляем ajax-запрос на Handler/Login с логином и паролем
        // После этого пользователь считается залогиненным на my.
        // Затем вызываем getUserInfo()

        var deferred = $.Deferred();
        var self = this;

        $.ajax({
            url: this._credentialLoginEndpoint + '?login=' + encodeURIComponent(login) + '&password=' + encodeURIComponent(password),
            dataType: "jsonp"
        }).done(function(response) {
            if (response.Status.toLowerCase() === 'ok') {
                self.getUserInfo().done(function() {
                    deferred.resolve({
                        Status: 'ok',
                        Result: arguments[0].Result
                    });
                }).fail(function() {
                    deferred.reject({
                        Status: 'error',
                        Result: {
                            Message: 'authorization error'
                        }
                    });
                });
            } else if (response.Status.toLowerCase() === 'auth') {
                deferred.reject({
                    Status: 'auth',
                    Result: {
                        Message: response.Result.Message
                    }
                })
            } else {
                deferred.reject({
                    Status: 'error',
                    Result: {
                        Message: 'unknown error'
                    }
                });
            }
        }).fail(function() {
            deferred.reject({
                Status: 'network',
                Result: {
                    Message: 'network error'
                }
            });
        })

        return deferred.promise();
    };

    /** Принудительное разлогинивание пользователя.
     * В том числе и на серверах ресурсов
     * @return {Function} promise(status)
     */
    AuthManager.prototype.logout = function() {
        var deferred = $.Deferred();
        var promises = [];
        for (var i = 0; i < this._resourceServers.length; i++) {
            var resourceServer = this._resourceServers[i];
            var promise = resourceServer.sendGetRequest('oAuth2/Logout.ashx');
            promises.push(promise);
        }
        $.when.apply(promises, this).done(function() {
            if (this._clientId === 1) {
                $.ajax({
                    url: 'http://my.kosmosnimki.ru/Handler/Logout',
                    dataType: "jsonp"
                }).done(function() {
                    deferred.resolve({
                        Status: 'ok'
                    });
                    this.trigger('logout');
                }.bind(this)).fail(function() {
                    deferred.reject({
                        Status: 'network'
                    });
                }.bind(this));
            } else {
                deferred.resolve({
                    Status: 'ok'
                });
                this.trigger('logout');
            }
        }.bind(this)).fail(function() {
            deferred.reject({
                Status: 'error'
            })
        }.bind(this));
        return deferred.promise();
    };

    return AuthManager;
})();
