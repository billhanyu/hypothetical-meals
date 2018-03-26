# Order API

{% method %}
## Post '/order'

This check inventory capacities, update inventory capacities/stock, and adds to logs and spending logs.

{% sample lang="js" %}
```js
request.body = {
  '1': {
    num_packages: 2, 
    lots: { 
        'abc123': 1, 
        '03859': 1,
    } 
  },
  '3': {
    num_packages: 1,
    lots: { 
        qbd910: 1, 
    }, 
  },
}
# The keys are the vendor ingredient id. Values for lots is the lot number and number of packages for that lot. Number of packages in each lot summed together need to equal num_packages specified.
```

{% endmethod %}