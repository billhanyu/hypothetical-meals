# Ingredients API

{% method %}
## GET '/ingredients/pages' {#pages}

Get the number of pages in the `Ingredients` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/ingredients/:id' {#getWithId}

Get an ingredient with its id.

Return parameters:
everything in Ingredients table and storage_name, storage_capacity.

{% endmethod %}

{% method %}
## GET '/ingredients' {#viewAll}

Get all ingredients, regardless of deleted or not.

{% endmethod %}

{% method %}
## GET '/ingredients/page/:page_num' {#view}

Get all ingredients in the `Ingredients` table, requires no parameter input.

Return parameters:
All columns in Ingredients table AND
- Storages.name as storage_name
- Storages.capacity as storage_capacity

{% endmethod %}

{% method %}
## GET '/ingredients-available/page/:page_num' {#view}

Get all available ingredients in the `Ingredients` table for order etc (where removed == 0).

Requires no parameter input.

Return parameters:
All columns in Ingredients table AND
- Storages.name as storage_name
- Storages.capacity as storage_capacity

{% endmethod %}

{% method %}
## POST '/ingredients' {#addIngredient}

Add ingredients.

{% sample lang="js" %}
```js
# Request body format:
request.body.ingredients = [
  {
    'name': 'ingredient1_name',
    'storage_id': 1,
    'native_unit': 'lbs',
    'num_native_units': 1.1,
    'package_type': 'pail',
  },
  {
    'name': 'other_name',
    'storage_id': 2,
    'native_unit': 'lbs',
    'num_native_units': 1.1,
    'package_type': 'pail',
  },
];
```

{% endmethod %}

{% method %}
## PUT '/ingredients'

Modify ingredients to change the name, storage id, package_type or native_unit.

**Need to send the full objects with changed fields.**

{% sample lang="js" %}
```js
request.body.ingredients = {
  'id1': {
    'name': 'ingredient1_name',
    'storage_id': 1,
    'native_unit': 'lbs',
    'package_type': 'pail',
    'num_native_units': 1.1,
  },
  'id2': {
    'name': 'other_name',
    'storage_id': 2,
    'native_unit': 'lbs',
    'num_native_units': 1.1,
    'package_type': 'pail',
  },
}
```
{% endmethod %}

{% method %}
## DELETE '/ingredients's

Delete ingredients.

This is a "fake delete" action where the api sets the 'removed' column to 1.

As a result the get '/ingredients-available' api does not return the ingredients deleted here.

Also fake deletes the corresponding VendorsIngredients.

{% sample lang="js" %}
```js
request.body.ingredients = [
  1,
  2,
]
```
{% endmethod %}