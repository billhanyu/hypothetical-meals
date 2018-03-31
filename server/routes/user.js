import * as checkParams from './common/checkParams';
import User from '../models/User';
import { handleError, createError } from './common/customError';
import success from './common/success';
import { logAction } from './systemLogs';
const passport = require('passport');

export function signupAdmin(req, res, next) {
  signupUser(req, res, next, 'admin');
}

export function signupNoob(req, res, next) {
  signupUser(req, res, next, 'noob');
}

export function signupManager(req, res, next) {
  signupUser(req, res, next, 'manager');
}

function signupUser(req, res, next, userGroup) {
  const error = checkParams.checkBlankParams(req.body.user, ['username', 'name', 'password']);
  if (error) return res.status(422).send(error);

  let regex = new RegExp('^([ \u00c0-\u01ffa-zA-Z\'\-])+$');
  if (req.body.user.name && !regex.test(req.body.user.name)) return res.status(422).send('Invalid characters used in name');

  let user = new User(req.body.user);
  user.setPassword(req.body.user.password);

  connection.query(`INSERT INTO Users (username, name, hash, salt, user_group) VALUES ('${user.username}', '${user.name || ''}', '${user.hash}', '${user.salt}', '${userGroup}');`)
  .then(() => connection.query(`SELECT id FROM Users WHERE username = '${user.username}' AND removed = 0;`))
  .then((results) => {
    if (results.length == 0) return res.status(500).send('Database error');
    user.id = results[0].id;
    return res.status(200).json({ user: user.getBasicInfo() });
  })
  .then(() => {
    return logAction(req.payload ? req.payload.id : user.id, `Account created for user ${user.username}.`);
  })
  .catch((error) => {
    if (error.code == 'ER_DUP_ENTRY') return res.status(422).json('Username is already registered');
    else if (error.code == 'ER_DATA_TOO_LONG') return res.status(422).json('Username or name is too long');
    else handleError(error, res);
  });
}

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * Gets all nondeleted users.
 */
export function viewAll(req, res, next) {
  connection.query(`SELECT * FROM Users WHERE removed = 0`)
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

/**
 *
 * @param {*} req
 * req.body.user = {
 *  'username': bleh,
 * }
 * @param {*} res
 * @param {*} next
 */
export function deleteUser(req, res, next) {
  const user = req.body.user;
  let userId;
  connection.query(`SELECT * FROM Users WHERE username IN ('${user.username}') AND removed = 0`)
    .then((results) => {
      if (results.length != 1) {
        throw createError('Trying to delete nonexistant user');
      }
      userId = results[0].id;
      return connection.query(`UPDATE Users SET removed = 1 WHERE id = ?`, [userId]);
    })
    .then(() => {
      return logAction(req.payload.id, `Account deleted for user ${user.username}.`);
    })
    .then(() => {
      success(res);
    })
    .catch((err) => {
      handleError(err, res);
    });
}

export function login(req, res, next) {
  const error = checkParams.checkBlankParams(req.body.user, ['username', 'password']);
  if (error) return res.status(422).send(error);
  passport.authenticate('local', { session: false }, function(err, user, info) {
    if (err) return next(err);
    if (user) return res.json({ user: user.getBasicInfo() });
    else return res.status(422).send('E-mail or password is incorrect');
  })(req, res, next);
}

export function loginOauth(req, res, next) {
  const error = checkParams.checkBlankParams(req.body.info, ['netid', 'name']);
  if (error) return res.status(400).send(error);
  const netid = req.body.info.netid;
  const name = req.body.info.name;
  connection.query(`SELECT * FROM Users WHERE username = '${netid}' AND oauth = 1 AND removed = 0`)
    .then(result => {
      if (result.length == 0) {
        connection.query(`INSERT INTO Users
          (username, name, oauth) VALUES
          ('${netid}', '${name}', 1) ON DUPLICATE KEY UPDATE removed = 0, user_group = 'noob'`)
          .then(result => {
            return connection.query(`SELECT * FROM Users WHERE username = '${netid}' AND oauth = 1 AND removed = 0`);
          })
          .then(result => tokenForOauth(result[0], res))
          .catch(err => {
            throw err;
          });
      } else {
        return tokenForOauth(result[0], res);
      }
    })
    .catch(err => handleError(err, res));
}

function tokenForOauth(userData, res) {
  const user = new User(userData);
  return res.json({ user: user.getBasicInfo() });
}

export function changePermission(req, res, next) {
  const user = req.body.user;
  let userId;
  const error = checkParams.checkBlankParams(user, ['username', 'permission']);
  if (error) {
    return res.status(400).send(error);
  }
  if (user.oauth != 0 && user.oauth != 1) {
    return res.status(400).send('Use 0 and 1 for oauth value.');
  }
  const validPermissions = ['noob', 'manager', 'admin'];
  if (validPermissions.indexOf(user.permission) < 0) {
    return res.status(400).send('Invalid New Permission.');
  }
  connection.query(`SELECT * FROM Users WHERE username = '${user.username}' AND oauth = ${user.oauth} AND removed = 0`)
    .then(result => {
      if (result.length == 0) {
        throw createError('User does not exist.');
      }
      userId = result[0].id;
      return connection.query(`UPDATE Users SET user_group = '${user.permission}' WHERE id = ${result[0].id} AND removed = 0`);
    })
    .then(result => success(res))
    .then(() => {
      return logAction(req.payload.id, `Account permission for user ${user.username} changed to ${user.permission == 'noob' ? 'unprivileged' : user.permission}.`);
    })
    .catch(err => handleError(err, res));
}

