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
 * This changes ingredient 1's num_packages to 123 and 2's num_packages to 456
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
    if (!isNonNegativeInteger(idString)) {
      return res.status(400).send(`Ingredient ID ${idString} is invalid.`);
    }
    const quantity = changes[idString];
    if (!isNonNegativeInteger(quantity)) {
      return res.status(400).send(`New quantity ${quantity} is invalid.`);
    }
    ingredientIds.push(idString);
    cases.push(`when ingredient_id = ${idString} then ${quantity}`);
  }

  connection.query(
    `UPDATE Inventories SET num_packages = (case ${cases.join(' ')} end) WHERE ingredient_id IN (${ingredientIds.join(', ')})`,
    (error, results, fields) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Database error');
      }
      connection.query(
        'DELETE FROM Inventories WHERE num_packages = 0',
        (error, results, fields) => {
          if (error) {
            console.error(error);
            return res.status(500).send('Database error');
          }
          return res.status(200).send('success');
        });
    });
}

export function commitCart(req, res, next) {
  res.status(501).send('todo');
}

function isNonNegativeInteger(s) {
  const num = Number(s);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
}
