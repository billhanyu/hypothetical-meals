export function view(req, res, next) {
  connection.query('SELECT * from inventories', (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Database error');
    }
    res.status(200).send(results);
  });
}

export function modifyQuantities(req, res, next) {
  res.status(501).send('todo');
}

export function commitCart(req, res, next) {
  res.status(501).send('todo');
}
