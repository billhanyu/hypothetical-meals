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
  connection.query(basicViewQueryString)
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
  connection.query(`${basicViewQueryString} WHERE Ingredients.id = ?`, [req.params.id])
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
    ingredientsToAdd.push([ingredient.name, ingredient.package_type, ingredient.native_unit, ingredient.num_native_units, ingredient.storage_id]);
  }
  connection.query('INSERT INTO Ingredients (name, package_type, native_unit, num_native_units, storage_id) VALUES ?', [ingredientsToAdd])
    .then(() => {
      const names = ingredients.map(x => `'${x.name}'`);
      return connection.query('SELECT * FROM Ingredients WHERE name IN (?)', [names]);
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
  connection.query('SELECT id FROM Ingredients WHERE id IN (?)', [ingredientIds])
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
        WHERE id IN (?)`, [ingredientIds]);
    })
    .then(() => {
      const myIds = Object.keys(items);
      return connection.query('SELECT * FROM Ingredients WHERE id IN (?)', [myIds]);
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

  connection.query(`SELECT id, storage_id FROM Ingredients WHERE id IN (?)`, [ingredientIds])
    .then(results => {
      if (results.length < ingredientIds.length) {
        throw createError('Deleting nonexistent ingredient.');
      }
      return Promise.resolve();
    })
    .then(() => connection.query(`SELECT DISTINCT formula_id FROM FormulaEntries WHERE ingredient_id IN (?)`, [ingredientIds]))
    .then((results) => {
      if (results.length == 0) return Promise.resolve();
      const formulaIds = [];
      for (let result of results) {
        formulaIds.push(result.formula_id);
      }
      return connection.query(`SELECT name FROM Formulas WHERE id IN (?) AND removed = 0`, [formulaIds]);
    })
    .then((results) => {
      const formulasWithIngredient = [];
      if (results) {
        for (let result of results) {
          formulasWithIngredient.push(result.name);
        }
      }
    if (formulasWithIngredient.length > 0) throw createError(`Formulas ${formulasWithIngredient.join(', ')} contains one or more ingredients that are attempted to be deleted`);
    return connection.query(`UPDATE Ingredients SET removed = 1 WHERE id IN (?)`, [ingredientIds]);
  })
  .then(() => connection.query(`SELECT id FROM VendorsIngredients WHERE ingredient_id IN (?)`, [ingredientIds]))
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
      nativeUnit: a[2],
      unitsPerPackage: a[3],
      price: a[4],
      vendorCode: a[5],
      temperature: a[6],
    };
  });

  const getIngredients = connection.query(`SELECT Ingredients.*, Storages.name as storage_name FROM Ingredients INNER JOIN Storages ON Storages.id = Ingredients.storage_id WHERE Ingredients.removed = 0`);
  const getVendors = connection.query(`SELECT * FROM Vendors`);
  const getVendorsIngredients = connection.query('SELECT VendorsIngredients.*,Ingredients.name as ingredient_name, Ingredients.storage_id as ingredient_storage_id, Ingredients.removed as ingredient_removed FROM (VendorsIngredients INNER JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id)');
  const getInventories = connection.query(`SELECT * FROM Inventories`);
  const getStorages = connection.query(`SELECT * FROM Storages`);

  let ingredients;
  let vendors;
  let vendorsIngredients;
  let inventories;
  let storages;

  let ingredsToAdd = '';
  const entryNames = [];

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

      // Compile list of new ingredients to add to db
      
      for (let entry of entries) {
        entryNames.push(entry.ingredient);
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
          throw createError(`Ingredient ${entry.ingredient} is already in database.`);
        }
      }
      return connection.query('DELETE FROM Ingredients WHERE name IN (?) AND removed = 1', [entryNames]);
    })
    .then(() => {
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

function checkForBulkImportFormattingErrors(data) {
  const headers = ['INGREDIENT', 'PACKAGE', 'NATIVE UNIT', 'UNITS PER PACKAGE', 'PRICE PER PACKAGE', 'VENDOR FREIGHT CODE', 'TEMPERATURE'];
  if (data[0].length != headers.length) return `Headers incorrectly formatted. Should be ${headers.length} but received ${data[0].length}.`;
  for (let i = 0; i < headers.length; i++) {
    if (data[0][i] !== headers[i]) {
      return `Incorrect header in column ${i + 1}. Should be ${headers[i]} but received ${data[0][i]}.`;
    }
  }
  for (let i = 1; i < data.length; i++) {
    if (data[i].length != headers.length) {
      // Check for the new line at bottom of sheet
      if (i == data.length - 1 && data[i].length == 1 && data[i][0] == '') {
        data = data.pop();
        return;
      } else return `Incorrect number of columns in row ${i + 1}. Should be ${headers.length} but received ${data[i].length}.`;
    }
    // Ensure valid package type
    try {
      getSpace(data[i][1].toLowerCase());
    } catch (error) {
      return `Invalid package type: ${data[i][1]}`;
    }
    // Ensure integer number of units per package
    if (!checkNumber.isPositiveInteger(data[i][3])) return `Invalid number of units per package: ${data[i][3]}`;
    // Ensure valid price
    if (isNaN(data[i][4]) || data[i][4] <= 0) return `Invalid package price: ${data[i][4]}`;
    // Ensure valid storage type
    // Edit #6 changed it to frozen and refrigerated, changing back to freezer and refrigerator for ease of integration
    if (data[i][6] == 'frozen') data[i][6] = 'freezer';
    else if (data[i][6] == 'refrigerated') data[i][6] = 'refrigerator';
    else if (data[i][6] == 'room temperature') data[i][6] = 'warehouse';
    if (validStorageTypes.indexOf(data[i][6].toLowerCase()) < 0) return `Invalid package type: ${data[i][6]}`;
  }
}

export function freshness(req, res, next) {
  connection.query(basicViewQueryString)
    .then((results) => {
      let worstDuration = 0;
      let totalWeightedDuration = 0;
      let totalNumNativeUnits = 0;
      for (let ingredient of results) {
        ingredient.worstDuration = ingredient.worst_duration == 0 ? null : msToTime(ingredient.worst_duration);
        ingredient.averageDuration = ingredient.total_num_native_units == 0 ? null : msToTime(ingredient.total_weighted_duration / ingredient.total_num_native_units);

        worstDuration = Math.max(worstDuration, ingredient.worst_duration);
        totalWeightedDuration += ingredient.total_weighted_duration;
        totalNumNativeUnits += ingredient.total_num_native_units;

        delete ingredient.worst_duration;
        delete ingredient.total_weighted_duration;
        delete ingredient.total_num_native_units;
      }
      res.json({
        freshnessData: {
          worstDuration: worstDuration == 0 ? null : msToTime(worstDuration),
          averageDuration: totalNumNativeUnits == 0 ? null : msToTime(totalWeightedDuration / totalNumNativeUnits),
        },
        ingredients: results,
      });
    });
}

function msToTime(duration) {
  const seconds = parseInt((duration/1000)%60);
  const minutes = parseInt((duration/(1000*60))%60);
  const hours = parseInt((duration/(1000*60*60))%24);
  const days = parseInt(duration/(1000*60*60*24));

  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}
