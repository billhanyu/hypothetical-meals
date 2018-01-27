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
 * This changes ingredient 1's total_weight to 123 and 2's total_weight to 456
 */
export function modifyQuantities(req, res, next) {
  changeHelper(req.body.changes, false, req, res, next);
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
 * This decreases ingredient 1's total_weight by 123 and 2's total_weight by 456
 */
export function commitCart(req, res, next) {
  // TODO: log to spendinglog
  changeHelper(req.body.cart, true, req, res, next);
}

function changeHelper(items, isCart, req, res, next) {
  if (!items || Object.keys(items).length < 1) {
    return res.status(400).send('Invalid input request, see doc.');
  }
  const ingredientIds = [];
  for (const idString in items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const quantity = items[idString];
    if (!checkNumber.isPositiveInteger(quantity) && isCart) {
      return res.status(400).send(`Request quantity ${quantity} is invalid.`);
    }
    if (!checkNumber.isNonNegativeInteger(quantity) && !isCart) {
      return res.status(400).send(`New quantity ${quantity} is invalid.`);
    }
    ingredientIds.push(idString);
  }

  connection.query(
    `SELECT ingredient_id, storage_weight, total_weight FROM Inventories WHERE ingredient_id IN (${ingredientIds.join(', ')})`)
    .then(results => {
      if (results.length < ingredientIds.length) {
        throw createError(`Changing quantity of something not in the inventory.`);
      }

      const newWeights = calcNewStorageAndTotalWeights(results, isCart, items);

      return connection.query(
        `UPDATE Inventories
          SET total_weight = (case ${newWeights.totalCases.join(' ')} end),
              storage_weight = (case ${newWeights.storageCases.join(' ')} end)
          WHERE ingredient_id IN (${ingredientIds.join(', ')})`);
    })
    .then(() => connection.query('DELETE FROM Inventories WHERE total_weight = 0'))
    .then(() => success(res))
    .catch(err => handleError(err, res));
}

function calcNewStorageAndTotalWeights(oldItems, isCart, request) {
  const totalCases = [];
  const storageCases = [];
  for (let i = 0; i < oldItems.length; i++) {
    const item = oldItems[i];
    const id = item['ingredient_id'];
    const reqNum = parseInt(request[id]);
    const oldTotal = item['total_weight'];
    const oldStorage = item['storage_weight'];
    const newWeights = isCart
      ? calcIndStorageTotalWeightsCart(oldStorage, oldTotal, reqNum)
      : calcIndStorageTotalWeightsAdmin(oldStorage, oldTotal, reqNum);
    const newTotal = newWeights.newTotal;
    const newStorage = newWeights.newStorage;

    totalCases.push(`when ingredient_id = ${id} then ${newTotal}`);
    storageCases.push(`when ingredient_id = ${id} then ${newStorage}`);
  }

  return {
    totalCases,
    storageCases,
  };
}

function calcIndStorageTotalWeightsAdmin(oldStorage, oldTotal, reqNum) {
  const newTotal = reqNum;
  let newStorage = oldStorage;
  const reduce = oldTotal - newTotal;
  if (reduce > 0) {
    newStorage = oldStorage > reduce ? oldStorage - reduce : 0;
  }
  return {
    newTotal,
    newStorage,
  };
}

function calcIndStorageTotalWeightsCart(oldStorage, oldTotal, reqNum) {
  const newTotal = oldTotal - reqNum;
  if (newTotal < 0) {
    throw createError(`Requesting more then what's in the inventory.`);
  }
  const newStorage = oldStorage > reqNum > 0 ? oldStorage - reqNum : 0;
  return {
    newTotal,
    newStorage,
  };
}
