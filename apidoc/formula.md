# Formulas API

{% method %}
## GET '/formulas/pages' {#pages}

Get the number of pages in the `Formula` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/formulas/page/:page_num' {#view}

Gets same things that formulas gets without pages. Limited to amount per page.

{% endmethod %}


{% method %}
## GET '/formulas' {#viewAll}

Gets formula information including formula entries for each formula.
Everyone can view.

Returns

{% sample lang="js" %}
```js
res.body: [{
  'id': 'myId',
  'name': 'myName',
  'intermediate': {
      data: [0],
  },
  'description': 'myDescription',
  'num_product': 1,
  'removed': {
      data: [0],
  },
  'ingredients': {
    'ingredient1_name': {
        'id': 3,
        'ingredient_id': 2,
        'num_native_units': 1,
        'formula_id': 3,
        'name': 'boop',
        'package_type': 'blah',
        'storage_id': 1,
        'package_type': 'pail',
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
                    'intermediate': 1,
                    'ingredient_name': 'blob',
                    'package_type': 'pail',
                    'storage_id': 1,
                    'native_unit': 'kg',
                    'num_native_units': 10,
                    'ingredients': [
                        {
                            'ingredient_id': 1,
                            'num_native_units': 2,
                        },
                    ],
                    'lines': [1, 2,..],
                },
                {
                    'name': 'Bill',
                    'description': 'Fried up Bill',
                    'num_product': 1,
                    'intermediate': 0,
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
                    'lines': [1, 2,..],
                },
            ]
```
All formulas should specify whether or not it's an intermediate. Ingredient_name, package_type, storage_id, num_native_units, native_unit are not required and not used for formulas without an intermediate.


{% endmethod %}

{% method %}
## PUT '/formulas'

Modifies formulas. Request must contain for each formula every formula entry (every single ingredient id and number of native unit pairing). Ids are required, all other formula parameters such as name, description, and num_product are optional. For intermediate product formulas, the intermediate must be specified as 1 and any updates for ingredient fields should be in intermediate_properties. You can not change an final formula to intermediate and vice versa.

```js
'formulas': [
                {
                    'id': 1, // formula id
                    'name': 'blob',
                    'description': 'A blob',
                    'num_product': 1,
                    'intermediate': 1, // must inculde if modifying intermediate properties
                    'intermediate_properties': {
                        'id': 10, // corresponds with ingredient_id...mandatory if editing intermediates
                        'package_type': 'sack',
                    },
                    'ingredients': [
                        {
                            'ingredient_id': 1,
                            'num_native_units': 2,
                        },
                    ],
                    'lines': [1, 2,..],
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
                    'lines': [1, 2,..],
                },
            ]
```

{% endmethod %}

{% method %}
## DELETE '/formulas'

Deletes formulas with id given in array.

{% sample lang="js" %}
```js
'formulas': [1, 2, ...]
```

{% endmethod %}
