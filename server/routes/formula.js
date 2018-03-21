import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
import { updateDatabaseHelper } from './common/updateUtilities';
import { getPaginationQueryString, getNumPages } from './common/pagination';
import { logAction } from './systemLogs';

const fs = require('fs');
const Papa = require('papaparse');


const formulaQueryString = 'SELECT * FROM Formulas WHERE removed = 0';
const formulaEntryQuery = 'SELECT FormulaEntries.*';
const dbFormulaNameCheck = `${formulaQueryString} AND name IN`;

const numColumnsForBulkImport = 5;

export function pages(req, res, next) {
  getNumPages('Formulas')
    .then(results => res.status(200).send(results))
    .catch(err => {
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  const viewByPageQuery = getPaginationQueryString(req.params.page_num, 'Formulas', formulaQueryString);
  getFormulas(viewByPageQuery, req, res, next);
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function viewAll(req, res, next) {
  getFormulas(formulaQueryString, req, res, next);
}

export function viewWithId(req, res, next) {
  if (!req.params.id || !checkNumber.isPositiveInteger(req.params.id)) {
    return res.status(400).send('Invalid vendor id');
  }
  getFormulas(`SELECT * FROM Formulas WHERE id = ${req.params.id}`, req, res, next);
}

function getFormulas(queryString, req, res, next) {
  let myFormulas = {};
  connection.query(`${queryString}`)
    .then((results) => {
      results.forEach(x => {
        let formulaObject = x;
        formulaObject['ingredients'] = {};
        // let formulaObject = {
        //   'id': x.id,
        //   'name': x.name,
        //   'description': x.description,
        //   'num_product': x.num_product,
        //   'intermediate': x.intermediate,
        //   'removed': x.removed,
        //   'ingredients': {},
        // };
        myFormulas[`${x.id}`] = formulaObject;
      });
      return connection.query(`${formulaEntryQuery}, Ingredients.name, Ingredients.package_type, Ingredients.storage_id, Ingredients.native_unit, Ingredients.num_native_units as ingredient_num_native_units, Ingredients.removed FROM FormulaEntries
            JOIN Ingredients ON FormulaEntries.ingredient_id = Ingredients.id`);
    })
    .then((formulaEntries) => {
      formulaEntries.forEach(x => {
        myFormulas[`${x['formula_id']}`]['ingredients'][`${x.name}`] = x;
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
 *      num_product: 1
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
  let formulaCases = [];
  formulas.forEach(x => {
    names.push(`'${x.name}'`);
    formulaCases.push(`('${x.name}', '${x.description}', ${x.num_product})`);
  });
  connection.query(`${dbFormulaNameCheck} (${names.join(', ')})`)
    .then((results) => {
      if (results.length > 0) {
        throw createError('Trying to add a formula that already exists in database');
      }
      return connection.query(`INSERT INTO Formulas (name, description, num_product) VALUES ${formulaCases.join(', ')}`);
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
  formulas.forEach(x => {
    if ('id' in x) {
      formulaIds.push(x.id);
    } else {
      hasAllIds = false;
    }
  });
  if (!hasAllIds) {
    handleError(createError('Did not specify id for formula'), res);
    return;
  }

  let formulaIngredients = formulas.map(x => x.ingredients);
  let hasIngredientParams = true;
  formulaIngredients.forEach(f => {
    f.forEach((i) => {
      if (!('ingredient_id' in i) || !('num_native_units' in i)) {
        hasIngredientParams = false;
      }
    });
  });

  if (!hasIngredientParams) {
    handleError(createError('Must give ingredient_id and num_native_units for ingredient'), res);
    return;
  }

  let toUpdate = [];
  connection.query(`${formulaQueryString} AND id IN (${formulaIds.join(', ')})`)
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
        newUpdate['name'] = x.name || oldIdNameTuple[x.id];
        x['name'] = x.name || oldIdNameTuple[x.id];
        toUpdate.push(newUpdate);
      });
      return updateDatabaseHelper('Formulas', toUpdate);
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
      return connection.query(`UPDATE Formulas SET removed = 1 WHERE id IN (${toDelete.join(', ')})`);
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

function checkForBulkImportFormattingErrors(data) {
  if (data[0].length != numColumnsForBulkImport) return `Headers incorrectly formatted. Should be ${numColumnsForBulkImport} but received ${data[0].length}.`;
  const headers = ['FORMULA', 'PRODUCT UNITS', 'DESCRIPTION', 'INGREDIENT', 'INGREDIENT UNITS'];
  for (let i = 0; i < headers.length; i++) {
    if (data[0][i] !== headers[i]) {
      return `Incorrect header in column ${i + 1}. Should be ${headers[i]} but received ${data[0][i]}.`;
    }
  }
  let prevFormulaNames = [];
  let isFirstRowOfFormula = true;
  for (let i = 1; i < data.length; i++) {
    if (data[i].length != numColumnsForBulkImport) {
      // Check for the new line at bottom of sheet
      if (i == data.length - 1 && data[i].length == 1 && data[i][0] == '') {
        data = data.pop();
        return;
      } else return `Incorrect number of columns in row ${i + 1}. Should be ${numColumnsForBulkImport} but received ${data[i].length}.`;
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
