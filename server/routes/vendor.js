import * as checkNumber from './common/checkNumber';

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
  connection.query(`SELECT user_group from Users where id=${req.payload.id};`)
  .then((results) => {
    if (results.length == 0) res.status(500).send('Database error');
    if (results[0].user_group != 'admin') res.status(401).send('User must be an admin to access this endpoint.');
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

  const changeQuery = () => connection.query(`INSERT INTO Vendors (name, contact, code) VALUES ${values.join(', ')}`);
  duplicationCheckHelper(names, codes, changeQuery, res);
  });
}

/* req.body.vendors = {
 *   '1': {
 *     'name': 'new_name',
 *   },
 *   '2': {
 *     'code': 'new_code',
 *   },
 * };
 */
export function modifyVendors(req, res, next) {
  connection.query(`SELECT user_group from Users where id=${req.payload.id};`)
  .then((results) => {
    if (results.length == 0) res.status(500).send('Database error');
    if (results[0].user_group != 'admin') res.status(401).send('User must be an admin to access this endpoint.');
    const vendors = req.body.vendors;
    if (!vendors || Object.keys(vendors).length < 1) {
      return res.status(400).send('Invalid request object, see doc.');
    }
    const names = [];
    const codes = [];
    for (let key in vendors) {
      if (!checkNumber.isPositiveInteger(key)) {
        return res.status(400).send(`Invalid key ${key}.`);
      }
      const name = vendors[key]['name'];
      const code = vendors[key]['code'];
      if (name) names.push(name);
      if (code) codes.push(code);
    }
  
    const changeQuery = () =>
      connection.query(`SELECT * FROM Vendors WHERE id IN (${Object.keys(vendors).join(', ')})`)
        .then(olds => {
          const nameCases = [];
          const contactCases = [];
          const codeCases = [];
          for (let old of olds) {
            const id = old['id'];
            const oldName = old['name'];
            const oldContact = old['contact'];
            const oldCode = old['code'];
            const change = vendors[id];
            const newName = change['name'];
            const newContact = change['contact'];
            const newCode = change['code'];
            nameCases.push(`when id = ${id} then '${newName || oldName}'`);
            contactCases.push(`when id = ${id} then '${newContact || oldContact}'`);
            codeCases.push(`when id = ${id} then '${newCode || oldCode}'`);
          }
          return connection.query(`
            UPDATE Vendors
              SET name = (case ${nameCases.join(' ')} end),
                contact = (case ${contactCases.join(' ')} end),
                code = (case ${codeCases.join(' ')} end)
              WHERE id IN (${Object.keys(vendors).join(', ')})`);
        });
    duplicationCheckHelper(names, codes, changeQuery, res);
  });
}

function duplicationCheckHelper(names, codes, nextQuery, res) {
  names = names.sort();
  codes = codes.sort();
  for (let i = 0; i < names.length - 1; i++) {
    if (names[i] === names[i + 1]) {
      return res.status(400).send('You have duplicated names in your request.');
    }
  }
  for (let i = 0; i < codes.length - 1; i++) {
    if (codes[i] === codes[i + 1]) {
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
      for (let name of names) {
        if (oldNames.indexOf(name) > -1) {
          err.custom = 'One or more of your names has duplications with the database.';
          throw err;
        }
      }
      for (let code of codes) {
        if (oldCodes.indexOf(code) > -1) {
          err.custom = 'One of more of your codes has duplications with the database.';
          throw err;
        }
      }
      return nextQuery();
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

/* req.body.ids = [
 *   1, 2, 3
 * ];
 *
 */
export function deleteVendors(req, res, next) {
  connection.query(`SELECT user_group from Users where id=${req.payload.id};`)
  .then((results) => {
    if (results.length == 0) res.status(500).send('Database error');
    if (results[0].user_group != 'admin') res.status(401).send('User must be an admin to access this endpoint.');
    const ids = req.body.ids;
    if (!ids || ids.length < 1) {
      return res.status(400).send('Invalid input object, see doc.');
    }
    for (let id of ids) {
      if (!checkNumber.isPositiveInteger(id)) {
        return res.status(400).send(`Invalid id ${id}`);
      }
    }
    connection.query(`DELETE FROM Vendors WHERE id IN (${ids.join(', ')})`)
      .then(() => res.status(200).send('success'))
      .catch(err => {
        console.error(err);
        res.status(500).send('Database error');
    });
  });
}
