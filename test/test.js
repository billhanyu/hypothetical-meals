const chai = global.chai = require('chai');
const chaiHttp = require('chai-http');
const alasql = require('alasql');
import server from '../server/server';
global.server = server;
chai.should();
chai.use(chaiHttp);

beforeEach(() => {
  alasql('SOURCE "./server/create_database.sql"');
  alasql('SOURCE "./server/sample_data.sql"');
});
