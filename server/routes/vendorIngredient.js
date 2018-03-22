import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import { getNumPages, queryWithPagination } from './common/pagination';
import success from './common/success';
import { logAction } from './systemLogs';
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
    const price = item['price'];
    const err = checkInputErrorAdd(item);
    if (err) {
      return res.status(400).send(err);
    }

    values.push(`(${ingredientId}, ${vendorId}, ${price})`);
  }
  connection.query(`INSERT INTO VendorsIngredients (ingredient_id, vendor_id, price) VALUES ${values.join(', ')}`)
  .then(() => success(res))
  .then(() => {
    const myVendors = items.map(x => x.vendor_id);
    const myIngredients = items.map(x => x.ingredient_id);
    return connection.query(`SELECT VendorsIngredients.price, Vendors.name as vendor_name, 
      Vendors.id as vendor_id, Ingredients.name as ingredient_name, Ingredients.id as ingredient_id
      FROM VendorsIngredients
      JOIN Vendors ON VendorsIngredients.vendor_id = Vendors.id
      JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id
      WHERE VendorsIngredients.vendor_id IN (${myVendors.join(', ')}) 
      AND VendorsIngredients.ingredient_id IN (${myIngredients.join(', ')}) 
      AND VendorsIngredients.removed = 0`);
  })
  .then((results) => {
    const vendorIngredientStrings = results.map(x => {
      return `vendor {${x.vendor_name}=vendor_id=${x.vendor_id}} for ingredient {${x.ingredient_name}=ingredient_id=${x.ingredient_id}} at price ${x.price} per package`;
    });
    return logAction(req.payload.id, `Added ${vendorIngredientStrings.join(', ')}.`);
  })
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
    const item = items[id];
    const err = checkInputErrorEdit(item);
    if (err) {
      return res.status(400).send(err);
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
          SET price = (case ${cases.prices.join(' ')} end)
          WHERE id IN (${ids.join(', ')})`);
    })
    .then(() => success(res))
    .then(() => {
      const vendorIngredientIds = Object.keys(items);
      return connection.query(`SELECT VendorsIngredients.price, Vendors.name as vendor_name, 
        Vendors.id as vendor_id, Ingredients.name as ingredient_name, Ingredients.id as ingredient_id
        FROM VendorsIngredients
        JOIN Vendors ON VendorsIngredients.vendor_id = Vendors.id
        JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id
        WHERE VendorsIngredients.id IN (${vendorIngredientIds.join(', ')})
        AND VendorsIngredients.removed =  0`);
    })
    .then((results) => {
      const vendorIngredientStrings = results.map(x => {
        return `ingredient {${x.ingredient_name}=ingredient_id=${x.ingredient_id}} price for vendor {${x.vendor_name}=${x.vendor_id}} to ${x.price} per package`;
      });
      return logAction(req.payload.id, `Changed ${vendorIngredientStrings.join(', ')}.`);
    })
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
    .then(() => {
      return connection.query(`SELECT Vendors.name as vendor_name, 
        Vendors.id as vendor_id, Ingredients.name as ingredient_name, Ingredients.id as ingredient_id
        FROM VendorsIngredients
        JOIN Vendors ON VendorsIngredients.vendor_id = Vendors.id
        JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id
        WHERE VendorsIngredients.id IN (${ids.join(', ')})`);
    })
    .then((results) => {
      const vendorIngredientStrings = results.map(x => {
        return `vendor {${x.vendor_name}=vendor_id=${x.vendor_id}} for ingredient {${x.ingredient_name}=ingredient_id=${x.ingredient_id}}`;
      });
      return logAction(req.payload.id, `Removed ${vendorIngredientStrings.join(', ')}.`);
    })
    .catch(err => handleError(err, res));
}

export function fakeDeleteMultipleVendorIngredients(ids) {
  if (ids.length == 0) return;
  return connection.query(`UPDATE VendorsIngredients SET removed = 1 WHERE id IN (${ids.join(', ')})`);
}

function getCases(olds, items) {
  const prices = [];
  for (let i = 0; i < olds.length; i++) {
    const old = olds[i];
    const id = old['id'];
    const change = items[id];
    const price = change['price'];
    prices.push(`when id = ${id} then ${price}`);
  }
  return {
    prices,
  };
}

function checkInputErrorAdd(item) {
  const ingredientId = item['ingredient_id'];
  const vendorId = item['vendor_id'];
  const price = item['price'];
  if (!checkNumber.isPositiveInteger(ingredientId)
    || !checkNumber.isPositiveInteger(vendorId)) {
    return 'Invalid input, check your property names and values.';
  }
  if (!parseFloat(price) || parseFloat(price) < 0) {
    return 'Invalid price, has to be a nonnegative number.';
  }
  return null;
}

function checkInputErrorEdit(item) {
  const price = item['price'];
  if (!parseFloat(price) || parseFloat(price) < 0) {
    return 'Invalid price, has to be a nonnegative number.';
  }
  return null;
}
