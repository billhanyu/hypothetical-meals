import * as checkParams from './common/checkParams';
import User from '../models/User';
const passport = require('passport');

export function signupAdmin(req, res, next) {
  signupUser(req, res, next, true);
}

export function signupNoob(req, res, next) {
  signupUser(req, res, next, false);
}

function signupUser(req, res, next, isAdmin) {
  const error = checkParams.checkBlankParams(req.body.user, ['name', 'username', 'password']);
  if (error) return res.status(422).send(error);

  let regex = new RegExp('^([ \u00c0-\u01ffa-zA-Z\'\-])+$');
  if (!regex.test(req.body.user.name)) return res.status(422).send('Invalid characters used in name');

  let user = new User(req.body.user);
  user.setPassword(req.body.user.password);

  const userGroup = isAdmin ? 'admin' : 'noob';
  connection.query(`INSERT INTO Users (username, name, hash, salt, user_group) VALUES ('${user.username}', '${user.name}', '${user.hash}', '${user.salt}', '${userGroup}');`)
  .then(() => connection.query(`SELECT id FROM Users WHERE username = '${user.username}';`))
  .then((results) => {
    if (results.length == 0) return res.status(500).send('Database error');
    user.id = results[0].id;
    return res.status(200).json({user: user.getBasicInfo()});
  })
  .catch((error) => {
    if (error.code == 'ER_DUP_ENTRY') return res.status(422).json('Username is already registered');
    else if (error.code == 'ER_DATA_TOO_LONG') return res.status(422).json('Username or name is too long');
    else console.log(error);
  });
}

export function login(req, res, next) {
  const error = checkParams.checkBlankParams(req.body.user, ['username', 'password']);
  if (error) return res.status(422).send(error);
  passport.authenticate('local', {session: false}, function(err, user, info) {
    if (err) return next(err);
    if (user) return res.json({user: user.getBasicInfo()});
    else return res.status(422).send('E-mail or password is incorrect');
  })(req, res, next);
}
