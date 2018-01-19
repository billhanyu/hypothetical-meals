export function view(req, res, next) {
  connection.query('SELECT * FROM Logs')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

/* Request body format:
 * req.body = {
 *   'ingredient_id': 1
 * }
 */
export function viewLogForIngredient(req, res, next) {
  res.status(501).send('todo');
}

export function addEntry(req, res, next) {
  res.status(501).send('todo');
}
