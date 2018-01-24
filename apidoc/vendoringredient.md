# VendorIngredients API
{% method %}
## GET '/vendoringredients/:ingredient_id'

Get all vendorsingredients that have the `ingredient_id`.

No parameter required.
{% endmethod %}

{% method %}
## POST '/vendoringredients'

Add vendorsingredients.

When there is already a row in the database with the same ingredient_id, vendor_id and package_type, the whole request fails with a status code 400.

If you want to modify the price, use the modify `PUT` API instead.

{% sample lang="js" %}
```js
request.body.vendoringredients = [
  {
    'ingredient_id': 1,
    'vendor_id': 1,
    'package_type': 'sack',
    'price': 100,
  },
  {
    'ingredient_id': 2,
    'vendor_id': 2,
    'package_type': 'truckload',
    'price': 200,
  },
];
```
{% endmethod %}

{% method %}
## PUT '/vendoringredients'

Modify the price or package type of multiple vendoringredients.

you can modify either the price or the package type, or both, but make sure every object in the array modifies at least one of them.

{% sample lang="js" %}
```js
request.body.vendoringredients = {
  '1': {
    'price': 100,
    'package_type': 'truckload',
  },
  '2': {
    'package_type': 'sack'
  },
};
```
{% endmethod %}

{% method %}
# DELETE '/vendoringredients'

Delete multiple vendoringredients.

{% sample lang="js" %}
```js
request.body.ids = [
  1, 2
];
```
{% endmethod %}