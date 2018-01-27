# Users API

We use an e-mail/password combination as its authentication system to uniquely identify users signing on. The passwords are hashed and salted prior to storage in the database.

Upon successful authentication, a JSON Web Token (JWT) will be returned. We expect for the JWT to be included in most API requests to the server in a header that looks like the following:

"Authorization" : "Token myJSONWebToken"

You must replace myJSONWebToken with the JSON Web Token you received from authenticating with either the "Log In" or "Sign Up" endpoints.

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
