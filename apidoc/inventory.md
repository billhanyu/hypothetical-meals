# Inventories API

{% method %}
## GET '/inventory/pages' {#pages}

Get the number of pages in the `Inventory` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/inventory/page/:page_num'

Get all inventory ingredients.

Requires no parameter input.

Return parameters:
All columns in Inventories table AND
- Ingredients.name as ingredient_name
- Ingredients.storage_id as ingredient_storage_id
- Ingredients.removed as ingredient_removed

{% endmethod %}

{% method %}
## GET '/inventory/stock'

Get in stock quantity in the inventory for selective ingredients.

{% sample lang="js" %}
```js
request.body.ids = [1, 2, 4]; // ingredients with id 1 and 2
```

{% sample lang="js" %}
```js
response.body = {
  1: {
    Inventories.*,
    Ingredients.name as ingredient_name, Ingredients.package_type as ingredient_package_type, Ingredients.storage_id as ingredient_storage_id, Ingredients.removed as ingredient_removed
  },
  2: {
    ...
  } // ingredient 4 not in inventory then there is no value with 4 as key
};
```

{% endmethod %}

{% method %}
## GET '/inventory/lot/:ingredient_id'

Get the lot numbers and corresponding quantites of an ingredient with its id.

{% sample lang="js" %}
```js
GET '/inventory/lot/1'
```

{% sample lang="js" %}
```js
response.body = {
  1: {
    Inventories.*,
    Ingredients.name as ingredient_name, Ingredients.package_type as ingredient_package_type, Ingredients.storage_id as ingredient_storage_id, Ingredients.removed as ingredient_removed
  },
  2: {
    ...
  } // ingredient 4 not in inventory then there is no value with 4 as key
};
```

{% endmethod %}

{% method %}
## PUT '/inventory/admin'

Admin only - modify the quantities of ingredients in the inventory.

** The keys in the input object are the inventory ids, not the ingredient ids. **

{% sample lang="js" %}
```js
request.body.changes = {
  '1': 100,
  '2': 200,
};
# This changes the quantity of inventory item 1 to 100 and inventory item 2 to 200.
```
{% endmethod %}

{% method %}
## PUT '/inventory'

Commits the cart for user.

** The keys in the input object are the inventory ids, not the ingredient ids. **

{% sample lang="js" %}
```js
request.body = {
  "formula_id": 3,
  "num_products": 10,
  "productionline_id": 1
}
```
{% endmethod %}

{% method %}
## GET '/inventory/final' {#allFinal}

Gets all final product inventory items.

response.body = [
  {
    id: 1,
    name: 'cake',
	  productrun_id: 1,
	  formula_id: 21,
	  num_packages 123,
	  created_at: timestamp,
  },...
]

{% endmethod %}