# Production Run

{% method %}
## GET '/sales/all'

Get all sales.
{% sample lang="js" %}
```js
response.body = [
  {
    id,
    formula_id,
    num_product,
    user_id,
    lot,
    created_at,
    ingredients: [
      {
        id,
        productrun_id,
        ingredient_name,
        vendor_id,
        lot
      },
    ],
  };
]
```
{% endmethod %}

{% method %}
## POST '/sales'

Create a new sale.
{% sample lang="js" %}
```js
request.body.products = [
  {
    formula_id = 1
    num_packages = 15
    sell_price_per_product = 100
  }, ...
]
```
{% endmethod %}