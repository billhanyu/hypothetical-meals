import { createError, handleError } from './common/customError';
import success from './common/success';


const formulaQueryString = 'SELECT Formulas.*';
const formulaEntryQuery = 'SELECT FormulaEntries.*';

/**
 *
 * @param {*} req
 * req.body.formulas: [{
 *      id: 'myId',
 *      name: 'myName',
 *      description: 'myDescription',
 *      ingredients: {
 *          'ingredient1': 'ingredient1_quantity',
 *          'ingredient2': 'ingredient2_quantity',
 *          ...
 *      },
 *      ...
 *      ]
 * }
 * @param {*} res
 * @param {*} next
 */
export function view(req, res, next) {
    let myFormulas = {};
    connection.query(`${formulaQueryString}`)
    .then((results) => {
        results.forEach(x => {
            let formulaObject = {
                'id': x.id,
                'name': x.name,
                'description': x.description,
                'ingredients': {},
            };
            myFormulas[`${x.id}`] = formulaObject;
        });
        return connection.query(`${formulaEntryQuery}, Ingredients.name FROM FormulaEntries
            JOIN Ingredients ON FormulaEntries.ingredient_id = Ingredients.id`);
    })
    .then((formulaEntries) => {
        formulaEntries.forEach(x => {
            let ingredientTuple = {
                'quantity': x.quantity,
                'num_native_units': x.num_native_units,
            };
            myFormulas[`${x['formula_id']}`]['ingredients'][`${x.name}`] = ingredientTuple;
        });
        res.status.send(myFormulas);
    })
    .catch((err) => {
        handleError(err, res);
    });
}
