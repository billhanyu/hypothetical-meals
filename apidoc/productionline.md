# Production Line

{% method %}
## GET '/productionline'

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
    formulas: [ '{cake=formula_id=1}', '{shit=formula_id=2}' ] 
  }
]
```
{% endmethod %}

{% method %}
## GET '/productionline/:id'

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
    formulas: [ '{cake=formula_id=1}', '{shit=formula_id=2}' ] 
  }
]
```
{% endmethod %}

{% method %}
## GET '/productionline/:id'

Get all producton lines along with current occupancies and formulas.
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
