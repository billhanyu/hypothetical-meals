# VendorIngredients API

{% method %}
## GET '/vendoringredients/pages' {#pages}

Get the number of pages in the `VendorsIngredients` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/vendoringredients/page/:page_num'

Get all vendorsingredients.

No parameter required.

Return parameters:
All columns in VendorsIngredients table AND
- Vendors.name as vendor_name
- Vendors.contact as vendor_contact
- Vendors.code as vendor_code
- Vendors.removed as vendor_removed
- Ingredients.name as ingredient_name
- Ingredients.storage_id as ingredient_storage_id
- Ingredients.removed as ingredient_removed

{% endmethod %}

{% method %}
## GET '/vendoringredients-available/page/:page_num'

Get all available vendorsingredients (removed = 0).

No parameter required.
{% endmethod %}

{% method %}
## GET '/vendoringredients/:ingredient_id'

Get all available vendorsingredients that have the `ingredient_id`.

Note that this returns available stuff, so everything with removed as 1 will not be returned.

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

This is a "fake delete" action where the api sets the 'removed' column to 1.

As a result the get '/vendoringredients/:ingredient_id' api does not return what are deleted here.

{% sample lang="js" %}
```js
request.body.ids = [
  1, 2
];
```
{% endmethod %}