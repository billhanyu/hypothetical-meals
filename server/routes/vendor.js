import * as checkNumber from './common/checkNumber';
import { handleError } from './common/customError';
import success from './common/success';
import { fakeDeleteMultipleVendorIngredients } from './vendorIngredient';
import { getAvailableNumPages, queryWithPagination } from './common/pagination';
import { logAction } from './systemLogs';

export function pages(req, res, next) {
  getAvailableNumPages('Vendors')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'Vendors', 'SELECT * FROM Vendors WHERE removed = 0')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function viewAvailable(req, res, next) {
  connection.query('SELECT * FROM Vendors WHERE removed = 0')
    .then(results => res.json(results))
    .catch(err => handleError(err, res));
}

export function viewWithId(req, res, next) {
  if (!req.params.id || !checkNumber.isPositiveInteger(req.params.id)) {
    return res.status(400).send('Invalid vendor id');
  }
  connection.query(`SELECT * FROM Vendors WHERE id = ?`, [req.params.id])
    .then(results => {
      if (results.length != 1) {
        return res.status(404).send('Vendor not found');
      }
      return res.json(results[0]);
    })
    .catch(err => handleError(err, res));
}

// req.query.code
export function getVendorWithCode(req, res, next) {
  if (!req.query.code) {
    return res.status(400).send('No code provided');
  }
  connection.query(`SELECT * FROM Vendors WHERE code = '${req.query.code}'`)
    .then(results => {
      if (results.length > 0) {
        return res.status(200).send(results[0]);
      }
      return res.status(404).send('Vendor Not Found');
    })
    .catch(err => {
      console.error(err);
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

  return connection.query(`INSERT INTO Vendors (name, contact, code) VALUES ${values.join(', ')}`)
    .then(() => success(res))
    .then(() => {
      let stringNames = [];
      names.forEach(x => {
        stringNames.push(`'${x}'`);
      });
      return connection.query(`SELECT * FROM Vendors WHERE name IN (${stringNames.join(', ')})`);
    })
    .then((results) => {
      let nameStrings = results.map(x => {
        return `{${x.name}=vendor_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Vendor${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} added.`);
    })
    .catch(err => {
      if (err.code == 'ER_DUP_ENTRY') {
        return res.status(400).send('Duplicate name or code with other vendor');
      }
      handleError(err, res);
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
    })
    .then(() => {
      let stringNames = [];
      names.forEach(x => {
        stringNames.push(`'${x}'`);
      });
      return connection.query(`SELECT * FROM Vendors WHERE name IN (${stringNames.join(', ')})`);
    })
    .then((results) => {
      let nameStrings = results.map(x => {
        return `{${x.name}=vendor_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Vendor${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} modified.`);
    })
    .then(() => success(res))
    .catch(err => {
      if (err.code == 'ER_DUP_ENTRY') {
        return res.status(400).send('Duplicate name or code with other vendor');
      }
      handleError(err, res);
    });
}

/* req.body.ids = [
 *   1, 2, 3
 * ];
 *
 */
export function deleteVendors(req, res, next) {
  const ids = req.body.ids;
  let vendors;
  if (!ids || ids.length < 1) {
    return res.status(400).send('Invalid input object, see doc.');
  }
  for (let id of ids) {
    if (!checkNumber.isPositiveInteger(id)) {
      return res.status(400).send(`Invalid id ${id}`);
    }
  }
  connection.query(`UPDATE Vendors SET removed = 1 WHERE id IN (${ids.join(', ')})`)
    .then(() => {
      return connection.query(`SELECT id FROM VendorsIngredients WHERE vendor_id IN (${ids.join(', ')})`);
    })
    .then(results => {
      const vendorIngredientIds = results.map(e => e.id);
      return fakeDeleteMultipleVendorIngredients(vendorIngredientIds);
    })
    .then(() => success(res))
    .then(() => {
      return connection.query(`SELECT * FROM Vendors WHERE id IN (${ids.join(', ')})`);
    })
    .then((results) => {
      const nameStrings = results.map(x => {
        return `{${x.name}=vendor_id=${x.id}}`;
      });
      return logAction(req.payload.id, `Vendor${nameStrings.length > 1 ? 's' : ''} ${nameStrings.join(', ')} deleted.`);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Database error');
    });
}
