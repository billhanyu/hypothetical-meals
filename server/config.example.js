const config = {
  mySqlParams: {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'c1d24cc9',
    database: 'meals',
  },
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',

};

module.exports = config;
