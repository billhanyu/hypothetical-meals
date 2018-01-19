export function view(req, res, next) {
  connection.query('SELECT * FROM Vendors')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}
