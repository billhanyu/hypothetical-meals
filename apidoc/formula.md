# Formulas API

{% method %}
## GET '/formulas'

Gets formula information including formula entries for each formula.

Returns

{% sample lang="js" %}
```js
res.body: [{
  'id': 'myId',
  'name': 'myName',
  'description': 'myDescription',
  'num_product': 1
  'ingredients': {
    'ingredient1': {
      'ingredient_id': 1,
      'num_native_units': 1,
      'native_unit': kg,
    }
    ...
  },
  ...
]
```
{% endmethod %}

{% method %}
## POST '/formulas'

This adds formulas to the database.

{% sample lang="js" %}
```js
'formulas': [
                {
                    'name': 'blob',
                    'description': 'A blob',
                    'num_product': 1,
                    'ingredients': [
                        {
                            'ingredient_id': 1,
                            'num_native_units': 2,
                        },
                    ],
                },
                {
                    'name': 'Bill',
                    'description': 'Fried up Bill',
                    'num_product': 1,
                    'ingredients': [
                        {
                            'ingredient_id': 1,
                            'num_native_units': 10,
                        },
                        {
                            'ingredient_id': 2,
                            'num_native_units': 2,
                        },
                    ],
                },
            ]
```


{% endmethod %}
