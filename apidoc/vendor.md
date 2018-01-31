# Vendors API

{% method %}
## GET '/vendors'

Get all vendors.

No parameter required.
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

Input should be an array if id(s).

{% sample lang="js" %}
```js
request.body.ids = [
  1, 2, 3
];
```
{% endmethod %}