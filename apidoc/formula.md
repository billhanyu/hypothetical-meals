# Formulas API

{% method %}
## GET '/formulas'

Gets formula information including formula entries for each formula.
Everyone can view.

Returns

{% sample lang="js" %}
```js
res.body: [{
  'id': 'myId',
  'name': 'myName',
  'description': 'myDescription',
  'num_product': 1
  'ingredients': {
    'ingredient1_name': {
        'id': 3,
        'ingredient_id': 2,
        'num_native_units': 1,
        'formula_id': 1,
        'name': 'boop',
        'storage_id': 1,
        'package_type': 'pai',
        'native_unit': 'kg',
        'removed': 0,
    }
    ...
  },
  ...
]

Note the id within the ingredient name refers to the id in formulaEntries table.
```
{% endmethod %}

{% method %}
## POST '/formulas'

This adds formulas to the database. Only admins can add.

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

{% method %}
## PUT '/formulas'

Modifies formulas. Request must contain for each formula every formula entry (every single ingredient id and number of native unit pairing). Ids are required, all other formula parameters such as name, description, and num_product are optional.

```js
'formulas': [
                {
                    'id': 1,
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
                    'id': 3,
                    'name': 'foo',
                    'description': 'bar',
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