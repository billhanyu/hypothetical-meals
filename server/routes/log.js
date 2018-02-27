import * as checkNumber from './common/checkNumber';
import { updateLogForIngredient } from './spendinglog';
import { createError } from './common/customError';
import { getNumPages, queryWithPagination } from './common/pagination';

const basicViewQueryString = 'SELECT Logs.*, Users.username as user_username FROM Logs INNER JOIN Users ON Logs.user_id = Users.id';

export function pages(req, res, next) {
  getNumPages('Logs')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'Logs', basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

/* Request body format:
 * req.body = {
 *   'vendor_ingredient_ids': [1, 2, 3, ...],
 * }
 * This returns the log for the vendor ingredients.
 */
export function viewLogForIngredient(req, res, next) {
  const vendorIngredients = req.body.vendor_ingredient_ids;
  if (!vendorIngredients || vendorIngredients.length < 1) {
    throw createError('Invalid input request, see doc.');
  }
  const vendorIngredientIds = [];
  for (let idString of vendorIngredients) {
    if (!checkNumber.isPositiveInteger(idString)) {
      throw createError(`Vendor ingredient ID ${idString} is invalid.`);
    }
    vendorIngredientIds.push(idString);
  }
  queryWithPagination(req.params.page_num, 'Logs', `${basicViewQueryString} WHERE vendor_ingredient_id IN (${vendorIngredientIds.join(', ')})`)
  .then(results => res.status(200).send(results))
  .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

/* Request body format:
 * req = [{
 *   'vendor_ingredient_id': 2,
 *   'package_type': 'pail',
 *   'quantity': 10,
 * }, ...]
 * This adds a log to the Log Table. Checks storage capacity and updates spending logs.
 */
export function addEntry(req, userId) {
  return addLogEntryHelper(req, userId);
}

function addLogEntryHelper(logs, userId) {
  return new Promise((resolve, reject) => {
    if (!logs || logs.length < 1) {
      throw createError('Invalid input request, see doc.');
    }
    const vendorIngredientMap = {};
    const packageTypes = [];
    const userLogs = [];
    const spendingLogReq = {};
    for (let log of logs) {
      if (!checkNumber.isPositiveInteger(log.vendor_ingredient_id)) {
        throw createError(`Vendor ingredient ID ${log.vendor_ingredient_id} is invalid.`);
      }
      vendorIngredientMap[log.vendor_ingredient_id] = log.quantity;
      packageTypes.push(`'${log.package_type}'`);
    }
    connection.query(`SELECT VendorsIngredients.id, VendorsIngredients.ingredient_id, VendorsIngredients.price, Ingredients.num_native_units
      FROM VendorsIngredients
      INNER JOIN Ingredients
      ON VendorsIngredients.ingredient_id = Ingredients.id
      WHERE VendorsIngredients.id IN (${Object.keys(vendorIngredientMap).join(', ')})`)
    .then(results => {
      if (results.length < Object.keys(vendorIngredientMap).length) {
        throw createError('Placing order for nonexistent vendor ingredient for package type.');
      }
      for (let vendorIngredient of results) {
        try {
          let unitWeight = vendorIngredient['num_native_units'];
          let quantity = vendorIngredientMap[vendorIngredient.id];
          spendingLogReq[vendorIngredient['ingredient_id']] = {
            'total_weight': unitWeight * quantity,
            'cost': quantity * vendorIngredient['price'],
          };
          userLogs.push(`(${userId}, ${vendorIngredient['id']}, ${unitWeight * quantity})`);
        } catch (err) {
          throw err;
        }
      }
      return connection.query(`INSERT INTO Logs (user_id, vendor_ingredient_id, quantity) VALUES ${userLogs.join(', ')}`);
    })
    .then(() => updateLogForIngredient(spendingLogReq))
    .then(() => resolve())
    .catch(err => {
      reject(err);
    });
  });
}
