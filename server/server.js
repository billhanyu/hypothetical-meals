const express = require('express');
const mysql = require('mysql');
const alasql = require('alasql');
import * as user from './user';
import * as ingredient from './ingredient';
import * as storage from './storage';
import * as log from './log';
import * as inventory from './inventory';

let config;
try {
  config = require('./config');
} catch (e) {
  config = require('./config.example');
}

if (process.env.NODE_ENV === 'test') {
  alasql('SOURCE "./server/create_database.sql"');
  alasql('SOURCE "./server/sample_data.sql"');
  global.connection = {
    query: (queryBody, callback) => {
      alasql
        .promise(queryBody)
        .then(res => {
          callback(null, res, null);
        }).catch(err => {
          callback(err, null, null);
        });
    },
  };
} else {
  global.connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
  });
  connection.connect();
}

const app = express();

app.post('/users/admin', user.signup);
app.post('/users/login', user.login);
app.get('/users', user.getInfo);

app.post('/ingredients', ingredient.addIngredient);
app.put('/ingredients/:id', ingredient.modifyIngredient);
app.delete('/ingredients/:id', ingredient.deleteIngredient);

app.put('/storage', storage.changeStorage);

app.get('/log/:ingredient_id', log.viewLogForIngredient);
app.post('/log', log.addEntry);

app.get('/inventory', inventory.view);
app.put('/inventory/admin', inventory.modifyQuantities);
app.put('/inventory', inventory.commitCart);

app.listen(1717, () => {
  console.log('Node app start at port 1717');
});

export default app; // for testing
