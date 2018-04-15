# Efficiency Report API

{% method %}
## GET '/efficiency'

This gives the line occupancies within the time period as well as the total time and total lines created during this time. Time is in milliseconds. To date does not have to be given. If to date is not given, the to date will be the "current time".

{% sample lang="js" %}
```js
// /efficiency?from_date=2018-01-01&to_date=2018-01-05

req.query.from_date = '2018-04-14'
req.query.to_date = '2018-04-15'

res.body = { occupancies:
   [ { id: 2, // PRODUCTION LINES OCCUPANCIES ID
       productionline_id: 2,
       productrun_id: 3,
       formula_id: 4,
       start_time: '2018-01-02T05:00:00.000Z',
       end_time: '2018-01-11T04:11:02.000Z' } ],
  total_time: 345599000, // MILLISECONDS
  total_lines: 1 }
```

{% endmethod %}