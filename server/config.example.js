const config = {
  mySqlParams: {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'c1d24cc9',
    database: 'meals',
  },
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  oauth: {
    client_id: 'client_id',
    client_secret: 'client_secret',
    redirect_uri: 'http://localhost:1717',
    state: '1111',
  },
};

module.exports = config;
