import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import {getWeight, ignoreWeights} from './common/packageUtilies';
import { getNumPages, queryWithPagination } from './common/pagination';
import success from './common/success';
import { updateConsumedSpendingLogForCart } from './spendinglog';

const basicViewQueryString = 'SELECT Inventories.*, Ingredients.name as ingredient_name, Ingredients.storage_id as ingredient_storage_id, Ingredients.removed as ingredient_removed FROM Inventories INNER JOIN Ingredients ON Inventories.ingredient_id = Ingredients.id';

export function all(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function pages(req, res, next) {
  getNumPages('Inventories')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'Inventories', basicViewQueryString)
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
    let cartItems;
    connection.query(`SELECT * FROM Inventories WHERE id IN (${ids.join(', ')})`)
      .then(results => {
        if (results.length < ids.length) {
          throw createError('Some inventory id not in database.');
        }
        cartItems = results.map(a => Object.assign({}, a));
        cartItems.forEach(item => {
          item.num_packages = cart[item.id];
        });
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
      .then(() => updateConsumedSpendingLogForCart(cartItems))
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
    let backup;
    connection.query(`SELECT id, num_packages FROM Inventories WHERE id IN (${ids.join(', ')})`)
      .then(results => {
        backup = results;
        if (results.length < ids.length) {
          reject(createError('Some id not in database.'));
        }
        return connection.query(`UPDATE Inventories SET num_packages = (case ${cases.join(' ')} end)
                    WHERE id IN (${ids.join(', ')})`);
      })
      .then(() => checkStorageCapacityPromise(backup))
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

function checkStorageCapacityPromise(backup) {
  return new Promise((resolve, reject) => {
    let storages;
    const sums = {};
    const capacities = {};
    connection.query('SELECT * FROM Storages')
      .then(results => {
        storages = results;
        for (let storage of storages) {
          sums[storage.id] = 0;
          capacities[storage.id] = storage.capacity;
        }
        return connection.query(`SELECT Inventories.package_type, Inventories.num_packages, Ingredients.storage_id
                                  FROM Inventories
                                  INNER JOIN Ingredients
                                  ON Inventories.ingredient_id = Ingredients.id`);
      })
      .then(items => {
        items.forEach(item => {
          if (ignoreWeights.indexOf(item.package_type) < 0) {
            sums[item.storage_id] += getWeight(item.package_type) * item.num_packages;
          }
        });
        for (let id of Object.keys(sums)) {
          if (sums[id] > capacities[id]) {
            const ids = [];
            const cases = [];
            backup.forEach(item => {
              ids.push(item.id);
              cases.push(`when id = ${item.id} then ${item.num_packages}`);
            });
            return revertBackPromise(cases, ids);
          }
        }
      })
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function revertBackPromise(cases, ids) {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE Inventories SET num_packages = (case ${cases.join(' ')} end) WHERE id IN (${ids.join(', ')})`)
      .then(() => reject(createError('New quantities too large for current storages')))
      .catch(err => reject(err));
  });
}
