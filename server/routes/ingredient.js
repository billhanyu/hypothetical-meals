import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
import { fakeDeleteMultipleVendorIngredients } from './vendorIngredient';
import { getNumPages, queryWithPagination } from './common/pagination';
import { getWeight, ignoreWeights } from './common/packageUtilies';
import { validStorageTypes } from './common/storageUtilities';

const fs = require('fs');
const Papa = require('papaparse');

const numColumnsForBulkImport = 6;
const basicViewQueryString = 'SELECT Ingredients.*, Storages.name as storage_name, Storages.capacity as storage_capacity FROM Ingredients INNER JOIN Storages ON Storages.id = Ingredients.storage_id';

export function allAvailable(req, res, next) {
  connection.query(`${basicViewQueryString} WHERE removed = 0`)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function pages(req, res, next) {
  getNumPages('Ingredients')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'Ingredients', basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function viewAvailable(req, res, next) {
  queryWithPagination(req.params.page_num, 'Ingredients', `${basicViewQueryString} WHERE removed = 0`)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

/* request body format:
 * request.body.ingredients = [
 *   {
 *     'name': 'p',
 *     'native_unit': 'kg',
 *     'storage_id': 1,
 *   }, ...
 * ]
 * This adds a new ingredient into the Ingredients table.
 */
export function addIngredient(req, res, next) {
  addIngredientHelper(req.body.ingredients, req, res, next);
}

function addIngredientHelper(ingredients, req, res, next) {
  if (!ingredients || Object.keys(ingredients).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientsToAdd = [];
  for (let ingredient of ingredients) {
    ingredientsToAdd.push(`('${ingredient.name}', '${ingredient.native_unit}', ${ingredient.storage_id})`);
  }
  connection.query(`INSERT INTO Ingredients (name, native_unit, storage_id) VALUES ${ingredientsToAdd.join(', ')}`)
  .then(() => success(res))
  .catch(err => handleError(err, res));
}

/* request body format:
 * request.body.ingredients =
 *   {
 *     'ingredient_id1': {
 *        'name': 'name_change1',
 *        'storage_id': 'storage_id_change1',
 *      },
 *     'ingredient_id2': {
 *        'storage_id': storage_id_change2,
 *      },
 *     'ingredient_id3': {
 *        'native_unit': native_unit_change3,
 *      },
 *   }, ...
 * This can change the storage id or name of the ingredient.
 */
export function modifyIngredient(req, res, next) {
  modifyIngredientHelper(req.body.ingredients, req, res, next);
}

function modifyIngredientHelper(items, req, res, next) {
  if (!items || Object.keys(items).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientIds = [];
  for (const idString in items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const storageId = items[idString]['storage_id'] || 0;
    if (!checkNumber.isNonNegativeInteger(storageId) || storageId > 3) {
      return res.status(400).send(`New storage id ${storageId} is invalid`);
    }
    ingredientIds.push(idString);
  }

  const nameCases = [];
  const storageCases = [];
  const nativeUnitCases = [];
  connection.query(`SELECT id, name, storage_id, native_unit FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
  .then(results => {
    if (results.length < ingredientIds.length) {
      throw createError('Changing storage id or name of invalid ingredient.');
    }
    for (let ingredient of results) {
      const oldName = ingredient['name'];
      const newName = items[ingredient.id]['name'];
      const oldStorage = ingredient['storage_id'];
      const newStorage = items[ingredient.id]['storage_id'];
      const oldNativeUnit = ingredient['native_unit'];
      const newNativeUnit = items[ingredient.id]['native_unit'];
      nameCases.push(`when id = ${ingredient.id} then '${newName || oldName}'`);
      storageCases.push(`when id = ${ingredient.id} then ${newStorage || oldStorage}`);
      nativeUnitCases.push(`when id = ${ingredient.id} then '${newNativeUnit || oldNativeUnit}'`);
    }
    return connection.query(
      `UPDATE Ingredients
        SET storage_id = (case ${storageCases.join(' ')} end),
            name = (case ${nameCases.join(' ')} end),
            native_unit = (case ${nativeUnitCases.join(' ')} end)
        WHERE id IN (${ingredientIds.join(', ')})`);
  })
  .then(() => success(res))
  .catch(err => handleError(err, res));
}


/* request body format:
 * request.body.ingredients = [
 *   1,
 *   2,
 *   3, ...
 * ]
 * This deletes an ingredient from the ingredients table.
 */
export function deleteIngredient(req, res, next) {
  deleteIngredientHelper(req.body.ingredients, req, res, next);
}

function deleteIngredientHelper(items, req, res, next) {
  if (!items || items.length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientIds = [];
  for (let idString of items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    ingredientIds.push(idString);
  }

  connection.query(`SELECT id, storage_id FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
  .then(results => {
    if (results.length < ingredientIds.length) {
      throw createError('Deleting nonexistent ingredient.');
    }
  })
  .then(() => connection.query(`UPDATE Ingredients SET removed = 1 WHERE id IN (${ingredientIds.join(', ')})`))
  .then(() => connection.query(`SELECT id FROM VendorsIngredients WHERE ingredient_id IN (${ingredientIds.join(', ')})`))
  .then(results => {
    const vendorsIngredientsIds = results.map(e => e.id);
    return fakeDeleteMultipleVendorIngredients(vendorsIngredientsIds);
  })
  .then(() => success(res))
  .catch(err => handleError(err, res));
}

export function bulkImport(req, res, next) {
  const csv = fs.readFileSync(req.file.path);
  const papaResponse = Papa.parse(csv.toString());
  const data = papaResponse.data;

  const formattingError = checkForBulkImportFormattingErrors(data);
  if (formattingError) {
    return handleError(createError(formattingError), res);
  }

  const slicedData = data.slice(1);
  const entries = slicedData.map(a => {
    return {
      'ingredient': a[0],
      'package': a[1],
      'amount': a[2],
      'price': a[3],
      'vendorCode': a[4],
      'temperature': a[5],
    };
  });

  const getIngredients = connection.query(`SELECT Ingredients.*, Storages.name as storage_name FROM Ingredients INNER JOIN Storages ON Storages.id = Ingredients.storage_id`);
  const getVendors = connection.query(`SELECT * FROM Vendors`);
  const getVendorsIngredients = connection.query('SELECT VendorsIngredients.*,Ingredients.name as ingredient_name, Ingredients.storage_id as ingredient_storage_id, Ingredients.removed as ingredient_removed FROM (VendorsIngredients INNER JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id)');
  const getInventories = connection.query(`SELECT * FROM Inventories`);
  const getStorages = connection.query(`SELECT * FROM Storages`);

  let ingredients;
  let vendors;
  let vendorsIngredients;
  let inventories;
  let storages;

  Promise.all([getIngredients, getVendors, getVendorsIngredients, getInventories, getStorages])
  .then((response) => {
    [ingredients, vendors, vendorsIngredients, inventories, storages] = response;

    // Ensure all vendors exist, and add vendor id and storage id parameter
    for (let entry of entries) {
      const existingVendor = vendors.find(vendor => entry.vendorCode.toLowerCase() == vendor.code.toLowerCase());
      if (!existingVendor) throw createError(`Invalid vendor code ${entry.vendorCode}.`);
      entry.vendor_id = existingVendor.id;
      const currStorage = storages.find(storage => entry.temperature.toLowerCase() == storage.name.toLowerCase());
      if (currStorage) entry.storage_id = currStorage.id;
      else throw createError(`Storage type is nonexistant in database: ${entry.temperature}.`);
    }

    // Ensure added ingredients do not exceed storage
    // return resolve();
    return checkSufficientStorage(storages, entries, inventories);
  })
  .then(() => {
    // Compile list of new ingredients to add to db
    let ingredsToAdd = '';
    for (let entry of entries) {
      const existingIngredient = ingredients.find(ingredient => entry.ingredient.toLowerCase() == ingredient.name.toLowerCase() && entry.storage_id == ingredient.storage_id);
      if (!existingIngredient) {
        ingredsToAdd += `('${entry.ingredient}', ${entry.storage_id}),`;
        ingredients.push({
          'name': entry.ingredient,
          'storage_name': entry.temperature,
        });
      }
    }
    return connection.query(`INSERT INTO Ingredients (name, storage_id) VALUES ${ingredsToAdd.slice(0, -1)}`);
  })
  .then(() => connection.query(`SELECT Ingredients.*, Storages.name as storage_name FROM Ingredients INNER JOIN Storages ON Storages.id = Ingredients.storage_id`))
  .then((response) => {
    ingredients = response;

    let vendorsIngredsToAdd = '';
    for (let entry of entries) {
      // Find ingredient id (could be just added)
      const entryIngredient = ingredients.find(ingredient => entry.ingredient.toLowerCase() == ingredient.name.toLowerCase() && entry.storage_id == ingredient.storage_id);
      entry.ingredient_id = entryIngredient.id;

      const existingVendorsIngredients = vendorsIngredients.find(vendorsIngredient => entry.ingredient_id == vendorsIngredient.ingredient_id && entry.vendor_id == vendorsIngredient.vendor_id);
      if (!existingVendorsIngredients) {
        vendorsIngredsToAdd += `(${entry.ingredient_id}, '${entry.package}', ${entry.price}, ${entry.vendor_id}),`;
        vendorsIngredients.push({
          'ingredient_id': entry.ingredient_id,
          'vendor_id': entry.vendor_id,
        });
      }
    }
    return connection.query(`INSERT INTO VendorsIngredients (ingredient_id, package_type, price, vendor_id) VALUES ${vendorsIngredsToAdd.slice(0, -1)}`);
  })
  .then(() => success(res))
  .catch((err) => {
    handleError(err, res);
  });
}

function checkSufficientStorage(storages, entries, backup) {
  return new Promise((resolve, reject) => {
    const sums = {};
    const capacities = {};
    for (let storage of storages) {
      sums[storage.id] = 0;
      capacities[storage.id] = storage.capacity;
    }

    // Add bulk import to sums
    for (let entry of entries) {
      const storageEntry = storages.find(storage => storage.name.toLowerCase() == entry.temperature.toLowerCase());
      if (!storageEntry) reject(createError(`Storage type is nonexistant in database: ${temperature}.`));
      if (ignoreWeights.indexOf(entry.package) < 0) sums[storageEntry.id] += parseInt(entry.amount);
    }

    // Add already existing inventory to sums
    connection.query(`SELECT Inventories.package_type, Inventories.num_packages, Ingredients.storage_id
                                  FROM Inventories
                                  INNER JOIN Ingredients
                                  ON Inventories.ingredient_id = Ingredients.id`)
    .then(items => {
      items.forEach(item => {
        if (ignoreWeights.indexOf(item.package_type) < 0) {
          sums[item.storage_id] += getWeight(item.package_type) * item.num_packages;
        }
      });
      for (let id of Object.keys(sums)) {
        if (sums[id] > capacities[id]) {
             reject(createError('New quantities too large for current storages'));
        }
      }
    })
    .then(() => resolve())
    .catch(err => reject(err));
  });
}

function checkForBulkImportFormattingErrors(data) {
  if (data[0].length != numColumnsForBulkImport) return `Incorrect number of columns in row ${i + 1}. Should be ${numColumnsForBulkImport} but received ${data[0].length}.`;
  const headers = ['INGREDIENT', 'PACKAGE', 'AMOUNT (LBS)', 'PRICE PER PACKAGE', 'VENDOR FREIGHT CODE', 'TEMPERATURE'];
  for (let i = 0; i < headers.length; i++) {
    if (data[0][i] !== headers[i]) {
      return `Incorrect header in column ${i + 1}. Should be ${headers[i]} but received ${data[0][i]}.`;
    }
  }
  for (let i = 1; i < data.length; i++) {
    if (data[i].length != numColumnsForBulkImport) {
      // Check for the new line at bottom of sheet
      if (i == data.length - 1 && data[i].length == 1 && data[i][0] == '') {
        data = data.pop();
        return;
      } else return `Incorrect number of columns in row ${i + 1}. Should be ${numColumnsForBulkImport} but received ${data[i].length}.`;
    }
    // Ensure valid package type
    try {
      getWeight(data[i][1].toLowerCase());
    } catch (error) {
      return `Invalid package type: ${data[i][1]}`;
    }
    // Ensure valid weight in lbs
    if (!checkNumber.isPositiveInteger(data[i][2])) return `Invalid package weight: ${data[i][2]}`;
    // Ensure valid price
    if (isNaN(data[i][3]) || data[i][3] <= 0) return `Invalid package price: ${data[i][3]}`;
    // Ensure valid storage type
    // Edit #6 changed it to frozen and refrigerated, changing back to freezer and refrigerator for ease of integration
    if (data[i][5] == 'frozen') data[i][5] = 'freezer';
    else if (data[i][5] == 'refrigerated') data[i][5] = 'refrigerator';
    else if (data[i][5] == 'room temperature') data[i][5] = 'warehouse';
    if (validStorageTypes.indexOf(data[i][5].toLowerCase()) < 0) return `Invalid package type: ${data[i][5]}`;
  }
}
