import { getSpace } from './packageUtilies';
import { createError } from './customError';

/*
* req = {
*   'storage_id': quantity
*    }
* Quantities do not include ignored storage quantities (railcar etc.). Quantities in pounds.
*/
export function checkStoragePromise(req) {
  // console.log(req);
  return new Promise((resolve, reject) => {
    if (Object.keys(req) < 1) {
      resolve();
    }
    let storages;
    const sums = {};
    const capacities = {};
    connection.query('SELECT * FROM Storages')
      .then(results => {
        storages = results;
        for (let storage of storages) {
          sums[storage.id] = 0;
          capacities[storage.id] = storage.capacity;
        }
        return connection.query(`SELECT Inventories.num_packages, Ingredients.storage_id, Ingredients.package_type
                                  FROM Inventories
                                  INNER JOIN Ingredients
                                  ON Inventories.ingredient_id = Ingredients.id`);
      })
      .then(items => {
        items.forEach(item => {
          sums[item.storage_id] += getSpace(item.package_type) * item.num_packages;
        });
        let remainingCapacity = {};
        for (const storage in capacities) {
            if (storage in sums) {
                remainingCapacity[storage] = capacities[storage] - sums[storage];
            } else {
                remainingCapacity[storage] = capacities[storage];
            }
        }
        return remainingCapacity;
      })
      .then((capacities) => {
        for (const capacity in capacities) {
          if ((capacities[capacity]-req[capacity]) < 0) {
            reject(createError('Requested quantity exceeds capacity.'));
          }
        }
        resolve();
      })
      .catch(err => reject(err));
    });
}

const validStorageTypes = ['freezer', 'refrigerator', 'warehouse'];

export { validStorageTypes };
