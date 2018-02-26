import { logAction } from '../server/routes/systemLogs';

const alasql = require('alasql');
const assert = require('chai').assert;
const testTokens = require('./testTokens');

describe('SystemLogs', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      chai.request(server)
        .get('/systemlogs/pages')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          assert.strictEqual(res.body['numPages'], 1, 'number of pages');
          done();
        });
    });
  });

  describe('#view()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('should return all system logs', (done) => {
      chai.request(server)
        .get('/systemlogs/page/1')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(6);
          done();
        });
    });

    it('should only return one page of system logs', (done) => {
      for (let i = 0; i < 52; i++) {
        alasql(`INSERT INTO SystemLogs (user_id, description) VALUES (5, 'test${i}')`);
      }
      chai.request(server)
        .get('/systemlogs/page/1')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(50);
          done();
        });
    });
  });

  describe('#logAction()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('Should insert user id and description into the database', done => {
      const testString = 'Testing proper insert into database';
      logAction(5, testString)
        .then(() => {
          const systemLogs = alasql('SELECT * FROM SystemLogs');
          const lastLog = systemLogs[systemLogs.length - 1];
          assert.strictEqual(lastLog.user_id, 5, 'User id of log');
          assert.strictEqual(lastLog.description, testString, 'Description of test string');
          done();
        });
    });
  });

  describe('#viewAll()', () => {
    beforeEach(() => {
      alasql('SOURCE "./server/create_database.sql"');
      alasql('SOURCE "./server/sample_data.sql"');
    });

    it('Should return all system logs', (done) => {
      chai.request(server)
        .get('/systemlogs')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const results = res.body;
          assert.strictEqual(results.length, 6, 'Number of logs');
          done();
        });
    });

    it('Should reject if user is a noob', (done) => {
      chai.request(server)
        .get('/systemlogs')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('Should allow if user is a admin', (done) => {
      chai.request(server)
        .get('/systemlogs')
        .set('Authorization', `Token ${testTokens.adminTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
