# Vendors API

{% method %}
## GET '/vendors/pages' {#pages}

Get the number of pages in the `Vendors` table, requires no parameter input. Default 50 ids per page in numerical order (page 2 = id range 51 to 100).

Return parameters:
{numPages: 5}

{% endmethod %}

{% method %}
## GET '/vendors/page/:page_num'

Get all vendors.

No parameter required.
{% endmethod %}

{% method %}
## GET '/vendors/id/:id'

Get vendor with id.

{% endmethod %}

{% method %}
## GET '/vendors-available'

Get all available vendors (removed = 0).

{% endmethod %}

{% method %}
## POST '/vendors'

Add new vendor(s).

{% sample lang="js" %}
```js
request.body.vendors = [
  {
    'name': 'duke',
    'contact': 'duke@duke.edu',
    'code': 'codeduke',
  },
  {
    'name': 'unc',
    'contact': 'shit@unc.edu',
    'code': 'codeunc',
  }
];
```
{% endmethod %}

{% method %}
## PUT '/vendors'

Modify the vendors info. You can modify either name, contact or code.

{% sample lang="js" %}
```js
request.body.vendors = {
  '1': {
    'name': 'duke1',
  },
  '2': {
    'contact': 'contact1_unc',
    'code': 'unc_new_code',
  },
};
```
{% endmethod %}

{% method %}
## DELETE '/vendors'

Delete vendor(s).

This is a "fake delete" action where the api sets the 'removed' column to 1.

As a result the get '/vendors-available' api does not return the vendors deleted here.

Also fake deletes the corresponding VendorsIngredients.

Input should be an array if id(s).

{% sample lang="js" %}
```js
request.body.ids = [
  1, 2, 3
];
```
{% endmethod %}