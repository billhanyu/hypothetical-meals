const express = require('express');
const mysql = require('mysql');
const alasql = require('alasql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./auth');
import * as user from './routes/user';
import * as ingredient from './routes/ingredient';
import * as storage from './routes/storage';
import * as log from './routes/log';
import * as inventory from './routes/inventory';
import * as vendor from './routes/vendor';
import * as vendorIngredient from './routes/vendorIngredient';
import * as spendinglog from './routes/spendinglog';
import * as order from './routes/order';
import { adminRequired, noobRequired } from './authMiddleware';

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

const beAdmin = [auth.required, adminRequired];
const beNoob = [auth.required, noobRequired];


app.use(express.static(`${__dirname}/../frontend/react-client/dist`));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../frontend/react-client/dist/index.html`));
});

app.post('/users/admin', user.signupAdmin);
app.post('/users/noob', beAdmin, user.signupNoob);
app.post('/users/login', user.login);

app.get('/vendors/pages', beNoob, vendor.pages);
app.get('/vendors/page/:page_num', beNoob, vendor.view);
app.get('/vendors-available/page/:page_num', beNoob, vendor.viewAvailable);
app.post('/vendors', beAdmin, vendor.addVendors);
app.put('/vendors', beAdmin, vendor.modifyVendors);
app.delete('/vendors', beAdmin, vendor.deleteVendors);

app.get('/ingredients/pages', beNoob, ingredient.pages);
app.get('/ingredients/page/:page_num', beNoob, ingredient.view);
app.get('/ingredients-available/page/:page_num', beNoob, ingredient.viewAvailable);
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

app.get('/inventory/pages', beNoob, inventory.pages);
app.get('/inventory/page/:page_num', beNoob, inventory.view);
app.put('/inventory/admin', beAdmin, inventory.modifyQuantities);
app.put('/inventory', beNoob, inventory.commitCart);

app.listen(1717, () => {
  console.log('Node app start at port 1717');
});

export default app; // for testing
