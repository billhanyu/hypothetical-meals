const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');


passport.use(new LocalStrategy({
  usernameField: 'user[username]',
  passwordField: 'user[password]',
}, function(username, password, done) {
  connection.query(`SELECT * FROM Users WHERE username = '${username}' AND oauth = 0`)
  .then(results => {
    if (results.length==0) {
      return done(null, false, `Username or password is invalid`);
    }
    let user = new User(results[0]);
    if (!user.validPassword(password)) {
      return done(null, false, `Username or password is invalid`);
    }
    return done(null, user);
  })
  .catch((error) => {
    connection.release();
    console.log(error);
    return res.sendStatus(500);
  });
}));

