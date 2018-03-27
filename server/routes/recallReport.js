import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';

const productionEntriesQuery = `SELECT ProductRunsEntries.*`;

/**
 *
 * @param {*} req
 * req.query.recall = {
 *    ingredient_id: 1,
 *    lot: 'bleb123',
 * }
 * @param {*} res
 * @param {*} next
 */
export function getRecallForIngredient(req, res, next) {
  const recallParams = req.query.recall;
  try {
    checkRecallParams(recallParams);
  } catch (err) {
    handleError(err, res);
    return;
  }

  getProducts(recallParams, new Set())
    .then((productruns) => {
      return queryProductRunInformation(productruns);
    })
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

function queryProductRunInformation(productids) {
  let productRunMap = {};
  return connection.query(`SELECT ProductRuns.*, Formulas.name
    FROM ProductRuns JOIN Formulas ON ProductRuns.formula_id = Formulas.id
    WHERE ProductRuns.id IN (${Array.from(productids).join(', ')})`)
    .then((productRuns) => {
      productRuns.forEach(x => {
        productRunMap[x.id] = x;
        productRunMap[x.id]['ingredients'] = [];
      });
      const productRunIds = productRuns.map(x => x.id);
      return connection.query(`SELECT * FROM ProductRunsEntries WHERE productrun_id IN (${productRunIds.join(', ')})`);
    })
    .then((productEntriesResult) => {
      productEntriesResult.forEach(x => {
        productRunMap[x.productrun_id]['ingredients'].push(x);
      });
      return Promise.resolve(Object.values(productRunMap));
    })
    .catch((err) => {
      throw err;
    });
}

function getProducts(params, myProductIds) {
  const conditionString = makeConditionString(params);
  return new Promise((resolve, reject) => {
    queryProductionRuns(conditionString)
      .then((productEntries) => {
        let intermediatesProduced = [];
        productEntries.forEach(x => {
          if (x.intermediate) {
            intermediatesProduced.push(x);
          }
          myProductIds.add(x.productrun_id);
        });
        let promiseArray = [];
        intermediatesProduced.forEach(x => {
          let myParams = createParamObject(x);
          promiseArray.push(getProducts(myParams, myProductIds));
        });
        return Promise.all(promiseArray);
      })
      .then((ids) => {
        resolve(myProductIds);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function createParamObject(x) {
  return {
    'ingredient_id': x.product_ingredient_id,
    'lot': x.product_lot,
  };
}

function queryProductionRuns(conditionString) {
  return connection.query(`${productionEntriesQuery}, ProductRuns.formula_id, ProductRuns.lot as product_lot,
  Formulas.ingredient_id as product_ingredient_id, Formulas.intermediate
  FROM ProductRunsEntries
  JOIN ProductRuns ON ProductRunsEntries.productrun_id = ProductRuns.id
  JOIN Formulas ON ProductRuns.formula_id = Formulas.id
  ${conditionString}`);
}

function filterDuplicateFormulaLots(intermediatesProduced) {
  return intermediatesProduced.filter((x, index, self) => {
    return self.findIndex((i) => {
      i.lot == x.lot && i.product_ingredient_id == x.product_ingredient_id;
    });
  });
}

function makeConditionString(params) {
  let cases = [];
  Object.keys(params).forEach(x => {
    if (isNaN(params[x])) {
      cases.push(`ProductRunsEntries.${x} = '${params[x]}'`);
    } else {
      cases.push(`ProductRunsEntries.${x} = ${params[x]}`);
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
