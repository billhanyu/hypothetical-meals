# Spendinglogs API
{% method %}
## GET '/spendinglogs'

Get all of the spendinglogs.

No parameter required.
{% endmethod %}

{% method %}
## GET '/spendinglogs/:ingredient_id'

Get all the spendinglog entry for an ingredient.

There should really be only one row returned, the result is not an array but an object.
{% endmethod %}