import { createError, handleError } from './common/customError';
import success from './common/success';


const formulaQueryString = 'SELECT * FROM Formulas';
const formulaEntryQuery = 'SELECT FormulaEntries.*';

/**
 *
 * @param {*} req
 * @param {*} res
 * res.body: [{
 *      id: 'myId',
 *      name: 'myName',
 *      description: 'myDescription',
 *      num_product: 1
 *      ingredients: {
 *          'ingredient1': {
 *              'ingredient_id': 1,
 *              'num_native_units': 1,
 *              'native_unit': kg,
 *          }
 *          ...
 *      },
 *      ...
 * ]
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
                    'ingredient_id': x.ingredient_id,
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

/**
 *
 * @param {*} req
 * req.body.formulas: [{
 *      name: 'myName',
 *      description: 'myDescription',
 *      num_product: 1
 *      ingredients: [{
 *          'ingredient_id': 1
 *          'num_native_units': 1,
 *          }],
 *      }]
 * }
 * @param {*} res
 * @param {*} next
 */
export function add(req, res, next) {
    const formulas = req.body.formulas;
    let names = [];
    let formulaCases = [];
    formulas.forEach(x => {
        names.push(`'${x.name}'`);
        formulaCases.push(`('${x.name}', '${x.description}', ${x.num_product})`);
    });
    connection.query(`${formulaQueryString} WHERE name IN (${names.join(', ')})`)
        .then((results) => {
            if (results.length > 0) {
                throw createError('Trying to add a formula that already exists in database');
            }
            return connection.query(`INSERT INTO Formulas (name, description, num_product) VALUES ${formulaCases.join(', ')}`);
        })
        .then(() => {
            return addFormulaEntries(formulas);
        })
        .then(() => {
            success(res);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

/**
 *
 * @param {*} formulas
 * formulas = [
 *   {
 *      name: 'formulaName',
 *      ingredients: [{
 *          'ingredient_id': 1
 *          'num_native_units': 1,
 *          },...
 *      ],
 *    },...
 * ]
 * @return {Promise} Promise object representing success or failure of database insert
 */
function addFormulaEntries(formulas) {
    return new Promise((resolve, reject) => {
        const formulaEntryCases = [];
        const names = formulas.map(x => `'${x.name}'`);

        connection.query(`${formulaQueryString} WHERE name IN (${names.join(', ')})`)
            .then((dataFormulas) => {
                let nameIdTuple = {};
                dataFormulas.forEach(x => {
                    nameIdTuple[`${x.name}`] = x.id;
                });
                formulas.forEach(x => {
                    let ingredients = x.ingredients;
                    ingredients.forEach(i => {
                        formulaEntryCases.push(`(${i.ingredient_id}, ${i.num_native_units}, ${nameIdTuple[x.name]})`);
                    });
                });
                return connection.query(`INSERT INTO FormulaEntries (ingredient_id, num_native_units, formula_id) VALUES ${formulaEntryCases.join(', ')}`);
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
    });
}
