import * as checkNumber from './common/checkNumber';

export function view(req, res, next) {
  connection.query('SELECT * FROM Inventories', (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Database error');
    }
    return res.status(200).send(results);
  });
}

/* request body format:
 * request.body.changes = {
 *   "inventory_id1": new_quantity1,
 *   "inventory_id2": new_quantity2
 * }
 * example:
 * {
 *   "1": 123,
 *   "2": 456
 * }
 * This changes ingredient 1's total_weight to 123 and 2's total_weight to 456
 */
export function modifyQuantities(req, res, next) {
  // TODO: add authorization
  const changes = req.body.changes;
  if (!changes || Object.keys(changes).length < 1) {
    return res.status(400).send('Changes has nothing.');
  }
  const ingredientIds = [];
  const cases = [];
  for (const idString in changes) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const quantity = changes[idString];
    if (!checkNumber.isNonNegativeInteger(quantity)) {
      return res.status(400).send(`New quantity ${quantity} is invalid.`);
    }
    ingredientIds.push(idString);
    cases.push(`when ingredient_id = ${idString} then ${quantity}`);
  }

  connection.query(
    `UPDATE Inventories SET total_weight = (case ${cases.join(' ')} end) WHERE ingredient_id IN (${ingredientIds.join(', ')})`,
    (error, results, fields) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Database error');
      }
      connection.query(
        'DELETE FROM Inventories WHERE total_weight = 0',
        (error, results, fields) => {
          if (error) {
            console.error(error);
            return res.status(500).send('Database error');
          }
          return res.status(200).send('success');
        });
    });
}

/* request body format:
 * request.body.cart = {
 *   "inventory_id1": request_quantity1,
 *   "inventory_id2": request_quantity2
 * }
 * example:
 * {
 *   "1": 123,
 *   "2": 456
 * }
 * This decreases ingredient 1's total_weight by 123 and 2's total_weight by 456
 */
export function commitCart(req, res, next) {
  // TODO: log the commit cart action?
  const cart = req.body.cart;
  if (!cart || Object.keys(cart).length < 1) {
    return res.status(400).send('Cart has nothing.');
  }
  const ingredientIds = [];
  for (const idString in cart) {
    if (!checkNumber.isPositiveInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const quantity = cart[idString];
    if (!checkNumber.isPositiveInteger(quantity)) {
      return res.status(400).send(`Request quantity ${quantity} is invalid.`);
    }
    ingredientIds.push(idString);
  }

  connection.query(
    `SELECT * FROM Inventories WHERE ingredient_id IN (${ingredientIds.join(', ')})`,
    (error, results, fields) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Database error');
      }

      const cases = [];
      for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const newQuantity = item['total_weight'] - parseInt(cart[item['ingredient_id']]);
        if (newQuantity < 0) {
          return res.status(400).send(`Requesting more then what's in the inventory.`);
        }
        cases.push(`when ingredient_id = ${item['ingredient_id']} then ${newQuantity}`);
      }

      if (cases.length < ingredientIds.length) {
        return res.status(400).send(`Requesting something not in the inventory.`);
      }

      connection.query(
        `UPDATE Inventories SET total_weight = (case ${cases.join(' ')} end) WHERE ingredient_id IN (${ingredientIds.join(', ')})`,
        (error, results, fields) => {
          if (error) {
            console.error(error);
            return res.status(500).send('Database error');
          }
          connection.query(
            'DELETE FROM Inventories WHERE total_weight = 0',
            (error, results, fields) => {
              if (error) {
                console.error(error);
                return res.status(500).send('Database error');
              }
              return res.status(200).send('success');
            });
        });
    }
  );
}
