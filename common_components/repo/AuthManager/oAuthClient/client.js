var rsSubscriptions = nsGmx.Auth.getResourceServer('subscriptions');
var rsGeomixer2 = nsGmx.Auth.getResourceServer('geomixer');
var rsGeocode = nsGmx.Auth.getResourceServer('geocode');
var authManager = nsGmx.Auth.getAuthManager();

var log = function(message) {
    var container = $('.console');
    var msg = $('<td>');
    if (typeof message === 'string') {
        msg.html(message);
    } else {
        msg.html(message.toString());
    }
    var tr = $('<tr>').append(msg);
    container.prepend(tr);
    console.log(message);
};

var updateButtons = function(response) {
    if (!response) {
        $('.login').hide();
        $('.logout').hide();
    } else if (response && response.Status === 'auth' || !(response.Result && response.Result.Login)) {
        $('.login').show();
        $('.logout').hide();
        $('.userInfo').html('not authorized');
    } else if (response && response.Status === 'ok' && response.Result && response.Result.Login) {
        $('.login').hide();
        $('.logout').show();
        $('.userInfo').html(response.Result.Login);
    } else {
        $('.login').hide();
        $('.logout').hide();
    }
};

$(document).ready(function() {
    updateButtons();
    $('.container').hide();
    $('.message').html('loading');

    authManager.getUserInfo().then(function(response) {
        $('.container').show();
        $('.sys-message').html('');
        $('.alert').hide();
        updateButtons(response);
        init();
        log('status: ' + response.Status + ' user: ' + response.Result.Login);
    }).fail(function(response) {
        $('.sys-message').html('fatal error');
    });
});

var init = function() {
    $('.btn-userInfo').click(function(e) {
        e.preventDefault();
        authManager.getUserInfo().then(function(response) {
            updateButtons(response);
            log('status: ' + response.Status + ' user: ' + response.Result.Login);
        }).fail(function(response) {
            log('status: ' + response.Status);
        });
    });

    $('.btn-logout').click(function(e) {
        authManager.logout().then(function(response) {
            log('logged out');
            updateButtons(response);
        }).fail(function() {
            log('logout failed');
        })
    });

    $('.btn-loginGoogle').click(function(e) {
        authManager.login('google');
    });

    $('.btn-loginOAuth').click(function(e) {
        authManager.login();
    });

    $('.btn-loginCredentials').click(function(e) {
        authManager.loginWithCredentials(
            $('.login-loginText').val(), 
            $('.login-passwordText').val()
        ).then(function(response) {
            updateButtons(response);
            $('.alert-auth').hide();
            console.log(response);
            log('logged in with credentials. ' + response.Result.Login);
        }).fail(function(response) {
            updateButtons(response);
            $('.alert-auth').show();
            $('.alert-auth').html(response.Result.Message);
        });
    });

    $('.btn-geocode').click(function(e) {
        rsGeocode.sendGetRequest('oAuth/GeoSearch.ashx', {Format: 'jsonp', searchString: 'город Москва', limit: 10, UseOSM: 1, IsStrongSearch: 1}).then(function(response) {
            log('GEOCODE: ' + response.Result[0].ObjName);
        }).fail(function() {
            log('GEOCODE: error');
        });
    });

    $('.btn-fires').click(function(e) {
        rsSubscriptions.sendGetRequest('Account/Get.ashx').then(function(response) {
            log('FIRES: ' + response.Result.Email);
        }).fail(function() {
            log('GEOCODE: error');
        });
    });

    $('.btn-maps').click(function(e) {
        rsGeomixer2.sendGetRequest('User/GetUserInfo.ashx').then(function(response) {
            log('MAPS: ' + '{Folder: ' + response.Result.Folder + ', Nickname:' + response.Result.Nickname + '}');
        }).fail(function() {
            log('MAPS: error');
        });
    });
    
    $('.btn-maps-post').click(function(e) {
        rsGeomixer2.sendPostRequest('Layer/GetLayerInfo.ashx', {NeedAttrValues: false, LayerName: 'D39951C4D4644DB9B48AFC8D2B31D9A7'}).then(function(response) {
            log('MAPS POST: ' + JSON.stringify(response.Result));
        }).fail(function() {
            log('MAPS POST: error');
        });
    });
};