# AuthManager

Компонент, предназначеный для авторизации пользователя, а также для осуществления запросов к серверам ресурсов, поддерживающих авторизацию с `anti-csrf токенами`.

Как правило, используется вместе с `AuthController`, однако может работать и без него.

## namespace nsGmx.Auth

Включает в себя классы `AuthManager`, `Server`, `ResourceServer` (которые, как правило, не используются напрямую), а также методы `getAuthManager()` и `getResourceServer()`.

### Методы

- `<AuthManager>getAuthManager()` - получить экземпляр класса `AuthManager` с настройками по умолчанию (сервер авторизации my.kosmosnimki.ru и стандартная серверная часть клиента).
- `<ResourceServer>getResourceServer(id)` - получить один из предопределённых экземпляров класса `ResourceServer` сервера ресурсов (какой именно определяется идентификатором `id`)

### Список стандартных серверов ресурсов

|id             |url                                |
|---------------|-----------------------------------|
|geocode        |http://geocode.kosmosnimki.ru      |
|geomixer       |http://maps.kosmosnimki.ru         |
|geomixer2      |http://maps2.kosmosnimki.ru        |
|subscriptions  |http://fires.kosmosnimki.ru/SAPIv2 |

При вызове метода getResourceServer() происходит lazy instantiation соответствующего сервера ресурсов и он неявно добавляется в создаваемый по умолчанию экземпляр `AuthManager` (см. `getAuthManager()`).

**Инициализируйте все сервера ресурсов до выполнения процедур авторизации**

```
var authManager = nsGmx.Auth.getAuthManager();
var mapsResourceServer = nsGmx.getResourceServer('geomixer2');
```

## Класс ResourceServer

Предназначен для представления одного сервера ресурсов. Позволяет отправлять на него `post` и `get` -запросы.

**При использовании менеджера авторизации все запросы на конкретный сервер ресурсов должны проходить посредством вызова методов экземпляра класса ResourceServer, относящегося к нему.**

При создании сервера ресурсов, ему передаётся экземпляр класса `AuthManager`, в который он добавляет себя. Таким образом `AuthManager` управляет всеми серверами ресурсов при процедурах авториции.

### Интерфейс вызова

Конструктор принимает два параметра: экземпляр класса `AuthManager` и хеш с настройками, имеющим следующие ключи:

- `<String>id` - уникальный идентификатор сервера ресурсов
- `<String>root` - url сервера ресурсов. Все запросы будут отправляться относительно него. Тут нужно указывать абсолютный путьбез слеша на конце. Напрмиер, `http://maps.kosmosnimki.ru`.

### Методы

- `<jQuery Promise>sendGetRequest(<String>url, <Object>params)` - отправить `get`-запрос на адрес `url` с параметрами `params`. В качестве `url` указывается путь без `root`.
- `<jQuery Promise>sendPostRequest(<String>url, <Object>params)` - отправить `post`-запрос на адрес `url` с параметрами `params`. В качестве `url` указывается путь без `root`.
- `<jQuery Promise>sendImageRequest(<String>url, <Object>params)` - отправить запрос за картинкой с параметрами `params`. В качестве `url` указывается путь без `root`. Сама картинка возвращается в поле Result ответа.


### Пример использования

```javascript
var rs = new nsGmx.Auth.ResourceServer(authManager, {
    id: 'maps',
    root: 'http://maps.kosmosnimki.ru' 
});

rs.sendGetRequest('TinyReference/Get.ashx', {
    id: permalinkId
}).then(function(response) {
    console.log('permalink data:', response.Result);
}).fail(function(response) {
    console.log('an error occured:', response.ErrorInfo)
});
```

## Класс AuthManager

Предназначен для авторизации пользователя на сервере авторизации и серверах ресурсов.

### Интерфейс вызова

Конструктор принимает хеш со следующими ключами:

- `<String>authorizationEndpoint` - url сервера авторизации
- `<String>redirectEndpointHtml` - url страницы, получающей данные с редиректа
- `<String>redirectEndpointAshx` - url серверной части клиента
- `<String>credentialLoginEndpoint` - url для аутентификации по логину и паролю

### Методы

- `<jQuery Promise>getUserInfo()` - получить статус авторизации пользователя
- `login(<String>foreignServer)` - вызвать окно авторизации. Авторизация может проходить через сторонний сервер `foreignServer`, если он указан. (например google)
- `<jQuery Promise>loginWithCredentials(<String>login, <String>password)` - залогиниться, используя логин и пароль
- `<jQuery Promise>logout()` - разлогиниться

В коллбек промиса передаётся ответ в формате `ServerResponse`, описанном ниже.

### Пример использования

```javascript
var authManager = nsGmx.Auth.getAuthManager();

authManager.getUserInfo().then(function(response) {
    console.log('Success!', response.Result.Login);
}).fail(function(response) {
    console.log('auth failed')
});

authManager.logout();
```

## Формат ServerResponse

- ServerResponse - это тип даных, описывающий возможные варианты ответа сервера.
- ServerResponse всегда содержит строковое поле `Status`, которое может принимать принимать произвольное значение. Запрос считается завершённым успешно, если это значение равно `ok`. Во всех остальных случаях оно принимается за код ошибки.
- ServerResponse может содержать поле Result, имеющее произвольный формат.
- В случае если запрос завершился успешно, поле Result, несёт полезную нагрузку.
- Если запрос завершился с ошибкой, поле Result описывает детали ошибки.
- Все запросы осуществляются посредством jsonp.

Пример успешного запроса:

```
{
    "Status": "ok",
    "Result": {
        "email": "schmidt@yandex.ru",
        "availableSubscriptions": 11
    }
}
```

Пример запроса с ошибкой:

```
{
    "Status": "auth",
    "Result": {
        "Message": "Пользователь не авторизован."
    }
}
```

## Алгоритм авторизации

### Загрузка приложения (getUserInfo)

1. Оправляем запрос на каждый из серверов ресурсов (oAuth2/LoginDialog.ashx). В ответ получаем state и куку sid.
2. После того, как ответили все сервера ресурсов, формируем параметры scope и state
 - state = 'state1,state2,...,stateN'
 - scope = 'serverId1,serverId2,...,serverIdN'
3. Отправляем запрос на my.kosmosnimki.ru путём загрузки страницы oAuth/LoginDialog в iframe с ранее полученными параметрами `scope` и `state`, а также `client_id` и `redirect_uri`
4. my.kosmosnimki.ru редиректит нас на oAuthCallback.htm, который вызывает метод родительского окна `authorizationGrant` с параметром `search`, представляющим из себя строку запроса с параметрами от сервера авторизации

## Принципы работы компонента

- Любая из функций, осуществляющих запрос (напрямую или косвенно) к какому-либо серверу возвращает promise.
- Вне зависимости от результата в обработчик всегда приходит объект типа ServerResponse
- Promise завершается корректно (resolve), только если в serverResponse поле Status имеет значение 'ok'.
- Promise завершается некорректно (reject), если поле Status !== 'ok', а также в случаях ошибки запроса и других.

