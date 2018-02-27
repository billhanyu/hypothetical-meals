import { modifyInventoryQuantitiesPromise } from './inventory';
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
 *   '1': 123,
 *   '2': 456
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

  connection.query(`SELECT VendorsIngredients.id, VendorsIngredients.ingredient_id, Ingredients.package_type, Ingredients.storage_id
    FROM VendorsIngredients JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id WHERE VendorsIngredients.id IN (${Object.keys(orders).join(', ')})`)
    .then((results) => {
      if (results.length < Object.keys(orders).length) {
        throw createError('Some id not in Vendor Ingredients');
      }
      ingredientIds = results.map(x => x.ingredient_id);
      for (let result of results) {
        ingredientsMap[result['ingredient_id']] = {
          'package_type': result['package_type'],
          'quantity': orders[result.id],
          'storage_id': result['storage_id'],
          'vendor_ingredient_id': result['id'],
        };
      }
      return connection.query(`SELECT * FROM Inventories WHERE ingredient_id IN (${ingredientIds.join(', ')})`);
    })
    .then((inventoryResults) => {
      let updateIngredients = {};
      let updateIngredientIds = [];
      inventoryResults.forEach(x => {
        const myIngredientId = x.ingredient_id;
        const myVendorIngredientId = ingredientsMap[myIngredientId]['vendor_ingredient_id'];
        updateIngredients[x.id] = orders[myVendorIngredientId] + x.num_packages;
        updateIngredientIds.push(x.ingredient_id);
      });
      for (let ingredientId of ingredientIds) {
        if (updateIngredientIds.indexOf(ingredientId) < 0) {
          const storageKey = ingredientsMap[ingredientId]['storage_id'];
          newIngredientCases.push(`(${ingredientId}, ${ingredientsMap[ingredientId]['quantity']})`);
          let itemPackage = ingredientsMap[ingredientId]['package_type'];
          if (!(storageKey in requestedCapacities)) {
            requestedCapacities[storageKey] = 0;
          }
          requestedCapacities[storageKey] += ingredientsMap[ingredientId]['quantity'] * getSpace(itemPackage);
        }
      }
      if (Object.keys(updateIngredients).length > 0) {
        return modifyInventoryQuantitiesPromise(updateIngredients);
      }
      return;
    })
    .then(() => checkStoragePromise(requestedCapacities))
    .then(() => {
      if (newIngredientCases.length > 0) {
        return connection.query(`INSERT INTO Inventories (ingredient_id, num_packages) VALUES ${newIngredientCases.join(', ')}`);
      }
      return;
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
      console.log(err);
      handleError(err, res);
    });
}
