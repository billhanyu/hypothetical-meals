// import * as checkNumber from './common/checkNumber';
// import { createError, handleError } from './common/customError';
// import { getSpace } from './common/packageUtilies';
// import success from './common/success';
// import { updateConsumedSpendingLogForCart } from './spendinglog';
// import { logAction } from './systemLogs';
// import { uuid } from './common/uuid';

const basicViewQueryString = 'SELECT * from Sales';

export function getAll(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function submitRequest(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function confirmSale(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}

export function cancelSale(req, res, next) {
  connection.query(basicViewQueryString)
    .then(results => res.status(200).send(results))
    .catch(err => handleError(err, res));
}
