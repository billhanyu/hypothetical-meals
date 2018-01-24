# Inventories API

{% method %}
## GET '/inventory'

Get all inventory ingredients.

Requires no parameter input.
{% endmethod %}

{% method %}
## PUT '/inventory/admin'

Admin only - modify the quantities of ingredients in the inventory.

{% sample lang="js" %}
```js
request.body.changes = {
  '1': 100,
  '2': 200,
};
# This changes the quantity of ingredient 1 to 100 and ingredient 2 to 200.
```
{% endmethod %}

{% method %}
## PUT '/inventory'

Commits the cart for user.

{% sample lang="js" %}
```js
request.body.cart = {
  '1': 100,
  '2': 200,
};
# This requests 100 of ingredient 1 and 200 of ingredient 2 from the inventory.
```
{% endmethod %}