import * as checkNumber from './common/checkNumber';

export function view(req, res, next) {
  connection.query('SELECT * FROM SpendingLogs')
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}

export function logsForIngredient(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  if (!ingredientId) {
    return res.status(400).send('Invalid input request, see doc.');
  }
  if (!checkNumber.isPositiveInteger(ingredientId)) {
    return res.status(400).send(`Ingredient ID ${ingredientId} is invalid.`);
  }
  connection.query(`SELECT * FROM SpendingLogs WHERE ingredient_id IN (${ingredientId})`)
  .then(results => res.status(200).send(results))
  .catch(err => {
      console.error(error);
      return res.status(500).send('Database error');
    });
}
