import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import { getSpace } from './common/packageUtilies';
import { checkStoragePromise } from './common/storageUtilities';
import success from './common/success';
import { logAction } from './systemLogs';
import { updateLogForIngredient } from './spendinglog';

const pendingLotNumber = 'PENDING';

const ordersQuery = `SELECT Inventories.*, Orders.id as order_id, Orders.created_at as order_start_time 
  FROM Inventories JOIN Orders 
  ON Inventories.order_id = Orders.id`;
/**
 * View orders with pending/unarrived ingredients
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function viewPendingOrders(req, res, next) {
  let myPendingOrders = {};
  connection.query(`${ordersQuery} WHERE Inventories.arrived = 0`)
    .then((results) => {
      const orderIds = results.map(x => x.order_id);
      orderIds.forEach(orderId => myPendingOrders[orderId] = []);
      results.forEach(x => {
        if (x.created_at) {
          delete x.created_at;
        }
        myPendingOrders[x.order_id].push(x);
      });
      res.status(200).send(myOrders);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/**
 * View pending and completed orders
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function viewAllOrders(req, res, next) {
  let myOrders = {};
  connection.query(`${ordersQuery}`)
    .then((results) => {
      const orderIds = results.map(x => x.order_id);
      orderIds.forEach(orderId => myOrders[orderId] = []);
      results.forEach(x => {
        if (x.created_at && x.arrived != 0) {
          delete x.created_at;
        } else {
          x.arrived_at = x.created_at;
          delete x.created_at;
        }
        myOrders[x.order_id].push(x);
      });
      res.status(200).send(myOrders);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/* request body format:
 * example:
 * {
 *   '1': {
 *      'num_packages': 123,
 *    },
 *   '2': {
 *      'num_packages': 456,
 *    }
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
  let spendingLogReq = {};

  if (!checkOrderParameters(orders, res)) {
    return;
  }

  connection.query(`SELECT VendorsIngredients.id, VendorsIngredients.price, VendorsIngredients.ingredient_id, Vendors.id as vendor_id, 
    Ingredients.package_type, Ingredients.storage_id, Ingredients.num_native_units
    FROM VendorsIngredients JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id 
    JOIN Vendors ON VendorsIngredients.vendor_id = Vendors.id
    WHERE VendorsIngredients.id IN (${Object.keys(orders).join(', ')})`)
    .then((results) => {
      if (results.length < Object.keys(orders).length) {
        throw createError('Some id not in Vendor Ingredients');
      }
      ingredientIds = results.map(x => x.ingredient_id);
      results.forEach(result => {
        let quantity = orders[result.id].num_packages;
        createIngredientsMap(ingredientsMap, result, quantity, orders);
        createSpendingLogMap(spendingLogReq, result, quantity);
      });
      findRequestedStorageQuantity(ingredientIds, ingredientsMap, requestedCapacities);
      return checkStoragePromise(requestedCapacities);
    })
    .then(() => {
      return addPendingOrder();
    })
    .then((lastOrder) => {
      createInventoryCases(ingredientIds, newIngredientCases, ingredientsMap, lastOrder[0].id);
      return connection.query(`INSERT INTO Inventories (ingredient_id, num_packages, lot, vendor_id, per_package_cost, order_id) VALUES ${newIngredientCases.join(', ')}`);
    })
    .then(() => {
      return updateLogForIngredient(spendingLogReq);
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
        return `${orders[x.vendor_ingredient_id].num_packages} package${orders[x.vendor_ingredient_id].num_packages > 1 ? 's' : ''} of {${x.name}=ingredient_id=${x.id}} from {${x.vendor_name}=vendor_id=${x.vendor_id}}`;
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

function createSpendingLogMap(spendingLogReq, result, quantity) {
  spendingLogReq[result['ingredient_id']] = {
    'total_weight': result['num_native_units'] * quantity,
    'cost': quantity * result['price'],
  };
}

function createIngredientsMap(ingredientsMap, result, quantity, orders) {
  ingredientsMap[result['ingredient_id']] = {
    'package_type': result['package_type'],
    'quantity': quantity,
    'package_price': result['price'],
    'storage_id': result['storage_id'],
    'vendor_ingredient_id': result['id'],
    'vendor_id': result['vendor_id'],
  };
}

function createInventoryCases(ingredientIds, newIngredientCases, ingredientsMap, orderId) {
  ingredientIds.forEach(ingredientId => {
    newIngredientCases.push(`(${ingredientId}, ${ingredientsMap[ingredientId].quantity}, '${pendingLotNumber}', ${ingredientsMap[ingredientId]['vendor_id']}, ${ingredientsMap[ingredientId]['package_price']}, ${orderId})`);
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

function addPendingOrder() {
  return createOrder()
    .catch((err) => {
      throw createError('Error creating pending order');
    });
}

function createOrder() {
  return connection.query(`INSERT INTO Orders VALUES ()`)
    .then(() => {
      return connection.query(`SELECT * FROM Orders ORDER BY ID DESC LIMIT 1`);
    })
    .then((lastOrder) => {
      return Promise.resolve(lastOrder);
    })
    .catch((err) => {
      throw createError('Error add orders and order entries');
    });
}

function checkOrderParameters(orders, res) {
  if (!(Object.keys(orders).length > 0)) {
    handleError(createError('No orders given'), res);
    return false;
  }
  return Object.keys(orders).every(x => {
    if (!checkNumber.isPositiveInteger(x)) {
      handleError(createError('Gave invalid vendor ingredient id'), res);
      return false;
    } else if (!(checkNumber.isPositiveInteger(orders[x].num_packages))) {
      handleError(createError('Gave invalid value for number of packages'), res);
      return false;
    } else {
      return true;
    }
  });
}

/**
 * Mark an ingredient in inventory as arrived and give lot numbers
 * @param {*} req
 * req.body.ingredients =
 *  {
 *    'inventory_id': 1,
 *    'lots': {
 *      'lotnum1': 1849abc,
 *      'lotnum2': 18a82b,
 *     },
 *  }
 * @param {*} res
 * @param {*} next
 */
export function markIngredientArrived(req, res, next) {
  let inventoryIngredients = req.body.ingredients;
  let inventoryLotsMap = {};
  inventoryIngredients.forEach(x => {
    inventoryLotsMap[x.inventory_id] = {};
    inventoryLotsMap[x.inventory_id].id = x.inventory_id;
    inventoryLotsMap[x.inventory_id].lots = x.lots;
  });

  let inventoryMap = {};
  const inventoryIds = Object.keys(inventoryLotsMap);
  connection.query(`SELECT * FROM Inventories WHERE id IN (?)`, [inventoryIds])
    .then((results) => {
      results.forEach(x => {
        inventoryMap[x.id] = {
          'ingredient_id': x.ingredient_id,
          'vendor_id': x.vendor_id,
          'per_package_cost': x.per_package_cost,
          'order_id': x.order_id,
        };
        inventoryLotsMap[x.id].order_cost = x.num_packages;
      });
      return connection.query(`DELETE FROM Inventories WHERE id IN (?)`, [results.map(x => x.id)]);
    })
    .then(() => {
      const lotSumsCorrect = Object.values(inventoryLotsMap).every(x => checkLotSums(x));
      if (!lotSumsCorrect) {
        throw createError('Lots assigned do not equal total packages ordered');
      }
      let newInventoryCases = [];
      Object.values(inventoryLotsMap).forEach(ingredient => {
        const ingredientData = inventoryMap[ingredientsMap[ingredient.id]];
        Object.keys(ingredient.lots).forEach(ingredientLot => {
          const lotQuantity = ingredientLots[ingredientLot];
          newInventoryCases.push(
            [ingredientData.ingredient_id, ingredientData.vendor_id,
              ingredientData.per_package_cost, ingredientData.order_id,
              ingredientLot, lotQuantity, 1, new Date().toISOString().slice(0, 19).replace('T', ' '),
            ]);
        });
      });
      return connection.query(`INSERT INTO Inventories
        (ingredient_id, vendor_id, per_package_cost, order_id, lot, num_packages, arrived, created_at) 
        VALUES ?`, [newInventoryCases]);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

function checkLotSums(inventoryLots) {
  let lotQuantitySum = 0;
  Object.values(inventoryLots.lots).forEach(lotQuantity => {
    if (!checkNumber.isPositiveInteger(lotQuantity)) {
      return false;
    }
    lotQuantitySum += lotQuantity;
  });
  if (lotQuantitySum != inventoryLots.order_total) {
    return false;
  }
  return true;
}
