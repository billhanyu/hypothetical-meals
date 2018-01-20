import * as checkNumber from './common/checkNumber';

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
  // TODO: add auth

  addIngredientHelper(req.body.ingredients, req, res, next);
}

function addIngredientHelper(ingredients, req, res, next) {
  if(!ingredients || Object.keys(ingredients).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  connection.query('INSERT INTO Ingredients (name, storage_id) VALUES (${ingredients.join(', ')})')
  .then(() => res.status(200.send('success')))
  .catch(err => {
    return res.status(500).send('Database error');
  })
}

/* request body format:
 * request.body.ingredients = [
 *   {
 *     'ingredient_id1': storage_id_change1,
 *     'ingredient_id2': storage_id_change2,
 *   }, ...
 * ]
 * This changes the storage_id of the ingredient.
 */
export function modifyIngredient(req, res, next) {
  //TODO: add auth

  modifyIngredientHelper(req.body.ingredients, req, res, next);
}

function modifyIngredientHelper(items, req, res, next) {
  if(!items || Object.keys(items).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientIds = [];
  for (const idString in items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const storageId = items[idString];
    if(!checkNumbe.isNonNegativeInteger(storageId) && storageId > 2) {
      return res.status(400).send(`New storage id ${storageId} is invalid`);
    }
    ingredientIds.push(idString);
  }

  connection.query(`SELECT id, storage_id FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
  .then(results => {
    if(results.length < ingredientIds.length) {
      const err = {
        custom: 'Changing storage id of invalid ingredient.'
      };
      throw err;
    }

    return connection.query(`UPDATE Ingredients SET storage_id = (${storageId.join(', ')} WHERE id IN (${ingredientIds.join(', ')}`);    
  })
  .then(() => res.status(200).send('success'))
  .catch(err => {
    if (err.custom) {
      return res.status(400).send(err.custom);
    }
    return res.status(500).send('Database error');
  });
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
  //TODO: add auth
  
  deleteIngredientHelper(req.body.ingredients, req, res, next);
}

function deleteIngredientHelper(items, req, res, next) {
  if(!items || items.length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const ingredientIds = [];
  for (const idString in items) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    ingredientIds.push(idString);
  }

  connection.query(`SELECT id, storage_id FROM Ingredients WHERE id IN (${ingredientIds.join(', ')})`)
  .then(results => {
    if(results.length < ingredientIds.length) {
      const err = {
        custom: 'Deleting nonexistent ingredient.'
      };
      throw err;
    }
  })
  .then(() => connection.query('DELETE FROM Ingredients WHERE id = (${ingredientIds.join(', ')})'))
  .then(() => res.status(200).send('success'))
  .catch(err => {
    if (err.custom) {
      return res.status(400).send(err.custom);
    }
    return res.status(500).send('Database error');
  });
}