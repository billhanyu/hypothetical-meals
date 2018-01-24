const config = {
  mySqlParams: {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'meals',
  },
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',

};

module.exports = config;
