import * as checkNumber from './common/checkNumber';
const ALL_PACKAGE_TYPES = ['sack', 'pail', 'drum', 'supersack', 'truckload', 'railcar'];

export function getVendorsForIngredient(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  if (!checkNumber.isPositiveInteger(ingredientId)) {
    res.status(400).send('Invalid Ingredient Id');
  }
  connection.query(`SELECT * from VendorsIngredients WHERE ingredient_id = ${ingredientId}`)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      res.status(500).send('Database error');
    });
}

/* Request body format
 * req.body.vendoringredients = [
 *   {
 *     'ingredient_id': 1,
 *     'vendor_id': 1,
 *     'package_type': 'sack',
 *     'price': 100
 *   },
 *   {
 *      ...
 *   },
 *   ...
 * ]
 */
export function addVendorIngredients(req, res, next) {
  // TODO: add auth
  const items = req.body.vendoringredients;
  if (!items || items.length < 1) {
    return res.status(400).send('Invalid input request, see doc.');
  }
  const values = [];
  const dup = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const ingredientId = item['ingredient_id'];
    const vendorId = item['vendor_id'];
    const packageType = item['package_type'];
    const price = item['price'];

    if (!checkNumber.isPositiveInteger(ingredientId)
      || !checkNumber.isPositiveInteger(vendorId)
      || !checkNumber.isPositiveInteger(price)
      || ALL_PACKAGE_TYPES.indexOf(packageType) < 0) {
      return res.status(400).send('Invalid input, check your property names and values.');
    }
    values.push(`(${ingredientId}, ${vendorId}, '${packageType}', ${price})`);
    dup.push(`(ingredient_id = ${ingredientId} AND vendor_id = ${vendorId} AND package_type = '${packageType}')`);
  }
  connection.query(`SELECT id FROM VendorsIngredients WHERE ${dup.join(' OR ')}`)
    .then(results => {
      if (results.length > 0) {
        const err = {
          custom: 'There exists duplicate(s) in your input: same ingredient_id, vendor_id and package_type',
        };
        throw err;
      }
      return connection.query(`INSERT INTO VendorsIngredients (ingredient_id, vendor_id, package_type, price) VALUES ${values.join(', ')}`);
    })
    .then(() => res.status(200).send('success'))
    .catch(err => {
      if (err.custom) {
        return res.status(400).send(err.custom);
      }
      console.error(err);
      res.status(500).send('Database error');
    });
}

export function modifyVendorIngredients(req, res, next) {
  // TODO: add auth
  res.status(501).send('todo');
}

/* Request body format
 * req.body.ids = [
 *   1, 2, 3...
 * ]
 */
export function deleteVendorIngredients(req, res, next) {
  // TODO: add auth
  const ids = req.body.ids;
  if (!ids || ids.length < 1) {
    return res.status(400).send('Invalid input request, see doc.');
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (!checkNumber.isPositiveInteger(id)) {
      return res.status(400).send('Invalid Id detected, trying to inject? you lil b');
    }
  }
  connection.query(`DELETE FROM VendorsIngredients WHERE id IN (${ids.join(',')})`)
    .then(() => res.status(200).send('success'))
    .catch(err => {
      console.error(err);
      res.status(500).send('Database error');
    });
}
