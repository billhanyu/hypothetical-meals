const express = require('express');
const mysql = require('mysql');
const alasql = require('alasql');
const auth = require('./auth');
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
  const pool = mysql.createPool({
    connectionLimit : config.mySqlParams.connectionLimit,
    host: config.mySqlParams.host,
    user: config.mySqlParams.user,
    password: config.mySqlParams.password,
    database: config.mySqlParams.database,
  });
  global.connection = {
    query: (queryBody, callback) => {
      pool.getConnection(function(err, connection) {
        if(err) callback(err, null, null);
        connection.query(queryBody, callback);
      });
    }
  }
}

const app = express();

app.post('/users/admin', user.signupAdmin);
app.post('/users/noob', user.signupNoob);
app.post('/users/login', user.login);
app.get('/users', auth.required, user.getInfo);

app.post('/ingredients', auth.required, ingredient.addIngredient);
app.put('/ingredients/:id', auth.required, ingredient.modifyIngredient);
app.delete('/ingredients/:id', auth.required, ingredient.deleteIngredient);

app.put('/storage', auth.required, storage.changeStorage);

app.get('/log/:ingredient_id', auth.required, log.viewLogForIngredient);
app.post('/log', auth.required, log.addEntry);

app.get('/inventory', auth.required, inventory.view);
app.put('/inventory/admin', auth.required, inventory.modifyQuantities);
app.put('/inventory', auth.required, inventory.commitCart);

app.listen(1717, () => {
  console.log('Node app start at port 1717');
});

export default app; // for testing
