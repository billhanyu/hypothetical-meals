import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
import { updateDatabaseHelper } from './common/updateUtilities';
import { logAction } from './systemLogs';
import { checkParamId } from './common/checkParams';


const productionLineQuery = `SELECT * FROM Productionlines WHERE isactive = 'Y'`;
const productionOccupanciesQuery = `SELECT * FROM ProductionlinesOccupancies`;
const formulaProductionQuery = `SELECT FormulaProductionLines*, Formulas.name as formula_name FROM FormulaProductionLines
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
        productionLineMap[formulaLine.productionline_id].push(`{${formulaLine.formula_name}=formula_id=${formulaLine.formula_id}}`);
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
      return connection.query(`${productionOccupanciesQuery} WHERE busy = 1 AND productionline_id = ${req.params.id}`);
    })
    .then((occupancy) => {
      occupancy.forEach(x => {
        myProductionLine[0].occupancies.push(x);
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
    handleError(createError('Invalid production line paramters'), res);
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
        formulaIds.concat(line.formulas);
      });
      return connection.query(`SELECT id, name FROM Formulas WHERE id IN (?)`, [formulaIds]);
    })
    .then((formulas) => {
      let productionLineStrings = createProductionLineLogString(formulas, productionLines, myAddedLines);
      return logAction(req.payload.id, `Created ${productionLineStrings.join(',  ')}.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
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
        ${productionFormulaMap[addedLine.name].length > 0 ? ` with formulas ${productionFormulaMap[addedLine.name].join(', ')}` : ''}`;
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
  const myLines = [];
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
      return connection.query(`INSERT INTO FormulaProductionLines (formula_id, productionline_id) VALUES (?)`, [formulaProductionLineCases]);
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
 * @param {*} req req.params.lineid = 1, req.params.formulaid = 2
 * @param {*} res
 * @param {*} next
 */
export function addFormulaToLine(req, res, next) {
  const lineId = req.params.lineid;
  const formulaId = req.params.formulaid;
  connection.query(`INSERT INTO FormulaProductionLines (formula_id, productionline_id) VALUES (${formulaId}, ${lineId})`)
    .then(() => {
      return getProductionOccupancyNames('MAX(ProductionlineOccupancies.id)');
    })
    .then((names) => {
      const addString = `formula {${names[0].formula_name}=formula_id=${formulaId}} to production line {${names[0].line_name}=productionline_id=${lineId}}`;
      return logAction(req.payload.id, `Added ${addString}.`);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

function getProductionOccupancyNames(id) {
  return connection.query(`SELECT Formulas.name as formula_name, Productionlines.name as line_name 
      FROM ProductionlineOccupancies
      JOIN Formulas ON ProductionlineOccupancies.formula_id = Formulas.id
      JOIN Productionlines ON ProductionlineOccupancies.productionline_id = Productionlines.id
      HAVING ProductionlineOccupancies.id = ${id}`);
}

/**
 * Deletes a single formula from a production line
 * @param {*} req req.params.lineid = 1, req.params.formulaid = 2
 * @param {*} res
 * @param {*} next
 */
export function deleteFormulaFromLine(req, res, next) {
  const lineId = req.params.lineid;
  const formulaId = req.params.formulaid;
  const names = [];
  let occupancyId;
  connection.query(`${productionOccupanciesQuery} WHERE productionline_id = ${lineId} AND formula_id = ${formulaId}`)
    .then((result) => {
      occupancyId = result.id;
      if (result.length < 1) {
        throw createError('Trying to remove when formula not in production line');
      }
      return getProductionOccupancyNames(occupancyId);
    })
    .then(() => {
      return connection.query(`DELETE FROM ProductionlineOccupancies WHERE id = ${occupancyId}`);
    })
    .then(() => {
      const removeString = `formula {${names[0].formula_name}=formula_id=${formulaId}} from production line {${names[0].line_name}=productionline_id=${lineId}}`;
      return logAction(req.payload.id, `Removed ${removeString}.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
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
  const productionLineIds = productionLines.map(x => x.id);
  const checkIds = productionLineIds.every(x => {
    if (!checkNumber.isPositiveInteger()) {
      return false;
    } else {
      return true;
    }
  });

  if (!checkIds) {
    handleError(createError('Invalid production ids'), res);
    return;
  }

  const productionLines = req.body.lines;
  let toUpdate = [];
  let myLines = [];
  connection.query(`${productionLineQuery} AND id IN (?)`, [])
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
      return connection.query(`DELETE FROM FormulaProductionLines WHERE productionline_id IN (?)`, [productionLines.map(x => x.id)]);
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
      handleError(err, res);
    });
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
  const productionLineIds = req.body.lines.map(x => x.id);
  const oldLines = [];
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
      const nameStrings = oldLines.map(x => {
        return `{${x.name}=productionline_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Production line${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} deleted.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/**
 * Checks that the production line request has name, description, and formulas.
 * Formulas can be empty array
 * @param {Array} params production lines
 * @return {Boolean} true if has all parameters, false otherwise
 */
function checkProductionLineParams(params) {
  return params.every(line => {
    if (!('name' in line)) {
      return false;
    } else if (!('description' in line)) {
      return false;
    } else if (!('formulas' in line) || !Array.isArray(line.formulas)) {
      return false;
    } else {
      return true;
    }
  });
}
