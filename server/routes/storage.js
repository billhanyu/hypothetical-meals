import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';

export function view(req, res, next) {
  connection.query('SELECT * FROM Storages')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

/* Request format:
 * req.body.storage_id = new_quantity
 * if the new capacity is lower than what's in the inventory, reject
 */
export function changeStorage(req, res, next) {
  const keys = Object.keys(req.body);
  if (keys.length !== 1 || !checkNumber.isPositiveInteger(keys[0])) {
    return res.status(400).send('Invalid storage id');
  }

  const storageId = keys[0];
  const quantityString = req.body[storageId];
  if (!checkNumber.isNonNegativeInteger(quantityString)) {
    return res.status(400).send('Invalid new quantity number');
  }
  const newCapacity = parseInt(quantityString);

  connection.query(`SELECT id FROM Storages WHERE id = ${storageId}`)
  .then(results => {
    if (results.length < 1) {
      throw createError('Storage ID not in Storages Table');
    }
    return connection.query(
      `SELECT Inventories.storage_weight 
      FROM Inventories
      INNER JOIN Ingredients 
      ON Ingredients.id = Inventories.ingredient_id 
      WHERE Ingredients.storage_id = ${storageId}`);
  })
  .then(storageWeights => {
    let sum = 0;
    storageWeights.forEach(weight => {
      sum += weight['storage_weight'];
    });
    if (newCapacity < sum) {
      throw createError(`New capacity ${newCapacity} is smaller than current total storage weight ${sum}`);
    }
    return connection.query(`UPDATE Storages SET capacity = ${newCapacity} WHERE id = ${storageId}`);
  })
  .then(() => {
    res.status(200).send('success');
  })
  .catch(err => handleError(err, res));
}
