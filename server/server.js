const express = require('express');
import * as user from './user';
import * as ingredient from './ingredient';
import * as storage from './storage';
import * as log from './log';
import * as inventory from './inventory';

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
