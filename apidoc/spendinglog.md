# Spendinglogs API
{% method %}
## GET '/spendinglogs'

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