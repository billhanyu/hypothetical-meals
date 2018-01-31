# Ingredients API

{% method %}
## GET '/ingredients' {#view}

Get all ingredients in the `Ingredients` table, requires no parameter input.

{% endmethod %}

{% method %}
## GET '/ingredients-available' {#view}

Get all available ingredients in the `Ingredients` table for order etc (where removed == 0).

Requires no parameter input.

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
  },
  {
    'name': 'other_name',
    'storage_id': 2,
  },
];
```

{% endmethod %}

{% method %}
## PUT '/ingredients'

Modify ingredients.

{% sample lang="js" %}
```js
request.body.ingredients = {
  'ingredient_id1': storage_id_change1,
  'ingredient_id2': storage_id_change2,
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