import { createError, handleError } from './common/customError';
import success from './common/success';
import { updateDatabaseHelper } from './common/updateUtilities';
import { getPaginationQueryString, getNumPages } from './common/pagination';


const formulaQueryString = 'SELECT * FROM Formulas WHERE removed = 0';
const formulaEntryQuery = 'SELECT FormulaEntries.*';
const dbFormulaNameCheck = `${formulaQueryString} AND name IN`;

export function pages(req, res, next) {
    getNumPages('Formulas')
    .then(results => res.status(200).send(results))
    .catch(err => {
      return res.status(500).send('Database error');
    });
}

export function view(req, res, next) {
    const viewByPageQuery = getPaginationQueryString(req.params.page_num, 'Formulas', formulaQueryString);
    getFormulas(viewByPageQuery, req, res, next);
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function viewAll(req, res, next) {
    getFormulas(formulaQueryString, req, res, next);
}

function getFormulas(queryString, req, res, next) {
    let myFormulas = {};
    connection.query(`${queryString}`)
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
            return connection.query(`${formulaEntryQuery}, Ingredients.name, Ingredients.package_type, Ingredients.storage_id, Ingredients.native_unit, Ingredients.num_native_units as ingredient_num_native_units, Ingredients.removed FROM FormulaEntries
            JOIN Ingredients ON FormulaEntries.ingredient_id = Ingredients.id`);
        })
        .then((formulaEntries) => {
            formulaEntries.forEach(x => {
                myFormulas[`${x['formula_id']}`]['ingredients'][`${x.name}`] = x;
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
    connection.query(`${dbFormulaNameCheck} (${names.join(', ')})`)
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
 * @return {Promise} Promise
 */
function addFormulaEntries(formulas) {
    const formulaEntryCases = [];
    const names = formulas.map(x => `'${x.name}'`);

    return connection.query(`${dbFormulaNameCheck} (${names.join(', ')})`)
        .then((dataFormulas) => {
            if (names.length != dataFormulas.length) {
                throw createError('Trying to add formula entries for nonexistent formula');
            }
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
        .catch((err) => {
            throw err;
        });
}

/**
 *
 * @param {*} req
 * res.body.formulas = [
 *   {
 *      id: 'formulaId',
 *      name: 'formulaName',
 *      description: 'a description',
 *      num_product: 1,
 *      ingredients: [{
 *          'ingredient_id': 1
 *          'num_native_units': 1,
 *          },...
 *      ],
 *    },...
 * ]
 * @param {*} res
 * @param {*} next
 */
export function modify(req, res, next) {
    // check names all exist in database
    let formulas = req.body.formulas;
    let formulaIds = [];
    let hasAllIds = true;
    formulas.forEach(x => {
        if ('id' in x) {
            formulaIds.push(x.id);
        } else {
            hasAllIds = false;
        }
    });
    if (!hasAllIds) {
        handleError(createError('Did not specify id for formula'), res);
        return;
    }

    let formulaIngredients = formulas.map(x => x.ingredients);
    let hasIngredientParams = true;
    formulaIngredients.forEach(f => {
        f.forEach((i) => {
            if (!('ingredient_id' in i) || !('num_native_units' in i)) {
                hasIngredientParams = false;
            }
        });
    });

    if (!hasIngredientParams) {
        handleError(createError('Must give ingredient_id and num_native_units for ingredient'), res);
        return;
    }

    let toUpdate = [];
    connection.query(`${formulaQueryString} AND id IN (${formulaIds.join(', ')})`)
        .then((formulaResults) => {
            if (formulaResults.length != formulas.length) {
                throw createError('Trying to modify formula not in database');
            }
            let oldIdNameTuple = {};
            formulaResults.forEach(x => {
                oldIdNameTuple[x.id] = x.name;
            });
            // update formula values
            formulas.forEach(x => {
                let newUpdate = Object.assign({}, x);
                delete newUpdate.ingredients;
                newUpdate['name'] = x.name || oldIdNameTuple[x.id];
                x['name'] = x.name || oldIdNameTuple[x.id];
                toUpdate.push(newUpdate);
            });
            return updateDatabaseHelper('Formulas', toUpdate);
        })
        .then(() => {
            return connection.query(`DELETE FROM FormulaEntries WHERE formula_id IN (${formulaIds.join(', ')})`);
        })
        .then(() => {
            // add all new updated entries
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
 * Actually deletes from database, not a fake delete
 * @param {*} req
 * req.body.formulas = [1, 2, 3]
 * @param {*} res
 * @param {*} next
 */
export function deleteFormulas(req, res, next) {
    const toDelete = req.headers.formulaid.split(", ");
    connection.query(`${formulaQueryString} AND id IN (${toDelete.join(', ')})`)
        .then((results) => {
            if (results.length != toDelete.length) {
                throw createError('Trying to delete element not in database');
            }
            return connection.query(`DELETE FROM FormulaEntries WHERE formula_id IN (${toDelete.join(', ')})`);
        })
        .then(() => {
            return connection.query(`UPDATE Formulas SET removed = 1 WHERE id IN (${toDelete.join(', ')})`);
        })
        .then(() => {
            success(res);
        })
        .catch((err) => {
            handleError(err, res);
        });
}
