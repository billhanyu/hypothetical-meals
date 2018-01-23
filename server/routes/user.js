import * as checkParams from './common/checkParams';
import User from '../models/User';
import passport from './common/passport';

export function signupAdmin(req, res, next) {
  const error = checkParams.checkBlankParams(req.body.user, ['name', 'username', 'password']);
  if (error) return res.status(422).send(error);

  let regex = new RegExp('^([ \u00c0-\u01ffa-zA-Z\'\-])+$');
  if (!regex.test(req.body.user.name)) return res.status(422).send('Invalid characters used in name');

  let user = new User(req.body.user);
  user.setPassword(req.body.user.password);

  connection.query(`INSERT INTO Users (username, name, hash, salt, user_group) VALUES ('${user.username}', '${user.name}', '${user.hash}', '${user.salt}', 'admin');`)
  .then(() => connection.query(`SELECT id FROM Users WHERE username = '${user.username}';`))
  .then((results) => {
    if (results.length ==0) res.status(500).send('Database error'); ;
    user.id = results[0].id;
    return res.json({user: user.getBasicInfo()});
  })
  .catch((error) => {
    if (error.code == 'ER_DUP_ENTRY') return res.status(422).json('Username is already registered');
    else if (error.code == 'ER_DATA_TOO_LONG') return res.status(422).json('Username or name is too long');
    else console.log(error);
  });
}

export function signupNoob(req, res, next) {
  res.status(501).send('todo');
}

export function login(req, res, next) {
  const error = checkParams.checkBlankParams(req.body.user, ['email', 'password']);
  if (error) return res.status(422).send(error);
  passport.authenticate('local', {session: false}, function(err, user, info) {
    if (err) return next(err);

    if (user) return res.json({user: user.getBasicInfo()});
    else return res.status(422).json({alerts: [ErrorHandler.createErrorAlert('E-mail or password is incorrect')]});
  })(req, res, next);
}

export function getInfo(req, res, next) {
  res.status(501).send('todo');
}
