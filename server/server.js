const express = require('express');
const mysql = require('mysql');
const alasql = require('alasql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const auth = require('./auth');
import * as user from './routes/user';
import * as ingredient from './routes/ingredient';
import * as storage from './routes/storage';
import * as log from './routes/log';
import * as inventory from './routes/inventory';
import * as vendor from './routes/vendor';
import * as vendorIngredient from './routes/vendorIngredient';
import * as spendinglog from './routes/spendinglog';

require('./routes/common/passport');

let config;
try {
  config = require('./config');
} catch (e) {
  config = require('./config.example');
}

if (process.env.NODE_ENV === 'test') {
  global.connection = {
    query: alasql.promise,
  };
} else {
  const pool = mysql.createPool({
    connectionLimit: config.mySqlParams.connectionLimit,
    host: config.mySqlParams.host,
    user: config.mySqlParams.user,
    password: config.mySqlParams.password,
    database: config.mySqlParams.database,
  });
  global.connection = {
    query: (...args) => {
      return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
          if (err) reject(err);
          connection.query(...args, (err, results, fields) => {
            if (err) reject(err);
            resolve(results);
            connection.release();
          });
        });
      });
    },
  };
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/users/admin', user.signupAdmin);
app.post('/users/noob', auth.required, user.signupNoob);
app.post('/users/login', user.login);

app.get('/vendors', auth.required, vendor.view);

app.get('/ingredients', auth.required, ingredient.view);
app.post('/ingredients', auth.required, ingredient.addIngredient);
app.put('/ingredients/:id', auth.required, ingredient.modifyIngredient);
app.delete('/ingredients/:id', auth.required, ingredient.deleteIngredient);

app.get('/vendoringredients/:ingredient_id', auth.required, vendorIngredient.getVendorsForIngredient);
app.post('/vendoringredients', auth.required, vendorIngredient.addVendorIngredients);
app.put('/vendoringredients', auth.required, vendorIngredient.modifyVendorIngredients);
app.delete('/vendoringredients', auth.required, vendorIngredient.deleteVendorIngredients);

app.get('/storages', auth.required, storage.view);
app.put('/storages', auth.required, storage.changeStorage);

app.get('/logs', auth.required, log.view);
app.get('/logs/ingredients', auth.required, log.viewLogForIngredient);
app.post('/logs', auth.required, log.addEntry);

app.get('/spendinglogs', auth.required, spendinglog.view);

app.get('/inventory', auth.required, inventory.view);
app.put('/inventory/admin', auth.required, inventory.modifyQuantities);
app.put('/inventory', auth.required, inventory.commitCart);

app.listen(1717, () => {
  console.log('Node app start at port 1717');
});

export default app; // for testing
