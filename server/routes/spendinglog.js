import * as checkNumber from './common/checkNumber';
import { getNumPages, queryWithPagination } from './common/pagination';
import { getWeight } from './common/packageUtilies';

const basicViewQueryString = 'SELECT SpendingLogs.*, Ingredients.name AS ingredient_name, Ingredients.storage_id AS ingredient_storage_id, Ingredients.removed AS ingredient_removed FROM SpendingLogs INNER JOIN Ingredients ON SpendingLogs.ingredient_id = Ingredients.id';

export function pages(req, res, next) {
  getNumPages('SpendingLogs')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'SpendingLogs', basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function logsForIngredient(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  if (!ingredientId) {
    return res.status(400).send('Invalid input request, see doc.');
  }
  if (!checkNumber.isPositiveInteger(ingredientId)) {
    return res.status(400).send(`Ingredient ID ${ingredientId} is invalid.`);
  }
  connection.query(`${basicViewQueryString} WHERE ingredient_id IN (${ingredientId})`)
  .then(results => res.status(200).send(results))
  .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
  });
}

/* Request format:
 * req = {
 *   '1': {
 *      'total_weight': 100,
 *      'cost': 10,
 *   }
 *   '2': {
 *      'total_weight': 50,
 *      'cost': 30,
 *   }
 *  ...
 * }
 * Key is ingredient id.
 */
export function updateLogForIngredient(req) {
  connection.query(`SELECT id, ingredient_id, total, total_weight FROM SpendingLogs WHERE ingredient_id IN (${Object.keys(req).join(', ')})`)
    .then(results => {
      let toUpdate = {
        'ids': [],
        'ingredient_ids': new Set(),
      };
      let updateTotalCostCases = [];
      let updateTotalWeightCases = [];
      for (let log of results) {
        let ingredientId = log['ingredient_id'];
        toUpdate['ids'].push(log['id']);
        toUpdate['ingredient_ids'].add(`${ingredientId}`);
        updateTotalCostCases.push(`when id = ${log['id']} then ${req[ingredientId]['cost'] + log['total']}`);
        updateTotalWeightCases.push(`when id = ${log['id']} then ${req[ingredientId]['total_weight'] + log['total_weight']}`);
      }

      let newIngredientIds = Object.keys(req).filter(x => !toUpdate['ingredient_ids'].has(x));
      let newIngredientTotals = newIngredientIds.map(x => req[x]['cost']);
      let newIngredientWeights = newIngredientIds.map(x => req[x]['total_weight']);
      let newConsumed = new Array(newIngredientIds.length).fill(0);
      let newUpdate = [];
      for (let i = 0; i < newConsumed.length; i++) {
        newUpdate.push(`(${newIngredientIds[i]}, ${newIngredientTotals[i]}, ${newIngredientWeights[i]}, ${newConsumed[i]})`);
      }
      connection.query(`INSERT INTO SpendingLogs (ingredient_id, total, total_weight, consumed) VALUES ${newUpdate.join(', ')}`)
      connection.query(`UPDATE SpendingLogs 
      SET total = (case ${updateTotalCostCases.join(' ')} end), total_weight = (case ${updateTotalWeightCases.join(' ')} end)
      WHERE id IN (${toUpdate['ids'].join(', ')})`);
    })
    .catch(err => {
      throw err;
    });
}

/* Request format:
 * req = [
 *   {'id(inventory)', 'ingredient_id', 'package_type', 'num_packages'},
 *   ...
 * ];
 */
export function updateConsumedSpendingLogForCart(req) {
  return new Promise((resolve, reject) => {
    const consumedWeights = {};
    const ingredientIds = [];
    for (let consumed of req) {
      const ingredientId = consumed.ingredient_id;
      if (!(ingredientId in consumedWeights)) {
        consumedWeights[ingredientId] = 0;
        ingredientIds.push(ingredientId);
      }
      consumedWeights[ingredientId] +=
        getWeight(consumed.package_type) * consumed.num_packages;
    }
    const cases = [];
    connection.query(`SELECT * FROM SpendingLogs
                      WHERE ingredient_id
                      IN (${ingredientIds.join(', ')})`)
      .then(results => {
        for (let entry of results) {
          const cost =
            consumedWeights[entry.ingredient_id] / entry.total_weight * entry.total;
          cases.push(`when id = ${entry.id} then ${cost}`);
        }
      })
      .then(() => connection.query(`UPDATE SpendingLogs 
        SET consumed = consumed + (case ${cases.join(' ')} end)
        WHERE ingredient_id IN (${ingredientIds.join(', ')})`))
      .then(() => resolve())
      .catch(err => reject(err));
  });
}
