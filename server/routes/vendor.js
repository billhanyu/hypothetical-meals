export function view(req, res, next) {
  connection.query('SELECT * FROM Vendors')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

export function addVendor(req, res, next) {
  connection.query(`SELECT user_group from Users where id=${req.payload.id};`)
  .then((results) => {
    if (results.length == 0) res.status(500).send('Database error');
    if (results[0].user_group != 'admin') res.status(401).send('User must be an admin to access this endpoint.');
    addVendorHelper(req, res, next);
  });
}

function addVendorHelper(req, res, next) {
  res.status(501).send('todo');
}
