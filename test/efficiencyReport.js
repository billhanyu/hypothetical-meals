import server from '../server/server';

const assert = require('chai').assert;
const testTokens = require('./common/testTokens');
const dbSetup = require('./common/dbSetup');

describe('EfficiencyReport', () => {
  beforeEach(() => {
    return dbSetup.setupTestDatabase();
  });
  describe('#view()', () => {
    it('Should get lines that are occupied within time span', (done) => {
      chai.request(server)
        .get(`/efficiency?from_date=2018-04-11`)
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const lines = res.body;
          assert.strictEqual(lines.occupancies.length, 1, 'Occupancies within time span');
          assert.strictEqual(lines.occupancies[0].productionline_id, 1, 'Line occupied');
          assert.strictEqual(lines.occupancies[0].productrun_id, 1, 'Production run for line');
          assert.strictEqual(lines.occupancies[0].formula_id, 1, 'Formula used in line');
          done();
        });
    });

    it('Should get lines that are occupied within time span with from and to date', (done) => {
      chai.request(server)
        .get(`/efficiency?from_date=2018-01-01&to_date=2018-01-05`)
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          const lines = res.body;
          assert.strictEqual(lines.occupancies.length, 1, 'Occupancies within time span');
          assert.strictEqual(lines.occupancies[0].productionline_id, 2, 'Line occupied');
          assert.strictEqual(lines.occupancies[0].productrun_id, 3, 'Production run for line');
          assert.strictEqual(lines.occupancies[0].formula_id, 4, 'Formula used in line');
          assert.strictEqual(lines.total_time, 345599000, 'About 4 days for occupied time');
          done();
        });
    });
  });
});
