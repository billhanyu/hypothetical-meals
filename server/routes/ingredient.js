import * as checkNumber from './common/checkNumber';
import { createError, handleError } from './common/customError';
const fs = require('fs');

export function view(req, res, next) {
  connection.query('SELECT * FROM Ingredients')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
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
  connection.query(`SELECT user_group from Users where id=${req.payload.id};`)
  .then((results) => {
    if (results.length == 0) return status(500).send('Database error');
    if (results[0].user_group != 'admin') return res.status(401).send('User must be an admin to access this endpoint.');
    addIngredientHelper(req.body.ingredients, req, res, next);
  });
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
  .then(() => res.status(200).send('success'))
  .catch(err => handleError(err, res));
}

/* request body format:
 * request.body.ingredients =
 *   {
 *     'ingredient_id1': storage_id_change1,
 *     'ingredient_id2': storage_id_change2,
 *   }, ...
 * This changes the storage_id of the ingredient.
 */
export function modifyIngredient(req, res, next) {
  connection.query(`SELECT user_group from Users where id=${req.payload.id};`)
  .then((results) => {
    if (results.length == 0) return res.status(500).send('Database error');
    if (results[0].user_group != 'admin') return res.status(401).send('User must be an admin to access this endpoint.');
    modifyIngredientHelper(req.body.ingredients, req, res, next);
  });
}

function modifyIngredientHelper(items, req, res, next) {
  if (!items || Object.keys(items).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientIds = [];
  const storageCases = [];
  for (const idString in items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const storageId = items[idString];
    if (!checkNumber.isNonNegativeInteger(storageId) || storageId > 2) {
      return res.status(400).send(`New storage id ${storageId} is invalid`);
    }
    ingredientIds.push(idString);
    storageCases.push(`when id = ${idString} then ${storageId}`);
  }

  connection.query(`SELECT id, storage_id FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
  .then(results => {
    if (results.length < ingredientIds.length) {
      throw createError('Changing storage id of invalid ingredient.');
    }
    return connection.query(`UPDATE Ingredients SET storage_id = (case ${storageCases.join(' ')} end) WHERE id IN (${ingredientIds.join(', ')})`);
  })
  .then(() => res.status(200).send('success'))
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
  connection.query(`SELECT user_group from Users where id=${req.payload.id};`)
  .then((results) => {
    if (results.length == 0) return res.status(500).send('Database error');
    if (results[0].user_group != 'admin') return res.status(401).send('User must be an admin to access this endpoint.');
    deleteIngredientHelper(req.body.ingredients, req, res, next);
  });
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
  .then(() => connection.query(`DELETE FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`))
  .then(() => res.status(200).send('success'))
  .catch(err => handleError(err, res));
}

export function bulkImport(req, res, next) {
  const content = fs.readFileSync(req.file.path);
  console.log(content.toString());
  res.status(501).send('todo');
}
