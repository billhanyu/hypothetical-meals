# System Logs API

{% method %}
## GET '/systemLogs/pages' {#pages}

Get the number of pages in the `SystemLogs` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/systemLogs/page/:page_num' {#view}

Gets same things that formulas gets without pages. Limited to amount per page.

{% endmethod %}


{% method %}
## GET '/systemLogs' {#viewAll}

Gets system log information. Query params are 'ingredient_id', 'user_id', 'from_date', 'to_date' and dates are in format 'YYYY.MM.DD'. Managers and admins can view.

Returns

{% sample lang="js" %}
```js
res.body: [{
  'id': 'myId',
  'user_id': 1,
  'description': 'myDescription',
  'crerated_at': 'some time',
  },
  ...
]

{% endmethod %}