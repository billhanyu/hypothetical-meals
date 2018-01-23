export function view(req, res, next) {
  connection.query('SELECT * FROM Vendors')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

/* req.body.vendors = [
 *   {
 *     'name': 'duke',
 *     'contact': 'duke.edu',
 *     'code': 'code_duke',
 *   },
 *   ...
 * ]
 */
export function addVendors(req, res, next) {
  const vendors = req.body.vendors;
  if (!vendors || vendors.length < 1) {
    return res.status(400).send('Invalid request object, see doc.');
  }

  let names = [];
  let codes = [];
  const values = [];
  for (let vendor of vendors) {
    const name = vendor['name'];
    const contact = vendor['contact'];
    const code = vendor['code'];
    if (!name || !contact || !code) {
      return res.status(400).send('You are lacking properties in your request.');
    }
    names.push(name);
    codes.push(code);
    values.push(`('${name}', '${contact}', '${code}')`);
  }
  names = names.sort();
  codes = codes.sort();
  for (let i = 0; i < vendors.length - 1; i++) {
    if (names[i] === names[i+1]) {
      return res.status(400).send('You have duplicated names in your request.');
    }
    if (codes[i] === codes[i+1]) {
      return res.status(400).send('You have duplicated codes in your request.');
    }
  }

  connection.query('SELECT name, code FROM Vendors')
    .then(results => {
      const oldNames = results.map(vendor => vendor['name']);
      const oldCodes = results.map(vendor => vendor['code']);
      const err = {
        custom: '',
      };
      for (let i = 0; i < vendors.length; i++) {
        if (oldNames.indexOf(names[i]) > -1) {
          err.custom = 'One or more of your names has duplications with the database.';
          throw err;
        }
        if (oldCodes.indexOf(codes[i]) > -1) {
          err.custom = 'One of more of your codes has duplications with the database.';
          throw err;
        }
      }
      return connection.query(`INSERT INTO Vendors (name, contact, code) VALUES ${values.join(', ')}`);
    })
    .then(() => res.status(200).send('success'))
    .catch(err => {
      if (err.custom) {
        return res.status(400).send(err.custom);
      }
      console.error(err);
      res.status(500).send('Database error');
    });
}

export function modifyVendors(req, res, next) {
  res.status(501).send('todo');
}

export function deleteVendors(req, res, next) {
  res.status(501).send('todo');
}
