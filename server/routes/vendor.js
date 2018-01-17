export function view(req, res, next) {
  connection.query('SELECT * FROM Vendors', (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Database error');
    }
    return res.status(200).send(results);
  });
}
