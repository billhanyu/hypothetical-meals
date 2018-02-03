# Spendinglogs API

{% method %}
## GET '/spendinglogs/pages' {#pages}

Get the number of pages in the `SpendingLogs` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/spendinglogs/page/:page_num'

Get all of the spendinglogs.

No parameter required.

Return parameters:
All columns in SpendingLogs table AND
- Ingredients.name AS ingredient_name
- Ingredients.removed AS ingredient_removed

{% endmethod %}

{% method %}
## GET '/spendinglogs/:ingredient_id'

Get all the spendinglog entry for an ingredient.

There should really be only one row returned, the result is not an array but an object.

Return parameters:
All columns in Inventories table AND
- Ingredients.name as ingredient_name
- Ingredients.storage_id as ingredient_storage_id
- Ingredients.removed as ingredient_removed

{% endmethod %}