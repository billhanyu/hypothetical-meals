# Profitability Report API

{% method %}
## GET '/profitability'

This does the following calculations using product runs and sales table.
- the number of units sold 
- average per-unit wholesale price
- the wholesale revenue (units sold∗average wholesale price)
- total ingredient cost (similar to the production report)
- total profit (revenue − cost)
- per-unit profit (total prof it/units sold)
- profit margin (revenue/cost as a percentage)

{% sample lang="js" %}
```js
res.body = [ { formula_id: 1,
    formula_name: 'cake',
    total_ingredient_cost: 100.9,
    units_sold: 6,
    average_wholesale_price: 0.3333333333333333,
    wholesale_revenue: 2,
    total_profit: -98.9,
    unit_profit: -16.483333333333334,
    profit_margin: 0.019821605550049554 } ]
```

{% endmethod %}