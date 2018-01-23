export function view(req, res, next) {
  connection.query('SELECT * FROM SpendingLogs')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

export function logsForIngredient(req, res, next) {
  res.status(501).send('todo');
}
