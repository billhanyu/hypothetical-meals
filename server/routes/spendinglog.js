import * as checkNumber from './common/checkNumber';
import { getNumPages, queryWithPagination} from './common/pagination';

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
 *   '1': 1,
 *   '2': 20,
 *  ...
 * }
 * Key is ingredient, value is the cost.
 */
export function updateLogForIngredient(req) {
  connection.query(`SELECT id, ingredient_id, total FROM SpendingLogs WHERE ingredient_id IN (${Object.keys(req).join(', ')})`)
    .then(results => {
      let toUpdate = {
        'ids': [],
        'ingredient_ids': new Set(),
      };
      let updateCases = [];
      for (let log of results) {
        toUpdate['ids'].push(log['id']);
        toUpdate['ingredient_ids'].add(`${log['ingredient_id']}`);
        updateCases.push(`when id = ${log['id']} then ${req[log['ingredient_id']] + log['total']}`);
      }

      let newIngredientIds = Object.keys(req).filter(x => !toUpdate['ingredient_ids'].has(x));
      let newIngredientTotals = newIngredientIds.map(x => req[x]);
      let newConsumed = new Array(newIngredientIds.length).fill(0);
      let newUpdate = [];
      for (let i = 0; i < newConsumed.length; i++) {
        newUpdate.push(`(${newIngredientIds[i]}, ${newIngredientTotals[i]}, ${newConsumed[i]})`);
      }
      connection.query(`INSERT INTO SpendingLogs (ingredient_id, total, consumed) VALUES ${newUpdate.join(', ')}`)
      .then(() => {
        return connection.query(`UPDATE SpendingLogs SET total = (case ${updateCases.join(' ')} end) WHERE id IN (${toUpdate['ids'].join(', ')})`);
      })
      .catch(err => {
        throw err;
      });
    })
    .catch(err => {
      throw err;
    });
}
