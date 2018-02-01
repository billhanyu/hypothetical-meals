import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';

export function view(req, res, next) {
  connection.query('SELECT * FROM Inventories')
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

/* request body format:
 * request.body.changes = {
 *   "inventory_id1": new_quantity1,
 *   "inventory_id2": new_quantity2
 * }
 * example:
 * {
 *   "1": 123,
 *   "2": 456
 * }
 * This changes inventory 1's num_packages to 123 and 2's num_packages to 456
 */
export function modifyQuantities(req, res, next) {
  modifyInventoryQuantitiesPromise(req.body.changes)
    .then(() => success(res))
    .catch(err => handleError(err, res));
}

/* request body format:
 * request.body.cart = {
 *   "inventory_id1": request_quantity1,
 *   "inventory_id2": request_quantity2
 * }
 * example:
 * {
 *   "1": 123,
 *   "2": 456
 * }
 * This decreases inventory id 1's num_packages by 123 and 2's num_packages by 456
 */
export function commitCart(req, res, next) {
  try {
    const cart = req.body.cart;
    checkInputChanges(cart);
    checkChangesProperties(cart);
    const ids = Object.keys(cart);
    connection.query(`SELECT id, num_packages FROM Inventories WHERE id IN (${ids.join(', ')})`)
      .then(results => {
        if (results.length < ids.length) {
          throw createError('Some inventory id not in database.');
        }
        for (let item of results) {
          const id = item.id;
          const newNum = item.num_packages - cart[id];
          if (newNum < 0) {
            throw createError('Requesting more than what\'s in the database.');
          }
          cart[id] = newNum;
        }
        return modifyInventoryQuantitiesPromise(cart);
      })
      .then(() => success(res))
      .catch(err => {
        handleError(err, res);
      });
  } catch (err) {
    handleError(err, res);
  }
}

/* changes: {
 *   'inventory_id1': newQuantity1,
 *   'inventory_id2': newQuantity2,
 * }
 */
export function modifyInventoryQuantitiesPromise(changes) {
  return new Promise((resolve, reject) => {
    try {
      checkInputChanges(changes);
      checkChangesProperties(changes);
    } catch (err) {
      reject(err);
    }
    const ids = Object.keys(changes);
    const cases = [];
    for (let id of ids) {
      cases.push(`when id = ${id} then ${changes[id]}`);
    }
    connection.query(`SELECT id FROM Inventories WHERE id IN (${ids.join(', ')})`)
      .then(results => {
        if (results.length < ids.length) {
          reject(createError('Some id not in database.'));
        }
        return connection.query(`UPDATE Inventories SET num_packages = (case ${cases.join(' ')} end)
                    WHERE id IN (${ids.join(', ')})`);
      })
      .then(() => connection.query('DELETE FROM Inventories WHERE num_packages = 0'))
      .then(() => resolve())
      .catch(err => {
        reject(err);
      });
    });
}

function checkInputChanges(changes) {
  if (!changes || Object.keys(changes) < 1) {
    throw createError('Invlaid input object, see doc.');
  }
}

function checkChangesProperties(changes) {
  for (let id in changes) {
    if (!checkNumber.isPositiveInteger(id)) {
      throw createError(`inventory_id ${id} invalid.`);
    }
    const value = changes[id];
    if (!checkNumber.isNonNegativeInteger(value)) {
      throw createError(`new inventory quantity ${value} invalid.`);
    }
  }
}
