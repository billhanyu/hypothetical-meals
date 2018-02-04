# Logs API

{% method %}
## GET '/logs/pages' {#pages}

Get the number of pages in the `Logs` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/logs/page/:page_num'

Get all of the ordering logs.

No parameter required.

Return parameters:
All columns in Logs table AND
- Users.username as user_username

{% endmethod %}

{% method %}
## GET '/logs/ingredients/page/:page_num'

Get logs for ingredient(s).

{% sample lang="js" %}
```js
request.body.vendor_ingredient_ids = [
  1, 2, 3
];
```

Return parameters:
All columns in Logs table AND
- Users.username as user_username

{% endmethod %}
