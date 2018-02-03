import { modifyInventoryQuantitiesPromise } from './inventory';
import { addEntry } from './log';
import { createError, handleError } from './common/customError';
import { getWeight } from './common/packageUtilies';
import { checkStoragePromise } from './common/storageUtilities';
import success from './common/success';

/* request body format:
 * request.body.order = {
 *   "vendor_ingredient_id1": quantity_1,
 *   "vendor_ingredien_id": quantity_2
 * }
 * example:
 * {
 *   '1': 123,
 *   '2': 456
 * }
 * 1. check inventory capacities
 * 2. update inventory capacities/stock
 * 3. logs and spending logs
 */
export function placeOrder(req, res, next) {
    orderHelper(req.body.orders, req, res, next);
}

function orderHelper(orders, req, res, next) {
    connection.query(`SELECT VendorsIngredients.id, VendorsIngredients.ingredient_id, VendorsIngredients.package_type, Ingredients.storage_id 
    FROM VendorsIngredients JOIN Ingredients ON VendorsIngredients.ingredient_id = Ingredients.id WHERE VendorsIngredients.id IN (${Object.keys(orders).join(', ')})`)
    .then((results) => {
        if (results.length < Object.keys(orders).length) {
            throw createError('Some id not in Vendor Ingredients');
        }
        let ingredientIds = results.map(x => x.ingredient_id);
        let requestedCapacities = {};
        let newIngredientCases = [];
        let ingredientsMap = {};
        for (let result of results) {
            ingredientsMap[result['ingredient_id']] = {
                'package_type': result['package_type'],
                'quantity': orders[result.id],
                'storage_id': result['storage_id'],
                'vendor_ingredient_id': result['id'],
            };
        }
        let updateIngredients = {};
        connection.query(`SELECT id, ingredient_id FROM Inventories WHERE ingredient_id IN (${ingredientIds.join(', ')})`)
        .then((inventoryResults) => {
            inventoryResults.forEach(x => {
                updateIngredients[x.id] = orders[x.ingredient_id];
            });
            for (let ingredientId of ingredientIds) {
                if (!(ingredientId in updateIngredients)) {
                    newIngredientCases.push(`(${ingredientId}, ${ingredientsMap[ingredientId]['package_type']}, ${ingredientsMap[ingredientId]['quantity']})`);
                    requestedCapacities[ingredientsMap[ingredientId]['storage_id']] += ingredientsMap[ingredientId]['quantity'] * getWeight(ingredientsMap[ingredientId]['package_type']);
                }
            }
            if (Object.keys(updateIngredients).length > 0) {
                modifyInventoryQuantitiesPromise(updateIngredients)
                .catch((err) => {
                    throw err;
                });
            }
        })
        .catch((err) => {
            throw err;
        })
        .then(() => {
            checkStoragePromise(requestedCapacities)
            .then(() => {
                if (newIngredientCases.length > 0) {
                    connection.query(`INSERT INTO Inventories (ingredient_id, package_type, quantity) VALUES ${newIngredientCases.join(' ')}`);
                }
            })
            .catch((err) => {
                throw err;
            })
            .then(() => {
                let logReq = Object.values(ingredientsMap);
                addEntry(logReq, req.payload.id)
                .then(() => {
                    success(res);
                })
                .catch((err) => {
                    throw err;
                });
            })
            .catch((err) => {
                throw err;
            });
        })
        .catch((err) => {
            throw err;
        });
    })
    .catch((err) => {
        handleError(err, res);
    });
}
