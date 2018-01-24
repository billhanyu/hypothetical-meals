export function view(req, res, next) {
  connection.query('SELECT * FROM Vendors')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

/* Request body format:
 * req.body.vendors = [
 *  {
 *    'name': 'duke',
 *    'contact': 'duke@duke.edu',
 *    'code': 'codeduke',
 *  },
 *  {
 *    'name': 'unc',
 *    'contact': 'shit@unc.edu',
 *    'code': 'codeunc',
 *  },
 * ]
 * This adds vendors to the Vendors table.
 */
export function addVendors(req, res, next) {
  // TODO: add auth

  addVendorsHelper(req.body.vendors, req, res, next);
}

function addVendorsHelper(vendors, req, res, next) {
  if (!vendors || Object.keys(vendors).length < 1) {
    return res.status(400).send('Invalid input reqest, see doc.');
  }
  const vendorsToAdd = [];
  for (let vendor of vendors) {
    vendorsToAdd.push(`('${vendor.name}', '${vendor.contact}', '${vendor.code}')`);
  }
  connection.query(`INSERT INTO Vendors (name, contact, code) VALUES ${vendorsToAdd.join(', ')}`)
  .then(() => res.status(200).send('success'))
  .catch(err => {
    return res.status(500).send('Database error');
  });
}

export function modifyVendors(req, res, next) {
  res.status(501).send('todo');
}

export function deleteVendors(req, res, next) {
  res.status(501).send('todo');
}
