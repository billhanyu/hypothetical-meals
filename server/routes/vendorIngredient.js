import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import { getNumPages, queryWithPagination } from './common/pagination';
import success from './common/success';
const basicViewQueryString = 'SELECT VendorsIngredients.*, Vendors.name as vendor_name, Vendors.contact as vendor_contact, Vendors.code as vendor_code, Vendors.removed as vendor_removed, Ingredients.name as ingredient_name, Ingredients.storage_id as ingredient_storage_id, Ingredients.removed as ingredient_removed, Ingredients.package_type as ingredient_package_type, Ingredients.native_unit as ingredient_native_unit FROM ((VendorsIngredients INNER JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id) INNER JOIN Vendors ON VendorsIngredients.vendor_id = Vendors.id)';

export function pages(req, res, next) {
  getNumPages('VendorsIngredients')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'VendorsIngredients', basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function viewAvailable(req, res, next) {
  queryWithPagination(req.params.page_num, 'VendorsIngredients', `${basicViewQueryString} WHERE VendorsIngredients.removed = 0`)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function getVendorsForIngredient(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  if (!checkNumber.isPositiveInteger(ingredientId)) {
    res.status(400).send('Invalid Ingredient Id');
  }
  connection.query(`${basicViewQueryString} WHERE ingredient_id = ${ingredientId} AND VendorsIngredients.removed = 0`)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

/* Request body format
 * req.body.vendoringredients = [
 *   {
 *     'ingredient_id': 1,
 *     'vendor_id': 1,
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
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const ingredientId = item['ingredient_id'];
    const vendorId = item['vendor_id'];
    const numNativeUnits = item['num_native_units'];
    const price = item['price'];

    if (!checkNumber.isPositiveInteger(ingredientId)
      || !checkNumber.isPositiveInteger(vendorId)
      || isNaN(price)
      || isNaN(numNativeUnits)) {
      return res.status(400).send('Invalid input, check your property names and values.');
    }
    values.push(`(${ingredientId}, ${vendorId}, ${numNativeUnits}, ${price})`);
  }
  connection.query(`INSERT INTO VendorsIngredients (ingredient_id, vendor_id, num_native_units, price) VALUES ${values.join(', ')}`)
  .then(() => success(res))
  .catch(err => handleError(err, res));
}

/* Request body format
 * req.body.vendoringredients = {
 *   '1': {
 *     'price': 100,
 *   },
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
              num_native_units = (case ${cases.numNativeUnits.join(' ')} end)
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
  fakeDeleteMultipleVendorIngredients(ids)
    .then(() => success(res))
    .catch(err => handleError(err, res));
}

export function fakeDeleteMultipleVendorIngredients(ids) {
  if (ids.length == 0) return;
  return connection.query(`UPDATE VendorsIngredients SET removed = 1 WHERE id IN (${ids.join(', ')})`);
}

function getCases(olds, items) {
  const prices = [];
  const numNativeUnitsArr = [];
  for (let i = 0; i < olds.length; i++) {
    const old = olds[i];
    const id = old['ingredient_id'];
    const change = items[id];
    const price = change['price'];
    const numNativeUnits = change['num_native_units'];
    prices.push(`when id = ${id} then ${price}`);
    numNativeUnitsArr.push(`when id = ${id} then ${numNativeUnits}`);
  }
  return {
    prices,
    numNativeUnits: numNativeUnitsArr,
  };
}
