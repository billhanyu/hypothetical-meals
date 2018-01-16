const crypto = require('crypto');
const jwt = require('jsonwebtoken');
let config;
try {
  config = require('./config');
} catch (e) {
  config = require('./config.example');
}

class User {
  validPassword(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  }

  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }

  generateJWT() {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
      id: this.id,
      name: this.name,
      email: this.email,
      exp: parseInt(exp.getTime() / 1000),
    }, config.secret);
  }

  getBasicInfo() {
    return {
      name: this.name,
      email: this.email,
      token: this.generateJWT(),
    };
  }
}

module.exports = User;
