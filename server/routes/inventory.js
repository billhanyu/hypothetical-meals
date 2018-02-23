import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import { getSpace } from './common/packageUtilies';
import { getNumPages, queryWithPagination } from './common/pagination';
import success from './common/success';
import { updateConsumedSpendingLogForCart } from './spendinglog';

const basicViewQueryString = 'SELECT Inventories.*, Ingredients.name as ingredient_name, Ingredients.num_native_units as ingredient_num_native_units, Ingredients.package_type as ingredient_package_type, Ingredients.storage_id as ingredient_storage_id, Ingredients.removed as ingredient_removed FROM Inventories INNER JOIN Ingredients ON Inventories.ingredient_id = Ingredients.id';

export function all(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function pages(req, res, next) {
  getNumPages('Inventories')
    .then(results => res.status(200).send(results))
    .catch(err => {
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'Inventories', basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

/* request body format:
 * req.body.ids = [
 *   1, 2, 3
 * ]
 */
export function getStock(req, res, next) {
  const ids = req.query.ids;
  if (!ids || ids.length == 0) {
    return res.status(400).send('No ingredient queried');
  }
  for (let id of ids) {
    if (!checkNumber.isPositiveInteger(id)) {
      return res.status(400).send('Invalid ingredient id');
    }
  }
  getStockPromise(ids)
    .then(result => res.json(result))
    .catch(err => handleError(err, res));
}

function getStockPromise(ids) {
  return new Promise((resolve, reject) => {
    const stock = {};
    connection.query(`${basicViewQueryString} WHERE Ingredients.id IN (${ids.join(', ')})`)
      .then(results => {
        for (let result of results) {
          stock[result.id] = result;
        }
        resolve(stock);
      })
      .catch(err => reject(err));
  });
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
    .catch(err => {
      return handleError(err, res);
    });
}

/* request body format:
 * request.body = {
 *   "formula_id": formula_id,
 *   "num_products": num_products
 * }
 * example:
 * {
 *   "formula_id": 3,
 *   "num_products": 10
 * }
 */
export function commitCart(req, res, next) {
  const formulaId = req.body.formula_id;
  const numProducts = req.body.num_products;

  let formula;
  let formulaEntries;
  const cartItems = [];

  if (!checkNumber.isPositiveInteger(formulaId)) {
    return res.status(400).send('Invalid formula id');
  }
  if (!checkNumber.isPositiveInteger(numProducts)) {
    return res.status(400).send('Invalid number of products');
  }
  connection.query(`SELECT * FROM Formulas WHERE id =${formulaId}`)
    .then((results) => {
      if (results.length != 1) {
        throw createError('Invalid formula id');
      }
      formula = results[0];
      return connection.query(`SELECT * FROM FormulaEntries WHERE formula_id =${formulaId}`);
    })
    .then((results) => {
      if (results.length == 0) throw createError('Invalid formula id');
      formulaEntries = results;
      const ingredientIds = [];
      for (let formulaEntry of formulaEntries) {
        ingredientIds.push(formulaEntry.ingredient_id);
      }
      return getStockPromise(ingredientIds);
    })
    .then((inventories) => {
      const changes = {};
      for (let inventory of Object.values(inventories)) {
        const formulaEntrySearch = formulaEntries.find((formulaEntry) => inventory.ingredient_id == formulaEntry.ingredient_id);
        const reqNumPackages = formulaEntrySearch.num_native_units / inventory.ingredient_num_native_units * numProducts / formula.num_product;
        changes[inventory.id] = inventory.num_packages - reqNumPackages;
        cartItems.push({
          id: inventory.id,
          ingredient_id: inventory.ingredient_id,
          ingredient_num_native_units: inventory.ingredient_num_native_units,
          num_packages: reqNumPackages,
        });
      }
      return modifyInventoryQuantitiesPromise(changes);
    })
    .then(() => updateConsumedSpendingLogForCart(cartItems, formulaId, numProducts))
    .then(() => success(res))
    .catch(err => {
      handleError(err, res);
    });
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
    throw createError('Invalid input object, see doc.');
  }
}

function checkChangesProperties(changes) {
  for (let id in changes) {
    if (!checkNumber.isPositiveInteger(id)) {
      throw createError(`inventory_id ${id} invalid.`);
    }
    const value = changes[id];
    if (!parseFloat(value) && parseFloat(value) !== 0 || parseFloat(value) < 0) {
      throw createError(`new inventory quantity ${value} invalid.`);
    }
  }
}

export function checkStorageCapacityPromise(backup) {
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
        return connection.query(`SELECT Inventories.num_packages, Ingredients.storage_id, Ingredients.package_type
                                  FROM Inventories
                                  INNER JOIN Ingredients
                                  ON Inventories.ingredient_id = Ingredients.id`);
      })
      .then(items => {
        items.forEach(item => {
          sums[item.storage_id] += getSpace(item.package_type) * item.num_packages;
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
