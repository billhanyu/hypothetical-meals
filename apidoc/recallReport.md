# Recall Report API

{% method %}
## Get '/recall'

This check inventory capacities, update inventory capacities/stock, and adds to logs and spending logs.

{% sample lang="js" %}
```js
request.body = {
  {
    'recall': {
      'ingredient_id': 1,
      'lot': 'aaa',
  },
}

returns
[ { id: 3,
    formula_id: 4,
    num_product: 6,
    user_id: 3,
    lot: 'def123',
    created_at: '2018-03-26T22:21:31.000Z',
    name: 'booploop final shit',
    entries: [ {
    { id: 5,
      productrun_id: 3,
      ingredient_id: 6,
      vendor_id: 3,
      num_native_units: 2,
      lot: 'abc123' },
    { id: 6,
      productrun_id: 3,
      ingredient_id: 1,
      vendor_id: 3,
      num_native_units: 2,
      lot: 'aaa' }
    } ] 
  } 
]
```

{% endmethod %}