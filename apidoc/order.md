# Order API

{% method %}
## Post '/order'

This check inventory capacities, update inventory capacities/stock, and adds to logs and spending logs.

{% sample lang="js" %}
```js
request.body = {
  '1': 1,
  '2': 3,
}
# The keys are the vendor ingredient id and the values are number of packages being ordered.
```

{% endmethod %}