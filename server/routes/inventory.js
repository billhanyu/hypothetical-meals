import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import { getSpace } from './common/packageUtilies';
import success from './common/success';
import { updateConsumedSpendingLogForCart } from './spendinglog';
import { logAction } from './systemLogs';
import { uuid } from './common/uuid';

const basicViewQueryString = 'SELECT Inventories.*, Ingredients.name as ingredient_name, Ingredients.num_native_units as ingredient_num_native_units, Ingredients.package_type as ingredient_package_type, Ingredients.storage_id as ingredient_storage_id, Ingredients.native_unit AS ingredient_native_unit, Ingredients.removed as ingredient_removed, Ingredients.intermediate as ingredient_intermediate FROM Inventories INNER JOIN Ingredients ON Inventories.ingredient_id = Ingredients.id';

export function all(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

/* request body format:
 * req.body.ids = [
 *   1, 2, 3
 * ]
 */
export function getStock(req, res, next) {
  let ids = req.query.ids;
  if (typeof ids == 'string') {
    ids = [ids];
  }
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
          if (stock[result.ingredient_id]) {
            stock[result.ingredient_id].num_packages += result.num_packages;
          } else {
            // Clone
            console.log(result);
            stock[result.ingredient_id] = JSON.parse(JSON.stringify(result));
            delete stock[result.ingredient_id].worst_duration;
            delete stock[result.ingredient_id].total_weighted_duration;
            delete stock[result.ingredient_id].total_num_native_units;
          }
          if (!stock[result.ingredient_id].freshnessData) {
            stock[result.ingredient_id].freshnessData = [];
          }
          stock[result.ingredient_id].freshnessData.push({
            inventoryId: result.id,
            numPackages: result.num_packages,
            createdAt: result.created_at,

            lot: result.lot,
            vendorId: result.vendor_id,
          });
        }
        resolve(stock);
      })
      .catch(err => reject(err));
  });
}

/* param: ingredient_id
 * gets the lot distribution and quantities in those lots
 */
export function getLotQuantities(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  connection.query(`SELECT Inventories.*, Ingredients.num_native_units, Vendors.name as vendor_name FROM Inventories
    JOIN Ingredients ON Inventories.ingredient_id = Ingredients.id
    JOIN Vendors ON Inventories.vendor_id = Vendors.id
    WHERE ingredient_id = ${ingredientId}`)
    .then(results => {
      const lots = results.map(entry => {
        return {
          inventory_id: entry.id,
          lot: entry.lot,
          vendor: entry.vendor_name,
          quantity: entry.num_native_units * entry.num_packages,
        };
      });
      return res.json(lots);
    })
    .catch(err => handleError(err, res));
}

/* return production entries lots for a certain ingredient with id */
export function getProductionLots(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  connection.query('SELECT lot FROM ProductRunsEntries WHERE ingredient_id = ?',
    [ingredientId])
    .then(results => {
      const arr = [];
      results.forEach(result => {
        if (!arr.includes(result.lot)) {
          arr.push(result.lot);
        };
      });
      return res.json(arr);
    })
    .catch(err => {
      handleError(err, res);
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
  const changes = req.body.changes;
  modifyInventoryQuantitiesPromise(req.body.changes)
    .then(() => success(res))
    .then(() => {
      return connection.query(`SELECT Inventories.*, Ingredients.name, Ingredients.num_native_units, Ingredients.native_unit 
          FROM Inventories JOIN Ingredients ON Inventories.ingredient_id = Ingredients.id
          WHERE Inventories.id IN (${Object.keys(changes).join(', ')})`);
    })
    .then((results) => {
      let modified = results.map(x => {
        return `${x.name}: ${x.num_packages * x.num_native_units} ${x.native_unit} in lot ${x.lot}`;
      });
      let nameStrings = results.map(x => {
        return `{${x.name}=ingredient_id=${x.ingredient_id}}`;
      });
      logAction(req.payload.id, `CORRECTION: Ingredient${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} modified. Inventory now has ${modified.join(', ')}.`);
    })
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
  const ingredientIds = [];
  const freshness = [];
  const changes = {};
  let intermediateIng;

  const uniqueId = uuid();
  const productRunEntries = [];

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
      for (let formulaEntry of formulaEntries) {
        ingredientIds.push(formulaEntry.ingredient_id);
      }
      return getStockPromise(ingredientIds);
    })
    .then((inventories) => {
      for (let ingredientId of ingredientIds) {
        const inventory = inventories[ingredientId];

        if (!inventory) throw createError(`Inventory missing ingredient`);
        inventory.freshnessData.sort((a, b) => a.created_at - b.created_at);

        const formulaEntrySearch = formulaEntries.find((formulaEntry) => ingredientId == formulaEntry.ingredient_id);

        const reqNumPackages = formulaEntrySearch.num_native_units / inventory.ingredient_num_native_units * numProducts / formula.num_product;

        let numPackagesLeft = reqNumPackages;
        let worstDuration = 0;
        let totalWeightedDuration = 0;
        for (let freshnessEntry of inventory.freshnessData) {
          if (numPackagesLeft <= 0) break;
          const numPackagesConsumed = numPackagesLeft > freshnessEntry.numPackages ? freshnessEntry.numPackages : numPackagesLeft;
          changes[freshnessEntry.inventoryId] = freshnessEntry.numPackages - numPackagesConsumed;
          numPackagesLeft = numPackagesLeft - numPackagesConsumed;
          const timeSinceCreation = new Date() - freshnessEntry.createdAt;
          worstDuration = Math.max(worstDuration, timeSinceCreation);
          totalWeightedDuration += timeSinceCreation * numPackagesConsumed * inventory.ingredient_num_native_units;
          cartItems.push({
            id: freshnessEntry.inventoryId,
            ingredient_id: ingredientId,
            ingredient_num_native_units: inventory.ingredient_num_native_units,
            num_packages: numPackagesConsumed,
          });
          productRunEntries.push({
            ingredient_id: ingredientId,
            vendor_id: freshnessEntry.vendorId,
            lot: freshnessEntry.lot,
            num_native_units: numPackagesConsumed * inventory.ingredient_num_native_units,
          });
        }
        // Dummy data 'poop', 'sack', 1, 'pounds', 10
        freshness.push([ingredientId, 'poop', 'sack', 1, 'pounds', 10, worstDuration, totalWeightedDuration, reqNumPackages * inventory.ingredient_num_native_units]);
        if (numPackagesLeft > 0) throw createError(`Insufficient ingredients in inventory`);
      }

      return (formula.intermediate ? connection.query('SELECT * FROM Ingredients WHERE id = ?', [formula.ingredient_id]) : Promise.resolve());
    })
    .then(intermediateIngArr => {
      if (!formula.intermediate) return Promise.resolve();
      intermediateIng = intermediateIngArr[0];
      return connection.query('INSERT INTO Inventories (ingredient_id, num_packages, lot, vendor_id) VALUES (?, ?, ?, ?)',
        [intermediateIng.id, 0, uniqueId, 1]);
    })
    .then(() => {
      if (!formula.intermediate) return Promise.resolve();
      return connection.query('SELECT id, num_packages FROM Inventories WHERE ingredient_id = ?', [intermediateIng.id]);
    })
    .then((results) => {
      if (formula.intermediate) {
        const result = results[0];
        changes[result.id] = numProducts / intermediateIng.num_native_units + result.num_packages;
      }
      return modifyInventoryQuantitiesPromise(changes);
    })
    .then(() => updateConsumedSpendingLogForCart(cartItems, formulaId, numProducts))
    .then(() => (process.env.NODE_ENV === 'test' ? Promise.resolve() : connection.query(`INSERT INTO Ingredients (id, name, package_type, storage_id, native_unit, num_native_units, worst_duration, total_weighted_duration, total_num_native_units) VALUES ?
     ON DUPLICATE KEY UPDATE 
     worst_duration = GREATEST(worst_duration,VALUES(worst_duration)), 
     total_weighted_duration = total_weighted_duration + VALUES(total_weighted_duration),
     total_num_native_units = total_num_native_units + VALUES(total_num_native_units)`, [freshness])))
    .then(() => {
      return connection.query('INSERT INTO ProductRuns (formula_id, user_id, num_product, lot) VALUES (?)',
        [[formulaId, req.payload.id, numProducts, uniqueId]]);
    })
    .then(() => {
      return connection.query('SELECT id FROM ProductRuns WHERE lot = ?', [uniqueId]);
    })
    .then((results) => {
      const productRunId = results[0].id;
      const entries = productRunEntries.map(entry => {
        return [
          productRunId,
          entry.ingredient_id,
          entry.vendor_id,
          entry.num_native_units,
          entry.lot,
        ];
      });
      return connection.query('INSERT INTO ProductRunsEntries (productrun_id, ingredient_id, vendor_id, num_native_units, lot) VALUES ?',
        [entries]);
    })
    .then(() => {
      return connection.query(`SELECT FormulaEntries.ingredient_id, FormulaEntries.num_native_units,
        Formulas.id as formula_id, Formulas.name as formula_name, Ingredients.name as ingredient_name 
        FROM FormulaEntries JOIN Ingredients ON FormulaEntries.ingredient_id = Ingredients.id
        JOIN Formulas ON FormulaEntries.formula_id = Formulas.id
        WHERE FormulaEntries.formula_id = ${formulaId}`);
    })
    .then((results) => {
      const formulaName = `{${results[0].formula_name}=formula_id=${results[0].formula_id}}`;
      const productionStrings = results.map(x => {
        return `${numProducts * x.num_native_units} {${x.ingredient_name}=ingredient_id=${x.ingredient_id}}`;
      });
      return logAction(req.payload.id, `Produced ${numProducts} products of ${formulaName} using ${productionStrings.join(', ')}.`);
    })
    .then(() => success(res))
    .catch(err => {
      connection.query('DELETE FROM Inventories WHERE num_packages = 0')
        .then(() => {
          handleError(err, res);
        })
        .catch((err) => handleError(err, res));
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
      return;
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
      throw createError(`new inventory quantity invalid.`);
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
