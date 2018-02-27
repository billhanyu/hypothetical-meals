import { handleError } from './common/customError';
import { getNumPages, queryWithPagination } from './common/pagination';

const logInsertString = 'INSERT INTO SystemLogs';
const logQuery = 'SELECT SystemLogs.*, Users.username FROM SystemLogs JOIN Users ON SystemLogs.user_id = Users.id';

export function logAction(userId, logString) {
  return connection.query(`${logInsertString} (user_id, description) VALUES (${userId}, '${logString}')`);
}

export function pages(req, res, next) {
  getNumPages('SystemLogs')
    .then(results => res.json(results))
    .catch(err => {
      console.error(err);
      return res.status(500).send('Database error');
    });
}

export function viewAll(req, res, next) {
  const queryParams = req.query;
  connection.query(`${logQuery} ORDER BY SystemLogs.id`)
    .then((results) => {
      const filteredResults = ingredientFilter(queryParams, results);
      res.json(filteredResults);
    })
    .catch((err) => handleError(err, res));
}

function ingredientFilter(queryParams, results) {
  let filteredResults = [];
  if ('ingredient_id' in queryParams) {
      results.forEach(x => {
          if (x.description.indexOf(`ingredient_id=${queryParams['ingredient_id']}`) >= 0) {
              filteredResults.push(x);
          }
      });
      return filteredResults;
  } else {
      return results;
  }
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'SystemLogs', logQuery, 'ORDER BY SystemLogs.id')
    .then((results) => res.json(results))
    .catch(err => handleError(err, res));
}
