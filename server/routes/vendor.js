export function view(req, res, next) {
  connection.query('SELECT * FROM Vendors')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

export function addVendors(req, res, next) {
  res.status(501).send('todo');
}

export function modifyVendors(req, res, next) {
  res.status(501).send('todo');
}

export function deleteVendors(req, res, next) {
  res.status(501).send('todo');
}
