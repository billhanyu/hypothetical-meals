# Production Line

{% method %}
## GET '/productionlines'

Get all producton lines along with current occupancies and formulas.
{% sample lang="js" %}
```js
response.body = [
  { 
    id: 1,
    name: 'line1',
    description: 'first line',
    isactive: 'Y',
    occupancies: [ {
      { id: 1, // ProductionlineOccupancies id
        productionline_id: 1,
        productrun_id: 1,
        formula_id: 1,
        start_time: '2018-04-12T03:02:46.000Z',
        end_time: null,
        busy: 1 }
    } ],
    formulas: [
      {
        name: 'cake',
        formula_id: '1'
      },
      { name: 'shit',
        formula_id: '2'
      },
    ], 
  }
]
```
{% endmethod %}

{% method %}
## GET '/productionlines/id/:id'

Get all producton lines along with current occupancies and formulas for an id.
{% sample lang="js" %}
```js
response.body = [
  { 
    id: 1,
    name: 'line1',
    description: 'first line',
    isactive: 'Y',
    occupancies: [ {
      { id: 1, // ProductionlineOccupancies id
        productionline_id: 1,
        productrun_id: 1,
        formula_id: 1,
        start_time: '2018-04-12T03:02:46.000Z',
        end_time: null,
        busy: 1 }
    } ],
    formulas: [ {
        name: 'cake',
        formula_id: '1'
      }, ] 
  }
]
```
{% endmethod %}

{% method %}
## POST '/productionlines'

Adds a production line. Formulas can be empty array, but key must exist.
{% sample lang="js" %}
```js
req.body: {
  'lines': [{
    'name': 'bleb',
    'description': 'something',
    'formulas': [1],
  }],
}
```

{% endmethod %}

{% method %}
## POST '/formulaproductionlines'

Adds a formula to production line mapping.
{% sample lang="js" %}
```js
req.body: {
  'lineid': 1, // production line id
  'formulaid': 2, // formula id
}
```

{% endmethod %}

{% method %}
## DELETE '/formulaproductionlines'

Removes a formula to production line mapping.
{% sample lang="js" %}
```js
req.body: {
  'lineid': 1, // production line id
  'formulaid': 2, // formula id
}
```

{% endmethod %}

{% method %}
## PUT '/productionlines'

Modifies a produciton line. Formulas is necessary, all current formula to production line mappings must be passed. Id is mandatory.
{% sample lang="js" %}
```js
req.body: {
  'lines': [{
    'id': 1, // production line id
    'name': 'bleb',
    'description': 'something',
    'formulas': [1], // array of formulas that are mapped to that production line
  }],
}
```

{% endmethod %}

{% method %}
## DELETE '/productionlines'

Removes production lines. Will delete all formula production line mappings for that line. Will return error if production line is busy.
{% sample lang="js" %}
```js
req.body: {
  'lines': [1, 2, 3...], // array of production lines to delete
}
```

{% endmethod %}