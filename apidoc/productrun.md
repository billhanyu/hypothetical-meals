# Production Run

{% method %}
## GET '/productrun'

Get all producton histories.
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
