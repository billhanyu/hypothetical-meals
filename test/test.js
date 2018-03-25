const chai = global.chai = require('chai');
const chaiHttp = require('chai-http');
const dbSetup = require('./common/dbSetup');
import server from '../server/server';
global.server = server;
chai.should();
chai.use(chaiHttp);

beforeEach(() => {
  return dbSetup.setupTestDatabase();
});
