import { handleError, createError } from './routes/common/customError';

export function adminRequired(req, res, next) {
  userQuery(req, res, next, ['admin']);
}

export function managerRequired(req, res, next) {
  userQuery(req, res, next, ['manager', 'admin']);
}

export function noobRequired(req, res, next) {
  userQuery(req, res, next, ['noob', 'manager', 'admin']);
}

function userQuery(req, res, next, groups) {
  connection.query(`SELECT username, oauth, name, user_group, removed FROM Users WHERE id = ${req.payload.id}`)
    .then(results => {
      if (results.length == 0) throw createError('Database error');
      if (results[0].removed == 1) throw createError("User does not exist");
      const user = results[0];
      req.user = {
        username: user['username'],
        oauth: user['oauth'],
        name: user['name'],
        user_group: user['user_group'],
      };
      if (groups.indexOf(req.user.user_group) < 0) {
        throw createError(401, `Unauthorized. Required groups: ${groups}`);
      }
      next();
    })
    .catch(err => handleError(err, res));
}
