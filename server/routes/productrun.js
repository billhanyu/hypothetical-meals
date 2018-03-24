import { handleError } from './common/customError';

export function view(req, res, next) {
  const productruns = {};
  connection.query(`SELECT ProductRuns.*, Formulas.name, Users.name AS user_name
    FROM ProductRuns
    INNER JOIN Formulas ON ProductRuns.formula_id = Formulas.id
    INNER JOIN Users ON ProductRuns.user_id = Users.id`)
    .then(results => {
      results.forEach(run => {
        run.ingredients = [];
        productruns[run.id] = run;
      });
      return connection.query(`
        SELECT ProductRunsEntries.*, Vendors.name AS vendor_name, Ingredients.id AS ingredient_id, Ingredients.name AS ingredient_name, Ingredients.native_unit AS ingredient_native_unit
        FROM ProductRunsEntries
        JOIN Ingredients ON ProductRunsEntries.ingredient_id = Ingredients.id
        JOIN Vendors ON ProductRunsEntries.vendor_id = Vendors.id`);
    })
    .then(results => {
      results.forEach(entry => {
        productruns[entry.productrun_id].ingredients.push(entry);
      });
      return res.json(Object.values(productruns));
    })
    .catch(err => {
      console.log(err);
      handleError(err, res);
    });
}
