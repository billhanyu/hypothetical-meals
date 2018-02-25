import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import { getSpace } from './common/packageUtilies';
import success from './common/success';

export function view(req, res, next) {
  let storages;
  connection.query('SELECT * FROM Storages')
    .then(results => {
      storages = results;
      const promises = [];
      for (let storage of results) {
        promises.push(storageSumPromise(storage.id));
      }
      return Promise.all(promises);
    })
    .then(sums => {
      for (let i = 0; i < storages.length; i++) {
        storages[i].used = sums[i];
      }
      return res.json(storages);
    })
    .catch(err => {
      console.error(err);
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
  storageSumPromise(storageId)
  .then(sum => {
    if (newCapacity < sum) {
      throw createError(`New capacity ${newCapacity} is smaller than current total storage weight ${sum}`);
    }
    return connection.query(`UPDATE Storages SET capacity = ${newCapacity} WHERE id = ${storageId}`);
  })
  .then(() => success(res))
  .catch(err => handleError(err, res));
}

function storageSumPromise(storageId) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT id FROM Storages WHERE id = ${storageId}`)
      .then(results => {
        if (results.length < 1) {
          reject(createError('Storage ID not in Storages Table'));
        }
        return connection.query(
          `SELECT Ingredients.package_type, Inventories.num_packages 
      FROM Inventories
      INNER JOIN Ingredients 
      ON Ingredients.id = Inventories.ingredient_id 
      WHERE Ingredients.storage_id = ${storageId}`);
      })
      .then(results => {
        let sum = 0;
        results.forEach(item => {
          sum += getSpace(item.package_type) * item.num_packages;
        });
        resolve(sum);
      })
      .catch(err => reject(err));
  });
}
