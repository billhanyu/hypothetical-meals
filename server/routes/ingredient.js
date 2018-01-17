export function view(req, res, next) {
  connection.query('SELECT * FROM Ingredients', (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Database error');
    }
    return res.status(200).send(results);
  });
}

/* request body format:
 * request.body.ingredients = [
 *   {
 *     'name': 'p',
 *     'package_type': 'sail',
 *     'storage_id': 1,
 *     'price': 100,
 *     'vendor_id': 1,
 *   }
 *   "inventory_id2": new_quantity2
 * ]
 * example:
 * {
 *   "1": 123,
 *   "2": 456
 * }
 * This changes ingredient 1's num_packages to 123 and 2's num_packages to 456
 */
export function addIngredient(req, res, next) {
  // TODO: add auth

  res.status(501).send('todo');
}

export function modifyIngredient(req, res, next) {
  res.status(501).send('todo');
}

export function deleteIngredient(req, res, next) {
  res.status(501).send('todo');
}
