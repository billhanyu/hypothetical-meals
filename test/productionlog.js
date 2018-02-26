const assert = require('chai').assert;
const alasql = require('alasql');
const testTokens = require('./testTokens');

describe('SpendingLog', () => {
  describe('#pages()', () => {
    it('should return number of pages of data', (done) => {
      alasql('INSERT INTO ProductionLogs (formula_id, num_product, total_cost) VALUES (1, 2, 3)');
      chai.request(server)
        .get('/productionlogs/pages')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          assert.strictEqual(res.body['numPages'], 1, 'number of pages');
          done();
        });
    });
  });

  describe('#view()', () => {
    it('should return all production logs for page 1', (done) => {
      alasql('INSERT INTO ProductionLogs (formula_id, num_product, total_cost) VALUES (1, 2, 3)');
      chai.request(server)
        .get('/productionlogs/page/1')
        .set('Authorization', `Token ${testTokens.noobTestToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });
});
