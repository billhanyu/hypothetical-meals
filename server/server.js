const express = require('express');
const mysql = require('mysql');
const alasql = require('alasql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// const auth = require('./auth');
import * as user from './routes/user';
import * as ingredient from './routes/ingredient';
import * as storage from './routes/storage';
import * as log from './routes/log';
import * as inventory from './routes/inventory';
import * as vendor from './routes/vendor';
import * as vendorIngredient from './routes/vendorIngredient';
import * as spendinglog from './routes/spendinglog';

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
app.post('/users/noob', user.signupNoob);
app.post('/users/login', user.login);
app.get('/users', user.getInfo);

app.get('/vendors', vendor.view);

app.get('/ingredients', ingredient.view);
app.post('/ingredients', ingredient.addIngredient);
app.put('/ingredients/:id', ingredient.modifyIngredient);
app.delete('/ingredients/:id', ingredient.deleteIngredient);
app.post('/ingredients/import', upload.single('bulk'), ingredient.bulkImport);

app.get('/vendoringredients/:ingredient_id', vendorIngredient.getVendorsForIngredient);
app.post('/vendoringredients', vendorIngredient.addVendorIngredients);
app.put('/vendoringredients', vendorIngredient.modifyVendorIngredients);
app.delete('/vendoringredients', vendorIngredient.deleteVendorIngredients);

app.get('/storages', storage.view);
app.put('/storages', storage.changeStorage);

app.get('/logs', log.view);
app.get('/logs/ingredients', log.viewLogForIngredient);
app.post('/logs', log.addEntry);

app.get('/spendinglogs', spendinglog.view);
app.get('/spendinglogs/:ingredient_id', spendinglog.logsForIngredient);

app.get('/inventory', inventory.view);
app.put('/inventory/admin', inventory.modifyQuantities);
app.put('/inventory', inventory.commitCart);

app.listen(1717, () => {
  console.log('Node app start at port 1717');
});

export default app; // for testing
