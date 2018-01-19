import * as checkNumber from './common/checkNumber';

export function getVendorsForIngredient(req, res, next) {
  const ingredientId = req.params.ingredient_id;
  if (!checkNumber.isPositiveInteger(ingredientId)) {
    res.status(400).send('Invalid Ingredient Id');
  }
  connection.query(`SELECT * from VendorsIngredients WHERE ingredient_id = ${ingredientId}`)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.error(err);
      res.status(500).send('Database error');
    });
}
