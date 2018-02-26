import { createError, handleError } from './common/customError';
import success from './common/success';
import { getNumPages, queryWithPagination } from './common/pagination';

const logInsertString = 'INSERT INTO SystemLogs';
const logQuery = 'SELECT * FROM SystemLogs';

export function logAction(userId, logString) {
    return connection.query(`${logInsertString} (user_id, description) VALUES (${userId}, '${logString}')`);
}

export function pages(req, res, next) {
    getNumPages('SystemLogs')
    .then(results => res.status(200).send(results))
    .catch(err => {
        console.error(err);
        return res.status(500).send('Database error');
    });
}

// systemlogs?user_id=1&from_date=blah&to_date=blah date in form YYYY-MM-DD
export function viewAll(req, res, next) {
    const queryParams = req.query;
    connection.query(getQueryString(queryParams))
        .then((results) => {
            const filteredResults = ingredientFilter(queryParams, results);
            res.status(200).send(filteredResults);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

function ingredientFilter(queryParams, results) {
    let filteredResults = [];
    if ('ingredient_id' in queryParams) {
        results.forEach(x => {
            if (x.description.indexOf(`ingredient_id: ${queryParams['ingredient_id']}`) >= 0) {
                filteredResults.push(x);
            }
        });
        return filteredResults;
    } else {
        return results;
    }
}

/**
 *
 * @param {*} queryParams where keys are the parameters to search for and values are their values
 * @return {String}
 */
export function getQueryString(queryParams) {
    let queryCases = [];
    Object.keys(queryParams).forEach(x => {
        if (x == 'from_date') {
            queryCases.push(`created_at >= '${queryParams[x]} 00:00:00'`);
        } else if (x == 'to_date') {
            queryCases.push(`created_at <= '${queryParams[x]} 23:59:59'`);
        } else if (x == 'ingredient_id') {
        } else {
            queryCases.push(`${x} = ${queryParams[x]}`);
        }
    });
    return `${logQuery} ${queryCases.length > 0 ? 'WHERE' : ''} ${queryCases.join(' AND ')}`;
}

export function view(req, res, next) {
    const queryParams = req.query;
    queryWithPagination(req.params.page_num, 'SystemLogs', getQueryString(queryParams))
        .then((results) => {
            const filteredResults = ingredientFilter(queryParams, results);
            res.status(200).send(filteredResults);
        })
        .catch(err => {
            return res.status(500).send('Database error');
        });
}
