export function view(req, res, next) {
  connection.query('SELECT * FROM Logs', (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Database error');
    }
    return res.status(200).send(results);
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
