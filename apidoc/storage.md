# Storages API
{% method %}
## GET '/storages'

Get all of the storages.

No parameter required.
{% endmethod %}

{% method %}
## PUT '/storages'

Change the storage capacity for one type of storage.
{% sample lang="js" %}
```js
request.body = {
  '1': 100,
}
# This changes the capacity of the storage with id 1 to 100
```
{% endmethod %}