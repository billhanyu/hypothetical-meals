const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./auth');
const path = require('path');
import * as user from './routes/user';
import * as ingredient from './routes/ingredient';
import * as storage from './routes/storage';
import * as inventory from './routes/inventory';
import * as vendor from './routes/vendor';
import * as vendorIngredient from './routes/vendorIngredient';
import * as spendinglog from './routes/spendinglog';
import * as systemlogs from './routes/systemLogs';
import * as order from './routes/order';
import * as formulas from './routes/formula';
import * as productionlog from './routes/productionlog';
import * as recallReport from './routes/recallReport';
import * as productionrun from './routes/productrun';
import * as productionlines from './routes/productionLine';
import * as sales from './routes/sales';
import * as efficiencyReport from './routes/efficiencyReport';
import * as profitReport from './routes/profitReport';
import { adminRequired, noobRequired, managerRequired } from './authMiddleware';

import getConfig from './getConfig';

require('./routes/common/passport');

const config = getConfig();

const mysqlConfigs = {
  connectionLimit: config.mySqlParams.connectionLimit,
  host: config.mySqlParams.host,
  user: config.mySqlParams.user,
  password: config.mySqlParams.password,
  database: config.mySqlParams.database,
};

if (process.env.NODE_ENV === 'test') {
  mysqlConfigs.database = `${mysqlConfigs.database}_test`;
  mysqlConfigs.multipleStatements = true;
}

mysqlConfigs.typeCast = (field, next) => {
  if (field.type == 'BIT' && field.length == 1) {
      const bit = field.string();

      return (bit === null) ? null : bit.charCodeAt(0);
  }
  return next();
};

const pool = mysql.createPool(mysqlConfigs);
global.connection = {
  query: (...args) => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
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
app.get('/users', beAdmin, user.viewAll);
app.post('/users/delete', beAdmin, user.deleteUser);

app.get('/vendors/pages', beNoob, vendor.pages);
app.get('/vendors/page/:page_num', beNoob, vendor.view);
app.get('/vendors-available', beNoob, vendor.viewAvailable);
app.get('/vendors/id/:id', beNoob, vendor.viewWithId);
app.post('/vendors', beAdmin, vendor.addVendors);
app.put('/vendors', beAdmin, vendor.modifyVendors);
app.delete('/vendors', beAdmin, vendor.deleteVendors);
app.get('/vendors/code', beAdmin, vendor.getVendorWithCode);

app.get('/ingredients/id/:id', beNoob, ingredient.viewWithId);
app.get('/ingredients/pages', beNoob, ingredient.pages);
app.get('/ingredients/page/:page_num', beNoob, ingredient.view);
app.get('/ingredients', beNoob, ingredient.viewAll);
app.post('/ingredients', beAdmin, ingredient.addIngredient);
app.put('/ingredients', beAdmin, ingredient.modifyIngredient);
app.delete('/ingredients', beAdmin, ingredient.deleteIngredient);
app.post('/ingredients/import', [auth.required, adminRequired, upload.single('bulk')], ingredient.bulkImport);
app.get('/ingredients/freshness', beNoob, ingredient.freshness);

app.get('/vendoringredients/pages', beNoob, vendorIngredient.pages);
app.get('/vendoringredients/page/:page_num', beNoob, vendorIngredient.view);
app.get('/vendoringredients-available/page/:page_num', beNoob, vendorIngredient.viewAvailable);
app.get('/vendoringredients/:ingredient_id', beNoob, vendorIngredient.getVendorsForIngredient);
app.post('/vendoringredients', beAdmin, vendorIngredient.addVendorIngredients);
app.put('/vendoringredients', beAdmin, vendorIngredient.modifyVendorIngredients);
app.delete('/vendoringredients', beAdmin, vendorIngredient.deleteVendorIngredients);

app.get('/storages', beNoob, storage.view);
app.put('/storages', beAdmin, storage.changeStorage);

app.post('/order', beManager, order.placeOrder);
app.put('/order', beManager, order.markIngredientArrived);
app.get('/order/pending', beManager, order.viewPendingOrders);
app.get('/order', beManager, order.viewAllOrders);

app.get('/spendinglogs/pages', beNoob, spendinglog.pages);
app.get('/spendinglogs/page/:page_num', beNoob, spendinglog.view);
app.get('/spendinglogs/:ingredient_id', beNoob, spendinglog.logsForIngredient);

app.get('/systemlogs/pages', beManager, systemlogs.pages);
app.get('/systemlogs/page/:page_num', beManager, systemlogs.view);
app.get('/systemlogs', beManager, systemlogs.viewAll);

app.get('/productionlogs/pages', beNoob, productionlog.pages);
app.get('/productionlogs/page/:page_num', beNoob, productionlog.view);

app.get('/productruns', beNoob, productionrun.view);

app.get('/inventory', beNoob, inventory.all);
app.get('/inventory/final', beNoob, inventory.allFinal);
app.get('/inventory/lot/:ingredient_id', beNoob, inventory.getLotQuantities);
app.get('/inventory/productionlots/:ingredient_id', beNoob, inventory.getProductionLots);
app.get('/inventory/stock', beManager, inventory.getStock);
app.put('/inventory/admin', beAdmin, inventory.modifyQuantities);
app.put('/inventory', beManager, inventory.commitCart);

app.get('/formulas', beNoob, formulas.viewAll);
app.get('/formulas/id/:id', beNoob, formulas.viewWithId);
app.get('/formulas/pages', beNoob, formulas.pages);
app.get('/formulas/page/:page_num', beNoob, formulas.view);
app.put('/formulas', beAdmin, formulas.modify);
app.post('/formulas', beAdmin, formulas.add);
app.delete('/formulas', beAdmin, formulas.deleteFormulas);
app.post('/formulas/import/final', [auth.required, adminRequired, upload.single('bulk')], formulas.finalBulkImport);
app.post('/formulas/import/intermediate', [auth.required, adminRequired, upload.single('bulk')], formulas.intermediateBulkImport);
app.get('/formulas-freshness', beNoob, formulas.freshness);

app.get('/recall', beNoob, recallReport.getRecallForIngredient);

app.get('/productionlines', beNoob, productionlines.view);
app.get('/productionlines/id/:id', beNoob, productionlines.viewWithId);
app.get('/productionlines/formulaid/:id', beNoob, productionlines.viewWithFormulaId);
app.post('/productionlines', beAdmin, productionlines.add);
app.post('/formulaproductionlines', beAdmin, productionlines.addFormulaToLine);
app.delete('/formulaproductionlines', beAdmin, productionlines.deleteFormulaFromLine);
app.put('/productionlines', beAdmin, productionlines.modify);
app.delete('/productionlines', beAdmin, productionlines.deleteProductionLine);
app.post('/productionlines/complete', beManager, productionlines.completeProductionOnLine);

app.get('/sales/all', beManager, sales.getAll);
app.post('/sales', beManager, sales.submit);

app.get('/efficiency', beNoob, efficiencyReport.view);

app.get('/profitability', beNoob, profitReport.view);

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
