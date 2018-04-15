import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
import { updateDatabaseHelper } from './common/updateUtilities';
import { logAction } from './systemLogs';
import { checkParamId } from './common/checkParams';


const productionLineQuery = `SELECT * FROM Productionlines WHERE isactive = 'Y'`;
const productionOccupanciesQuery = `SELECT * FROM ProductionlinesOccupancies`;
const formulaProductionQuery = `SELECT FormulaProductionLines.*, Formulas.name as formula_name FROM FormulaProductionLines
  JOIN Formulas ON FormulaProductionLines.formula_id = Formulas.id`;

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function view(req, res, next) {
  let productionLineMap = {};
  connection.query(`${productionLineQuery}`)
    .then((productionLines) => {
      productionLines.forEach(line => {
        productionLineMap[line.id] = line;
        productionLineMap[line.id].occupancies = [];
        productionLineMap[line.id].formulas = [];
      });
      return connection.query(`${productionOccupanciesQuery} WHERE busy = 1`);
    })
    .then((productionOccupancies) => {
      productionOccupancies.forEach(occupancy => {
        productionLineMap[occupancy.productionline_id].occupancies.push(occupancy);
      });
      return connection.query(`${formulaProductionQuery}`);
    })
    .then((formulaLines) => {
      formulaLines.forEach(formulaLine => {
        const formula = {
          'name': formulaLine.formula_name,
          'formula_id': formulaLine.formula_id,
        };
        productionLineMap[formulaLine.productionline_id].formulas.push(formula);
      });
      res.status(200).send(Object.values(productionLineMap));
    })
    .catch(err => {
      handleError(err, res);
    });
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function viewWithId(req, res, next) {
  if (!checkParamId(req, res, 'Invalid production line id')) {
    return;
  }
  let myProductionLine = [];
  connection.query(`${productionLineQuery} AND id = ${req.params.id}`)
    .then((productionLine) => {
      myProductionLine = productionLine;
      myProductionLine[0].occupancies = [];
      myProductionLine[0].formulas = [];
      return connection.query(`${productionOccupanciesQuery} WHERE busy = 1 AND productionline_id = ${req.params.id}`);
    })
    .then((occupancy) => {
      occupancy.forEach(x => {
        myProductionLine[0].occupancies.push(x);
      });
      return connection.query(`${formulaProductionQuery} WHERE FormulaProductionLines.productionline_id = ${req.params.id}`);
    })
    .then((formulaLines) => {
      formulaLines.forEach(formulaLine => {
        const formula = {
          'name': formulaLine.formula_name,
          'formula_id': formulaLine.formula_id,
        };
        myProductionLine[0].formulas.push(formula);
      });
      res.status(200).send(myProductionLine);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/**
 *
 * @param {*} req
 * req.body.lines = [
 *  {
 *    'name': 'bleb',
 *    'description': 'something',
 *    'formulas': [
 *      1,
 *    ],
 *  },
 * ]
 * @param {*} res
 * @param {*} next
 */
export function add(req, res, next) {
  const productionLines = req.body.lines;
  if (!checkProductionLineParams(productionLines)) {
    handleError(createError('Invalid production line parameters'), res);
    return;
  }
  let myAddedLines = [];
  addProductionLine(productionLines)
    .then(() => {
      return addFormulaProductionLines(productionLines);
    })
    .then((addedLines) => {
      myAddedLines = addedLines;
      let formulaIds = [];
      productionLines.forEach(line => {
        formulaIds = formulaIds.concat(line.formulas);
      });
      return formulaIds.length !== 0
       ? connection.query(`SELECT id, name FROM Formulas WHERE id IN (?)`, [formulaIds])
       : Promise.resolve([]);
    })
    .then((formulas) => {
      console.log(myAddedLines);
      let productionLineStrings = createProductionLineLogString(formulas, productionLines, myAddedLines);
      return logAction(req.payload.id, `Created ${productionLineStrings.join(',  ')}.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      console.log(err);
      handleError(err, res);
    });
}

function createProductionLineLogString(formulas, productionLines, myAddedLines) {
  let formulaNameIdTuple = {};
  formulas.forEach(x => {
    formulaNameIdTuple[x.id] = x.name;
  });
  let productionFormulaMap = {};
  productionLines.forEach(line => {
    let formulasStrings = line.formulas.length > 0 ?
      line.formulas.map(formulaId => {
        return `{${formulaNameIdTuple[formulaId]}=formula_id=${formulaId}}`;
      }) : [];
    productionFormulaMap[line.name] = formulasStrings;
  });
  let productionLineStrings = myAddedLines.map(addedLine => {
    return `production line {${addedLine.name}=productionline_id=${addedLine.id}}
        ${productionFormulaMap[addedLine.name].length > 0 ? ` with formula(s) ${productionFormulaMap[addedLine.name].join(', ')}` : ''}`;
  });
  return productionLineStrings;
}

function addProductionLine(productionLines) {
  const productionLineCases = productionLines.map(x => {
    return [x.name, x.description];
  });
  return connection.query(`INSERT INTO Productionlines (name, description) VALUES ?`, [productionLineCases]);
}

function addFormulaProductionLines(productionLines) {
  const lineNames = productionLines.map(x => x.name);
  let myLines = [];
  return connection.query(`${productionLineQuery} AND name IN (?)`, [lineNames])
    .then(lines => {
      if (lines.length != lineNames.length) {
        throw createError('Trying to add formula to nonexistent production line.');
      }
      myLines = lines;
      let nameIdTuple = {};
      lines.forEach(line => {
        nameIdTuple[line.name] = line.id;
      });
      const formulaProductionLineCases = [];
      productionLines.forEach(line => {
        line.formulas.forEach(formulaLine => {
          formulaProductionLineCases.push([formulaLine, nameIdTuple[line.name]]);
        });
      });
      return formulaProductionLineCases.length > 0 ?
        connection.query(`INSERT INTO FormulaProductionLines (formula_id, productionline_id) VALUES ?`, [formulaProductionLineCases])
        : Promise.resolve();
    })
    .then(() => {
      return Promise.resolve(myLines);
    })
    .catch((err) => {
      throw createError('Error adding production line occupancies');
    });
}

/**
 * Adds a single formula to a production line
 * @param {*} req req.body.lineid = 1, req.body.formulaid = 2
 * @param {*} res
 * @param {*} next
 */
export function addFormulaToLine(req, res, next) {
  const lineId = req.body.lineid;
  const formulaId = req.body.formulaid;
  connection.query(`INSERT INTO FormulaProductionLines (formula_id, productionline_id) VALUES (${formulaId}, ${lineId})`)
    .then(() => {
      return getFormulaLineNames('MAX(FormulaProductionLines.id)', true);
    })
    .then((names) => {
      const addString = `formula {${names[0].formula_name}=formula_id=${formulaId}} to production line {${names[0].line_name}=productionline_id=${lineId}}`;
      return logAction(req.payload.id, `Added ${addString}.`);
    })
    .then(() => success(res))
    .catch((err) => {
      handleError(err, res);
    });
}

function getFormulaLineNames(condition, having) {
  return connection.query(`SELECT Formulas.name as formula_name, Productionlines.name as line_name 
      FROM FormulaProductionLines
      JOIN Formulas ON FormulaProductionLines.formula_id = Formulas.id
      JOIN Productionlines ON FormulaProductionLines.productionline_id = Productionlines.id
      ${having ? 'HAVING' : 'WHERE'} ${condition}`);
}

/**
 * Deletes a single formula from a production line
 * @param {*} req req.body.lineid = 1, req.body.formulaid = 2
 * @param {*} res
 * @param {*} next
 */
export function deleteFormulaFromLine(req, res, next) {
  const lineId = req.body.lineid;
  const formulaId = req.body.formulaid;
  let names = [];
  let formulaLineId;
  connection.query(`${formulaProductionQuery} WHERE productionline_id = ${lineId} AND formula_id = ${formulaId}`)
    .then((result) => {
      formulaLineId = result[0].id;
      if (result.length != 1) {
        throw createError('Trying to remove when formula not in production line');
      }
      return getFormulaLineNames(`FormulaProductionLines.id = ${formulaLineId}`);
    })
    .then((formulaLineNames) => {
      names = formulaLineNames;
      return connection.query(`DELETE FROM FormulaProductionLines WHERE id = ${formulaLineId}`);
    })
    .then(() => {
      const removeString = `formula {${names[0].formula_name}=formula_id=${formulaId}} from production line {${names[0].line_name}=productionline_id=${lineId}}`;
      return logAction(req.payload.id, `Removed ${removeString}.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      console.log(err);
      handleError(err, res);
    });
}

/**
 * All fields optional except id
 * @param {*} req
 * req.body.lines = [
 *  {
 *    'id': 1,
 *    'name': 'bleb',
 *    'description': 'something',
 *    'formulas': [
 *      1,
 *    ],
 *  },
 * ]
 * @param {*} res
 * @param {*} next
 */
export function modify(req, res, next) {
  const productionLines = req.body.lines;
  const checkIds = productionLines.every(x => {
    if (!checkNumber.isPositiveInteger(x.id)) {
      return false;
    } else {
      return true;
    }
  });

  if (!checkIds) {
    handleError(createError('Invalid production ids'), res);
    return;
  }

  const productionLineIds = productionLines.map(x => x.id);
  let toUpdate = [];
  let myLines = [];
  connection.query(`${productionLineQuery} AND id IN (?)`, [productionLineIds])
    .then((results) => {
      myLines = results;
      if (results.length != productionLines.length) {
        throw createError('Trying to update for nonexistent production line');
      }
      let oldIdNameTuple = {};
      results.forEach(x => {
        oldIdNameTuple[x.id] = x.name;
      });
      productionLines.forEach(x => {
        let newUpdate = Object.assign({}, x);
        if ('formulas' in x) {
          delete newUpdate.formulas;
        }
        newUpdate['name'] = x.name || oldIdNameTuple[x.id];
        x['name'] = x.name || oldIdNameTuple[x.id];
        toUpdate.push(newUpdate);
      });
      return updateDatabaseHelper('Productionlines', toUpdate);
    })
    .then(() => {
      return removeMappedFormulasToLines(productionLines.map(x => x.id));
    })
    .then(() => {
      return addFormulaProductionLines(productionLines);
    })
    .then(() => {
      const nameStrings = myLines.map(x => {
        return `{${x.name}=productionline_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Production line${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} modified.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      console.log(err);
      handleError(err, res);
    });
}


function removeMappedFormulasToLines(productionLineIds) {
  return connection.query(`DELETE FROM FormulaProductionLines WHERE productionline_id IN (?)`, [productionLineIds]);
}

/**
 *
 * @param {*} req
 * req.body.lines = [
 *  1,
 *  2,
 * ...
 * ]
 * @param {*} res
 * @param {*} next
 */
export function deleteProductionLine(req, res, next) {
  const productionLineIds = req.body.lines;
  let oldLines = [];
  connection.query(`${productionLineQuery} AND id IN (?)`, [productionLineIds])
    .then((results) => {
      if (results.length != productionLineIds.length) {
        throw createError('Trying to delete nonexistent production line');
      }
      oldLines = results;
    })
    .then(() => {
      return connection.query(`${productionOccupanciesQuery} WHERE id IN (?) AND busy = 1`, [productionLineIds]);
    })
    .then((occupancies) => {
      if (occupancies.length > 0) {
        throw createError('Trying to delete a busy production line');
      }
      return connection.query(`UPDATE Productionlines SET isactive = NULL WHERE id IN (?)`, [productionLineIds]);
    })
    .then(() => {
      removeMappedFormulasToLines(productionLineIds);
    })
    .then(() => {
      const nameStrings = oldLines.map(x => {
        return `{${x.name}=productionline_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Production line${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} deleted.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      console.log(err);
      handleError(err, res);
    });
}


/* request body format:
 * request.body = {
 *   "productionline_id": productionline_id
 * }
 * example:
 * {
 *   "productionline_id": 3
 * }
 */
export function completeProductionOnLine(req, res, next) {
  let selectResults;
  connection.query(`SELECT ProductionlinesOccupancies.intermediate_inventory_id, Formulas.intermediate AS formulas_intermediate, Formulas.num_product AS formulas_num_product, ProductRuns.num_product AS product_runs_num_product, Formulas.id AS formula_id, ProductRuns.id AS product_runs_id FROM ProductionlinesOccupancies
  JOIN ProductRuns ON ProductionlinesOccupancies.productrun_id = ProductRuns.id
  JOIN Formulas ON ProductionlinesOccupancies.formula_id = Formulas.id
  WHERE ProductionlinesOccupancies.productionline_id = ? AND ProductionlinesOccupancies.busy = 1`,
  [req.body.productionline_id])
  .then((results) => {
    if (results.length == 0) throw createError(`Production line with ID ${req.body.productionline_id} is not busy`);
    selectResults = results[0];
    return connection.query('UPDATE ProductionlinesOccupancies SET end_time = NOW(), busy = 0 WHERE productionline_id = ? and busy = 1', req.body.productionline_id);
  })
  .then(() => {
    if (selectResults.formulas_intermediate == 1) {
      return connection.query(`UPDATE Inventories SET arrived = 1 WHERE id = ?`, [selectResults.intermediate_inventory_id]);
    }
    else {
      return connection.query('INSERT INTO FinalProductInventories(productrun_id, formula_id, num_packages) VALUES (?)',
      [[selectResults.product_runs_id, selectResults.formula_id, selectResults.product_runs_num_product / selectResults.formulas_num_product]]);
    }
  })
  .then(() => logAction(req.payload.id, `Completed production on production line ${req.body.productionline_id}.`))
  .then(() => res.sendStatus(200))
  .catch((err) => handleError(err, res));
}

/**
 * Checks that the production line request has name, description, and formulas.
 * Formulas can be empty array
 * @param {Array} params production lines
 * @return {Boolean} true if has all parameters, false otherwise
 */
function checkProductionLineParams(params) {
  return params.every(line => {
    if (!line.name || !line.description || !line.formulas) {
      return false;
    } else {
      return true;
    }
  });
}
