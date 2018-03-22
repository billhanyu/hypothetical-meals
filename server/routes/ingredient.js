import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
import { fakeDeleteMultipleVendorIngredients } from './vendorIngredient';
import { getAvailableNumPages, queryWithPagination } from './common/pagination';
import { getSpace } from './common/packageUtilies';
import { validStorageTypes } from './common/storageUtilities';
import { logAction } from './systemLogs';

const fs = require('fs');
const Papa = require('papaparse');

const numColumnsForBulkImport = 8;
const basicViewQueryString = 'SELECT Ingredients.*, Storages.name as storage_name, Storages.capacity as storage_capacity FROM Ingredients INNER JOIN Storages ON Storages.id = Ingredients.storage_id';

export function pages(req, res, next) {
  getAvailableNumPages('Ingredients')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'Ingredients', basicViewQueryString + ' WHERE removed = 0')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function viewAll(req, res, next) {
  connection.query('SELECT * FROM Ingredients')
    .then(results => res.json(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function viewWithId(req, res, next) {
  if (!req.params.id || !checkNumber.isPositiveInteger(req.params.id)) {
    return res.status(400).send('Invalid ingredient id');
  }
  connection.query(`${basicViewQueryString} WHERE Ingredients.id = ${req.params.id}`)
    .then(results => {
      if (results.length != 1) {
        return res.status(404).send('Ingredient not found');
      }
      return res.json(results[0]);
    })
    .catch(err => handleError(err, res));
}

/* request body format:
 * request.body.ingredients = [
 *   {
 *     'name': 'p',
 *     'native_unit': 'kg',
 *     'storage_id': 1,
 *     'num_native_units': 100.9
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
    if (isNaN(ingredient.num_native_units) || parseFloat(ingredient.num_native_units) <= 0) {
      return res.status(400).send('Invalid size, has to be greater than 0.');
    }
    ingredientsToAdd.push(`('${ingredient.name}', '${ingredient.package_type}', '${ingredient.native_unit}', ${ingredient.num_native_units}, ${ingredient.storage_id})`);
  }
  connection.query(`INSERT INTO Ingredients (name, package_type, native_unit, num_native_units, storage_id) VALUES ${ingredientsToAdd.join(', ')}`)
    .then(() => {
      const names = ingredients.map(x => `'${x.name}'`);
      return connection.query(`SELECT * FROM Ingredients WHERE name IN (${names.join(', ')})`);
    })
    .then((results) => {
      const nameStrings = [];
      results.forEach(x => {
        nameStrings.push(`{${x.name}=ingredient_id=${x.id}}`);
      });
      return logAction(req.payload.id, `Ingredient${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} added.`);
    })
    .then(() => connection.query(`SELECT id FROM Ingredients ORDER BY id DESC LIMIT ${ingredientsToAdd.length}`))
    .then(results => res.json(results.map(entry => entry.id)))
    .catch(err => handleError(err, res));
}

/**
 *
 * @param {*} myObject
 * @return {Boolean}
 * Check contain keys 'name', 'storage_id', 'native_unit', 'num_native_units', 'package_type'
 */
export function checkIngredientProperties(myObject) {
  if ('ingredient_name' in myObject && 'storage_id' in myObject &&
    'native_unit' in myObject && 'num_native_units' in myObject && 'package_type' in myObject) {
    return true;
  }
  return false;
}

/* request body format:
 * request.body.ingredients =
 *   {
 *     'ingredient_id1': {
 *        'name': 'name_change1',
 *        'storage_id': 'storage_id_change1',
 *        'package_type': 'package_type_change1',
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
    const numNativeUnits = items[idString]['num_native_units'];
    if (isNaN(numNativeUnits) || parseFloat(numNativeUnits) <= 0) {
      return res.status(400).send(`Size of the package invalid, has to be greater than 0.`);
    }
    ingredientIds.push(idString);
  }

  const nameCases = [];
  const storageCases = [];
  const nativeUnitCases = [];
  const numNativeUnitsCases = [];
  const packageTypeCases = [];
  connection.query(`SELECT id FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
    .then(results => {
      if (results.length < ingredientIds.length) {
        throw createError('Changing storage id or name of invalid ingredient.');
      }
      for (let ingredient of results) {
        const newName = items[ingredient.id]['name'];
        const newStorage = items[ingredient.id]['storage_id'];
        const newNativeUnit = items[ingredient.id]['native_unit'];
        const newPackageType = items[ingredient.id]['package_type'];
        const newNumNativeUnits = items[ingredient.id]['num_native_units'];
        nameCases.push(`when id = ${ingredient.id} then '${newName}'`);
        storageCases.push(`when id = ${ingredient.id} then ${newStorage}`);
        nativeUnitCases.push(`when id = ${ingredient.id} then '${newNativeUnit}'`);
        packageTypeCases.push(`when id = ${ingredient.id} then '${newPackageType}'`);
        numNativeUnitsCases.push(`when id = ${ingredient.id} then ${newNumNativeUnits}`);
      }
      return connection.query(
        `UPDATE Ingredients
        SET storage_id = (case ${storageCases.join(' ')} end),
            package_type = (case ${packageTypeCases.join(' ')} end),
            name = (case ${nameCases.join(' ')} end),
            native_unit = (case ${nativeUnitCases.join(' ')} end),
            num_native_units = (case ${numNativeUnitsCases.join(' ')} end)
        WHERE id IN (${ingredientIds.join(', ')})`);
    })
    .then(() => {
      const myIds = Object.keys(items);
      return connection.query(`SELECT * FROM Ingredients WHERE id IN (${myIds.join(', ')})`);
    })
    .then((results) => {
      const nameStrings = [];
      results.forEach(x => {
        nameStrings.push(`{${x.name}=ingredient_id=${x.id}}`);
      });
      return logAction(req.payload.id, `Ingredient${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} modified.`);
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
      return Promise.resolve();
    })
    .then(() => connection.query(`SELECT DISTINCT formula_id FROM FormulaEntries WHERE ingredient_id IN (${ingredientIds.join(', ')})`))
    .then((results) => {
      if (results.length == 0) return Promise.resolve();
      const formulaIds = [];
      for (let result of results) {
        formulaIds.push(result.formula_id);
      }
      return connection.query(`SELECT name FROM Formulas WHERE id IN (${formulaIds.join(', ')}) AND removed = 0`);
    })
    .then((results) => {
      const formulasWithIngredient = [];
      if (results) {
        for (let result of results) {
          formulasWithIngredient.push(result.name);
        }
      }
    if (formulasWithIngredient.length > 0) throw createError(`Formulas ${formulasWithIngredient.join(', ')} contains one or more ingredients that are attempted to be deleted`);
    return connection.query(`UPDATE Ingredients SET removed = 1 WHERE id IN (${ingredientIds.join(', ')})`);
  })
  .then(() => connection.query(`SELECT id FROM VendorsIngredients WHERE ingredient_id IN (${ingredientIds.join(', ')})`))
  .then(results => {
    const vendorsIngredientsIds = results.map(e => e.id);
    return fakeDeleteMultipleVendorIngredients(vendorsIngredientsIds);
  })
  .then(() => {
    const myIds = items;
    return connection.query(`SELECT * FROM Ingredients WHERE id IN (${myIds.join(', ')})`);
  })
  .then((results) => {
    const nameStrings = [];
    results.forEach(x => {
      nameStrings.push(`{${x.name}=ingredient_id=${x.id}}`);
    });
    return logAction(req.payload.id, `Ingredient${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} deleted.`);
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
      ingredient: a[0],
      package: a[1],
      amount: a[2],
      nativeUnit: a[3],
      unitsPerPackage: a[4],
      price: a[5],
      vendorCode: a[6],
      temperature: a[7],
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
      //   return checkSufficientStorage(storages, entries, inventories);
      // })
      // .then(() => {
      // Compile list of new ingredients to add to db
      let ingredsToAdd = '';
      for (let entry of entries) {
        const existingIngredient = ingredients.find(ingredient => entry.ingredient.toLowerCase() == ingredient.name.toLowerCase());

        if (!existingIngredient) {
          ingredsToAdd += `('${entry.ingredient}', '${entry.package}', ${validStorageTypes.indexOf(entry.temperature) + 1}, '${entry.nativeUnit}', '${entry.unitsPerPackage}'),`;
          ingredients.push({
            'name': entry.ingredient,
            'storage_name': entry.temperature,
            'package_type': entry.package,
            'native_unit': entry.nativeUnit,
            'num_native_units': entry.unitsPerPackage,
          });
        } else {
          if (existingIngredient.package_type != entry.package) throw createError(`Ingredient ${entry.ingredient} is in database but package types do not match`);
          if (existingIngredient.storage_name != entry.temperature) throw createError(`Ingredient ${entry.ingredient} is in database but storage types do not match`);
          if (existingIngredient.native_unit != entry.nativeUnit) throw createError(`Ingredient ${entry.ingredient} is in database but native units do not match`);
          if (existingIngredient.num_native_units != entry.unitsPerPackage) throw createError(`Ingredient ${entry.ingredient} is in database but number of units per package do not match`);
        }
      }
      return ingredsToAdd == '' ? Promise.resolve() : connection.query(`INSERT INTO Ingredients (name, package_type, storage_id, native_unit, num_native_units) VALUES ${ingredsToAdd.slice(0, -1)}`);
    })
    .then(() => connection.query(`SELECT Ingredients.*, Storages.name as storage_name FROM Ingredients INNER JOIN Storages ON Storages.id = Ingredients.storage_id`))
    .then((response) => {
      ingredients = response;

      const vendorsIngredsToAdd = [];
      for (let entry of entries) {
        // Find ingredient id (could be just added)
        const entryIngredient = ingredients.find(ingredient => entry.ingredient.toLowerCase() == ingredient.name.toLowerCase() && entry.storage_id == ingredient.storage_id);
        entry.ingredient_id = entryIngredient.id;

        vendorsIngredsToAdd.push(`(${entry.ingredient_id}, ${entry.price}, ${entry.vendor_id})`);
        vendorsIngredients.push({
          'ingredient_id': entry.ingredient_id,
          'vendor_id': entry.vendor_id,
        });
      }
      return connection.query(`INSERT INTO VendorsIngredients (ingredient_id, price, vendor_id) VALUES ${vendorsIngredsToAdd.join(', ')}`);
    })
    .then(() => {
      const ingredientNames = [];
      for (let entry of entries) {
        ingredientNames.push(`'${entry.ingredient}'`);
      }
      return connection.query(`SELECT id, name FROM Ingredients WHERE name IN (${ingredientNames.join(', ')})`);
    })
    .then((results) => {
      const ingredientStrings = [];
      for (let result of results) {
        ingredientStrings.push(`{${result.name}=ingredient_id=${result.id}}`);
      }
      return logAction(req.payload.id, `Bulk import added the following ingredients: ${ingredientStrings.join(', ')}`);
    })
    .then(() => success(res))
    .catch((err) => {
      console.log(err);
      return handleError(err, res);
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
      sums[storageEntry.id] += parseInt(entry.amount);
    }

    // Add already existing inventory to sums
    connection.query(`SELECT Ingredients.package_type, Inventories.num_packages, Ingredients.storage_id
                                  FROM Inventories
                                  INNER JOIN Ingredients
                                  ON Inventories.ingredient_id = Ingredients.id`)
      .then(items => {
        items.forEach(item => {
          sums[item.storage_id] += getSpace(item.package_type) * item.num_packages;
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
  if (data[0].length != numColumnsForBulkImport) return `Headers incorrectly formatted. Should be ${numColumnsForBulkImport} but received ${data[0].length}.`;
  const headers = ['INGREDIENT', 'PACKAGE', 'AMOUNT (NATIVE UNITS)', 'NATIVE UNIT', 'UNITS PER PACKAGE', 'PRICE PER PACKAGE', 'VENDOR FREIGHT CODE', 'TEMPERATURE'];
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
      getSpace(data[i][1].toLowerCase());
    } catch (error) {
      return `Invalid package type: ${data[i][1]}`;
    }
    // Ensure integer number of native units
    if (!checkNumber.isPositiveInteger(data[i][2])) return `Invalid amount in native units: ${data[i][2]}`;
    // Ensure integer number of units per package
    if (!checkNumber.isPositiveInteger(data[i][4])) return `Invalid number of units per package: ${data[i][2]}`;
    // Ensure valid price
    if (isNaN(data[i][5]) || data[i][5] <= 0) return `Invalid package price: ${data[i][5]}`;
    // Ensure valid storage type
    // Edit #6 changed it to frozen and refrigerated, changing back to freezer and refrigerator for ease of integration
    if (data[i][7] == 'frozen') data[i][7] = 'freezer';
    else if (data[i][7] == 'refrigerated') data[i][7] = 'refrigerator';
    else if (data[i][7] == 'room temperature') data[i][7] = 'warehouse';
    if (validStorageTypes.indexOf(data[i][7].toLowerCase()) < 0) return `Invalid package type: ${data[i][7]}`;
  }
}
