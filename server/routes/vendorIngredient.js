import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
const ALL_PACKAGE_TYPES = ['sack', 'pail', 'drum', 'supersack', 'truckload', 'railcar'];

export function getVendorsForIngredient(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  if (!checkNumber.isPositiveInteger(ingredientId)) {
    res.status(400).send('Invalid Ingredient Id');
  }
  connection.query(`SELECT * from VendorsIngredients WHERE ingredient_id = ${ingredientId}`)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
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
  const values = [];
  const items = req.body.vendoringredients;
  if (!items || items.length < 1) {
    return res.status(400).send('Invalid input request, see doc.');
  }
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
        throw createError('There exists duplicate(s) in your input: same ingredient_id, vendor_id and package_type');
      }
      return connection.query(`INSERT INTO VendorsIngredients (ingredient_id, vendor_id, package_type, price) VALUES ${values.join(', ')}`);
    })
    .then(() => success(res))
    .catch(err => handleError(err, res));
}

/* Request body format
 * req.body.vendoringredients = {
 *   '1': {
 *     'price': 100,
 *   },
 *   '2': {
 *     'package_type': 'sack',
 *   }
 * }
 */
export function modifyVendorIngredients(req, res, next) {
  const items = req.body.vendoringredients;
  const ids = [];
  if (!items || Object.keys(items).length < 1) {
    return res.status(400).send('Invalid input request, see doc.');
  }
  const keys = Object.keys(items);
  for (let i = 0; i < keys.length; i++) {
    const id = keys[i];
    if (!checkNumber.isPositiveInteger(id)) {
      return res.status(400).send(`Invalid id ${id}`);
    }
    ids.push(id);
  }

  connection.query(`SELECT * FROM VendorsIngredients WHERE id IN (${ids.join(', ')})`)
    .then(olds => {
      if (olds.length < ids.length) {
        throw createError('One or more id(s) does not exist in the table.');
      }
      const cases = getCases(olds, items);
      return connection.query(
        `UPDATE VendorsIngredients
          SET price = (case ${cases.prices.join(' ')} end),
              package_type = (case ${cases.packageTypes.join(' ')} end)
          WHERE id IN (${ids.join(', ')})`);
    })
    .then(() => success(res))
    .catch(err => handleError(err, res));
}

/* Request body format
 * req.body.ids = [
 *   1, 2, 3...
 * ]
 */
export function deleteVendorIngredients(req, res, next) {
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
    .then(() => success(res))
    .catch(err => handleError(err, res));
}

function getCases(olds, items) {
  const prices = [];
  const packageTypes = [];
  for (let i = 0; i < olds.length; i++) {
    const old = olds[i];
    const id = old['ingredient_id'];
    const change = items[id];
    const price = 'price' in change ? change['price'] : old['price'];
    const packageType = 'package_type' in change ? change['package_type'] : old['package_type'];
    prices.push(`when id = ${id} then ${price}`);
    packageTypes.push(`when id = ${id} then '${packageType}'`);
  }
  return {
    prices,
    packageTypes,
  };
}
