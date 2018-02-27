const express = require('express');
const mysql = require('mysql');
const alasql = require('alasql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./auth');
const path = require('path');
import * as user from './routes/user';
import * as ingredient from './routes/ingredient';
import * as storage from './routes/storage';
import * as log from './routes/log';
import * as inventory from './routes/inventory';
import * as vendor from './routes/vendor';
import * as vendorIngredient from './routes/vendorIngredient';
import * as spendinglog from './routes/spendinglog';
import * as systemlogs from './routes/systemLogs';
import * as order from './routes/order';
import * as formulas from './routes/formula';
import * as productionlog from './routes/productionlog';
import { adminRequired, noobRequired, managerRequired } from './authMiddleware';

import getConfig from './getConfig';

require('./routes/common/passport');

const config = getConfig();

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

const beAdmin = [auth.required, adminRequired];
const beNoob = [auth.required, noobRequired];
const beManager = [auth.required, managerRequired];

app.post('/users/admin', user.signupAdmin);
app.post('/users/noob', beAdmin, user.signupNoob);
app.post('/users/manager', beAdmin, user.signupManager);
app.post('/users/login', user.login);
app.post('/users/login/oauth', user.loginOauth);
app.post('/users/permission', beAdmin, user.changePermission);

app.get('/vendors/pages', beNoob, vendor.pages);
app.get('/vendors/page/:page_num', beNoob, vendor.view);
app.get('/vendors/id/:id', beNoob, vendor.viewWithId);
app.post('/vendors', beAdmin, vendor.addVendors);
app.put('/vendors', beAdmin, vendor.modifyVendors);
app.delete('/vendors', beAdmin, vendor.deleteVendors);
app.get('/vendors/code', beAdmin, vendor.getVendorWithCode);

app.get('/ingredients/id/:id', beNoob, ingredient.viewWithId);
app.get('/ingredients/pages', beNoob, ingredient.pages);
app.get('/ingredients/page/:page_num', beNoob, ingredient.view);
app.post('/ingredients', beAdmin, ingredient.addIngredient);
app.put('/ingredients', beAdmin, ingredient.modifyIngredient);
app.delete('/ingredients', beAdmin, ingredient.deleteIngredient);
app.post('/ingredients/import', [auth.required, adminRequired, upload.single('bulk')], ingredient.bulkImport);

app.get('/vendoringredients/pages', beNoob, vendorIngredient.pages);
app.get('/vendoringredients/page/:page_num', beNoob, vendorIngredient.view);
app.get('/vendoringredients-available/page/:page_num', beNoob, vendorIngredient.viewAvailable);
app.get('/vendoringredients/:ingredient_id', beNoob, vendorIngredient.getVendorsForIngredient);
app.post('/vendoringredients', beAdmin, vendorIngredient.addVendorIngredients);
app.put('/vendoringredients', beAdmin, vendorIngredient.modifyVendorIngredients);
app.delete('/vendoringredients', beAdmin, vendorIngredient.deleteVendorIngredients);

app.get('/storages', beNoob, storage.view);
app.put('/storages', beAdmin, storage.changeStorage);

app.post('/order', beNoob, order.placeOrder);

app.get('/logs/pages', beNoob, log.pages);
app.get('/logs/page/:page_num', beNoob, log.view);
app.get('/logs/ingredients/page/:page_num', beNoob, log.viewLogForIngredient);

app.get('/spendinglogs/pages', beNoob, spendinglog.pages);
app.get('/spendinglogs/page/:page_num', beNoob, spendinglog.view);
app.get('/spendinglogs/:ingredient_id', beNoob, spendinglog.logsForIngredient);

app.get('/systemlogs/pages', beManager, systemlogs.pages);
app.get('/systemlogs/page/:page_num', beManager, systemlogs.view);
app.get('/systemlogs', beManager, systemlogs.viewAll);

app.get('/productionlogs/pages', beNoob, productionlog.pages);
app.get('/productionlogs/page/:page_num', beNoob, productionlog.view);

app.get('/inventory', beNoob, inventory.all);
app.get('/inventory/pages', beNoob, inventory.pages);
app.get('/inventory/page/:page_num', beNoob, inventory.view);
app.get('/inventory/stock', beManager, inventory.getStock);
app.put('/inventory/admin', beAdmin, inventory.modifyQuantities);
app.put('/inventory', beManager, inventory.commitCart);

app.get('/formulas', beNoob, formulas.viewAll);
app.get('/formulas/pages', beNoob, formulas.pages);
app.get('/formulas/page/:page_num', beNoob, formulas.view);
app.put('/formulas', beAdmin, formulas.modify);
app.post('/formulas', beAdmin, formulas.add);
app.delete('/formulas', beAdmin, formulas.deleteFormulas);
app.post('/formulas/import', [auth.required, adminRequired, upload.single('bulk')], formulas.bulkImport);

const distDir = `${__dirname}/../frontend/react-client/dist`;
app.use(express.static(distDir));
app.get('/*', (req, res) => {
  res.sendFile(path.resolve(`${distDir}/index.html`));
});

const port = 1717;
app.listen(port, () => {
  console.log(`Node app start at port ${port}`);
});

export default app; // for testing
