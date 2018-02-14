import { createError, handleError } from './common/customError';
import success from './common/success';


const formulaQueryString = 'SELECT * FROM Formulas';
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
                'num_product': x.num_product,
                'ingredients': {},
            };
            myFormulas[`${x.id}`] = formulaObject;
        });
        return connection.query(`${formulaEntryQuery}, Ingredients.name, Ingredients.native_unit FROM FormulaEntries
            JOIN Ingredients ON FormulaEntries.ingredient_id = Ingredients.id`);
    })
    .then((formulaEntries) => {
        formulaEntries.forEach(x => {
            let ingredientTuple = {
                'quantity': x.quantity,
                'num_native_units': x.num_native_units,
                'native_unit': x.native_unit,
            };
            let currentFormula = myFormulas[`${x['formula_id']}`];
            if (!('ingredients' in currentFormula)) {
                currentFormula['ingredients'] = {};
                currentFormula['ingredients'][`${x.name}`] = ingredientTuple;
            } else {
                myFormulas[`${x['formula_id']}`]['ingredients'][`${x.name}`] = ingredientTuple;
            }
        });
        res.status(200).send(Object.values(myFormulas));
    })
    .catch((err) => {
        handleError(err, res);
    });
}
