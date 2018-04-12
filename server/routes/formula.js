import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
import { updateDatabaseHelper } from './common/updateUtilities';
import { getPaginationQueryString, getNumPages } from './common/pagination';
import { logAction } from './systemLogs';
import { validStorageTypes } from './common/storageUtilities';
import { checkIngredientProperties } from './ingredient';
import { getSpace } from './common/packageUtilies';

const fs = require('fs');
const Papa = require('papaparse');


const formulaQueryString = 'SELECT * FROM Formulas WHERE removed = 0';
const formulaEntryQuery = 'SELECT FormulaEntries.*';
const dbFormulaNameCheck = `${formulaQueryString} AND name IN`;

export function pages(req, res, next) {
  getNumPages('Formulas')
    .then(results => res.status(200).send(results))
    .catch(err => {
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  const viewByPageQuery = getPaginationQueryString(req.params.page_num, 'Formulas', formulaQueryString);
  getFormulas(viewByPageQuery, [], req, res, next);
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function viewAll(req, res, next) {
  getFormulas(formulaQueryString, [], req, res, next);
}

export function viewWithId(req, res, next) {
  if (!req.params.id || !checkNumber.isPositiveInteger(req.params.id)) {
    return res.status(400).send('Invalid vendor id');
  }
  getFormulas(`SELECT * FROM Formulas WHERE id = ?`, [req.params.id], req, res, next);
}

function getFormulas(queryString, queryParams, req, res, next) {
  let myFormulas = {};
  connection.query(queryString, queryParams)
    .then((results) => {
      results.forEach(x => {
        let formulaObject = x;
        formulaObject.ingredients = {};
        myFormulas[x.id] = formulaObject;
      });
      return connection.query(`${formulaEntryQuery}, Ingredients.name, Ingredients.package_type, Ingredients.storage_id, Ingredients.native_unit, Ingredients.num_native_units as ingredient_num_native_units, Ingredients.removed FROM FormulaEntries
            JOIN Ingredients ON FormulaEntries.ingredient_id = Ingredients.id`);
    })
    .then((formulaEntries) => {
      formulaEntries.forEach(x => {
        if (myFormulas[x.formula_id]) {
          myFormulas[x.formula_id].ingredients[x.name] = x;
        }
      });
      res.status(200).send(Object.values(myFormulas));
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/**
 *
 * @param {*} req
 * req.body.formulas: [{
 *      name: 'myName',
 *      description: 'myDescription',
 *      num_product: 1,
 *      intermediate: 1,
 *      ingredients: [{
 *          'ingredient_id': 1
 *          'num_native_units': 1,
 *          }],
 *      }]
 * }
 * @param {*} res
 * @param {*} next
 */
export function add(req, res, next) {
  const formulas = req.body.formulas;
  let names = [];
  formulas.forEach(x => {
    names.push(`'${x.name}'`);
  });

  addIntermediateProducts(formulas, req.payload.id)
    .then((intermediates) => {
      let intermediateMap = {};
      let formulaCases = [];
      intermediates.forEach(x => {
        intermediateMap[x.name] = x;
      });
      formulas.forEach(x => {
        formulaCases.push([x.name, x.description, x.num_product, x.intermediate, x.ingredient_name && intermediateMap[x.ingredient_name] ? intermediateMap[x.ingredient_name].id : null]);
      });
      return connection.query('INSERT INTO Formulas (name, description, num_product, intermediate, ingredient_id) VALUES ?', [formulaCases]);
    })
    .then(() => {
      return addFormulaEntries(formulas);
    })
    .then(() => {
      return connection.query(`${dbFormulaNameCheck} (${names.join(', ')})`);
    })
    .then((results) => {
      const formulaStrings = results.map(x => {
        return `{${x.name}=formula_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Formula${formulaStrings.length > 1 ? 's' : ''} ${formulaStrings.join(', ')} added.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/**
 *
 * @param {*} intermediateProducts - Object that contains all properties for ingredients
 * @param {*} userId
 * @return {Promise}
 */
function addIntermediateProducts(intermediateProducts, userId) {
  let intermediateCases = [];
  let intermediateNames = [];
  intermediateProducts.forEach(x => {
    if (x.intermediate) {
      if (checkIngredientProperties(x)) {
        intermediateNames.push(x.name);
        intermediateCases.push(`('${x.ingredient_name}', '${x.package_type}', '${x.native_unit}', ${x.num_native_units}, ${x.storage_id}, ${x.intermediate})`);
      } else {
        throw createError('Does not contain all ingredient properties');
      }
    }
  });
  let newIntermediates = [];
  const names = intermediateNames.map(x => `'${x}'`);
  if (intermediateCases.length > 0) {
    return connection.query(`SELECT * FROM Ingredients WHERE name IN (${names.join(', ')}) AND removed = 0`)
      .then((duplicates) => {
        if (duplicates.length > 0) {
          throw createError('Formula for intermediate product has ingredient name already in database');
        }
        return connection.query(`INSERT INTO Ingredients (name, package_type, native_unit, num_native_units, storage_id, intermediate) VALUES ${intermediateCases.join(', ')}`);
      })
      .then(() => {
        return connection.query(`SELECT * FROM Ingredients WHERE name IN (${names.join(', ')})`);
      })
      .then((results) => {
        newIntermediates = results;
        const nameStrings = results.map(x => `{${x.name}=ingredient_id=${x.id}}`);
        return logAction(userId, `Intermediate product${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} added.`);
      })
      .then(() => {
        return Promise.resolve(newIntermediates);
      })
      .catch((err) => {
        throw err;
      });
  } else {
    return Promise.resolve([]);
  }
}

/**
 *
 * @param {*} formulas
 * formulas = [
 *   {
 *      name: 'formulaName',
 *      ingredients: [{
 *          'ingredient_id': 1
 *          'num_native_units': 1,
 *          },...
 *      ],
 *    },...
 * ]
 * @return {Promise} Promise
 */
function addFormulaEntries(formulas) {
  const formulaEntryCases = [];
  const names = formulas.map(x => `'${x.name}'`);

  return connection.query(`${dbFormulaNameCheck} (${names.join(', ')})`)
    .then((dataFormulas) => {
      if (names.length != dataFormulas.length) {
        throw createError('Trying to add formula entries for nonexistent formula');
      }
      let nameIdTuple = {};
      dataFormulas.forEach(x => {
        nameIdTuple[`${x.name}`] = x.id;
      });
      formulas.forEach(x => {
        let ingredients = x.ingredients;
        ingredients.forEach(i => {
          formulaEntryCases.push(`(${i.ingredient_id}, ${i.num_native_units}, ${nameIdTuple[x.name]})`);
        });
      });
      return connection.query(`INSERT INTO FormulaEntries (ingredient_id, num_native_units, formula_id) VALUES ${formulaEntryCases.join(', ')}`);
    })
    .catch((err) => {
      throw err;
    });
}

/**
 *
 * @param {*} req
 * res.body.formulas = [
 *   {
 *      id: 'formulaId',
 *      name: 'formulaName',
 *      description: 'a description',
 *      num_product: 1,
 *      ingredients: [{
 *          'ingredient_id': 1
 *          'num_native_units': 1,
 *          },...
 *      ],
 *    },...
 * ]
 * @param {*} res
 * @param {*} next
 */
export function modify(req, res, next) {
  // check names all exist in database
  let formulas = req.body.formulas;
  let formulaIds = [];
  let hasAllIds = true;
  hasAllIds = checkFormulaIds(formulas, formulaIds, hasAllIds);
  if (!hasAllIds) {
    handleError(createError('Did not specify id for formula'), res);
    return;
  }

  let formulaIngredients = formulas.map(x => x.ingredients);

  if (!checkFormulaIngredientParams(formulaIngredients)) {
    handleError(createError('Must give ingredient_id and num_native_units for ingredient'), res);
    return;
  }

  let intermediateUpdates = [];
  let toUpdate = [];
  createIntermediateUpdates(formulas, intermediateUpdates)
    .then(() => {
      return connection.query(`${formulaQueryString} AND id IN (${formulaIds.join(', ')})`);
    })
    .then((formulaResults) => {
      if (formulaResults.length != formulas.length) {
        throw createError('Trying to modify formula not in database');
      }
      let oldIdNameTuple = {};
      formulaResults.forEach(x => {
        oldIdNameTuple[x.id] = x.name;
      });
      // update formula values
      formulas.forEach(x => {
        let newUpdate = Object.assign({}, x);
        delete newUpdate.ingredients;
        if ('intermediate_properties' in newUpdate) {
          delete newUpdate.intermediate_properties;
        }
        newUpdate['name'] = x.name || oldIdNameTuple[x.id];
        x['name'] = x.name || oldIdNameTuple[x.id];
        toUpdate.push(newUpdate);
      });
      return updateDatabaseHelper('Formulas', toUpdate);
    })
    .then(() => {
      if (intermediateUpdates.length > 0) {
        return updateDatabaseHelper('Ingredients', intermediateUpdates);
      }
    })
    .then(() => {
      if (intermediateUpdates.length > 0) {
        const ingredientIds = intermediateUpdates.map(x => x.id);
        return connection.query(`SELECT id, name FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`);
      } else {
        return [];
      }
    })
    .then((updatedIngredientNames) => {
      if (updatedIngredientNames.length > 0) {
        const nameStrings = updatedIngredientNames.map(x => `{${x.name}=ingredient_id=${x.id}}`);
        return logAction(req.payload.id, `Intermediate product${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} modified.`);
      }
    })
    .then(() => {
      return connection.query(`DELETE FROM FormulaEntries WHERE formula_id IN (${formulaIds.join(', ')})`);
    })
    .then(() => {
      // add all new updated entries
      return addFormulaEntries(formulas);
    })
    .then(() => {
      return connection.query(`${formulaQueryString} AND id IN (${formulaIds.join(', ')})`);
    })
    .then((results) => {
      const formulaStrings = results.map(x => {
        return `{${x.name}=formula_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Formula${formulaStrings.length > 1 ? 's' : ''} ${formulaStrings.join(', ')} modified.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

function checkFormulaIds(formulas, formulaIds, hasAllIds) {
  formulas.forEach(x => {
    if ('id' in x) {
      formulaIds.push(x.id);
    } else {
      hasAllIds = false;
    }
  });
  return hasAllIds;
}

function checkFormulaIngredientParams(formulaIngredients) {
  formulaIngredients.forEach(f => {
    f.forEach((i) => {
      if (!('ingredient_id' in i) || !('num_native_units' in i)) {
        return false;
      }
    });
  });
  return true;
}

function createIntermediateUpdates(formulas, intermediateUpdates) {
  let intermediateMap = {};
  let allFormulasWithIntermediateProperty = [];
  createIntermediateMapping(formulas, allFormulasWithIntermediateProperty, intermediateMap, intermediateUpdates);
  return (allFormulasWithIntermediateProperty.length == 0 ? Promise.resolve([]) : connection.query(`SELECT id, intermediate, ingredient_id FROM Formulas WHERE id IN (${allFormulasWithIntermediateProperty.join(', ')})`))
  .then((results) => {
    checkIntermediateValidity(results, intermediateMap);
  })
  .catch((err) => {
    throw err;
  });
}

function createIntermediateMapping(formulas, allFormulasWithIntermediateProperty, intermediateMap, intermediateUpdates) {
  formulas.forEach(x => {
    if ('intermediate' in x) {
      allFormulasWithIntermediateProperty.push(x.id);
    }
    if ('intermediate' in x && x.intermediate) {
      if ('intermediate_properties' in x && Object.keys(x.intermediate_properties).length > 0) {
        intermediateMap[x.id] = x.intermediate_properties;
        intermediateUpdates.push(x.intermediate_properties || {});
      }
    }
  });
}

function checkIntermediateValidity(results, intermediateMap) {
  results.forEach(x => {
    if (x.intermediate) {
      if (!(x.id in intermediateMap)) {
        throw createError('Cannot change intermediate formula to final formula.');
      } else if (Object.keys(intermediateMap[x.id]).length > 0) {
          if (!('id' in intermediateMap[x.id])) {
            throw createError('Trying to change intermediates without giving associated ingredient id');
          } else if (intermediateMap[x.id].id != x.ingredient_id) {
              throw createError('Cannot change associated ingredient id for intermediate');
          }
      }
    }
  });
}

/**
 * Fake delete from database
 * @param {*} req
 * req.body.formulas = [1, 2, 3]
 * @param {*} res
 * @param {*} next
 */
export function deleteFormulas(req, res, next) {
  let oldFormulas;
  const toDelete = req.headers.formulaid.split(', ');
  connection.query(`${formulaQueryString} AND id IN (${toDelete.join(', ')})`)
    .then((results) => {
      oldFormulas = results;
      if (results.length != toDelete.length) {
        throw createError('Trying to delete element not in database');
      }
      return connection.query(`DELETE FROM FormulaEntries WHERE formula_id IN (${toDelete.join(', ')})`);
    })
    .then(() => {
      return connection.query(`UPDATE Formulas SET removed = 1, isactive = NULL WHERE id IN (${toDelete.join(', ')})`);
    })
    .then(() => {
      const formulaStrings = oldFormulas.map(x => {
        return `{${x.name}=formula_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Formula${formulaStrings.length > 1 ? 's' : ''} ${formulaStrings.join(', ')} deleted.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      handleError(err, res);
    });
}


export function finalBulkImport(req, res, next) {
  const csv = fs.readFileSync(req.file.path);
  const papaResponse = Papa.parse(csv.toString());
  const data = papaResponse.data;

  const formattingError = checkForFinalBulkImportFormattingErrors(data);
  if (formattingError) {
    return handleError(createError(formattingError), res);
  }

  const slicedData = data.slice(1);
  const entries = slicedData.map(a => {
    return {
      formula: a[0],
      amount: a[1],
      description: a[2],
      ingredient: a[3],
      numNativeUnits: a[4],
    };
  });

  let formulasToAdd = '';
  let prevFormulaNames = [];
  // Make sure no repeated formulas
  connection.query(`SELECT name FROM Formulas`)
    .then(formulas => {
      for (let entry of entries) {
        const duplicateFormula = formulas.find(formula => formula.name.toLowerCase() == entry.formula.toLowerCase());
        if (duplicateFormula) throw createError(`Formula ${entry.formula} already exists`);

        if (prevFormulaNames.length == 0 || entry.formula != prevFormulaNames[prevFormulaNames.length - 1]) {
          prevFormulaNames.push(entry.formula);
          formulasToAdd += `('${entry.formula}', '${entry.description}', ${entry.amount}),`;
        }
      }
      return connection.query(`SELECT id, name, removed FROM Ingredients`);
    })
    // Make sure ingredients exist
    .then(ingredients => {
      for (let entry of entries) {
        const existingIngredient = ingredients.find(ingredient => ingredient.name.toLowerCase() == entry.ingredient.toLowerCase() && ingredient.removed == 0);
        if (!existingIngredient) throw createError(`Ingredient ${entry.ingredient} does not exist`);
        entry.ingredientId = existingIngredient.id;
      }
      // Add formulas
      return connection.query(`INSERT INTO Formulas (name, description, num_product) VALUES ${formulasToAdd.slice(0, -1)}`);
    })
    .then(() => connection.query(`SELECT * FROM Formulas`))
    .then(formulas => {
      // Add formula entries
      let formulaEntriesToAdd = '';
      for (let entry of entries) {
        const formulaFromDb = formulas.find(formula => formula.name == entry.formula);
        entry.id = formulaFromDb.id;
        formulaEntriesToAdd += `(${entry.ingredientId}, ${entry.numNativeUnits}, ${formulaFromDb.id}),`;
      }
      return connection.query(`INSERT INTO FormulaEntries (ingredient_id, num_native_units, formula_id) VALUES ${formulaEntriesToAdd.slice(0, -1)}`);
    })
    .then(() => {
      let queryStrings = [];
      for (let entry of entries) {
        queryStrings.push(`{${entry.formula}=formula_id=${entry.id}}`);
      }
      return logAction(req.payload.id, `Bulk import added the following formulas: ${queryStrings.join(', ')}`);
    })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      handleError(err, res);
    });
}

function checkForFinalBulkImportFormattingErrors(data) {
  const headers = ['NAME', 'PRODUCT UNITS', 'DESCRIPTION', 'INGREDIENT', 'INGREDIENT UNITS'];
  if (data[0].length != headers.length) return `Headers incorrectly formatted. Should be ${headers.length} but received ${data[0].length}.`;
  for (let i = 0; i < headers.length; i++) {
    if (data[0][i] !== headers[i]) {
      return `Incorrect header in column ${i + 1}. Should be ${headers[i]} but received ${data[0][i]}.`;
    }
  }
  let prevFormulaNames = [];
  let isFirstRowOfFormula = true;
  for (let i = 1; i < data.length; i++) {
    if (data[i].length != headers.length) {
      // Check for the new line at bottom of sheet
      if (i == data.length - 1 && data[i].length == 1 && data[i][0] == '') {
        data = data.pop();
        return;
      } else return `Incorrect number of columns in row ${i + 1}. Should be ${headers.length} but received ${data[i].length}.`;
    }
    // Ensure valid formula name
    if (prevFormulaNames.length == 0 || data[i][0] != prevFormulaNames[prevFormulaNames.length - 1]) {
      if (prevFormulaNames.indexOf(data[i][0]) >= 0) return `${data[i][0]} formula is not in consecutive rows`;
      prevFormulaNames.push(data[i][0]);
      isFirstRowOfFormula = true;
    } else {
      isFirstRowOfFormula = false;
    }
    // Ensure integer number of product units
    if (isFirstRowOfFormula && !checkNumber.isPositiveInteger(data[i][1])) return `Invalid amount in product units: ${data[i][1]}`;
    // Ensure valid ingredient num native units
    if (isNaN(data[i][4]) || data[i][4] <= 0) return `Invalid ingredient units: ${data[i][4]}`;
  }
}

// INTERMEDIATE

export function intermediateBulkImport(req, res, next) {
  const csv = fs.readFileSync(req.file.path);
  const papaResponse = Papa.parse(csv.toString());
  const data = papaResponse.data;

  const formattingError = checkForIntermediateBulkImportFormattingErrors(data);
  if (formattingError) {
    return handleError(createError(formattingError), res);
  }

  const slicedData = data.slice(1);
  const entries = slicedData.map(a => {
    return {
      formula: a[0],
      amount: a[1],
      description: a[2],
      package: a[3],
      nativeUnits: a[4],
      unitsPerPackage: a[5],
      temperature: a[6],
      ingredient: a[7],
      numNativeUnits: a[8],
    };
  });

  let formulasToAdd = '';
  const prevFormulaNames = [];
  const newIntermediateIngredients = [];

  // Make sure no repeated formulas
  Promise.all([
    connection.query(`SELECT name FROM Formulas`),
    connection.query(`SELECT id FROM Ingredients`),
  ])
    .then(results => {
      const [formulas, ingredients] = results;
      let lastIngredientId = ingredients.length;
      for (let entry of entries) {
        lastIngredientId++;
        const duplicateFormula = formulas.find(formula => formula.name.toLowerCase() == entry.formula.toLowerCase());
        if (duplicateFormula) throw createError(`Formula ${entry.formula} already exists`);

        if (prevFormulaNames.length == 0 || entry.formula != prevFormulaNames[prevFormulaNames.length - 1]) {
          prevFormulaNames.push(entry.formula);
          formulasToAdd += `(1, ${lastIngredientId}, '${entry.formula}', '${entry.description}', ${entry.amount}),`;

          newIntermediateIngredients.push([entry.formula, entry.package, validStorageTypes.indexOf(entry.temperature) + 1, entry.nativeUnits, entry.unitsPerPackage, 1]);
        }
      }
      return connection.query(`SELECT id, name, removed FROM Ingredients`);
    })
    // Make sure ingredients exist
    .then(ingredients => {
      for (let entry of entries) {
        const existingIngredient = ingredients.find(ingredient => ingredient.name.toLowerCase() == entry.ingredient.toLowerCase() && ingredient.removed == 0);
        if (!existingIngredient) throw createError(`Ingredient ${entry.ingredient} does not exist`);
        entry.ingredientId = existingIngredient.id;
      }

      return connection.query(`INSERT INTO Ingredients (name, package_type, storage_id, native_unit, num_native_units, intermediate) VALUES ?`, [newIntermediateIngredients]);
    })
    .then(() => {
      // Add formulas
      return connection.query(`INSERT INTO Formulas (intermediate, ingredient_id, name, description, num_product) VALUES ${formulasToAdd.slice(0, -1)}`);
    })
    .then(() => connection.query(`SELECT * FROM Formulas`))
    .then(formulas => {
      // Add formula entries
      let formulaEntriesToAdd = '';
      for (let entry of entries) {
        const formulaFromDb = formulas.find(formula => formula.name == entry.formula);
        entry.id = formulaFromDb.id;
        formulaEntriesToAdd += `(${entry.ingredientId}, ${entry.numNativeUnits}, ${formulaFromDb.id}),`;
      }
      return connection.query(`INSERT INTO FormulaEntries (ingredient_id, num_native_units, formula_id) VALUES ${formulaEntriesToAdd.slice(0, -1)}`);
    })
    .then(() => {
      let queryStrings = [];
      for (let entry of entries) {
        queryStrings.push(`{${entry.formula}=formula_id=${entry.id}}`);
      }
      return logAction(req.payload.id, `Bulk import added the following formulas: ${queryStrings.join(', ')}`);
    })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      handleError(err, res);
    });
}

function checkForIntermediateBulkImportFormattingErrors(data) {
  const headers = ['NAME', 'PRODUCT UNITS', 'DESCRIPTION', 'PACKAGE', 'NATIVE UNIT', 'UNITS PER PACKAGE', 'TEMPERATURE', 'INGREDIENT', 'INGREDIENT UNITS'];
  if (data[0].length != headers.length) return `Headers incorrectly formatted. Should be ${headers.length} but received ${data[0].length}.`;
  for (let i = 0; i < headers.length; i++) {
    if (data[0][i] !== headers[i]) {
      return `Incorrect header in column ${i + 1}. Should be ${headers[i]} but received ${data[0][i]}.`;
    }
  }
  let prevFormulaNames = [];
  let isFirstRowOfFormula = true;
  for (let i = 1; i < data.length; i++) {
    if (data[i].length != headers.length) {
      // Check for the new line at bottom of sheet
      if (i == data.length - 1 && data[i].length == 1 && data[i][0] == '') {
        data = data.pop();
        return;
      } else return `Incorrect number of columns in row ${i + 1}. Should be ${headers.length} but received ${data[i].length}.`;
    }
    // Ensure valid formula name
    if (prevFormulaNames.length == 0 || data[i][0] != prevFormulaNames[prevFormulaNames.length - 1]) {
      if (prevFormulaNames.indexOf(data[i][0]) >= 0) return `${data[i][0]} formula is not in consecutive rows`;
      prevFormulaNames.push(data[i][0]);
      isFirstRowOfFormula = true;

      // Ensure valid package type
      try {
        getSpace(data[i][3].toLowerCase());
      } catch (error) {
        return `Invalid package type: ${data[i][3]}`;
      }
      // Ensure positive units per package
      if (isNaN(data[i][5]) || data[i][5] <= 0) return `Invalid number of units per package: ${data[i][5]}`;
      // Ensure valid storage type
      // Edit #6 changed it to frozen and refrigerated, changing back to freezer and refrigerator for ease of integration
      if (data[i][6] == 'frozen') data[i][6] = 'freezer';
      else if (data[i][6] == 'refrigerated') data[i][6] = 'refrigerator';
      else if (data[i][6] == 'room temperature') data[i][6] = 'warehouse';
      if (validStorageTypes.indexOf(data[i][6].toLowerCase()) < 0) return `Invalid package type: ${data[i][6]}`;
    } else {
      isFirstRowOfFormula = false;
    }
    // Ensure integer number of product units
    if (isFirstRowOfFormula && !checkNumber.isPositiveInteger(data[i][1])) return `Invalid amount in product units: ${data[i][1]}`;

    // Ensure valid ingredient num native units
    if (isNaN(data[i][8]) || data[i][8] <= 0) return `Invalid ingredient units: ${data[i][8]}`;
  }
}
