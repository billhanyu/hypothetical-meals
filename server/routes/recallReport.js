import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';

const productionEntriesQuery = `SELECT ProductRunsEntries.*`;

/**
 *
 * @param {*} req
 * req.body.recall = {
 *    ingredient_id: 1,
 *    vendor_id: 1,
 *    lot: 'bleb123',
 * }
 * @param {*} res
 * @param {*} next
 */
export function getRecallForIngredient(req, res, next) {
  const recallParams = req.body.recall;
  try {
    checkRecallParams(recallParams);
  } catch (err) {
    handleError(err, res);
    return;
  }

  getProducts(recallParams)
    .then((productruns) => {
      return queryProductRunInformation();
    })
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/** get product run entries for each product run*/
function queryProductRunInformation() {
  return connection.query(`SELECT ProductRuns.*, Formulas.name
    FROM ProductRuns JOIN Formulas ON ProductRuns.formula_id = Formulas.id`);
}

function getProducts(params) {
  const conditionString = makeConditionString(params);
  let myProductIds = new Set();
  queryProductionRuns(conditionString)
    .then((productEntries) => {
      let intermediatesProduced = [];
      productionEntries.forEach(x => {
        if (x.intermediate) {
          intermediatesProduced.push(x);
        }
        myProductIds.add(x.productrun_id);
      });
      let uniqueIntermediates = filterDuplicateFormulaLots(intermediatesProduced);
      uniqueIntermediates.forEach(x => {
        let myParams = createParamObject(x);
        return getProducts(myParams);
      });
    })
    .catch(err => {
      throw err;
    });
  return myProductIds;
}

function createParamObject(x) {
  return {
    'ingredient_id': x.product_ingredient_id,
    'lot': x.lot,
  };
}

function queryProductionRuns(conditionString) {
  return connection.query(`${productionEntriesQuery}, ProductRuns.formula_id, 
  Formulas.ingredient_id as product_ingredient_id, Formulas.intermediate
  FROM ProductRunsEntries
  JOIN ProductRuns ON ProductRunsEntries.productrun_id = ProductRuns.id
  JOIN Formulas ON ProductRuns.formula_id = Formulas.id
  ${conditionString}`);
}

function filterDuplicateFormulaLots(intermediatesProduced) {
  return intermediatesProduced.filter((x, index, self) => {
    self.findIndex((i) => {
      i.lot === x.lot && i.product_ingredient_id === x.product_ingredient_id;
    });
  });
}

function makeConditionString(params) {
  let cases = [];
  Object.keys(params).forEach(x => {
    if (isNaN(params[x])) {
      cases.push(`${x} = '${params[x]}'`);
    } else {
      cases.push(`${x} = ${params[x]}`);
    }
  });
  return `WHERE ${cases.join(' AND ')}`;
}

function checkRecallParams(recallParams) {
  if (!('ingredient_id' in recallParams)) {
    throw createError('No ingredient_id specified');
  } else if (!('lot' in recallParams)) {
    throw createError('No lot specified');
  }
  // check for positive int for ingredient_id and vendor_id
  if (!checkNumber.isPositiveInteger(recallParams.ingredient_id)) {
    throw createError('Invalid ingredient_id');
  } else if ('vendor_id' in recallParams && !checkNumber.isPositiveInteger(recallParams.vendor_id)) {
    throw createError('Invalid vendor id');
  }
}
