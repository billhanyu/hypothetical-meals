# Users API

We use an e-mail/password combination as its authentication system to uniquely identify users signing on. The passwords are hashed and salted prior to storage in the database.

Upon successful authentication, a JSON Web Token (JWT) will be returned. We expect for the JWT to be included in most API requests to the server in a header that looks like the following:

"Authorization" : "Token myJSONWebToken"

You must replace myJSONWebToken with the JSON Web Token you received from authenticating with either the "Log In" or "Sign Up" endpoints.

OAuth Users have the 'oauth' column as 1; Normal users have 0. The usernames for users are unique as long as they have the same 'oauth' value. This means you can have a normal user with username 'hy103' as well as an oauth user with username 'hy103'.

{% method %}
## POST '/users/admin' {#modifyUsers}

Post an administrator user to the `Users` table.

{% sample lang="js" %}
```js
# Request body format:
request.body.user = 'user': {
  'username': 'admin1',
  'name': 'mike krzyzewski',
  'password': 'mike mike mike',
};
```

{% endmethod %}

{% method %}
## POST '/users/noob' {#modifyUsers}

Post a noob user to the `Users` table.

{% sample lang="js" %}
```js
# Request body format:
request.body.user = 'user': {
  'username': 'noob',
  'name': 'mike wazowski',
  'password': 'mike mike mike',
};
```

{% endmethod %}

{% method %}
## POST '/users/login' {#login}

Logs the user in with username and password by returning the JSON web token.

{% sample lang="js" %}
```js
# Request body format:
request.body.user = 'user': {
  'username': 'noob',
  'password': 'mike mike mike',
};
```

{% endmethod %}

{% method %}
## POST '/users/login/oauth' {#loginOauth}

Logs the user in with OAuth method, returns the User info with .getBasicInfo().

New users are saved to the Users table with default user_group as noob. All users are returned their info as well as a token.

{% sample lang="js" %}
```js
# Request body format:
request.body.user = 'user': {
  'netid': 'hy103',
  'name': 'Bill Yu',
};
```

```js
# Response body format:
request.body.user = 'user': {
  'username': 'hy103',
  'oauth': 1,
  'name': 'Bill Yu',
  'user_group': 'noob',
  'token': {token},
};
```

{% endmethod %}

{% method %}
## POST '/users/permission' {#changePermission}

Changes a user's permission level, **requires admin permission level**.

Note that for the input object, 'oauth' field needs to be 0 or 1.

{% sample lang="js" %}
```js
# Request body format:
request.body.user = 'user': {
  'username': 'hy103',
  'oauth': 1,
  'permissoin': 'admin',
};
```

{% endmethod %}
