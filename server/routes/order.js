import * as checkNumber from './common/checkNumber';
import { addEntry } from './log';
import { createError, handleError } from './common/customError';
import { getSpace } from './common/packageUtilies';
import { checkStoragePromise } from './common/storageUtilities';
import success from './common/success';
import { logAction } from './systemLogs';

/* request body format:
 * request.body.order = {
 *   "vendor_ingredient_id1": quantity_1,
 *   "vendor_ingredien_id": quantity_2
 * }
 * example:
 * {
 *   '1': {
 *      'num_packages': 123,
 *      'lots': {
 *          'lot1': 10,
 *          'lot2': 113,
 *       }
 *   '2': {
 *      'num_packages': 456,
 *      'lots': {
 *          'lot1': 456,
 *       }
 * }
 * 1. check inventory capacities
 * 2. update inventory capacities/stock
 * 3. logs and spending logs
 */
export function placeOrder(req, res, next) {
  orderHelper(req.body.orders, req, res, next);
}

function orderHelper(orders, req, res, next) {
  let ingredientIds = [];
  let requestedCapacities = {};
  let newIngredientCases = [];
  let ingredientsMap = {};

  if (!checkOrderParameters(orders, res)) {
    return;
  }

  connection.query(`SELECT VendorsIngredients.id, VendorsIngredients.ingredient_id, Vendors.id as vendor_id, Ingredients.package_type, Ingredients.storage_id
    FROM VendorsIngredients JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id 
    JOIN Vendors ON VendorsIngredients.vendor_id = Vendors.id
    WHERE VendorsIngredients.id IN (${Object.keys(orders).join(', ')})`)
    .then((results) => {
      if (results.length < Object.keys(orders).length) {
        throw createError('Some id not in Vendor Ingredients');
      }
      ingredientIds = results.map(x => x.ingredient_id);
      for (let result of results) {
        ingredientsMap[result['ingredient_id']] = {
          'package_type': result['package_type'],
          'quantity': orders[result.id].num_packages,
          'storage_id': result['storage_id'],
          'vendor_ingredient_id': result['id'],
          'vendor_id': result['vendor_id'],
          'lots': orders[result.id].lots,
        };
      }
      
      findRequestedStorageQuantity(ingredientIds, ingredientsMap, requestedCapacities);
      createInventoryCases(ingredientIds, newIngredientCases, ingredientsMap);
      return checkStoragePromise(requestedCapacities);
    })
    .then(() => {
      return connection.query(`INSERT INTO Inventories (ingredient_id, num_packages, lot, vendor_id) VALUES ${newIngredientCases.join(', ')}`);
    })
    .then(() => {
      let logReq = Object.values(ingredientsMap);
      return addEntry(logReq, req.payload.id);
    })
    .then(() => {
      let vendorIngredientIds = Object.keys(orders);
      return connection.query(`SELECT Ingredients.name, Ingredients.id, Vendors.name as vendor_name, Vendors.id as vendor_id, VendorsIngredients.id as vendor_ingredient_id 
        FROM VendorsIngredients JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id
        JOIN Vendors ON VendorsIngredients.vendor_id = Vendors.id 
        WHERE VendorsIngredients.id IN (${vendorIngredientIds.join(', ')})`);
    })
    .then((results) => {
      let orderStrings = results.map(x => {
        return `${orders[x.vendor_ingredient_id]} package${orders[x.vendor_ingredient_id] > 1 ? 's' : ''} of {${x.name}=ingredient_id=${x.id}} from {${x.vendor_name}=vendor_id=${x.vendor_id}}`;
      });
      logAction(req.payload.id, `Ordered ${orderStrings.join(', ')}.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

function createInventoryCases(ingredientIds, newIngredientCases, ingredientsMap) {
  ingredientIds.forEach(ingredientId => {
    Object.keys(ingredientsMap[ingredientId].lots).forEach(lotNumber => {
      newIngredientCases.push(`(${ingredientId}, ${ingredientsMap[ingredientId]['lots'][lotNumber]}, '${lotNumber}', ${ingredientsMap[ingredientId]['vendor_id']})`);
    });
  });
}

function findRequestedStorageQuantity(ingredientIds, ingredientsMap, requestedCapacities) {
  ingredientIds.forEach(ingredientId => {
    const storageKey = ingredientsMap[ingredientId]['storage_id'];
    let itemPackage = ingredientsMap[ingredientId]['package_type'];
    if (!(storageKey in requestedCapacities)) {
      requestedCapacities[storageKey] = 0;
    }
    requestedCapacities[storageKey] += ingredientsMap[ingredientId]['quantity'] * getSpace(itemPackage);
  });
}

function checkOrderParameters(orders, res) {
  if (!(Object.keys(orders).length > 0)) {
    handleError(createError('No orders given'), res);
    return false;
  }
  Object.keys(orders).forEach(x => {
    if (!checkNumber.isPositiveInteger(x)) {
      handleError(createError('Gave invalid vendor ingredient id'), res);
      return false;
    } else if (!('lots' in orders[x])) {
      handleError(createError('Did not specify lots. Lots are mandatory'), res);
      return false;
    } else if (!(checkNumber.isPositiveInteger(orders[x].num_packages))) {
      handleError(createError('Gave invalid value for number of packages'), res);
      return false;
    } else {
      let lotQuantitySum = 0;
      Object.values(orders[x].lots).forEach(lotQuantity => {
        if (!checkNumber.isPositiveInteger(lotQuantity)) {
          handleError(createError('Did not give valid quantities for lots'), res);
          return false;
        }
        lotQuantitySum += lotQuantity;
      });
      if (lotQuantitySum != orders[x].num_packages) {
        handleError(createError('Lot quantities do not add up to number of packages'), res);
        return false;
      }
    }
  });
  return true;
}

