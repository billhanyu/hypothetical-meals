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
 *     'package_type': 'sail',
 *     'storage_id': 1,
 *     'price': 100,
 *     'vendor_id': 1,
 *   }, ...
 * ]
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
