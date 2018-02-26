import { handleError } from './common/customError';
import { getNumPages, queryWithPagination } from './common/pagination';

const logInsertString = 'INSERT INTO SystemLogs';
const logQuery = 'SELECT SystemLogs.*, Users.username FROM SystemLogs INNER JOIN Users ON SystemLogs.user_id = Users.id';

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
  connection.query(logQuery)
    .then((results) => res.json(results))
    .catch((err) => {
      handleError(err, res);
    });
}

export function view(req, res, next) {
  queryWithPagination(req.params.page_num, 'SystemLogs', logQuery)
    .then((results) => res.json(results))
    .catch(err => handleError(err, res));
}
