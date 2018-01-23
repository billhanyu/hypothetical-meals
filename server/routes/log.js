import * as checkNumber from './common/checkNumber';

export function view(req, res, next) {
  connection.query('SELECT * FROM Logs')
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
  if(!vendorIngredients || vendorIngredients.length < 1) {
  	return res.status(400).send('Invalid input request, see doc.');
  }
  const vendorIngredientIds = [];
  for (let idString of vendorIngredients) {
  	if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Vendor ingredient ID ${idString} is invalid.`);
    }
    vendorIngredientIds.push(idString);
  }
  connection.query(`SELECT * FROM Logs WHERE vendor_ingredient_id IN (${vendorIngredientIds.join(', ')})`)
  .then(results => res.status(200).send(results))
  .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}
/* Request body format:
 * req.body.logs = [{
 *   'user_id': 1,
 *   'vendor_ingredient_id': 2,
 *   'quantity': 10,
 * }, ...]
 * This adds a log to the Log Table.
 */
export function addEntry(req, res, next) {
  addLogEntryHelper(req.body.logs, req, res, next);
}

function addLogEntryHelper(logs, req, res, next) {
  if(!logs || logs.length < 1) {
  	return res.status(400).send('Invalid input request, see doc.');
  }
  const userLogs = [];
  for (let log of logs) {
  	userLogs.push(`('${log.user_id}', '${log.vendor_ingredient_id}', '${log.quantity}')`);
  }
  connection.query(`INSERT INTO Logs (user_id, vendor_ingredient_id, quantity) VALUES ${userLogs.join(', ')}`)
    .then(() => res.status(200).send('success'))
    .catch(err => {
  	  console.log(err);
  	  return res.status(500).send('Database error');
    });
}
