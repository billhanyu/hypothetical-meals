import { logAction } from '../server/routes/systemLogs';

const dbSetup = require('./common/dbSetup');
const assert = require('chai').assert;
const testTokens = require('./common/testTokens');

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
      return dbSetup.setupTestDatabase();
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
      const systemLogs = [];
      for (let i = 0; i < 52; i++) {
        systemLogs.push([5, `test${i}`]);
      }
      connection.query(`INSERT INTO SystemLogs (user_id, description) VALUES ?`, [systemLogs])
      .then(() => {
        chai.request(server)
        .get('/systemlogs/page/1')
        .set('Authorization', `Token ${testTokens.managerTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(50);
          done();
        });
      })
      .catch((error) => console.log(error));
    });
  });

  describe('#logAction()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
    });

    it('Should insert user id and description into the database', done => {
      const testString = 'Testing proper insert into database';
      logAction(5, testString)
        .then(() => {
          connection.query('SELECT * FROM SystemLogs')
          .then((systemLogs) => {
            const lastLog = systemLogs[systemLogs.length - 1];
            assert.strictEqual(lastLog.user_id, 5, 'User id of log');
            assert.strictEqual(lastLog.description, testString, 'Description of test string');
            done();
          })
          .catch((error) => console.log(error));
        });
    });
  });

  describe('#viewAll()', () => {
    beforeEach(() => {
      return dbSetup.setupTestDatabase();
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

    it('Should get system logs where ingredient_id is 3', (done) => {
      chai.request(server)
          .get('/systemlogs?ingredient_id=3')
          .set('Authorization', `Token ${testTokens.managerTestToken}`)
          .end((err, res) => {
              res.should.have.status(200);
              const results = res.body;
              assert.strictEqual(results.length, 2, 'Number of logs with boop');
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
