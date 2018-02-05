import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
import success from './common/success';
import { fakeDeleteMultipleVendorIngredients } from './vendorIngredient';
import { getNumPages, queryWithPagination } from './common/pagination';
const fs = require('fs');

const basicViewQueryString = 'SELECT Ingredients.*, Storages.name as storage_name, Storages.capacity as storage_capacity FROM Ingredients INNER JOIN Storages ON Storages.id = Ingredients.storage_id';

export function allAvailable(req, res, next) {
  connection.query(`${basicViewQueryString} WHERE removed = 0`)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function pages(req, res, next) {
  getNumPages('Ingredients')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'Ingredients', basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function viewAvailable(req, res, next) {
  queryWithPagination(req.params.page_num, 'Ingredients', `${basicViewQueryString} WHERE removed = 0`)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

/* request body format:
 * request.body.ingredients = [
 *   {
 *     'name': 'p',
 *     'storage_id': 1,
 *   }, ...
 * ]
 * This adds a new ingredient into the Ingredients table.
 */
export function addIngredient(req, res, next) {
  addIngredientHelper(req.body.ingredients, req, res, next);
}

function addIngredientHelper(ingredients, req, res, next) {
  if (!ingredients || Object.keys(ingredients).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientsToAdd = [];
  for (let ingredient of ingredients) {
    ingredientsToAdd.push(`('${ingredient.name}', ${ingredient.storage_id})`);
  }
  connection.query(`INSERT INTO Ingredients (name, storage_id) VALUES ${ingredientsToAdd.join(', ')}`)
  .then(() => success(res))
  .catch(err => handleError(err, res));
}

/* request body format:
 * request.body.ingredients =
 *   {
 *     'ingredient_id1': {
 *        'name': 'name_change1',
 *        'storage_id': 'storage_id_change1',
 *      },
 *     'ingredient_id2': {
 *        'storage_id': storage_id_change2,
 *      },
 *   }, ...
 * This can change the storage id or name of the ingredient.
 */
export function modifyIngredient(req, res, next) {
  modifyIngredientHelper(req.body.ingredients, req, res, next);
}

function modifyIngredientHelper(items, req, res, next) {
  if (!items || Object.keys(items).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientIds = [];
  for (const idString in items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const storageId = items[idString]['storage_id'] || 0;
    if (!checkNumber.isNonNegativeInteger(storageId) || storageId > 3) {
      return res.status(400).send(`New storage id ${storageId} is invalid`);
    }
    ingredientIds.push(idString);
  }

  const nameCases = [];
  const storageCases = [];
  connection.query(`SELECT id, name, storage_id FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
  .then(results => {
    if (results.length < ingredientIds.length) {
      throw createError('Changing storage id or name of invalid ingredient.');
    }
    for (let ingredient of results) {
      const oldName = ingredient['name'];
      const newName = items[ingredient.id]['name'];
      const oldStorage = ingredient['storage_id'];
      const newStorage = items[ingredient.id]['storage_id'];
      nameCases.push(`when id = ${ingredient.id} then '${newName || oldName}'`);
      storageCases.push(`when id = ${ingredient.id} then ${newStorage || oldStorage}`);
    }
    return connection.query(
      `UPDATE Ingredients
        SET storage_id = (case ${storageCases.join(' ')} end),
            name = (case ${nameCases.join(' ')} end)
        WHERE id IN (${ingredientIds.join(', ')})`);
  })
  .then(() => success(res))
  .catch(err => handleError(err, res));
}


/* request body format:
 * request.body.ingredients = [
 *   1,
 *   2,
 *   3, ...
 * ]
 * This deletes an ingredient from the ingredients table.
 */
export function deleteIngredient(req, res, next) {
  deleteIngredientHelper(req.body.ingredients, req, res, next);
}

function deleteIngredientHelper(items, req, res, next) {
  if (!items || items.length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientIds = [];
  for (let idString of items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    ingredientIds.push(idString);
  }

  connection.query(`SELECT id, storage_id FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
  .then(results => {
    if (results.length < ingredientIds.length) {
      throw createError('Deleting nonexistent ingredient.');
    }
  })
  .then(() => connection.query(`UPDATE Ingredients SET removed = 1 WHERE id IN (${ingredientIds.join(', ')})`))
  .then(() => connection.query(`SELECT id FROM VendorsIngredients WHERE ingredient_id IN (${ingredientIds.join(', ')})`))
  .then(results => {
    const vendorsIngredientsIds = results.map(e => e.id);
    return fakeDeleteMultipleVendorIngredients(vendorsIngredientsIds);
  })
  .then(() => success(res))
  .catch(err => handleError(err, res));
}

export function bulkImport(req, res, next) {
  const content = fs.readFileSync(req.file.path);
  console.log(content.toString());
  res.status(501).send('todo');
}
