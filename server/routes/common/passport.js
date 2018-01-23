const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');


passport.use(new LocalStrategy({
  usernameField: 'user[username]',
  passwordField: 'user[password]',
}, function(email, password, done) {
  connection.query(`SELECT * FROM Users WHERE username = ${email}`)
  .then(results => {
    if (results.length==0) {
      return res.status(401).send(`Username or password is invalid`);
    }
    let user = new User(results[0]);
    if (!user.vaalidPassword(password)) {
      return res.status(401).send(`Username or password is invalid`);
    }
    return res.status(200).send(user);
  })
  .catch((error) => {
    connection.release();
    console.log(error);
    return res.sendStatus(500);
  });
}));

