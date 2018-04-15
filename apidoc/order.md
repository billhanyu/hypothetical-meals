# Order API

{% method %}
## GET '/order/pending'

This retrieves all orders with ingredients that haven't arrived yet. Only returns ingredients that have not arrived.

{% sample lang="js" %}
```js
{ '1':
   [ { id: 5, // INVENTORY ID
       ingredient_id: 3,
       ingredient_name: 'something',
       num_packages: 20,
       lot: 'ff',
       vendor_id: 1,
       per_package_cost: 5.1,
       order_id: 1,
       arrived: 0,
       order_start_time: '2018-04-13T19:24:50.000Z' },
     { id: 7, // INVENTORY ID
       ingredient_id: 1,
       num_packages: 2,
       lot: 'PENDING',
       vendor_id: 1,
       vendor_name: 'something',
       per_package_cost: 10,
       order_id: 1,
       arrived: 0,
       order_start_time: '2018-04-13T19:24:50.000Z' } ],
  '2':
   [ { id: 6, // INVENTORY ID
       ingredient_id: 4,
       num_packages: 20,
       lot: 'ff',
       vendor_id: 2,
       per_package_cost: 6.1,
       order_id: 2,
       arrived: 0,
       order_start_time: '2018-04-13T19:24:50.000Z' } ] }

Keys are order ids, values are an array. **Ids within values are inventory ids**.
```

{% endmethod %}

{% method %}
## GET '/order/pending'

This retrieves all orders with ingredients that haven't arrived yet. Only returns ingredients that have not arrived.

{% sample lang="js" %}
```js
{ '1':
   [ { id: 5, // INVENTORY ID
       ingredient_id: 3,
       num_packages: 20,
       lot: 'ff',
       vendor_id: 1,
       per_package_cost: 5.1,
       order_id: 1,
       arrived: 1,
       created_at: '2018-04-13T19:51:03.000Z', // TIME FROM INVENTORY ARRIVAL
       order_start_time: '2018-04-13T19:51:03.000Z' // TIME ORDER CREATED} 
    ],
  '2':
   [ { id: 6, // INVENTORY ID
       ingredient_id: 4,
       num_packages: 20,
       lot: 'ff',
       vendor_id: 2,
       per_package_cost: 6.1,
       order_id: 2,
       arrived: 1,
       created_at: '2018-04-13T19:51:03.000Z', // TIME FROM INVENTORY ARRIVAL
       order_start_time: '2018-04-13T19:51:03.000Z' // TIME ORDER CREATED 
      } 
    ] 
  }

Keys are order ids, values are an array. **Ids within values are inventory ids**.  Things to note, the created_at time reflects the arrival time ingredient (when ingredient is marked as arrived) when arrived = 1. If arrived = 0, this value has no meaning. Order start time is the time when the order was initiated.
```

{% endmethod %}

{% method %}
## POST '/order'
For starting an order. 
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

{% method %}
## PUT '/order'
For marking an order ingredient as having arrived. Must also set lots for that ingredients. Sets the arrived bit in inventory to 1 and sets a new created_at time for inventory to be the time ingredient is marked as having arrived. Deletes old pending entry in inventory table.

{% sample lang="js" %}
```js
req.body = 
{ 'ingredients': 
  [
    {
      'inventory_id': 1,
        'lots': {
          '1849abc': 1,
          '18a82b': 1,
        },
    },
  ],
}
```

{% endmethod %}