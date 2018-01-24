# Ingredients API

{% method %}
## GET '/ingredients' {#view}

Get all ingredients in the `Ingredients` table, requires no parameter input.

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

{% sample lang="js" %}
```js
request.body.ingredients = [
  1,
  2,
]
```
{% endmethod %}