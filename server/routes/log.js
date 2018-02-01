import * as checkNumber from './common/checkNumber';
import * as packageCalc from './common/packageUtilies';
import { updateLogForIngredient } from './spendinglog';
import { createError } from './common/customError';

const basicViewQueryString = 'SELECT Logs.*, Users.username as user_username FROM Logs INNER JOIN Users ON Logs.user_id = Users.id';

export function view(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
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
    return res.status(400).send('Invalid input request, see doc.');
  }
  const vendorIngredientIds = [];
  for (let idString of vendorIngredients) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Vendor ingredient ID ${idString} is invalid.`);
    }
    vendorIngredientIds.push(idString);
  }
  connection.query(`${basicViewQueryString} WHERE vendor_ingredient_id IN (${vendorIngredientIds.join(', ')})`)
  .then(results => res.status(200).send(results))
  .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}
/* Request body format:
 * req.body.logs = [{
 *   'vendor_ingredient_id': 2,
 *   'package_type': 'pail',
 *   'quantity': 10,
 * }, ...]
 * This adds a log to the Log Table. Checks storage capacity and updates spending logs.
 */
export function addEntry(req, res, next) {
  // TODO: add authorization/get user from token?

  addLogEntryHelper(req.body.logs, req, res, next);
}

function addLogEntryHelper(logs, req, res, next) {
  if (!logs || logs.length < 1) {
    return res.status(400).send('Invalid input request, see doc.');
  }
  const vendorIngredientMap = {};
  const packageTypes = [];
  const userLogs = [];
  for (let log of logs) {
    if (!checkNumber.isPositiveInteger(log.vendor_ingredient_id)) {
      return res.status(400).send(`Vendor ingredient ID ${log.vendor_ingredient_id} is invalid.`);
    }
    vendorIngredientMap[log.vendor_ingredient_id] = log.quantity;
    packageTypes.push(`'${log.package_type}'`);
  }
  connection.query(`SELECT id, package_type, ingredient_id, price FROM VendorsIngredients WHERE id IN (${Object.keys(vendorIngredientMap).join(', ')}) AND package_type IN (${packageTypes.join(', ')})`)
  .then(results => {
    if (results.length < Object.keys(vendorIngredientMap).length) {
      throw createError('Placing order for nonexistent vendor ingredient for package type.');
    }
    const spendingLogReq = {};
    for (let vendorIngredient of results) {
      try {
        let unitWeight = packageCalc.getWeight(vendorIngredient['package_type']);
        let quantity = vendorIngredientMap[vendorIngredient['ingredient_id']];
        spendingLogReq[vendorIngredient['ingredient_id']] = quantity * vendorIngredient['price'];
        userLogs.push(`(${req.payload.id}, ${vendorIngredient['id']}, ${unitWeight * quantity})`);
      } catch (err) {
        throw err;
      }
    }
    connection.query(`INSERT INTO Logs (user_id, vendor_ingredient_id, quantity) VALUES ${userLogs.join(', ')}`)
    .then(() => {
      Promise.resolve(updateLogForIngredient(spendingLogReq))
      .then(() => {
        return res.status(200).send('success');
      })
      .catch(err => {
        throw err;
      });
    })
    .catch(err => {
      throw err;
    });
  })
  .catch(err => {
    if (err.custom) {
      return res.status(500).send(err.custom);
    }
    return res.status(500).send('Database error');
  });
}
